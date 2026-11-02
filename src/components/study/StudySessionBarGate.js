'use client';

import { usePathname } from 'next/navigation';
import { isExamStrategiesPath } from '@/config/appRoutes';
import StudySessionBar from '@/components/study/StudySessionBar';

/**
 * Botón de estudio para cualquier usuario con sesión.
 * Sigue oculto en Exam Strategies, donde el seguimiento no aplica.
 */
export default function StudySessionBarGate({ session }) {
  const pathname = usePathname() || '';

  if (isExamStrategiesPath(pathname)) {
    return null;
  }

  if (!session?.access_token) {
    return null;
  }

  return <StudySessionBar session={session} />;
}
