/**
 * Compact builders for B2 training items. Same shapes the Present simple level uses.
 */

function formsOf(entry) {
  const forms = Array.isArray(entry) ? entry : [entry];
  return { canonicalAnswer: forms[0], acceptedAnswers: forms };
}

/**
 * `answers` shapes:
 * - string → one gap
 * - ['are', 'meeting'] → one gap per string
 * - [["don't believe", 'do not believe']] → one gap, several accepted forms
 */
function gapsFrom(answers) {
  if (!Array.isArray(answers)) return [formsOf(answers)];
  if (Array.isArray(answers[0])) return answers.map(formsOf);
  return answers.map((entry) => formsOf(entry));
}

export function gap(spec) {
  return {
    itemId: spec.id,
    format: 'gap',
    subFocus: spec.focus,
    instruction: spec.instruction || 'Complete the gap.',
    sentence: spec.sentence,
    promptWord: spec.prompt,
    gaps: gapsFrom(spec.answers),
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

export function choice(spec) {
  const options = spec.options.map((text, index) => ({
    id: ['a', 'b', 'c', 'd'][index],
    text,
  }));
  const correct = options.find((option) => option.text === spec.correct);
  return {
    itemId: spec.id,
    format: spec.format || 'choice',
    subFocus: spec.focus,
    instruction: spec.instruction || 'Choose the correct answer.',
    sentence: spec.sentence,
    options,
    correctId: correct.id,
    solution: spec.correct,
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

export function intention(spec) {
  return choice({ ...spec, format: 'intention', instruction: spec.instruction || 'Choose the speaker’s intention.' });
}

export function trueFalse(spec) {
  const correct = spec.correct === true;
  return {
    itemId: spec.id,
    format: 'true_false',
    subFocus: spec.focus,
    instruction: spec.instruction || 'Is this sentence correct?',
    sentence: spec.sentence,
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctId: correct ? 'true' : 'false',
    solution: correct ? 'True' : 'False',
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

export function transform(spec) {
  const accepted = spec.accepted || [spec.answer];
  return {
    itemId: spec.id,
    format: 'transform',
    subFocus: spec.focus,
    instruction: spec.instruction,
    sentence: spec.sentence,
    canonicalAnswer: spec.answer,
    acceptedAnswers: accepted.includes(spec.answer) ? accepted : [spec.answer, ...accepted],
    solution: spec.answer,
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

export function order(spec) {
  return {
    itemId: spec.id,
    format: 'order',
    subFocus: spec.focus,
    instruction: spec.instruction || 'Put the words in order.',
    words: spec.words,
    canonicalAnswer: spec.answer,
    acceptedAnswers: [spec.answer],
    solution: spec.solution || `${spec.answer}.`,
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

export function exercise(spec) {
  return {
    exerciseId: spec.id,
    cefr: 'B2',
    category: spec.category,
    grammarFocus: spec.focus,
    title: spec.title,
    instruction: `Each question tells you what to do. The grammar point is ${spec.point}.`,
    items: spec.items,
  };
}
