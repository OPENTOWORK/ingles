'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import SiteMascot from '@/components/SiteMascot';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';
import ExamPracticeLevelPicker from '@/components/niveles/ExamPracticeLevelPicker';
import ExamPracticeSkillPicker from '@/components/niveles/ExamPracticeSkillPicker';
import SkillExerciseStarsBadge from '@/components/exam/SkillExerciseStarsBadge';
import { getLevelSkillPracticeHref } from '@/data/nivelesLevelHub';
import {
  getB2StarsWayColumnBySkillRoute,
  getB2StarsWayPageHref,
} from '@/data/b2StarsWayConfig';
import { ExamPracticeToolsProvider } from '@/context/ExamPracticeToolsContext';
import { ExamPracticeSidebarSlotsProvider } from '@/context/ExamPracticeSidebarSlotsContext';
import { useUserRole } from '@/context/UserRoleContext';
import { isAdminRole } from '@/utils/authRoles';
import { useExamSlotPlanGating } from '@/hooks/useExamSlotPlanGating';
import { starsFromPartExerciseScore } from '@/utils/skillPartFirstProgress';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';

/** Split chrome titles like "B2 Reading and Use of English Practice" for structured header UI. */
function parsePracticeChromeTitle(title = '') {
  const trimmed = String(title || '').trim();
  if (!trimmed) return { level: null, headline: '', showPracticeLabel: false };

  const levelMatch = trimmed.match(/^(A2|B1|B2|C1|C2)\s+(.+)$/i);
  const level = levelMatch ? levelMatch[1].toUpperCase() : null;
  let rest = levelMatch ? levelMatch[2].trim() : trimmed;

  const practiceMatch = rest.match(/^(.+?)\s+Practice$/i);
  if (practiceMatch) {
    return {
      level,
      headline: practiceMatch[1].trim(),
      showPracticeLabel: true,
    };
  }

  return { level, headline: rest, showPracticeLabel: false };
}

function PracticeHeaderFinishNotice({ notice, lang = 'es' }) {
  if (!notice) return null;

  const en = lang === 'en';

  if (notice.error) {
    return (
      <div className="levels-b2-practice__header-finish">
        <LevelsPartFinishBanner
          passed={false}
          correct={0}
          total={0}
          passing={0}
          error={notice.error}
          lang={lang}
        />
      </div>
    );
  }

  if (notice.v2LocalOnly) {
    return (
      <div className="levels-b2-practice__header-finish">
        <div role="status" className="levels-b2-result levels-b2-result--v2">
          <p className="levels-b2-result__title">
            {en ? 'Part complete' : 'Parte completada'}
          </p>
          <p className="levels-b2-result__detail">
            {en
              ? `Part score: ${notice.correct} / ${notice.total}`
              : `Puntuación de la parte: ${notice.correct} / ${notice.total}`}
          </p>
          <p className="levels-b2-result__note">
            {en
              ? 'Scoring V2 — local practice only (not saved).'
              : 'Scoring V2 — práctica local (no guardado).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="levels-b2-practice__header-finish">
      <LevelsPartFinishBanner
        passed={notice.passed}
        correct={notice.correct}
        total={notice.total}
        passing={notice.passing}
        lang={lang}
      />
    </div>
  );
}

function getPartTabLabel(part, lang, customLabelFn, partMinForLocalLabels) {
  if (typeof customLabelFn === 'function') {
    const custom = customLabelFn(part);
    if (custom) return custom;
  }
  const n = Number(
    part?.partNumber ||
      String(part?.nombre || part?.nombre_parte || '').match(/\d+/)?.[0] ||
      0,
  );
  if (partMinForLocalLabels != null && n >= partMinForLocalLabels) {
    const local = n - partMinForLocalLabels + 1;
    if (local >= 1) {
      return lang === 'en' ? `Part ${local}` : `Parte ${local}`;
    }
  }
  if (lang === 'en' && n) return `Part ${n}`;
  return part?.nombre || (n ? `Part ${n}` : '');
}

/**
 * Cabecera y rejilla de partes unificada (estilo Use of English) para B2 partes 1–17.
 */
export function B2ExamPracticeLayout({ examPracticeOpen, children }) {
  return (
    <main
      className="levels-exam-practice-root"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        ...(!examPracticeOpen
          ? {
              minHeight: 'calc(100vh - 4rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }
          : {}),
      }}
    >
      {children}
    </main>
  );
}

export function B2ExamPracticeChrome({
  examSlot,
  onSelectExam,
  progressBySlot,
  partsInPaper,
  examLabelsBySlot = {},
  availableSlots,
  showNewExamButton = false,
  onNewExam,
  showAdminMenu = false,
  onRegenerateExam,
  onDeleteExam,
  examPracticeOpen,
  title,
  subtitle,
  timerLabel,
  timerControls = null,
  timerHidden = false,
  onToggleTimerHidden = null,
  focusMode = false,
  onExitFocusMode = null,
  refreshLabel,
  loading,
  onRefresh,
  showRefresh = true,
  partScoreMetrics,
  hideScorePanel = false,
  scorePanelOverride = null,
  partFinishNotice,
  partFinishNoticePlacement = 'main',
  partsData,
  selectedPartId,
  onSelectPart,
  getPartSavedScoreLabel,
  getPartTabLabel: getPartTabLabelProp,
  partMinForTabLabels = null,
  lang = 'es',
  workPanelClassName = '',
  navigationOverride = null,
  hidePartTabs = false,
  suppressExamSlotPicker = false,
  partTabsVariant = 'default',
  hideMascot = false,
  hideSubtitle = false,
  compactSkillHeader = false,
  showLevelPicker = false,
  levelSlug = null,
  skillRoute = null,
  skillPracticeTheme = null,
  showStudyNotes = true,
  studyNotesContext = null,
  studyNotesContextLabel = '',
  studyNotesPlacement = 'header',
  practiceMode = 'part-practice',
  timerVariant = 'prominent',
  scorePanelVariant = 'default',
  modeBadge = null,
  practiceReady,
  reportErrorContext = null,
  headerTools = null,
  examModeSaveControls = null,
  children,
}) {
  const { userRole } = useUserRole();
  const planGating = useExamSlotPlanGating(progressBySlot);
  const handleSelectExamWithPlan = useCallback(
    (slot) => planGating.wrapSelectHandler(onSelectExam)(slot),
    [planGating, onSelectExam],
  );
  const showPractice = practiceReady ?? examPracticeOpen;
  const effectiveShowRefresh = showRefresh && isAdminRole(userRole);
  const parsedTitle = parsePracticeChromeTitle(title);
  const isExamSimulation = practiceMode === 'exam-simulation';
  const effectiveShowStudyNotes = showStudyNotes && !isExamSimulation;
  const effectiveScoreVariant =
    scorePanelVariant === 'default' && !isExamSimulation ? 'practice' : scorePanelVariant;
  /** Exam mode uses ExamModeSectionBanner countdown; hide session elapsed timer. */
  const effectiveTimerVariant = isExamSimulation ? 'hidden' : timerVariant;
  const showCategoryTimer = effectiveTimerVariant !== 'hidden';
  const hidePracticeScorePanel = hideScorePanel || compactSkillHeader;
  const showScorePanel =
    (!hideScorePanel && scorePanelOverride) ||
    (!hidePracticeScorePanel && !scorePanelOverride && partScoreMetrics);
  const showHeaderFinishNotice =
    partFinishNoticePlacement === 'header' && partFinishNotice;
  const showStudyNotesInHeader =
    effectiveShowStudyNotes && studyNotesPlacement === 'header';
  const showStatusRow =
    showCategoryTimer || showScorePanel || showStudyNotesInHeader || showHeaderFinishNotice;
  const refreshHint =
    lang === 'en'
      ? 'Reload parts, texts and answers from the server and clear your selections.'
      : 'Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.';
  const updatingLabel = lang === 'en' ? 'Updating…' : 'Actualizando…';
  const savedPrefix = lang === 'en' ? 'Saved:' : 'Guardado:';
  const workPanelRef = useRef(null);
  const statusAreaRef = useRef(null);
  const statusRowRef = useRef(null);
  const workBodyRef = useRef(null);
  const [internalTimerHidden, setInternalTimerHidden] = useState(false);
  const sessionTimerHideEnabled = effectiveTimerVariant === 'session';
  const resolvedTimerHidden = sessionTimerHideEnabled
    ? onToggleTimerHidden
      ? timerHidden
      : internalTimerHidden
    : timerHidden;
  const handleToggleTimerHidden = useCallback(() => {
    if (onToggleTimerHidden) onToggleTimerHidden();
    else setInternalTimerHidden((prev) => !prev);
  }, [onToggleTimerHidden]);
  const showTimerHideToggle = sessionTimerHideEnabled || Boolean(onToggleTimerHidden);
  const showSidebarTopRail =
    compactSkillHeader && studyNotesPlacement === 'sidebar-top';

  const skillExercisePartNumber = useMemo(() => {
    if (!showLevelPicker || !selectedPartId || !partsData?.length) return null;
    const part = partsData.find((p) => p.id === selectedPartId);
    if (!part) return null;
    const n = Number(
      part.partNumber || String(part.nombre || part.nombre_parte || '').match(/\d+/)?.[0] || 0,
    );
    return n > 0 ? n : null;
  }, [showLevelPicker, selectedPartId, partsData]);

  const skillExerciseStars = useMemo(() => {
    if (!skillExercisePartNumber || !examSlot) return 0;

    const partScore = progressBySlot?.[examSlot]?.parts?.[skillExercisePartNumber];
    const savedStars = starsFromPartExerciseScore(partScore);

    if (partScoreMetrics?.questionsAnswered > 0 || partScoreMetrics?.correctCount > 0) {
      const isV2 = Number(partScoreMetrics.scoringVersion) === 2;
      const earned = isV2
        ? partScoreMetrics.pointsEarned ?? partScoreMetrics.correctCount
        : partScoreMetrics.correctCount;
      const max = isV2
        ? partScoreMetrics.maxPoints ?? partScoreMetrics.totalSlots
        : partScoreMetrics.totalSlots;
      const liveStars = starsFromLevelsEarnedMax(earned, max);
      if (liveStars > 0) return liveStars;
    }

    return savedStars;
  }, [skillExercisePartNumber, examSlot, progressBySlot, partScoreMetrics]);

  const showSkillExerciseStars =
    showLevelPicker && compactSkillHeader && Boolean(skillExercisePartNumber);
  const showSkillExerciseStarsInHeader =
    showSkillExerciseStars && studyNotesPlacement === 'header';
  const showSkillExerciseStarsInSidebar =
    showSkillExerciseStars && studyNotesPlacement === 'sidebar-top';
  const showSkillExerciseStarsInSidebarTop = showSkillExerciseStarsInSidebar;

  const showCombinedToolbar = Boolean(headerTools) && showCategoryTimer;
  const showLegacyToolsRow =
    (Boolean(headerTools) || examModeSaveControls || showSkillExerciseStarsInHeader) &&
    !showCombinedToolbar;
  const showSecondaryStatusRow =
    (showCombinedToolbar && (showScorePanel || showStudyNotesInHeader)) ||
    (!showCombinedToolbar && showStatusRow);
  const showToolbarFinishNotice = showCombinedToolbar && showHeaderFinishNotice;

  const starsWayHref = useMemo(() => {
    if (!showSkillExerciseStars || !skillRoute || !skillExercisePartNumber || !examSlot) {
      return null;
    }
    const column = getB2StarsWayColumnBySkillRoute(skillRoute);
    if (!column) return null;
    return getB2StarsWayPageHref({
      skillKey: column.key,
      globalPartNumber: skillExercisePartNumber,
      examSlot,
    });
  }, [showSkillExerciseStars, skillRoute, skillExercisePartNumber, examSlot]);

  const exerciseStarsBadge = showSkillExerciseStars ? (
    <SkillExerciseStarsBadge
      stars={skillExerciseStars}
      href={starsWayHref}
      lang={lang === 'es' ? 'es' : 'en'}
    />
  ) : null;

  const sidebarExerciseStars = showSkillExerciseStarsInSidebarTop ? exerciseStarsBadge : null;

  useEffect(() => {
    const shouldSyncStatusHeight = showStatusRow && showHeaderFinishNotice;
    const shouldSyncFinishWidth = showStatusRow && showHeaderFinishNotice;

    if ((!shouldSyncStatusHeight && !shouldSyncFinishWidth) || !statusAreaRef.current) {
      document.documentElement.style.removeProperty('--exam-practice-status-row-height');
      document.documentElement.style.removeProperty('--exam-practice-header-finish-width');
      return undefined;
    }

    const syncMetrics = () => {
      const container = statusAreaRef.current;
      if (!container) return;

      if (shouldSyncStatusHeight) {
        const toolbar = container.querySelector('.levels-b2-practice__toolbar-band-main');
        const height = (toolbar ?? statusRowRef.current ?? container).getBoundingClientRect().height;
        if (height > 0) {
          document.documentElement.style.setProperty(
            '--exam-practice-status-row-height',
            `${Math.round(height)}px`,
          );
        }
      } else {
        document.documentElement.style.removeProperty('--exam-practice-status-row-height');
      }

      if (shouldSyncFinishWidth) {
        const finish = container.querySelector('.levels-b2-practice__header-finish');
        const result = finish?.querySelector('.levels-b2-result');
        const widthTarget = result ?? finish;
        const width = widthTarget?.getBoundingClientRect().width;
        if (width > 0) {
          document.documentElement.style.setProperty(
            '--exam-practice-header-finish-width',
            `${Math.round(width)}px`,
          );
        }
      } else {
        document.documentElement.style.removeProperty('--exam-practice-header-finish-width');
      }
    };

    syncMetrics();
    const observer = new ResizeObserver(syncMetrics);
    observer.observe(statusAreaRef.current);
    if (statusRowRef.current) observer.observe(statusRowRef.current);

    if (shouldSyncFinishWidth) {
      const finish = statusAreaRef.current.querySelector('.levels-b2-practice__header-finish');
      const result = finish?.querySelector('.levels-b2-result');
      if (finish) observer.observe(finish);
      if (result) observer.observe(result);
    }

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--exam-practice-status-row-height');
      document.documentElement.style.removeProperty('--exam-practice-header-finish-width');
    };
  }, [showHeaderFinishNotice, showStatusRow, showCombinedToolbar, partFinishNotice]);

  useEffect(() => {
    if (
      !showSidebarTopRail ||
      !showStatusRow ||
      !statusAreaRef.current ||
      !workBodyRef.current
    ) {
      document.documentElement.style.removeProperty('--exam-practice-sidebar-lift');
      return undefined;
    }

    const syncSidebarLift = () => {
      const statusArea = statusAreaRef.current;
      const workBody = workBodyRef.current;
      if (!statusArea || !workBody) return;

      const lift = workBody.getBoundingClientRect().top - statusArea.getBoundingClientRect().top;
      if (lift > 0) {
        document.documentElement.style.setProperty(
          '--exam-practice-sidebar-lift',
          `${Math.round(lift)}px`,
        );
      } else {
        document.documentElement.style.removeProperty('--exam-practice-sidebar-lift');
      }
    };

    syncSidebarLift();
    const observer = new ResizeObserver(syncSidebarLift);
    observer.observe(statusAreaRef.current);
    observer.observe(workBodyRef.current);
    if (workPanelRef.current) observer.observe(workPanelRef.current);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--exam-practice-sidebar-lift');
    };
  }, [
    showSidebarTopRail,
    showStatusRow,
    showHeaderFinishNotice,
    partFinishNotice,
    headerTools,
    showLevelPicker,
  ]);

  const categoryTimerEl = showCategoryTimer ? (
    <LevelsCategoryTimer
      categoryLabel=""
      timeLabel={timerLabel}
      variant={effectiveTimerVariant}
      lang={lang === 'es' ? 'es' : 'en'}
      isRunning={timerControls?.isRunning}
      isPaused={timerControls?.isPaused}
      isIdle={timerControls?.isIdle}
      isStopped={timerControls?.isStopped}
      onStart={timerControls?.start}
      onPause={timerControls?.pause}
      onResume={timerControls?.resume}
      onStop={timerControls?.stop}
      timerHidden={resolvedTimerHidden}
      onToggleTimerHidden={showTimerHideToggle ? handleToggleTimerHidden : null}
    />
  ) : null;

  const partTabsEl =
    partsData?.length > 0 && !hidePartTabs ? (
      <div
        className={`levels-b2-part-tabs${partsData.length >= 7 ? ' levels-b2-part-tabs--many' : ''}${
          partTabsVariant === 'excel' ? ' levels-b2-part-tabs--excel' : ''
        }`}
        role="tablist"
      >
        {partsData.map((part) => {
          const savedScore = getPartSavedScoreLabel?.(part, examSlot);
          const active = selectedPartId === part.id;
          return (
            <button
              key={part.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`levels-b2-part-tab${active ? ' levels-b2-part-tab--active' : ''}`}
              onClick={() => onSelectPart(part)}
            >
              <span>{getPartTabLabel(part, lang, getPartTabLabelProp, partMinForTabLabels)}</span>
              {savedScore && partTabsVariant !== 'excel' ? (
                <span className="levels-b2-part-tab__score">
                  {savedPrefix} {savedScore}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <>
      {!showPractice && !suppressExamSlotPicker
        ? navigationOverride ?? (
        <B2ExamSlotProgressPicker
          value={examSlot}
          onSelect={handleSelectExamWithPlan}
          progressBySlot={progressBySlot}
          partsInPaper={partsInPaper}
          examLabelsBySlot={examLabelsBySlot}
          availableSlots={availableSlots}
          showNewExamButton={showNewExamButton}
          onNewExam={onNewExam}
          showAdminMenu={showAdminMenu}
          onRegenerateExam={onRegenerateExam}
          onDeleteExam={onDeleteExam}
          lang={lang}
          lockedSlots={planGating.lockedSlots}
          onLockedSlotClick={planGating.onLockedSlotClick}
        />
        )
        : null}

      {!showPractice ? null : (
        <div
          className={`levels-b2-practice${compactSkillHeader ? ' levels-b2-practice--skill-compact' : ''}${focusMode ? ' levels-b2-practice--focus-mode' : ''}`}
          data-skill-theme={
            compactSkillHeader && skillPracticeTheme ? skillPracticeTheme : undefined
          }
        >
          <header className="levels-b2-practice__header">
            {compactSkillHeader ? (
              <div className="levels-b2-practice__title-block">
                <div className="levels-b2-practice__title-meta">
                  {modeBadge ? (
                    <p className={`levels-exam-mode-badge levels-exam-mode-badge--${practiceMode}`}>
                      {modeBadge}
                    </p>
                  ) : null}
                  {parsedTitle.level ? (
                    <span className="levels-b2-practice__title-level">{parsedTitle.level}</span>
                  ) : null}
                </div>
                <h1 className="levels-b2-practice__title">
                  <span className="levels-b2-practice__title-headline">
                    {parsedTitle.headline || title}
                  </span>
                </h1>
              </div>
            ) : (
              <>
                {modeBadge ? (
                  <p className={`levels-exam-mode-badge levels-exam-mode-badge--${practiceMode}`}>
                    {modeBadge}
                  </p>
                ) : null}
                <h1 className="levels-b2-practice__title">{title}</h1>
              </>
            )}
            {!hideMascot ? (
              <div className="levels-b2-practice__mascot" aria-hidden>
                <SiteMascot variant={10} width={128} alt="" />
              </div>
            ) : null}
            {!hideSubtitle && subtitle ? (
              <p className="levels-b2-practice__subtitle">{subtitle}</p>
            ) : null}

            {effectiveShowRefresh && onRefresh ? (
              <div className="levels-b2-practice__refresh">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="levels-b2-practice__refresh-btn"
                >
                  {loading ? updatingLabel : refreshLabel}
                </button>
                <p className="levels-b2-practice__refresh-hint">{refreshHint}</p>
              </div>
            ) : null}
          </header>

          <div
            ref={workPanelRef}
            className={['levels-b2-practice__work-panel', workPanelClassName]
              .filter(Boolean)
              .join(' ')}
          >
          {partTabsVariant === 'excel' ? partTabsEl : null}

          {showLevelPicker && levelSlug && skillRoute && !focusMode ? (
            <div className="exam-practice-skill-nav">
              <ExamPracticeLevelPicker
                variant="strip"
                activeLevel={levelSlug}
                linkForLevel={(level) => getLevelSkillPracticeHref(level.slug, skillRoute)}
              />
              <ExamPracticeSkillPicker levelSlug={levelSlug} activeSkillRoute={skillRoute} />
            </div>
          ) : null}

          <div className="levels-b2-practice__status" ref={statusAreaRef}>
            {showCombinedToolbar ? (
              <div className="levels-b2-practice__toolbar-band">
                <div className="levels-b2-practice__toolbar-band-main">
                  <div className="levels-b2-practice__toolbar-band-start">
                    <div className="levels-b2-practice__study-tools">{headerTools}</div>
                    {showSkillExerciseStarsInHeader ? (
                      <div className="levels-b2-practice__exercise-stars">
                        <SkillExerciseStarsBadge
                          stars={skillExerciseStars}
                          href={starsWayHref}
                          lang={lang}
                        />
                      </div>
                    ) : null}
                    {examModeSaveControls ? (
                      <div className="levels-b2-practice__exam-save-tools">{examModeSaveControls}</div>
                    ) : null}
                  </div>
                  <div className="levels-b2-practice__toolbar-band-end">
                    {categoryTimerEl}
                  </div>
                </div>
                {showToolbarFinishNotice ? (
                  <div className="levels-b2-practice__toolbar-band-aside">
                    <PracticeHeaderFinishNotice notice={partFinishNotice} lang={lang} />
                  </div>
                ) : null}
              </div>
            ) : null}
            {showLegacyToolsRow ? (
              <div className="levels-b2-practice__status-tools-row">
                {headerTools ? (
                  <div className="levels-b2-practice__study-tools">{headerTools}</div>
                ) : null}
                {showSkillExerciseStarsInHeader ? (
                  <div className="levels-b2-practice__exercise-stars">
                    <SkillExerciseStarsBadge
                      stars={skillExerciseStars}
                      href={starsWayHref}
                      lang={lang}
                    />
                  </div>
                ) : null}
                {examModeSaveControls ? (
                  <div className="levels-b2-practice__exam-save-tools">{examModeSaveControls}</div>
                ) : null}
              </div>
            ) : null}
            {showSecondaryStatusRow ? (
              <div ref={statusRowRef} className="levels-b2-practice__status-row">
                {!showCombinedToolbar ? categoryTimerEl : null}
                {!showToolbarFinishNotice && showHeaderFinishNotice ? (
                  <PracticeHeaderFinishNotice notice={partFinishNotice} lang={lang} />
                ) : null}
                {!hideScorePanel && scorePanelOverride ? scorePanelOverride : null}
                {!hidePracticeScorePanel && !scorePanelOverride && partScoreMetrics ? (
                  <LevelsPartScorePanel
                    {...partScoreMetrics}
                    lang={lang}
                    variant={effectiveScoreVariant}
                  />
                ) : null}

                {showStudyNotesInHeader ? (
                  <ExamStudyNotesSidebar
                    overlayContainerRef={workPanelRef}
                    context={studyNotesContext}
                    contextLabel={studyNotesContextLabel || title}
                    lang={lang === 'es' ? 'es' : 'en'}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          {partFinishNoticePlacement === 'main' && partFinishNotice && !partFinishNotice.error ? (
            <LevelsPartFinishBanner
              passed={partFinishNotice.passed}
              correct={partFinishNotice.correct}
              total={partFinishNotice.total}
              passing={partFinishNotice.passing}
              lang={lang}
            />
          ) : null}
          {partFinishNoticePlacement === 'main' && partFinishNotice?.error ? (
            <LevelsPartFinishBanner
              passed={false}
              correct={0}
              total={0}
              passing={0}
              error={partFinishNotice.error}
              lang={lang}
            />
          ) : null}

          {partTabsVariant !== 'excel' ? partTabsEl : null}

          <ExamPracticeToolsProvider>
            <ExamPracticeSidebarSlotsProvider exerciseStars={sidebarExerciseStars}>
              <div ref={workBodyRef} className="levels-b2-practice__work-body">
                {children}
                {showPractice && !loading && reportErrorContext ? (
                  <div className="exam-practice-report-error-footer">
                    <ExamPracticeReportError context={reportErrorContext} />
                  </div>
                ) : null}
              </div>
            </ExamPracticeSidebarSlotsProvider>
          </ExamPracticeToolsProvider>
          </div>
        </div>
      )}
      {planGating.planUpgradeModal}
    </>
  );
}
