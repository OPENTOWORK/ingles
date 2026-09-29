const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID_PATTERN = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i;

export function getGoogleClientId() {
  const raw = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
  return CLIENT_ID_PATTERN.test(raw) ? raw : '';
}

/** Nonce crudo para Supabase + hash SHA-256 hex para Google. */
export async function createGoogleIdTokenNonce() {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return { nonce, hashedNonce };
}

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity solo funciona en el navegador.'));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  const existing = document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('No se pudo cargar Google.'));
    document.head.appendChild(script);
  });
}
