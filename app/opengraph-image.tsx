import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/brand/site-config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${SITE_CONFIG.organisation.schoolName} — learn to help with skill, care and confidence.`

/**
 * Social preview card. Deliberately type-only — no remote fonts or images, so
 * generation never depends on a network fetch at build time.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#0b1320',
          backgroundImage:
            'radial-gradient(circle at 12% 8%, rgba(15,118,110,0.45), transparent 42%), radial-gradient(circle at 92% 26%, rgba(91,42,134,0.38), transparent 40%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9de2d8',
            }}
          >
            Counselling · Positive psychology · Supported practice
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 36,
              maxWidth: 900,
              fontSize: 82,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Learn to help with skill, care and confidence.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.18)',
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#f1f5f9' }}>
            {SITE_CONFIG.organisation.shortName}
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#d8bd7a' }}>
            {SITE_CONFIG.programme.durationWeeks.value} guided weeks
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
