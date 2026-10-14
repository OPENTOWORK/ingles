/** Clase en <html> cuando el navegador guarda la cookie de sesión de Supabase. */
export const SESSION_HINT_CLASS = 'has-stored-session';

/**
 * Va en línea dentro del <head> para ejecutarse antes del primer pintado.
 * Con `beforeInteractive` llegaría tarde: Next lo lanza al cargar el JS.
 */
export const SESSION_HINT_BOOT_SCRIPT = `(function(){try{if(/(?:^|;\\s*)sb-[^=]*-auth-token(?:\\.\\d+)?=/.test(document.cookie))document.documentElement.classList.add('${SESSION_HINT_CLASS}');}catch(e){}})();`;
