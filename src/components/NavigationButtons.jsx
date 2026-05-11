'use client';

import { useExam } from '@/context/ExamContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NavigationButtons({ part }) {
  const partString = typeof part === 'string' ? part : '';
  const parsedNum = Number.parseInt(partString.split('-')[1], 10);
  const hasValidPart = Number.isFinite(parsedNum);
  const prevPart = hasValidPart && parsedNum > 1
    ? `/niveles/c1/exam-1/part-${parsedNum - 1}`
    : null;
  const nextPart = hasValidPart && parsedNum < 18
    ? `/niveles/c1/exam-1/part-${parsedNum + 1}`
    : null;
  const homeLevel = '/niveles/c1';

  const { globalStart, clearAllAnswers } = useExam();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (e, href) => {
    if (/^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname) && globalStart) {
      const confirmLeave = window.confirm(
        "⚠️ Estás a punto de salir del examen.\n\nPerderás todo tu progreso si continúas.\n¿Deseas salir?"
      );
      if (!confirmLeave) {
        e.preventDefault();
        return;
      }
      clearAllAnswers(); // Si confirma salir, reseteamos
    }
    router.push(href);
  };

  return (
    <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
      {prevPart ? (
        <button
          onClick={(e) => handleNavigate(e, prevPart)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          ← Anterior
        </button>
      ) : (
        <span />
      )}

      <button
        onClick={(e) => handleNavigate(e, homeLevel)}
        className="px-4 py-2 bg-green-200 rounded-lg hover:bg-green-300 transition"
      >
        📚 Índice
      </button>

      {nextPart ? (
        <button
          onClick={(e) => handleNavigate(e, nextPart)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Siguiente →
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
