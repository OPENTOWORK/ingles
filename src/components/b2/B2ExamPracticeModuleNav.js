'use client';

import Link from 'next/link';
import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';
import { getLevelOverviewNav } from '@/utils/levelOverviewNav';

function NavChevron({ direction = 'back' }) {
  return (
    <span
      className={`levels-exam-module-nav__chevron${
        direction === 'forward' ? ' levels-exam-module-nav__chevron--forward' : ''
      }`}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

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
  onPreviousInPage,
  onContinueModule,
  overviewHref,
  overviewLabel,
  onBackClick,
  nextPartLabel,
  previousPartLabel,
  skillPracticeMode = false,
  skillPracticeTheme = null,
  showCheckAnswersButton = false,
  onCheckAnswers = null,
  checkAnswersDisabled = false,
  checkAnswersLabel,
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
  const backLabel = onBackClick
    ? isEn
      ? 'Back to parts'
      : 'Volver a las partes'
    : overviewLabel || overview.label;
  const backHref = overviewHref || nav.overviewHref || overview.href;

  const previousLabel =
    previousPartLabel ||
    (nav.previousPartNumber
      ? isEn
        ? `Back — Part ${nav.previousPartNumber}`
        : `Volver — Parte ${nav.previousPartNumber}`
      : '');

  let continueLabel = '';
  if (skillPracticeMode) {
    continueLabel = isEn ? 'Next exercise' : 'Siguiente ejercicio';
  } else if (nav.continueMode === 'in-page' && nav.nextPartNumber) {
    continueLabel = nextPartLabel
      ? isEn
        ? `Continue — ${nextPartLabel}`
        : `Continuar — ${nextPartLabel}`
      : isEn
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
    <nav
      className={`levels-exam-module-nav${
        skillPracticeMode ? ' levels-exam-module-nav--skill' : ''
      }${showCheckAnswersButton ? ' levels-exam-module-nav--with-check' : ''}`}
      data-skill-theme={skillPracticeMode && skillPracticeTheme ? skillPracticeTheme : undefined}
      aria-label={isEn ? 'Module navigation' : 'Navegación del módulo'}
    >
      <div className="levels-exam-module-nav__start">
        {onBackClick ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back"
            onClick={onBackClick}
          >
            <NavChevron direction="back" />
            <span className="levels-exam-module-nav__label">{backLabel}</span>
          </button>
        ) : (
          <Link href={backHref} className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back">
            <NavChevron direction="back" />
            <span className="levels-exam-module-nav__label">{backLabel}</span>
          </Link>
        )}

        {nav.hasPreviousInPage && previousLabel && typeof onPreviousInPage === 'function' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue levels-exam-module-nav__btn--prev-part"
            onClick={onPreviousInPage}
          >
            <NavChevron direction="back" />
            <span className="levels-exam-module-nav__label">{previousLabel}</span>
          </button>
        ) : null}
      </div>

      <div className="levels-exam-module-nav__end">
        {showCheckAnswersButton && typeof onCheckAnswers === 'function' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--check"
            onClick={onCheckAnswers}
            disabled={checkAnswersDisabled}
          >
            <span className="levels-exam-module-nav__label">
              {checkAnswersLabel || (isEn ? 'Check answers' : 'Corregir')}
            </span>
          </button>
        ) : null}

        {skillPracticeMode || nav.continueMode === 'in-page' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
            onClick={onContinueInPage}
          >
            <span className="levels-exam-module-nav__label">{continueLabel}</span>
            <NavChevron direction="forward" />
          </button>
        ) : null}

        {!skillPracticeMode && nav.continueMode === 'link' && (nav.continueHref || onContinueModule) ? (
          typeof onContinueModule === 'function' ? (
            <button
              type="button"
              className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
              onClick={onContinueModule}
            >
              <span className="levels-exam-module-nav__label">{continueLabel}</span>
              <NavChevron direction="forward" />
            </button>
          ) : (
            <Link href={nav.continueHref} className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue">
              <span className="levels-exam-module-nav__label">{continueLabel}</span>
              <NavChevron direction="forward" />
            </Link>
          )
        ) : null}
      </div>
    </nav>
  );
}
