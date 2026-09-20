'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStudySession } from '@/hooks/useStudySession';
import {
  STUDY_TRACK_RECORD_REFRESH_EVENT,
  isStudyTrackRecordProfileRoute,
  studyTrackRecordProfileHref,
} from '@/lib/studyTrackRecord';
import styles from './StudySessionBar.module.css';

function ConsentDialog({ onAccept, onCancel, starting, error }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="study-consent-title">
      <div className={styles.modal}>
        <h2 id="study-consent-title" className={styles.modalTitle}>
          Iniciar sesión de estudio
        </h2>
        <p className={styles.modalLead}>
          Mientras la sesión esté activa medimos tu concentración para darte un resumen al
          terminar. Tú la activas y tú la paras.
        </p>

        <ul className={styles.consentList}>
          <li>
            <span className={styles.yes}>Sí</span>
            <span>Cuánto tiempo tienes Dralo en primer plano y en qué áreas estudias.</span>
          </li>
          <li>
            <span className={styles.yes}>Sí</span>
            <span>Cuántas veces sales de la página y cuánto rato estás sin interactuar.</span>
          </li>
          <li>
            <span className={styles.no}>No</span>
            <span>
              A qué otras webs o aplicaciones vas: el navegador no nos deja verlo y no lo
              intentamos.
            </span>
          </li>
          <li>
            <span className={styles.no}>No</span>
            <span>Lo que escribes, tu cámara, tu micrófono ni tu pantalla.</span>
          </li>
        </ul>

        <p className={styles.modalNote}>
          Guardamos solo totales de tiempo, nunca un registro de lo que haces. Tú y tu profesor
          podéis ver el resumen. Puedes parar la sesión cuando quieras y pedir que borremos tu
          historial escribiéndonos. Más detalle en la{' '}
          <Link href="/politica-privacidad">política de privacidad</Link>.
        </p>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryBtn} onClick={onCancel}>
            Ahora no
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onAccept}
            disabled={starting}
          >
            {starting ? 'Iniciando…' : 'Acepto, empezar a estudiar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryDialog({ summary, onClose }) {
  const { report, resumen } = summary;
  const router = useRouter();
  const pathname = usePathname();

  const viewTrackRecord = () => {
    onClose();
    const search = typeof window !== 'undefined' ? window.location.search : '';
    if (isStudyTrackRecordProfileRoute(pathname, search)) {
      window.dispatchEvent(new CustomEvent(STUDY_TRACK_RECORD_REFRESH_EVENT));
      return;
    }
    router.push(studyTrackRecordProfileHref());
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="study-summary-title">
      <div className={styles.modal}>
        <h2 id="study-summary-title" className={styles.modalTitle}>
          Resumen de tu sesión
        </h2>
        <p className={styles.modalLead}>{report.quality.label}</p>

        <dl className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <dt>Concentrado</dt>
            <dd>{report.focusLabel}</dd>
          </div>
          <div className={styles.summaryCard}>
            <dt>Foco</dt>
            <dd>{report.focusRatio}%</dd>
          </div>
          <div className={styles.summaryCard}>
            <dt>Salidas</dt>
            <dd>{report.awayCount}</dd>
          </div>
          <div className={styles.summaryCard}>
            <dt>Total</dt>
            <dd>{report.totalLabel}</dd>
          </div>
        </dl>

        {resumen ? <p className={styles.summaryText}>{resumen}</p> : null}

        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryBtn} onClick={viewTrackRecord}>
            Ver mi track record
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            Hecho
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudySessionBar({ session }) {
  const {
    activeSession,
    report,
    lastSummary,
    starting,
    finishing,
    error,
    start,
    finish,
    dismissSummary,
  } = useStudySession(session);
  const [askingConsent, setAskingConsent] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const cls = 'study-session-active';
    if (activeSession) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [activeSession]);

  const handleAccept = async () => {
    const ok = await start();
    if (ok) setAskingConsent(false);
  };

  if (lastSummary) {
    return <SummaryDialog summary={lastSummary} onClose={dismissSummary} />;
  }

  if (activeSession) {
    return (
      <div className={styles.bar} role="status">
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden="true" />
          Estudiando
        </span>
        <div className={styles.barStats}>
          <span>
            <strong>{report?.focusLabel || '0 s'}</strong>
            concentrado
          </span>
          <span>
            <strong>{report?.focusRatio ?? 0}%</strong>
            foco
          </span>
        </div>
        <button type="button" className={styles.stopBtn} onClick={finish} disabled={finishing}>
          {finishing ? 'Cerrando…' : 'Terminar'}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setAskingConsent(true)}
      >
        Iniciar estudio
      </button>
      {askingConsent ? (
        <ConsentDialog
          onAccept={handleAccept}
          onCancel={() => setAskingConsent(false)}
          starting={starting}
          error={error}
        />
      ) : null}
    </>
  );
}
