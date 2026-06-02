'use client';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

const tabs = ['All', 'New', 'Traditional', 'Evening', 'Casual Chic', 'Modest'];

export default function Collections() {
  const ref = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [added, setAdded] = useState<string | null>(null);
  // per-card selected size & color: { [articleId]: { size, color } }
  const [selections, setSelections] = useState<Record<string, { size: string; color: string }>>({});
  const { addItem } = useCart();
  const { articles, loading } = useAdmin();

  const published = articles.filter(a => a.published);

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') ?? [];
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [articles, activeTab]);

  const filtered = activeTab === 0
    ? published
    : activeTab === 1
    ? [...published].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
    : published.filter(p => p.category.toLowerCase().includes(tabs[activeTab].toLowerCase()));

  const getSel = (id: string) => selections[id] || { size: '', color: '' };

  const setSel = (id: string, key: 'size' | 'color', val: string) =>
    setSelections(prev => ({ ...prev, [id]: { ...getSel(id), [key]: val } }));

  const handleAdd = (p: typeof published[0]) => {
    const { size, color } = getSel(p.id);
    const cartKey = `${p.id}-${size}-${color}`;
    addItem({ id: p.id, name: p.name, category: p.category, price: p.price, priceNum: p.priceNum, tag: p.tag, image: p.image, size: size || undefined, color: color || undefined });
    setAdded(cartKey);
    setTimeout(() => setAdded(null), 1600);
  };

  return (
    <section id="collections" ref={ref} style={{ padding: 'clamp(64px,10vw,120px) clamp(16px,5vw,64px)', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 'clamp(36px,6vw,64px)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.52em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>Curated for You</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2rem,6vw,4.2rem)', color: 'var(--foreground)', lineHeight: 1.08, marginBottom: '22px' }}>The Collection</h2>
          <div className="divider" />
        </div>

        {/* Filter tabs */}
        <div className="reveal" style={{ marginBottom: 'clamp(28px,4vw,48px)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', gap: 'clamp(18px,3vw,36px)', justifyContent: 'center', minWidth: 'max-content', padding: '0 4px 4px' }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 400,
                  color: activeTab === i ? 'var(--accent)' : 'var(--muted)',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  borderBottom: `1px solid ${activeTab === i ? 'var(--accent)' : 'transparent'}`,
                  paddingBottom: '5px', background: 'none', cursor: 'none', transition: 'color .3s',
                }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'clamp(48px,8vw,80px) 0' }}>
            <div style={{ display: 'inline-block', border: '1px solid var(--border)', padding: 'clamp(32px,5vw,56px) clamp(32px,8vw,96px)', background: 'var(--surface)' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--accent)', margin: '0 auto 24px' }} />
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.2rem,3vw,1.6rem)', color: 'var(--foreground)', marginBottom: '12px' }}>
                Aucun article disponible pour le moment
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.35em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Revenez bientôt
              </p>
              <div style={{ width: '40px', height: '1px', background: 'var(--border)', margin: '24px auto 0' }} />
            </div>
          </div>
        )}

        {/* Product grid */}
        {filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px,2vw,24px)' }}>
            {filtered.map((p, i) => {
              const sel = getSel(p.id);
              const cartKey = `${p.id}-${sel.size}-${sel.color}`;
              const isAdded = added === cartKey;
              const hasSizes = p.sizes?.length > 0;
              const hasColors = p.colors?.length > 0;

              return (
                <div key={p.id} style={{ transitionDelay: `${i * 80}ms` }}>
                  <div style={{ position: 'relative', background: 'var(--surface)', overflow: 'hidden' }}>

                    {/* Image */}
                    <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .85s cubic-bezier(.22,1,.36,1)', display: 'block' }}
                        className="pimg"
                      />
                      <div className="card-overlay" />
                      <div style={{ position: 'absolute', top: '14px', left: '14px', padding: '4px 11px', background: 'rgba(8,8,8,.72)', border: '1px solid rgba(201,169,110,.35)', backdropFilter: 'blur(8px)' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--accent)' }}>{p.tag}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '15px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>{p.category}</p>
                          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.05rem', color: 'var(--foreground)', letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                        </div>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '.82rem', fontWeight: 300, color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>{p.price}</span>
                      </div>

                      {/* Size selector */}
                      {hasSizes && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px' }}>
                            Taille {sel.size && <span style={{ color: 'var(--accent)' }}>· {sel.size}</span>}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {p.sizes.map(s => (
                              <button key={s} onClick={() => setSel(p.id, 'size', sel.size === s ? '' : s)}
                                style={{
                                  fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '3px 9px',
                                  background: sel.size === s ? 'var(--accent)' : 'none',
                                  border: `1px solid ${sel.size === s ? 'var(--accent)' : 'var(--border)'}`,
                                  color: sel.size === s ? '#0a0a0a' : 'var(--muted)',
                                  cursor: 'none', transition: 'all .2s', fontWeight: sel.size === s ? 700 : 400,
                                }}>{s}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color selector */}
                      {hasColors && (
                        <div style={{ marginBottom: '10px' }}>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px' }}>
                            Couleur {sel.color && <span style={{ color: 'var(--accent)' }}>· {sel.color}</span>}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {p.colors.map(c => (
                              <button key={c} onClick={() => setSel(p.id, 'color', sel.color === c ? '' : c)}
                                style={{
                                  fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '3px 10px',
                                  background: sel.color === c ? 'rgba(201,169,110,.12)' : 'none',
                                  border: `1px solid ${sel.color === c ? 'var(--accent)' : 'var(--border)'}`,
                                  color: sel.color === c ? 'var(--accent)' : 'var(--muted)',
                                  cursor: 'none', transition: 'all .2s',
                                }}>{c}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add to cart */}
                      <button onClick={() => handleAdd(p)}
                        style={{
                          width: '100%', padding: '9px',
                          background: isAdded ? 'rgba(201,169,110,.12)' : 'none',
                          border: `1px solid ${isAdded ? 'var(--accent)' : 'var(--border)'}`,
                          fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase',
                          color: isAdded ? 'var(--accent)' : 'var(--muted)',
                          cursor: 'none', transition: 'all .3s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                        }} className="qadd">
                        {isAdded
                          ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Ajouté au panier</>
                          : <>+ Ajouter au panier</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .pimg:hover, div:hover .pimg { transform: scale(1.07); }
        .qadd:hover { border-color: var(--accent) !important; color: var(--foreground) !important; }
      `}</style>
    </section>
  );
}
