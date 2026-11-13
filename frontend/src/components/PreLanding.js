import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreLanding.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1542038888553-782477a416a4?w=1920&h=1080&fit=crop&q=90';

const PreLanding = () => {
  const [loaded, setLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('hasVisitedLanding')) {
      navigate('/portfolio');
      return undefined;
    }

    const timer = setTimeout(() => setLoaded(true), 100);
    const handleMouseMove = (event) => {
      setOffset({
        x: 20 * (event.clientX / window.innerWidth - 0.5),
        y: 20 * (event.clientY / window.innerHeight - 0.5),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [navigate]);

  const enterPortfolio = (hash) => {
    sessionStorage.setItem('hasVisitedLanding', 'true');
    navigate(hash ? `/portfolio${hash}` : '/portfolio');
  };

  return (
    <div className={`pre-landing ${loaded ? 'loaded' : ''}`}>
      <div
        className="landing-background"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(1.1)` }}
      >
        <div className="background-overlay" />
        <img src={HERO_IMAGE} alt="Fotografer dengan kamera Sony Alpha" className="landing-image" />
      </div>

      <div className="landing-content">
        <div className="content-wrapper">
          <div className="landing-logo">
            <span className="logo-text">hanif®</span>
          </div>

          <h1 className="landing-title">
            Aku Bisa Membidik Apa Saja,
            <br />
            <span className="title-highlight">Kecuali Kedatanganmu</span>
          </h1>

          <p className="landing-description">
            Seorang narrative photographer dan penulis yang mengabadikan momen, mengurai cerita, dan
            menemukan keindahan dalam setiap detil kehidupan.
          </p>

          <blockquote className="landing-quote">
            “Di ketinggian Rinjani, tanganku tetap tenang menanti fajar. Namun saat kamu berdiri di
            seberang jalan, fokusku perlahan luruh. Jantungku berdetak lebih cepat dari bunyi rana.
            Ternyata, yang paling sulit kubidik bukanlah cahaya atau sudut, melainkan perasaanku
            sendiri.”
          </blockquote>

          <div className="landing-buttons">
            <button className="btn-primary" onClick={() => enterPortfolio()}>
              <span className="btn-text">Explore the Story</span>
              <span className="btn-icon">→</span>
            </button>
            <button className="btn-secondary" onClick={() => enterPortfolio('#works')}>
              <span className="btn-text">Lihat Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span className="scroll-text">Pulang, Lalu Berlabuh</span>
      </div>
    </div>
  );
};

export default PreLanding;