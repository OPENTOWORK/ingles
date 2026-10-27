import { runSpeakingB2Rubric } from './rubric-engine.js';
import { runSpeakingB2Pedagogy } from './pedagogy-es.js';
import { persistAssessmentAndIssues } from '../session-store.js';
import { turnsForSpeakingB2Evaluation } from '../../domain/stt-quality.js';

function buildAcousticContext(turns) {
  const audioTurns = turns.filter((turn) => turn.role === 'candidate' && turn.hasAudio);
  return {
    hasAudio: audioTurns.length > 0,
    clipCount: audioTurns.length,
    uncertainCount: audioTurns.filter((turn) => turn.uncertain).length,
    hasAcousticAnalysis: false,
  };
}

export async function runSpeakingB2Complete({ session, persist = true }) {
  const turns = turnsForSpeakingB2Evaluation(session.turns || []);
  const acoustic = buildAcousticContext(turns);
  const rubric = await runSpeakingB2Rubric({
    turns,
    hasAudio: acoustic.hasAudio,
    acoustic,
  });
  const pedagogy = await runSpeakingB2Pedagogy({
    examCode: session.examCode,
    turns,
    rubric,
  });

  const report = {
    examCode: session.examCode,
    officialCambridge: false,
    disclaimer: rubric.disclaimer,
    scores: rubric.scores,
    evidence: rubric.evidence,
    abstention: rubric.abstention || {},
    summaryEs: pedagogy.summaryEs,
    strengths: pedagogy.strengths,
    issues: pedagogy.issues,
    modelAnswers: pedagogy.modelAnswers,
    recommendations: pedagogy.recommendations,
  };

  if (persist && !session.fixtureMode) {
    await persistAssessmentAndIssues({
      session,
      assessment: report,
      issues: pedagogy.issues,
      recommendations: pedagogy.recommendations,
    });
  }

  return report;
}
