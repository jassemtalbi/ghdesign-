'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

const links = [
  { label: 'Collections', href: '#collections' },
  { label: 'About',        href: '#about' },
  { label: 'Contact',      href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { items, removeItem, changeQty, cartOpen, setCartOpen, total } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen, menuOpen]);

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.priceNum * it.qty, 0), [items]);

  return (
    <>
      {/* ─────────────── NAV ─────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all .6s cubic-bezier(.22,1,.36,1)',
        padding: scrolled ? '14px 0' : '26px 0',
        background: scrolled ? 'rgba(250,249,247,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(184,146,74,.15)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>

          {/* Logo */}
          <a href="#" style={{ cursor: 'pointer', textDecoration: 'none', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '2rem', letterSpacing: '.1em', lineHeight: 1, color: 'var(--accent)' }}>GH</div>
            <div style={{ width: '100%', height: '1px', background: 'var(--accent)', margin: '3px 0 3px', opacity: .6 }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '7px', letterSpacing: '.7em', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Design</div>
          </a>

          {/* Center links */}
          <div className="hidden md:flex" style={{ gap: 'clamp(20px,2.5vw,38px)', alignItems: 'center' }}>
            {links.map(l => (
              <a key={l.label} href={l.href} className="navlink"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '.24em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', cursor: 'pointer', position: 'relative', paddingBottom: '3px', transition: 'color .3s' }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '16px' }}>

            {/* Cart button */}
            <button onClick={() => setCartOpen(true)} className="cart-trigger"
              style={{ position: 'relative', background: 'none', border: '1px solid rgba(184,146,74,.4)', cursor: 'pointer', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: '9px', transition: 'border-color .3s, background .3s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--foreground)' }}>
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--foreground)', fontWeight: 600 }}>Panier</span>
              {total > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', minWidth: '19px', height: '19px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--background)', padding: '0 4px' }}>
                  {total}
                </span>
              )}
            </button>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', padding: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {total > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--background)' }}>{total}</span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ display: 'block', width: '24px', height: '1px', background: 'var(--accent)', transition: 'transform .3s', transform: menuOpen ? 'rotate(45deg) translateY(3px)' : 'none' }} />
              <span style={{ display: 'block', width: '16px', height: '1px', background: 'var(--foreground)', transition: 'opacity .3s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '24px', height: '1px', background: 'var(--accent)', transition: 'transform .3s', transform: menuOpen ? 'rotate(-45deg) translateY(-3px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ─────────────── MOBILE MENU ─────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 45, background: 'var(--background)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'all' : 'none', transition: 'opacity .45s',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: .03, pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>GH</span>
        </div>
        {links.map((l, i) => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(2.2rem,8vw,3.5rem)',
              color: 'var(--foreground)', textDecoration: 'none', cursor: 'pointer', marginBottom: '20px',
              transform: menuOpen ? 'translateY(0)' : 'translateY(18px)',
              opacity: menuOpen ? 1 : 0,
              transition: `transform .55s ease ${i * 70}ms, opacity .55s ease ${i * 70}ms`,
            }}>
            {l.label}
          </a>
        ))}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'translateY(0)' : 'translateY(14px)', transition: 'all .5s ease .35s' }}>
          <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="btn-gold" style={{ cursor: 'pointer' }}>
            Panier {total > 0 ? `(${total})` : ''}
          </button>
        </div>
      </div>

      {/* ─────────────── CART DRAWER ─────────────── */}
      {/* Backdrop */}
      <div onClick={() => setCartOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
        opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? 'all' : 'none',
        transition: 'opacity .4s',
      }} />

      {/* Panel */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 61,
        width: 'min(440px,100vw)', background: 'var(--background)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.7rem', color: 'var(--foreground)', letterSpacing: '.05em', lineHeight: 1 }}>Mon Panier</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '.18em', color: 'var(--muted)', marginTop: '5px' }}>
              {total === 0 ? 'Vide' : `${total} article${total > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => setCartOpen(false)} className="close-x"
            style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '20px', lineHeight: 1, transition: 'all .3s' }}>
            ×
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '18px', padding: '40px 28px', textAlign: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'rgba(184,146,74,.2)' }}>
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--muted)' }}>Votre panier est vide</p>
              <button onClick={() => setCartOpen(false)} className="btn-gold" style={{ fontSize: '11px', cursor: 'pointer' }}>
                Découvrir la collection
              </button>
            </div>
          ) : (
            <div>
              {items.map(item => (
                <div key={item.cartKey} style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Image */}
                  <div style={{ width: '74px', height: '94px', flexShrink: 0, overflow: 'hidden', position: 'relative', background: 'var(--surface)' }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="74px" />
                  </div>
                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>{item.category}</p>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', letterSpacing: '.03em', lineHeight: 1.2 }}>{item.name}</h4>
                        {(item.size || item.color) && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                            {item.size && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '2px 7px', border: '1px solid var(--border)', color: 'var(--muted)', letterSpacing: '.1em' }}>{item.size}</span>}
                            {item.color && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '2px 7px', border: '1px solid rgba(184,146,74,.3)', color: 'var(--accent)', letterSpacing: '.1em' }}>{item.color}</span>}
                          </div>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.cartKey)} className="remove-x"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '14px', padding: '0', flexShrink: 0, transition: 'color .2s', lineHeight: 1 }}>✕</button>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.92rem', color: 'var(--accent)', margin: '10px 0' }}>{item.price}</p>
                    {/* Qty */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', width: 'fit-content' }}>
                      <button onClick={() => changeQty(item.cartKey, -1)} className="qty-btn"
                        style={{ width: '32px', height: '30px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .2s' }}>−</button>
                      <span style={{ width: '34px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--foreground)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', lineHeight: '30px' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.cartKey, 1)} className="qty-btn"
                        style={{ width: '32px', height: '30px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .2s' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '22px 28px 32px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>Sous-total</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 700 }}>
                {subtotal.toLocaleString('fr-TN')} TND
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>Livraison (8 TND) calculée à la commande</p>
            <button onClick={() => { setCartOpen(false); setTimeout(() => setCheckoutOpen(true), 300); }} className="btn-gold" style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: '12px', cursor: 'pointer', display: 'block' }}>
              Passer la commande →
            </button>
            <button onClick={() => setCartOpen(false)} className="continue-btn"
              style={{ width: '100%', marginTop: '10px', padding: '13px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'pointer', transition: 'all .3s' }}>
              Continuer les achats
            </button>
          </div>
        )}
      </aside>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <style jsx>{`
        .navlink:hover { color: var(--foreground) !important; }
        .navlink::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1px; background:var(--accent); transition:width .4s cubic-bezier(.22,1,.36,1); }
        .navlink:hover::after { width:100%; }
        .search-btn:hover { color:var(--foreground) !important; }
        .cart-trigger:hover { border-color:var(--accent) !important; background:rgba(184,146,74,.05) !important; }
        .close-x:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
        .remove-x:hover { color:var(--foreground) !important; }
        .qty-btn:hover { color:var(--foreground) !important; }
        .continue-btn:hover { border-color:var(--accent) !important; color:var(--foreground) !important; }
      `}</style>
    </>
  );
}

