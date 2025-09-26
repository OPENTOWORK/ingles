'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ExamExitWarning from './ExamExitWarning';

export default function ExamNavigationGuard({ children }) {
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detectar si estamos en un examen
  const isInExam = pathname.includes('/niveles/') && pathname.includes('/exam-') && pathname.includes('/part-');

  // Interceptar navegación cuando estamos en un examen
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInExam) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu progreso se perderá.';
        return e.returnValue;
      }
    };

    const handleClick = (e) => {
      // Verificar si el clic es en un enlace de navegación del header
      const link = e.target.closest('a');
      if (link && isInExam) {
        const href = link.getAttribute('href');
        
        // Interceptar enlaces que nos saquen del examen
        if (href && !href.includes('/niveles/') && !href.includes('/exam-') && !href.includes('/part-')) {
          // Verificar si es del header principal por la clase o estructura
          const isHeaderLink = link.closest('header') || 
                               link.closest('.nav') || 
                               link.closest('nav') ||
                               link.textContent?.toLowerCase().includes('home') ||
                               link.textContent?.toLowerCase().includes('levels') ||
                               link.textContent?.toLowerCase().includes('theory') ||
                               link.textContent?.toLowerCase().includes('training') ||
                               link.textContent?.toLowerCase().includes('profile');
          
          if (isHeaderLink) {
            console.log('🚨 Interceptando navegación desde examen:', href);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            setPendingNavigation(href);
            setShowExitWarning(true);
          }
        }
      }
    };

    // Interceptar clics en botones de navegación del header
    const handleButtonClick = (e) => {
      const button = e.target.closest('button');
      if (button && isInExam) {
        // Solo interceptar botones del header principal
        const header = button.closest('header');
        if (header) {
          const buttonText = button.textContent?.toLowerCase();
          
          // Detectar botones de navegación del header
          if (buttonText?.includes('logout')) {
            e.preventDefault();
            e.stopPropagation();
            setPendingNavigation('/login');
            setShowExitWarning(true);
          }
        }
      }
    };

    if (isInExam) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      // Usar capture: true para interceptar antes que otros listeners
      document.addEventListener('click', handleClick, { capture: true });
      document.addEventListener('click', handleButtonClick, { capture: true });
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, { capture: true });
      document.removeEventListener('click', handleButtonClick, { capture: true });
    };
  }, [isInExam]);

  const handleSaveAndExit = () => {
    setShowExitWarning(false);
    setTimeout(() => {
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    }, 100);
  };

  const handleExitWithoutSaving = () => {
    setShowExitWarning(false);
    setTimeout(() => {
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    }, 100);
  };

  const handleRestartExam = () => {
    setShowExitWarning(false);
    setTimeout(() => {
      // Navegar a la primera parte del examen
      const examPath = pathname.split('/').slice(0, 5).join('/'); // /niveles/c1/exam-1
      router.push(`${examPath}/part-1`);
    }, 100);
  };

  const handleCancel = () => {
    setShowExitWarning(false);
    setPendingNavigation(null);
  };

  return (
    <>
      {children}
      {isInExam && (
        <ExamExitWarning
          isOpen={showExitWarning}
          onClose={handleCancel}
          onSaveAndExit={handleSaveAndExit}
          onExitWithoutSaving={handleExitWithoutSaving}
          onRestart={handleRestartExam}
        />
      )}
    </>
  );
}
