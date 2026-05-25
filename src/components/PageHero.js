'use client';

import SiteMascot from '@/components/SiteMascot';

const ACCENTS = {
  violet: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 48%, #a855f7 100%)',
    glow: 'rgba(99, 102, 241, 0.45)',
  },
  ocean: {
    gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 52%, #6366f1 100%)',
    glow: 'rgba(37, 99, 235, 0.4)',
  },
  emerald: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  amber: {
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 48%, #f97316 100%)',
    glow: 'rgba(245, 158, 11, 0.42)',
  },
  rose: {
    gradient: 'linear-gradient(135deg, #e11d48 0%, #db2777 50%, #a855f7 100%)',
    glow: 'rgba(219, 39, 119, 0.38)',
  },
  indigo: {
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 55%, #8b5cf6 100%)',
    glow: 'rgba(99, 102, 241, 0.42)',
  },
  lime: {
    gradient: 'linear-gradient(135deg, #65a30d 0%, #84cc16 48%, #22c55e 100%)',
    glow: 'rgba(132, 204, 22, 0.4)',
  },
};

export default function PageHero({
  breadcrumb,
  eyebrow,
  title,
  description,
  showMascot = false,
  mascotVariant = 4,
  mascotWidth = 148,
  accent = 'violet',
  stats = [],
}) {
  const theme = ACCENTS[accent] || ACCENTS.violet;

  return (
    <>
      {breadcrumb ? <div className="page-hero-wrap__breadcrumb">{breadcrumb}</div> : null}

      <header
        className="page-hero"
        style={{
          '--hero-gradient': theme.gradient,
          '--hero-glow': theme.glow,
        }}
      >
        <span className="page-hero__orb page-hero__orb--a" aria-hidden />
        <span className="page-hero__orb page-hero__orb--b" aria-hidden />
        <span className="page-hero__grid" aria-hidden />

        <div className="page-hero__inner">
          <div className="page-hero__content">
            {eyebrow ? <span className="page-hero__eyebrow">{eyebrow}</span> : null}
            <h1 className="page-hero__title">{title}</h1>
            {description ? <p className="page-hero__desc">{description}</p> : null}
            {stats.length > 0 ? (
              <ul className="page-hero__stats">
                {stats.map((item) => (
                  <li key={item.label}>
                    <span className="page-hero__stat-value">{item.value}</span>
                    <span className="page-hero__stat-label">{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {showMascot ? (
            <div className="page-hero__mascot" aria-hidden>
              <SiteMascot
                variant={mascotVariant}
                width={mascotWidth}
                alt=""
                className="page-hero__mascot-img"
                style={{ maxWidth: mascotWidth, maxHeight: Math.round(mascotWidth * 1.15) }}
              />
            </div>
          ) : null}
        </div>
      </header>

      <style jsx global>{`
        .page-hero-wrap__breadcrumb {
          margin-bottom: 14px;
        }
        .page-hero-wrap__breadcrumb .breadcrumb {
          margin-bottom: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.82);
        }
        .page-hero-wrap__breadcrumb .breadcrumb a {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
        }
        .page-hero-wrap__breadcrumb .breadcrumb a:hover {
          text-decoration: underline;
        }
        .page-hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          margin-bottom: 28px;
          background: var(--hero-gradient);
          box-shadow:
            0 4px 6px rgba(15, 23, 42, 0.06),
            0 20px 50px var(--hero-glow);
        }
        .page-hero__grid {
          position: absolute;
          inset: 0;
          opacity: 0.14;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: linear-gradient(180deg, black 0%, transparent 85%);
        }
        .page-hero__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
        }
        .page-hero__orb--a {
          width: 220px;
          height: 220px;
          top: -80px;
          right: 12%;
          background: rgba(255, 255, 255, 0.22);
        }
        .page-hero__orb--b {
          width: 160px;
          height: 160px;
          bottom: -60px;
          left: 8%;
          background: rgba(255, 255, 255, 0.12);
        }
        .page-hero__inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 24px 32px;
          padding: clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px);
        }
        .page-hero__content {
          flex: 1 1 260px;
          min-width: 0;
        }
        .page-hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          margin-bottom: 14px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(8px);
        }
        .page-hero__title {
          margin: 0 0 12px;
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #fff;
          text-shadow: 0 2px 24px rgba(0, 0, 0, 0.12);
        }
        .page-hero__desc {
          margin: 0;
          max-width: 52ch;
          font-size: clamp(1rem, 2vw, 1.125rem);
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.88);
        }
        .page-hero__stats {
          list-style: none;
          margin: 22px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .page-hero__stats li {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 88px;
          padding: 10px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(10px);
        }
        .page-hero__stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .page-hero__stat-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .page-hero__mascot {
          position: relative;
          flex: 0 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          align-self: center;
          line-height: 0;
        }
        .page-hero__mascot-img {
          display: block !important;
          position: relative;
          z-index: 1;
          width: auto !important;
          height: auto !important;
          max-width: 100% !important;
          object-fit: contain;
          object-position: center bottom;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.28));
        }
        @media (max-width: 640px) {
          .page-hero__mascot {
            margin: 8px auto 0;
          }
          .page-hero__inner {
            justify-content: center;
            text-align: center;
          }
          .page-hero__desc {
            margin-inline: auto;
          }
          .page-hero__stats {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
