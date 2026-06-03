'use client';
import { useEffect, useRef } from 'react';

const socials = [
  { label:'Instagram', value:'@ghdesign.tn',          icon:'◈' },
  { label:'Facebook',  value:'GH Design',             icon:'◇' },
  { label:'Email',     value:'hello@ghdesign.online', icon:'◉' },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')), { threshold: .1 });
    ref.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="contact" ref={ref} style={{ position:'relative', padding:'clamp(60px,10vw,120px) clamp(16px,5vw,64px)', background:'var(--surface)', overflow:'hidden' }}>
      {/* Dot pattern */}
      <div style={{ position:'absolute', inset:0, opacity:.022, backgroundImage:`radial-gradient(circle,var(--accent) 1px,transparent 1px)`, backgroundSize:'38px 38px', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:'640px', margin:'0 auto', textAlign:'center' }}>
        <div className="reveal">
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'11px', letterSpacing:'.5em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'14px', fontWeight:600 }}>Get in Touch</p>
          <h2 style={{ fontFamily:'var(--font-serif)', fontWeight:700, fontSize:'clamp(1.8rem,5vw,3.2rem)', color:'var(--foreground)', lineHeight:1.2, marginBottom:'14px' }}>
            Let&apos;s Create Something{' '}
            <span style={{ fontStyle:'italic', color:'var(--accent)' }}>Beautiful</span>
          </h2>
          <p style={{ fontFamily:'var(--font-sans)', fontWeight:600, fontSize:'1rem', lineHeight:1.9, color:'var(--muted)', marginBottom:'40px' }}>
            Reach out for custom orders, size inquiries, or to simply connect with the GH Design atelier.
          </p>
        </div>

        {/* Newsletter */}
        <div className="reveal">
          <div style={{ display:'flex', flexWrap:'wrap', border:'1px solid var(--border)', marginBottom:'14px' }}>
            <input type="email" placeholder="Your email address" style={{
              flex:'1 1 200px', padding:'14px 18px',
              background:'var(--background)', color:'var(--foreground)',
              fontFamily:'var(--font-sans)', fontWeight:600, fontSize:'.85rem',
              border:'none', outline:'none', minWidth:0,
            }} />
            <button className="btn-gold" style={{ fontSize:'11px', padding:'12px 22px', border:'none', borderLeft:'1px solid var(--border)', flexShrink:0 }}>
              Subscribe
            </button>
          </div>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'12px', letterSpacing:'.08em', color:'var(--muted)', fontWeight:600 }}>
            Join our circle for exclusive previews, private sales &amp; new arrivals.
          </p>
        </div>

        {/* Social */}
        <div className="reveal" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:'clamp(24px,5vw,48px)', marginTop:'clamp(40px,6vw,64px)' }}>
          {socials.map(s => (
            <div key={s.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
              <span style={{ color:'var(--accent)', fontSize:'.9rem' }}>{s.icon}</span>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'11px', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--muted)', fontWeight:600 }}>{s.label}</span>
              <span className="link-line" style={{ fontFamily:'var(--font-sans)', fontSize:'.92rem', fontWeight:600, color:'var(--foreground)', cursor:'none' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
