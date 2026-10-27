import { MINIMAL_LANDING_PATH_PREFIXES, isMinimalLandingPath } from '@/utils/minimalLandingRoutes';

/** Clase en <html> mientras dura la decoración de Halloween. */
export const HALLOWEEN_CLASS = 'theme-halloween';

/** Hora de Madrid (CET): del 27 de octubre hasta el 1 de noviembre a las 24:00. */
export const HALLOWEEN_STARTS_AT = Date.parse('2026-10-27T00:00:00+01:00');
export const HALLOWEEN_ENDS_AT = Date.parse('2026-11-02T00:00:00+01:00');

export const HALLOWEEN_BATS_SESSION_KEY = 'dralo-halloween-2026-bats';

export function isHalloweenActive(now = Date.now()) {
  const time = now instanceof Date ? now.getTime() : now;
  return time >= HALLOWEEN_STARTS_AT && time < HALLOWEEN_ENDS_AT;
}

/** Las landings de anuncios y sus variantes A/B no se decoran para no alterar el experimento. */
export function isHalloweenThemedPath(pathname = '') {
  return !isMinimalLandingPath(pathname);
}

/** Va en línea dentro del <head> para que la decoración esté desde el primer pintado. */
export const HALLOWEEN_BOOT_SCRIPT = `(function(){try{var n=Date.now();if(n<${HALLOWEEN_STARTS_AT}||n>=${HALLOWEEN_ENDS_AT})return;var p=location.pathname,x=${JSON.stringify(MINIMAL_LANDING_PATH_PREFIXES)};for(var i=0;i<x.length;i++){if(p===x[i]||p.indexOf(x[i]+'/')===0)return;}document.documentElement.classList.add('${HALLOWEEN_CLASS}');}catch(e){}})();`;
