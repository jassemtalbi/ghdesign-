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

const emptyForm = { name: '', category: 'Traditional', price: '', priceNum: 0, tag: 'New', image: '', published: true };

export default function AdminArticles() {
  const { articles, addArticle, updateArticle, deleteArticle, togglePublish } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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
    setForm({ name: a.name, category: a.category, price: a.price, priceNum: a.priceNum, tag: a.tag, image: a.image, published: a.published });
    setErrors({});
    setShowForm(true);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, image: 'Fichier invalide — choisir une image (JPG, PNG, WEBP)' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setForm(p => ({ ...p, image: result }));
      setErrors(p => ({ ...p, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Requis';
    if (!form.price.trim()) e.price = 'Requis';
    if (!form.image) e.image = 'Veuillez choisir une image';
    const num = parseFloat(form.price.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) e.price = 'Prix invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const num = Math.round(parseFloat(form.price.replace(/[^0-9.]/g, '')));
    const formatted = `${num.toLocaleString('fr-FR').replace(/\s/g, ',')} TND`;
    if (editing) {
      await updateArticle(editing.id, { ...form, priceNum: num, price: formatted });
    } else {
      await addArticle({ ...form, priceNum: num, price: formatted });
    }
    setShowForm(false);
  };

  const inp = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 13px', background: '#111', border: `1px solid ${err ? '#c05050' : '#222018'}`,
    color: '#f5f0eb', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', borderRadius: 0,
  });

  return (
    <div>
      <style>{mobileStyles}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="filter-tabs" style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', fontSize: '8px', letterSpacing: '.2em', textTransform: 'uppercase',
                background: filter === f ? '#c9a96e' : '#0d0d0d', color: filter === f ? '#0a0a0a' : '#6b6560',
                border: `1px solid ${filter === f ? '#c9a96e' : '#1a1a14'}`, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {f === 'all' ? `Tous (${articles.length})` : f === 'published' ? `Publiés (${articles.filter(a => a.published).length})` : `Brouillons (${articles.filter(a => !a.published).length})`}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          style={{ padding: '10px 22px', background: '#c9a96e', border: 'none', color: '#0a0a0a', fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Nouvel article
        </button>
      </div>

      {/* Grid */}
      <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filtered.map(a => (
          <div key={a.id} style={{ background: '#0d0d0d', border: '1px solid #1a1a14', overflow: 'hidden', transition: 'border-color .2s' }}>
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '3/4', background: '#111', overflow: 'hidden' }}>
              {a.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <span style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: a.published ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
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
                <span style={{ fontSize: '8px', letterSpacing: '.2em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 600 }}>{a.tag}</span>
              </div>

              {/* Name + price over image */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                <p style={{ fontFamily: 'Georgia, serif', color: '#f5f0eb', fontSize: '1.05rem', marginBottom: '3px', lineHeight: 1.2 }}>{a.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,240,235,.45)' }}>{a.category}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '.9rem', color: '#c9a96e' }}>{a.price}</span>
                </div>
              </div>
            </div>

            {/* Actions bar */}
            <div style={{ padding: '10px 12px', display: 'flex', gap: '6px', alignItems: 'center', borderTop: '1px solid #1a1a14' }}>
              <button onClick={() => togglePublish(a.id, a.published)}
                style={{
                  flex: 1, padding: '7px 10px', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase',
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
                style={{ padding: '7px 10px', background: 'none', border: '1px solid #1a1a14', color: '#6b6560', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {deleteConfirm === a.id ? (
                <button onClick={() => { deleteArticle(a.id); setDeleteConfirm(null); }} title="Confirmer"
                  style={{ padding: '7px 10px', background: '#7f1d1d', border: '1px solid #c05050', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', letterSpacing: '.1em', fontFamily: 'inherit' }}>
                  Oui
                </button>
              ) : (
                <button onClick={() => setDeleteConfirm(a.id)} title="Supprimer"
                  style={{ padding: '7px 10px', background: 'none', border: '1px solid #1a1a14', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 50 }} />
          <div className="article-modal" style={{
            position: 'fixed', zIndex: 51, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 'min(560px, 96vw)', maxHeight: '90vh', background: '#0d0d0d', border: '1px solid #1a1a14',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #1a1a14', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#f5f0eb', fontWeight: 300 }}>
                {editing ? "Modifier l'article" : 'Nouvel article'}
              </p>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#6b6560', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>

              {/* Image upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.image ? '#e07070' : '#6b6560', marginBottom: '8px' }}>
                  Image *
                </label>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  style={{
                    border: `2px dashed ${errors.image ? '#c05050' : dragging ? '#c9a96e' : '#2a2520'}`,
                    background: dragging ? 'rgba(201,169,110,.05)' : '#111',
                    cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: form.image ? '0' : '140px', padding: form.image ? '0' : '24px',
                    position: 'relative', overflow: 'hidden',
                  }}>

                  {form.image ? (
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                        <p style={{ fontSize: '11px', color: '#f5f0eb', letterSpacing: '.2em', textTransform: 'uppercase' }}>Changer l'image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b6560" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p style={{ fontSize: '12px', color: '#6b6560', marginBottom: '4px' }}>Glissez une image ici</p>
                      <p style={{ fontSize: '10px', color: '#444' }}>ou cliquez pour choisir depuis votre PC</p>
                      <p style={{ fontSize: '9px', color: '#333', marginTop: '6px' }}>JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={onFileInput} style={{ display: 'none' }} />
                {errors.image && <p style={{ fontSize: '10px', color: '#e07070', marginTop: '4px' }}>{errors.image}</p>}

                {form.image && (
                  <button onClick={() => { setForm(p => ({ ...p, image: '' })); if (fileRef.current) fileRef.current.value = ''; }}
                    style={{ marginTop: '6px', fontSize: '9px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    ✕ Supprimer l'image
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.name ? '#e07070' : '#6b6560', marginBottom: '6px' }}>Nom *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }} placeholder="Nom de l'article" style={inp(!!errors.name)} />
                  {errors.name && <p style={{ fontSize: '10px', color: '#e07070', marginTop: '3px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: errors.price ? '#e07070' : '#6b6560', marginBottom: '6px' }}>Prix (TND) *</label>
                  <input value={form.price} onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(p => ({ ...p, price: '' })); }} placeholder="ex: 79000" style={inp(!!errors.price)} />
                  {errors.price && <p style={{ fontSize: '10px', color: '#e07070', marginTop: '3px' }}>{errors.price}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '6px' }}>Catégorie</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp(), appearance: 'none' as const }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '6px' }}>Tag</label>
                  <select value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} style={{ ...inp(), appearance: 'none' as const }}>
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  style={{ width: '14px', height: '14px', accentColor: '#c9a96e', cursor: 'pointer' }} />
                <label htmlFor="pub" style={{ fontSize: '11px', color: '#6b6560', cursor: 'pointer' }}>Publier immédiatement sur la boutique</label>
              </div>
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: '16px 22px', borderTop: '1px solid #1a1a14', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 22px', background: 'none', border: '1px solid #1a1a14', color: '#6b6560', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
              <button onClick={handleSave} style={{ padding: '11px 28px', background: '#c9a96e', border: 'none', color: '#0a0a0a', fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {editing ? 'Enregistrer' : "Créer l'article"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
