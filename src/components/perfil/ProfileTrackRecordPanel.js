'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import { STUDY_TRACK_RECORD_REFRESH_EVENT } from '@/lib/studyTrackRecord';
import styles from './ProfileTrackRecordPanel.module.css';

const QUALITY_CLASS = {
  excelente: styles.qualityExcelente,
  buena: styles.qualityBuena,
  irregular: styles.qualityIrregular,
  dispersa: styles.qualityDispersa,
};

function formatSessionDate(value) {
  if (!value) return 'Sesión';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sesión';
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfileTrackRecordPanel() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const res = await fetch('/api/estudio/track-record', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error || 'No se pudo cargar tu historial.');
        setRecord(null);
        return;
      }
      setRecord(payload);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    const onRefresh = () => {
      void loadRecord();
    };
    window.addEventListener(STUDY_TRACK_RECORD_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(STUDY_TRACK_RECORD_REFRESH_EVENT, onRefresh);
  }, [loadRecord]);

  const totals = record?.totals;
  const entries = record?.entries || [];

  return (
    <div className="profile-tab-panels">
      <ProfileCollapsibleSection
        title="Tu track record"
        defaultOpen
        description="El historial de tus sesiones de estudio monitorizadas, con el resumen que te generamos al terminar cada una."
      >
        <div className={styles.content}>
      {loading ? <p className={styles.empty}>Cargando tu historial…</p> : null}
      {error ? <p className={styles.empty}>{error}</p> : null}

      {!loading && !error && totals ? (
        <dl className={styles.totals}>
          <div className={styles.totalCard}>
            <dt>Sesiones</dt>
            <dd>{totals.sessionCount}</dd>
          </div>
          <div className={styles.totalCard}>
            <dt>Tiempo concentrado</dt>
            <dd>{totals.focusLabel}</dd>
          </div>
          <div className={styles.totalCard}>
            <dt>Foco medio</dt>
            <dd>{totals.avgFocusRatio}%</dd>
          </div>
          <div className={styles.totalCard}>
            <dt>Racha</dt>
            <dd>{totals.streakDays} d</dd>
          </div>
        </dl>
      ) : null}

      {!loading && !error && entries.length === 0 ? (
        <p className={styles.empty}>
          Todavía no has cerrado ninguna sesión de estudio. Pulsa <strong>Iniciar estudio</strong>{' '}
          cuando te pongas y al terminar guardaremos aquí tu resumen.
        </p>
      ) : null}

      <div className={styles.list}>
        {entries.map((entry) => (
          <article key={entry.sessionId} className={styles.entry}>
            <div className={styles.entryHead}>
              <p className={styles.entryDate}>{formatSessionDate(entry.startedAt)}</p>
              <span
                className={`${styles.entryQuality} ${QUALITY_CLASS[entry.quality.key] || ''}`}
              >
                {entry.quality.label}
              </span>
            </div>

            <div className={styles.entryMeta}>
              <span>
                Concentrado <strong>{entry.focusLabel}</strong>
              </span>
              <span>
                Foco <strong>{entry.focusRatio}%</strong>
              </span>
              <span>
                Salidas <strong>{entry.awayCount}</strong>
              </span>
              <span>
                Total <strong>{entry.totalLabel}</strong>
              </span>
            </div>

            {entry.resumen ? <p className={styles.entrySummary}>{entry.resumen}</p> : null}

            {entry.areas.length > 0 ? (
              <div className={styles.entryAreas}>
                {entry.areas.slice(0, 5).map((area) => (
                  <span key={area.area} className={styles.areaChip}>
                    {area.area} · {area.label}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
        </div>
      </ProfileCollapsibleSection>
    </div>
  );
}
