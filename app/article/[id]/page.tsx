'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin, type Article } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Cursor from '../../components/Cursor';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { articles, loading } = useAdmin();
  const { addItem, setCartOpen } = useCart();

  const [article, setArticle] = useState<Article | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!loading) {
      const found = articles.find(a => a.id === id && a.published);
      if (found) setArticle(found);
      else if (articles.length > 0) router.replace('/');
    }
  }, [articles, loading, id, router]);

  if (loading || !article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="animate-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  const allImages = article.images?.length > 0 ? article.images : [article.image];
  const hasSizes = article.sizes?.length > 0;
  const hasColors = article.colors?.length > 0;

  const handleAdd = () => {
    addItem({
      id: article.id, name: article.name, category: article.category,
      price: article.price, priceNum: article.priceNum, tag: article.tag,
      image: article.image, size: size || undefined, color: color || undefined,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); setCartOpen(true); }, 800);
  };

  return (
    <>
      <Cursor />
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--background)', paddingTop: '90px', paddingBottom: 'clamp(80px,12vw,0px)' }} className="article-main">

        {/* Back */}
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '24px clamp(16px,5vw,64px) 0' }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 400, transition: 'color .3s' }}
            className="back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Retour
          </button>
        </div>

        {/* Product layout */}
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,5vw,64px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(32px,6vw,72px)', alignItems: 'start' }}>

            {/* ── LEFT: Image gallery ── */}
            <div>
              {/* Main image */}
              <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--surface)', marginBottom: '12px' }}>
                <Image src={allImages[activeImg]} alt={article.name} fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  preload loading="eager" />

                {/* Tag */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '5px 13px', background: 'rgba(8,8,8,.72)', border: '1px solid rgba(184,146,74,.35)', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 400 }}>{article.tag}</span>
                </div>

                {/* Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'rgba(250,249,247,.85)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'all .2s' }} className="arrow-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'rgba(250,249,247,.85)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'all .2s' }} className="arrow-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {allImages.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImg(idx)}
                      style={{ position: 'relative', width: '72px', height: '90px', padding: 0, border: `2px solid ${activeImg === idx ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', overflow: 'hidden', background: 'var(--surface)', flexShrink: 0, transition: 'border-color .2s' }}>
                      <Image src={img} alt={`${article.name} ${idx + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} quality={60} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Category + Name + Price */}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px', fontWeight: 400 }}>{article.category}</p>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--foreground)', lineHeight: 1.1, marginBottom: '16px' }}>{article.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>{article.price}</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Size selector */}
              {hasSizes && (
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', fontWeight: 700 }}>
                    Taille {size && <span style={{ color: 'var(--accent)', fontWeight: 400 }}>· {size}</span>}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {article.sizes.map(s => (
                      <button key={s} onClick={() => setSize(size === s ? '' : s)}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '9px 18px', cursor: 'pointer',
                          background: size === s ? 'var(--accent)' : 'none',
                          border: `1px solid ${size === s ? 'var(--accent)' : 'var(--border)'}`,
                          color: size === s ? 'var(--background)' : 'var(--muted)',
                          fontWeight: size === s ? 700 : 400, transition: 'all .2s',
                        }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color selector */}
              {hasColors && (
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', fontWeight: 700 }}>
                    Couleur {color && <span style={{ color: 'var(--accent)', fontWeight: 400 }}>· {color}</span>}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {article.colors.map(c => (
                      <button key={c} onClick={() => setColor(color === c ? '' : c)}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '9px 18px', cursor: 'pointer',
                          background: color === c ? 'rgba(184,146,74,.1)' : 'none',
                          border: `1px solid ${color === c ? 'var(--accent)' : 'var(--border)'}`,
                          color: color === c ? 'var(--accent)' : 'var(--muted)',
                          transition: 'all .2s',
                        }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart */}
              <button onClick={handleAdd}
                style={{
                  width: '100%', padding: '18px', cursor: 'pointer',
                  background: added ? 'var(--foreground)' : 'var(--accent)',
                  border: 'none', color: 'var(--background)',
                  fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.3em',
                  textTransform: 'uppercase', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'background .3s',
                }}>
                {added
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Ajouté — ouverture du panier</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Ajouter au panier</>
                }
              </button>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['Catégorie', article.category],
                  ['Collection', article.tag],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 400 }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--foreground)', fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
      {/* Sticky mobile bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        padding: '12px 16px', background: 'var(--background)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '10px', alignItems: 'center',
      }} className="mobile-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.name}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>{article.price}</p>
        </div>
        <button onClick={handleAdd} className="btn-gold"
          style={{ flexShrink: 0, padding: '13px 22px', fontSize: '9px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {added
            ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Ajouté</>
            : <>+ Panier</>
          }
        </button>
      </div>

      <Footer />

      <style jsx>{`
        .back-btn:hover { color: var(--foreground) !important; }
        .arrow-btn:hover { border-color: var(--accent) !important; }
        .mobile-bar { display: none !important; }
        @media (max-width: 768px) {
          .mobile-bar { display: flex !important; }
          .article-main { padding-bottom: 80px !important; }
        }
      `}</style>
    </>
  );
}
