import React, { useState, useEffect } from 'react';
import './PortfolioNav.css';

const PortfolioNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const marker = window.scrollY + window.innerHeight * 0.36;
      const orderedSections = ['about', 'works', 'journal', 'contact'];
      const current = orderedSections.reduce((activeId, id) => {
        const section = document.getElementById(id);
        return section && section.offsetTop <= marker ? id : activeId;
      }, 'about');
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { text: 'Karya', href: '#works' },
    { text: 'Catatan', href: '#journal' },
    { text: 'Tentang', href: '#about' },
    { text: 'Kontak', href: '#contact' }
  ];

  return (
    <nav className={`portfolio-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#" className="nav-brand">hanif®</a>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href} 
              className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.text}
            </a>
          ))}
        </div>
        
        <button 
          className={`nav-mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default PortfolioNav;
