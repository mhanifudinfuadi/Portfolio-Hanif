import React, { useEffect, useRef, useState } from 'react';
import ImageCropper from './ImageCropper';
import { describeUploadError } from './uploadError';
import './ArticlesManager.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const emptyArticle = { title: '', excerpt: '', body: '', category: 'Catatan', image_url: '', published: false };

const ArticlesManager = () => {
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(emptyArticle);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cropper, setCropper] = useState(null);
  const fileInput = useRef(null);

  const resolveUrl = (url) => (!url ? '' : url.startsWith('http') ? url : `${API_URL}${url}`);

  const loadArticles = async () => {
    const response = await fetch(`${API_URL}/api/articles?published_only=false`, { credentials: 'include' });
    if (!response.ok) throw new Error('Gagal memuat artikel. Silakan masuk ulang.');
    setArticles(await response.json());
  };

  useEffect(() => { loadArticles().catch((error) => setMessage(error.message)); }, []);

  const setField = (event) => {
    const { name, value, checked, type } = event.target;
    setArticle((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadBlob = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_URL}/api/articles/upload-image`, { method: 'POST', body: form, credentials: 'include' });
    if (!response.ok) throw new Error(await describeUploadError(response, 'Gagal mengunggah gambar.'));
    const result = await response.json();
    return result.image_url;
  };

  const handleFilesChosen = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setCropper({ src: URL.createObjectURL(file), fileName: file.name, index: null, file });
  };

  const handleCropConfirm = async (croppedFile) => {
    const imageUrl = await uploadBlob(croppedFile);
    if (!imageUrl) throw new Error('Gambar gagal diunggah.');
    setArticle((current) => ({ ...current, image_url: imageUrl }));
    setMessage(
      cropper?.index === null || cropper?.index === undefined
        ? 'Gambar sampul siap. Klik "Simpan artikel" agar tersimpan.'
        : 'Gambar sampul diganti. Klik "Simpan perubahan" agar tersimpan.'
    );
    setCropper(null);
  };

  const handleCropSkip = async () => {
    const target = cropper;
    if (!target) return;
    if (!target.file) {
      setCropper(null);
      return;
    }
    const imageUrl = await uploadBlob(target.file);
    if (!imageUrl) throw new Error('Gambar gagal diunggah.');
    setArticle((current) => ({ ...current, image_url: imageUrl }));
    setMessage('Gambar diunggah tanpa perubahan.');
    setCropper(null);
  };

  const recropExisting = async () => {
    const url = resolveUrl(article.image_url);
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gambar gagal dimuat.');
      const objectUrl = URL.createObjectURL(await response.blob());
      setCropper({ src: objectUrl, fileName: 'sampul-artikel', index: 0 });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const removeImage = () => {
    setArticle((current) => ({ ...current, image_url: '' }));
    setMessage('Gambar dilepas dari artikel. Klik "Simpan perubahan" agar tersimpan.');
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const endpoint = editingId ? `${API_URL}/api/articles/${editingId}` : `${API_URL}/api/articles`;
      const response = await fetch(endpoint, {
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
    setMessage(`Sedang menyunting “${item.title}”.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setArticle(emptyArticle);
    setEditingId(null);
    setMessage('');
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
      <p>Tulis dokumentasi dan cerita, atur gambar sampul, simpan sebagai draf, lalu publikasikan saat siap.</p>

      {editingId && (
        <div className="article-editing-banner" role="status">
          <span>Sedang menyunting artikel. Perubahan akan menimpa konten yang sudah tayang.</span>
          <button type="button" className="article-cancel-btn" onClick={cancelEdit}>Batal edit</button>
        </div>
      )}

      <form className="article-editor" onSubmit={saveArticle}>
        <label>Judul<input name="title" value={article.title} onChange={setField} required /></label>
        <label>Kategori<input name="category" value={article.category} onChange={setField} /></label>
        <label>Ringkasan<textarea name="excerpt" value={article.excerpt} onChange={setField} rows="2" /></label>
        <label>Isi artikel<textarea name="body" value={article.body} onChange={setField} rows="9" /></label>

        <div className="article-cover-block">
          <span className="article-cover-label">Gambar sampul</span>
          <input ref={fileInput} type="file" accept="image/*" onChange={handleFilesChosen} hidden />
          <div className="article-cover-actions">
            <button type="button" className="admin-card-btn" onClick={() => fileInput.current?.click()}>
              {article.image_url ? 'Ganti gambar' : 'Pilih gambar'}
            </button>
            {article.image_url && (
              <>
                <button type="button" className="admin-card-btn" onClick={recropExisting}>Atur ulang posisi</button>
                <button type="button" className="article-cancel-btn" onClick={removeImage}>Hapus gambar</button>
              </>
            )}
          </div>
          {article.image_url && (
            <img
              className="article-editor-preview"
              src={resolveUrl(article.image_url)}
              alt="Pratinjau sampul"
            />
          )}
        </div>

        <label className="article-publish-toggle"><input type="checkbox" name="published" checked={article.published} onChange={setField} /> Terbitkan di portfolio</label>
        <div className="article-editor-actions">
          <button className="admin-card-btn admin-card-btn-active" disabled={busy}>{busy ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan artikel'}</button>
          {editingId && <button type="button" className="article-cancel-btn" onClick={cancelEdit}>Batal edit</button>}
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

      {cropper && (
        <ImageCropper
          src={cropper.src}
          fileName={cropper.fileName}
          title={cropper.index === null || cropper.index === undefined ? 'Atur gambar sampul' : 'Atur ulang gambar sampul'}
          onCancel={() => setCropper(null)}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
        />
      )}
    </section>
  );
};

export default ArticlesManager;