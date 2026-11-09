import React, { useState, useEffect, useRef } from 'react';
import './WorksGrid.css';

const WorksGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [selectedProject, setSelectedProject] = useState(null);
  const [managedProjects, setManagedProjects] = useState([]);
  const sectionRef = useRef(null);

  const projects = [
    {
      title: 'Urban Chronicles',
      category: 'Fotografi',
      description: 'Dokumentasi visual kehidupan perkotaan melalui lensa hitam-putih yang menangkap esensi keseharian.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop'
    },
    {
      title: 'Jejak Nusantara',
      category: 'Fotografi',
      description: 'Perjalanan fotografi melintasi kepulauan, mengabadikan kekayaan budaya dan keindahan alam Indonesia.',
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop'
    },
    {
      title: 'Bayangan Senja',
      category: 'Novel',
      description: 'Kisah tentang pencarian jati diri di tengah hiruk pikuk modernitas, ditulis dengan prosa puitis.',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop'
    },
    {
      title: 'Potret Sunyi',
      category: 'Fotografi',
      description: 'Studi komposisi minimal yang membangun narasi visual melalui keheningan dan ruang negatif.',
      image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=600&fit=crop'
    },
    {
      title: 'Manuscript Langit',
      category: 'Esai',
      description: 'Kumpulan esai filosofis tentang alam, waktu, dan keberadaan manusia dalam semesta.',
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=600&fit=crop'
    },
    {
      title: 'Light & Shadow',
      category: 'Fotografi',
      description: 'Eksplorasi cahaya dan bayangan dalam fotografi arsitektur kontemporer.',
      image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=600&fit=crop'
    }
  ];

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/content?published_only=true`)
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setManagedProjects(items.map((item) => ({
        title: item.title,
        category: item.kind === 'documentation' || item.kind === 'media' ? 'Fotografi' : item.kind === 'novel' ? 'Novel' : item.category,
        description: item.description,
        image: item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `${process.env.REACT_APP_BACKEND_URL}${item.images[0]}`) : '',
        images: (item.images || []).map((image) => image.startsWith('http') ? image : `${process.env.REACT_APP_BACKEND_URL}${image}`),
        body: item.body,
      }))))
      .catch(() => {});
  }, []);

  const displayedProjects = managedProjects.length ? managedProjects : projects;

  const filters = ['Semua', 'Fotografi', 'Novel', 'Esai'];

  const filteredProjects = activeFilter === 'Semua'
    ? displayedProjects
    : displayedProjects.filter((project) => project.category === activeFilter || (activeFilter === 'Fotografi' && project.category === 'Dokumentasi') || (activeFilter === 'Novel' && project.category === 'Novel Resmi'));

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
              onClick={() => setSelectedProject(project)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="project-image-wrapper">
                <img src={project.image} alt={project.title} className="project-image" />
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

      {selectedProject && (
        <div className="project-dialog" onClick={() => setSelectedProject(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-close" onClick={() => setSelectedProject(null)}>
              ×
            </button>
            {selectedProject.images?.length > 1 ? <div className="dialog-gallery">{selectedProject.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${selectedProject.title} ${index + 1}`} className="dialog-image" />)}</div> : selectedProject.image && <img src={selectedProject.image} alt={selectedProject.title} className="dialog-image" />}
            <div className="dialog-info">
              <span className="dialog-category">{selectedProject.category}</span>
              <h3 className="dialog-title">{selectedProject.title}</h3>
              <p className="dialog-description">{selectedProject.description}</p>
              {selectedProject.body && <p className="dialog-description">{selectedProject.body}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WorksGrid;
