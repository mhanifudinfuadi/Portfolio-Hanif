import React, { useEffect, useRef, useState } from 'react';
import './NovelShowcase.css';

const NovelShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const [activeNovel, setActiveNovel] = useState(0);

  useEffect(() => {
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

  const featuredNovel = {
    title: 'Bayangan Senja',
    subtitle: 'Novel Perdana',
    tagline: 'Kisah tentang pencarian jati diri di tengah hiruk pikuk modernitas',
    description: 'Novel perdana yang mengisahkan perjalanan seorang pemuda dalam mencari makna hidup di kota besar. Ditulis dengan prosa puitis yang mengalir, mengajak pembaca merenungkan esensi keberadaan dan keindahan dalam kesederhanaan.',
    details: {
      pages: '384 halaman',
      year: '2026',
      genre: 'Fiksi Kontemporer'
    },
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop&q=90',
    backgroundImage: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1920&h=1080&fit=crop&q=80'
  };

  const otherNovels = [
    {
      title: 'Manuscript Langit',
      category: 'Esai',
      price: 'Rp 125.000',
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&h=900&fit=crop'
    },
    {
      title: 'Jejak Kata',
      category: 'Puisi',
      price: 'Rp 98.000',
      image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=900&fit=crop'
    },
    {
      title: 'Ruang Sunyi',
      category: 'Novel',
      price: 'Rp 135.000',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=900&fit=crop'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`novel-showcase ${isVisible ? 'visible' : ''}`}
    >
      {/* Featured Novel - Hero Style */}
      <div className="featured-novel">
        <div className="featured-background">
          <img 
            src={featuredNovel.backgroundImage} 
            alt="Background" 
            className="featured-bg-image"
          />
          <div className="featured-overlay"></div>
        </div>

        <div className="featured-content-wrapper">
          <div className="featured-grid">
            {/* Left: Cover Image */}
            <div className="featured-cover-section">
              <div className="cover-frame">
                <img 
                  src={featuredNovel.coverImage} 
                  alt={featuredNovel.title}
                  className="cover-image"
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="featured-info-section">
              <span className="featured-badge">{featuredNovel.subtitle}</span>
              <h2 className="featured-title">{featuredNovel.title}</h2>
              <p className="featured-tagline">{featuredNovel.tagline}</p>
              <p className="featured-description">{featuredNovel.description}</p>
              
              <div className="featured-details">
                <div className="detail-item">
                  <span className="detail-label">Halaman</span>
                  <span className="detail-value">{featuredNovel.details.pages}</span>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-item">
                  <span className="detail-label">Tahun</span>
                  <span className="detail-value">{featuredNovel.details.year}</span>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-item">
                  <span className="detail-label">Genre</span>
                  <span className="detail-value">{featuredNovel.details.genre}</span>
                </div>
              </div>

              <div className="featured-actions">
                <button className="btn-primary-novel">Beli Sekarang</button>
                <button className="btn-secondary-novel">Baca Preview</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Novels Grid */}
      <div className="other-novels-section">
        <div className="section-header-novel">
          <span className="section-badge">Karya Lainnya</span>
          <h3 className="section-title-novel">Koleksi Novel & Esai</h3>
        </div>

        <div className="novels-grid">
          {otherNovels.map((novel, index) => (
            <div 
              key={index}
              className="novel-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="novel-card-image-wrapper">
                <img 
                  src={novel.image} 
                  alt={novel.title}
                  className="novel-card-image"
                />
                <div className="novel-card-overlay">
                  <button className="quick-view-btn">Lihat Detail</button>
                </div>
              </div>
              <div className="novel-card-info">
                <span className="novel-category">{novel.category}</span>
                <h4 className="novel-card-title">{novel.title}</h4>
                <p className="novel-price">{novel.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NovelShowcase;