'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ExamNavigationGuard({ children }) {
  const pathname = usePathname();

  const isInExam = pathname.includes('/niveles/') && pathname.includes('/exam-') && pathname.includes('/part-');

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInExam) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu progreso se perderá.';
        return e.returnValue;
      }
    };

    if (isInExam) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInExam]);

  return children;
}
