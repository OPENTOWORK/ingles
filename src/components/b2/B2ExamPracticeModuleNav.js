'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';
import { getLevelOverviewNav } from '@/utils/levelOverviewNav';
import {
  getSkillExerciseNavState,
  runBackExerciseSkillFlow,
} from '@/utils/skillPracticeNavigation';
import { buildProgressBySlotWithLiveOverlay } from '@/utils/skillPartFirstProgress';
import { getModuleNavPartLabel } from '@/utils/formatLevelsPartDisplayName';
import { buildExamModePracticeHref } from '@/utils/examModeSession';
import { useExamStarGatingBypass } from '@/hooks/useExamStarGatingBypass';

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
  partMinForTabLabels = null,
  pagePartMin = null,
  progressBySlot = null,
  livePartProgress = null,
}) {
  const searchParams = useSearchParams();
  const bypassStarGating = useExamStarGatingBypass();
  const examModeParam = searchParams.get('examMode');
  const examFlowFromUrl = examModeParam === '1' || examModeParam === 'review';
  const inExamFlow = examMode || examFlowFromUrl;
  const levelSlug = String(slug || 'b2').toLowerCase();
  const isEn = lang === 'en';
  const effectiveSkillPractice = skillPracticeMode && !inExamFlow;
  const nav = getB2ExamPracticeNavState({
    partNumber,
    pagePartMax,
    examSlot,
    slug: levelSlug,
  });
  const resolvedContinueHref = useMemo(() => {
    if (!nav.continueHref) return null;
    if (!inExamFlow) return nav.continueHref;
    const basePath = nav.continueHref.split('?')[0];
    return buildExamModePracticeHref(basePath, examSlot, {
      review: examModeParam === 'review',
      part: nav.nextPartNumber ?? undefined,
    });
  }, [nav.continueHref, nav.nextPartNumber, inExamFlow, examSlot, examModeParam]);
  const overview = getLevelOverviewNav(levelSlug, lang);
  const formatPartLabel = (partNum) =>
    getModuleNavPartLabel(partNum, partMinForTabLabels, isEn ? 'en' : 'es');
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
        ? `Back — ${formatPartLabel(nav.previousPartNumber)}`
        : `Volver — ${formatPartLabel(nav.previousPartNumber)}`
      : '');

  const skillExerciseNav = useMemo(() => {
    if (!effectiveSkillPractice) return null;
    const effectiveProgress = buildProgressBySlotWithLiveOverlay(
      progressBySlot,
      examSlot,
      partNumber,
      livePartProgress,
    );
    return getSkillExerciseNavState({
      examSlot,
      examenIdBySlot,
      partNumber,
      partMin: pagePartMin ?? partMinForTabLabels ?? 1,
      partMax: pagePartMax,
      progressBySlot: effectiveProgress,
      bypassStarGating,
    });
  }, [
    effectiveSkillPractice,
    examSlot,
    examenIdBySlot,
    partNumber,
    pagePartMin,
    partMinForTabLabels,
    pagePartMax,
    progressBySlot,
    livePartProgress,
    bypassStarGating,
  ]);

  let continueLabel = '';
  if (effectiveSkillPractice) {
    if (skillExerciseNav?.nextAction === 'part') {
      continueLabel = isEn ? 'Next part' : 'Siguiente parte';
    } else {
      continueLabel = isEn ? 'Next test' : 'Siguiente test';
    }
  } else if (nav.continueMode === 'in-page' && nav.nextPartNumber) {
    continueLabel = nextPartLabel
      ? isEn
        ? `Continue — ${nextPartLabel}`
        : `Continuar — ${nextPartLabel}`
      : isEn
        ? `Continue — ${formatPartLabel(nav.nextPartNumber)}`
        : `Continuar — ${formatPartLabel(nav.nextPartNumber)}`;
  } else if (nav.continueMode === 'link' && nav.nextPartNumber && nav.continueModuleTitle) {
    continueLabel = isEn
      ? `Continue — ${formatPartLabel(nav.nextPartNumber)}`
      : `Continuar — ${formatPartLabel(nav.nextPartNumber)}`;
  } else if (nav.continueMode === 'link' && nav.continueModuleTitle) {
    continueLabel = isEn
      ? `Continue — ${nav.continueModuleTitle}`
      : `Continuar — ${nav.continueModuleTitle}`;
  }

  const showPreviousExercise = effectiveSkillPractice && typeof onSelectExamSlot === 'function';
  const previousExerciseLabel = isEn ? 'Previous test' : 'Test anterior';
  const canGoPreviousExercise = skillExerciseNav?.canGoPrevious ?? false;

  const useBalancedLayout = effectiveSkillPractice || showCheckAnswersButton;

  const showPreviousPartButton =
    !useBalancedLayout &&
    nav.hasPreviousInPage &&
    previousLabel &&
    typeof onPreviousInPage === 'function';

  const showContinueInPageButton =
    !useBalancedLayout &&
    !effectiveSkillPractice &&
    nav.continueMode === 'in-page' &&
    continueLabel &&
    typeof onContinueInPage === 'function';

  const showContinueLinkButton =
    !useBalancedLayout &&
    !effectiveSkillPractice &&
    nav.continueMode === 'link' &&
    (nav.continueHref || onContinueModule || resolvedContinueHref);

  const renderContinueLinkControl = (className) => {
    if (typeof onContinueModule === 'function' && inExamFlow) {
      return (
        <button type="button" className={className} onClick={onContinueModule}>
          <span className="levels-exam-module-nav__label">{continueLabel}</span>
          <NavChevron direction="forward" />
        </button>
      );
    }

    const href = resolvedContinueHref || nav.continueHref;
    if (!href) return null;

    return (
      <Link href={href} className={className}>
        <span className="levels-exam-module-nav__label">{continueLabel}</span>
        <NavChevron direction="forward" />
      </Link>
    );
  };

  const useCenteredPartNav =
    !useBalancedLayout &&
    (showPreviousPartButton || showContinueInPageButton || showContinueLinkButton);

  const previousPartButton = showPreviousPartButton ? (
    <button
      type="button"
      className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue levels-exam-module-nav__btn--prev-part"
      onClick={onPreviousInPage}
    >
      <NavChevron direction="back" />
      <span className="levels-exam-module-nav__label">{previousLabel}</span>
    </button>
  ) : null;

  const continueInPageButton = showContinueInPageButton ? (
    <button
      type="button"
      className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue"
      onClick={onContinueInPage}
    >
      <span className="levels-exam-module-nav__label">{continueLabel}</span>
      <NavChevron direction="forward" />
    </button>
  ) : null;

  const continueLinkButton = showContinueLinkButton
    ? renderContinueLinkControl('levels-exam-module-nav__btn levels-exam-module-nav__btn--continue')
    : null;

  const partNavPairBlock =
    useCenteredPartNav && (previousPartButton || continueInPageButton || continueLinkButton) ? (
      <div className="levels-exam-module-nav__part-pair">
        {previousPartButton}
        {continueInPageButton}
        {continueLinkButton}
      </div>
    ) : null;

  const handlePreviousExercise = () => {
    if (typeof onSelectExamSlot !== 'function') return;
    runBackExerciseSkillFlow({ examSlot, examenIdBySlot, onSelectExamSlot });
  };

  const previousExerciseButton =
    showPreviousExercise ? (
      <button
        type="button"
        className="levels-exam-module-nav__btn levels-exam-module-nav__btn--back levels-exam-module-nav__btn--prev-exercise"
        onClick={handlePreviousExercise}
        disabled={!canGoPreviousExercise}
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
          <div className="levels-exam-module-nav__next-exercise-wrap">
            <button
              type="button"
              className="levels-exam-module-nav__btn levels-exam-module-nav__btn--continue levels-exam-module-nav__btn--next-exercise"
              onClick={onContinueInPage}
              disabled={
                effectiveSkillPractice && skillExerciseNav ? !skillExerciseNav.canGoNext : false
              }
              aria-describedby={
                effectiveSkillPractice &&
                skillExerciseNav?.nextBlockedReason === 'need_star' &&
                !skillExerciseNav?.canGoNext
                  ? 'skill-next-exercise-hint'
                  : undefined
              }
            >
              <span className="levels-exam-module-nav__label">{continueLabel}</span>
              <NavChevron direction="forward" />
            </button>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <nav
      className={`levels-exam-module-nav${
        effectiveSkillPractice ? ' levels-exam-module-nav--skill' : ''
      }${showCheckAnswersButton ? ' levels-exam-module-nav--with-check' : ''}${
        useBalancedLayout ? ' levels-exam-module-nav--balanced' : ''
      }${useCenteredPartNav ? ' levels-exam-module-nav--centered-parts' : ''}`}
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

      </div>

      {useCenteredPartNav && partNavPairBlock ? (
        <div className="levels-exam-module-nav__zone levels-exam-module-nav__zone--center">
          {partNavPairBlock}
        </div>
      ) : null}

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
        {useBalancedLayout && checkAnswersButton ? checkAnswersButton : null}

        {!useCenteredPartNav &&
        !useBalancedLayout &&
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

        {!useCenteredPartNav &&
        !useBalancedLayout &&
        !effectiveSkillPractice &&
        nav.continueMode === 'link' &&
        (nav.continueHref || onContinueModule || resolvedContinueHref)
          ? renderContinueLinkControl('levels-exam-module-nav__btn levels-exam-module-nav__btn--continue')
          : null}
      </div>
    </nav>
  );
}
