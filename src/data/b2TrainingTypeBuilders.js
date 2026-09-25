/**
 * Builders for the 45 task types, plus translation both ways, that every Training level offers.
 * Every builder takes `id`, `focus` (unique per level), `why` (the explanation) and `tag`
 * (a key of GAP_FILL_ERROR_TAG_LABELS). `instruction` is optional: each type has a default,
 * and Dralo reads it out in his speech bubble.
 *
 * Answers: a string, or an array whose first entry is the canonical form and the rest are
 * also accepted. Contractions (don't / do not) are always accepted, so never list both.
 */

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

function formsOf(entry) {
  const forms = (Array.isArray(entry) ? entry : [entry]).filter((form) => form != null && form !== '');
  return { canonicalAnswer: forms[0], acceptedAnswers: forms };
}

function base(format, spec, instruction) {
  return {
    itemId: spec.id,
    format,
    subFocus: spec.focus,
    instruction: spec.instruction || instruction,
    explanation: spec.why,
    errorTag: spec.tag,
  };
}

function choiceFields(texts, correct) {
  const options = texts.map((text, index) => ({ id: LETTERS[index], text }));
  const key = options.find((option) => option.text === correct);
  return { options, correctId: key?.id, solution: correct };
}

function sentenceFields(answer, accepted) {
  const list = accepted?.length ? accepted : [answer];
  return {
    canonicalAnswer: answer,
    acceptedAnswers: list.includes(answer) ? list : [answer, ...list],
    solution: answer,
  };
}

// ── Typed gaps ────────────────────────────────────────────────────────────────

/** SUCCESS → She is a very {1} entrepreneur. → successful */
export function wordFormation(spec) {
  return {
    ...base('word_formation', spec, 'Use the word in capitals to form a word that fits the gap.'),
    sentence: spec.sentence,
    promptWord: spec.base,
    gaps: [formsOf(spec.answers)],
  };
}

/** I started working here five years ago. / FOR / I {1} five years. → have worked here for */
export function keyWord(spec) {
  return {
    ...base(
      'key_word',
      spec,
      'Complete the second sentence so it means the same as the first. Use the word given and two to five words.',
    ),
    lead: spec.first,
    keyword: spec.keyword,
    sentence: spec.second,
    gaps: [formsOf(spec.answers)],
  };
}

/** I’m interested {1} learning English. → in */
export function preposition(spec) {
  return {
    ...base('preposition', spec, 'Complete the sentence with the correct preposition.'),
    sentence: spec.sentence,
    gaps: [formsOf(spec.answers)],
  };
}

/** I need to look {1} this word. → up */
export function phrasal(spec) {
  return {
    ...base('phrasal', spec, 'Complete the phrasal verb.'),
    sentence: spec.sentence,
    gaps: [formsOf(spec.answers)],
  };
}

/** We need to {1} a decision by Friday. → make */
export function collocation(spec) {
  return {
    ...base('collocation', spec, 'Complete the collocation with the missing word.'),
    sentence: spec.sentence,
    gaps: [formsOf(spec.answers)],
  };
}

/** A paragraph with 3–6 gaps; `gaps: [{ hint: 'open', answers: 'opens' }]`. */
export function textGaps(spec) {
  return {
    ...base('text_gaps', spec, 'Complete the text with the correct form of the words in brackets.'),
    sentence: spec.text,
    gaps: spec.gaps.map((gap) => ({ ...formsOf(gap.answers), hint: gap.hint })),
  };
}

/** A paragraph with 3–6 gaps and no help: one word per gap. */
export function openCloze(spec) {
  return {
    ...base('open_cloze', spec, 'Complete the text. Write one word in each gap.'),
    sentence: spec.text,
    gaps: spec.answers.map(formsOf),
  };
}

/** Listen, then type the missing word(s). The completed sentence must equal `audio`. */
export function listenGap(spec) {
  return {
    ...base('listen_gap', spec, 'Listen and complete the sentence.'),
    audio: spec.audio,
    sentence: spec.sentence,
    gaps: [formsOf(spec.answers)],
  };
}

// ── Gaps with options ─────────────────────────────────────────────────────────

/** A paragraph with 3–6 gaps; `gaps: [{ options: [...4], correct }]`. */
export function mcCloze(spec) {
  return {
    ...base('mc_cloze', spec, 'Choose the best word for each gap.'),
    sentence: spec.text,
    gaps: spec.gaps.map((gap) => ({
      canonicalAnswer: gap.correct,
      acceptedAnswers: [gap.correct],
      options: gap.options,
    })),
  };
}

/** 1–4 gaps that share one list of linkers; `answers` in gap order. */
export function linker(spec) {
  return {
    ...base('linker', spec, 'Choose the best linker for each gap.'),
    sentence: spec.text,
    gaps: spec.answers.map((answer) => ({
      canonicalAnswer: answer,
      acceptedAnswers: [answer],
      options: spec.options,
    })),
  };
}

// ── One choice ────────────────────────────────────────────────────────────────

function pick(format, instruction, spec, fields) {
  return {
    ...base(format, spec, instruction),
    ...fields,
    ...choiceFields(spec.options, spec.correct),
  };
}

export function mcq(spec) {
  return pick('mcq', 'Choose the correct answer.', spec, {
    sentence: spec.question,
    passage: spec.passage,
  });
}

export function paraphrase(spec) {
  return pick('paraphrase', 'Choose the sentence that means the same.', spec, { sentence: spec.sentence });
}

export function oddOneOut(spec) {
  return pick('odd_one_out', 'Choose the one that does not fit.', spec, { sentence: spec.question });
}

export function heading(spec) {
  return pick('heading', 'Read the text and choose the best heading.', spec, { passage: spec.text });
}

/** Mark the target word with **bold** in `sentence`. */
export function synonym(spec) {
  return pick('synonym', 'Choose the word closest in meaning to the word in bold.', spec, {
    sentence: spec.sentence,
  });
}

/** Mark the target word with **bold** in `sentence`. */
export function antonym(spec) {
  return pick('antonym', 'Choose the word opposite in meaning to the word in bold.', spec, {
    sentence: spec.sentence,
  });
}

export function wordToDefinition(spec) {
  return pick('word_to_definition', 'Choose the correct definition.', spec, { sentence: spec.word });
}

export function situation(spec) {
  return pick('situation', 'What would you say in this situation?', spec, { context: spec.context });
}

/** `prompt` is what speaker A says; the student picks B’s reply. */
export function response(spec) {
  return pick('response', 'Choose the most natural reply.', spec, {
    sentence: `A: ${spec.prompt}\nB: ___`,
  });
}

export function register(spec) {
  return pick('register', 'Choose the sentence that suits the situation.', spec, { context: spec.context });
}

/** Four words; mark the sound being compared with **bold**, e.g. `watch**es**`. */
export function oddSound(spec) {
  return pick('odd_sound', 'Which word has a different sound in the part in bold?', spec, {
    sentence: spec.question,
  });
}

/** `sentence` contains ___ where the modal goes. */
export function certainty(spec) {
  return pick('certainty', 'How sure is the speaker? Choose the best modal.', spec, {
    context: spec.context,
    sentence: spec.sentence,
  });
}

export function listenChoice(spec) {
  return pick('listen_choice', 'Listen and answer the question.', spec, {
    audio: spec.audio,
    sentence: spec.question,
  });
}

export function listenIntention(spec) {
  return pick('listen_intention', 'Listen. What is the speaker doing?', spec, {
    audio: spec.audio,
    sentence: spec.question,
  });
}

export function listenTrueFalse(spec) {
  return {
    ...base('listen_true_false', spec, 'Listen. Is the sentence true or false?'),
    audio: spec.audio,
    sentence: spec.statement,
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctId: spec.correct ? 'true' : 'false',
    solution: spec.correct ? 'True' : 'False',
  };
}

/** `image` is a file in /public/training/images/. */
export function imageChoice(spec) {
  return pick('image_choice', 'Look at the picture and choose the best sentence.', spec, {
    image: spec.image,
    imageAlt: spec.alt,
    sentence: spec.question,
  });
}

// ── Several right answers ────────────────────────────────────────────────────

/** `correct` lists every right option text (at least two). */
export function multiSelect(spec) {
  const options = spec.options.map((text, index) => ({ id: LETTERS[index], text }));
  return {
    ...base('multi_select', spec, 'Choose all the correct answers.'),
    sentence: spec.question,
    options,
    correctIds: options.filter((option) => spec.correct.includes(option.text)).map((option) => option.id),
  };
}

// ── Write a sentence ─────────────────────────────────────────────────────────

export function errorCorrection(spec) {
  return {
    ...base('error_correction', spec, 'Find the mistake and write the sentence correctly.'),
    sentence: spec.sentence,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

/** `use` is the word the answer must contain, e.g. WISH. */
export function situationRewrite(spec) {
  return {
    ...base('situation_rewrite', spec, 'Write a sentence for the situation. Use the word in capitals.'),
    context: spec.context,
    use: spec.use,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

const POLARITY_INSTRUCTIONS = {
  negative: 'Make the sentence negative.',
  question: 'Turn the sentence into a question.',
  affirmative: 'Make the sentence affirmative.',
};

/** `target`: 'negative' | 'question' | 'affirmative'. */
export function polarity(spec) {
  return {
    ...base('polarity', spec, POLARITY_INSTRUCTIONS[spec.target]),
    sentence: spec.sentence,
    target: spec.target,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

export function passive(spec) {
  return {
    ...base('passive', spec, 'Rewrite the sentence in the passive.'),
    sentence: spec.sentence,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

export function reported(spec) {
  return {
    ...base('reported', spec, 'Report what the person said.'),
    sentence: spec.sentence,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

export function conditional(spec) {
  return {
    ...base('conditional', spec, 'Write one conditional sentence for the situation.'),
    context: spec.context,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

/** `use` is the linker the answer must contain, e.g. ALTHOUGH. */
export function combine(spec) {
  return {
    ...base('combine', spec, 'Join the sentences. Use the word in capitals.'),
    sentence: spec.sentence,
    use: spec.use,
    ...sentenceFields(spec.answer, spec.accepted),
  };
}

/** The student types exactly `audio`. Write numbers as words. */
export function dictation(spec) {
  return {
    ...base('dictation', spec, 'Listen and write exactly what you hear.'),
    audio: spec.audio,
    ...sentenceFields(spec.audio),
  };
}

/** One word. `hint` (optional) is shown as a first-letter clue. */
export function defineWord(spec) {
  return {
    ...base('define_word', spec, 'Write the word that matches the definition.'),
    sentence: spec.definition,
    hint: spec.hint,
    ...formsOf(spec.answers),
    solution: formsOf(spec.answers).canonicalAnswer,
  };
}

// ── Tap one part ─────────────────────────────────────────────────────────────

/** `chunks` spell the sentence; `wrong` is the index of the chunk with the mistake. */
export function spotError(spec) {
  return {
    ...base('spot_error', spec, 'Tap the part of the sentence with the mistake.'),
    chunks: spec.chunks,
    correctIndex: spec.wrong,
    correction: spec.fix,
  };
}

/** `syllables` spell `word`; `stressed` is the index of the stressed syllable. */
export function stress(spec) {
  return {
    ...base('stress', spec, 'Tap the stressed syllable.'),
    word: spec.word,
    syllables: spec.syllables,
    correctIndex: spec.stressed,
  };
}

// ── Put in order, match, group, place ────────────────────────────────────────

/** `events` in the right order; the student sees them shuffled. */
export function sequence(spec) {
  return {
    ...base('sequence', spec, 'Put the events in the order they happened.'),
    passage: spec.passage,
    events: spec.events,
  };
}

/** `pairs: [[left, right], …]` in matching order; the right column is shuffled on screen. */
export function match(spec) {
  return {
    ...base('match', spec, 'Match each item on the left with one on the right.'),
    pairs: spec.pairs.map(([left, right]) => ({ left, right })),
  };
}

/** `pairs: [[british, american], …]`. */
export function britishAmerican(spec) {
  return {
    ...base('british_american', spec, 'Match each British word with its American equivalent.'),
    pairs: spec.pairs.map(([left, right]) => ({ left, right })),
  };
}

/** `words: [[text, categoryIndex], …]`. */
export function classify(spec) {
  return {
    ...base('classify', spec, 'Put each word in the correct group.'),
    categories: spec.categories,
    words: spec.words.map(([text, category]) => ({ text, category })),
  };
}

/** `text` has [1], [2]… where sentences were removed; `sentences` in gap order; `extra` does not fit. */
export function gappedText(spec) {
  const extra = Array.isArray(spec.extra) ? spec.extra : [spec.extra];
  return {
    ...base('gapped_text', spec, 'Choose the sentence that fits each gap. One sentence is extra.'),
    passage: spec.text,
    options: [...spec.sentences, ...extra],
  };
}

/** `lines: [[speaker, text | null], …]`; `answers` fill the null lines in order; `extra` does not fit. */
export function dialogue(spec) {
  const extra = Array.isArray(spec.extra) ? spec.extra : [spec.extra];
  return {
    ...base('dialogue', spec, 'Complete the conversation. One line is extra.'),
    lines: spec.lines.map(([speaker, text]) => ({ speaker, text })),
    options: [...spec.answers, ...extra],
  };
}

/** `texts: [[name, text], …]` (3–4); `questions: [[question, textIndex], …]`. */
export function multipleMatching(spec) {
  return {
    ...base('multiple_matching', spec, 'Read the texts. Choose the right person for each question.'),
    texts: spec.texts.map(([label, text]) => ({ label, text })),
    questions: spec.questions.map(([text, answer]) => ({ text, answer })),
  };
}

// ── Translate ────────────────────────────────────────────────────────────────

/** `spanish` is shown; `answers` lists at least two English versions, the key first. */
export function translateToEnglish(spec) {
  const { canonicalAnswer, acceptedAnswers } = formsOf(spec.answers);
  return {
    ...base('translate_to_english', spec, 'Translate the sentence into English.'),
    sentence: spec.spanish,
    sourceLanguage: 'es',
    ...sentenceFields(canonicalAnswer, acceptedAnswers),
  };
}

/**
 * `english` is shown; `answers` lists at least two versions in Spanish from Spain, the key first.
 * The student may leave out accents, ñ and ¿ ¡, so never list those variants.
 */
export function translateToSpanish(spec) {
  const { canonicalAnswer, acceptedAnswers } = formsOf(spec.answers);
  return {
    ...base('translate_to_spanish', spec, 'Translate the sentence into Spanish.'),
    sentence: spec.english,
    sourceLanguage: 'en',
    ...sentenceFields(canonicalAnswer, acceptedAnswers),
  };
}
