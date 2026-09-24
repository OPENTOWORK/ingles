'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { isStudentRole } from '@/utils/authRoles';
import { isRoleConfirmedForSession } from '@/lib/userRoleResolution';
import FormularioRunner from '@/components/formularios/FormularioRunner';
import styles from './WelcomeFormGate.module.css';

const DONE_KEY_PREFIX = 'dralo:welcome-form-done:';

function isMarkedDone(userId) {
  try {
    return window.sessionStorage.getItem(`${DONE_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

function markDone(userId) {
  try {
    window.sessionStorage.setItem(`${DONE_KEY_PREFIX}${userId}`, '1');
  } catch {
    /* ignore */
  }
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Formulario de bienvenida: se muestra al alumno con el correo confirmado hasta que lo envía. */
export default function WelcomeFormGate({ session, userRole, roleConfirmedForUserId }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const user = session?.user || null;
  const userId = user?.id || null;
  const eligible =
    Boolean(userId) &&
    Boolean(user?.email_confirmed_at || user?.confirmed_at) &&
    isRoleConfirmedForSession(session, roleConfirmedForUserId) &&
    isStudentRole(userRole);

  useEffect(() => {
    setForm(null);
    setError('');
    if (!eligible || isMarkedDone(userId)) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/formularios/bienvenida/', { headers: await getAuthHeaders() });
        const json = await res.json().catch(() => ({}));
        if (cancelled || !res.ok) return;
        if (!json.form || json.answered) {
          markDone(userId);
          return;
        }
        setForm(json.form);
      } catch {
        /* sin conexión: se volverá a intentar en la próxima carga */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eligible, userId]);

  useEffect(() => {
    if (!form) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [form]);

  const submit = async (answers) => {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/formularios/bienvenida/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ formularioId: form.id, respuestas: answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se han podido guardar tus respuestas.');
      markDone(userId);
      setForm(null);
      toast.success('¡Gracias! Hemos guardado tus respuestas.');
    } catch (err) {
      setError(err.message || 'No se han podido guardar tus respuestas.');
    } finally {
      setSaving(false);
    }
  };

  if (!form || typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={form.titulo}>
      <div className={styles.panel}>
        <FormularioRunner
          form={form}
          showHeader
          finishLabel="Enviar"
          saving={saving}
          error={error}
          onFinish={submit}
        />
      </div>
    </div>,
    document.body,
  );
}
