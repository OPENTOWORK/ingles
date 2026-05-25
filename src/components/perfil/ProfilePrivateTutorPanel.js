'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { canAccessTeacherPanel } from '@/utils/authRoles';

export default function ProfilePrivateTutorPanel({ userRole, accessToken }) {
  const isTeacher = canAccessTeacherPanel(userRole);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tablesReady, setTablesReady] = useState(true);

  const [offersOnline, setOffersOnline] = useState(true);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [offersInPerson, setOffersInPerson] = useState(false);
  const [calendlyUrlInPerson, setCalendlyUrlInPerson] = useState('');
  const [inPersonInfo, setInPersonInfo] = useState('');
  const [presentation, setPresentation] = useState('');
  const [active, setActive] = useState(true);

  const [teachers, setTeachers] = useState([]);

  const applyProfile = useCallback((profile) => {
    if (!profile) return;
    setOffersOnline(profile.ofrece_online !== false);
    setCalendlyUrl(profile.calendly_url || '');
    setOffersInPerson(profile.ofrece_presencial === true);
    setCalendlyUrlInPerson(profile.calendly_url_presencial || '');
    setInPersonInfo(profile.info_presencial || '');
    setPresentation(profile.presentacion || '');
    setActive(profile.activo !== false);
  }, []);

  const loadTeacherProfile = useCallback(async () => {
    if (!accessToken || !isTeacher) return;
    const res = await fetch('/api/tutoring/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || 'No se pudo cargar tu perfil de clases.');
    }
    setTablesReady(json.tablesReady !== false);
    applyProfile(json.profile);
  }, [accessToken, isTeacher, applyProfile]);

  const loadTeachersForStudents = useCallback(async () => {
    if (!accessToken || isTeacher) return;
    const res = await fetch('/api/tutoring/teachers', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || 'No se pudo cargar la lista de profesores.');
    }
    setTablesReady(json.tablesReady !== false);
    setTeachers(json.teachers || []);
  }, [accessToken, isTeacher]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        if (isTeacher) {
          await loadTeacherProfile();
        } else {
          await loadTeachersForStudents();
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error de carga.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isTeacher, loadTeacherProfile, loadTeachersForStudents]);

  const onlineTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.offersOnline),
    [teachers],
  );
  const inPersonTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.offersInPerson),
    [teachers],
  );

  const handleSave = async (event) => {
    event.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/tutoring/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ofrece_online: offersOnline,
          calendly_url: calendlyUrl,
          ofrece_presencial: offersInPerson,
          calendly_url_presencial: calendlyUrlInPerson,
          info_presencial: inPersonInfo,
          presentacion: presentation,
          activo: active,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'No se pudo guardar.');
      }
      setMessage('Perfil de clases guardado. Los alumnos ya pueden reservar contigo.');
      applyProfile(json.profile);
    } catch (err) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <section className="profile-section">
          <p className="section-desc">Cargando clases particulares…</p>
        </section>
      </>
    );
  }

  if (!tablesReady) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <section className="profile-section">
          <div className="section-head">
            <h2>👨‍🏫 Consigue tu profesor particular</h2>
          </div>
          <p className="section-desc">
            El módulo de reservas aún no está activo en la base de datos. Ejecuta{' '}
            <code>scripts/profesor_calendly.sql</code> en Supabase.
          </p>
        </section>
      </>
    );
  }

  if (isTeacher) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <section className="profile-section">
          <div className="section-head">
            <h2>👨‍🏫 Clases particulares (online y presenciales)</h2>
          </div>
          <p className="section-desc">
            Configura cómo pueden reservarte los alumnos: videollamada con Calendly y/o clases
            presenciales con enlace de reserva o información de ubicación.
          </p>

          <form onSubmit={handleSave} className="profile-tutor-form">
            <fieldset className="profile-tutor-fieldset">
              <legend>💻 Clases online</legend>
              <label className="profile-tutor-checkbox">
                <input
                  type="checkbox"
                  checked={offersOnline}
                  onChange={(e) => setOffersOnline(e.target.checked)}
                />
                <span>Ofrezco clases online personalizadas</span>
              </label>
              {offersOnline ? (
                <label className="profile-tutor-field">
                  <span>Enlace de Calendly (online)</span>
                  <input
                    type="url"
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                    placeholder="https://calendly.com/tu-usuario/clase-online"
                  />
                </label>
              ) : null}
            </fieldset>

            <fieldset className="profile-tutor-fieldset">
              <legend>📍 Clases presenciales</legend>
              <label className="profile-tutor-checkbox">
                <input
                  type="checkbox"
                  checked={offersInPerson}
                  onChange={(e) => setOffersInPerson(e.target.checked)}
                />
                <span>Ofrezco clases presenciales</span>
              </label>
              {offersInPerson ? (
                <>
                  <label className="profile-tutor-field">
                    <span>Calendly presencial (opcional)</span>
                    <input
                      type="url"
                      value={calendlyUrlInPerson}
                      onChange={(e) => setCalendlyUrlInPerson(e.target.value)}
                      placeholder="https://calendly.com/tu-usuario/clase-presencial"
                    />
                  </label>
                  <label className="profile-tutor-field">
                    <span>Ciudad, zona y cómo reservar (si no usas Calendly)</span>
                    <textarea
                      rows={4}
                      value={inPersonInfo}
                      onChange={(e) => setInPersonInfo(e.target.value)}
                      placeholder="Ej.: Madrid centro · Clases en academia / a domicilio · Escríbeme a…"
                      maxLength={800}
                    />
                  </label>
                </>
              ) : null}
            </fieldset>

            <label className="profile-tutor-field">
              <span>Presentación breve (opcional)</span>
              <textarea
                rows={3}
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Especialidad, niveles Cambridge, experiencia…"
                maxLength={600}
              />
            </label>

            <label className="profile-tutor-checkbox">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span>Mostrar mi perfil a los alumnos</span>
            </label>

            {error ? <p className="profile-tutor-error">{error}</p> : null}
            {message ? <p className="profile-tutor-success">{message}</p> : null}

            <button type="submit" className="quick-action-btn" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar clases online y presenciales'}
            </button>
          </form>
        </section>

        {(offersOnline && calendlyUrl) || offersInPerson ? (
          <section className="profile-section">
            <div className="section-head">
              <h2>👀 Vista previa</h2>
            </div>
            <TeacherCard
              name="Tu perfil"
              presentation={presentation}
              offersOnline={offersOnline && Boolean(calendlyUrl)}
              offersInPerson={offersInPerson}
              calendlyUrl={calendlyUrl}
              calendlyUrlInPerson={calendlyUrlInPerson}
              inPersonInfo={inPersonInfo}
              email=""
              isAssigned={false}
              preview
            />
          </section>
        ) : null}
      </>
    );
  }

  return (
    <>
      <ProfilePrivateTutorStyles />
      <section className="profile-section">
        <div className="section-head">
          <h2>👨‍🏫 Consigue tu profesor particular</h2>
        </div>
        <p className="section-desc">
          Reserva clases personalizadas con profesores de Dralo: online por videollamada o
          presenciales según ciudad y disponibilidad.
        </p>
      </section>

      {error ? (
        <section className="profile-section">
          <p className="profile-tutor-error">{error}</p>
        </section>
      ) : null}

      {teachers.length === 0 ? (
        <section className="profile-section">
          <p className="section-desc">
            Todavía no hay profesores con clases publicadas. Vuelve pronto o contacta con soporte.
          </p>
        </section>
      ) : (
        <>
          <section className="profile-section">
            <div className="section-head">
              <h2>💻 Clases online</h2>
              <span className="count">{onlineTeachers.length}</span>
            </div>
            {onlineTeachers.length === 0 ? (
              <p className="section-desc">Ningún profesor tiene agenda online publicada aún.</p>
            ) : (
              <div className="skills-grid">
                {onlineTeachers.map((teacher) => (
                  <TeacherCard key={`online-${teacher.id}`} {...teacher} mode="online" />
                ))}
              </div>
            )}
          </section>

          <section className="profile-section">
            <div className="section-head">
              <h2>📍 Clases presenciales</h2>
              <span className="count">{inPersonTeachers.length}</span>
            </div>
            {inPersonTeachers.length === 0 ? (
              <p className="section-desc">Ningún profesor tiene clases presenciales publicadas aún.</p>
            ) : (
              <div className="skills-grid">
                {inPersonTeachers.map((teacher) => (
                  <TeacherCard key={`inperson-${teacher.id}`} {...teacher} mode="inperson" />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="profile-section">
        <div className="section-head">
          <h2>ℹ️ Cómo funciona</h2>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b', lineHeight: 1.55 }}>
          <li>
            <strong>Online:</strong> pulsa reservar y elige fecha/hora en Calendly del profesor.
          </li>
          <li>
            <strong>Presencial:</strong> reserva por Calendly o sigue las instrucciones de ciudad y
            contacto del profesor.
          </li>
          <li>Tu profesor asignado aparece primero en cada listado.</li>
        </ul>
      </section>
    </>
  );
}

function TeacherCard({
  name,
  presentation,
  email,
  offersOnline,
  offersInPerson,
  calendlyUrl,
  calendlyUrlInPerson,
  inPersonInfo,
  isAssigned,
  preview = false,
  mode = 'full',
}) {
  const showOnline = mode === 'full' || mode === 'online';
  const showInPerson = mode === 'full' || mode === 'inperson';

  return (
    <div className="skill-card profile-tutor-card">
      <div className="skill-name">
        {name}
        {isAssigned ? <span className="profile-tutor-badge">Tu profesor</span> : null}
      </div>

      <div className="profile-tutor-modalities">
        {offersOnline ? <span className="profile-tutor-modality profile-tutor-modality--online">Online</span> : null}
        {offersInPerson ? (
          <span className="profile-tutor-modality profile-tutor-modality--inperson">Presencial</span>
        ) : null}
      </div>

      {presentation ? (
        <p className="profile-tutor-presentation">{presentation}</p>
      ) : (
        <p className="profile-tutor-presentation profile-tutor-presentation--muted">
          Clases personalizadas de inglés.
        </p>
      )}

      <div className="profile-tutor-actions">
        {showOnline && offersOnline && calendlyUrl ? (
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-action-btn profile-tutor-action"
          >
            {preview ? 'Calendly online (vista previa)' : 'Reservar clase online →'}
          </a>
        ) : null}

        {showInPerson && offersInPerson ? (
          <>
            {calendlyUrlInPerson ? (
              <a
                href={calendlyUrlInPerson}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-action-btn profile-tutor-action profile-tutor-action--secondary"
              >
                {preview ? 'Calendly presencial (vista previa)' : 'Reservar clase presencial →'}
              </a>
            ) : null}
            {inPersonInfo ? (
              <p className="profile-tutor-inperson-info">{inPersonInfo}</p>
            ) : null}
            {!calendlyUrlInPerson && inPersonInfo && email && !preview ? (
              <a href={`mailto:${email}?subject=Clase presencial Dralo`} className="profile-tutor-contact-link">
                Contactar para reservar presencial →
              </a>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function ProfilePrivateTutorStyles() {
  return (
    <style jsx global>{`
      .profile-tutor-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 720px;
      }
      .profile-tutor-fieldset {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .profile-tutor-fieldset legend {
        padding: 0 6px;
        font-weight: 700;
        color: var(--text);
      }
      .profile-tutor-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 14px;
        color: var(--text);
      }
      .profile-tutor-field input,
      .profile-tutor-field textarea {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font: inherit;
        background: #fff;
      }
      .profile-tutor-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        color: #475569;
      }
      .profile-tutor-checkbox input {
        margin-top: 3px;
      }
      .profile-tutor-error {
        color: #dc2626;
        margin: 0;
        font-size: 14px;
      }
      .profile-tutor-success {
        color: #047857;
        margin: 0;
        font-size: 14px;
      }
      .profile-tutor-card {
        text-align: left;
      }
      .profile-tutor-modalities {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .profile-tutor-modality {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .profile-tutor-modality--online {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .profile-tutor-modality--inperson {
        background: #dcfce7;
        color: #166534;
      }
      .profile-tutor-presentation {
        margin: 10px 0 0;
        font-size: 14px;
        line-height: 1.5;
        color: #475569;
      }
      .profile-tutor-presentation--muted {
        color: #94a3b8;
      }
      .profile-tutor-badge {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 8px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 11px;
        font-weight: 700;
        vertical-align: middle;
      }
      .profile-tutor-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }
      .profile-tutor-action {
        display: block;
        font-size: 14px;
        padding: 12px 14px;
        text-align: center;
      }
      .profile-tutor-action--secondary {
        background: #ecfdf5;
        color: #047857;
      }
      .profile-tutor-inperson-info {
        margin: 0;
        padding: 12px;
        border-radius: 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        font-size: 13px;
        line-height: 1.5;
        color: #475569;
        white-space: pre-wrap;
      }
      .profile-tutor-contact-link {
        font-size: 13px;
        font-weight: 700;
        color: #0070f3;
        text-decoration: none;
      }
      .profile-tutor-contact-link:hover {
        text-decoration: underline;
      }
    `}</style>
  );
}
