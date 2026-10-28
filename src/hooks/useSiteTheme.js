'use client';

import { useSyncExternalStore } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  DEFAULT_SITE_THEME,
  SITE_THEME_STORAGE_KEY,
  parseSiteThemeState,
  resolveSiteTheme,
} from '@/lib/siteTheme';

/** Hasta leer este navegador no se sabe el tema: la clase que puso el script del <head> se respeta. */
const UNKNOWN = Object.freeze({ theme: DEFAULT_SITE_THEME, until: null, known: false });

let current = UNKNOWN;
let request = null;
let choices = 0;
const listeners = new Set();

function publish({ theme, until }) {
  current = { theme, until, known: true };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStoredTheme() {
  try {
    return parseSiteThemeState(JSON.parse(window.localStorage.getItem(SITE_THEME_STORAGE_KEY)));
  } catch {
    return null;
  }
}

function storeTheme(state) {
  try {
    window.localStorage.setItem(SITE_THEME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* modo privado */
  }
}

/** Una vez por carga de página: primero lo último que vio este navegador y luego lo que diga el servidor. */
export function loadSiteTheme() {
  if (request) return request;
  publish(readStoredTheme() || resolveSiteTheme(null));
  const choicesAtStart = choices;
  request = fetch('/api/site-theme/', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      const state = parseSiteThemeState(body);
      if (!state || choicesAtStart !== choices) return;
      storeTheme(state);
      publish(state);
    })
    .catch(() => {});
  return request;
}

/** Solo administradores; el servidor lo vuelve a comprobar y deja el cambio en el historial. */
export async function chooseSiteTheme(themeId) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch('/api/admin/site-theme/', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ theme: themeId }),
  });
  const body = await res.json().catch(() => ({}));
  const state = res.ok ? parseSiteThemeState(body) : null;
  if (!state) throw new Error(body?.error || 'No se pudo cambiar el tema.');
  choices += 1;
  storeTheme(state);
  publish(state);
  return state;
}

export function useSiteTheme() {
  return useSyncExternalStore(subscribe, () => current, () => UNKNOWN);
}
