/**
 * Enforces the shared B1 review contract. It does not define a second rulebook.
 * Recorded judgements are evidence. An empty array is not a pass.
 */
import { part5Letters } from '@/lib/b1Part5DoubleKey';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function optionLetter(option) {
  const match = String(option || '').trim().match(/^([A-H])\)/i);
  return match ? match[1].toUpperCase() : '';
}

function findNumber(rows, number) {
  return asArray(rows).find((row) => Number(row?.number ?? row?.gap) === Number(number));
}

export function part1EvidenceProblems(generated, rubric) {
  const errors = [];
  for (const question of asArray(generated?.questions)) {
    const number = question?.number;
    const row = findNumber(rubric?.itemEvidence, number);
    if (!row || typeof row.paraphrased !== 'boolean' || typeof row.grounded !== 'boolean') {
      errors.push(`B1 review evidence is missing for Q${number}.`);
      continue;
    }
    if (row.paraphrased === false) {
      errors.push(`B1 Q${number} is solvable by copying wording: the correct option is not a paraphrase.`);
    }
    if (row.grounded === false) {
      errors.push(`B1 Q${number} correct option is not supported by the text.`);
    }
    for (const option of asArray(question?.options)) {
      const letter = optionLetter(option);
      const judged = asArray(row.options).find((item) => String(item?.letter || '').toUpperCase() === letter);
      if (!letter || !judged || typeof judged.plausible !== 'boolean' || !String(judged.reason || '').trim()) {
        errors.push(`B1 review evidence is missing for Q${number} option ${letter || '?'}.`);
        continue;
      }
      if (judged.plausible === false) {
        errors.push(`B1 weak distractor Q${number} ${letter}: ${judged.reason}`);
      }
    }
  }
  if (!asArray(generated?.questions).length) errors.push('B1 review evidence is missing for Part 1.');
  return errors;
}

export function part2EvidenceProblems(generated, rubric) {
  const errors = [];
  for (const question of asArray(generated?.questions)) {
    const number = question?.number;
    const rows = asArray(rubric?.requirementEvidence).filter((row) => Number(row?.number) === Number(number));
    if (!rows.length) {
      errors.push(`B1 review evidence is missing for Q${number}.`);
      continue;
    }
    for (const row of rows) {
      if (typeof row.supported !== 'boolean' || !String(row.requirement || '').trim() || !String(row.reason || '').trim()) {
        errors.push(`B1 review evidence is missing for Q${number}.`);
        continue;
      }
      if (row.supported === false) {
        errors.push(`B1 Part 2 unsupported requirement Q${number}: ${row.requirement}. ${row.reason}`);
      }
    }
  }
  return errors;
}

export function part3EvidenceProblems(generated, rubric) {
  const errors = [];
  for (const question of asArray(generated?.questions)) {
    const number = question?.number;
    const row = findNumber(rubric?.itemEvidence, number);
    const type = String(question?.questionType || row?.questionType || '').toLowerCase();
    const certainty = String(row?.certainty || '').trim().toLowerCase();
    if (!row || typeof row.statedDirectly !== 'boolean' || !String(row.reason || '').trim() || (certainty !== 'certain' && certainty !== 'uncertain')) {
      errors.push(`B1 review evidence is missing for Q${number}.`);
      continue;
    }
    if (certainty === 'uncertain') {
      errors.push(`B1 Q${number} review is inconclusive: the linguistic judgement is uncertain.`);
      continue;
    }
    if (/inference|attitude|opinion|gist/.test(type) && row.statedDirectly === true) {
      errors.push(`B1 Q${number} repeats an explicit statement instead of asking the reader to draw a conclusion.`);
    }
    for (const option of asArray(question?.options)) {
      const letter = optionLetter(option);
      const judged = asArray(row.options).find((item) => String(item?.letter || '').toUpperCase() === letter);
      if (!letter || !judged || typeof judged.grounded !== 'boolean' || !String(judged.reason || '').trim()) {
        errors.push(`B1 review evidence is missing for Q${number} option ${letter || '?'}.`);
        continue;
      }
      if (judged.grounded === false) {
        errors.push(`B1 weak distractor Q${number} ${letter}: ${judged.reason}`);
      }
    }
  }
  return errors;
}

export function part4EvidenceProblems(rubric) {
  const errors = [];
  const rows = asArray(rubric?.gapEvidence);
  for (let gap = 16; gap <= 20; gap += 1) {
    const row = rows.find((item) => Number(item?.gap) === gap);
    if (!row || typeof row.addsInformation !== 'boolean' || !String(row.reason || '').trim()) {
      errors.push(`B1 review evidence is missing for gap ${gap}.`);
      continue;
    }
    if (row.addsInformation === false) {
      errors.push(`B1 Part 4 weak cohesion at gap ${gap}: the sentence restates the neighbouring text. ${row.reason}`);
    }
  }
  return errors;
}

/**
 * fits and defect are the decision. The reason is kept for audit and is not searched for keywords.
 * fits true + defect none: a possible answer.
 * fits false + grammar, meaning or context: an explicit rejection.
 * fits false + preference: still a possible answer. Preference does not clear it.
 * A missing, uncertain or contradictory field is inconclusive.
 */
export function part5OptionDecision(row) {
  const reason = String(row?.reason || '').trim();
  if (!row || typeof row.fits !== 'boolean') return { status: 'incomplete', reason };
  const defect = String(row.defect || '').trim().toLowerCase();
  if (row.fits === true) {
    if (defect === 'none' && reason) return { status: 'fits', reason };
    if (defect && defect !== 'none') return { status: 'contradictory', reason };
    return { status: 'incomplete', reason };
  }
  if (!reason || !['grammar', 'meaning', 'context', 'preference', 'uncertain'].includes(defect)) {
    return { status: 'incomplete', reason };
  }
  if (defect === 'uncertain') return { status: 'uncertain', reason };
  if (defect === 'preference') return { status: 'preference', reason };
  return { status: 'rejected', defect, reason };
}

function sameLetterSet(left, right) {
  const a = [...left].sort();
  const b = [...right].sort();
  return a.length === b.length && a.every((letter, index) => letter === b[index]);
}

export function part5EvidenceProblems(generated, rubric) {
  const errors = [];
  const questions = asArray(generated?.questions);
  const decided = new Map();
  for (const question of questions) {
    const number = Number(question?.number);
    const row = findNumber(rubric?.optionJudgements, number);
    const letters = asArray(question?.options).map(optionLetter).filter(Boolean);
    if (!row || letters.length !== 4) {
      errors.push(`B1 review evidence is missing for Q${number}.`);
      continue;
    }
    const fitting = [];
    const blocked = [];
    for (const letter of letters) {
      const judged = asArray(row.options).find((item) => String(item?.letter || '').toUpperCase() === letter);
      const decision = part5OptionDecision(judged);
      if (decision.status === 'fits' || decision.status === 'preference') fitting.push(letter);
      else if (decision.status !== 'rejected') blocked.push(letter);
    }
    if (blocked.length) {
      errors.push(`B1 Part 5 Q${number} review is inconclusive: option ${blocked.join(' / ')} has a missing, uncertain or contradictory judgement.`);
      continue;
    }
    decided.set(number, fitting);
    if (fitting.length > 1) {
      errors.push(`B1 Part 5 Q${number} has more than one natural answer: ${fitting.join(' / ')}.`);
    }
  }
  if (!questions.length) errors.push('B1 review evidence is missing for Part 5.');
  if (rubric?.crossFit) {
    const crossRows = asArray(rubric.crossFit?.fits);
    for (const [number, fitting] of decided) {
      const cross = crossRows.find((item) => Number(item?.number) === number);
      if (!cross) {
        errors.push(`B1 Part 5 Q${number} review is inconclusive: the independent review omitted this gap.`);
        continue;
      }
      if (!sameLetterSet(fitting, part5Letters(cross))) {
        errors.push(`B1 Part 5 Q${number} review is inconclusive: independent reviews disagree on which options fit.`);
      }
    }
  }
  return errors;
}

function targetEntry(targetBank, question) {
  const key = String(question?.grammarTarget || question?.targetType || '').trim().toLowerCase();
  return asArray(targetBank).find((item) => String(item?.type || '').toLowerCase() === key || String(item?.id || '').toLowerCase() === key);
}

function normaliseWord(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function testedDecision(row) {
  const fields = ['grammatical', 'sameMeaning', 'fitsContext', 'b1Appropriate'];
  if (!row || fields.some((field) => typeof row[field] !== 'boolean') || !String(row.reason || '').trim()) return 'missing';
  if (String(row.certainty || 'certain').trim().toLowerCase() === 'uncertain') return 'uncertain';
  if (typeof row.accept !== 'boolean') return 'missing';
  const flagsAccept = Boolean(row.grammatical && row.sameMeaning && row.fitsContext && row.b1Appropriate);
  if (row.accept === true && flagsAccept) return 'accept';
  if (row.accept === false && !flagsAccept) return 'reject';
  return 'contradictory';
}

function collapseTested(rows, keyed) {
  const groups = new Map();
  const selfIgnored = [];
  for (const row of asArray(rows)) {
    const word = normaliseWord(row?.word);
    if (!word) continue;
    if (word === keyed) {
      selfIgnored.push(word);
      continue;
    }
    if (!groups.has(word)) groups.set(word, []);
    groups.get(word).push(row);
  }
  const evaluated = [];
  for (const [word, group] of groups) {
    const decisions = group.map(testedDecision);
    const settled = [...new Set(decisions.filter((decision) => decision === 'accept' || decision === 'reject'))];
    let decision = 'missing';
    if (settled.length > 1 || decisions.includes('contradictory')) decision = 'contradictory';
    else if (decisions.includes('uncertain')) decision = 'uncertain';
    else if (settled.length === 1) decision = settled[0];
    const source = group.some((item) => item?.source === 'outside-list') ? 'outside-list' : 'target-list';
    evaluated.push({ word, decision, source });
  }
  return { evaluated, selfIgnored: [...new Set(selfIgnored)] };
}

/**
 * Planned candidates are the other words on the gap's target list, plus one word outside it.
 * The keyed word is removed before comparison. Duplicate words are judged once.
 */
export function part6AlternativeReview(question, solved, keyedAnswer, targetBank) {
  const number = Number(question?.number);
  const keyed = normaliseWord(keyedAnswer);
  const entry = targetEntry(targetBank, question);
  if (!entry || !keyed) {
    return {
      number,
      keyed,
      evaluated: [],
      missing: [],
      accepted: [],
      selfIgnored: [],
      outsideJudged: false,
      conflicts: [],
      incomplete: true,
    };
  }
  const siblings = [...new Set(asArray(entry.words).map(normaliseWord).filter((word) => word && word !== keyed))];
  const { evaluated, selfIgnored } = collapseTested(solved?.tested, keyed);
  const byWord = new Map(evaluated.map((item) => [item.word, item]));
  const missing = siblings.filter((word) => {
    const item = byWord.get(word);
    return !item || item.decision === 'missing';
  });
  const outsideJudged = evaluated.some((item) => (
    !siblings.includes(item.word) && (item.decision === 'accept' || item.decision === 'reject')
  ));
  const accepted = new Set(evaluated.filter((item) => item.decision === 'accept').map((item) => item.word));
  const conflicts = new Set(evaluated.filter((item) => item.decision === 'contradictory' || item.decision === 'uncertain').map((item) => item.word));
  for (const word of [...new Set(asArray(solved?.alternatives).map(normaliseWord).filter((item) => item && item !== keyed))]) {
    const judged = byWord.get(word);
    if (!judged) accepted.add(word);
    else if (judged.decision === 'reject' || judged.decision === 'contradictory' || judged.decision === 'uncertain') conflicts.add(word);
  }
  for (const word of conflicts) accepted.delete(word);
  return {
    number,
    keyed,
    evaluated,
    missing,
    accepted: [...accepted],
    selfIgnored,
    outsideJudged,
    conflicts: [...conflicts],
    incomplete: missing.length > 0 || !outsideJudged || conflicts.size > 0,
  };
}

export function part6EvidenceProblems(generated, rubric, targetBank) {
  const errors = [];
  const answers = new Map(asArray(generated?.modelAnswers).map((row) => [Number(row?.number), normaliseWord(row?.answer)]));
  for (const question of asArray(generated?.questions)) {
    const number = Number(question?.number);
    const solved = asArray(rubric?.answers).find((row) => Number(row?.number) === number);
    const review = part6AlternativeReview(question, solved, answers.get(number), targetBank);
    if (!targetEntry(targetBank, question) || !review.keyed) {
      errors.push(`B1 review evidence is missing for Q${number}.`);
      continue;
    }
    const evaluatedWords = review.evaluated
      .filter((item) => item.decision === 'accept' || item.decision === 'reject')
      .map((item) => item.word);
    const evaluatedLabel = evaluatedWords.length ? evaluatedWords.join(', ') : 'none';
    if (review.missing.length) {
      errors.push(`B1 review evidence is missing for Q${number}: planned words not judged: ${review.missing.join(', ')}. Evaluated: ${evaluatedLabel}.`);
    }
    if (!review.outsideJudged) {
      errors.push(`B1 review evidence is missing for Q${number}: no word outside the allowed list was tested. Evaluated: ${evaluatedLabel}.`);
    }
    for (const item of review.evaluated) {
      if (item.decision === 'uncertain') {
        errors.push(`B1 Part 6 Q${number} review is inconclusive: the judgement of "${item.word}" is uncertain.`);
      } else if (item.decision === 'contradictory') {
        errors.push(`B1 Part 6 Q${number} review is inconclusive: the judgement of "${item.word}" contradicts itself.`);
      }
    }
    for (const word of review.conflicts) {
      const item = review.evaluated.find((row) => row.word === word);
      if (item?.decision === 'uncertain' || item?.decision === 'contradictory') continue;
      errors.push(`B1 Part 6 Q${number} review is inconclusive: "${word}" is listed as an alternative and also rejected.`);
    }
    for (const word of review.accepted) {
      errors.push(`B1 Part 6 Q${number} accepts multiple ordinary answers: ${review.keyed} / ${word}.`);
    }
  }
  return errors;
}

export function b1ReviewApproval(errors = []) {
  const text = (Array.isArray(errors) ? errors : []).join('\n');
  const evidenceMissing = /review evidence is missing|review is inconclusive/i.test(text);
  const ambiguous = /more than one|ambiguity|multiple ordinary|alternative key|double key/i.test(text);
  const pedagogy = /weak distractor|explicit statement|unsupported requirement|weak cohesion|copying wording|not supported by the text/i.test(text);
  return {
    structurallyValid: !evidenceMissing,
    linguisticallyUnambiguous: !ambiguous,
    pedagogicallySuitable: !pedagogy && !ambiguous && !evidenceMissing,
    humanTeacherApproved: false,
  };
}
