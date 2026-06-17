'use client';

import { useMemo, useRef } from 'react';
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
import { useUserRole } from '@/context/UserRoleContext';
import { isAdminRole } from '@/utils/authRoles';
import { starsFromPartExerciseScore } from '@/utils/skillPartFirstProgress';

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
        padding: '2rem',
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
  const showScorePanel = !hideScorePanel && (scorePanelOverride || partScoreMetrics);
  const showStatusRow = showCategoryTimer || showScorePanel || effectiveShowStudyNotes;
  const refreshHint =
    lang === 'en'
      ? 'Reload parts, texts and answers from the server and clear your selections.'
      : 'Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.';
  const updatingLabel = lang === 'en' ? 'Updating…' : 'Actualizando…';
  const sessionLabel = lang === 'en' ? `Session: ${title}` : `Sesión: ${title}`;
  const savedPrefix = lang === 'en' ? 'Saved:' : 'Guardado:';
  const workPanelRef = useRef(null);

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
    return starsFromPartExerciseScore(partScore);
  }, [skillExercisePartNumber, examSlot, progressBySlot]);

  const showSkillExerciseStars =
    showLevelPicker && compactSkillHeader && Boolean(skillExercisePartNumber);

  const starsWayHref = useMemo(() => {
    if (!showSkillExerciseStars || !skillRoute || !skillExercisePartNumber || !examSlot) return null;
    const column = getB2StarsWayColumnBySkillRoute(skillRoute);
    if (!column) return null;
    return getB2StarsWayPageHref({
      skillKey: column.key,
      globalPartNumber: skillExercisePartNumber,
      examSlot,
    });
  }, [showSkillExerciseStars, skillRoute, skillExercisePartNumber, examSlot]);

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
          onSelect={onSelectExam}
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

          <div className="levels-b2-practice__status">
            {headerTools || examModeSaveControls || showSkillExerciseStars ? (
              <div className="levels-b2-practice__status-tools-row">
                {headerTools ? (
                  <div className="levels-b2-practice__study-tools">{headerTools}</div>
                ) : null}
                {showSkillExerciseStars ? (
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
            {showStatusRow ? (
              <div className="levels-b2-practice__status-row">
                {showCategoryTimer ? (
                  <LevelsCategoryTimer
                    categoryLabel={sessionLabel}
                    timeLabel={timerLabel}
                    variant={effectiveTimerVariant}
                    lang={lang === 'es' ? 'es' : 'en'}
                    isRunning={timerControls?.isRunning}
                    isPaused={timerControls?.isPaused}
                    isIdle={timerControls?.isIdle}
                    onStart={timerControls?.start}
                    onPause={timerControls?.pause}
                    onResume={timerControls?.resume}
                    timerHidden={timerHidden}
                    onToggleTimerHidden={onToggleTimerHidden}
                  />
                ) : null}

                {!hideScorePanel && scorePanelOverride ? scorePanelOverride : null}

                {!hideScorePanel && !scorePanelOverride && partScoreMetrics ? (
                  <LevelsPartScorePanel {...partScoreMetrics} lang={lang} variant={effectiveScoreVariant} />
                ) : null}

                {effectiveShowStudyNotes ? (
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
            <div className="levels-b2-practice__work-body">
              {children}
              {showPractice && !loading && reportErrorContext ? (
                <div className="exam-practice-report-error-footer">
                  <ExamPracticeReportError context={reportErrorContext} />
                </div>
              ) : null}
            </div>
          </ExamPracticeToolsProvider>
          </div>
        </div>
      )}
    </>
  );
}
