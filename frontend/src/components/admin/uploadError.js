const STATUS_MESSAGES = {
  400: 'Berkas tidak sesuai. Pastikan berupa gambar (JPG, PNG, WEBP, atau GIF).',
  401: 'Sesi Anda sudah berakhir. Silakan masuk kembali, lalu ulangi unggahan.',
  403: 'Akses ditolak. Pastikan origin frontend (localhost:3001) terdaftar pada FRONTEND_ORIGINS di backend/.env.',
  413: 'Ukuran gambar terlalu besar untuk diunggah.',
  429: 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.',
  503: 'Unggahan tidak tersedia. Periksa konfigurasi backend.',
};

/**
 * Ubah respons gagal menjadi pesan yang bisa ditindaklanjuti.
 * Menampilkan detail dari backend bila ada, dan mengarahkan ke /login saat sesi berakhir.
 */
export const describeUploadError = async (response, fallback = 'Gambar gagal diunggah.') => {
  let detail = '';
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') detail = data.detail;
  } catch {
    detail = '';
  }

  const known = STATUS_MESSAGES[response.status];

  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
    return known || 'Sesi Anda sudah berakhir. Silakan masuk kembali.';
  }

  if (detail && known && !known.includes(detail)) return `${known} (${detail})`;
  return detail || known || fallback;
};

export default describeUploadError;