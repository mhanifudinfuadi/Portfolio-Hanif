import React, { useState, useEffect, useRef } from 'react';
import './DocumentationsSection.css';

const DocumentationsSection = () => {
  const [selectedDocumentation, setSelectedDocumentation] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const documentationRef = useRef(null);
  const [documentations, setDocumentations] = useState([]);

  // Fetch documentations from API (similar to WorksGrid)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (documentationRef.current) observer.observe(documentationRef.current);

    return () => observer.disconnect();
  }, []);

  // Load data from backend (same pattern as WorksGrid)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/content?kind=documentation&published_only=true`)
      .then(response => response.ok ? response.json() : [])
      .then(items => {
        if (!Array.isArray(items)) return;
        setDocumentations(items.map(item => ({
          title: item.title,
          category: 'Dokumentasi Fotografi',
          description: item.description || '',
          body: item.body || '',
          images: item.images?.map(img => (img.startsWith('http') ? img : `${process.env.REACT_APP_BACKEND_URL}${img}`)) || [],
          date: new Date(item.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
        })));
      })
      .catch(() => {});
  }, []);

  const documentarySubcategories = ['Field Notes', 'Street Visions', 'Portraiture', 'Landscape Studies'];

  return (
    <section ref={documentationRef} id="documents" className="documentations-section">
      <div className="documents-container">
        {/* Header Section */}
        <header className="docs-header visible">
          <span className="section-badge">Documentary Works</span>
          <h2 className="docs-title">Catatan Visual & Dokumentasi</h2>
          <p className="docs-subtitle">
            Arsip visual yang menangkap momen, tempat, dan manusia dalam konteks historis.
            <br />
            Field notes. Street portraits. Environmental studies.
          </p>
        </header>

        {/* Filter & Navigation */}
        <div className="documents-filter-bar visible">
          <div className="filter-group">
            {documentarySubcategories.map(subcat => (
              <button
                key={subcat}
                className={`filter-btn ${documentarySubcategories.indexOf(subcat) === 0 ? 'active' : ''}`}
                onClick={() => setSelectedDocumentation({ subcategory: subcat })}
              >
                {subcat}
              </button>
            ))}
          </div>

          <span className="work-count">{documentations.length} karya dokumentasi</span>
        </div>

        {/* Grid Layout */}
        <div className={`projects-grid ${isVisible ? 'fade-in' : ''}`}>
          {documentations.length > 0 ? (
            documentations.map((project, index) => (
              <div
                key={index}
                className="documentation-card"
                onClick={() => setSelectedDocumentation(project)}
              >
                {/* Featured Novel Display */}
                {project.images?.length > 0 && (
                  <div className="doc-image-wrapper">
                    {project.images.length > 1 ? (
                      <div className="gallery-grid">
                        {project.images.map((image, idx) => (
                          <img key={idx} src={image} alt={`${project.title} ${idx + 1}`} className="doc-small-img" />
                        ))}
                      </div>
                    ) : (
                      <img src={project.images[0]} alt={project.title} className="doc-main-img" />
                    )}
                  </div>
                )}

                <div className="doc-info">
                  <span className="doc-subcategory">{project.subcategory}</span>
                  <h3 className="doc-title">{project.title}</h3>
                  <time className="doc-date">{project.date}</time>
                </div>
              </div>
            ))
          ) : (
            // Fallback if no documentations
            <>
              <div className="documentation-card">
                <div className="doc-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1486325232279-1b0d052cbb88?w=600&h=800&fit=crop"
                    alt="Field notes documentation"
                    className="doc-main-img"
                  />
                </div>
                <div className="doc-info">
                  <span className="doc-subcategory">Field Notes</span>
                  <h3 className="doc-title">Terra Firma Archive</h3>
                  <time className="doc-date">2024</time>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="documents-cta visible">
          <a href="#contact" className="cta-button">
            Eksplorasi Karya Lengkap
            <span className="cta-arrow">→</span>
          </a>
        </div>
      </div>

      {/* Modal/Overlay for Documentation Detail */}
      {selectedDocumentation && (
        <div className="documentations-overlay" onClick={() => setSelectedDocumentation(null)}>
          <div className="dialog-content">
            <button
              className="dialog-close"
              onClick={() => setSelectedDocumentation(null)}
            >
              ×
            </button>

            {/* Full Documentation Display */}
            {selectedDocumentation.images?.length > 0 && (
              <div className="doc-full-view">
                {selectedDocumentation.images.length > 1 ? (
                  <>
                    {selectedDocumentation.images.map((image, idx) => (
                      <img key={idx} src={image} alt={selectedDocumentation.title} className="full-doc-image" />
                    ))}
                  </>
                ) : (
                  <img src={selectedDocumentation.images[0]} alt={selectedDocumentation.title} className="full-doc-image" />
                )}
              </div>
            )}

            <div className="doc-full-info">
              <span className="doc-category">Dokumentasi Fotografi</span>
              <h2 className="dialog-title">{selectedDocumentation.title}</h2>

              {/* Field Notes / Context */}
              {selectedDocumentation.body && (
                <>
                  <div className="doc-context-section">
                    <span className="context-label">Field Notes:</span>
                    <p className="context-text">{selectedDocumentation.body}</p>
                  </div>

                  {/* Project Information */}
                  <div className="doc-metadata">
                    <span className="metadata-item">
                      Tempat: {selectedDocumentation.metadata?.place || 'Various Locations'}
                    </span>
                    <span className="metadata-item">
                      Waktu: {selectedDocumentation.metadata?.timeframe || '2024-2025'}
                    </span>
                    <span className="metadata-item">
                      Jilid: {selectedDocumentation.images.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentationsSection;
