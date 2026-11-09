import React from 'react';
import './PortfolioFooter.css';

const PortfolioFooter = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="portfolio-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand-section">
            <h3 className="footer-logo">hanif®</h3>
            <p className="footer-tagline">
              Creative thinking.
              <br />
              Thoughtful experiences.
            </p>
          </div>

          <div className="footer-actions">
            <button onClick={scrollToTop} className="back-to-top">
              Kembali ke atas ↑
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} Hanif. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PortfolioFooter;