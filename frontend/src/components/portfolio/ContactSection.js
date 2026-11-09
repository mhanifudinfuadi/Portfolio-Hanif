import React, { useEffect, useRef, useState } from 'react';
import './ContactSection.css';

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [notice, setNotice] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/settings`).then((response) => response.json()).then((settings) => setContactEmail(settings.contact_email || '')).catch(() => {});
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const submitInquiry = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/inquiries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error();
      setForm({ name: '', email: '', message: '' });
      setNotice('Pesan terkirim. Terima kasih sudah menghubungi saya.');
    } catch { setNotice('Pesan belum dapat dikirim. Silakan coba lagi nanti.'); }
  };

  return (
    <section 
      ref={sectionRef} 
      id="contact"
      className={`contact-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="contact-container">
        <div className="contact-content">
          <span className="section-badge">Terbuka untuk kolaborasi</span>
          <h2 className="contact-title">Ceritakan apa yang ingin Anda bangun.</h2>
          <p className="contact-description">
            Mari mulai dengan percakapan sederhana tentang ide dan tujuan Anda.
          </p>
          <form className="portfolio-contact-form" onSubmit={submitInquiry}>
            <input aria-label="Nama" placeholder="Nama" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input aria-label="Email" type="email" placeholder="Email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <textarea aria-label="Pesan" placeholder="Ceritakan kebutuhan Anda" rows="4" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
            <button type="submit" className="contact-button">Kirim pesan <span className="button-arrow">→</span></button>
            {notice && <p role="status">{notice}</p>}
          </form>
          {contactEmail && <a className="portfolio-contact-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>}
          
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
