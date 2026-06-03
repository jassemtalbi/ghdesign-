'use client';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const [on, setOn] = useState(false);
  const [sy, setSy] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/stats', { method: 'POST' });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 120);
    const fn = () => setSy(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', fn); };
  }, []);

  const show = (delay: number): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 1.1s ease ${delay}ms, transform 1.1s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <section ref={ref} style={{ position: 'relative', width: '100%',marginTop: '60px', height: '100vh', minHeight: '600px', overflow: 'hidden', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Parallax bg */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${sy * .3}px)` }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 18% 50%, rgba(201,169,110,.09) 0%, transparent 60%),
            radial-gradient(ellipse 55% 70% at 82% 18%, rgba(201,169,110,.06) 0%, transparent 60%),
            radial-gradient(ellipse 100% 90% at 50% 105%, rgba(20,12,4,.95) 0%, transparent 65%),
            #0a0a0a`,
        }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: .028,
          backgroundImage: `linear-gradient(var(--accent) 1px,transparent 1px),linear-gradient(90deg,var(--accent) 1px,transparent 1px)`,
          backgroundSize: '72px 72px' }} />
        {/* Big watermark */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none', opacity: on ? .04 : 0, transition: 'opacity 2s ease' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(12rem,22vw,20rem)', fontWeight: 300, color: 'var(--accent)', lineHeight: 1, whiteSpace: 'nowrap' }}>GH</span>
        </div>
      </div>

      {/* Side lines */}
      <div style={{ position: 'absolute', left: '6%', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom,transparent,rgba(201,169,110,.12),transparent)' }} />
      <div style={{ position: 'absolute', right: '6%', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom,transparent,rgba(201,169,110,.12),transparent)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>

        {/* Pre-title */}
        {/* <div style={{ ...show(200), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '1px', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.5em', textTransform: 'uppercase', color: 'var(--accent)' }}>Collection 2025</span>
          <div style={{ width: '36px', height: '1px', background: 'var(--accent)' }} />
        </div> */}

        {/* Heading */}
        <h1 style={{ ...show(420), fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2.6rem,8.5vw,7.5rem)', lineHeight: 1.06, letterSpacing: '.02em', marginBottom: '22px' }}>
          <span style={{ color: 'var(--foreground)' }}>Where Tradition</span><br />
          <span className="text-gold" style={{ fontStyle: 'italic' }}>Meets Elegance</span>
        </h1>

        {/* Sub */}
        <p style={{ ...show(640), fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(.8rem,1.6vw,.95rem)', letterSpacing: '.18em', color: 'var(--muted)', maxWidth: '440px', margin: '0 auto 44px', lineHeight: 2 }}>
          Handcrafted fashion for men & women, inspired by the soul of North Africa
        </p>

        {/* CTAs */}
        <div style={{ ...show(860), display: 'flex', marginBottom: '74px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <a href="#collections" className="btn-gold">Explore Collection</a>
          <a href="#about" className="btn-light">Our Story</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ...show(1100) }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--muted)' }}>Scroll</span>
        <div style={{ width: '1px', height: '44px', overflow: 'hidden', background: 'rgba(201,169,110,.2)', position: 'relative' }}>
          <div className="scroll-line" />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        borderTop: '1px solid var(--border)',
        ...show(1200),
      }} className="hidden md:grid">
        {[['500+','Unique Pieces'],['10+','Years of Craft'],['100%','Handmade']].map(([n,l]) => (
          <div key={l} style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRight: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 400 }}>{n}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--muted)' }}>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
