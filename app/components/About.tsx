'use client';
import { useEffect, useRef } from 'react';

const values = [
  { icon: '◈', title: 'Authentic Craft',  desc: 'Traditional Tunisian techniques' },
  { icon: '◇', title: 'Premium Fabrics',  desc: 'Curated materials only' },
  { icon: '◉', title: 'Made to Order',    desc: 'Tailored to perfection' },
  { icon: '◐', title: 'Local Heritage',   desc: 'Rooted in North African culture' },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} style={{ background: 'var(--surface)' }}>

      {/* Story */}
      <div style={{ padding: 'clamp(64px,10vw,120px) clamp(20px,5vw,64px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'clamp(48px,8vw,88px)', alignItems: 'center' }}>

          {/* Visual */}
          <div className="reveal" style={{ position: 'relative', paddingTop: '20px', paddingLeft: '20px' }}>
            <div style={{ position: 'relative', aspectRatio: '3/4', background: 'linear-gradient(135deg,#141008,#251c0c 50%,#141008)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(8rem,18vw,15rem)', fontWeight: 700, color: 'transparent', WebkitTextStroke: '1px rgba(201,169,110,.1)', lineHeight: 1, userSelect: 'none' }}>G</span>
              </div>
              {/* Corners */}
              <div style={{ position:'absolute', top:'18px', left:'18px', width:'36px', height:'36px', borderTop:'1px solid var(--accent)', borderLeft:'1px solid var(--accent)' }} />
              <div style={{ position:'absolute', top:'18px', right:'18px', width:'36px', height:'36px', borderTop:'1px solid var(--accent)', borderRight:'1px solid var(--accent)' }} />
              <div style={{ position:'absolute', bottom:'18px', left:'18px', width:'36px', height:'36px', borderBottom:'1px solid var(--accent)', borderLeft:'1px solid var(--accent)' }} />
              <div style={{ position:'absolute', bottom:'18px', right:'18px', width:'36px', height:'36px', borderBottom:'1px solid var(--accent)', borderRight:'1px solid var(--accent)' }} />
            </div>

            {/* Floating 10+ badge */}
            <div className="animate-float" style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'105px', height:'105px', background:'var(--background)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px' }}>
              <span style={{ fontFamily:'var(--font-serif)', fontSize:'2rem', color:'var(--accent)', fontWeight:700, lineHeight:1 }}>10+</span>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'9px', letterSpacing:'.26em', textTransform:'uppercase', color:'var(--muted)', textAlign:'center' }}>Years of Art</span>
            </div>

            {/* Gold 100% badge */}
            <div style={{ position:'absolute', top:0, left:0, width:'86px', height:'86px', background:'var(--accent)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px' }}>
              <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.35rem', color:'#0a0a0a', fontWeight:700, lineHeight:1 }}>100%</span>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'9px', letterSpacing:'.2em', textTransform:'uppercase', color:'#0a0a0a', textAlign:'center' }}>Handmade</span>
            </div>
          </div>

          {/* Text */}
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,2.5vw,24px)' }}>
            <div className="reveal">
              <p style={{ fontFamily:'var(--font-sans)', fontSize:'11px', letterSpacing:'.5em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'14px', fontWeight:600 }}>Our Heritage</p>
              <h2 style={{ fontFamily:'var(--font-serif)', fontWeight:700, fontSize:'clamp(1.9rem,4.5vw,3.2rem)', color:'var(--foreground)', lineHeight:1.15 }}>
                Crafted with Soul,<br/>
                <span style={{ fontStyle:'italic', color:'var(--accent)' }}>Worn with Pride</span>
              </h2>
            </div>

            <div style={{ width:'52px', height:'1px', background:'var(--accent)' }} />

            <div className="reveal" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <p style={{ fontFamily:'var(--font-sans)', fontWeight:600, fontSize:'1rem', lineHeight:1.95, color:'var(--muted)' }}>
                GH Design was born from a deep love of Tunisian heritage and a desire to bring that timeless beauty into modern fashion. Every stitch tells a story of craftsmanship passed down through generations.
              </p>
              <p style={{ fontFamily:'var(--font-sans)', fontWeight:600, fontSize:'1rem', lineHeight:1.95, color:'var(--muted)' }}>
                We believe that true luxury lies in the details — in the careful selection of fabrics, the precision of embroidery, and the quiet confidence of a woman who wears her culture with grace.
              </p>
            </div>

            {/* Values */}
            <div className="reveal" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,185px),1fr))', gap:'8px' }}>
              {values.map(v => (
                <div key={v.title} className="about-value" style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'12px 14px', borderLeft:'1px solid transparent', transition:'border-color .3s, background .3s' }}>
                  <span style={{ color:'var(--accent)', fontSize:'1rem', lineHeight:1, flexShrink:0, marginTop:'2px' }}>{v.icon}</span>
                  <div>
                    <h4 style={{ fontFamily:'var(--font-sans)', fontSize:'.9rem', fontWeight:700, color:'var(--foreground)', letterSpacing:'.04em', marginBottom:'3px' }}>{v.title}</h4>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'11px', color:'var(--muted)', fontWeight:600 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal">
              <a href="#contact" className="btn-gold">Meet the Designer</a>
            </div>
          </div>
        </div>
      </div>

      {/* Quote banner */}
      <div style={{ position:'relative', padding:'clamp(56px,8vw,100px) clamp(20px,5vw,64px)', textAlign:'center', overflow:'hidden', borderTop:'1px solid var(--border)', background:'var(--background)' }}>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', userSelect:'none', opacity:.025, overflow:'hidden' }}>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(4rem,14vw,13rem)', fontWeight:700, color:'var(--accent)', whiteSpace:'nowrap' }}>ELEGANCE</span>
        </div>
        <div className="reveal" style={{ position:'relative', zIndex:1, maxWidth:'680px', margin:'0 auto' }}>
          <p style={{ fontFamily:'var(--font-serif)', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.3rem,3vw,2.3rem)', color:'var(--foreground)', lineHeight:1.5 }}>
            &ldquo;Fashion is not just clothing — it is a language, a memory, a celebration of who you are.&rdquo;
          </p>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'11px', letterSpacing:'.4em', textTransform:'uppercase', color:'var(--accent)', marginTop:'22px', fontWeight:600 }}>— GH Design</p>
        </div>
      </div>

      <style jsx>{`
        .about-value:hover { border-left-color: var(--accent) !important; background: rgba(201,169,110,.04) !important; }
      `}</style>
    </section>
  );
}
