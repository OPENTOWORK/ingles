'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirige la ruta antigua al apartado Dralo AI con el mismo formato que Reading / UoE. */
export default function SpeakingLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dralo-ai/speaking');
  }, [router]);

  return null;
}
