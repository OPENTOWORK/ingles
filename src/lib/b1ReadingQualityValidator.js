import { cambridgeChatCompletion } from '@/lib/draloAiEngine';
import { collectPart5Disputes, confirmedPart5DoubleKeys } from '@/lib/b1Part5DoubleKey';
import { findB1AboveLevelTerms } from '@/lib/b1ReadingConstruction';

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

const NON_BRITISH_B1_PATTERNS = [
  { re: /\bcustomiz(e|es|ed|ing|ation|ations)\b/i, label: 'customise/customisation' },
  { re: /\bapologiz(e|es|ed|ing)\b/i, label: 'apologise' },
  { re: /\b(loyalty|training|education|school|study) program\b/i, label: 'programme' },
  { re: /\b(?:to|can|could|should|would|will|may|might|must) practice\b/i, label: 'practise (verb)' },
  { re: /\bcolors?\b/i, label: 'colour' },
  { re: /\bbehaviors?\b/i, label: 'behaviour' },
  { re: /\bcenters?\b/i, label: 'centre' },
  { re: /\banalyz(e|es|ed|ing)\b/i, label: 'analyse' },
  { re: /\b(favor|favorite|favorites|honor|labor|neighbor|humor|rumor|flavor|harbor)\b/i, label: 'British -our spelling' },
  { re: /\btravel(ed|ing|er|ers)\b/i, label: 'travelled/travelling/traveller' },
  { re: /\bcancel(ed|ing)\b/i, label: 'cancelled/cancelling' },
  { re: /\b(defense|offense|jewelry)\b/i, label: 'British spelling' },
];

function britishEnglishErrors(generated) {
  const text = JSON.stringify(generated || {});
  const errors = [];
  for (const item of NON_BRITISH_B1_PATTERNS) {
    const match = text.match(item.re);
    if (match) errors.push(`B1 British English violation: "${match[0]}" should use ${item.label}.`);
  }
  return [...new Set(errors)];
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

function findings(rubric, errors, warnings, { literalAsError = false } = {}) {
  for (const x of asArray(rubric?.ambiguousItems)) {
    errors.push(`B1 ambiguity Q${x?.number ?? '?'}: ${x?.reason || 'more than one answer is defensible'}`);
  }
  for (const x of asArray(rubric?.weakDistractors)) {
    errors.push(`B1 weak distractor Q${x?.number ?? '?'}${x?.letter ? ` ${x.letter}` : ''}: ${x?.reason || 'not plausibly tempting'}`);
  }
  for (const x of asArray(rubric?.literalSolveItems)) {
    const reason = x?.reason || 'the answer can be copied from the text';
    if (literalAsError) {
      errors.push(`B1 Q${x?.number ?? '?'} is solvable by copying wording: ${reason}`);
    } else {
      warnings.push(`B1 Q${x?.number ?? '?'} may be solvable by word spotting: ${reason}`);
    }
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
For each person, check that EVERY material requirement in the profile is positively supported by the keyed text. If the profile says the person lacks equipment, needs supervision, requires a particular time, wants a regular activity, has children of a stated age, etc., the chosen text must genuinely support that requirement. Put unsupported or contradicted requirements in unsupportedRequirements.
Return ONLY JSON:
{"answers":[{"number":6,"letter":"F"}],"ambiguousItems":[{"number":7,"letters":["B","G"],"reason":"both satisfy all requirements"}],"unsupportedRequirements":[{"number":8,"letter":"B","requirement":"does not own gardening tools","reason":"the text provides seeds but does not say tools are provided"}],"literalSolveItems":[{"number":8,"reason":"same rare phrase appears in profile and text"}],"weakDistractors":[],"issues":[],"verdict":"pass|revise"}.
Do not report partial matches as ambiguity: an alternative must satisfy the important requirements equally well.`,
    `PEOPLE:\n${questionsView(generated)}\n\nTEXTS:\n${sectionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart3(generated) {
  const primary = await callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 3 WITHOUT trusting the supplied key.
Solve the five four-option questions from the passage. Check detailed comprehension, gist/global meaning, inference and writer attitude/opinion.
Flag an item if two answers are defensible. Flag distractors that are unrelated to passage ideas or trivially impossible. Flag items solvable mainly by copied wording.
Also flag levelIssues for words/phrases or sentence structures that are clearly above normal B1 Preliminary reading level and are not made transparent by context. Do not penalise an occasional challenging but inferable word.
Return ONLY JSON:
{"answers":[{"number":11,"letter":"C"}],"ambiguousItems":[],"weakDistractors":[],"literalSolveItems":[],"levelIssues":[{"text":"unparalleled","reason":"unnecessarily above B1 and central to the answer"}],"coverage":{"detail":true,"inference":true,"attitudeOrOpinion":true,"globalOrGist":true},"issues":[],"verdict":"pass|revise"}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nQUESTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const levelAudit = await callReview(
    `You are a Cambridge B1 Preliminary lexical-level editor. Review ONLY the language level of this Reading Part 3 passage.
B1 texts may contain an occasional unfamiliar word if the meaning is transparent, but the overall text must not read like B2/C1 academic or specialist prose.
Flag terms or constructions that a normal B1 candidate should not be expected to process and that are not clearly explained by context. Be especially alert to specialist labels, abstract academic nouns, dense nominalisations, uncommon idioms and unnecessarily formal phrasing.
Do not flag ordinary B1 words merely because a simpler synonym exists.
Return ONLY JSON:
{"levelIssues":[{"text":"polyglot","reason":"specialist label not explained in simple B1 language"}],"overall":"b1|too_high","issues":[]}.`,
    `PASSAGE:\n${generated?.passage || ''}`,
  );

  return {
    ...primary,
    levelIssues: [
      ...asArray(primary?.levelIssues),
      ...asArray(levelAudit?.levelIssues),
    ],
    issues: [...asArray(primary?.issues), ...asArray(levelAudit?.issues)],
    levelOverall: levelAudit?.overall || null,
  };
}

function reconstructPart4(generated) {
  const key = new Map(
    asArray(generated?.modelAnswers)
      .map((x) => [Number(x?.number), String(x?.answer || '').trim().toUpperCase()]),
  );
  const pool = new Map(
    asArray(generated?.sentencePool).map((entry) => {
      if (typeof entry === 'string') {
        const m = entry.match(/^\s*([A-H])\)\s*(.*)$/s);
        return m ? [m[1].toUpperCase(), m[2].trim()] : [null, entry];
      }
      return [String(entry?.letter || '').trim().toUpperCase(), String(entry?.text || entry?.sentence || '').trim()];
    }).filter(([letter]) => letter),
  );
  return String(generated?.passage || '').replace(/\((1[6-9]|20)\)\s*___/g, (full, raw) => {
    const letter = key.get(Number(raw));
    return pool.get(letter) || full;
  });
}

async function reviewPart4(generated) {
  const primary = await callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 4 WITHOUT trusting the supplied key.
There are five gaps (16-20) and eight candidate sentences A-H, so exactly three are unused.
Solve the complete assignment. Then test EVERY candidate sentence against EVERY gap. "multifit" means a sentence genuinely produces coherent, grammatical text in more than one gap, considering both the sentence before and after and the wider narrative/argument.
Flag weak cohesion when the intended sentence has no strong backward/forward link. Do not flag merely topical similarity.
After solving, RECONSTRUCT the whole text with all five chosen sentences and read it continuously. Check paragraph-level topic, chronology and reference, not just grammar at the gap. A sentence must be rejected if it anticipates a topic before the text introduces it, returns to an earlier stage without a clear signal, changes the subject unexpectedly, or creates a semantic contradiction even if the neighbouring sentences are grammatical.
Return ONLY JSON:
{"assignments":[{"gap":16,"letter":"G"}],"multifit":[{"letter":"B","gaps":[17,19],"reason":"..."}],"weakCohesion":[{"gap":18,"reason":"..."}],"unusedLetters":["A","C","H"],"issues":[],"verdict":"pass|revise"}.`,
    `GAPPED PASSAGE:\n${generated?.passage || ''}\n\nCANDIDATE SENTENCES:\n${poolView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const sequenceAudit = await callReview(
    `You are a second Cambridge B1 Preliminary Part 4 editor. The five keyed sentences have already been inserted below.
Read the completed text as a continuous article/story. Ignore the original answer letters.
Flag sequenceIssues if chronology, reference, topic development or cause/effect is awkward or impossible; if an event is mentioned before it is introduced; if a sentence repeats the following sentence instead of linking naturally; or if the text changes subject without a clear bridge.
A completed text should read as if it was originally written with no gaps.
Return ONLY JSON:
{"sequenceIssues":[{"location":"around gap 18","reason":"the people get to know each other before they are put into groups"}],"overall":"coherent|revise","issues":[]}.`,
    `COMPLETED TEXT:\n${reconstructPart4(generated)}`,
  );

  return {
    ...primary,
    sequenceIssues: asArray(sequenceAudit?.sequenceIssues),
    issues: [...asArray(primary?.issues), ...asArray(sequenceAudit?.issues)],
    sequenceOverall: sequenceAudit?.overall || null,
  };
}

async function reviewPart5(generated) {
  const primary = await callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 5 WITHOUT trusting the supplied key.
Solve all six multiple-choice cloze gaps. This task tests mainly vocabulary, with some grammar/complementation allowed.
A tempting distractor is correct item writing. Report alternativeFits ONLY when a second option is an equally acceptable official key: fully grammatical, idiomatic British English, and the same meaning as the best option. A near-synonym that breaks the collocation or changes the meaning is not an alternative key.
Flag distractors in weakDistractors only when they are obviously unusable. Flag a gap that is really a Part 6-style pure grammar gap if that pattern dominates the task.
CRITICAL NATURALNESS CHECK: mentally insert the selected answer into the complete sentence and judge the resulting British English collocation/verb pattern. If the keyed/best completion is unidiomatic, semantically wrong, or not a normal B1 collocation, report it in unnaturalItems. Do not pass an item merely because all four options are bad.
Return ONLY JSON:
{"answers":[{"number":21,"letter":"C"}],"ambiguousItems":[],"alternativeFits":[{"number":22,"letters":["A","B"],"reason":"both would be printed as alternative keys"}],"weakDistractors":[],"grammarOnlyItems":[{"number":24,"reason":"pure article choice"}],"unnaturalItems":[{"number":22,"completion":"...","reason":"unidiomatic collocation"}],"literalSolveItems":[],"issues":[],"verdict":"pass|revise"}.
Do not invent faults to fill arrays.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const crossFit = await callReview(
    `You are a second independent Cambridge B1 Preliminary Part 5 examiner. Ignore the supplied answer key.
For each gap 21-26, test A, B, C and D one by one in the exact sentence.
Return a letter only when that completion would be printed as an official alternative answer: fully grammatical, idiomatic British English, and faithful to the writer's meaning.
Do NOT return a letter just because a competent candidate might choose it. Near-synonyms such as damaged/broken, think/believe, arrive/stop and rent/hire are distractors when the collocation or the context rules them out.
Return ONLY JSON:
{"fits":[{"number":21,"letters":["C"]},{"number":22,"letters":["A","B"]}],"issues":[]}.
One letter per gap is the normal result.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}`,
  );

  const disputes = collectPart5Disputes(primary?.alternativeFits, crossFit?.fits);
  let alternativeFits = [];
  let adjudicationIssues = [];
  if (disputes.length) {
    const verdict = await callReview(
      `You are the chief Cambridge B1 Preliminary item writer. Another examiner listed more than one option for some Part 5 gaps. Decide the official key.
Keep a second letter ONLY when Cambridge would have to accept it as an alternative answer: the completed sentence is fully grammatical, idiomatic British English, and it preserves the writer's meaning as well as the best option.
Reject a second letter when it is only tempting. A near-synonym, a slightly wrong collocation, or a small change of meaning is a distractor, not a second key.
Example: "The heavy rain ___ the match." A cancelled, B damaged, C broke, D stopped. Only A is the key. Return {"number":21,"letters":["A"]}.
Return ONLY JSON:
{"confirmed":[{"number":21,"letters":["C"],"rejected":[{"letter":"A","reason":"the collocation is wrong"}]}],"issues":[]}.
letters must contain only options you would print on the key.`,
      `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}\n\nDISPUTED GAPS:\n${JSON.stringify(disputes)}`,
    );
    alternativeFits = confirmedPart5DoubleKeys(disputes, verdict?.confirmed);
    adjudicationIssues = asArray(verdict?.issues);
  }

  return {
    ...primary,
    alternativeFits,
    issues: [...asArray(primary?.issues), ...asArray(crossFit?.issues), ...adjudicationIssues],
  };
}

async function reviewPart6(generated) {
  return callReview(
    `You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 6 WITHOUT trusting the supplied key.
Each of gaps 27-32 must take exactly ONE word. Solve every gap independently.
For each gap actively search for alternative ordinary B1 words that would also make the completed text grammatical, natural and equivalent in meaning. Record all fully defensible alternatives.
The task should primarily test grammatical structures, with some phrasal verbs/common fixed phrases. Do not treat a merely possible but meaning-changing word as an acceptable alternative.
After choosing the words, reconstruct the COMPLETE text with all six answers inserted and read it sentence by sentence. Report any completed sentence that is ungrammatical, semantically contradictory or unnatural British English in completedTextIssues.
Return ONLY JSON:
{"answers":[{"number":27,"word":"each","alternatives":[]}],"ambiguousItems":[{"number":28,"words":["which","that"],"reason":"both are standard defining relatives here"}],"vocabularyStyleItems":[{"number":30,"reason":"requires guessing a content noun"}],"completedTextIssues":[{"number":30,"completedSnippet":"...","reason":"ungrammatical after insertion"}],"issues":[],"verdict":"pass|revise"}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}


const B1_PART5_RISKY_PAIRS = [
  ['explore', 'discover'],
  ['think', 'believe'],
  ['rent', 'hire'],
  ['damaged', 'broken'],
  ['help', 'allow'],
  ['start', 'begin'],
  ['finish', 'end'],
  ['choose', 'select'],
  ['buy', 'purchase'],
  ['like', 'love'],
];

function part5RiskyOptionPairs(generated) {
  const findings = [];
  for (const q of asArray(generated?.questions)) {
    const words = asArray(q?.options)
      .map((x) => String(x || '').replace(/^\s*[A-D]\)\s*/i, '').trim().toLowerCase())
      .filter(Boolean);
    for (const [a, b] of B1_PART5_RISKY_PAIRS) {
      if (words.includes(a) && words.includes(b)) {
        findings.push({ number: q?.number, pair: [a, b] });
      }
    }
  }
  return findings;
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

  const errors = britishEnglishErrors(generated);
  const warnings = [];

  if ([1, 2, 5].includes(part)) {
    pushMismatchErrors(errors, rubric?.answers, generated?.modelAnswers);
    findings(rubric, errors, warnings);
  }

  if (part === 3) {
    pushMismatchErrors(errors, rubric?.answers, generated?.modelAnswers);
    findings(rubric, errors, warnings, { literalAsError: true });
  }

  if (part === 2) {
    for (const item of asArray(rubric?.unsupportedRequirements)) {
      errors.push(`B1 Part 2 unsupported requirement Q${item?.number ?? '?'} → ${item?.letter || '?'}: ${item?.requirement || ''}. ${item?.reason || ''}`);
    }
  }

  if (part === 3) {
    for (const term of findB1AboveLevelTerms(JSON.stringify(generated || {}))) {
      errors.push(`B1 Part 3 level issue: "${term}" — above normal B1 reading level`);
    }
    if (String(rubric?.levelOverall || '').toLowerCase() === 'too_high') {
      errors.push('B1 Part 3 lexical-level review judged the passage above ordinary B1. Rewrite it in everyday language.');
    }
    for (const item of asArray(rubric?.levelIssues)) {
      errors.push(`B1 Part 3 level issue: "${item?.text || '?'}" — ${item?.reason || 'above normal B1 reading level'}`);
    }
    const c = rubric?.coverage || {};
    if (c.inference === false) warnings.push('B1 Part 3 lacks a clear inference item.');
    if (c.attitudeOrOpinion === false) warnings.push('B1 Part 3 lacks writer attitude/opinion coverage.');
    if (c.globalOrGist === false) warnings.push('B1 Part 3 lacks gist/global meaning coverage.');
  }

  if (part === 4) {
    for (const issue of asArray(rubric?.issues)) {
      if (issue) errors.push(`B1 Part 4 whole-text issue: ${typeof issue === 'string' ? issue : issue?.reason || JSON.stringify(issue)}`);
    }
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
    for (const issue of asArray(rubric?.sequenceIssues)) {
      errors.push(`B1 Part 4 completed-text sequence issue: ${issue?.reason || issue?.location || 'whole-text flow is not coherent'}`);
    }
    if (String(rubric?.sequenceOverall || '').toLowerCase() === 'revise' && !asArray(rubric?.sequenceIssues).length) {
      errors.push('B1 Part 4 whole-text review asked for a revision. Rebuild the cohesion so the completed text reads as one continuous piece.');
    }
    const unused = asArray(rubric?.unusedLetters).map((x) => String(x).toUpperCase()).filter(Boolean);
    if (unused.length && unused.length !== 3) {
      errors.push(`B1 Part 4 independent solve leaves ${unused.length} unused sentences; official task requires exactly 3.`);
    }
  }

  if (part === 5) {
    for (const risky of part5RiskyOptionPairs(generated)) {
      errors.push(`B1 Part 5 risky near-synonym option set Q${risky.number ?? '?'}: ${risky.pair.join(' / ')}. Rewrite the item so only one ordinary B1 word can fit.`);
    }
    for (const item of asArray(rubric?.alternativeFits)) {
      errors.push(`B1 Part 5 ambiguity Q${item?.number ?? '?'}: alternatives ${asArray(item?.letters).join(' / ')} are defensible. ${item?.reason || ''}`);
    }
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
    for (const issue of asArray(rubric?.completedTextIssues)) {
      errors.push(`B1 Part 6 completed-text issue Q${issue?.number ?? '?'}: ${issue?.reason || issue?.completedSnippet || 'unnatural or ungrammatical completion'}`);
    }
    for (const issue of asArray(rubric?.issues)) {
      if (issue) errors.push(`B1 Part 6 quality issue: ${typeof issue === 'string' ? issue : issue?.reason || JSON.stringify(issue)}`);
    }
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
    const answerWords = expected.map((x) => String(x?.answer || '').trim().toLowerCase()).filter(Boolean);
    const counts = new Map();
    for (const word of answerWords) counts.set(word, (counts.get(word) || 0) + 1);
    const repeated = [...counts.entries()].filter(([, count]) => count > 2);
    if (repeated.length) {
      errors.push(`B1 Part 6 repeats the same answer too often: ${repeated.map(([word,count]) => `"${word}" ×${count}`).join(', ')}. Vary the grammar targets across the six gaps.`);
    }
    if (new Set(answerWords).size < 4) {
      errors.push(`B1 Part 6 has only ${new Set(answerWords).size} distinct answers across six gaps; use a broader range of grammar/fixed-language targets.`);
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
