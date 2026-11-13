import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './ImageCropper.css';

const ASPECTS = {
  '4:3': 4 / 3,
  '1:1': 1,
  '16:9': 16 / 9,
  asli: null,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const viewportHeight = () => (typeof window === 'undefined' ? 900 : window.innerHeight);
const viewportWidth = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);

const ImageCropper = ({ src, title = 'Atur gambar', fileName = 'gambar', onCancel, onConfirm, onSkip }) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [aspectKey, setAspectKey] = useState('4:3');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [viewport, setViewport] = useState({ w: viewportWidth(), h: viewportHeight() });
  const dragState = useRef(null);

  useEffect(() => {
    const onResize = () => setViewport({ w: viewportWidth(), h: viewportHeight() });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    setError('');
    setImage(null);
    const loader = new Image();
    loader.onload = () => {
      if (active) setImage(loader);
    };
    loader.onerror = () => {
      if (active) setError('Gambar tidak dapat dibaca. Anda tetap bisa mengunggahnya tanpa diubah.');
    };
    loader.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  const ratio = ASPECTS[aspectKey] || (image ? image.naturalWidth / image.naturalHeight : 4 / 3);
  const maxWidth = Math.max(220, Math.min(440, viewport.w - 72));
  const maxHeight = Math.max(180, Math.round(viewport.h * 0.42));
  let frameWidth = maxWidth;
  let frameHeight = Math.round(frameWidth / ratio);
  if (frameHeight > maxHeight) {
    frameHeight = maxHeight;
    frameWidth = Math.round(frameHeight * ratio);
  }
  const frame = { w: frameWidth, h: frameHeight };

  const metrics = useCallback(() => {
    if (!image) return null;
    const base = Math.max(frame.w / image.naturalWidth, frame.h / image.naturalHeight);
    const scale = base * zoom;
    return { dw: image.naturalWidth * scale, dh: image.naturalHeight * scale };
  }, [image, frame.w, frame.h, zoom]);

  const clampPos = useCallback(
    (point, size) => ({
      x: clamp(point.x, frame.w - size.dw, 0),
      y: clamp(point.y, frame.h - size.dh, 0),
    }),
    [frame.w, frame.h]
  );

  useEffect(() => {
    const size = metrics();
    if (!size) return;
    setPos({ x: (frame.w - size.dw) / 2, y: (frame.h - size.dh) / 2 });
  }, [image, frame.w, frame.h]);

  const applyZoom = (nextZoom) => {
    if (!image) {
      setZoom(nextZoom);
      return;
    }
    const base = Math.max(frame.w / image.naturalWidth, frame.h / image.naturalHeight);
    const oldW = image.naturalWidth * base * zoom;
    const oldH = image.naturalHeight * base * zoom;
    const newW = image.naturalWidth * base * nextZoom;
    const newH = image.naturalHeight * base * nextZoom;
    const centerX = pos.x + oldW / 2;
    const centerY = pos.y + oldH / 2;
    setZoom(nextZoom);
    setPos(clampPos({ x: centerX - newW / 2, y: centerY - newH / 2 }, { dw: newW, dh: newH }));
  };

  const handlePointerDown = (event) => {
    if (!image) return;
    dragState.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // pointer capture tidak tersedia
    }
  };

  const handlePointerMove = (event) => {
    const drag = dragState.current;
    if (!drag) return;
    const size = metrics();
    if (!size) return;
    setPos(
      clampPos(
        {
          x: drag.originX + (event.clientX - drag.pointerX),
          y: drag.originY + (event.clientY - drag.pointerY),
        },
        size
      )
    );
  };

  const stopDrag = (event) => {
    dragState.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer sudah dilepas
    }
  };

  const runTask = async (task) => {
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (taskError) {
      setError(taskError?.message || 'Gambar gagal diunggah. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const uploadOriginal = () => runTask(async () => {
    if (onSkip) await onSkip();
  });

  const handleConfirm = () => {
    const size = metrics();
    if (!image || !size) {
      uploadOriginal();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outScale = Math.min(2, 2400 / Math.max(frame.w, frame.h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(frame.w * outScale));
      canvas.height = Math.max(1, Math.round(frame.h * outScale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        pos.x * outScale,
        pos.y * outScale,
        size.dw * outScale,
        size.dh * outScale
      );
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setBusy(false);
            uploadOriginal();
            return;
          }
          const base = String(fileName || 'gambar').replace(/\.[^.]+$/, '');
          const file = new File([blob], `${base}-crop.jpg`, { type: 'image/jpeg' });
          runTask(async () => {
            await onConfirm(file);
          });
        },
        'image/jpeg',
        0.92
      );
    } catch {
      setBusy(false);
      uploadOriginal();
    }
  };

  const size = metrics();

  return createPortal(
    <div className="cropper-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="cropper-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cropper-head">
          <div>
            <span className="cropper-eyebrow">SEBELUM DIUNGGAH</span>
            <h3 className="cropper-title">{title}</h3>
          </div>
          <button type="button" className="cropper-close" onClick={onCancel} aria-label="Tutup">
            ×
          </button>
        </header>

        <div className="cropper-stage">
          <div
            className="cropper-frame"
            style={{ width: frame.w, height: frame.h }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
          >
            {size ? (
              <img
                className="cropper-image"
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: size.dw,
                  height: size.dh,
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
              />
            ) : (
              <p className="cropper-loading">Menyiapkan pratinjau…</p>
            )}
            <div className="cropper-grid" />
          </div>
        </div>

        <div className="cropper-toolbar">
          <div className="cropper-aspects">
            {Object.keys(ASPECTS).map((key) => (
              <button
                key={key}
                type="button"
                className={aspectKey === key ? 'active' : ''}
                onClick={() => setAspectKey(key)}
              >
                {key === 'asli' ? 'Asli' : key}
              </button>
            ))}
          </div>
          <label className="cropper-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => applyZoom(Number(event.target.value))}
            />
            <span className="cropper-zoom-value">{zoom.toFixed(2)}×</span>
          </label>
        </div>

        <p className="cropper-hint">
          Geser gambar untuk mengatur posisi, lalu konfirmasi.
        </p>

        {error && (
          <p className="cropper-error" role="alert">
            {error}
          </p>
        )}

        <footer className="cropper-actions">
          <button type="button" className="cropper-cancel" onClick={onCancel} disabled={busy}>
            Batal
          </button>
          <button type="button" className="cropper-skip" onClick={uploadOriginal} disabled={busy}>
            Unggah tanpa diubah
          </button>
          <button type="button" className="cropper-confirm" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Mengunggah…' : 'Gunakan gambar ini'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropper;