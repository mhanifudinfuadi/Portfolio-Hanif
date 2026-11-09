import React, { useEffect, useRef, useState } from 'react';
import './AboutSection.css';

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/settings`).then((response) => response.json()).then((settings) => setAboutText(settings.about_text || '')).catch(() => {});
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

  const stats = [
    { value: '200+', label: 'Foto terpublikasi' },
    { value: '08', label: 'Tahun berkarya' },
    { value: '12', label: 'Karya tulis' },
    { value: '∞', label: 'Cerita untuk ditulis' }
  ];

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
