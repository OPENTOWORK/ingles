import { MINIMAL_LANDING_PATH_PREFIXES, isMinimalLandingPath } from '@/utils/minimalLandingRoutes';

/** Fila de config_parametros donde un administrador guarda el tema de toda la web. */
export const SITE_THEME_SETTING_KEY = 'web.tema';

export const SITE_THEMES = [
  { id: 'normal', label: 'Normal' },
  { id: 'halloween', label: 'Halloween' },
  { id: 'navidad', label: 'Navidad' },
];

export const DEFAULT_SITE_THEME = 'normal';

const SITE_THEME_IDS = SITE_THEMES.map((theme) => theme.id);

/** Cada tema decorado es una clase theme-<id> en <html>. */
export const DECORATED_SITE_THEMES = SITE_THEME_IDS.filter((id) => id !== DEFAULT_SITE_THEME);

/** Último tema conocido en este navegador, para pintarlo antes de preguntar al servidor. */
export const SITE_THEME_STORAGE_KEY = 'dralo-site-theme';

/** Mientras ningún administrador elija tema, Halloween sigue hasta el 1 de noviembre a las 24:00 (Madrid). */
export const HALLOWEEN_ENDS_AT = Date.parse('2026-11-02T00:00:00+01:00');

export function isSiteThemeId(value) {
  return SITE_THEME_IDS.includes(value);
}

export function siteThemeClass(themeId) {
  return `theme-${themeId}`;
}

export function siteThemeLabel(themeId) {
  return SITE_THEMES.find((theme) => theme.id === themeId)?.label || themeId;
}

/** Un tema guardado no caduca; sin tema guardado manda el calendario. */
export function resolveSiteTheme(saved, now = Date.now()) {
  const value = typeof saved === 'string' ? saved.trim().toLowerCase() : '';
  if (isSiteThemeId(value)) return { theme: value, until: null };
  if (now < HALLOWEEN_ENDS_AT) return { theme: 'halloween', until: HALLOWEEN_ENDS_AT };
  return { theme: DEFAULT_SITE_THEME, until: null };
}

/** Lo que llega del servidor o de localStorage; null si no es un tema conocido. */
export function parseSiteThemeState(value) {
  if (!value || !isSiteThemeId(value.theme)) return null;
  const until = Number(value.until);
  return { theme: value.theme, until: Number.isFinite(until) && until > 0 ? until : null };
}

export function activeSiteTheme(state, now = Date.now()) {
  if (!state || !isSiteThemeId(state.theme)) return DEFAULT_SITE_THEME;
  if (state.until && now >= state.until) return DEFAULT_SITE_THEME;
  return state.theme;
}

/** Las landings de anuncios y sus variantes A/B no se decoran para no alterar el experimento. */
export function isSiteThemedPath(pathname = '') {
  return !isMinimalLandingPath(pathname);
}

/** Va en línea dentro del <head> para que la decoración esté desde el primer pintado. */
export const SITE_THEME_BOOT_SCRIPT = `(function(){try{var p=location.pathname,x=${JSON.stringify(MINIMAL_LANDING_PATH_PREFIXES)};for(var i=0;i<x.length;i++){if(p===x[i]||p.indexOf(x[i]+'/')===0)return;}var n=Date.now(),t=${JSON.stringify(SITE_THEME_IDS)},s=null;try{s=JSON.parse(localStorage.getItem('${SITE_THEME_STORAGE_KEY}'));}catch(e){}if(!s||t.indexOf(s.theme)<0)s=n<${HALLOWEEN_ENDS_AT}?{theme:'halloween',until:${HALLOWEEN_ENDS_AT}}:{theme:'${DEFAULT_SITE_THEME}'};var u=Number(s.until);if(u>0&&n>=u)return;if(s.theme!=='${DEFAULT_SITE_THEME}')document.documentElement.classList.add('theme-'+s.theme);}catch(e){}})();`;
