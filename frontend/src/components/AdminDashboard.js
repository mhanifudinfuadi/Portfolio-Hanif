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
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Content Management</h1>
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
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Your content management system is ready. Below you can manage all aspects of your landing page.</p>
        </div>

        <div className="admin-cards">
          <div className="admin-card ai-card-active">
            <div className="admin-card-icon">📝</div>
            <h3>Dokumentasi & artikel</h3>
            <p>Unggah sampul, tulis cerita, simpan sebagai draf, dan terbitkan ke portfolio.</p>
            <button className="admin-card-btn admin-card-btn-active" onClick={() => { setActiveChannel('works'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola dokumentasi</button>
          </div>
          <div className="admin-card ai-card-active">
            <div className="admin-card-icon">✨</div>
            <h3>AI Description Writer</h3>
            <p>Generate compelling project descriptions using GPT 6 Sol</p>
            <button 
              className="admin-card-btn admin-card-btn-active"
              onClick={() => setShowAIGenerator(true)}
            >
              Open Generator
            </button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🎬</div>
            <h3>Hero Section</h3>
            <p>Update main title, team names, and hero content</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('hero'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola hero</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📝</div>
            <h3>Story & Narrative</h3>
            <p>Edit story text, descriptions, and call-to-action</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('story'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola narasi</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🖼️</div>
            <h3>Works & Projects</h3>
            <p>Manage photography projects and written works</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('works'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola karya</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🎨</div>
            <h3>Media Assets</h3>
            <p>Update images, logos, and visual content</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('media'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Kelola media</button>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📧</div>
            <h3>Contact Inquiries</h3>
            <p>View and respond to visitor submissions</p>
            <button className="admin-card-btn" onClick={() => { setActiveChannel('contact'); document.getElementById('channel-manager')?.scrollIntoView({ behavior: 'smooth' }); }}>Lihat pesan</button>
          </div>
        </div>

        <div id="channel-manager">
          <PortfolioManager key={activeChannel} channel={activeChannel} />
          <ArticlesManager />
        </div>

        <div className="admin-actions">
          <button onClick={handleGoToSite} className="admin-view-site-btn">
            View Live Site →
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
