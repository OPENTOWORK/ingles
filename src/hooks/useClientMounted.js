'use client';

import { useEffect, useState } from 'react';

/** True tras el primer paint del cliente (seguro para componentes solo-cliente). */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
