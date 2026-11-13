import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIDescriptionGenerator from './admin/AIDescriptionGenerator';
import ArticlesManager from './admin/ArticlesManager';
import PortfolioManager from './admin/PortfolioManager';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeChannel, setActiveChannel] = useState('works');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleGoToSite = () => {
    navigate('/portfolio');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Studio Hanif</h1>
          <div className="admin-user-section">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="admin-user-avatar"
              />
            )}
            <div className="admin-user-info">
              <p className="admin-user-name">{user?.name}</p>
              <p className="admin-user-email">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="admin-logout-btn"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-welcome">
          <span className="admin-eyebrow">RUANG KERJA PRIBADI</span>
          <h2>Selamat datang, {user?.name?.split(' ')[0]}.</h2>
          <p>Kelola cerita, foto, dan karya yang tampil di portfolio Anda.</p>
        </div>

        <div className="admin-cards">
          <div className="admin-card">
            <div className="admin-card-icon">📝</div>
            <h3>Catatan & tulisan</h3>
            <p>Terbitkan jurnal, kutipan, esai, dan cerita panjang Anda.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('journal'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Buka ruang tulis</button>
          </div>
          <div className="admin-card ai-card-active">
            <div className="admin-card-icon">✨</div>
            <h3>Asisten deskripsi</h3>
            <p>Bantu menyusun deskripsi karya dan proyek.</p>
            <button 
              className="admin-card-btn admin-card-btn-active"
              onClick={() => setShowAIGenerator(true)}
            >
              Buka asisten
            </button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🎬</div>
            <h3>Beranda</h3>
            <p>Atur judul utama dan teks pengantar portfolio.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('hero'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola hero</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📝</div>
            <h3>Tentang saya</h3>
            <p>Perbarui cerita personal dan informasi kontak.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('story'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola narasi</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🖼️</div>
            <h3>Fotografi & karya</h3>
            <p>Kelola dokumentasi, galeri, dan karya visual.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('works'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola karya</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🎨</div>
            <h3>Pustaka media</h3>
            <p>Atur aset visual yang telah diunggah.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('media'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola media</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📧</div>
            <h3>Pesan pengunjung</h3>
            <p>Lihat pesan yang dikirim melalui portfolio.</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('contact'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Lihat pesan</button>
          </div>
        </div>

        <div id="channel-manager">
          {activeChannel === 'journal' ? <ArticlesManager /> : <PortfolioManager key={activeChannel} channel={activeChannel} />}
        </div>

        <div className="admin-actions">
          <button onClick={handleGoToSite} className="admin-view-site-btn">
            Lihat portfolio →
          </button>
        </div>
      </main>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIDescriptionGenerator onClose={() => setShowAIGenerator(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
