import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './AboutNovelModal.css';

const AboutNovelModal = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const fullSynopsis = `Bagaimana jika seseorang yang paling kita tunggu justru menjadi alasan kita tak pernah benar-benar melangkah?

Saat berusia sepuluh tahun, Alex menulis sebuah daftar sederhana tentang ibu yang ia impikan. Lima keinginan polos seorang anak: melihat salju bersama, bermain bola, menjelajahi tempat-tempat jauh, bebas menangis tanpa dianggap lemah, dan memiliki seseorang yang benar-benar melihatnya ketika pulang.

Namun, sebelum daftar itu menjadi kenyataan, ibunya pergi.

Delapan belas tahun berlalu. Alex tumbuh menjadi laki-laki dewasa yang mampu bekerja, membayar tagihan, dan menjalani hidupnya sendiri. Ia tampak baik-baik saja, tetapi diam-diam masih menjadi anak kecil yang menunggu di depan pintu. Sebuah surat lama yang kembali datang dari masa lalu membuka kembali pertanyaan yang selama ini berusaha ia kubur: ke mana ibunya pergi, mengapa ia tak pernah kembali, dan apakah masih ada sesuatu yang belum Alex ketahui?

Bersama empat sahabat masa kecilnya, Alex memulai perjalanan untuk mewujudkan daftar yang pernah ditulisnya. Perjalanan itu membawanya melintas kota, kenangan, kegagalan, dan titik-titik terendah yang memaksanya memahami arti kehilangan, pertolongan, doa, serta keberanian untuk menerima dirinya sendiri.

Sebab, terkadang, perjalanan terjadi bukanlah perjalanan menuju tempat yang belum pernah kita kunjungi, melainkan perjalanan menuju bagian diri yang telah lama kita tinggalkan.

Daftar Ibu yang Hebat adalah kisah tentang seorang anak yang terlalu lama menunggu, seorang ibu yang menyimpan cerita, persahabatan yang menjadi jalan pulang, dan sebuah pengingat bahwa menjadi dewasa bukan harus melupakan anak kecil di dalam diri kita.

Karena pada akhirnya, setiap orang berhak memiliki tempat untuk pulang. Dan setiap jiwa berhak untuk dilihat, diterima, serta dicintai.`;

  const themes = [
    {
      icon: "🏠",
      title: "Makna Pulang",
      desc: "Pencarian jati diri dan tempat di mana jiwa merasa utuh dan diterima"
    },
    {
      icon: "💙",
      title: "Penyembuhan Luka",
      desc: "Proses mengampuni masa lalu dan berdamai dengan kehilangan"
    },
    {
      icon: "👥",
      title: "Kekuatan Persahabatan",
      desc: "Beban hidup terasa ringan ketika dihadapi bersama"
    },
    {
      icon: "❤️",
      title: "Hubungan Ibu-Anak",
      desc: "Kompleksitas kasih sayang, kerinduan, dan pengorbanan seorang ibu"
    }
  ];

  const quotes = [
    {
      text: "Jangan cari aku seperti mencari jawaban. Cari aku seperti mencari seseorang yang juga sedang belajar pulang.",
      author: "Ibu kepada Alex"
    },
    {
      text: "Di balik daftar kecil yang ditulisnya, tersimpan harapan besar: menemukan seseorang yang tak hanya ia cari, tetapi juga membuatnya merasa ditemukan.",
      author: "Narrator"
    }
  ];

  const handleAudioPlay = () => {
    setIsPlaying(!isPlaying);
    // Simulate audio progress (for demo)
    if (!isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="about-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="about-modal-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="about-close-btn" onClick={onClose}>
            CLOSE
          </button>

          {/* Animated Title Header */}
          <motion.div 
            className="about-title-header"
            style={{ y: titleY, opacity: titleOpacity }}
          >
            <motion.p 
              className="about-label"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              SEBUAH NOVEL
            </motion.p>
            <motion.h1 
              className="about-main-title"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              Daftar
              <br />
              <span className="title-italic">Ibu yang</span>
              <br />
              Hebat
            </motion.h1>
            <motion.p 
              className="about-tagline"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Doa, Jalan, dan Rumah untuk Jiwa yang Pulang
            </motion.p>
          </motion.div>

          {/* Full Cover Spread - Not Cropped */}
          <motion.div 
            className="about-cover-full"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <img 
              src="/images/novel/sampul-utuh.webp" 
              alt="Daftar Ibu yang Hebat - Full Cover" 
            />
          </motion.div>

          {/* Main Content */}
          <div className="about-main-content">
            
            {/* Synopsis Section with Serif Font */}
            <motion.div 
              className="about-section synopsis-section"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="about-section-title">Tentang Novel</h2>
              
              {/* Audio Player */}
              <div className="audio-player">
                <button 
                  className="audio-play-btn"
                  onClick={handleAudioPlay}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="audio-info">
                  <p className="audio-title">Narasi Sinopsis</p>
                  <p className="audio-subtitle">Mohammad Hanifuddin Fuadi</p>
                </div>
                <div className="audio-progress-bar">
                  <div 
                    className="audio-progress-fill" 
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <button className="audio-volume-btn">🔊</button>
              </div>

              <div className="synopsis-text">
                {fullSynopsis.split('\n\n').map((para, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* Themes Grid with Hover Effects */}
            <motion.div 
              className="about-section"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="about-section-title">Tema Utama</h2>
              <div className="themes-grid">
                {themes.map((theme, idx) => (
                  <motion.div
                    key={idx}
                    className="theme-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                  >
                    <motion.div 
                      className="theme-icon"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {theme.icon}
                    </motion.div>
                    <h3>{theme.title}</h3>
                    <p>{theme.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quotes with Parallax Effect */}
            <motion.div 
              className="about-section"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="about-section-title">Kutipan Pilihan</h2>
              {quotes.map((quote, idx) => (
                <motion.blockquote
                  key={idx}
                  className="about-quote"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  whileHover={{ 
                    x: 10,
                    borderLeftColor: "#666"
                  }}
                >
                  <p>"{quote.text}"</p>
                  <cite>— {quote.author}</cite>
                </motion.blockquote>
              ))}
            </motion.div>

            {/* Author Note */}
            <motion.div 
              className="about-section author-note"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="about-section-title">Dari Penulis</h2>
              <div className="about-text">
                <p>
                  Kepada para pembaca, saya berterima kasih telah menemani Alex sampai halaman terakhir. 
                  Semoga cerita ini membuat Anda berani pulang, baik kepada orang yang Anda cintai, 
                  kepada keluarga, maupun kepada Sang Pencipta, dan semoga Anda selalu menemukan tempat 
                  untuk mengistirahatkan jiwa.
                </p>
              </div>
              <motion.div 
                className="author-sign"
                whileHover={{ scale: 1.05 }}
              >
                <p>Mohammad Hanifuddin Fuadi</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutNovelModal;
