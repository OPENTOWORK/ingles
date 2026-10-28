import { draloChatCompletion } from '@/lib/draloAiEngine';
import { buildSpeakingB2IssueId } from '../../domain/error-taxonomy.js';
import { SPEAKING_B2_SCORE_DISCLAIMER } from '../../domain/rubric-b2-part1.js';
import { getSpeakingB2Question } from '../../domain/question-bank/sp-ex001-part1.js';
import { attachSpeakingB2IssuesToTurns, pairSpeakingB2Answers } from '../../domain/issue-validator.js';

function completionText(raw) {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw.text === 'string') return raw.text;
  return '';
}

function parseJson(text) {
  try {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

const PEDAGOGY_SYSTEM = `Eres un profesor de B2 First de Dralo. Redactas feedback pedagógico en español.

Reglas:
- El examen y los ejemplos lingüísticos van en inglés británico.
- Las explicaciones van en español: por qué ocurre el error y una alternativa natural de nivel B2.
- Distingue un error real de una mejora de estilo. No trates el estilo como error.
- Reconoce fortalezas reales. No elogies una respuesta irrelevante como si contestara a la pregunta.
- Si el código es review_required o unclassified, explica el fragmento sin inventar una categoría.
- No presentes las puntuaciones como oficiales de Cambridge.
- No inventes errores. Usa solo las incidencias que te pasen.
- No recomiendes estructuras claramente superiores a B2.
- Sé claro, concreto y breve.`;

export async function runSpeakingB2Pedagogy({ examCode, turns, rubric }) {
  const candidateTurns = pairSpeakingB2Answers(turns, getSpeakingB2Question);
  const issueSeed = (rubric.rawIssues || []).map((issue, index) => ({
    ...issue,
    id: buildSpeakingB2IssueId({
      examCode,
      questionId: issue.questionId,
      code: issue.code,
      index: index + 1,
    }),
  }));

  const fallback = buildFallbackPedagogy({ candidateTurns, rubric, issueSeed });

  try {
    const raw = await draloChatCompletion({
      system: PEDAGOGY_SYSTEM,
      rawSystem: true,
      userMessage:
        `Turnos del alumno:\n${candidateTurns
          .map((turn) => `${turn.questionId} / ${turn.question || ''}: ${turn.transcript}`)
          .join('\n')}\n\n` +
        `Resumen evaluador (EN): ${rubric.summaryEn || ''}\n` +
        `Incidencias: ${JSON.stringify(issueSeed)}\n` +
        `Devuelve JSON: {"summaryEs":"","strengths":["",""],"issues":[{` +
        `"id":"","code":"","questionId":"","originalText":"","excerpt":"","suggestion":"",` +
        `"explanation":"","severity":"medium","confidence":0.7,"evidence":"",` +
        `"skillToReinforce":""}],"modelAnswers":[{"questionId":"","answer":""}],` +
        `"recommendations":[{"title":"","body":""}]}`,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });
    const model = parseJson(completionText(raw));
    if (!model) return fallback;

    const issues = Array.isArray(model.issues)
      ? attachSpeakingB2IssuesToTurns(
          model.issues
            .filter((issue) => issueSeed.some((seed) => seed.id === issue.id || seed.code === issue.code))
            .map((issue, index) => ({
              id: issue.id || issueSeed[index]?.id,
              code: issue.code,
              questionId: issue.questionId,
              originalText: issue.originalText || '',
              excerpt: issue.excerpt || '',
              suggestion: issue.suggestion || '',
              explanation: issue.explanation || '',
              severity: issue.severity || 'medium',
              confidence: issue.confidence ?? 0.7,
              evidence: issue.evidence || '',
              audioStartMs: null,
              skillToReinforce: issue.skillToReinforce || '',
            })),
          candidateTurns,
        )
      : issueSeed;

    return {
      disclaimer: SPEAKING_B2_SCORE_DISCLAIMER,
      summaryEs: model.summaryEs || fallback.summaryEs,
      strengths: Array.isArray(model.strengths) ? model.strengths.filter(Boolean).slice(0, 4) : fallback.strengths,
      issues,
      modelAnswers: Array.isArray(model.modelAnswers) ? model.modelAnswers : fallback.modelAnswers,
      recommendations: Array.isArray(model.recommendations)
        ? model.recommendations
        : fallback.recommendations,
    };
  } catch (error) {
    console.error('[speaking-b2] pedagogy failed', error?.message || error);
    return fallback;
  }
}

function buildFallbackPedagogy({ candidateTurns, rubric, issueSeed }) {
  const modelAnswers = candidateTurns
    .filter((turn) => turn.questionId && getSpeakingB2Question(turn.questionId))
    .map((turn) => {
      const question = getSpeakingB2Question(turn.questionId);
      return {
        questionId: turn.questionId,
        answer: `A natural B2 answer to “${question.question}” would develop the idea with a reason and a short example.`,
      };
    });

  return {
    disclaimer: SPEAKING_B2_SCORE_DISCLAIMER,
    summaryEs:
      rubric.evidence?.hasCandidateSpeech
        ? 'Has completado la Part 1. Esta corrección es orientativa y se basa solo en lo que se ha podido oír con claridad.'
        : 'No hay suficiente evidencia oral para preparar un informe detallado.',
    strengths: issueSeed.some((issue) => issue.code === 'DM-RV')
      ? []
      : rubric.evidence?.hasCandidateSpeech
        ? ['Has respondido en inglés a las preguntas del examinador.']
        : [],
    issues: issueSeed,
    modelAnswers,
    recommendations: [
      {
        title: 'Desarrolla un poco más',
        body: 'En Part 1, intenta responder con dos o tres frases: idea, razón y un ejemplo breve.',
      },
    ],
  };
}
