import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import AboutNovelModal from './AboutNovelModal';
import './Novel3DShowcase.css';

// 3D Book with Texture Mapping
const InteractiveBook = () => {
  const groupRef = useRef();
  
  // Load textures
  const frontTexture = useTexture('/images/novel/sampul-depan.webp');
  const backTexture = useTexture('/images/novel/sampul-belakang.webp');
  const spineTexture = useTexture('/images/novel/punggung.webp');
  
  // Set texture properties - flip to correct orientation
  frontTexture.flipY = true;
  backTexture.flipY = true;
  spineTexture.flipY = false;

  return (
    <group ref={groupRef}>
      {/* Front Cover */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2, 3, 0.02]} />
        <meshStandardMaterial map={frontTexture} />
      </mesh>

      {/* Back Cover */}
      <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2, 3, 0.02]} />
        <meshStandardMaterial map={backTexture} />
      </mesh>

      {/* Spine */}
      <mesh position={[-1.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.1, 3, 0.02]} />
        <meshStandardMaterial map={spineTexture} />
      </mesh>

      {/* Pages */}
      <mesh position={[0.01, 0, 0]}>
        <boxGeometry args={[1.98, 2.96, 0.08]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Scene with Lighting and Controls
const Scene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={true}
        autoRotateSpeed={1}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <spotLight position={[-5, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} />
      <Suspense fallback={null}>
        <InteractiveBook />
      </Suspense>
    </>
  );
};

const Novel3DShowcase = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [publishedNovel, setPublishedNovel] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/portfolio/content?kind=novel&published_only=true`).then((response) => response.ok ? response.json() : []).then((items) => setPublishedNovel(items[0] || null)).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const novelDetails = {
    title: publishedNovel?.title || 'Daftar Ibu yang Hebat',
    author: 'Mohammad Hanifuddin Fuadi',
    tagline: 'Doa, Jalan, dan Rumah untuk Jiwa yang Pulang',
    description: publishedNovel?.description || publishedNovel?.body || 'Sebuah novel yang mengisahkan perjalanan spiritual seorang anak dalam memahami makna pengorbanan, kasih sayang, dan doa seorang ibu. Narasi yang menyentuh hati dengan prosa yang dalam, mengajak pembaca merenung tentang ikatan batin antara ibu dan anak.',
    specs: [
      { label: 'Halaman', value: publishedNovel?.metadata?.pages || '384' },
      { label: 'Tahun', value: '2026' },
      { label: 'Genre', value: publishedNovel?.category || 'Fiksi Religi' },
      { label: 'Bahasa', value: 'Indonesia' },
      { label: 'ISBN', value: publishedNovel?.metadata?.isbn || '978-xxx-xxxx' },
      { label: 'Penerbit', value: publishedNovel?.metadata?.publisher || 'Hanif Publishing' }
    ],
    price: 'Rp 135.000'
  };

  return (
    <section className="novel-3d-showcase">
      {/* Hero Section with 3D Interactive Book */}
      <div className="showcase-hero">
        <div className="showcase-container">
          {/* Left: 3D Interactive Book */}
          <div className="canvas-section-3d">
            {isLoading && (
              <div className="canvas-loader">
                <div className="loader-spinner"></div>
                <p>Loading 3D Book...</p>
              </div>
            )}
            <Canvas
              className="book-canvas-3d"
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <Scene />
            </Canvas>
            <div className="canvas-hint-3d">
              <span>🖱️ Drag to rotate • Scroll to zoom • Touch to interact</span>
            </div>
          </div>

          {/* Right: Novel Info */}
          <motion.div
            className="info-section"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="info-badge">{publishedNovel?.category || 'Novel Perdana - Pre-Order'}</span>
            <h1 className="info-title">{novelDetails.title}</h1>
            <p className="info-author">oleh {novelDetails.author}</p>
            <p className="info-tagline">{novelDetails.tagline}</p>
            <p className="info-description">{novelDetails.description}</p>

            <div className="info-price">
              <span className="price-label">Harga Pre-Order</span>
              <span className="price-value">{novelDetails.price}</span>
            </div>

            <div className="info-actions">
              <button 
                className="btn-primary-3d"
                onClick={() => setShowAboutModal(true)}
              >
                <span>Tentang Novel</span>
              </button>
              <a className="btn-secondary-3d" href={publishedNovel?.metadata?.order_url || '#contact'}>
                <span>Pre-Order</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Novel Specifications */}
      <div className="specs-section">
        <div className="specs-container">
          <h3 className="specs-title">Spesifikasi</h3>
          <div className="specs-grid">
            {novelDetails.specs.map((spec, index) => (
              <motion.div
                key={index}
                className="spec-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
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
                Mengangkat nilai-nilai keislaman dan makna pengorbanan seorang ibu dengan cara yang menyentuh dan mendalam.
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
                Menggambarkan hubungan ibu dan anak yang kuat, mengajak pembaca merenungkan kasih sayang orangtua.
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
                Kisah pencarian jati diri dan makna hidup melalui doa, jalan, dan rumah yang penuh filosofi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About Novel Modal */}
      <AboutNovelModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
    </section>
  );
};

export default Novel3DShowcase;
