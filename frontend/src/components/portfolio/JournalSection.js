import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './JournalSection.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const JournalSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [failed, setFailed] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/articles/?published_only=true`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load');
        return response.json();
      })
      .then((items) => setArticles(Array.isArray(items) ? items : []))
      .catch(() => setFailed(true));
  }, []);

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

  const resolveImage = (source) =>
    source && source.startsWith('http') ? source : `${BACKEND_URL}${source || ''}`;

  return (
    <section
      ref={sectionRef}
      id="journal"
      className={`journal-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="journal-container">
        <div className="journal-header">
          <span className="section-badge">Catatan desain</span>
          <h2 className="journal-title">Ide &amp; perspektif</h2>
          <p className="journal-description">
            Hal-hal yang membentuk cara saya melihat dan merancang.
          </p>
        </div>

        {failed && <p className="journal-empty">Artikel belum dapat dimuat saat ini.</p>}
        {!failed && articles.length === 0 && (
          <p className="journal-empty">Dokumentasi dan cerita baru akan hadir di sini.</p>
        )}

        <div className="articles-grid">
          {articles.map((article, index) => (
            <article
              className="article-card"
              key={article.article_id || index}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              {article.image_url && (
                <div className="article-image-wrapper">
                  <img
                    src={resolveImage(article.image_url)}
                    alt={article.title}
                    className="article-image"
                  />
                </div>
              )}

              <div className="article-content">
                <span className="article-label">{article.category || 'Catatan'}</span>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-description">{article.excerpt}</p>
                {article.body && (
                  <button className="article-link" onClick={() => setSelectedArticle(article)}>
                    Baca selengkapnya →
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedArticle && createPortal(
        <div
          className="article-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedArticle(null)}
        >
          <article
            className="article-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="article-modal-close"
              onClick={() => setSelectedArticle(null)}
              aria-label="Tutup artikel"
            >
              ×
            </button>
            <span className="article-label">{selectedArticle.category || 'Catatan'}</span>
            <h2 id="article-modal-title">{selectedArticle.title}</h2>
            {selectedArticle.image_url && (
              <img src={resolveImage(selectedArticle.image_url)} alt="" />
            )}
            <p className="article-modal-body">{selectedArticle.body}</p>
          </article>
        </div>,
        document.body
      )}
    </section>
  );
};

export default JournalSection;