'use client';

import { STAFF_TASKS_VIEW_MODES } from '@/lib/staffTasksConstants';
import styles from './StaffTasksKanban.module.css';

export default function StaffTasksViewSwitcher({ value, onChange }) {
  return (
    <div className={styles.viewSwitcher} role="tablist" aria-label="Modo de visualización">
      {STAFF_TASKS_VIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          className={`${styles.viewBtn} ${value === mode.id ? styles.viewBtnActive : ''}`}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
