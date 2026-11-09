import React, { useEffect, useRef, useState } from 'react';
import './ServicesSection.css';

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const services = [
    {
      title: 'Fotografi Dokumentasi',
      description: 'Dokumentasi visual untuk acara, produk, dan momen penting dengan storytelling yang kuat.',
      tags: ['Event', 'Product', 'Editorial']
    },
    {
      title: 'Fotografi Potret',
      description: 'Sesi potret personal dan profesional yang menangkap karakter dan kepribadian subjek.',
      tags: ['Portrait', 'Headshot', 'Creative']
    },
    {
      title: 'Penulisan Kreatif',
      description: 'Karya tulis fiksi dan non-fiksi: novel, cerpen, esai, dan narasi kreatif lainnya.',
      tags: ['Novel', 'Essay', 'Short Story']
    },
    {
      title: 'Content Writing',
      description: 'Penulisan konten untuk brand, artikel, copywriting dengan gaya naratif yang engaging.',
      tags: ['Copywriting', 'Article', 'Brand Story']
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`services-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="services-container">
        <div className="services-header">
          <span className="section-badge">Layanan</span>
          <h2 className="services-title">Cerita visual dan tertulis untuk Anda.</h2>
          <a href="#contact" className="services-cta">Mari berkolaborasi →</a>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="service-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-tags">
                {service.tags.map((tag, i) => (
                  <span key={i} className="service-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;