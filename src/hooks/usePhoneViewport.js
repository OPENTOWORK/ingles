'use client';

import { useEffect, useState } from 'react';

const PHONE_VIEWPORT_MQ = '(max-width: 639px)';

/**
 * True en móvil (mismo corte que las reglas `--phone-only` de CSS).
 * Arranca en false para que el servidor y el cliente pinten lo mismo.
 */
export function usePhoneViewport() {
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(PHONE_VIEWPORT_MQ);
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return phone;
}

export default usePhoneViewport;
