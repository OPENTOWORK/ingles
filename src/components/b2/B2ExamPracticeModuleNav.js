'use client';

import Link from 'next/link';
import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';
import { getLevelOverviewNav } from '@/utils/levelOverviewNav';

/**
 * Footer navigation for level exam practice modules.
 * Back (left) · Continue (right).
 */
export default function B2ExamPracticeModuleNav({
  slug = 'b2',
  partNumber,
  pagePartMax,
  examSlot = 1,
  onContinueInPage,
  overviewHref,
  overviewLabel,
  lang = 'en',
}) {
  const levelSlug = String(slug || 'b2').toLowerCase();
  const isEn = lang === 'en';
  const nav = getB2ExamPracticeNavState({
    partNumber,
    pagePartMax,
    examSlot,
    slug: levelSlug,
  });
  const overview = getLevelOverviewNav(levelSlug, lang);
  const backLabel = overviewLabel || overview.label;
  const backHref = overviewHref || nav.overviewHref || overview.href;

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
      <Link href={backHref} className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back">
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
