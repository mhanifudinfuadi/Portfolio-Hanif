import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorksGrid.css';

const WorksGrid = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [managedProjects, setManagedProjects] = useState([]);
  const sectionRef = useRef(null);

  // Sample fallback projects if API fails
  const projects = [
    {
      title: 'Urban Chronicles',
      category: 'Fotografi',
      description: 'Dokumentasi visual kehidupan perkotaan melalui lensa hitam-putih yang menangkap esensi keseharian.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop']
    },
    {
      title: 'Jejak Nusantara',
      category: 'Fotografi',
      description: 'Perjalanan fotografi melintasi kepulauan, mengabadikan kekayaan budaya dan keindahan alam Indonesia.',
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop']
    },
    {
      title: 'Bayangan Senja',
      category: 'Novel',
      description: 'Kisah tentang pencarian jati diri di tengah hiruk pikuk modernitas, ditulis dengan prosa puitis.',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop']
    },
    {
      title: 'Potret Sunyi',
      category: 'Fotografi',
      description: 'Studi komposisi minimal yang membangun narasi visual melalui keheningan dan ruang negatif.',
      image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=600&fit=crop']
    },
    {
      title: 'Manuscript Langit',
      category: 'Esai',
      description: 'Kumpulan esai filosofis tentang alam, waktu, dan keberadaan manusia dalam semesta.',
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=600&fit=crop']
    },
    {
      title: 'Light & Shadow',
      category: 'Fotografi',
      description: 'Eksplorasi cahaya dan bayangan dalam fotografi arsitektur kontemporer.',
      image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=600&fit=crop']
    }
  ];

  // Load data from API with error handling
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch data with proper error handling
  useEffect(() => {
    let isMounted = true;

    fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/portfolio/content?published_only=true`)
      .then(response => {
        if (response.ok) return response.json();
        console.warn('API not responding, showing fallback projects');
        return null;
      })
      .catch(error => {
        console.warn('Failed to fetch data from API', error);
        return null;
      })
      .then((items) => {
        if (isMounted && Array.isArray(items) && items.length) {
          setManagedProjects(items.map((item) => ({
            content_id: item.content_id,
            title: item.title,
            category: item.kind === 'documentation' || item.kind === 'media' ? 'Fotografi' : item.kind === 'novel' ? 'Novel' : item.category,
            description: item.description,
            image: item.images?.[0]
              ? (item.images[0].startsWith('http') ? item.images[0] : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}${item.images[0]}`)
              : null,
            images: (item.images || []).map((image) => {
              if (image.startsWith('http')) return image;
              const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
              return `${base}${image}`;
            }),
            body: item.body,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Use fallback if no data loaded
  const displayedProjects = managedProjects.length ? managedProjects : projects;

  // Ensure filters are always set
  const filters = ['Semua', 'Fotografi', 'Novel', 'Esai'];

  // Filter with safe checks
  const filteredProjects = activeFilter === 'Semua'
    ? displayedProjects
    : displayedProjects.filter((project) => project.category === activeFilter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [activeFilter]);

  return (
    <section
      ref={sectionRef}
      id="works"
      className={`works-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="works-container">
        <div className="works-header">
          <span className="section-badge">Selected works</span>
          <h2 className="works-title">Karya terbaru</h2>
          <p className="works-description">
            Eksplorasi identitas visual dan pengalaman digital.
          </p>
        </div>

        <div className="filter-bar">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
          <span className="work-count">{filteredProjects.length} karya</span>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              className="project-card"
              onClick={() => project.content_id && navigate(`/karya/${project.content_id}`)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="project-image-wrapper">
                <img
                  src={
                    project.image ||
                    'https://images.unsplash.com/photo-1497235133610-6f118ddcb88a?w=800&h=600&fit=crop'
                  }
                  alt={project.title}
                  className="project-image"
                />
                <div className="project-overlay">
                  <span className="view-project">Lihat Detail →</span>
                </div>
              </div>
              <div className="project-info">
                <div className="project-category">{project.category}</div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="works-cta">
          <a href="#contact" className="cta-button">
            Diskusikan proyek Anda
            <span className="cta-arrow">→</span>
          </a>
        </div>
      </div>

    </section>
  );
};

export default WorksGrid;
