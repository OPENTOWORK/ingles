'use client';

import { ExternalLink, MousePointerClick, Video } from 'lucide-react';
import styles from './AdminClarityPanel.module.css';

const DEFAULT_PROJECT_ID = 'x4qtfjtnkz';

export default function AdminClarityPanel() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
  const clarityUrl = projectId
    ? `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`
    : 'https://clarity.microsoft.com/';

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Comportamiento real (Microsoft Clarity)</h2>
          <p className={styles.subtitle}>
            Mapas de calor, grabaciones de sesión y análisis cualitativo del uso real de la plataforma.
          </p>
        </div>
        <a
          href={clarityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          Abrir Clarity
          <ExternalLink size={15} aria-hidden />
        </a>
      </div>

      <div className={styles.grid}>
        <article className={styles.feature}>
          <MousePointerClick size={18} aria-hidden />
          <div>
            <h3>Mapas de calor</h3>
            <p>Dónde hacen clic y hasta dónde hacen scroll los usuarios.</p>
          </div>
        </article>
        <article className={styles.feature}>
          <Video size={18} aria-hidden />
          <div>
            <h3>Grabaciones</h3>
            <p>Reproduce sesiones reales para detectar fricción en flujos clave.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
