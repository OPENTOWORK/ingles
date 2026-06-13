'use client';

import { useRef } from 'react';
import SiteMascot from '@/components/SiteMascot';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';
import { ExamPracticeToolsProvider } from '@/context/ExamPracticeToolsContext';

function getPartTabLabel(part, lang, customLabelFn) {
  if (typeof customLabelFn === 'function') {
    const custom = customLabelFn(part);
    if (custom) return custom;
  }
  const n = Number(
    part?.partNumber ||
      String(part?.nombre || part?.nombre_parte || '').match(/\d+/)?.[0] ||
      0,
  );
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
  partsData,
  selectedPartId,
  onSelectPart,
  getPartSavedScoreLabel,
  getPartTabLabel: getPartTabLabelProp,
  lang = 'es',
  workPanelClassName = '',
  navigationOverride = null,
  hidePartTabs = false,
  hideMascot = false,
  hideSubtitle = false,
  compactSkillHeader = false,
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
  children,
}) {
  const showPractice = practiceReady ?? examPracticeOpen;
  const isExamSimulation = practiceMode === 'exam-simulation';
  const effectiveShowStudyNotes = showStudyNotes && !isExamSimulation;
  const effectiveScoreVariant =
    scorePanelVariant === 'default' && !isExamSimulation ? 'practice' : scorePanelVariant;
  const effectiveTimerVariant = isExamSimulation ? 'prominent' : timerVariant;
  const refreshHint =
    lang === 'en'
      ? 'Reload parts, texts and answers from the server and clear your selections.'
      : 'Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.';
  const updatingLabel = lang === 'en' ? 'Updating…' : 'Actualizando…';
  const sessionLabel = lang === 'en' ? `Session: ${title}` : `Sesión: ${title}`;
  const savedPrefix = lang === 'en' ? 'Saved:' : 'Guardado:';
  const workPanelRef = useRef(null);

  return (
    <>
      {!showPractice
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
            {modeBadge ? (
              <p className={`levels-exam-mode-badge levels-exam-mode-badge--${practiceMode}`}>
                {modeBadge}
              </p>
            ) : null}
            <h1 className="levels-b2-practice__title">{title}</h1>
            {!hideMascot ? (
              <div className="levels-b2-practice__mascot" aria-hidden>
                <SiteMascot variant={10} width={128} alt="" />
              </div>
            ) : null}
            {!hideSubtitle && subtitle ? (
              <p className="levels-b2-practice__subtitle">{subtitle}</p>
            ) : null}

            {showRefresh && onRefresh ? (
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
          <div className="levels-b2-practice__status">
            {focusMode && onExitFocusMode ? (
              <button
                type="button"
                className="tool-button levels-b2-practice__focus-exit"
                onClick={onExitFocusMode}
              >
                Exit focus mode
              </button>
            ) : null}
            <div className="levels-b2-practice__status-row">
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

            {!hideScorePanel && scorePanelOverride ? scorePanelOverride : null}

            {!hideScorePanel && !scorePanelOverride && partScoreMetrics ? (
              <LevelsPartScorePanel
                correctCount={partScoreMetrics.correctCount}
                totalSlots={partScoreMetrics.totalSlots}
                passingCount={partScoreMetrics.passingCount}
                lang={lang}
                variant={effectiveScoreVariant}
              />
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
          </div>

          {partFinishNotice && !partFinishNotice.error ? (
            <LevelsPartFinishBanner
              passed={partFinishNotice.passed}
              correct={partFinishNotice.correct}
              total={partFinishNotice.total}
              passing={partFinishNotice.passing}
              lang={lang}
            />
          ) : null}
          {partFinishNotice?.error ? (
            <LevelsPartFinishBanner
              passed={false}
              correct={0}
              total={0}
              passing={0}
              error={partFinishNotice.error}
              lang={lang}
            />
          ) : null}

          {partsData?.length > 0 && !hidePartTabs ? (
            <div
              className={`levels-b2-part-tabs${partsData.length >= 7 ? ' levels-b2-part-tabs--many' : ''}`}
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
                    <span>{getPartTabLabel(part, lang, getPartTabLabelProp)}</span>
                    {savedScore ? (
                      <span className="levels-b2-part-tab__score">
                        {savedPrefix} {savedScore}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

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
