import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf9f7',
          position: 'relative',
        }}
      >
        {/* Top & bottom gold lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#b8924a', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: '#b8924a', display: 'flex' }} />

        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: '32px', left: '32px', width: '48px', height: '48px', borderTop: '2px solid #b8924a', borderLeft: '2px solid #b8924a', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '32px', right: '32px', width: '48px', height: '48px', borderTop: '2px solid #b8924a', borderRight: '2px solid #b8924a', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '32px', left: '32px', width: '48px', height: '48px', borderBottom: '2px solid #b8924a', borderLeft: '2px solid #b8924a', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '48px', height: '48px', borderBottom: '2px solid #b8924a', borderRight: '2px solid #b8924a', display: 'flex' }} />

        {/* Label */}
        <div style={{ fontSize: '18px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#b8924a', marginBottom: '24px', fontFamily: 'serif', display: 'flex' }}>
          Tunisian Fashion
        </div>

        {/* GH */}
        <div style={{ fontSize: '160px', fontWeight: 700, color: '#b8924a', lineHeight: 1, letterSpacing: '0.08em', fontFamily: 'serif', display: 'flex' }}>
          GH
        </div>

        {/* Divider */}
        <div style={{ width: '80px', height: '2px', background: '#b8924a', margin: '24px 0', display: 'flex' }} />

        {/* Design */}
        <div style={{ fontSize: '36px', letterSpacing: '0.6em', textTransform: 'uppercase', color: '#1a1410', fontFamily: 'serif', display: 'flex' }}>
          DESIGN
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '16px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8a7f72', marginTop: '28px', fontFamily: 'sans-serif', display: 'flex' }}>
          Handcrafted Fashion · Tunisie
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
