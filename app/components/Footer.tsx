'use client';

const cols = [
  { title: 'Collections', links: [
    { label: 'Traditional',        href: '#collections' },
    { label: 'Evening Wear',       href: '#collections' },
    { label: 'Casual Chic',        href: '#collections' },
    { label: 'Modest Collection',  href: '#collections' },
  ]},
  { title: 'Information', links: [
    { label: 'À propos',           href: '#about' },
    { label: 'Contact',            href: '#contact' },
  ]},
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,64px)' }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))', gap: 'clamp(32px,5vw,56px)', marginBottom: 'clamp(48px,6vw,72px)' }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div className="text-gold" style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', letterSpacing: '.32em', fontWeight: 900, lineHeight: 1 }}>GH</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.46em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px', fontWeight: 400 }}>Design</div>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '.78rem', lineHeight: 1.9, color: 'var(--muted)', maxWidth: '175px', marginBottom: '24px' }}>
              Handcrafted fashion for men & women, rooted in the soul of Tunisian heritage.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'Fb', href: 'https://www.facebook.com/share/1cPXVWjggx/?mibextid=wwXIfr' },
                { label: 'Ig', href: 'https://www.instagram.com/gh.design5?igsh=MXhhczNxeTh1emg3OA%3D%3D&utm_source=qr' },
                { label: 'Tk', href: 'https://www.tiktok.com/@gh.design5?_r=1&_t=ZS-96swh3wlqqN' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="footer-social"
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--muted)', textDecoration: 'none', cursor: 'none', transition: 'all .3s' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.42em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '20px', fontWeight: 400 }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="footer-link"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '.8rem', fontWeight: 400, color: 'var(--muted)', textDecoration: 'none', cursor: 'none', transition: 'color .3s', display: 'inline-block' }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 'clamp(28px,4vw,40px)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span className="text-gold" style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', letterSpacing: '.3em', fontWeight: 900 }}>GH DESIGN</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', color: 'var(--muted)', fontWeight: 400 }}>
            © 2026 GH Design. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div className="animate-pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--muted)', fontWeight: 400 }}>Made with love in Tunisia</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-social:hover { border-color: var(--accent) !important; color: var(--accent) !important; }
        .footer-link:hover { color: var(--foreground) !important; }
      `}</style>
    </footer>
  );
}
