const items = ['New Collection','GH Design','Tunisian Craft','Handmade','Women\'s Fashion','Exclusive Pieces','Limited Edition'];
const repeated = [...items,...items,...items];

export default function Marquee() {
  return (
    <div style={{ overflow: 'hidden', padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="animate-marquee" style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 20px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400, color: 'var(--muted)' }}>{item}</span>
            <span style={{ color: 'var(--accent)', fontSize: '7px' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
