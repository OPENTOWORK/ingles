/** Captura `beforeinstallprompt` en cuanto carga el cliente; el botón de la home llega más tarde. */

let promptEvent = null;
const listeners = new Set();

function notify(next) {
  promptEvent = next;
  listeners.forEach((fn) => fn(next));
}

export function capturePwaInstallPrompt() {
  if (typeof window === 'undefined' || window.__draloPwaInstallBound) return;
  window.__draloPwaInstallBound = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    notify(event);
  });

  window.addEventListener('appinstalled', () => {
    notify(null);
  });
}

export function getPwaInstallPrompt() {
  return promptEvent;
}

export function subscribePwaInstallPrompt(fn) {
  listeners.add(fn);
  fn(promptEvent);
  return () => listeners.delete(fn);
}
