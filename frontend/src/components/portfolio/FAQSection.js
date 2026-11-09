import React, { useState, useEffect, useRef } from 'react';
import './FAQSection.css';

const FAQSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);

  const faqs = [
    {
      question: 'Apakah menerima proyek kecil?',
      answer: 'Ya. Kita dapat menyesuaikan lingkup proyek dengan kebutuhan dan prioritas Anda.'
    },
    {
      question: 'Bisa bekerja dengan identitas brand yang sudah ada?',
      answer: 'Bisa. Aset dan panduan brand yang tersedia akan menjadi fondasi pengembangan desain.'
    },
    {
      question: 'Berapa lama pengerjaannya?',
      answer: 'Jadwal ditentukan setelah lingkup, jumlah halaman, dan kebutuhan konten disepakati.'
    },
    {
      question: 'Bagaimana cara memulai?',
      answer: 'Kirim email berisi ringkasan ide, kebutuhan, serta target waktu. Saya akan menghubungi Anda untuk mendiskusikan langkah berikutnya.'
    },
    {
      question: 'Apakah ada dukungan setelah peluncuran?',
      answer: 'Dukungan lanjutan dapat disepakati terpisah sesuai kebutuhan proyek.'
    }
  ];

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

  return (
    <section 
      ref={sectionRef} 
      className={`faq-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="faq-container">
        <div className="faq-header">
          <span className="section-badge">FAQ</span>
          <h2 className="faq-title">Jawaban untuk pertanyaan Anda.</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;