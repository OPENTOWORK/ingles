'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './AdminFoundingSurveyPanel.module.css';

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  respondida: 'Respondida',
  vencida: 'Vencida',
  revocada: 'Plan retirado',
};

/**
 * Campaña de la encuesta de los 30 días (50 primeras inscripciones):
 * estado, envío de prueba al equipo y ejecución manual de la pasada diaria.
 */
export default function AdminFoundingSurveyPanel() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/founding-survey', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setEstado(data);
    } catch (err) {
      console.error('[AdminFoundingSurveyPanel]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(accion) {
    setBusy(accion);
    try {
      const res = await fetch('/api/admin/founding-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || 'No se pudo completar la acción.');
        return;
      }

      if (accion === 'prueba') {
        const enviados = (data.results || []).filter((r) => r.sent).length;
        toast.success(`Correo de prueba enviado a ${enviados} administrador(es).`);
      } else {
        const omitidos = data.omitidos ? ` · ${data.omitidos} omitidos` : '';
        toast.success(
          `Pasada completada: ${data.enviadas} enviadas · ${data.recordatorios} recordatorios · ${data.revocados} planes retirados${omitidos}.`,
        );
        await load();
      }
    } catch (err) {
      console.error('[AdminFoundingSurveyPanel]', err);
      toast.error('Error de red.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2>Encuesta founding · 50 primeras inscripciones</h2>
      </div>
      <div className="admin-section__body">
        <p className={styles.intro}>
          A los 30 días del alta, cada founding member (cupos 2–50) recibe un formulario. Si lo
          responde, su Plan Plus queda confirmado de por vida; si no lo hace en 7 días, la cuenta
          vuelve al Plan Free. La campaña se cierra sola cuando los 50 cupos están ocupados y no
          queda ninguna encuesta sin resolver.
        </p>

        {loading ? (
          <p className={styles.muted}>Cargando estado de la campaña…</p>
        ) : (
          <>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {estado?.claimedSlots ?? 0}/{50}
                </span>
                <span className={styles.statLabel}>Cupos ocupados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{estado?.enviadas ?? 0}</span>
                <span className={styles.statLabel}>Encuestas enviadas</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{estado?.respondidas ?? 0}</span>
                <span className={styles.statLabel}>Respondidas</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{estado?.pendientes ?? 0}</span>
                <span className={styles.statLabel}>En plazo</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{estado?.revocadas ?? 0}</span>
                <span className={styles.statLabel}>Planes retirados</span>
              </div>
            </div>

            <p className={estado?.finished ? styles.badgeDone : styles.badgeLive}>
              {estado?.finished
                ? 'Campaña finalizada: no se enviarán más formularios.'
                : 'Campaña activa: la pasada corre a diario con el cron de correos.'}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                disabled={Boolean(busy)}
                onClick={() => run('prueba')}
              >
                {busy === 'prueba' ? 'Enviando…' : 'Enviarme el correo de prueba'}
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={Boolean(busy) || estado?.finished}
                onClick={() => run('ejecutar')}
              >
                {busy === 'ejecutar' ? 'Ejecutando…' : 'Ejecutar pasada ahora'}
              </button>
              <a
                className="admin-btn"
                href="/founding/encuesta/preview/"
                target="_blank"
                rel="noreferrer"
              >
                Ver el formulario
              </a>
            </div>

            {estado?.destinatariosPrueba?.length ? (
              <p className={styles.muted}>
                La prueba se envía a: {estado.destinatariosPrueba.join(', ')}
              </p>
            ) : null}

            {estado?.rows?.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cupo</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Enviada</th>
                      <th>Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estado.rows.map((row) => (
                      <tr key={row.slot_number}>
                        <td>#{row.slot_number}</td>
                        <td>{row.email}</td>
                        <td>
                          <span className={`${styles.chip} ${styles[`chip_${row.estado}`] || ''}`}>
                            {ESTADO_LABEL[row.estado] || row.estado}
                          </span>
                          {row.revocacion_omitida_motivo && (
                            <span className={styles.note} title={row.revocacion_omitida_motivo}>
                              plan ajeno a la campaña: no se tocó
                            </span>
                          )}
                        </td>
                        <td>{row.enviada_en ? row.enviada_en.slice(0, 10) : '—'}</td>
                        <td>{row.vence_en ? row.vence_en.slice(0, 10) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.muted}>
                Todavía no hay ningún founding member que haya cumplido los 30 días.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
