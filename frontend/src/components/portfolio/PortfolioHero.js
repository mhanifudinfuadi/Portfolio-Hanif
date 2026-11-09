import React, { useEffect, useState } from 'react';
import './PortfolioHero.css';

// Foto profil hero — simpan gambarnya di frontend/public/images/hero-profile.jpg
const heroProfile = `${process.env.PUBLIC_URL}/images/hero-profile.jpg`;

const PortfolioHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/settings`).then((response) => response.json()).then(setSettings).catch(() => {});
  }, []);

  return (
    <section className={`portfolio-hero ${isVisible ? 'visible' : ''}`}>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">Fotografi & Karya Tulis · Indonesia</div>
          <h1 className="hero-title">
            {settings?.hero_title || <>Aku Bisa Membidik Apa Saja,<br />Kecuali Kedatanganmu.</>}
          </h1>
          <p className="hero-description">
            {settings?.hero_subtitle || 'Seorang narrative photographer dan penulis yang mengabadikan momen, mengurai cerita, dan menemukan keindahan dalam setiap detil kehidupan.'}
          </p>
          <blockquote className="hero-quote">
            “Di ketinggian Rinjani, tanganku tetap tenang menanti fajar. Namun saat kamu berdiri di seberang jalan, fokusku perlahan luruh. Jantungku berdetak lebih cepat dari bunyi rana. Ternyata, yang paling sulit kubidik bukanlah cahaya atau sudut, melainkan perasaanku sendiri.”
          </blockquote>
          <a href="#contact" className="hero-cta">
            Jelajahi karya
            <span className="cta-arrow">→</span>
          </a>
        </div>
        
        <div className="hero-image-wrapper">
          <div className="hero-image-frame">
            <img 
              src={heroProfile}
              alt="Foto profil Hanif"
              className="hero-image"
            />
          </div>
        </div>
      </div>
      
      <div className="hero-scroll-indicator">
        <span>Pulang, untuk Berlabuh</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
};

export default PortfolioHero;
