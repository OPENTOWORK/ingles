'use client';

import { supabase } from '@/utils/supabaseClient';

/** Cabeceras autenticadas para las llamadas del área financiera. */
export async function getFinanceHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;

  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

/**
 * Llama a la API financiera y normaliza los errores en mensajes legibles.
 * @param {string} path
 * @param {{ method?: string, body?: object, params?: object, signal?: AbortSignal }} options
 */
export async function financeFetch(path, { method = 'GET', body, params, signal } = {}) {
  const headers = await getFinanceHeaders();

  let url = path;
  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '' || value === 'all') continue;
      search.set(key, String(value));
    }
    const qs = search.toString();
    if (qs) url = `${path}?${qs}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.error || 'No se ha podido completar la operación.');
    error.status = response.status;
    error.details = payload?.errors || null;
    throw error;
  }

  return payload || {};
}

/** Genera una clave de idempotencia para operaciones de cobro/pago. */
export function newIdempotencyKey(prefix = 'ui') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}:${random}`;
}
