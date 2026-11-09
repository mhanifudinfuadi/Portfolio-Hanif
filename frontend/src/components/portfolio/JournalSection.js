import React, { useEffect, useRef, useState } from 'react';
import './JournalSection.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const JournalSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/?published_only=true`)
      .then((response) => { if (!response.ok) throw new Error('Failed to load'); return response.json(); })
      .then(setArticles)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const imageUrl = (url) => url?.startsWith('http') ? url : `${API_URL}${url || ''}`;

  return (
    <section ref={sectionRef} id="journal" className={`journal-section ${isVisible ? 'visible' : ''}`}>
      <div className="journal-container">
        <div className="journal-header">
          <span className="section-badge">Catatan desain</span>
          <h2 className="journal-title">Ide & perspektif</h2>
          <p className="journal-description">Hal-hal yang membentuk cara saya melihat dan merancang.</p>
        </div>
        {loadError && <p className="journal-empty">Artikel belum dapat dimuat saat ini.</p>}
        {!loadError && articles.length === 0 && <p className="journal-empty">Dokumentasi dan cerita baru akan hadir di sini.</p>}
        <div className="articles-grid">
          {articles.map((article, index) => (
            <article key={article.article_id} className="article-card" style={{ animationDelay: `${index * 0.1}s` }}>
              {article.image_url && <div className="article-image-wrapper"><img src={imageUrl(article.image_url)} alt={article.title} className="article-image" /></div>}
              <div className="article-content">
                <span className="article-label">{article.category || 'Catatan'}</span>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-description">{article.excerpt}</p>
                {article.body && <button className="article-link" onClick={() => setActiveArticle(article)}>Baca selengkapnya →</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
      {activeArticle && <div className="article-modal-backdrop" role="presentation" onClick={() => setActiveArticle(null)}>
        <article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-modal-title" onClick={(event) => event.stopPropagation()}>
          <button className="article-modal-close" onClick={() => setActiveArticle(null)} aria-label="Tutup artikel">×</button>
          <span className="article-label">{activeArticle.category || 'Catatan'}</span>
          <h2 id="article-modal-title">{activeArticle.title}</h2>
          {activeArticle.image_url && <img src={imageUrl(activeArticle.image_url)} alt="" />}
          <p className="article-modal-body">{activeArticle.body}</p>
        </article>
      </div>}
    </section>
  );
};

export default JournalSection;
