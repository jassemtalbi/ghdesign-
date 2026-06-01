'use client';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

export default function NewArrivals() {
  const ref = useRef<HTMLElement>(null);
  const [added, setAdded] = useState<number | null>(null);
  const { addItem } = useCart();
  const { articles } = useAdmin();

  const published = articles.filter(a => a.published);
  const newest = [...published].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [articles]);

  const handleAdd = (p: typeof newest[0]) => {
    addItem({ id: p.id, name: p.name, category: p.category, price: p.price, priceNum: p.priceNum, tag: p.tag, image: p.image });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1600);
  };

  if (newest.length === 0) return null;

  return (
    <section id="new" ref={ref} style={{ padding: 'clamp(64px,10vw,120px) clamp(16px,5vw,64px)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(32px,5vw,56px)', gap: '12px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.52em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>Fresh In</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem,5vw,3.2rem)', color: 'var(--foreground)', lineHeight: 1.1 }}>New Arrivals</h2>
          </div>
          <a href="#" className="view-all" style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', cursor: 'none', transition: 'color .3s' }}>
            Voir tout →
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(16px,2.5vw,28px)' }}>
          {newest.map((item, i) => (
            <div key={item.id} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <div style={{ position: 'relative', overflow: 'hidden', background: '#0f0c07' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .85s cubic-bezier(.22,1,.36,1)', display: 'block' }}
                    className="nimg"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.15) 50%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '14px', right: '14px', padding: '4px 11px', background: 'var(--accent)' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 600, color: '#0a0a0a' }}>{item.tag}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 18px 20px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(245,240,235,.5)', marginBottom: '4px' }}>{item.category}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.15rem', color: 'var(--foreground)', letterSpacing: '.04em', lineHeight: 1.2 }}>{item.name}</h3>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '.82rem', color: 'var(--accent)', flexShrink: 0 }}>{item.price}</span>
                    </div>
                    <button onClick={() => handleAdd(item)}
                      style={{
                        width: '100%', padding: '11px',
                        background: added === item.id ? 'var(--accent)' : 'rgba(10,10,10,.55)',
                        border: `1px solid ${added === item.id ? 'var(--accent)' : 'rgba(201,169,110,.4)'}`,
                        backdropFilter: 'blur(10px)',
                        fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.22em', textTransform: 'uppercase',
                        color: added === item.id ? '#0a0a0a' : 'var(--foreground)',
                        cursor: 'none', transition: 'all .3s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }} className="nadd">
                      {added === item.id
                        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Ajouté au panier</>
                        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Ajouter au panier</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .nimg:hover, div:hover .nimg { transform: scale(1.07); }
        .nadd:hover { background: rgba(201,169,110,.18) !important; border-color: var(--accent) !important; }
        .view-all:hover { color: var(--foreground) !important; }
      `}</style>
    </section>
  );
}
