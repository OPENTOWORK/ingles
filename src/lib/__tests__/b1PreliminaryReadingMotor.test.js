import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildB1TwentyExamAllocation, validateB1TwentyExamAllocation } from '@/lib/b1PreliminaryReadingSpec';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';
import {
  b1Part3GistPositionProblems,
  countB1PassageWords,
  findB1AboveLevelTerms,
  repairB1Part3Draft,
  markedAnswerMismatches,
  part1LiteralOverlapProblems,
  part2ProfileSupportProblems,
  part3OptionFormatProblems,
  repairB1Part2AdultProfiles,
  part4CohesionProblems,
  part5CoherenceProblems,
  part5UnnaturalFrameProblems,
  part6LocalAmbiguityProblems,
  part6TargetProblems,
} from '@/lib/b1ReadingConstruction';
import {
  b1ReviewApproval,
  part1EvidenceProblems,
  part2EvidenceProblems,
  part3EvidenceProblems,
  part4EvidenceProblems,
  part5EvidenceProblems,
  part6EvidenceProblems,
} from '@/lib/b1ReadingRules/reviewEvidence';
import {
  redistributeB1Part2Answers,
  selectB1Part3QuestionPlan,
  selectB1Part5LexicalPlan,
  selectB1Part6Targets,
} from '@/lib/b1ReadingVarietyPlans';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

test('B1 20-exam allocation is balanced and has six distinct topics per exam', () => {
  const plan = buildB1TwentyExamAllocation();
  const result = validateB1TwentyExamAllocation(plan);
  assert.equal(plan.length, 20);
  assert.equal(result.ok, true, result.errors.join('\n'));
  const counts = Object.values(result.topicCounts);
  assert.ok(Math.max(...counts) <= 6);
  assert.ok(Math.min(...counts) >= 5);
});

test('B1 Part 1 accepts five short texts with three options', () => {
  const generated = {
    directions: 'For each question, choose the correct answer.',
    questions: Array.from({ length: 5 }, (_, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text: `Message ${i + 1}: Please check the details before Friday.`,
      prompt: 'What should the reader do?',
      options: ['A) Check the information.', 'B) Ignore the message.', 'C) Wait until next month.'],
    })),
    modelAnswers: Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, answer: 'A' })),
  };
  const result = validateGeneratedExamPart('b1', 1, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('B1 Part 4 requires eight sentences and three unused options', () => {
  const generated = {
    directions: 'Five sentences have been removed.',
    title: 'A day out',
    passage: 'Start. (16) ___ More. (17) ___ More. (18) ___ More. (19) ___ More. (20) ___ End.',
    sentencePool: ['A) One.','B) Two.','C) Three.','D) Four.','E) Five.','F) Six.','G) Seven.','H) Eight.'],
    questions: Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, number: 16 + i })),
    modelAnswers: ['A','B','C','D','E'].map((answer, i) => ({ id: `q${i + 1}`, number: 16 + i, answer })),
  };
  const result = validateGeneratedExamPart('b1', 4, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.sentencePool = generated.sentencePool.slice(0, 6);
  const invalid = validateGeneratedExamPart('b1', 4, generated);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((e) => e.includes('exactly 8 candidate sentences')));
});

test('B1 Part 5 rejects an example gap and wrong numbering', () => {
  const generated = {
    directions: 'For each question, choose the correct answer.',
    title: 'Short text',
    passage: '(0) ___ Intro. (1) ___ (2) ___ (3) ___ (4) ___ (5) ___ (6) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({
      id: `q${i + 1}`, number: i + 1, options: ['A) one','B) two','C) three','D) four'],
    })),
    modelAnswers: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, answer: 'A' })),
  };
  const result = validateGeneratedExamPart('b1', 5, generated);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('number must be 21–26')));
  assert.ok(result.errors.some((e) => e.includes('no example gap (0)')));
});

test('B1 Part 6 enforces one-word answers and gaps 27–32', () => {
  const generated = {
    directions: 'Write one word for each gap.',
    title: 'Message',
    passage: '(27) ___ a (28) ___ b (29) ___ c (30) ___ d (31) ___ e (32) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: 27 + i, type: 'short' })),
    modelAnswers: ['the','to','if','of','your','and'].map((answer, i) => ({
      id: `q${i + 1}`, number: 27 + i, answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.modelAnswers[0].answer = 'two words';
  const invalid = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((e) => e.includes('exactly one word')));
});

test('B1 Part 3 requires the four comprehension types and ordinary language', () => {
  const questions = [
    ['detail', 'What did Maya do first?'],
    ['inference', 'Why did Maya leave early?'],
    ['attitude', 'How did Maya feel about the class?'],
    ['detail', 'Where did the class meet?'],
    ['gist', 'What is the text mainly about?'],
  ].map(([questionType, prompt], index) => ({
    id: `q${index + 1}`,
    number: 11 + index,
    type: 'mcq',
    questionType,
    prompt,
    options: ['A) She joined the evening class.', 'B) She stayed at home.', 'C) She cancelled the trip.', 'D) She forgot the time.'],
  }));
  const generated = {
    directions: 'Read the text and choose the correct answer.',
    title: 'Evening class',
    passage: `${'Maya started an evening class because she wanted to speak more confidently at work. The first meeting was in a small room above a bookshop. She listened carefully, asked ordinary questions and tried the new phrases with the group. '.repeat(8)}`,
    questions,
    modelAnswers: ['A', 'A', 'A', 'A', 'A'].map((answer, index) => ({
      id: `q${index + 1}`,
      number: 11 + index,
      answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 3, generated);
  assert.ok(countB1PassageWords(generated.passage) >= 180);
  assert.ok(countB1PassageWords(generated.passage) <= 520);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.passage = 'Maya is a polyglot with unparalleled cognitive abilities.';
  const tooHigh = validateGeneratedExamPart('b1', 3, generated);
  assert.equal(tooHigh.ok, false);
  assert.ok(tooHigh.errors.some((error) => error.includes('above B1')));
});

test('B1 Part 6 rejects a repeated answer word', () => {
  const generated = {
    directions: 'Write one word for each gap.',
    title: 'Message',
    passage: '(27) ___ a (28) ___ b (29) ___ c (30) ___ d (31) ___ e (32) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: 27 + i, type: 'short' })),
    modelAnswers: ['the', 'the', 'if', 'of', 'your', 'and'].map((answer, i) => ({
      id: `q${i + 1}`, number: 27 + i, answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('six different one-word answers')));
});

test('B1 construction guards keep cohesion, keys and grammar targets fail-closed', () => {
  assert.deepEqual(findB1AboveLevelTerms('a normal class'), []);
  assert.ok(findB1AboveLevelTerms('The nuance was too small to notice.').includes('nuance'));

  const copiedPhrase = part4CohesionProblems({
    chunks: ['before the evening train', 'after', 'x', 'y', 'z', 'end'],
    removed: [
      { number: 16, sentence: 'We caught the evening train.', cohesion: 'chronology', cohesionNote: 'The train time is fixed by the previous sentence and fails later gaps.' },
      { number: 17, sentence: 'We caught the evening train again.', cohesion: 'chronology', cohesionNote: 'This repeat is too mechanical and should be rejected.' },
    ],
    extras: [],
  });
  assert.ok(copiedPhrase.some((error) => error.includes('evening train')));

  const mismatches = markedAnswerMismatches('The trip was [[21:cancelled]] today.', [
    { number: 21, answer: 'delayed' },
  ]);
  assert.equal(mismatches.length, 1);

  const grammar = part6TargetProblems([
    { number: 27, answer: 'the', targetType: 'article/determiner' },
    { number: 28, answer: 'for', targetType: 'preposition' },
    { number: 29, answer: 'who', targetType: 'pronoun/relative' },
    { number: 30, answer: 'was', targetType: 'auxiliary/modal' },
    { number: 31, answer: 'because', targetType: 'linking word' },
    { number: 32, answer: 'idea', targetType: 'phrasal particle/fixed phrase' },
  ]);
  assert.ok(grammar.some((error) => error.includes('Q32')));
});

test('B1 Part 4 accepts pronoun cohesion and rejects an unrelated extra', () => {
  const natural = part4CohesionProblems({
    chunks: [
      'Last spring I bought a small bike from the market.',
      'The ride home was easy after that.',
      'On Sunday I showed it to my brother.',
      'He had wanted one for months.',
      'We agreed to share it at weekends.',
      'The arrangement still works.',
    ],
    removed: [{
      number: 16,
      sentence: 'It had a broken chain when I got it home.',
      cohesion: 'pronoun-reference',
      cohesionNote: 'It refers to the bike in the previous sentence and is resolved before the ride home.',
    }],
    extras: [{
      sentence: 'The market seller also offered a helmet for the bike.',
      rejectionReason: 'The helmet is never mentioned beside any gap, so the sentence has no referent there.',
    }],
  });
  assert.deepEqual(natural, []);

  const unrelated = part4CohesionProblems({
    chunks: ['The bakery opened early.', 'Families collected bread.', 'x', 'y', 'z', 'end'],
    removed: [{
      number: 16,
      sentence: 'They queued before sunrise.',
      cohesion: 'pronoun-reference',
      cohesionNote: 'They refers to the families who collect bread later that morning.',
    }],
    extras: [{
      sentence: 'Students can borrow laptops from the library.',
      rejectionReason: 'This sentence is about a library and cannot fit the bakery story.',
    }],
  });
  assert.ok(unrelated.some((error) => error.includes('not thematically connected')));
});

test('B1 Part 3 repairs a passage that is only slightly under 180 words', () => {
  const sentence = 'Maya walked through the old market and bought fresh bread for her family.';
  const unit = sentence.split(/\s+/);
  const ending = "I didn't go. It wasn't late. I couldn't wait.".split(/\s+/);
  const plain = [];
  while (plain.length < 177 - ending.length) plain.push(...unit);
  const passage = `${plain.slice(0, 177 - ending.length).join(' ')} ${ending.join(' ')}`;
  assert.equal(countB1PassageWords(passage), 177);
  const questions = [
    { number: 11, questionType: 'detail', prompt: 'What did Maya buy?', options: ['A) Fresh bread.', 'B) A new coat.', 'C) Train tickets.', 'D) A book.'] },
    { number: 12, questionType: 'inference', prompt: 'Why did she go out?', options: ['A) To buy food.', 'B) To catch a train.', 'C) To meet a teacher.', 'D) To return a book.'] },
    { number: 13, questionType: 'attitude', prompt: 'How did she feel?', options: ['A) Pleased.', 'B) Angry.', 'C) Bored.', 'D) Afraid.'] },
    { number: 14, questionType: 'detail', prompt: 'Where did she walk?', options: ['A) Through the market.', 'B) Along the river.', 'C) Around the school.', 'D) Across the park.'] },
    { number: 15, questionType: 'gist', prompt: 'What is the text mainly about?', options: ['A) A shopping trip.', 'B) A long journey.', 'C) A new job.', 'D) A school exam.'] },
  ];
  const modelAnswers = ['A', 'A', 'A', 'A', 'A'].map((answer, index) => ({ number: 11 + index, answer }));
  const draft = { passage, questions, modelAnswers };
  const repaired = repairB1Part3Draft(draft);
  assert.equal(repaired.lengthRepair.ok, true);
  assert.equal(repaired.lengthRepair.repaired, true);
  assert.equal(repaired.questions, questions);
  assert.equal(repaired.modelAnswers, modelAnswers);
  assert.equal(countB1PassageWords(repaired.passage), 180);
  assert.match(repaired.passage, /did not go/);
  assert.match(repaired.passage, /was not late/);
  assert.match(repaired.passage, /could not wait/);
  assert.equal(validateGeneratedExamPart('b1', 3, {
    directions: 'Read the text and choose the correct answer.',
    title: 'Market morning',
    passage: repaired.passage,
    questions,
    modelAnswers,
  }).ok, true);

  const tooShort = repairB1Part3Draft({
    passage: sentence,
    questions,
    modelAnswers,
  });
  assert.equal(tooShort.lengthRepair.ok, false);
  assert.equal(tooShort.passage, sentence);
  assert.equal(tooShort.questions, questions);
  assert.equal(tooShort.modelAnswers, modelAnswers);
  const rejected = validateGeneratedExamPart('b1', 3, {
    directions: 'Read the text and choose the correct answer.',
    title: 'Market morning',
    passage: tooShort.passage,
    questions,
    modelAnswers,
  });
  assert.equal(rejected.ok, false);
  assert.ok(rejected.errors.some((error) => error.includes('words') && error.includes('180') && error.includes('520')));

  const tail = 'She said that she was fine and she said that she was ready.'.split(/\s+/);
  const longWords = [];
  while (longWords.length < 522 - tail.length) longWords.push(...unit);
  const longPassage = `${longWords.slice(0, 522 - tail.length).join(' ')} ${tail.join(' ')}`;
  assert.equal(countB1PassageWords(longPassage), 522);
  const shortened = repairB1Part3Draft({ passage: longPassage, questions, modelAnswers });
  assert.equal(shortened.lengthRepair.ok, true);
  assert.equal(countB1PassageWords(shortened.passage), 520);
  assert.equal(shortened.questions, questions);
  assert.equal(shortened.modelAnswers, modelAnswers);
  assert.doesNotMatch(shortened.passage, /\bthat she\b/);

  const farWords = [];
  while (farWords.length < 540) farWords.push(...unit);
  const farPassage = farWords.slice(0, 540).join(' ');
  const untouched = repairB1Part3Draft({ passage: farPassage, questions, modelAnswers });
  assert.equal(untouched.lengthRepair.ok, false);
  assert.equal(untouched.passage, farPassage);
  assert.equal(untouched.questions, questions);
});

test('B1 Part 3 whole-text question stays at Q15 and the earlier mix can vary', () => {
  const earlyGist = [
    { number: 11, questionType: 'detail' },
    { number: 12, questionType: 'inference' },
    { number: 13, questionType: 'attitude' },
    { number: 14, questionType: 'gist' },
    { number: 15, questionType: 'detail' },
  ];
  assert.ok(b1Part3GistPositionProblems(earlyGist).length > 0);
  const first = selectB1Part3QuestionPlan({ examSlot: 6, history: [] });
  const second = selectB1Part3QuestionPlan({ examSlot: 7, history: [{ signature: first.signature, prefix: first.questions.slice(0, 4).map((q) => q.questionType) }] });
  assert.equal(first.questions[4].questionType, 'gist');
  assert.equal(second.questions[4].questionType, 'gist');
  assert.notEqual(first.signature, second.signature);
});

test('B1 Part 6 plans vary by exam and still reject content-word gaps', () => {
  const history = [];
  for (let exam = 1; exam <= 5; exam += 1) {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), `../../../fixtures/b1-reading-exam-${exam}-candidate.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const part = data.parts.find((item) => item.partNumber === 6);
    history.push({
      types: part.generated.questions.map((question) => question.grammarTarget),
      answers: part.generated.modelAnswers.map((row) => row.answer),
    });
  }
  const exam6 = selectB1Part6Targets({ examSlot: 6, history });
  const exam7 = selectB1Part6Targets({ examSlot: 7, history: [...history, { types: exam6.map((item) => item.type), answers: [] }] });
  const legacy = ['article/determiner', 'preposition', 'pronoun/relative', 'auxiliary/modal', 'linking word', 'phrasal particle/fixed phrase'];
  assert.notDeepEqual(exam6.map((item) => item.type), legacy);
  assert.notDeepEqual(exam7.map((item) => item.type), exam6.map((item) => item.type));
  for (const previous of history) {
    assert.notDeepEqual(exam6.map((item) => item.type.toLowerCase()), previous.types.map((type) => String(type).toLowerCase()));
  }
  const again = selectB1Part6Targets({ examSlot: 6, history });
  assert.deepEqual(again.map((item) => item.type), exam6.map((item) => item.type));

  const usedAnswers = new Set();
  const varied = part6TargetProblems(exam6.map((target) => {
    const answer = target.words.find((word) => !usedAnswers.has(word)) || target.words[0];
    usedAnswers.add(answer);
    return { number: target.number, targetType: target.type, answer };
  }));
  assert.equal(varied.length, 0, varied.join('\n'));

  const ambiguous = part6LocalAmbiguityProblems(
    'Yesterday I [[30:was]] listening to the radio when the train arrived.',
    [{ number: 30, answer: 'was' }],
  );
  assert.ok(ambiguous.some((error) => error.includes('Q30')));
});

test('B1 Part 2 shuffle keeps the same texts and avoids A B C D E', () => {
  const generated = {
    questions: [6, 7, 8, 9, 10].map((number, index) => ({
      id: `q${index + 1}`,
      number,
      prompt: `Person ${number} is 30 and needs option ${index}.`,
    })),
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => ({
      letter,
      text: `Text ${letter} is a unique service description for adults and children.`,
    })),
    modelAnswers: ['A', 'B', 'C', 'D', 'E'].map((answer, index) => ({
      id: `q${index + 1}`,
      number: 6 + index,
      answer,
    })),
  };
  const shuffled = redistributeB1Part2Answers(generated, { examSlot: 6, previousKeys: ['ABCDE'] });
  const key = shuffled.modelAnswers.map((row) => row.answer).join('');
  assert.notEqual(key, 'ABCDE');
  assert.equal(new Set(key).size, 5);
  shuffled.modelAnswers.forEach((row, index) => {
    const section = shuffled.sections.find((item) => item.letter === row.answer);
    assert.equal(section.text, `Text ${generated.modelAnswers[index].answer} is a unique service description for adults and children.`);
  });

  const ageGap = part2ProfileSupportProblems({
    questions: [{ number: 9, prompt: 'Lara wants to plant trees on Sunday morning.' }],
    sections: [{ letter: 'D', text: 'This is a single morning for adults, not a weekly club.' }],
    modelAnswers: [{ number: 9, answer: 'D' }],
  });
  assert.ok(ageGap.some((error) => error.includes('adults')));
  const noonGap = part2ProfileSupportProblems({
    questions: [{ number: 7, prompt: 'She wants to leave by noon.' }],
    sections: [{ letter: 'B', text: 'The café locks at noon.' }],
    modelAnswers: [{ number: 7, answer: 'B' }],
  });
  assert.ok(noonGap.some((error) => error.includes('noon')));

  const repaired = repairB1Part2AdultProfiles({
    questions: [{ number: 9, prompt: 'Lara wants to plant trees on Sunday morning.' }],
    sections: [{ letter: 'D', text: 'This is a single Sunday morning for adults, not a weekly club.' }],
    modelAnswers: [{ number: 9, answer: 'D' }],
  });
  assert.match(repaired.questions[0].prompt, /^Lara wants to plant trees on Sunday morning\. Lara is (1[89]|[2-7]\d)\.$/);
  assert.doesNotMatch(repaired.questions[0].prompt, /\bis 32\b/);
  assert.equal(part2ProfileSupportProblems(repaired).length, 0);
  const noonSource = {
    questions: [{ number: 7, prompt: 'She wants to leave by noon.' }],
    sections: [{ letter: 'B', text: 'The café locks at noon.' }],
    modelAnswers: [{ number: 7, answer: 'B' }],
  };
  assert.equal(part2ProfileSupportProblems(repairB1Part2AdultProfiles(noonSource)).length, 1);
});

test('B1 Part 2 adult-age repair follows the person and the activity', () => {
  const adultsOnly = 'This course is for adults and meets on Saturday morning.';
  const repairOne = (prompt, text = adultsOnly) => repairB1Part2AdultProfiles({
    questions: [{ number: 6, prompt }],
    sections: [{ letter: 'C', text }],
    modelAnswers: [{ number: 6, answer: 'C' }],
  }).questions[0].prompt;

  const student = repairOne('Ben is studying at university and wants evening classes.');
  assert.match(student, /^Ben is studying at university and wants evening classes\. Ben is (19|20|21|22)\.$/);

  const worker = repairOne('Helen works in an office and wants a Saturday course.');
  assert.match(worker, /^Helen works in an office and wants a Saturday course\. Helen is (26|28|31|34|38|43)\.$/);
  assert.notEqual(student.match(/is (\d+)\.$/)[1], worker.match(/is (\d+)\.$/)[1]);

  const parent = repairOne('Carlos wants a morning class while his daughter is at nursery.');
  assert.match(parent, /^Carlos wants a morning class while his daughter is at nursery\. Carlos is (29|33|36|41)\.$/);

  const retired = repairOne('Margaret is retired and wants a quiet morning class.');
  assert.match(retired, /^Margaret is retired and wants a quiet morning class\. Margaret is (64|67|70|72)\.$/);

  const olderCourse = 'This course is for adults aged 30 or over.';
  const nora = repairOne('Nora wants a morning class.', olderCourse);
  assert.match(nora, /^Nora wants a morning class\. Nora is (3\d|4\d)\.$/);
  assert.ok(Number(nora.match(/is (\d+)\.$/)[1]) >= 30);

  const idris = {
    questions: [{ number: 8, prompt: 'Idris is 22 and wants a morning class.' }],
    sections: [{ letter: 'F', text: olderCourse }],
    modelAnswers: [{ number: 8, answer: 'F' }],
  };
  assert.equal(repairB1Part2AdultProfiles(idris).questions[0].prompt, idris.questions[0].prompt);
  assert.ok(part2ProfileSupportProblems(idris).some((error) => error.includes('under 30')));

  const teenager = {
    questions: [{ number: 9, prompt: 'Aisha is a teenager and wants a Sunday morning activity.' }],
    sections: [{ letter: 'D', text: adultsOnly }],
    modelAnswers: [{ number: 9, answer: 'D' }],
  };
  assert.equal(repairB1Part2AdultProfiles(teenager).questions[0].prompt, teenager.questions[0].prompt);
  assert.ok(part2ProfileSupportProblems(teenager).some((error) => error.includes('young person')));

  const child = {
    questions: [{ number: 7, prompt: 'Tom is 15 and wants to plant trees on Sunday morning.' }],
    sections: [{ letter: 'B', text: 'This is a single morning for adults, not a weekly club.' }],
    modelAnswers: [{ number: 7, answer: 'B' }],
  };
  assert.equal(repairB1Part2AdultProfiles(child).questions[0].prompt, child.questions[0].prompt);
  assert.ok(part2ProfileSupportProblems(child).some((error) => error.includes('under 18')));

  const alreadyAdult = repairOne('Priya is an adult and wants a morning class.');
  assert.equal(alreadyAdult, 'Priya is an adult and wants a morning class.');
  assert.equal(part2ProfileSupportProblems({
    questions: [{ number: 6, prompt: alreadyAdult }],
    sections: [{ letter: 'C', text: adultsOnly }],
    modelAnswers: [{ number: 6, answer: 'C' }],
  }).length, 0);

  const family = repairOne('Dan wants a class he can do with his children.', 'Family pottery for adults and children.');
  assert.equal(family, 'Dan wants a class he can do with his children.');
});

test('B1 Part 1 and Part 5 catch copied wording, thin passages and unnatural frames', () => {
  const literal = part1LiteralOverlapProblems(
    [{
      number: 1,
      text: 'Please bring photo identification when you collect the medicine.',
      options: ['A) Bring identification when collecting the medicine.', 'B) Post the medicine.', 'C) Come after closing.'],
    }],
    [{ number: 1, answer: 'A' }],
  );
  assert.ok(literal.some((error) => error.includes('Q1')));

  const thin = part5CoherenceProblems('Eva kept a promise. She picked up the phone. She is good at listening. She made a mistake. She was nervous. She felt relief when the exam was over. '.repeat(2));
  assert.ok(thin.some((error) => /example sentences|connected passage|in view/.test(error)));
  const connected = 'Anna bought a coat because her old one was thin. It was warm and it fitted her well. She wore this coat to work the next day. Her friends noticed the coat at once. After lunch she left the coat on a chair. A colleague brought it back before she went home. The coat still looked new when she arrived at the office. She hung the coat by the door and smiled. '.repeat(2);
  const connectedErrors = part5CoherenceProblems(connected);
  assert.equal(connectedErrors.some((error) => /in view|example sentences/.test(error)), false);
  const words = connected.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  const eightySeven = `${words.slice(0, 87).join(' ')}.`;
  const shortErrors = part5CoherenceProblems(eightySeven);
  assert.ok(shortErrors.some((error) => error.includes('87 words')));
  assert.equal(shortErrors.some((error) => error.includes('in view')), false);
  const disconnected = 'The market sells fresh bread every morning. A football match starts at three. Students finish homework quietly. Rain delays the evening train. Visitors photograph the old bridge. The bakery closes at sunset. Swimmers leave the pool early. Gardeners plant flowers in spring. Painters choose bright colours. Drivers wait near the station. Children read comics upstairs. Cooks prepare soup carefully.';
  const disconnectedErrors = part5CoherenceProblems(disconnected);
  assert.ok(disconnectedErrors.some((error) => error.includes('in view')));
  const unnatural = part5UnnaturalFrameProblems('The new musical came out last Friday and the tickets went quickly.');
  assert.ok(unnatural.some((error) => error.includes('came out')));
  const bus = part5UnnaturalFrameProblems('Remember to get off the bus only after other passengers have got on.');
  assert.ok(bus.some((error) => error.includes('get off')));
  const lexical = selectB1Part5LexicalPlan({ examSlot: 6, history: [{ types: ['fixed collocation', 'phrasal/prepositional verb', 'dependent preposition/complementation', 'verb-noun collocation', 'fixed phrase', 'precise lexical choice'] }] });
  assert.equal(lexical.length, 6);
  assert.notDeepEqual(lexical.map((item) => item.type), ['fixed collocation', 'phrasal/prepositional verb', 'dependent preposition/complementation', 'verb-noun collocation', 'fixed phrase', 'precise lexical choice']);
});

test('quality evidence rejects real alternatives and accepts a single constrained answer', () => {
  const confidence = {
    questions: [{
      number: 25,
      options: ['A) boost', 'B) raise', 'C) increase', 'D) lift'],
    }],
  };
  const preference = part5EvidenceProblems(confidence, {
    optionJudgements: [{
      number: 25,
      options: [
        { letter: 'A', fits: true, defect: 'none', reason: 'natural collocation' },
        { letter: 'B', fits: false, defect: 'preference', reason: 'less common' },
        { letter: 'C', fits: false, defect: 'preference', reason: 'less idiomatic' },
        { letter: 'D', fits: false, defect: 'context', reason: 'lift does not fit this noun' },
      ],
    }],
  });
  assert.match(preference.join(' '), /more than one natural answer/);
  assert.match(preference.join(' '), /A \/ B \/ C/);

  const constrained = part5EvidenceProblems(confidence, {
    optionJudgements: [{
      number: 25,
      options: [
        { letter: 'A', fits: true, defect: 'none', reason: 'the only natural completion' },
        { letter: 'B', fits: false, defect: 'context', reason: 'incorrect preposition' },
        { letter: 'C', fits: false, defect: 'meaning', reason: 'different meaning' },
        { letter: 'D', fits: false, defect: 'context', reason: 'lift does not fit this noun' },
      ],
    }],
  });
  assert.deepEqual(constrained, []);

  const silent = part5EvidenceProblems(confidence, { optionJudgements: [], alternativeFits: [], verdict: 'pass' });
  assert.match(silent.join(' '), /review evidence is missing/);

  const bank = [{ id: 'quantifier', type: 'quantifier', words: ['many', 'several'] }];
  const cloze = {
    questions: [{ number: 27, grammarTarget: 'quantifier' }],
    modelAnswers: [{ number: 27, answer: 'many' }],
  };
  const judgedSeveral = {
    word: 'several',
    source: 'target-list',
    grammatical: true,
    sameMeaning: false,
    fitsContext: false,
    b1Appropriate: true,
    accept: false,
    reason: 'different meaning: the sentence asks for a large number',
  };
  const outside = {
    word: 'numerous',
    source: 'outside-list',
    grammatical: true,
    sameMeaning: true,
    fitsContext: true,
    b1Appropriate: false,
    accept: false,
    reason: 'the meaning fits but the word is more formal than B1',
  };
  assert.deepEqual(part6EvidenceProblems(cloze, {
    answers: [{ number: 27, alternatives: [], tested: [judgedSeveral, outside] }],
  }, bank), []);
  const acceptedSibling = part6EvidenceProblems(cloze, {
    answers: [{
      number: 27,
      alternatives: [],
      tested: [{ ...judgedSeveral, sameMeaning: true, fitsContext: true, accept: true }, outside],
    }],
  }, bank);
  assert.match(acceptedSibling.join(' '), /multiple ordinary answers/);
  const empty = part6EvidenceProblems(cloze, {
    answers: [{ number: 27, alternatives: [], tested: [] }],
  }, bank);
  assert.match(empty.join(' '), /review evidence is missing/);

  const weekend = part2ProfileSupportProblems({
    questions: [{ number: 7, prompt: 'Tom is 20 and wants a course that fits his weekend.' }],
    sections: [{ letter: 'D', text: 'A two-day cooking course for people aged 18 and over.' }],
    modelAnswers: [{ number: 7, answer: 'D' }],
  });
  assert.match(weekend.join(' '), /weekend/);
  const saturday = part2ProfileSupportProblems({
    questions: [{ number: 7, prompt: 'Tom is 20 and wants a Saturday course.' }],
    sections: [{ letter: 'D', text: 'The cooking course runs on Saturday for people aged 18 and over.' }],
    modelAnswers: [{ number: 7, answer: 'D' }],
  });
  assert.deepEqual(saturday, []);
  const tooYoung = part2ProfileSupportProblems({
    questions: [{ number: 8, prompt: 'Anna is 15 and wants an art class.' }],
    sections: [{ letter: 'G', text: 'Art classes for teenagers aged 16 to 18.' }],
    modelAnswers: [{ number: 8, answer: 'G' }],
  });
  assert.match(tooYoung.join(' '), /outside the keyed text/);

  assert.match(part2EvidenceProblems({
    questions: [{ number: 7, prompt: 'Needs a weekend.' }],
  }, { requirementEvidence: [] }).join(' '), /review evidence is missing/);
  assert.match(part2EvidenceProblems({
    questions: [{ number: 7, prompt: 'Needs a weekend.' }],
  }, {
    requirementEvidence: [{ number: 7, requirement: 'weekend', supported: false, reason: 'the text never names a weekend day' }],
  }).join(' '), /unsupported requirement/);

  assert.match(part3OptionFormatProblems([{
    number: 11,
    options: ['A) A. Walked along a path', 'B) Had lunch', 'C) Went fishing', 'D) Climbed later'],
  }]).join(' '), /repeats the answer letter/);
  assert.deepEqual(part3OptionFormatProblems([{
    number: 11,
    options: ['A) Walked along a path', 'B) Had lunch', 'C) Went fishing', 'D) Climbed later'],
  }]), []);
  const stated = part3EvidenceProblems({
    questions: [{ number: 12, questionType: 'inference', options: ['A) peaceful', 'B) bored'] }],
  }, {
    itemEvidence: [{
      number: 12,
      statedDirectly: true,
      certainty: 'certain',
      reason: 'the passage already says the day felt peaceful',
      options: [
        { letter: 'A', grounded: true, reason: 'copies the passage' },
        { letter: 'B', grounded: true, reason: 'reverses a stated feeling' },
      ],
    }],
  });
  assert.match(stated.join(' '), /explicit statement/);
  const inferred = part3EvidenceProblems({
    questions: [{ number: 12, questionType: 'inference', options: ['A) relieved', 'B) bored'] }],
  }, {
    itemEvidence: [{
      number: 12,
      statedDirectly: false,
      certainty: 'certain',
      reason: 'the reader has to connect two actions',
      options: [
        { letter: 'A', grounded: true, reason: 'follows from the decision to return' },
        { letter: 'B', grounded: false, reason: 'the passage never mentions boredom' },
      ],
    }],
  });
  assert.match(inferred.join(' '), /weak distractor/);

  assert.match(part4EvidenceProblems({
    gapEvidence: [
      { gap: 16, addsInformation: false, reason: 'it repeats the previous sentence' },
      { gap: 17, addsInformation: true, reason: 'it gives the cause of the next event' },
      { gap: 18, addsInformation: true, reason: 'it moves the time forward' },
      { gap: 19, addsInformation: true, reason: 'it names a result not yet stated' },
      { gap: 20, addsInformation: true, reason: 'it adds who continues the work' },
    ],
  }).join(' '), /weak cohesion at gap 16/);
  assert.deepEqual(part4EvidenceProblems({
    gapEvidence: [16, 17, 18, 19, 20].map((gap) => ({
      gap,
      addsInformation: true,
      reason: 'the sentence adds a new fact',
    })),
  }), []);

  assert.match(part1EvidenceProblems({
    questions: [{ number: 5, options: ['A) Clean the tables', 'B) Return the trays', 'C) Leave the food'] }],
  }, { verdict: 'pass', itemEvidence: [], weakDistractors: [] }).join(' '), /review evidence is missing/);

  const approval = b1ReviewApproval([]);
  assert.equal(approval.humanTeacherApproved, false);
  assert.equal(approval.linguisticallyUnambiguous, true);
  assert.equal(approval.pedagogicallySuitable, true);

  const frozen = path.join(root, 'diagnostics', 'b1-reading-motor', 'cache', 'exam-8', 'part-5.json');
  if (fs.existsSync(frozen)) {
    const saved = JSON.parse(fs.readFileSync(frozen, 'utf8'));
    assert.equal(saved.validation.semanticQuality.rubric.verdict, 'pass');
    assert.equal(saved.validation.semanticQuality.rubric.optionJudgements, undefined);
    const caught = part5EvidenceProblems(saved.payload.generated, saved.validation.semanticQuality.rubric);
    assert.match(caught.join(' '), /review evidence is missing/);
  }
});
