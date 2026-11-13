import React, { useEffect, useRef, useState } from 'react';
import './AboutSection.css';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const START_YEAR = 2025;

const INITIAL_STATS = [
  { value: '0', label: 'Foto terpublikasi' },
  { value: '1', label: 'Tahun berkarya' },
  { value: '0', label: 'Karya tulis' },
  { value: '0', label: 'Jumlah karya' }
];

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [stats, setStats] = useState(INITIAL_STATS);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/portfolio/settings`).then((response) => response.json()).then((settings) => setAboutText(settings.about_text || '')).catch(() => {});
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Hitung statistik dari data yang benar-benar terpublikasi.
  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const [contentResponse, articlesResponse] = await Promise.all([
          fetch(`${API}/api/portfolio/content?published_only=true`),
          fetch(`${API}/api/articles?published_only=true`)
        ]);
        const content = contentResponse.ok ? await contentResponse.json() : [];
        const articles = articlesResponse.ok ? await articlesResponse.json() : [];
        if (!active || !Array.isArray(content)) return;

        const photoCount = content.reduce(
          (total, item) => total + ((item.images && item.images.length) || 0),
          0
        );
        const novelCount = content.filter((item) => item.kind === 'novel').length;
        const essayCount =
          content.filter((item) => item.kind === 'creative').length +
          (Array.isArray(articles) ? articles.length : 0);
        const yearCount = Math.max(1, new Date().getFullYear() - START_YEAR + 1);

        setStats([
          { value: String(photoCount), label: 'Foto terpublikasi' },
          { value: String(yearCount), label: 'Tahun berkarya' },
          { value: String(novelCount + essayCount), label: 'Karya tulis' },
          { value: String(content.length + (Array.isArray(articles) ? articles.length : 0)), label: 'Jumlah karya' }
        ]);
      } catch (error) {
        // biarkan angka awal bila API tidak terjangkau
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className={`about-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="about-container">
        <div className="about-header">
          <span className="section-badge">Tentang saya</span>
          <h2 className="about-title">
            Kisah dalam setiap frame.
            <br />
            Makna dalam setiap kata.
          </h2>
          <p className="about-description">
            {aboutText || "Saya adalah fotografer dan penulis yang percaya bahwa setiap momen menyimpan cerita, dan setiap cerita layak diabadikan dengan keindahan."}
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="about-quote">
          <span className="quote-badge">Filosofi berkarya</span>
          <blockquote>
            "Fotografi menangkap apa yang mata lihat. Tulisan menangkap apa yang jiwa rasakan."
          </blockquote>
          <p className="quote-footer">Keduanya adalah cara saya memahami dan berbagi dunia.</p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
