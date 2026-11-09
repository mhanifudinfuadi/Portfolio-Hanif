import React, { useState, useEffect } from 'react';
import './SideNav.css';

const sectionOrder = ['about', 'works', 'journal', 'contact'];
const navItems = [
  { id: 'works', label: 'Karya' },
  { id: 'journal', label: 'Catatan' },
  { id: 'about', label: 'Tentang' },
  { id: 'contact', label: 'Kontak' }
];

const SideNav = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      const marker = window.scrollY + window.innerHeight * 0.36;
      const current = sectionOrder.reduce((activeId, id) => {
        const section = document.getElementById(id);
        return section && section.offsetTop <= marker ? id : activeId;
      }, 'about');
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`side-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="side-nav-content">
        {navItems.map((item, index) => (
          <div key={item.id} className="nav-item-wrapper">
            <button
              className={`side-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="nav-line"></span>
              <span className="nav-label">{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default SideNav;
