'use client';

import Link from 'next/link';
import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';
import { getLevelOverviewNav } from '@/utils/levelOverviewNav';
import { getPreviousExamSlot } from '@/utils/skillPracticeNavigation';

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
 * Back (left) · Previous + Next exercise (center) · Check answers (right, optional).
 */
export default function B2ExamPracticeModuleNav({
  slug = 'b2',
  partNumber,
  pagePartMax,
  examSlot = 1,
  examenIdBySlot = {},
  onSelectExamSlot = null,
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
  examMode = false,
  showCheckAnswersButton = false,
  onCheckAnswers = null,
  checkAnswersDisabled = false,
  checkAnswersLabel,
  lang = 'en',
}) {
  const levelSlug = String(slug || 'b2').toLowerCase();
  const isEn = lang === 'en';
  const effectiveSkillPractice = skillPracticeMode && !examMode;
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
  if (effectiveSkillPractice) {
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

  const previousExerciseSlot =
    effectiveSkillPractice && typeof onSelectExamSlot === 'function'
      ? getPreviousExamSlot(examSlot, examenIdBySlot)
      : null;
  const showPreviousExercise = effectiveSkillPractice && typeof onSelectExamSlot === 'function';
  const previousExerciseLabel = isEn ? 'Previous exercise' : 'Volver al ejercicio anterior';

  const useBalancedLayout = effectiveSkillPractice || showCheckAnswersButton;

  const handlePreviousExercise = () => {
    if (previousExerciseSlot == null || typeof onSelectExamSlot !== 'function') return;
    onSelectExamSlot(previousExerciseSlot);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const previousExerciseButton =
    showPreviousExercise ? (
      <button
        type="button"
        className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back levels-exam-module-nav__btn--prev-exercise"
        onClick={handlePreviousExercise}
        disabled={previousExerciseSlot == null}
      >
        <NavChevron direction="back" />
        <span className="levels-exam-module-nav__label">{previousExerciseLabel}</span>
      </button>
    ) : null;

  const checkAnswersButton =
    showCheckAnswersButton && typeof onCheckAnswers === 'function' ? (
      <button
        type="button"
        className="levels-exam-module-nav__btn levels-exam-module-nav__btn--check"
        onClick={onCheckAnswers}
        disabled={checkAnswersDisabled}
      >
        <span
          className="levels-exam-module-nav__chevron levels-exam-module-nav__chevron--spacer"
          aria-hidden
        />
        <span className="levels-exam-module-nav__label">
          {checkAnswersLabel || (isEn ? 'Check answers' : 'Corregir')}
        </span>
        <span
          className="levels-exam-module-nav__chevron levels-exam-module-nav__chevron--spacer"
          aria-hidden
        />
      </button>
    ) : null;

  const exercisePairBlock =
    previousExerciseButton || effectiveSkillPractice || nav.continueMode === 'in-page' ? (
      <div className="levels-exam-module-nav__exercise-pair">
        {previousExerciseButton}
        {effectiveSkillPractice || nav.continueMode === 'in-page' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
            onClick={onContinueInPage}
          >
            <span className="levels-exam-module-nav__label">{continueLabel}</span>
            <NavChevron direction="forward" />
          </button>
        ) : null}
      </div>
    ) : null;

  return (
    <nav
      className={`levels-exam-module-nav${
        effectiveSkillPractice ? ' levels-exam-module-nav--skill' : ''
      }${showCheckAnswersButton ? ' levels-exam-module-nav--with-check' : ''}${
        useBalancedLayout ? ' levels-exam-module-nav--balanced' : ''
      }`}
      data-skill-theme={effectiveSkillPractice && skillPracticeTheme ? skillPracticeTheme : undefined}
      aria-label={isEn ? 'Module navigation' : 'Navegación del módulo'}
    >
      <div className="levels-exam-module-nav__zone levels-exam-module-nav__zone--back">
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

        {!useBalancedLayout &&
        nav.hasPreviousInPage &&
        previousLabel &&
        typeof onPreviousInPage === 'function' ? (
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

      {useBalancedLayout && exercisePairBlock ? (
        <div className="levels-exam-module-nav__zone levels-exam-module-nav__zone--center">
          {exercisePairBlock}
        </div>
      ) : null}

      {!useBalancedLayout && showCheckAnswersButton && typeof onCheckAnswers === 'function' ? (
        <div className="levels-exam-module-nav__zone levels-exam-module-nav__zone--center">
          {checkAnswersButton}
        </div>
      ) : null}

      <div className="levels-exam-module-nav__zone levels-exam-module-nav__zone--forward">
        {!useBalancedLayout &&
        nav.hasPreviousInPage &&
        previousLabel &&
        typeof onPreviousInPage === 'function' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue levels-exam-module-nav__btn--prev-part"
            onClick={onPreviousInPage}
          >
            <NavChevron direction="back" />
            <span className="levels-exam-module-nav__label">{previousLabel}</span>
          </button>
        ) : null}

        {useBalancedLayout && checkAnswersButton ? checkAnswersButton : null}

        {!useBalancedLayout &&
        !effectiveSkillPractice &&
        nav.continueMode === 'in-page' &&
        continueLabel &&
        typeof onContinueInPage === 'function' ? (
          <button
            type="button"
            className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
            onClick={onContinueInPage}
          >
            <span className="levels-exam-module-nav__label">{continueLabel}</span>
            <NavChevron direction="forward" />
          </button>
        ) : null}

        {!useBalancedLayout && !effectiveSkillPractice && nav.continueMode === 'link' && (nav.continueHref || onContinueModule) ? (
          typeof onContinueModule === 'function' || examMode ? (
            <button
              type="button"
              className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
              onClick={onContinueModule}
              disabled={typeof onContinueModule !== 'function'}
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
