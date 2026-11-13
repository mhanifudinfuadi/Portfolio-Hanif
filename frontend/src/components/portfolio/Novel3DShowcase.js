import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import './Novel3DShowcase.css';
import AboutNovelModal from './AboutNovelModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const asset = (file) => `${process.env.PUBLIC_URL}/images/novel/${file}`;

function Book() {
  const group = useRef();
  const [front, back, spine] = useTexture([
    asset('sampul-depan.webp'),
    asset('sampul-belakang.webp'),
    asset('punggung.webp'),
  ]);

  front.flipY = true;
  back.flipY = true;
  spine.flipY = false;

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2, 3, 0.02]} />
        <meshStandardMaterial map={front} />
      </mesh>

      <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2, 3, 0.02]} />
        <meshStandardMaterial map={back} />
      </mesh>

      <mesh position={[-1.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.1, 3, 0.02]} />
        <meshStandardMaterial map={spine} />
      </mesh>

      <mesh position={[0.01, 0, 0]}>
        <boxGeometry args={[1.98, 2.96, 0.08]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
    </group>
  );
}

function BookScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={1}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <spotLight position={[-5, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} />
      <Suspense fallback={null}>
        <Book />
      </Suspense>
    </>
  );
}

const Novel3DShowcase = () => {
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [novel, setNovel] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);

    fetch(`${BACKEND_URL}/api/portfolio/content?kind=novel&published_only=true`)
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => setNovel(Array.isArray(items) ? items[0] || null : null))
      .catch(() => {});

    return () => clearTimeout(timer);
  }, []);

  const data = {
    title: novel?.title || 'Daftar Ibu yang Hebat',
    author: 'Mohammad Hanifuddin Fuadi',
    tagline: 'Doa, Jalan, dan Rumah untuk Jiwa yang Pulang',
    description:
      novel?.description ||
      novel?.body ||
      'Sebuah novel yang mengisahkan perjalanan spiritual seorang anak dalam memahami makna pengorbanan, kasih sayang, dan doa seorang ibu. Narasi yang menyentuh hati dengan prosa yang dalam, mengajak pembaca merenung tentang ikatan batin antara ibu dan anak.',
    specs: [
      { label: 'Halaman', value: novel?.metadata?.pages || '384' },
      { label: 'Tahun', value: '2026' },
      { label: 'Genre', value: novel?.category || 'Fiksi Religi' },
      { label: 'Bahasa', value: 'Indonesia' },
      { label: 'ISBN', value: novel?.metadata?.isbn || '978-xxx-xxxx' },
      { label: 'Penerbit', value: novel?.metadata?.publisher || 'Hanif Publishing' },
    ],
    price: 'Rp 135.000',
    orderUrl: novel?.metadata?.order_url || '#contact',
  };

  return (
    <section className="novel-3d-showcase">
      <div className="showcase-hero">
        <div className="showcase-container">
          <div className="canvas-section-3d">
            {loading && (
              <div className="canvas-loader">
                <div className="loader-spinner" />
                <p>Loading 3D Book...</p>
              </div>
            )}

            <Canvas className="book-canvas-3d" gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
              <BookScene />
            </Canvas>

            <div className="canvas-hint-3d">
              <span>🖱️ Drag to rotate • Scroll to zoom • Touch to interact</span>
            </div>
          </div>

          <motion.div
            className="info-section"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="info-badge">
              {novel?.category || 'Novel Perdana - Pre-Order'}
            </span>
            <h1 className="info-title">{data.title}</h1>
            <p className="info-author">oleh {data.author}</p>
            <p className="info-tagline">{data.tagline}</p>
            <p className="info-description">{data.description}</p>

            <div className="info-price">
              <span className="price-label">Harga Pre-Order</span>
              <span className="price-value">{data.price}</span>
            </div>

            <div className="info-actions">
              <button className="btn-primary-3d" onClick={() => setAboutOpen(true)}>
                <span>Tentang Novel</span>
              </button>
              <a className="btn-secondary-3d" href={data.orderUrl}>
                <span>Pre-Order</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="specs-section">
        <div className="specs-container">
          <h3 className="specs-title">Spesifikasi</h3>
          <div className="specs-grid">
            {data.specs.map((spec, index) => (
              <motion.div
                className="spec-item"
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-container">
          <h3 className="features-title">Mengapa Novel Ini Istimewa?</h3>
          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon">🕌</div>
              <h4 className="feature-title">Tema Spiritual</h4>
              <p className="feature-description">
                Mengangkat nilai-nilai keislaman dan makna pengorbanan seorang ibu dengan cara yang
                menyentuh dan mendalam.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon">❤️</div>
              <h4 className="feature-title">Ikatan Keluarga</h4>
              <p className="feature-description">
                Menggambarkan hubungan ibu dan anak yang kuat, mengajak pembaca merenungkan kasih
                sayang orangtua.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="feature-icon">🌟</div>
              <h4 className="feature-title">Perjalanan Hidup</h4>
              <p className="feature-description">
                Kisah pencarian jati diri dan makna hidup melalui doa, jalan, dan rumah yang penuh
                filosofi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <AboutNovelModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </section>
  );
};

export default Novel3DShowcase;