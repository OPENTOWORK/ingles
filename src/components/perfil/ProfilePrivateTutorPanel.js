'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
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
      throw new Error(json.error || 'Could not load your tutoring profile.');
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
      throw new Error(json.error || 'Could not load the teacher list.');
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
        if (!cancelled) setError(err.message || 'Load error.');
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
        throw new Error(json.error || 'Could not save.');
      }
      setMessage('Tutoring profile saved. Students can now book with you.');
      applyProfile(json.profile);
    } catch (err) {
      setError(err.message || 'Error saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <div className="profile-tab-panels">
          <ProfileCollapsibleSection title="Private tutor">
            <p className="section-desc">Loading private tutoring…</p>
          </ProfileCollapsibleSection>
        </div>
      </>
    );
  }

  if (!tablesReady) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <div className="profile-tab-panels">
          <ProfileCollapsibleSection title="Find your private tutor">
            <p className="section-desc">
              The booking module is not active in the database yet. Run{' '}
              <code>scripts/profesor_calendly.sql</code> in Supabase.
            </p>
          </ProfileCollapsibleSection>
        </div>
      </>
    );
  }

  if (isTeacher) {
    return (
      <>
        <ProfilePrivateTutorStyles />
        <div className="profile-tab-panels">
        <ProfileCollapsibleSection title="Tutoring settings" defaultOpen>
          <p className="section-desc">
            Set how students can book you: video calls via Calendly and/or in-person lessons with
            a booking link or location details.
          </p>

          <form onSubmit={handleSave} className="profile-tutor-form">
            <fieldset className="profile-tutor-fieldset">
              <legend>💻 Online lessons</legend>
              <label className="profile-tutor-checkbox">
                <input
                  type="checkbox"
                  checked={offersOnline}
                  onChange={(e) => setOffersOnline(e.target.checked)}
                />
                <span>I offer personalised online lessons</span>
              </label>
              {offersOnline ? (
                <label className="profile-tutor-field">
                  <span>Calendly link (online)</span>
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
              <legend>📍 In-person lessons</legend>
              <label className="profile-tutor-checkbox">
                <input
                  type="checkbox"
                  checked={offersInPerson}
                  onChange={(e) => setOffersInPerson(e.target.checked)}
                />
                <span>I offer in-person lessons</span>
              </label>
              {offersInPerson ? (
                <>
                  <label className="profile-tutor-field">
                    <span>In-person Calendly (optional)</span>
                    <input
                      type="url"
                      value={calendlyUrlInPerson}
                      onChange={(e) => setCalendlyUrlInPerson(e.target.value)}
                      placeholder="https://calendly.com/tu-usuario/clase-presencial"
                    />
                  </label>
                  <label className="profile-tutor-field">
                    <span>City, area and how to book (if not using Calendly)</span>
                    <textarea
                      rows={4}
                      value={inPersonInfo}
                      onChange={(e) => setInPersonInfo(e.target.value)}
                      placeholder="E.g. Central Madrid · Academy / home lessons · Email me at…"
                      maxLength={800}
                    />
                  </label>
                </>
              ) : null}
            </fieldset>

            <label className="profile-tutor-field">
              <span>Short bio (optional)</span>
              <textarea
                rows={3}
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Specialism, Cambridge levels, experience…"
                maxLength={600}
              />
            </label>

            <label className="profile-tutor-checkbox">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span>Show my profile to students</span>
            </label>

            {error ? <p className="profile-tutor-error">{error}</p> : null}
            {message ? <p className="profile-tutor-success">{message}</p> : null}

            <button type="submit" className="quick-action-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save online & in-person lessons'}
            </button>
          </form>
        </ProfileCollapsibleSection>

        {(offersOnline && calendlyUrl) || offersInPerson ? (
          <ProfileCollapsibleSection title="Profile preview">
            <TeacherCard
              name="Your profile"
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
          </ProfileCollapsibleSection>
        ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <ProfilePrivateTutorStyles />
      <div className="profile-tab-panels">
      <ProfileCollapsibleSection title="Find your private tutor" defaultOpen>
        <p className="section-desc">
          Book personalised lessons with Dralo teachers: online by video call or in person
          depending on city and availability.
        </p>
      </ProfileCollapsibleSection>

      {error ? (
        <ProfileCollapsibleSection title="Private tutor">
          <p className="profile-tutor-error">{error}</p>
        </ProfileCollapsibleSection>
      ) : null}

      {teachers.length === 0 ? (
        <ProfileCollapsibleSection title="Available teachers">
          <p className="section-desc">
            No teachers have published lessons yet. Check back soon or contact support.
          </p>
        </ProfileCollapsibleSection>
      ) : (
        <>
          <ProfileCollapsibleSection title="Online lessons">
            {onlineTeachers.length === 0 ? (
              <p className="section-desc">No teacher has published an online schedule yet.</p>
            ) : (
              <div className="skills-grid">
                {onlineTeachers.map((teacher) => (
                  <TeacherCard key={`online-${teacher.id}`} {...teacher} mode="online" />
                ))}
              </div>
            )}
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection title="In-person lessons">
            {inPersonTeachers.length === 0 ? (
              <p className="section-desc">No teacher has published in-person lessons yet.</p>
            ) : (
              <div className="skills-grid">
                {inPersonTeachers.map((teacher) => (
                  <TeacherCard key={`inperson-${teacher.id}`} {...teacher} mode="inperson" />
                ))}
              </div>
            )}
          </ProfileCollapsibleSection>
        </>
      )}

      <ProfileCollapsibleSection title="How it works">
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b', lineHeight: 1.55 }}>
          <li>
            <strong>Online:</strong> click book and choose a date/time on the teacher&apos;s Calendly.
          </li>
          <li>
            <strong>In person:</strong> book via Calendly or follow the teacher&apos;s city and
            contact instructions.
          </li>
          <li>Your assigned teacher appears first in each list.</li>
        </ul>
      </ProfileCollapsibleSection>
      </div>
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
        {isAssigned ? <span className="profile-tutor-badge">Your teacher</span> : null}
      </div>

      <div className="profile-tutor-modalities">
        {offersOnline ? <span className="profile-tutor-modality profile-tutor-modality--online">Online</span> : null}
        {offersInPerson ? (
          <span className="profile-tutor-modality profile-tutor-modality--inperson">In person</span>
        ) : null}
      </div>

      {presentation ? (
        <p className="profile-tutor-presentation">{presentation}</p>
      ) : (
        <p className="profile-tutor-presentation profile-tutor-presentation--muted">
          Personalised English lessons.
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
                {preview ? 'In-person Calendly (preview)' : 'Book in-person lesson →'}
              </a>
            ) : null}
            {inPersonInfo ? (
              <p className="profile-tutor-inperson-info">{inPersonInfo}</p>
            ) : null}
            {!calendlyUrlInPerson && inPersonInfo && email && !preview ? (
              <a href={`mailto:${email}?subject=In-person lesson Dralo`} className="profile-tutor-contact-link">
                Contact to book in person →
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
