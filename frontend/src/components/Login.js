import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || 'Tidak dapat masuk. Periksa koneksi lalu coba lagi.');
      navigate('/admin', { replace: true, state: { user: result } });
    } catch (loginError) {
      setError(loginError.message || 'Tidak dapat masuk. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="login-eyebrow">RUANG KERJA PRIBADI</span>
        <h1 className="login-title">Selamat datang kembali.</h1>
        <p className="login-subtitle">Masuk untuk mengelola portfolio dan tulisan Anda.</p>

        {error && <div className="login-error" role="alert">{error}</div>}

        <label className="login-field">
          Email admin
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="login-field">
          Kata sandi
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            minLength={6}
            maxLength={128}
            pattern="(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,128}"
            title="Gunakan minimal 6 karakter, dengan huruf dan angka saja."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isLoading} className="login-submit-btn">
          {isLoading ? 'Memeriksa…' : 'Masuk ke admin'}
        </button>
        <p className="login-security-note">Akses pribadi · koneksi aman · sesi berakhir setelah 7 hari</p>
      </form>
    </main>
  );
};

export default Login;
