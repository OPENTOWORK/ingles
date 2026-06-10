/** @typedef {'exam-simulation' | 'part-practice'} ExamPracticeMode */

export const EXAM_PRACTICE_MODE = {
  EXAM_SIMULATION: 'exam-simulation',
  PART_PRACTICE: 'part-practice',
};

/**
 * Resolves UI mode from gated exam-mode session state (see useExamModeStrict).
 * Skill routes with ?part= are always part-practice.
 *
 * @param {{ examModeActive?: boolean, reviewMode?: boolean }} params
 * @returns {ExamPracticeMode}
 */
export function resolveExamPracticeMode({ examModeActive = false, reviewMode = false }) {
  if (examModeActive || reviewMode) return EXAM_PRACTICE_MODE.EXAM_SIMULATION;
  return EXAM_PRACTICE_MODE.PART_PRACTICE;
}

/**
 * @param {ExamPracticeMode | string | undefined} mode
 */
export function isExamSimulationMode(mode) {
  return mode === EXAM_PRACTICE_MODE.EXAM_SIMULATION;
}

/**
 * @param {ExamPracticeMode | string | undefined} mode
 */
export function isPartPracticeMode(mode) {
  return mode === EXAM_PRACTICE_MODE.PART_PRACTICE;
}

/**
 * @param {{ lang?: string, examModeActive?: boolean, reviewMode?: boolean, sectionTitle?: string, defaultTitle?: string }} params
 */
export function getExamChromeTitle({
  lang = 'en',
  examModeActive = false,
  reviewMode = false,
  sectionTitle = '',
  defaultTitle = '',
}) {
  if (reviewMode) {
    return lang === 'en' ? 'Exam review' : 'Revisión del examen';
  }
  if (examModeActive) {
    return lang === 'en' ? 'B2 Full Exam Simulation' : 'Simulación examen B2';
  }
  return defaultTitle;
}

/**
 * @param {{ lang?: string, examModeActive?: boolean, reviewMode?: boolean, defaultSubtitle?: string }} params
 */
export function getExamChromeSubtitle({
  lang = 'en',
  examModeActive = false,
  reviewMode = false,
  defaultSubtitle = '',
}) {
  if (reviewMode) {
    return lang === 'en'
      ? 'Review your answers and explanations.'
      : 'Revisa tus respuestas y explicaciones.';
  }
  if (examModeActive) {
    return lang === 'en'
      ? 'Complete the exam under timed conditions. Feedback is shown at the end.'
      : 'Completa el examen con tiempo limitado. Las correcciones se muestran al final.';
  }
  return defaultSubtitle;
}
