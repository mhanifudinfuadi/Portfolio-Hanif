import React, { useState, useEffect } from 'react';
import './PortfolioNav.css';

const PortfolioNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  // Define navigation links explicitly
  const navLinks = [
    { text: 'Karya', href: '#works' },
    { text: 'Catatan', href: '#journal' },
    { text: 'Tentang', href: '#about' },
    { text: 'Kontak', href: '#contact' }
  ];

  // Scroll tracking effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Find current active section
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

  return (
    <nav className={`portfolio-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <a href="#" className="nav-brand">hanif®</a>

        {/* Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.text}
            </a>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`nav-mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
