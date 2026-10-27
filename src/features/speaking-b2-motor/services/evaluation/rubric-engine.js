import { draloChatCompletion } from '@/lib/draloAiEngine';
import {
  SPEAKING_B2_SCORE_DISCLAIMER,
  applyInsufficientEvidence,
  describeScoreAbstention,
  emptySpeakingB2Scores,
  evidenceFlagsFromSession,
  readSpeakingB2Scores,
} from '../../domain/rubric-b2-part1.js';
import { isKnownSpeakingB2ErrorCode } from '../../domain/error-taxonomy.js';
import { getSpeakingB2Question } from '../../domain/question-bank/sp-ex001-part1.js';
import {
  ensureSpeakingB2DiscourseIssues,
  pairSpeakingB2Answers,
  validateSpeakingB2Issues,
} from '../../domain/issue-validator.js';

const RUBRIC_SYSTEM = `You are a B2 First speaking rater for Dralo. Assess ONLY the candidate turns from a solo Part 1 interview.

Work in this order for every candidate answer:
1. Detect whether a real problem exists. If the answer is acceptable, emit no issue.
2. Quote the exact excerpt from the candidate's words.
3. Decide the linguistic or communicative nature of that excerpt.
4. Assign a code only if the evidence supports it.
5. If the problem is real but the category is uncertain, use review_required.
6. Never use GR-VT as a default or leftover category.

Priority codes: GR-AR (articles), GR-VT (verb tenses and verbal structures only), GR-PR (prepositions), VC-CO (collocations), VC-WW (word choice), VC-RP (excessive repetition), DM-EL (insufficient elaboration), DM-RV (irrelevant answer), DM-OR (organisation).
Other known codes are allowed when clearly evidenced.

Rules:
- Judge each answer against its question. A grammatical answer that does not address the question is DM-RV, not a grammar error.
- Do not mark DM-EL only because the answer is short. A brief answer with a reason or example can be enough for Part 1.
- Do not invent grammar errors to fill the issues array.
- Distinguish a missing preposition (wait the bus, arrive to) from a wrong collocation (do a decision, make messages). make a decision and do sport are acceptable.
- Scoring is independent from the issue list. A clean answer can still receive a band. No issues does not mean 5.0.
- If there is enough language to judge Grammar and Vocabulary, give a 0-5 score. Do not return null only because you found no errors.
- Score Discourse Management when relevance, development or organisation can be judged. A single well-developed Part 1 answer can be scored. A two-word hedge cannot.
- Use null only when the sample is too thin to judge that criterion.
- Pronunciation, Interactive Communication and Global Achievement stay null in this solo transcript-only Part 1.
- Do not invent errors. Do not penalise uncertain transcripts.
- Return JSON only.`;

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

export async function runSpeakingB2Rubric({ turns, hasAudio, acoustic }) {
  const paired = pairSpeakingB2Answers(turns, getSpeakingB2Question);
  const flags = evidenceFlagsFromSession({ candidateTurns: paired, hasAudio, acoustic });
  const scores = emptySpeakingB2Scores();

  if (!flags.hasCandidateSpeech) {
    return {
      scores,
      evidence: flags,
      disclaimer: SPEAKING_B2_SCORE_DISCLAIMER,
      summaryEn: 'There is not enough candidate speech to assess this Part 1.',
      rawIssues: [],
    };
  }

  const transcriptBlock = paired
    .map((turn, index) => {
      const mark = turn.uncertain ? ' [UNCERTAIN TRANSCRIPT — do not penalise]' : '';
      return (
        `Q${index + 1} id=${turn.questionId || 'unknown'}\n` +
        `Question: ${turn.question || '(missing)'}\n` +
        `Answer: ${turn.transcript}${mark}`
      );
    })
    .join('\n\n');

  let model = null;
  try {
    const raw = await draloChatCompletion({
      system: RUBRIC_SYSTEM,
      rawSystem: true,
      userMessage:
        `Audio available for pronunciation: ${hasAudio && acoustic?.hasAudio ? 'yes' : 'no'}.\n\n` +
        `${transcriptBlock}\n\n` +
        `Return JSON: {"grammarVocabulary":3.5,"discourseManagement":3.0,"pronunciation":null,` +
        `"interactiveCommunication":null,"globalAchievement":null,"summaryEn":"","issues":[` +
        `{"questionId":"","code":"GR-AR|GR-PR|VC-CO|DM-EL|DM-RV|review_required",` +
        `"excerpt":"exact words from the answer","suggestion":"natural B2 alternative",` +
        `"severity":"low|medium|high","confidence":0.8,"evidence":"why this code fits this excerpt",` +
        `"skillToReinforce":""}]}`,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });
    model = parseJson(completionText(raw));
  } catch (error) {
    console.error('[speaking-b2] rubric failed', error?.message || error);
  }

  if (model) {
    Object.assign(scores, readSpeakingB2Scores(model));
  }

  const safeScores = applyInsufficientEvidence(scores, flags);
  if (!flags.pronunciation) safeScores.pronunciation = null;

  const rawIssues = Array.isArray(model?.issues)
    ? model.issues.flatMap((issue) => {
        if (issue.code?.startsWith('PN') && !flags.pronunciation) return [];
        const turn = paired.find((item) => item.questionId === issue.questionId) || paired[0];
        if (turn?.uncertain) return [];
        if (!isKnownSpeakingB2ErrorCode(issue.code) && issue.code !== 'review_required') {
          issue = { ...issue, code: 'review_required' };
        }
        if (!issue.excerpt && !issue.suggestion && !['DM-RV', 'DM-EL', 'VC-RP'].includes(issue.code)) {
          return [];
        }
        return validateSpeakingB2Issues([issue], {
          answer: turn?.transcript || '',
          question: turn?.question || '',
        });
      })
    : [];

  const withDiscourse = paired.reduce((issues, turn) => {
    if (turn.uncertain) return issues;
    return ensureSpeakingB2DiscourseIssues(issues, {
      answer: turn.transcript || '',
      question: turn.question || '',
      questionId: turn.questionId || '',
    });
  }, rawIssues);

  return {
    scores: safeScores,
    evidence: flags,
    abstention: describeScoreAbstention(flags, safeScores),
    disclaimer: SPEAKING_B2_SCORE_DISCLAIMER,
    summaryEn: model?.summaryEn || '',
    rawIssues: withDiscourse,
  };
}
