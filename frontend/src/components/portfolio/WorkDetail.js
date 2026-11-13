import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PortfolioNav from './PortfolioNav';
import PortfolioFooter from './PortfolioFooter';
import './WorkDetail.css';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const DEFAULT_MUSIC = `${process.env.PUBLIC_URL}/audio/dengarkan-hatiku.mp3`;

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
};

const splitParagraphs = (text) =>
  String(text || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

const WorkDetail = () => {
  const { contentId } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');
  const [playing, setPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const audioRef = useRef(null);
  const energyRef = useRef(0);
  const playingRef = useRef(false);
  const offsetRef = useRef(0);
  const trackRef = useRef(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetch(`${API}/api/portfolio/content/${encodeURIComponent(contentId)}`)
      .then(async (response) => {
        if (response.status === 404) throw new Error('not-found');
        if (!response.ok) throw new Error('failed');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setItem(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (active) setStatus(error.message === 'not-found' ? 'missing' : 'failed');
      });
    return () => {
      active = false;
    };
  }, [contentId]);

  const images = (item?.images || []).map(resolveUrl).filter(Boolean);
  const isDocumentation = !item?.kind || item.kind === 'documentation' || item.kind === 'media';
  const musicUrl =
    item?.music_url || item?.metadata?.music_url || (isDocumentation ? DEFAULT_MUSIC : '');
  const paragraphs = splitParagraphs(item?.body);
  const summary = item?.description || '';

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Pemutar musik + analisis amplitudo untuk kecepatan showcase.
  useEffect(() => {
    if (!musicUrl || status !== 'ready') return undefined;

    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.7;
    audioRef.current = audio;

    let context = null;
    let analyser = null;
    let data = null;
    let raf = 0;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        context = new AudioContextClass();
        const source = context.createMediaElementSource(audio);
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(context.destination);
        data = new Uint8Array(analyser.frequencyBinCount);

        const sample = () => {
          if (analyser && data) {
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let index = 0; index < data.length; index += 1) sum += data[index];
            const average = sum / data.length / 255;
            energyRef.current = energyRef.current * 0.86 + average * 0.14;
          }
          raf = requestAnimationFrame(sample);
        };
        raf = requestAnimationFrame(sample);
      } catch {
        analyser = null;
      }
    }

    const attempt = () => {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setAudioBlocked(false);
        })
        .catch(() => {
          setPlaying(false);
          setAudioBlocked(true);
        });
      if (context && context.state === 'suspended') context.resume().catch(() => {});
    };

    attempt();

    const onGesture = () => {
      if (context && context.state === 'suspended') context.resume().catch(() => {});
      if (audio.paused) attempt();
    };

    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    window.addEventListener('wheel', onGesture, { passive: true });
    window.addEventListener('touchstart', onGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('wheel', onGesture);
      window.removeEventListener('touchstart', onGesture);
      if (raf) cancelAnimationFrame(raf);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (context) context.close().catch(() => {});
      audioRef.current = null;
    };
  }, [musicUrl, status]);

  // Showcase bergulir otomatis ke kanan; kecepatan mengikuti kekuatan nada.
  useEffect(() => {
    if (!images.length) return undefined;
    let raf = 0;
    let ready = false;
    let last = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const tick = (now) => {
      const delta = Math.min(64, now - last) / 1000;
      last = now;
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          if (!ready) {
            offsetRef.current = -half;
            ready = true;
          }
          const base = 46;
          const boost = playingRef.current ? 0.5 + energyRef.current * 2.2 : 0.14;
          offsetRef.current += base * boost * delta;
          if (offsetRef.current >= 0) offsetRef.current = -half;
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [images.length]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setAudioBlocked(false);
        })
        .catch(() => setAudioBlocked(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="work-detail">
        <PortfolioNav />
        <p className="wd-status">Memuat karya…</p>
      </div>
    );
  }

  if (status !== 'ready' || !item) {
    return (
      <div className="work-detail">
        <PortfolioNav />
        <div className="wd-status">
          <h1>Karya tidak ditemukan</h1>
          <p>Karya yang Anda cari mungkin sudah tidak tersedia.</p>
          <Link className="wd-back-link" to="/portfolio#works">
            ← Kembali ke daftar karya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="work-detail">
      <PortfolioNav />

      <article className="wd-hero">
        <div className="wd-hero-inner">
          <Link className="wd-back-link" to="/portfolio#works">
            ← Semua karya
          </Link>

          <div className="wd-meta">
            <span className="wd-badge">{item.category || 'Dokumentasi'}</span>
            {images.length > 0 && <span className="wd-count">{images.length} foto</span>}
          </div>

          <h1 className="wd-title">{item.title}</h1>

          {summary && <p className="wd-summary">{summary}</p>}

          {musicUrl && (
            <div className="wd-player">
              <button
                type="button"
                className="wd-player-btn"
                onClick={toggleAudio}
                aria-label={playing ? 'Jeda musik pengantar' : 'Putar musik pengantar'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <div className="wd-player-text">
                <span className="wd-player-label">Musik pengantar</span>
                <span className="wd-player-title">
                  {item.music_title || item.metadata?.music_title || 'Dengarkan Hatiku'}
                </span>
              </div>
              <span className={`wd-player-state${playing ? ' is-playing' : ''}`}>
                {playing ? 'Diputar' : 'Jeda'}
              </span>
            </div>
          )}

          {audioBlocked && (
            <p className="wd-audio-hint">
              Browser menahan pemutaran otomatis. Tekan tombol ▶ atau halaman mana pun untuk mulai.
            </p>
          )}
        </div>
      </article>

      {paragraphs.length > 0 && (
        <section className="wd-story">
          <div className="wd-story-inner">
            <h2 className="wd-section-label">Cerita</h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="wd-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {images.length > 0 && (
        <>
          <section className="wd-gallery">
            <div className="wd-gallery-head">
              <h2 className="wd-section-label">Dokumentasi</h2>
              <p className="wd-gallery-note">Seluruh foto yang diunggah pada dokumentasi ini.</p>
            </div>
            <div className="wd-grid">
              {images.map((image, index) => (
                <figure className="wd-grid-item" key={`${image}-${index}`}>
                  <img src={image} alt={`${item.title} — foto ${index + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          </section>

          <section className="wd-marquee" aria-label="Showcase foto otomatis">
            <div className="wd-marquee-head">
              <h2 className="wd-section-label">Showcase</h2>
              <p className="wd-marquee-note">
                Bergulir otomatis mengikuti alunan musik.
              </p>
            </div>
            <div className="wd-marquee-viewport">
              <div className="wd-marquee-track" ref={trackRef}>
                {[...images, ...images].map((image, index) => (
                  <div className="wd-marquee-item" key={`m-${image}-${index}`}>
                    <img src={image} alt="" loading="lazy" draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <PortfolioFooter />
    </div>
  );
};

export default WorkDetail;