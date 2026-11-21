import { ImageResponse } from 'next/og';

/**
 * Logo for the schema.org Organization (Google: at least 112×112, readable on
 * a white background). It reproduces the navbar wordmark
 * ("FRENCH BEAUTY BD", with BEAUTY in the accent colour). Edge runtime + CDN
 * cache, for the same reason as og-default.png (Windows bug in @vercel/og/node).
 */
export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          fontFamily: 'sans-serif',
          color: '#1A1A1A',
          letterSpacing: 10,
        }}
      >
        <div style={{ display: 'flex', fontSize: 74 }}>FRENCH</div>
        <div style={{ display: 'flex', fontSize: 74, color: '#C9513A', margin: '6px 0' }}>BEAUTY</div>
        <div style={{ display: 'flex', fontSize: 74 }}>BD</div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
