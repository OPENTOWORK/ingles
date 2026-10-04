'use client';

import { useState } from 'react';
import { ExternalLink, MousePointerClick, Video } from 'lucide-react';
import styles from './AdminClarityPanel.module.css';

const DEFAULT_PROJECT_ID = 'x4qtfjtnkz';

export default function AdminClarityPanel() {
  const [open, setOpen] = useState(false);
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
  const projectBase = projectId
    ? `https://clarity.microsoft.com/projects/view/${projectId}`
    : 'https://clarity.microsoft.com';
  const clarityUrl = projectId ? `${projectBase}/dashboard` : projectBase;
  const heatmapsUrl = projectId ? `${projectBase}/heatmaps` : projectBase;
  const recordingsUrl = projectId ? `${projectBase}/recordings` : projectBase;

  return (
    <section className={styles.panel}>
      <div className={`${styles.header} ${open ? '' : styles.headerCollapsed}`}>
        <div className={styles.headerMain}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="admin-clarity-panel"
            onClick={() => setOpen((current) => !current)}
          >
            <h2 className={styles.title}>Comportamiento real (Microsoft Clarity)</h2>
            <span className={styles.chevron} aria-hidden>
              {open ? '▴' : '▾'}
            </span>
          </button>
          {open ? (
            <p className={styles.subtitle}>
              Mapas de calor, grabaciones de sesión y análisis cualitativo del uso real de la plataforma.
            </p>
          ) : null}
        </div>
        {open ? (
          <a
            href={clarityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Abrir Clarity
            <ExternalLink size={15} aria-hidden />
          </a>
        ) : null}
      </div>

      {open ? (
      <div id="admin-clarity-panel" className={styles.grid}>
        <a
          className={styles.feature}
          href={heatmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MousePointerClick size={18} aria-hidden />
          <div>
            <h3>
              Mapas de calor
              <ExternalLink size={14} aria-hidden />
            </h3>
            <p>Dónde hacen clic y hasta dónde hacen scroll los usuarios.</p>
          </div>
        </a>
        <a
          className={styles.feature}
          href={recordingsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Video size={18} aria-hidden />
          <div>
            <h3>
              Grabaciones
              <ExternalLink size={14} aria-hidden />
            </h3>
            <p>Reproduce sesiones reales para detectar fricción en flujos clave.</p>
          </div>
        </a>
      </div>
      ) : null}
    </section>
  );
}
