import { ImageResponse } from 'next/og';
import { SOCIAL_SHARE } from '@/lib/siteSeo';

export const alt = SOCIAL_SHARE.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

const TAGS = ['Exam practice', 'Writing', 'Speaking', 'AI tools'];

export default function Image() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 48%, #0f172a 100%)',
          color: '#ffffff',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#c7d2fe',
                marginBottom: 20,
              },
              children: 'www.dralo.es',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: 24,
              },
              children: SOCIAL_SHARE.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 30,
                lineHeight: 1.45,
                color: '#e2e8f0',
                maxWidth: 920,
                marginBottom: 36,
              },
              children: SOCIAL_SHARE.description,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 12, flexWrap: 'wrap' },
              children: TAGS.map((label) => ({
                type: 'div',
                props: {
                  style: {
                    padding: '10px 18px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    fontSize: 20,
                    fontWeight: 700,
                  },
                  children: label,
                },
              })),
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 },
  );
}
