'use client';

import Link from 'next/link';
import { getCefrLevelColor } from '@/constants/cefrLevelColors';
import ui from '@/components/training/training-ui.module.css';
import styles from './page.module.css';

function formatSkillTitle(skill) {
  return skill
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function TrainingRepasoPage({ params }) {
  const { level, skill } = params;
  const skillTitle = formatSkillTitle(skill);
  const levelAccent = getCefrLevelColor(level);

  return (
    <main className={ui.pageNarrow}>
      <header className={ui.header}>
        <p className={ui.eyebrow} style={{ color: levelAccent }}>
          Level {level.toUpperCase()} · {skillTitle} · Repaso
        </p>
        <h1 className={ui.title}>Review practice</h1>
        <p className={ui.subtitle}>
          Here you will find exercises to repeat when you need more practice. Your list will fill
          up as you work through the path.
        </p>
      </header>

      <div className={styles.emptyCard}>
        <span className={styles.emptyBadge} aria-hidden>
          ↻
        </span>
        <h2 className={styles.emptyTitle}>Nothing to review yet</h2>
        <p className={styles.emptyText}>
          Complete exercises on the path. Items you need to improve will appear here automatically.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href={`/training/${level}/${skill}`} className={ui.backLink}>
          ← Back to difficulties
        </Link>
      </div>
    </main>
  );
}
