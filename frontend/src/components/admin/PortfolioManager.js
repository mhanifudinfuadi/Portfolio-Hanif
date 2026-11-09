import React, { useEffect, useState } from 'react';
import './PortfolioManager.css';

const API = process.env.REACT_APP_BACKEND_URL;
const categories = [
  { kind: 'documentation', label: 'Dokumentasi' },
  { kind: 'creative', label: 'Tulisan Kreatif' },
  { kind: 'novel', label: 'Novel Resmi' },
];
const fresh = { title: '', category: '', description: '', body: '', images: [], metadata: {}, published: false };

const PortfolioManager = ({ channel }) => {
  const [kind, setKind] = useState('documentation');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(fresh);
  const [editing, setEditing] = useState(null);
  const [settings, setSettings] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const reloadItems = async (selectedKind = kind) => {
    const response = await fetch(`${API}/api/portfolio/content?kind=${selectedKind}&published_only=false`, { credentials: 'include' });
    if (!response.ok) throw new Error('Tidak dapat memuat konten. Silakan masuk ulang.');
    setItems(await response.json());
  };

  useEffect(() => {
    if (channel === 'works' || channel === 'media' || channel === 'novel') {
      const selected = channel === 'novel' ? 'novel' : channel === 'media' ? 'media' : kind;
      if (channel === 'media') setKind('media');
      if (channel === 'novel') setKind('novel');
      reloadItems(selected).catch((error) => setNotice(error.message));
    }
    if (channel === 'hero' || channel === 'story') fetch(`${API}/api/portfolio/settings`).then((r) => r.json()).then(setSettings).catch(() => {});
    if (channel === 'contact') fetch(`${API}/api/portfolio/inquiries`, { credentials: 'include' }).then((r) => r.json()).then(setInquiries).catch(() => setNotice('Gagal memuat pesan.'));
  }, [channel, kind]);

  const changeKind = (next) => { setKind(next); setForm(fresh); setEditing(null); reloadItems(next).catch((error) => setNotice(error.message)); };
  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const data = new FormData();
      files.forEach((file) => data.append('files', file));
      const response = await fetch(`${API}/api/portfolio/upload`, { method: 'POST', body: data, credentials: 'include' });
      if (!response.ok) throw new Error('Gambar gagal diunggah.');
      const uploaded = await response.json();
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded.map((image) => image.url)] }));
      setNotice(`${uploaded.length} gambar berhasil diunggah.`);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); event.target.value = ''; }
  };

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const response = await fetch(`${API}/api/portfolio/content${editing ? `/${editing}` : `?kind=${kind}`}`, {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Konten gagal disimpan.');
      setForm(fresh); setEditing(null); setNotice('Konten berhasil disimpan.'); await reloadItems();
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const edit = (item) => { setEditing(item.content_id); setForm({ title: item.title, category: item.category, description: item.description || '', body: item.body || '', images: item.images || [], metadata: item.metadata || {}, published: item.published }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (item) => {
    if (!window.confirm(`Hapus “${item.title}”?`)) return;
    const response = await fetch(`${API}/api/portfolio/content/${item.content_id}`, { method: 'DELETE', credentials: 'include' });
    if (response.ok) { setNotice('Konten dihapus.'); await reloadItems(); } else setNotice('Konten gagal dihapus.');
  };
  const saveSettings = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API}/api/portfolio/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(settings) });
    setNotice(response.ok ? 'Konten halaman berhasil diperbarui.' : 'Konten halaman gagal disimpan.');
  };

  if (channel === 'hero' || channel === 'story') return <section className="portfolio-manager"><h2>{channel === 'hero' ? 'Pengaturan hero' : 'Cerita & narasi'}</h2><p>Perubahan tersimpan ke database dan dapat ditampilkan pada halaman portfolio.</p><form onSubmit={saveSettings} className="portfolio-form">
    {channel === 'hero' ? <><label>Judul utama<input value={settings.hero_title || ''} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} /></label><label>Teks pengantar<textarea rows="4" value={settings.hero_subtitle || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} /></label></> : <><label>Tentang saya<textarea rows="5" value={settings.about_text || ''} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} /></label><label>Email kontak<input type="email" value={settings.contact_email || ''} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} /></label></>}
    <button className="admin-card-btn admin-card-btn-active">Simpan perubahan</button>{notice && <p>{notice}</p>}</form></section>;

  if (channel === 'contact') return <section className="portfolio-manager"><h2>Pesan pengunjung</h2><p>{inquiries.length} pesan masuk</p><div className="portfolio-item-list">{inquiries.map((item) => <article key={item.inquiry_id}><strong>{item.name} · {item.email}</strong><p>{item.message}</p><small>{new Date(item.created_at).toLocaleString('id-ID')}</small></article>)}{!inquiries.length && <p>Belum ada pesan.</p>}</div></section>;

  const mediaMode = channel === 'media';
  const availableCategories = channel === 'novel' ? categories.filter((entry) => entry.kind === 'novel') : categories;
  return <section className="portfolio-manager">
    <h2>{mediaMode ? 'Pustaka media' : channel === 'novel' ? 'Koleksi novel resmi' : 'Karya & dokumentasi portfolio'}</h2>
    <p>Dokumentasi acara seperti wedding atau lamaran dapat memuat banyak foto dalam satu showcase. Pilih lebih dari 10 foto saat mengunggah.</p>
    {!mediaMode && <div className="portfolio-category-tabs">{availableCategories.map((entry) => <button key={entry.kind} className={kind === entry.kind ? 'active' : ''} onClick={() => changeKind(entry.kind)}>{entry.label}</button>)}</div>}
    <form className="portfolio-form" onSubmit={save}>
      <label>Judul<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>{mediaMode ? 'Nama koleksi' : 'Kategori'}<input required value={form.category} placeholder={kind === 'documentation' ? 'Wedding, lamaran, perjalanan…' : kind === 'creative' ? 'Novel, cerpen, puisi, esai…' : 'Fiksi religi, fiksi kontemporer…'} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
      <label>Ringkasan<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label>Isi / cerita lengkap<textarea rows="8" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
      <label>Unggah foto (bisa pilih banyak)<input type="file" accept="image/*" multiple onChange={upload} /></label>
      {!!form.images.length && <div className="portfolio-photo-list">{form.images.map((image, index) => <div key={`${image}-${index}`}><img src={image.startsWith('http') ? image : `${API}${image}`} alt={`Foto ${index + 1}`} /><button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })}>Hapus</button></div>)}</div>}
      {kind === 'novel' && <div className="portfolio-extra-fields"><label>Jumlah halaman<input value={form.metadata.pages || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, pages: e.target.value } })} /></label><label>ISBN<input value={form.metadata.isbn || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, isbn: e.target.value } })} /></label><label>Penerbit<input value={form.metadata.publisher || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, publisher: e.target.value } })} /></label><label>Tautan pemesanan<input value={form.metadata.order_url || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, order_url: e.target.value } })} /></label></div>}
      <label className="portfolio-publish"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Tampilkan di portfolio publik</label>
      <div className="portfolio-form-actions"><button className="admin-card-btn admin-card-btn-active" disabled={busy}>{busy ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan konten'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(fresh); }}>Batal</button>}</div>{notice && <p role="status">{notice}</p>}
    </form>
    <h3>Konten tersimpan</h3><div className="portfolio-item-list">{items.map((item) => <article key={item.content_id}><div><strong>{item.title}</strong><span>{item.published ? 'Terbit' : 'Draf'} · {item.category} · {(item.images || []).length} foto</span></div><div className="portfolio-item-actions"><button onClick={() => edit(item)}>Edit</button><button onClick={() => remove(item)}>Hapus</button></div></article>)}{!items.length && <p>Belum ada konten pada kategori ini.</p>}</div>
  </section>;
};

export default PortfolioManager;
