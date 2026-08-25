/**
 * AI adversarial quality review for B2 RUOE Parts 3, 5, 6, 7 (v1.1.1).
 * Returns structured QUALITY findings — never promoted to mechanical HARD_FAIL certainty.
 */
import { cambridgeChatCompletion } from '@/lib/draloAiEngine';
import {
  extractMcqLetter,
  extractMcqOptionText,
  extractPoolLetter,
  extractPoolSentenceText,
} from '@/lib/b2RuoeExamQuality';
import { createFinding } from '@/lib/ruoeValidationFindings';

function getValidatorModel() {
  const m = String(process.env.DRALO_OPENAI_MODEL_VALIDATOR || '').trim();
  return m || undefined;
}

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Adversarial quality validator returned invalid JSON.');
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function findingsFromAiItems(items, rulePrefix, defaultAction) {
  const findings = [];
  for (const item of asArray(items)) {
    const number = item?.number ?? item?.gap ?? item?.question ?? null;
    const location = number != null ? `Q${number}` : 'batch';
    findings.push(
      createFinding({
        rule_id: item?.rule_id || `${rulePrefix}`,
        severity: 'QUALITY_FAIL',
        location,
        evidence: String(item?.evidence || item?.reason || item?.problem || '').slice(0, 240),
        reason: String(item?.reason || item?.problem || item?.detail || 'AI flagged quality issue.'),
        recommended_local_action: item?.action || defaultAction,
        source: 'ai_adversarial',
      }),
    );
  }
  return findings;
}

async function callAdversarialReview(system, userContent) {
  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });
  return parseJsonFromModel(text);
}

/**
 * Part 3 — naturalness / forced transformation review.
 * @returns {Promise<{ findings: object[], rubric: object }>}
 */
export async function reviewB2Part3AdversarialQuality(generated) {
  const passage = String(generated?.passage || '');
  const items = asArray(generated?.questions)
    .map((q) => {
      const stem = String(q?.stem || q?.baseWord || '').trim();
      return `${q?.number}. (${stem}) gap context in passage`;
    })
    .join('\n');

  const rubric = await callAdversarialReview(
    `You review a Cambridge B2 First Use of English Part 3 (word formation). Judge naturalness honestly.
Return ONLY JSON:
{
 "forcedItems":[{"number":17,"reason":"stem feels jammed; answer unnatural in context"}],
 "unnaturalAnswers":[{"number":18,"reason":"derived word not idiomatic here"}],
 "varietyOk": true|false,
 "issues":["short specific issue"],
 "verdict":"pass"|"revise"
}
Do NOT flag items where the transformation is standard B2 word formation. Empty arrays when none.`,
    `TITLE: ${generated?.title || ''}\n\nPASSAGE:\n${passage}\n\nGAPS:\n${items}`,
  );

  const findings = [
    ...findingsFromAiItems(rubric?.forcedItems, 'P3-FORCED-NATURALNESS', 'Rewrite gap context or choose a more natural derivation.'),
    ...findingsFromAiItems(rubric?.unnaturalAnswers, 'P3-UNNATURAL-ANSWER', 'Regenerate item with idiomatic derived word.'),
  ];
  if (rubric?.varietyOk === false) {
    findings.push(
      createFinding({
        rule_id: 'P3-VARIETY',
        severity: 'QUALITY_FAIL',
        location: 'batch',
        evidence: 'AI variety check',
        reason: 'Transformation families feel repetitive or forced for prefix/negative coverage.',
        recommended_local_action: 'Balance derivational families without forcing unnatural prefixes.',
        source: 'ai_adversarial',
      }),
    );
  }
  return { findings, rubric };
}

/**
 * Part 5 — blind solve + defend each distractor.
 */
export async function reviewB2Part5AdversarialQuality(generated) {
  const passage = String(generated?.passage || '');
  const questions = asArray(generated?.questions);
  const examLines = questions
    .map((q) => {
      const opts = asArray(q.options)
        .map((o) => extractMcqOptionText(o))
        .join(' | ');
      return `Q${q?.number}: ${String(q?.prompt || q?.question || '').trim()}\n${opts}`;
    })
    .join('\n\n');

  const rubric = await callAdversarialReview(
    `You are a Cambridge B2 First examiner reviewing Reading Part 5 (multiple choice).
WITHOUT seeing any answer key:
1) Solve each question (best letter).
2) For each question, try to defend why each WRONG option could tempt a strong candidate.

Return ONLY JSON:
{
 "answers":[{"number":31,"letter":"B","confidence":"high|medium|low"}],
 "weakDistractors":[{"number":31,"letter":"C","reason":"not grounded in passage"}],
 "undefendedWrong":[{"number":32,"letters":["A","D"],"reason":"no plausible misread"}],
 "literalSolveItems":[{"number":33,"reason":"solvable by copying passage words"}],
 "issues":["short issue"],
 "verdict":"pass"|"revise"
}`,
    `PASSAGE:\n${passage}\n\nQUESTIONS:\n${examLines}`,
  );

  const findings = [
    ...findingsFromAiItems(rubric?.weakDistractors, 'P5-WEAK-DISTRACTOR', 'Ground distractor in passage ideas or vocabulary.'),
    ...findingsFromAiItems(
      rubric?.undefendedWrong?.map((u) => ({
        number: u?.number,
        reason: `Wrong options lack plausible defence: ${(u?.letters || []).join('/')}. ${u?.reason || ''}`,
      })),
      'P5-UNDEFENDED-DISTRACTOR',
      'Make wrong options temptingly plausible from the passage.',
    ),
    ...findingsFromAiItems(rubric?.literalSolveItems, 'P5-LITERAL-SOLVE', 'Paraphrase stem and correct option away from literal overlap.'),
  ];
  return { findings, rubric, blindSolve: { answers: rubric?.answers || [] } };
}

/**
 * Part 6 — solve gaps without answer key; detect multifit options.
 */
export async function reviewB2Part6AdversarialQuality(generated) {
  const passage = String(generated?.passage || '');
  const pool = asArray(generated?.sentencePool).length
    ? asArray(generated?.sentencePool)
    : asArray(generated?.options);
  const poolLines = pool
    .map((p) => `${extractPoolLetter(p) || '?'}) ${extractPoolSentenceText(p)}`)
    .join('\n');

  const rubric = await callAdversarialReview(
    `You solve Cambridge B2 First Reading Part 6 (gapped text) WITHOUT an answer key.
Pool A–G: six sentences fit gaps (37)–(42); one is unused.
For each pool sentence, note if it could fit MORE than one gap.

Return ONLY JSON:
{
 "assignments":[{"gap":37,"letter":"C","confidence":"high|medium|low"}],
 "multifit":[{"letter":"D","gaps":[38,40],"reason":"discourse links work in both"}],
 "unusedLetter":"G",
 "weakCohesion":[{"gap":39,"reason":"correct sentence weakly linked"}],
 "issues":["short issue"],
 "verdict":"pass"|"revise"
}`,
    `TITLE: ${generated?.title || ''}\n\nGAPPED PASSAGE:\n${passage}\n\nSENTENCE POOL:\n${poolLines}`,
  );

  const findings = [
    ...findingsFromAiItems(
      rubric?.multifit?.map((m) => ({
        number: m?.gaps?.[0],
        rule_id: 'TEST-P6-MULTIFIT',
        reason: `Option ${m?.letter} may fit gaps ${(m?.gaps || []).join(',')}: ${m?.reason || ''}`,
        evidence: m?.letter,
      })),
      'TEST-P6-MULTIFIT',
      'Rewrite option or gap context so only one gap accepts the sentence.',
    ),
    ...findingsFromAiItems(rubric?.weakCohesion, 'P6-WEAK-COHESION', 'Improve backward/forward discourse clues.'),
  ];
  return { findings, rubric, blindSolve: { assignments: rubric?.assignments || [] } };
}

/**
 * Part 7 — solve questions; flag literal word matching.
 */
export async function reviewB2Part7AdversarialQuality(generated) {
  const sections = asArray(generated?.sections).length ? asArray(generated?.sections) : asArray(generated?.texts);
  const sectionLines = sections
    .map((s) => `${s?.letter || '?'}) ${s?.name || s?.title || ''}\n${String(s?.text || s?.body || '').trim()}`)
    .join('\n\n');
  const questionLines = asArray(generated?.questions)
    .map((q) => `Q${q?.number}: ${String(q?.prompt || q?.question || '').trim()}`)
    .join('\n');

  const rubric = await callAdversarialReview(
    `You solve Cambridge B2 First Reading Part 7 (multiple matching) WITHOUT an answer key.
Flag questions solvable mainly by copying words from a profile (literal word matching).

Return ONLY JSON:
{
 "answers":[{"number":43,"section":"B","confidence":"high|medium|low"}],
 "literalMatchItems":[{"number":44,"section":"A","matchedWords":["overwhelmed","deadline"],"reason":"stem copies profile"}],
 "issues":["short issue"],
 "verdict":"pass"|"revise"
}`,
    `SECTIONS:\n${sectionLines}\n\nQUESTIONS:\n${questionLines}`,
  );

  const findings = findingsFromAiItems(
    rubric?.literalMatchItems?.map((m) => ({
      number: m?.number,
      rule_id: 'TEST-P7-WORD-MATCH',
      reason: `Solvable by literal overlap with section ${m?.section}: ${(m?.matchedWords || []).join(', ')}. ${m?.reason || ''}`,
      evidence: (m?.matchedWords || []).join(','),
    })),
    'TEST-P7-WORD-MATCH',
    'Paraphrase question stem away from profile wording.',
  );
  return { findings, rubric, blindSolve: { answers: rubric?.answers || [] } };
}

/**
 * @param {number} partNumber
 * @param {object} generated
 * @returns {Promise<{ findings: object[], qualityFails: string[], warnings: string[], rubric?: object, blindSolve?: object }>}
 */
export async function runRuoeAdversarialQualityReview(partNumber, generated) {
  const pn = Number(partNumber);
  let result;
  switch (pn) {
    case 3:
      result = await reviewB2Part3AdversarialQuality(generated);
      break;
    case 5:
      result = await reviewB2Part5AdversarialQuality(generated);
      break;
    case 6:
      result = await reviewB2Part6AdversarialQuality(generated);
      break;
    case 7:
      result = await reviewB2Part7AdversarialQuality(generated);
      break;
    default:
      return { findings: [], qualityFails: [], warnings: [] };
  }

  const qualityFails = result.findings.map((f) => `[${f.rule_id}] ${f.location}: ${f.reason}`);
  return {
    findings: result.findings,
    qualityFails,
    warnings: [],
    rubric: result.rubric,
    blindSolve: result.blindSolve,
  };
}
