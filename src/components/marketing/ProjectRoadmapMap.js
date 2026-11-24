import {
  FUTURE_PROJECTS,
  PROJECT_DELIVERIES,
  PROJECT_WINDOW,
  formatRoadmapDate,
  roadmapPosition,
} from '@/lib/projectRoadmap';
import styles from './ProjectRoadmapMap.module.css';

const TICKS = [
  { iso: PROJECT_WINDOW.start, label: '9 nov', align: 'start' },
  { iso: '2026-12-01', label: 'Dic', align: 'mid' },
  { iso: '2027-01-01', label: 'Ene', align: 'mid' },
  { iso: PROJECT_WINDOW.end, label: '8 ene', align: 'end' },
];

export default function ProjectRoadmapMap() {
  return (
    <section className={styles.map} aria-labelledby="project-roadmap-title">
      <div className={styles.head}>
        <h2 id="project-roadmap-title" className={styles.title}>
          Última entrega
        </h2>
        <p className={styles.lead}>
          Departamento de Inglés · {formatRoadmapDate(PROJECT_WINDOW.start)} – {formatRoadmapDate(PROJECT_WINDOW.end)}
        </p>
      </div>

      <div className={styles.board}>
        <div className={styles.scaleHead} aria-hidden>
          <span />
          <div className={styles.ticks}>
            {TICKS.map((tick) => (
              <span
                key={tick.iso}
                className={styles[`tick_${tick.align}`]}
                style={tick.align === 'mid' ? { left: `${roadmapPosition(tick.iso)}%` } : undefined}
              >
                {tick.label}
              </span>
            ))}
          </div>
          <span className={styles.dateHead}>Fecha</span>
        </div>

        <ol className={styles.rows}>
          {PROJECT_DELIVERIES.map((project) => {
            const position = roadmapPosition(project.date);
            const detail = [project.deliverable, project.note].filter(Boolean).join('. ');
            return (
              <li key={project.id} className={styles.row} title={detail}>
                <div className={styles.identity}>
                  <span className={styles.swatch} style={{ background: project.color }} aria-hidden />
                  <span>
                    <span className={styles.name}>{project.name}</span>
                    <span className={styles.deliverable}>{project.deliverable}</span>
                  </span>
                </div>
                <div className={styles.scale} aria-hidden>
                  <span
                    className={styles.bar}
                    style={{ width: `${position}%`, background: project.color }}
                  />
                </div>
                <p className={styles.when}>
                  <time dateTime={project.date}>{formatRoadmapDate(project.date)}</time>
                  <span className={project.kind === 'Fijada' ? styles.kindFixed : styles.kindSoft}>
                    {project.kind}
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.future}>
        <div className={styles.head}>
          <h3 className={styles.futureTitle}>Visión de futuro</h3>
          <p className={styles.lead}>Sin fecha de entrega. Incluye la guía del B2 y las del resto de niveles.</p>
        </div>
        <ul className={styles.cards}>
          {FUTURE_PROJECTS.map((project) => (
            <li key={project.id} className={styles.card}>
              <p className={styles.cardName}>{project.name}</p>
              <p className={styles.cardText}>{project.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
