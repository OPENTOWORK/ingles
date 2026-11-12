import { cambridgeChatCompletion } from '@/lib/draloAiEngine';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

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
    throw new Error('B1 Reading quality validator returned invalid JSON.');
  }
}

function answerKey(generated) {
  return asArray(generated?.modelAnswers)
    .map((a) => `${a?.number ?? a?.id ?? '?'}=${a?.answer ?? ''}`)
    .join(', ');
}

function questionsView(generated) {
  return asArray(generated?.questions)
    .map((q) => {
      const text = q?.text || q?.message || q?.notice || '';
      const prompt = q?.prompt || q?.question || q?.description || '';
      const options = asArray(q?.options).join(' | ');
      return [`Q${q?.number ?? '?'}`, text, prompt, options].filter(Boolean).join('\n');
    })
    .join('\n\n');
}

function sectionsView(generated) {
  return asArray(generated?.sections)
    .map((s) => `${s?.letter || '?'}: ${s?.name || s?.title || ''}\n${s?.text || s?.body || ''}`)
    .join('\n\n');
}

function poolView(generated) {
  return asArray(generated?.sentencePool)
    .map((s) => typeof s === 'string' ? s : `${s?.letter || '?'}): ${s?.text || s?.sentence || ''}`)
    .join('\n');
}

async function callReview(system, user) {
  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system,
    messages: [{ role: 'user', content: user }],
    temperature: 0,
    max_tokens: 1800,
    response_format: { type: 'json_object' },
  });
  return parseJsonFromModel(text);
}

function pushMismatchErrors(errors, solved, expected, label = 'question') {
  const map = new Map(
    asArray(solved)
      .map((a) => [Number(a?.number ?? a?.gap), String(a?.letter ?? a?.word ?? a?.answer ?? '').trim().toUpperCase()])
      .filter(([n, a]) => Number.isInteger(n) && a),
  );
  for (const entry of asArray(expected)) {
    const n = Number(entry?.number);
    const key = String(entry?.answer ?? '').trim().toUpperCase();
    const got = map.get(n);
    if (got && key && got !== key) {
      errors.push(`B1 semantic blind-solve disagreed on ${label} ${n}: key ${key}, independent solver ${got}.`);
    }
  }
}

function findings(rubric, errors, warnings) {
  for (const x of asArray(rubric?.ambiguousItems)) {
    errors.push(`B1 ambiguity Q${x?.number ?? '?'}: ${x?.reason || 'more than one answer is defensible'}`);
  }
  for (const x of asArray(rubric?.weakDistractors)) {
    errors.push(`B1 weak distractor Q${x?.number ?? '?'}${x?.letter ? ` ${x.letter}` : ''}: ${x?.reason || 'not plausibly tempting'}`);
  }
  for (const x of asArray(rubric?.literalSolveItems)) {
    warnings.push(`B1 Q${x?.number ?? '?'} may be solvable by word spotting: ${x?.reason || ''}`);
  }
  for (const x of asArray(rubric?.issues)) {
    if (x) warnings.push(`B1 quality review: ${x}`);
  }
}

async function reviewPart1(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 1 WITHOUT trusting the supplied answer key.
Solve all five items independently. Each item is a short real-world text with three options and should test the main message.
Report ambiguity if two options express the text equally well. Report a weak distractor only if it is implausible even after a reasonable misreading. Report word-spotting when matching vocabulary gives the answer away.
Return ONLY JSON:
{"answers":[{"number":1,"letter":"A"}],"ambiguousItems":[{"number":2,"letters":["A","C"],"reason":"..."}],"weakDistractors":[{"number":3,"letter":"B","reason":"..."}],"literalSolveItems":[{"number":4,"reason":"..."}],"issues":[],"verdict":"pass|revise"}.
Do not invent faults to fill arrays.`,
    `ITEMS:\n${questionsView(generated)}\n\nSUPPLIED KEY (for comparison only after solving): ${answerKey(generated)}`,
  );
}

async function reviewPart2(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 2 WITHOUT trusting the supplied key.
There are five people and eight texts A-H on one topic. Match each person independently using ALL of their requirements.
Flag ambiguity when two texts satisfy a person's requirements equally well. Flag a weak profile/text set if the correct match is obvious from a copied word rather than detailed comprehension.
Return ONLY JSON:
{"answers":[{"number":6,"letter":"F"}],"ambiguousItems":[{"number":7,"letters":["B","G"],"reason":"both satisfy all requirements"}],"literalSolveItems":[{"number":8,"reason":"same rare phrase appears in profile and text"}],"weakDistractors":[],"issues":[],"verdict":"pass|revise"}.
Do not report partial matches as ambiguity: an alternative must satisfy the important requirements equally well.`,
    `PEOPLE:\n${questionsView(generated)}\n\nTEXTS:\n${sectionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart3(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 3 WITHOUT trusting the supplied key.
Solve the five four-option questions from the passage. Check detailed comprehension, gist/global meaning, inference and writer attitude/opinion.
Flag an item if two answers are defensible. Flag distractors that are unrelated to passage ideas or trivially impossible. Flag items solvable mainly by copied wording.
Return ONLY JSON:
{"answers":[{"number":11,"letter":"C"}],"ambiguousItems":[],"weakDistractors":[],"literalSolveItems":[],"coverage":{"detail":true,"inference":true,"attitudeOrOpinion":true,"globalOrGist":true},"issues":[],"verdict":"pass|revise"}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nQUESTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart4(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 4 WITHOUT trusting the supplied key.
There are five gaps (16-20) and eight candidate sentences A-H, so exactly three are unused.
Solve the complete assignment. Then test EVERY candidate sentence against EVERY gap. "multifit" means a sentence genuinely produces coherent, grammatical text in more than one gap, considering both the sentence before and after and the wider narrative/argument.
Flag weak cohesion when the intended sentence has no strong backward/forward link. Do not flag merely topical similarity.
Return ONLY JSON:
{"assignments":[{"gap":16,"letter":"G"}],"multifit":[{"letter":"B","gaps":[17,19],"reason":"..."}],"weakCohesion":[{"gap":18,"reason":"..."}],"unusedLetters":["A","C","H"],"issues":[],"verdict":"pass|revise"}.`,
    `GAPPED PASSAGE:\n${generated?.passage || ''}\n\nCANDIDATE SENTENCES:\n${poolView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart5(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 5 WITHOUT trusting the supplied key.
Solve all six multiple-choice cloze gaps. This task tests mainly vocabulary, with some grammar/complementation allowed.
Flag ambiguity if two options are natural and defensible in context. Flag distractors only when they are obviously unusable rather than plausibly tempting. Flag a gap that is really a Part 6-style pure grammar gap if that pattern dominates the task.
CRITICAL NATURALNESS CHECK: mentally insert the selected answer into the complete sentence and judge the resulting British English collocation/verb pattern. If the keyed/best completion is unidiomatic, semantically wrong, or not a normal B1 collocation (for example an impossible verb+noun combination), report it in unnaturalItems. Do not pass an item merely because all four options are bad.
Return ONLY JSON:
{"answers":[{"number":21,"letter":"C"}],"ambiguousItems":[],"weakDistractors":[],"grammarOnlyItems":[{"number":24,"reason":"pure article choice"}],"unnaturalItems":[{"number":22,"completion":"...","reason":"unidiomatic collocation"}],"literalSolveItems":[],"issues":[],"verdict":"pass|revise"}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart6(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 6 WITHOUT trusting the supplied key.
Each of gaps 27-32 must take exactly ONE word. Solve every gap independently.
For each gap actively search for alternative ordinary B1 words that would also make the completed text grammatical, natural and equivalent in meaning. Record all fully defensible alternatives.
The task should primarily test grammatical structures, with some phrasal verbs/common fixed phrases. Do not treat a merely possible but meaning-changing word as an acceptable alternative.
Return ONLY JSON:
{"answers":[{"number":27,"word":"each","alternatives":[]}],"ambiguousItems":[{"number":28,"words":["which","that"],"reason":"both are standard defining relatives here"}],"vocabularyStyleItems":[{"number":30,"reason":"requires guessing a content noun"}],"issues":[],"verdict":"pass|revise"}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

/**
 * Semantic/adversarial quality gate for B1 Preliminary Reading Parts 1-6.
 * Hard errors block generation/persistence; warnings are retained for review.
 */
export async function validateB1ReadingQuality(partNumber, generated) {
  const part = Number(partNumber);
  let rubric;
  if (part === 1) rubric = await reviewPart1(generated);
  else if (part === 2) rubric = await reviewPart2(generated);
  else if (part === 3) rubric = await reviewPart3(generated);
  else if (part === 4) rubric = await reviewPart4(generated);
  else if (part === 5) rubric = await reviewPart5(generated);
  else if (part === 6) rubric = await reviewPart6(generated);
  else return { ok: true, errors: [], warnings: [], rubric: null };

  const errors = [];
  const warnings = [];

  if ([1,2,3,5].includes(part)) {
    pushMismatchErrors(errors, rubric?.answers, generated?.modelAnswers);
    findings(rubric, errors, warnings);
  }

  if (part === 3) {
    const c = rubric?.coverage || {};
    if (c.inference === false) warnings.push('B1 Part 3 lacks a clear inference item.');
    if (c.attitudeOrOpinion === false) warnings.push('B1 Part 3 lacks writer attitude/opinion coverage.');
    if (c.globalOrGist === false) warnings.push('B1 Part 3 lacks gist/global meaning coverage.');
  }

  if (part === 4) {
    pushMismatchErrors(
      errors,
      asArray(rubric?.assignments).map((a) => ({ number: a?.gap, letter: a?.letter })),
      generated?.modelAnswers,
      'gap',
    );
    for (const m of asArray(rubric?.multifit)) {
      errors.push(`B1 Part 4 multifit: sentence ${m?.letter || '?'} fits gaps ${asArray(m?.gaps).join(', ')}. ${m?.reason || ''}`);
    }
    for (const w of asArray(rubric?.weakCohesion)) {
      errors.push(`B1 Part 4 weak cohesion at gap ${w?.gap ?? '?'}: ${w?.reason || ''}`);
    }
    const unused = asArray(rubric?.unusedLetters).map((x) => String(x).toUpperCase()).filter(Boolean);
    if (unused.length && unused.length !== 3) {
      errors.push(`B1 Part 4 independent solve leaves ${unused.length} unused sentences; official task requires exactly 3.`);
    }
  }

  if (part === 5) {
    for (const item of asArray(rubric?.unnaturalItems)) {
      errors.push(`B1 Part 5 unnatural completion Q${item?.number ?? '?'}: ${item?.reason || item?.completion || 'the completed sentence is not natural British English'}`);
    }
    const grammarOnly = asArray(rubric?.grammarOnlyItems);
    if (grammarOnly.length >= 4) {
      errors.push('B1 Part 5 is dominated by pure grammar gaps; it should test mainly vocabulary.');
    } else if (grammarOnly.length) {
      warnings.push(`B1 Part 5 grammar-heavy items: ${grammarOnly.map((x) => x?.number).filter(Boolean).join(', ')}.`);
    }
  }

  if (part === 6) {
    const expected = asArray(generated?.modelAnswers);
    const solved = asArray(rubric?.answers);
    const solverMap = new Map(solved.map((a) => [Number(a?.number), a]));
    for (const key of expected) {
      const n = Number(key?.number);
      const expectedWord = String(key?.answer || '').trim().toLowerCase();
      const row = solverMap.get(n);
      if (!row) continue;
      const best = String(row?.word || '').trim().toLowerCase();
      const alternatives = asArray(row?.alternatives).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
      if (best && best !== expectedWord && !alternatives.includes(expectedWord)) {
        errors.push(`B1 Part 6 blind-solve disagreed on Q${n}: key "${expectedWord}", solver "${best}".`);
      }
      const distinct = [...new Set([best, ...alternatives].filter(Boolean))];
      if (distinct.length > 1) {
        errors.push(`B1 Part 6 Q${n} accepts multiple ordinary answers: ${distinct.join(' / ')}.`);
      }
    }
    for (const a of asArray(rubric?.ambiguousItems)) {
      errors.push(`B1 Part 6 ambiguity Q${a?.number ?? '?'}: ${asArray(a?.words).join(' / ')}. ${a?.reason || ''}`);
    }
    const vocab = asArray(rubric?.vocabularyStyleItems);
    for (const item of vocab) {
      errors.push(`B1 Part 6 Q${item?.number ?? '?'} tests content vocabulary rather than grammar/fixed language: ${item?.reason || 'replace this gap'}`);
    }
  }

  if (String(rubric?.verdict || '').toLowerCase() === 'revise' && errors.length === 0) {
    warnings.push('B1 semantic reviewer verdict is revise; inspect the reported issues.');
  }

  return { ok: errors.length === 0, errors, warnings, rubric };
}
