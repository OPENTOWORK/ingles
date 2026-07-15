'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { userHasRole } from '@/utils/authRoles';

async function getAdminHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token || null;
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

/**
 * Recuadro admin debajo de cada parte: muestra el prompt actual (Supabase) y permite editarlo.
 */
export default function AdminExamPartPromptBox({
  enabled = false,
  slug = 'b2',
  partNumber,
  examSlot = 1,
  lang = 'es',
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [meta, setMeta] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [dirty, setDirty] = useState(false);

  const isEn = lang === 'en';
  const part = Number(partNumber);

  useEffect(() => {
    if (!enabled) {
      setIsAdmin(false);
      return;
    }
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      const admin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      setIsAdmin(admin);
    })();
  }, [enabled]);

  const applyPrompt = useCallback((prompt) => {
    setMeta(prompt);
    setSystemPrompt(prompt.system || '');
    setUserPrompt(prompt.user || '');
    setIsCustom(Boolean(prompt.isCustom));
    setDirty(false);
  }, []);

  const loadPrompt = useCallback(async () => {
    if (!isAdmin || !Number.isFinite(part) || part <= 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminHeaders();
      const qs = new URLSearchParams({
        slug: String(slug || 'b2').toLowerCase(),
        partNumber: String(part),
        slot: String(examSlot || 1),
      });
      const res = await fetch(buildClientApiUrl(`/api/admin/levels/exam-part-prompt?${qs}`), {
        headers,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo cargar el prompt.');

      applyPrompt(json.prompt || {});
    } catch (e) {
      setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, slug, part, examSlot, applyPrompt]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadPrompt();
  }, [isAdmin, loadPrompt]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(buildClientApiUrl('/api/admin/levels/exam-part-prompt'), {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          slug,
          partNumber: part,
          slot: examSlot,
          systemPrompt,
          userPrompt,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar el prompt.');

      applyPrompt(json.prompt || {});
      setSuccess(isEn ? 'Prompt saved to Supabase.' : 'Prompt guardado en Supabase.');
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(buildClientApiUrl('/api/admin/levels/exam-part-prompt'), {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          slug,
          partNumber: part,
          slot: examSlot,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo restaurar el prompt.');

      applyPrompt(json.prompt || {});
      setSuccess(
        isEn
          ? 'Code default prompt restored in Supabase.'
          : 'Prompt del código restaurado en Supabase.',
      );
    } catch (e) {
      setError(e.message || 'Error al restaurar');
    } finally {
      setSaving(false);
    }
  };

  const handleStartBlank = () => {
    setUserPrompt('');
    setDirty(true);
    setSuccess('');
    setError('');
  };

  if (!enabled || !isAdmin || !Number.isFinite(part) || part <= 0) return null;

  return (
    <div className="admin-exam-prompt-box">
      <button
        type="button"
        className="admin-exam-prompt-box__toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
      >
        <span>
          {isEn ? `Generation prompt — Part ${part}` : `Prompt de generación — Parte ${part}`}
          {meta?.partTitle ? ` · ${meta.partTitle}` : ''}
        </span>
        <span className="admin-exam-prompt-box__toggle-meta">
          {isCustom ? (
            <span className="admin-exam-prompt-box__badge admin-exam-prompt-box__badge--edited">
              {isEn ? 'Edited' : 'Editado'}
            </span>
          ) : (
            <span className="admin-exam-prompt-box__badge admin-exam-prompt-box__badge--default">
              {isEn ? 'From code' : 'Del código'}
            </span>
          )}
          {dirty ? (
            <span className="admin-exam-prompt-box__badge admin-exam-prompt-box__badge--dirty">
              {isEn ? 'Unsaved' : 'Sin guardar'}
            </span>
          ) : null}
          <span className="admin-exam-prompt-box__chevron">{collapsed ? '▼' : '▲'}</span>
        </span>
      </button>

      {!collapsed ? (
        <div className="admin-exam-prompt-box__body">
          <p className="admin-exam-prompt-box__hint">
            {isEn
              ? 'This is the prompt DRALO AI uses to generate this part. It is stored in Supabase so you can review, fix or rewrite it. Changes apply when you regenerate the part.'
              : 'Este es el prompt que DRALO AI usa para generar esta parte. Está guardado en Supabase para que puedas revisarlo, corregirlo o reescribirlo. Los cambios se aplican al regenerar la parte.'}
          </p>

          {meta?.topic ? (
            <p className="admin-exam-prompt-box__meta">
              {isEn ? 'Sample theme for this slot' : 'Tema de ejemplo para este examen'}:{' '}
              <strong>{meta.topic}</strong>
            </p>
          ) : null}

          {loading ? (
            <p className="admin-exam-prompt-box__status">{isEn ? 'Loading prompt…' : 'Cargando prompt…'}</p>
          ) : (
            <>
              <label className="admin-exam-prompt-box__label">
                {isEn ? 'System prompt' : 'Prompt de sistema'}
                <textarea
                  className="admin-exam-prompt-box__textarea admin-exam-prompt-box__textarea--sm"
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => {
                    setSystemPrompt(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>

              <label className="admin-exam-prompt-box__label">
                {isEn ? 'User prompt (main)' : 'Prompt de usuario (principal)'}
                <textarea
                  className="admin-exam-prompt-box__textarea"
                  rows={16}
                  value={userPrompt}
                  onChange={(e) => {
                    setUserPrompt(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>

              <div className="admin-exam-prompt-box__actions">
                <button
                  type="button"
                  className="admin-exam-prompt-box__btn admin-exam-prompt-box__btn--primary"
                  onClick={handleSave}
                  disabled={saving || !userPrompt.trim()}
                >
                  {saving ? (isEn ? 'Saving…' : 'Guardando…') : isEn ? 'Save changes' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="admin-exam-prompt-box__btn"
                  onClick={handleReset}
                  disabled={saving}
                >
                  {isEn ? 'Restore code default' : 'Restaurar prompt del código'}
                </button>
                <button
                  type="button"
                  className="admin-exam-prompt-box__btn"
                  onClick={handleStartBlank}
                  disabled={saving}
                >
                  {isEn ? 'Start from blank' : 'Empezar en blanco'}
                </button>
                <button
                  type="button"
                  className="admin-exam-prompt-box__btn"
                  onClick={() => void loadPrompt()}
                  disabled={saving || loading}
                >
                  {isEn ? 'Reload' : 'Recargar'}
                </button>
              </div>
            </>
          )}

          {error ? (
            <p className="admin-exam-prompt-box__error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="admin-exam-prompt-box__success" role="status">
              {success}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
