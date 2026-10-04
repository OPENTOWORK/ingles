'use client';

import styles from './AdminOrgBlocks.module.css';

export default function AdminFoldableSection({
  id,
  title,
  description,
  count = null,
  open,
  onToggle,
  children,
}) {
  return (
    <section className={styles.section}>
      <div className={`${styles.header} ${open ? '' : styles.headerCollapsed}`}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          <span className={styles.heading}>
            <span className={styles.titleRow}>
              <h2>{title}</h2>
              {count != null ? <span className={styles.count}>{count}</span> : null}
            </span>
            {description ? <span className={styles.description}>{description}</span> : null}
          </span>
          <span className={styles.chevron} aria-hidden>
            {open ? '▴' : '▾'}
          </span>
        </button>
      </div>
      {open ? (
        <div id={id} className={styles.body}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
