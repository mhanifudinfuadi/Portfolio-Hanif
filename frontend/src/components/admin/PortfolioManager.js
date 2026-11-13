import React, { useEffect, useRef, useState } from 'react';
import ImageCropper from './ImageCropper';
import { describeUploadError } from './uploadError';
import './PortfolioManager.css';

const API = process.env.REACT_APP_BACKEND_URL;
const categories = [
  { kind: 'documentation', label: 'Dokumentasi' },
  { kind: 'creative', label: 'Tulisan Kreatif' },
  { kind: 'novel', label: 'Novel Resmi' },
];
const fresh = { title: '', category: '', description: '', body: '', images: [], metadata: {}, published: false, music_url: '', intro_video: '' };

const PortfolioManager = ({ channel }) => {
  const [kind, setKind] = useState('documentation');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(fresh);
  const [editing, setEditing] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [settings, setSettings] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState([]);
  const [cropper, setCropper] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const fileInput = useRef(null);

  const resolveUrl = (url) => (!url ? '' : url.startsWith('http') ? url : `${API}${url}`);

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

  useEffect(() => () => { queue.forEach((entry) => URL.revokeObjectURL(entry.url)); }, []); 

  const changeKind = (next) => { setKind(next); setForm(fresh); setEditing(null); setEditingTitle(''); reloadItems(next).catch((error) => setNotice(error.message)); };

  const uploadBlob = async (file) => {
    const data = new FormData();
    data.append('files', file);
    const response = await fetch(`${API}/api/portfolio/upload`, { method: 'POST', body: data, credentials: 'include' });
    if (!response.ok) throw new Error(await describeUploadError(response));
    const uploaded = await response.json();
    return uploaded[0]?.url || '';
  };

  const startNextCrop = (remaining) => {
    if (!remaining.length) {
      setCropper(null);
      return;
    }
    setCropper({ src: remaining[0].url, fileName: remaining[0].file.name, index: null, file: remaining[0].file });
  };

  const handleFilesChosen = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const next = [
      ...queue,
      ...files.map((file, index) => ({
        key: `${file.name}-${file.size}-${Date.now()}-${index}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ];
    setQueue(next);
    if (!cropper) startNextCrop(next);
  };

  const acceptUpload = (url, target) => {
    if (target.index === null || target.index === undefined) {
      setForm((current) => ({ ...current, images: [...current.images, url] }));
    } else {
      setForm((current) => ({
        ...current,
        images: current.images.map((image, index) => (index === target.index ? url : image)),
      }));
    }
    const rest = queue.slice(1);
    setQueue(rest);
    setNotice(
      target.index === null || target.index === undefined
        ? 'Gambar ditambahkan. Klik "Simpan konten" agar tersimpan.'
        : 'Gambar diganti. Klik "Simpan perubahan" agar tersimpan.'
    );
    startNextCrop(rest);
  };

  const handleCropConfirm = async (croppedFile) => {
    const target = cropper;
    if (!target) return;
    const url = await uploadBlob(croppedFile);
    if (!url) throw new Error('Gambar gagal diunggah.');
    acceptUpload(url, target);
  };

  const handleCropSkip = async () => {
    const target = cropper;
    if (!target) return;
    if (!target.file) {
      setCropper(null);
      return;
    }
    const url = await uploadBlob(target.file);
    if (!url) throw new Error('Gambar gagal diunggah.');
    acceptUpload(url, target);
  };

  const handleCropCancel = () => {
    const rest = queue.slice(1);
    setQueue(rest);
    startNextCrop(rest);
  };

  const recropExisting = async (index) => {
    const url = resolveUrl(form.images[index]);
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gambar gagal dimuat.');
      const objectUrl = URL.createObjectURL(await response.blob());
      setCropper({ src: objectUrl, fileName: `foto-${index + 1}`, index });
    } catch (error) {
      setNotice(error.message);
    }
  };

  const removeImage = (index) => {
    setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (from, to) => {
    if (from === to) return;
    setForm((current) => {
      const images = [...current.images];
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      return { ...current, images };
    });
  };

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const response = await fetch(`${API}/api/portfolio/content${editing ? `/${editing}` : `?kind=${kind}`}`, {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Konten gagal disimpan.');
      setForm(fresh); setEditing(null); setEditingTitle(''); setNotice('Konten berhasil disimpan.'); await reloadItems();
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const edit = (item) => {
    setEditing(item.content_id);
    setEditingTitle(item.title || '');
    setForm({ title: item.title, category: item.category, description: item.description || '', body: item.body || '', images: item.images || [], metadata: item.metadata || {}, published: item.published, music_url: item.music_url || '', intro_video: item.intro_video || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditing(null); setEditingTitle(''); setForm(fresh); setNotice(''); };

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
  const pendingCount = queue.length;

  return <section className="portfolio-manager">
    <h2>{mediaMode ? 'Pustaka media' : channel === 'novel' ? 'Koleksi novel resmi' : 'Karya & dokumentasi portfolio'}</h2>
    <p>Dokumentasi acara seperti wedding atau lamaran dapat memuat banyak foto dalam satu showcase. Pilih lebih dari 10 foto saat mengunggah, atur posisi tiap foto sebelum diunggah.</p>
    {!mediaMode && <div className="portfolio-category-tabs">{availableCategories.map((entry) => <button key={entry.kind} className={kind === entry.kind ? 'active' : ''} onClick={() => changeKind(entry.kind)}>{entry.label}</button>)}</div>}

    {editing && (
      <div className="portfolio-editing-banner" role="status">
        <span>Sedang menyunting: <strong>{editingTitle || 'tanpa judul'}</strong></span>
        <button type="button" onClick={cancelEdit}>Batal edit</button>
      </div>
    )}

    <form className="portfolio-form" onSubmit={save}>
      <label>Judul<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>{mediaMode ? 'Nama koleksi' : 'Kategori'}<input required value={form.category} placeholder={kind === 'documentation' ? 'Wedding, lamaran, perjalanan…' : kind === 'creative' ? 'Novel, cerpen, puisi, esai…' : 'Fiksi religi, fiksi kontemporer…'} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
      <label>Ringkasan<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label>Isi / cerita lengkap<textarea rows="8" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>

      <div className="portfolio-upload-row">
        <input ref={fileInput} type="file" accept="image/*" multiple onChange={handleFilesChosen} hidden />
        <button type="button" className="portfolio-upload-btn" onClick={() => fileInput.current?.click()}>
          {pendingCount ? `Pilih foto lagi (${pendingCount} menunggu)` : 'Pilih foto untuk diunggah'}
        </button>
        <span className="portfolio-upload-note">Setelah memilih, Anda bisa menggeser dan memperbesar tiap foto sebelum diunggah.</span>
      </div>

      {!!form.images.length && (
        <>
          <div className="portfolio-photo-list">
            {form.images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`portfolio-photo-item${dragIndex === index ? ' dragging' : ''}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => { moveImage(dragIndex, index); setDragIndex(null); }}
              >
                <span className="portfolio-photo-order">{index + 1}</span>
                <img src={resolveUrl(image)} alt={`Foto ${index + 1}`} />
                <div className="portfolio-photo-tools">
                  <button type="button" onClick={() => recropExisting(index)}>Atur ulang</button>
                  <button type="button" onClick={() => moveImage(index, index - 1)} disabled={index === 0}>←</button>
                  <button type="button" onClick={() => moveImage(index, index + 1)} disabled={index === form.images.length - 1}>→</button>
                  <button type="button" onClick={() => moveImage(index, 0)} disabled={index === 0}>Jadikan utama</button>
                  <button type="button" className="portfolio-photo-remove" onClick={() => removeImage(index)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
          <p className="portfolio-photo-tip">Tarik kartu untuk mengubah urutan. Ubah posisi gambar dengan "Atur ulang", lalu simpan konten.</p>
        </>
      )}

      {kind === 'novel' && <div className="portfolio-extra-fields"><label>Jumlah halaman<input value={form.metadata.pages || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, pages: e.target.value } })} /></label><label>ISBN<input value={form.metadata.isbn || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, isbn: e.target.value } })} /></label><label>Penerbit<input value={form.metadata.publisher || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, publisher: e.target.value } })} /></label><label>Tautan pemesanan<input value={form.metadata.order_url || ''} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, order_url: e.target.value } })} /></label></div>}
      <label>Lagu pengantar (opsional)<input value={form.music_url || ''} placeholder="Kosongkan untuk memakai lagu bawaan, atau isi URL audio" onChange={(e) => setForm({ ...form, music_url: e.target.value })} /></label>
      <label>Video cuplikan (opsional)<input value={form.intro_video || ''} placeholder="/video/teaser-lamaran-16x9.mp4 atau URL video" onChange={(e) => setForm({ ...form, intro_video: e.target.value })} /></label>
      <label className="portfolio-publish"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Tampilkan di portfolio publik</label>
      <div className="portfolio-form-actions"><button className="admin-card-btn admin-card-btn-active" disabled={busy}>{busy ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan konten'}</button>{editing && <button type="button" onClick={cancelEdit}>Batal</button>}</div>{notice && <p role="status">{notice}</p>}
    </form>

    <h3>Konten tersimpan</h3><div className="portfolio-item-list">{items.map((item) => <article key={item.content_id}><div><strong>{item.title}</strong><span>{item.published ? 'Terbit' : 'Draf'} · {item.category} · {(item.images || []).length} foto</span></div><div className="portfolio-item-actions"><button onClick={() => edit(item)}>Edit</button><button onClick={() => remove(item)}>Hapus</button></div></article>)}{!items.length && <p>Belum ada konten pada kategori ini.</p>}</div>

    {cropper && (
      <ImageCropper
        src={cropper.src}
        fileName={cropper.fileName}
        title={cropper.index === null || cropper.index === undefined ? 'Atur foto sebelum diunggah' : 'Atur ulang foto'}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        onSkip={handleCropSkip}
      />
    )}
  </section>;
};

export default PortfolioManager;