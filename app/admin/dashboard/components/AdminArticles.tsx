'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAdmin, type Article } from '../../../context/AdminContext';

const mobileStyles = `
  @media (max-width: 768px) {
    .articles-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .article-modal { width: 100% !important; height: 100% !important; max-height: 100vh !important; top: 0 !important; left: 0 !important; transform: none !important; border-radius: 0 !important; }
    .filter-tabs { overflow-x: auto !important; scrollbar-width: none !important; }
    .filter-tabs > div { min-width: max-content !important; }
  }
  @media (max-width: 480px) {
    .articles-grid { grid-template-columns: 1fr !important; }
  }
`;

const CATEGORIES = ['Traditional', 'Evening', 'Casual Chic', 'Modest'];
const TAGS = ['Bestseller', 'New', 'Limited', 'Exclusive', 'Just Arrived', 'Sale'];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
const PRESET_COLORS = ['Noir', 'Blanc', 'Beige', 'Doré', 'Rouge', 'Bleu', 'Vert', 'Rose', 'Bordeaux', 'Gris'];

const emptyForm = { name: '', category: 'Traditional', price: '', priceNum: 0, tag: 'New', image: '', images: [] as string[], sizes: [] as string[], colors: [] as string[], colorInput: '', description: '', published: true };

export default function AdminArticles() {
  const { articles, addArticle, updateArticle, deleteArticle, togglePublish } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activeImg, setActiveImg] = useState<Record<string, number>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = articles.filter(a =>
    filter === 'all' ? true : filter === 'published' ? a.published : !a.published
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ name: a.name, category: a.category, price: a.price, priceNum: a.priceNum, tag: a.tag, image: a.image, images: a.images || [], sizes: a.sizes || [], colors: a.colors || [], colorInput: '', description: a.description || '', published: a.published });
    setErrors({});
    setShowForm(true);
  };

  const [uploading, setUploading] = useState(false);

  const uploadOne = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: e.target?.result }),
          });
          const { url } = await res.json();
          resolve(url);
        } catch { resolve(null); }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const urls = (await Promise.all(Array.from(files).map(uploadOne))).filter(Boolean) as string[];
    setForm(p => {
      const merged = [...p.images, ...urls.filter(u => !p.images.includes(u))];
      return { ...p, images: merged, image: p.image || merged[0] || '' };
    });
    setErrors(p => ({ ...p, image: '' }));
    setUploading(false);
  };

  const handleFile = (file: File) => handleFiles({ length: 1, 0: file, item: () => file, [Symbol.iterator]: [][Symbol.iterator] } as unknown as FileList);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Requis';
    if (!form.price.trim()) e.price = 'Requis';
    if (form.images.length === 0 && !form.image) e.image = 'Veuillez choisir une image';
    const num = parseFloat(form.price.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) e.price = 'Prix invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const num = Math.round(parseFloat(form.price.replace(/[^0-9.]/g, '')));
    const formatted = `${num.toLocaleString('fr-FR').replace(/\s/g, ',')} TND`;
    const { colorInput, ...rest } = form;
    const finalImages = form.images.length > 0 ? form.images : (form.image ? [form.image] : []);
    const payload = { ...rest, priceNum: num, price: formatted, image: finalImages[0] || '', images: finalImages, description: form.description || '' };
    if (editing) {
      await updateArticle(editing.id, payload);
    } else {
      await addArticle(payload);
    }
    setShowForm(false);
  };

  const inp = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 13px', background: 'var(--surface)', border: `1px solid ${err ? '#c05050' : 'var(--border)'}`,
    color: 'var(--foreground)', fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', borderRadius: 0,
  });

  return (
    <div>
      <style>{mobileStyles}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="filter-tabs" style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase',
                background: filter === f ? 'var(--accent)' : 'var(--surface)', color: filter === f ? 'var(--background)' : 'var(--muted)',
                border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {f === 'all' ? `Tous (${articles.length})` : f === 'published' ? `Publiés (${articles.filter(a => a.published).length})` : `Brouillons (${articles.filter(a => !a.published).length})`}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          style={{ padding: '10px 22px', background: 'var(--accent)', border: 'none', color: 'var(--background)', fontSize: '12px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Nouvel article
        </button>
      </div>

      {/* Grid */}
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', paddingRight: '4px' }}>
      <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filtered.map(a => (
          <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'border-color .2s' }}>
            {/* Image gallery */}
            {(() => {
              const imgs = a.images?.length > 0 ? a.images : (a.image ? [a.image] : []);
              const idx = activeImg[a.id] ?? 0;
              return (
            <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--surface)', overflow: 'hidden' }}>
              {imgs.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgs[idx]} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .25s' }} />
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(p => ({ ...p, [a.id]: (idx - 1 + imgs.length) % imgs.length })); }}
                    style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', width: '26px', height: '26px', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(p => ({ ...p, [a.id]: (idx + 1) % imgs.length })); }}
                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '26px', height: '26px', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 2 }}>
                    {imgs.map((_, i) => (
                      <div key={i} onClick={e => { e.stopPropagation(); setActiveImg(p => ({ ...p, [a.id]: i })); }}
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === idx ? 'var(--accent)' : 'rgba(255,255,255,.5)', cursor: 'pointer', transition: 'background .2s' }} />
                    ))}
                  </div>
                </>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.1) 55%, transparent 100%)' }} />

              {/* Published badge — top left */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px',
                background: a.published ? 'rgba(16,185,129,.18)' : 'rgba(245,158,11,.15)',
                border: `1px solid ${a.published ? '#10b98150' : '#f59e0b50'}`,
                backdropFilter: 'blur(6px)',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.published ? '#10b981' : '#f59e0b', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: a.published ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {a.published ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              {/* Tag badge — top right */}
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                padding: '4px 10px',
                background: 'rgba(201,169,110,.18)',
                border: '1px solid rgba(201,169,110,.4)',
                backdropFilter: 'blur(6px)',
              }}>
                <span style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>{a.tag}</span>
              </div>

              {/* Name + price over image */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', zIndex: 1 }}>
                <p style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1rem', marginBottom: '3px', lineHeight: 1.2 }}>{a.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,240,235,.45)' }}>{a.category}</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '.88rem', color: 'var(--accent)' }}>{a.price}</span>
                </div>
              </div>
            </div>
            );
            })()}

            {/* Actions bar */}
            <div style={{ padding: '10px 12px', display: 'flex', gap: '6px', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => togglePublish(a.id, a.published)}
                style={{
                  flex: 1, padding: '7px 10px', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                  background: a.published ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)',
                  border: `1px solid ${a.published ? '#f59e0b40' : '#10b98140'}`,
                  color: a.published ? '#f59e0b' : '#10b981',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                }}>
                {a.published
                  ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Dépublier</>
                  : <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Publier</>
                }
              </button>
              <button onClick={() => openEdit(a)} title="Modifier"
                style={{ padding: '7px 10px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {deleteConfirm === a.id ? (
                <button onClick={() => { deleteArticle(a.id); setDeleteConfirm(null); }} title="Confirmer"
                  style={{ padding: '7px 10px', background: '#7f1d1d', border: '1px solid #c05050', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', letterSpacing: '.1em', fontFamily: 'inherit' }}>
                  Oui
                </button>
              ) : (
                <button onClick={() => setDeleteConfirm(a.id)} title="Supprimer"
                  style={{ padding: '7px 10px', background: 'none', border: '1px solid var(--border)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Modal form */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 50 }} />
          <div className="article-modal" style={{
            position: 'fixed', zIndex: 51, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 'min(760px, 96vw)', maxHeight: '92vh', background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--foreground)', fontWeight: 700 }}>
                {editing ? "Modifier l'article" : 'Nouvel article'}
              </p>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>

              {/* Image upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.image ? '#e07070' : 'var(--muted)', marginBottom: '8px' }}>
                  Image *
                </label>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  style={{
                    border: `2px dashed ${errors.image ? '#c05050' : dragging ? 'var(--accent)' : 'var(--border)'}`,
                    background: dragging ? 'rgba(201,169,110,.05)' : 'var(--surface)',
                    cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: form.images.length === 0 ? '140px' : '60px', padding: '24px',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {uploading ? (
                    <p style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '.2em' }}>Envoi en cours...</p>
                  ) : form.images.length === 0 ? (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Glissez vos images ici</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>ou cliquez pour choisir depuis votre PC</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>JPG, PNG, WEBP — plusieurs images acceptées</p>
                    </>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>+ Cliquer pour ajouter d'autres images</p>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileInput} style={{ display: 'none' }} />
                {errors.image && <p style={{ fontSize: '11px', color: '#e07070', marginTop: '4px' }}>{errors.image}</p>}

                {/* Multi-image grid */}
                {form.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px', marginTop: '10px' }}>
                    {form.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '1', background: 'var(--surface)', overflow: 'hidden' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {idx === 0 && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2px 4px', background: 'var(--accent)', textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--background)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Principale</span>
                          </div>
                        )}
                        <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx), image: idx === 0 ? (p.images[1] || '') : p.image }))}
                          style={{ position: 'absolute', top: '3px', right: '3px', width: '18px', height: '18px', background: 'rgba(0,0,0,.75)', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', borderRadius: '50%' }}>×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()}
                      style={{ aspectRatio: '1', background: 'none', border: '2px dashed var(--border)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>+</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.name ? '#e07070' : 'var(--muted)', marginBottom: '6px' }}>Nom *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }} placeholder="Nom de l'article" style={inp(!!errors.name)} />
                  {errors.name && <p style={{ fontSize: '11px', color: '#e07070', marginTop: '3px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.price ? '#e07070' : 'var(--muted)', marginBottom: '6px' }}>Prix (TND) *</label>
                  <input value={form.price} onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(p => ({ ...p, price: '' })); }} placeholder="ex: 79000" style={inp(!!errors.price)} />
                  {errors.price && <p style={{ fontSize: '11px', color: '#e07070', marginTop: '3px' }}>{errors.price}</p>}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez l'article, le tissu, les détails de coupe..."
                  rows={3}
                  style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Catégorie</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp(), appearance: 'none' as const }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Tag</label>
                  <select value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} style={{ ...inp(), appearance: 'none' as const }}>
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Sizes */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Tailles disponibles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter(x => x !== s) : [...p.sizes, s] }))}
                      style={{
                        padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer',
                        background: form.sizes.includes(s) ? 'var(--accent)' : 'none',
                        border: `1px solid ${form.sizes.includes(s) ? 'var(--accent)' : 'var(--border)'}`,
                        color: form.sizes.includes(s) ? 'var(--background)' : 'var(--muted)',
                        fontWeight: form.sizes.includes(s) ? 700 : 400,
                        transition: 'all .2s',
                      }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Couleurs disponibles</label>
                {/* Preset color chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, colors: p.colors.includes(c) ? p.colors.filter(x => x !== c) : [...p.colors, c] }))}
                      style={{
                        padding: '5px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer',
                        background: form.colors.includes(c) ? 'rgba(201,169,110,.15)' : 'none',
                        border: `1px solid ${form.colors.includes(c) ? 'var(--accent)' : 'var(--border)'}`,
                        color: form.colors.includes(c) ? 'var(--accent)' : 'var(--muted)',
                        transition: 'all .2s',
                      }}>{c}</button>
                  ))}
                </div>
                {/* Custom color input */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input value={form.colorInput} onChange={e => setForm(p => ({ ...p, colorInput: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && form.colorInput.trim()) { e.preventDefault(); setForm(p => ({ ...p, colors: [...p.colors, p.colorInput.trim()], colorInput: '' })); }}}
                    placeholder="Autre couleur..." style={{ ...inp(), flex: 1, padding: '8px 12px' }} />
                  <button type="button" onClick={() => { if (form.colorInput.trim()) setForm(p => ({ ...p, colors: [...p.colors, p.colorInput.trim()], colorInput: '' })); }}
                    style={{ padding: '8px 14px', background: 'var(--accent)', border: 'none', color: 'var(--background)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                </div>
                {/* Selected colors */}
                {form.colors.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    {form.colors.map(c => (
                      <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(201,169,110,.1)', border: '1px solid rgba(201,169,110,.3)', fontSize: '11px', color: 'var(--accent)' }}>
                        {c}
                        <button type="button" onClick={() => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                <label htmlFor="pub" style={{ fontSize: '11px', color: 'var(--muted)', cursor: 'pointer' }}>Publier immédiatement sur la boutique</label>
              </div>
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 22px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12px', letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
              <button onClick={handleSave} style={{ padding: '11px 28px', background: 'var(--accent)', border: 'none', color: 'var(--background)', fontSize: '12px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {editing ? 'Enregistrer' : "Créer l'article"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
