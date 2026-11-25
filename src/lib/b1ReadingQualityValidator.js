import { cambridgeChatCompletion } from '@/lib/draloAiEngine';
import { B1_PART5_RISKY_PAIRS, b1SemanticCriteria } from '@/lib/b1ReadingRules';
import { adjudicatePart5Disputes, collectPart5Disputes } from '@/lib/b1Part5DoubleKey';
import { B1_PART6_TARGET_BANK, findB1AboveLevelTerms } from '@/lib/b1ReadingConstruction';
import {
  b1ReviewApproval,
  part1EvidenceProblems,
  part2EvidenceProblems,
  part3EvidenceProblems,
  part4EvidenceProblems,
  part5EvidenceProblems,
  part6AlternativeReview,
  part6EvidenceProblems,
} from '@/lib/b1ReadingRules/reviewEvidence';

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

let reviewTransportOverride = null;

async function callReview(system, user) {
  const completion = reviewTransportOverride || cambridgeChatCompletion;
  const { text } = await completion({
    model: getValidatorModel(),
    system,
    messages: [{ role: 'user', content: user }],
    temperature: 0,
    max_tokens: 4096,
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
    `${b1SemanticCriteria(1)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 1 WITHOUT trusting the supplied answer key.
Solve all five items independently. Each item is a short real-world text with three options and should test the main message.
Report ambiguity if two options express the text equally well. For every item, record itemEvidence: paraphrased and grounded booleans, and one judgement per option. plausible is false when the distractor is about something the text never mentions. A correct option that copies the text has paraphrased false.
Return ONLY JSON:
{"answers":[{"number":1,"letter":"A"}],"itemEvidence":[{"number":1,"paraphrased":true,"grounded":true,"options":[{"letter":"A","plausible":true,"reason":"paraphrases the request"},{"letter":"B","plausible":true,"reason":"misreads the day"},{"letter":"C","plausible":false,"reason":"the text never mentions payment"}]}],"ambiguousItems":[],"weakDistractors":[],"literalSolveItems":[],"issues":[],"verdict":"pass|revise"}.
A verdict of pass without itemEvidence is incomplete. Do not invent faults to fill arrays.`,
    `ITEMS:\n${questionsView(generated)}\n\nSUPPLIED KEY (for comparison only after solving): ${answerKey(generated)}`,
  );
}

async function reviewPart2(generated) {
  return callReview(
    `${b1SemanticCriteria(2)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 2 WITHOUT trusting the supplied key.
There are five people and eight texts A-H on one topic. Match each person independently using ALL of their requirements.
Flag ambiguity when two texts satisfy a person's requirements equally well. Flag a weak profile/text set if the correct match is obvious from a copied word rather than detailed comprehension.
For each person, record requirementEvidence for every material requirement, including age, day, time and restrictions. supported is true only when the keyed text positively makes that requirement possible. A shared activity word is not support.
Return ONLY JSON:
{"answers":[{"number":6,"letter":"F"}],"requirementEvidence":[{"number":6,"requirement":"Saturday morning","supported":true,"reason":"the text runs on Saturday at 11 am"},{"number":7,"requirement":"weekend","supported":false,"reason":"the course names two days but never a weekend"}],"ambiguousItems":[],"unsupportedRequirements":[],"literalSolveItems":[],"weakDistractors":[],"issues":[],"verdict":"pass|revise"}.
A verdict of pass without requirementEvidence is incomplete. Do not report partial matches as ambiguity: an alternative must satisfy the important requirements equally well.`,
    `PEOPLE:\n${questionsView(generated)}\n\nTEXTS:\n${sectionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );
}

async function reviewPart3(generated) {
  const primary = await callReview(
    `${b1SemanticCriteria(3)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 3 WITHOUT trusting the supplied key.
Solve the five four-option questions from the passage. Check detailed comprehension, gist/global meaning, inference and writer attitude/opinion.
Flag an item if two answers are defensible. For every question record itemEvidence. statedDirectly is true when the passage already states the fact the question asks for, even in different words that do not add a conclusion. If the passage says the writer felt relaxed, the answer Relaxed is stated directly. It is not an inference. Inference, attitude, opinion and gist items need a conclusion the passage does not state, so statedDirectly is false only in that case. Set certainty to "certain" or "uncertain". If you are not sure whether the passage states the answer, set certainty to "uncertain". Do not set statedDirectly false in order to keep an inference label. Each option needs grounded true only when it uses an idea from the passage.
Also flag levelIssues for words/phrases or sentence structures that are clearly above normal B1 Preliminary reading level and are not made transparent by context. Do not penalise an occasional challenging but inferable word.
Return ONLY JSON:
{"answers":[{"number":11,"letter":"C"}],"itemEvidence":[{"number":12,"questionType":"inference","statedDirectly":false,"certainty":"certain","reason":"the feeling is shown by what the writer does, not named","options":[{"letter":"C","grounded":true,"reason":"follows from the described pause"},{"letter":"A","grounded":true,"reason":"uses the city contrast but reverses it"}]}],"ambiguousItems":[],"weakDistractors":[],"literalSolveItems":[],"levelIssues":[],"coverage":{"detail":true,"inference":true,"attitudeOrOpinion":true,"globalOrGist":true},"issues":[],"verdict":"pass|revise"}.
A verdict of pass without itemEvidence, statedDirectly and certainty is incomplete.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nQUESTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const levelAudit = await callReview(
    `${b1SemanticCriteria(3)}
You are a Cambridge B1 Preliminary lexical-level editor. Review ONLY the language level of this Reading Part 3 passage.
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
    `${b1SemanticCriteria(4)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 4 WITHOUT trusting the supplied key.
There are five gaps (16-20) and eight candidate sentences A-H, so exactly three are unused.
Solve the complete assignment. Then test EVERY candidate sentence against EVERY gap. "multifit" means a sentence genuinely produces coherent, grammatical text in more than one gap, considering both the sentence before and after and the wider narrative/argument.
For each gap record gapEvidence. addsInformation is false when the keyed sentence only repeats a fact already stated in the neighbouring sentence.
Flag weak cohesion when the intended sentence has no strong backward/forward link. Do not flag merely topical similarity.
Flag mechanicalAnchors when the answer is given away by a repeated two-word phrase such as "breakfast list" or "shop window". Natural cohesion uses pronouns, time, contrast, cause and effect, or logical progression.
Flag an extra sentence that is about a different situation and can be discarded without reading the gap. If you cannot confidently test all eight sentences in all five gaps, set verdict to "revise".
After solving, RECONSTRUCT the whole text with all five chosen sentences and read it continuously. Check paragraph-level topic, chronology and reference, not just grammar at the gap. A sentence must be rejected if it anticipates a topic before the text introduces it, returns to an earlier stage without a clear signal, changes the subject unexpectedly, or creates a semantic contradiction even if the neighbouring sentences are grammatical.
Return ONLY JSON:
{"assignments":[{"gap":16,"letter":"G"}],"gapEvidence":[{"gap":16,"addsInformation":true,"reason":"it gives the reason the group left, which the neighbours do not state"},{"gap":17,"addsInformation":false,"reason":"it repeats the previous sentence"}],"multifit":[{"letter":"B","gaps":[17,19],"reason":"..."}],"weakCohesion":[],"mechanicalAnchors":[],"unusedLetters":["A","C","H"],"issues":[],"verdict":"pass|revise"}.
A verdict of pass without gapEvidence for gaps 16-20 is incomplete.`,
    `GAPPED PASSAGE:\n${generated?.passage || ''}\n\nCANDIDATE SENTENCES:\n${poolView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const sequenceAudit = await callReview(
    `${b1SemanticCriteria(4)}
You are a second Cambridge B1 Preliminary Part 4 editor. The five keyed sentences have already been inserted below.
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
    `${b1SemanticCriteria(5)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 5 WITHOUT trusting the supplied key.
Solve all six multiple-choice cloze gaps. This task tests mainly vocabulary, with some grammar/complementation allowed.
Judge every option in the complete sentence. Record optionJudgements for all four letters. The decision is the structured fields, not the wording of the reason.
fits true means the option is grammatical, idiomatic in this sentence, and faithful to the writer's meaning. defect is then "none".
fits false means you reject it. defect must be "grammar", "meaning", "context", "preference" or "uncertain".
Use grammar, meaning or context only for a genuine defect in this sentence. A less common but natural expression has fits true and defect none. Do not reject it because the keyed word is more frequent. For example, "increase your confidence" is natural beside "boost your confidence", and "keep to what suits you" is natural beside "stick to what suits you". Judge the sentence in front of you. These examples are not a banned list.
Use preference when you merely prefer the keyed word. Use uncertain when you are not sure. Do not hide a preference or an uncertainty inside a grammar, meaning or context label.
Keep a short reason for audit. The reason does not change fits or defect.
Flag a gap that is really a Part 6-style pure grammar gap if that pattern dominates the task.
CRITICAL NATURALNESS CHECK: mentally insert the selected answer into the complete sentence and judge the resulting British English. If the keyed completion is ungrammatical, changes the writer's meaning, or is not English a B1 candidate would say, report it in unnaturalItems. Do not pass an item merely because all four options are bad. Do not report a natural less common option as unnatural.
Return ONLY JSON:
{"answers":[{"number":21,"letter":"C"}],"optionJudgements":[{"number":21,"options":[{"letter":"A","fits":false,"defect":"context","reason":"the verb does not fit this noun"},{"letter":"B","fits":true,"defect":"none","reason":"natural in this sentence and the same meaning"},{"letter":"C","fits":true,"defect":"none","reason":"also natural; less common is not a defect"},{"letter":"D","fits":false,"defect":"meaning","reason":"this option changes what the writer did"}]}],"ambiguousItems":[],"alternativeFits":[{"number":21,"letters":["B","C"],"reason":"both are natural"}],"weakDistractors":[],"grammarOnlyItems":[],"unnaturalItems":[],"literalSolveItems":[],"issues":[],"verdict":"pass|revise"}.
A verdict of pass without fits, defect and a reason for every option is incomplete.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}\n\nSUPPLIED KEY: ${answerKey(generated)}`,
  );

  const crossFit = await callReview(
    `${b1SemanticCriteria(5)}
You are a second independent Cambridge B1 Preliminary Part 5 examiner. Ignore the supplied answer key.
For each gap 21-26, test A, B, C and D one by one in the exact sentence.
Return every letter that is grammatical, idiomatic in this sentence, and faithful to the writer's meaning, including a less common synonym that still meets that test.
Leave a letter out only when the sentence makes it ungrammatical, changes the meaning, or is not English in this context. A preference for a more common word is not a reason to leave a letter out. If you are not sure, include the letter and say so in issues. Example: "The heavy rain ___ the match." Only the option that means the match was cancelled fits. damaged, broke and stopped do not, because they change what happened. "increase your confidence" stays in the list beside "boost your confidence" when both are natural.
Return ONLY JSON:
{"fits":[{"number":21,"letters":["C"]},{"number":22,"letters":["A","B"]}],"issues":[]}.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}`,
  );

  const disputes = collectPart5Disputes(primary?.alternativeFits, crossFit?.fits);
  let alternativeFits = [];
  let adjudication = { doubleKeys: [], rejections: [] };
  let adjudicationIssues = [];
  if (disputes.length) {
    const verdict = await callReview(
      `${b1SemanticCriteria(5)}
You are the chief Cambridge B1 Preliminary item writer. Another examiner listed more than one option for some Part 5 gaps. Decide the official key.
Keep a second letter when it is grammatical, idiomatic in this sentence, and preserves the writer's meaning, even if the keyed word is more common.
Reject a disputed letter only by listing it in rejected. Set defect to "grammar", "meaning" or "context", and keep a reason for audit. The reason does not replace defect. defect "preference" or "uncertain" leaves the letter open, as does an omitted letter or a missing defect.
Return ONLY JSON:
{"confirmed":[{"number":21,"letters":["C"],"rejected":[{"letter":"A","defect":"context","reason":"the completed sentence is not English in this context"}]}],"issues":[]}.
letters must contain every option you would print on the key.`,
      `PASSAGE:\n${generated?.passage || ''}\n\nOPTIONS:\n${questionsView(generated)}\n\nDISPUTED GAPS:\n${JSON.stringify(disputes)}`,
    );
    adjudication = adjudicatePart5Disputes(disputes, verdict?.confirmed);
    alternativeFits = adjudication.doubleKeys;
    adjudicationIssues = asArray(verdict?.issues);
  }

  return {
    ...primary,
    alternativeFits,
    crossFit,
    disputes,
    adjudication,
    issues: [...asArray(primary?.issues), ...asArray(crossFit?.issues), ...adjudicationIssues],
  };
}

async function reviewPart6(generated) {
  return callReview(
    `${b1SemanticCriteria(6)}
You are an experienced Cambridge B1 Preliminary Reading item writer. Review Part 6 WITHOUT trusting the supplied key.
Each of gaps 27-32 must take exactly ONE word. Solve every gap independently.
For each gap, test every other word on that gap's approved target list once, and at least one plausible word outside the list once. Do not test the keyed word, and do not put the keyed word in alternatives. Set source to "target-list" or "outside-list". For each tested word, decide grammatical, sameMeaning, fitsContext and b1Appropriate separately, then set accept. accept is true only when all four are true. accept false with all four true is a contradiction, not a rejection. A less common natural word has accept true. Reject a word only for a genuine grammar, meaning, context or B1-level defect, and name that defect in the reason. If you are not sure, set certainty to "uncertain" and do not set accept true. An empty alternatives array does not show that the gap is unique. A missing judgement is incomplete, not a second answer and not a pass.
The task should primarily test grammatical structures, with some phrasal verbs/common fixed phrases. Do not treat a merely possible but meaning-changing word as an acceptable alternative.
After choosing the words, reconstruct the COMPLETE text with all six answers inserted and read it sentence by sentence. Report any completed sentence that is ungrammatical, semantically contradictory or unnatural British English in completedTextIssues.
Return ONLY JSON:
{"answers":[{"number":27,"word":"many","alternatives":[],"tested":[{"word":"several","source":"target-list","grammatical":true,"sameMeaning":true,"fitsContext":true,"b1Appropriate":true,"accept":true,"certainty":"certain","reason":"several species is natural and the same meaning"},{"word":"numerous","source":"outside-list","grammatical":true,"sameMeaning":true,"fitsContext":true,"b1Appropriate":false,"accept":false,"certainty":"certain","reason":"the meaning fits but the word is more formal than B1"}]}],"ambiguousItems":[],"vocabularyStyleItems":[],"completedTextIssues":[],"issues":[],"verdict":"pass|revise"}.
A verdict of pass without those tested records is incomplete.`,
    `PASSAGE:\n${generated?.passage || ''}\n\nSUPPLIED KEY: ${answerKey(generated)}\n\nAPPROVED TARGET LISTS TO JUDGE, PLUS AT LEAST ONE WORD OUTSIDE EACH LIST:\n${part6TargetBrief(generated)}`,
  );
}

function part6TargetBrief(generated) {
  return asArray(generated?.questions).map((question) => {
    const key = String(question?.grammarTarget || question?.targetType || '').trim().toLowerCase();
    const entry = B1_PART6_TARGET_BANK.find((item) => (
      String(item?.type || '').toLowerCase() === key || String(item?.id || '').toLowerCase() === key
    ));
    const words = entry ? entry.words.join(', ') : 'target list unavailable';
    return `Q${question?.number ?? '?'}: ${words}`;
  }).join('\n');
}


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
async function runB1ReadingQualityValidation(partNumber, generated) {
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

  if (part === 1) {
    pushMismatchErrors(errors, rubric?.answers, generated?.modelAnswers);
    findings(rubric, errors, warnings, { literalAsError: true });
    errors.push(...part1EvidenceProblems(generated, rubric));
  }

  if ([2, 5].includes(part)) {
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
    errors.push(...part2EvidenceProblems(generated, rubric));
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
    errors.push(...part3EvidenceProblems(generated, rubric));
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
    for (const anchor of asArray(rubric?.mechanicalAnchors)) {
      errors.push(`B1 Part 4 mechanical repeated phrase at gap ${anchor?.gap ?? '?'}: ${anchor?.phrase || anchor?.reason || 'two-word repetition'}.`);
    }
    if (asArray(rubric?.assignments).length < 5) {
      errors.push('B1 Part 4 semantic review did not test every gap. Fail closed.');
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
    errors.push(...part4EvidenceProblems(rubric));
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
    errors.push(...part5EvidenceProblems(generated, rubric));
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
    if (solved.length < 6) {
      errors.push('B1 Part 6 semantic review did not test every gap. Fail closed.');
    }
    const solverMap = new Map(solved.map((a) => [Number(a?.number), a]));
    for (const key of expected) {
      const n = Number(key?.number);
      const expectedWord = String(key?.answer || '').trim().toLowerCase();
      const row = solverMap.get(n);
      if (!row) continue;
      const best = String(row?.word || '').trim().toLowerCase();
      const alternatives = [...new Set(
        asArray(row?.alternatives)
          .map((word) => String(word).trim().toLowerCase())
          .filter((word) => word && word !== expectedWord && word !== best),
      )];
      if (best && best !== expectedWord && !alternatives.includes(expectedWord)) {
        errors.push(`B1 Part 6 blind-solve disagreed on Q${n}: key "${expectedWord}", solver "${best}".`);
      }
    }
    rubric.evaluatedCandidates = asArray(generated?.questions).map((question) => {
      const solved = solverMap.get(Number(question?.number));
      const review = part6AlternativeReview(
        question,
        solved,
        expected.find((row) => Number(row?.number) === Number(question?.number))?.answer,
        B1_PART6_TARGET_BANK,
      );
      return {
        number: question?.number,
        evaluated: review.evaluated,
        missing: review.missing,
        accepted: review.accepted,
        selfIgnored: review.selfIgnored,
      };
    });
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
    errors.push(...part6EvidenceProblems(generated, rubric, B1_PART6_TARGET_BANK));
  }

  if (String(rubric?.verdict || '').toLowerCase() === 'revise' && errors.length === 0) {
    warnings.push('B1 semantic reviewer verdict is revise; inspect the reported issues.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    rubric,
    approval: b1ReviewApproval(errors),
  };
}

/**
 * options.transport replaces the model call for a local measurement.
 * Omitted, the production Cambridge chat completion is used.
 */
export async function validateB1ReadingQuality(partNumber, generated, options = {}) {
  const previousTransport = reviewTransportOverride;
  reviewTransportOverride = typeof options.transport === 'function' ? options.transport : null;
  try {
    return await runB1ReadingQualityValidation(partNumber, generated);
  } finally {
    reviewTransportOverride = previousTransport;
  }
}
