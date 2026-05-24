'use client';

import Link from 'next/link';
import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';

/**
 * Footer navigation for B2 exam practice modules.
 * Back (left) · Continue (right).
 */
export default function B2ExamPracticeModuleNav({
  partNumber,
  pagePartMax,
  examSlot = 1,
  onContinueInPage,
  overviewHref = '/niveles/b2',
  overviewLabel,
  lang = 'en',
}) {
  const isEn = lang === 'en';
  const nav = getB2ExamPracticeNavState({ partNumber, pagePartMax, examSlot });
  const backLabel = overviewLabel || (isEn ? 'Back to B2 Overview' : 'Volver al resumen B2');

  let continueLabel = '';
  if (nav.continueMode === 'in-page' && nav.nextPartNumber) {
    continueLabel = isEn
      ? `Continue — Part ${nav.nextPartNumber}`
      : `Continuar — Parte ${nav.nextPartNumber}`;
  } else if (nav.continueMode === 'link' && nav.nextPartNumber && nav.continueModuleTitle) {
    continueLabel = isEn
      ? `Continue — Part ${nav.nextPartNumber}`
      : `Continuar — Parte ${nav.nextPartNumber}`;
  } else if (nav.continueMode === 'link' && nav.continueModuleTitle) {
    continueLabel = isEn
      ? `Continue — ${nav.continueModuleTitle}`
      : `Continuar — ${nav.continueModuleTitle}`;
  }

  return (
    <nav className="levels-exam-module-nav" aria-label={isEn ? 'Module navigation' : 'Navegación del módulo'}>
      <Link href={overviewHref} className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back">
        <span aria-hidden="true">←</span>
        {backLabel}
      </Link>

      {nav.continueMode === 'in-page' ? (
        <button
          type="button"
          className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
          onClick={onContinueInPage}
        >
          {continueLabel}
          <span aria-hidden="true">→</span>
        </button>
      ) : null}

      {nav.continueMode === 'link' && nav.continueHref ? (
        <Link href={nav.continueHref} className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue">
          {continueLabel}
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </nav>
  );
}
