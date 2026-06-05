'use client';

import SiteMascot from '@/components/SiteMascot';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';

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
  refreshLabel,
  loading,
  onRefresh,
  showRefresh = true,
  partScoreMetrics,
  hideScorePanel = false,
  partFinishNotice,
  partsData,
  selectedPartId,
  onSelectPart,
  getPartSavedScoreLabel,
  getPartTabLabel: getPartTabLabelProp,
  lang = 'es',
  workPanelClassName = '',
  children,
}) {
  const refreshHint =
    lang === 'en'
      ? 'Reload parts, texts and answers from the server and clear your selections.'
      : 'Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.';
  const updatingLabel = lang === 'en' ? 'Updating…' : 'Actualizando…';
  const sessionLabel = lang === 'en' ? `Session: ${title}` : `Sesión: ${title}`;
  const savedPrefix = lang === 'en' ? 'Saved:' : 'Guardado:';

  return (
    <>
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

      {!examPracticeOpen ? null : (
        <div className="levels-b2-practice">
          <header className="levels-b2-practice__header">
            <h1 className="levels-b2-practice__title">{title}</h1>
            <div className="levels-b2-practice__mascot" aria-hidden>
              <SiteMascot variant={10} width={128} alt="" />
            </div>
            {subtitle ? <p className="levels-b2-practice__subtitle">{subtitle}</p> : null}

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
            className={['levels-b2-practice__work-panel', workPanelClassName]
              .filter(Boolean)
              .join(' ')}
          >
          <div className="levels-b2-practice__status">
            <LevelsCategoryTimer categoryLabel={sessionLabel} timeLabel={timerLabel} />

            {!hideScorePanel && partScoreMetrics ? (
              <LevelsPartScorePanel
                correctCount={partScoreMetrics.correctCount}
                totalSlots={partScoreMetrics.totalSlots}
                passingCount={partScoreMetrics.passingCount}
                lang={lang}
              />
            ) : null}
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

          {partsData?.length > 0 ? (
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

          <div className="levels-b2-practice__work-body">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
