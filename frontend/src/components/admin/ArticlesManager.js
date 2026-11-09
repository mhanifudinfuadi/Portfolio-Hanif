import React, { useEffect, useState } from 'react';
import './ArticlesManager.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const emptyArticle = { title: '', excerpt: '', body: '', category: 'Catatan', image_url: '', published: false };

const ArticlesManager = () => {
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(emptyArticle);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadArticles = async () => {
    const response = await fetch(`${API_URL}/api/articles/?published_only=false`, { credentials: 'include' });
    if (!response.ok) throw new Error('Gagal memuat artikel. Silakan masuk ulang.');
    setArticles(await response.json());
  };

  useEffect(() => { loadArticles().catch((error) => setMessage(error.message)); }, []);

  const setField = (event) => {
    const { name, value, checked, type } = event.target;
    setArticle((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`${API_URL}/api/articles/upload-image`, { method: 'POST', body: form, credentials: 'include' });
      if (!response.ok) throw new Error('Gagal mengunggah gambar.');
      const result = await response.json();
      setArticle((current) => ({ ...current, image_url: result.image_url }));
      setMessage('Gambar berhasil diunggah.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); event.target.value = ''; }
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/articles/${editingId ? `${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(article),
      });
      if (!response.ok) throw new Error('Artikel gagal disimpan. Periksa koneksi lalu coba lagi.');
      setArticle(emptyArticle);
      setEditingId(null);
      setMessage('Artikel berhasil disimpan.');
      await loadArticles();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const editArticle = (item) => {
    setEditingId(item.article_id);
    setArticle({ title: item.title, excerpt: item.excerpt || '', body: item.body || '', category: item.category || 'Catatan', image_url: item.image_url || '', published: item.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteArticle = async (item) => {
    if (!window.confirm(`Hapus artikel “${item.title}”?`)) return;
    const response = await fetch(`${API_URL}/api/articles/${item.article_id}`, { method: 'DELETE', credentials: 'include' });
    if (response.ok) { setMessage('Artikel dihapus.'); await loadArticles(); }
    else setMessage('Artikel gagal dihapus.');
  };

  return (
    <section className="articles-manager">
      <h2>Kelola artikel</h2>
      <p>Tulis dokumentasi dan cerita, simpan sebagai draf, lalu publikasikan saat siap.</p>
      <form className="article-editor" onSubmit={saveArticle}>
        <label>Judul<input name="title" value={article.title} onChange={setField} required /></label>
        <label>Kategori<input name="category" value={article.category} onChange={setField} /></label>
        <label>Ringkasan<textarea name="excerpt" value={article.excerpt} onChange={setField} rows="2" /></label>
        <label>Isi artikel<textarea name="body" value={article.body} onChange={setField} rows="9" /></label>
        <label>Sampul artikel<input type="file" accept="image/*" onChange={uploadImage} /></label>
        {article.image_url && <img className="article-editor-preview" src={article.image_url.startsWith('http') ? article.image_url : `${API_URL}${article.image_url}`} alt="Pratinjau sampul" />}
        <label className="article-publish-toggle"><input type="checkbox" name="published" checked={article.published} onChange={setField} /> Terbitkan di portfolio</label>
        <div className="article-editor-actions">
          <button className="admin-card-btn admin-card-btn-active" disabled={busy}>{busy ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan artikel'}</button>
          {editingId && <button type="button" className="article-cancel-btn" onClick={() => { setArticle(emptyArticle); setEditingId(null); }}>Batal edit</button>}
        </div>
        {message && <p className="article-manager-message" role="status">{message}</p>}
      </form>
      <h3>Artikel tersimpan ({articles.length})</h3>
      <div className="managed-articles">
        {articles.map((item) => <article className="managed-article" key={item.article_id}>
          <div><strong>{item.title}</strong><span>{item.published ? 'Terbit' : 'Draf'} · {item.category}</span></div>
          <div className="managed-article-actions"><button onClick={() => editArticle(item)}>Edit</button><button onClick={() => deleteArticle(item)}>Hapus</button></div>
        </article>)}
        {!articles.length && <p>Belum ada artikel. Mulai dengan menulis dokumentasi pertama.</p>}
      </div>
    </section>
  );
};

export default ArticlesManager;
