import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreLanding.css';

const PreLanding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = sessionStorage.getItem('hasVisitedLanding');
    if (hasVisited) {
      navigate('/portfolio');
      return;
    }

    setTimeout(() => setIsLoaded(true), 100);

    // Parallax mouse effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [navigate]);

  const handleEnter = () => {
    sessionStorage.setItem('hasVisitedLanding', 'true');
    navigate('/portfolio');
  };

  const handleViewWorks = () => {
    sessionStorage.setItem('hasVisitedLanding', 'true');
    navigate('/portfolio#works');
  };

  return (
    <div className={`pre-landing ${isLoaded ? 'loaded' : ''}`}>
      {/* Background Image with Parallax */}
      <div 
        className="landing-background"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`
        }}
      >
        <div className="background-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&h=1080&fit=crop&q=90" 
          alt="Narrative Photographer"
          className="landing-image"
        />
      </div>

      {/* Content */}
      <div className="landing-content">
        <div className="content-wrapper">
          {/* Logo/Name */}
          <div className="landing-logo">
            <span className="logo-text">hanif®</span>
          </div>

          {/* Main Title */}
          <h1 className="landing-title">
            Aku Bisa Membidik Apa Saja,
            <br />
            <span className="title-highlight">Kecuali Kedatanganmu</span>
          </h1>

          {/* Description */}
          <p className="landing-description">
            Seorang narrative photographer dan penulis yang mengabadikan momen, 
            mengurai cerita, dan menemukan keindahan dalam setiap detil kehidupan.
          </p>

          {/* Quote */}
          <blockquote className="landing-quote">
            “Di ketinggian Rinjani, tanganku tetap tenang menanti fajar. Namun saat kamu berdiri di seberang jalan, fokusku perlahan luruh. Jantungku berdetak lebih cepat dari bunyi rana. Ternyata, yang paling sulit kubidik bukanlah cahaya atau sudut, melainkan perasaanku sendiri.”
          </blockquote>

          {/* CTA Buttons */}
          <div className="landing-buttons">
            <button 
              className="btn-primary" 
              onClick={handleEnter}
            >
              <span className="btn-text">Explore the Story</span>
              <span className="btn-icon">→</span>
            </button>
            
            <button 
              className="btn-secondary" 
              onClick={handleViewWorks}
            >
              <span className="btn-text">Lihat Portfolio</span>
            </button>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span className="scroll-text">Pulang, Lalu Berlabuh</span>
      </div>
    </div>
  );
};

export default PreLanding;