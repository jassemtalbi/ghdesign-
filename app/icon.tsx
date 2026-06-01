import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #c9a96e',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontSize: 14,
            fontWeight: 300,
            color: '#c9a96e',
            letterSpacing: 1,
          }}
        >
          GH
        </span>
      </div>
    ),
    { ...size }
  );
}
