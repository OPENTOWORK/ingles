/**
 * Controlled reliability set for validateB1ReadingQuality.
 * The wording of the Exam 8 cases is copied from the frozen candidate.
 * This module does not read or write that cache.
 *
 * callsExpected is the production path when the reviewer behaves as the case predicts.
 * callsCeiling adds the Part 5 adjudication call when a valid item is falsely disputed.
 * There is no retry loop in this evaluation.
 */
export const RELIABILITY_CASES = [
  {
    id: 'p5-invalid-exam8',
    partNumber: 5,
    callsExpected: 3,
    callsCeiling: 3,
    outcome: 'fail',
    explanation: 'Exam 8 Q24 accepts stick and keep. Q25 accepts boost and increase. Raise is weaker. Lift is not a natural completion. The part must fail, and the recorded evidence must keep both real alternatives.',
    mustDetect: [
      { number: 24, letters: ['B', 'C'], words: ['stick', 'keep'] },
      { number: 25, letters: ['A', 'C'], words: ['boost', 'increase'] },
    ],
    generated: {
      title: 'Choosing the Right Outfit',
      passage: "When it comes to fashion, everyone has their own (21) ___. Some people prefer casual clothes, while others enjoy dressing up for special occasions. It's important to (22) ___ the right choice when selecting an outfit, as it can affect how you feel throughout the day. Many people are conscious (23) ___ the latest trends and try to keep up with them. However, it's also essential to (24) ___ to what suits you best. For instance, if you feel comfortable in bright colours, don't hesitate to wear them. A well-chosen outfit can (25) ___ your confidence and make you feel great. Remember, the key to a (26) ___ look is to wear what makes you happy and comfortable.",
      questions: [
        { number: 21, options: ['A) style', 'B) fashion', 'C) trend', 'D) design'] },
        { number: 22, options: ['A) do', 'B) take', 'C) make', 'D) create'] },
        { number: 23, options: ['A) about', 'B) for', 'C) with', 'D) of'] },
        { number: 24, options: ['A) stay', 'B) stick', 'C) keep', 'D) hold'] },
        { number: 25, options: ['A) boost', 'B) raise', 'C) increase', 'D) lift'] },
        { number: 26, options: ['A) effective', 'B) efficient', 'C) successful', 'D) productive'] },
      ],
      modelAnswers: [
        { number: 21, answer: 'A' },
        { number: 22, answer: 'C' },
        { number: 23, answer: 'D' },
        { number: 24, answer: 'B' },
        { number: 25, answer: 'A' },
        { number: 26, answer: 'C' },
      ],
    },
  },
  {
    id: 'p5-valid-single-answer',
    partNumber: 5,
    callsExpected: 2,
    callsCeiling: 3,
    outcome: 'pass',
    explanation: 'Each gap is a fixed pattern with one idiomatic completion. The other three options are ungrammatical or the wrong collocation in that sentence, not merely less common synonyms.',
    mustDetect: [],
    generated: {
      title: 'The delayed train',
      passage: 'I am looking forward (21) ___ seeing you on Friday. The children are interested (22) ___ the old trains. I am capable (23) ___ explaining the delay when we meet. The ticket price depends (24) ___ the day you travel. This bag belongs (25) ___ me, so please keep it with you. After the trip we can be good (26) ___ telling the story.',
      questions: [
        { number: 21, options: ['A) to', 'B) for', 'C) at', 'D) on'] },
        { number: 22, options: ['A) in', 'B) on', 'C) at', 'D) for'] },
        { number: 23, options: ['A) for', 'B) of', 'C) to', 'D) at'] },
        { number: 24, options: ['A) of', 'B) in', 'C) on', 'D) at'] },
        { number: 25, options: ['A) for', 'B) with', 'C) to', 'D) at'] },
        { number: 26, options: ['A) in', 'B) on', 'C) of', 'D) at'] },
      ],
      modelAnswers: [
        { number: 21, answer: 'A' },
        { number: 22, answer: 'A' },
        { number: 23, answer: 'B' },
        { number: 24, answer: 'C' },
        { number: 25, answer: 'C' },
        { number: 26, answer: 'D' },
      ],
    },
  },
  {
    id: 'p6-invalid-exam8',
    partNumber: 6,
    callsExpected: 1,
    callsCeiling: 1,
    outcome: 'fail',
    explanation: 'Exam 8 accepts several as well as many, remained as well as been, the as well as their, and yet as well as but. In and up are single-word gaps and are not required failures.',
    mustDetect: [
      { number: 27, words: ['many', 'several'] },
      { number: 29, words: ['been', 'remained'] },
      { number: 30, words: ['their', 'the'] },
      { number: 32, words: ['but', 'yet'] },
    ],
    generated: {
      title: 'Protecting Our Forests',
      passage: 'Forests are home to (27) ___ species of plants and animals. They play a crucial role (28) ___ maintaining the Earth\'s climate. However, deforestation has (29) ___ a major issue for decades. People cut down trees for (30) ___ wood and to make space for agriculture. To combat this, we need to come (31) ___ with sustainable solutions. Planting new trees is essential, (32) ___ it is not enough. We must also protect existing forests.',
      questions: [
        { number: 27, grammarTarget: 'quantifier' },
        { number: 28, grammarTarget: 'preposition' },
        { number: 29, grammarTarget: 'verb form' },
        { number: 30, grammarTarget: 'pronoun' },
        { number: 31, grammarTarget: 'phrasal verb' },
        { number: 32, grammarTarget: 'conjunction' },
      ],
      modelAnswers: [
        { number: 27, answer: 'many' },
        { number: 28, answer: 'in' },
        { number: 29, answer: 'been' },
        { number: 30, answer: 'their' },
        { number: 31, answer: 'up' },
        { number: 32, answer: 'but' },
      ],
    },
  },
  {
    id: 'p6-valid-single-answer',
    partNumber: 6,
    callsExpected: 1,
    callsCeiling: 1,
    outcome: 'pass',
    explanation: 'since, to, than, of, at and for are fixed by the following words. The other words on each target list do not keep both the grammar and the meaning.',
    mustDetect: [],
    generated: {
      title: 'A letter after the trip',
      passage: 'I have lived here (27) ___ 2019. The letter was addressed (28) ___ the manager. The view was better (29) ___ we expected. A lot (30) ___ students joined the walk. Maya smiled (31) ___ her brother. She thanked him (32) ___ the map.',
      questions: [
        { number: 27, grammarTarget: 'preposition' },
        { number: 28, grammarTarget: 'preposition' },
        { number: 29, grammarTarget: 'comparative' },
        { number: 30, grammarTarget: 'preposition' },
        { number: 31, grammarTarget: 'preposition' },
        { number: 32, grammarTarget: 'preposition' },
      ],
      modelAnswers: [
        { number: 27, answer: 'since' },
        { number: 28, answer: 'to' },
        { number: 29, answer: 'than' },
        { number: 30, answer: 'of' },
        { number: 31, answer: 'at' },
        { number: 32, answer: 'for' },
      ],
    },
  },
  {
    id: 'p2-unsupported-weekend',
    partNumber: 2,
    callsExpected: 1,
    callsCeiling: 1,
    outcome: 'fail',
    explanation: 'Tom needs a weekend course. The keyed cooking text gives his age and the subject, but it never makes a weekend possible. The other four matches do support their stated day or time.',
    mustDetect: [{ number: 7, requirement: 'weekend' }],
    generated: part2Generated('A two-day cooking course for people aged 18 and over. It runs from 9 am to 3 pm, and students must bring an apron.'),
  },
  {
    id: 'p2-supported-weekend',
    partNumber: 2,
    callsExpected: 1,
    callsCeiling: 1,
    outcome: 'pass',
    explanation: 'The same profile is kept, and the cooking text now runs on Saturday and Sunday, so every stated requirement is possible.',
    mustDetect: [],
    generated: part2Generated('A two-day cooking course for people aged 18 and over. It runs on Saturday and Sunday from 9 am to 3 pm, and students must bring an apron.'),
  },
  {
    id: 'p3-false-inference',
    partNumber: 3,
    callsExpected: 2,
    callsCeiling: 2,
    outcome: 'fail',
    explanation: 'Question 12 is labelled inference, but the passage already says the writer felt completely relaxed. That is a stated fact, not a conclusion.',
    mustDetect: [{ number: 12, explicitStatement: true }],
    generated: {
      title: 'Saturday by the river',
      passage: 'Last Saturday I left the city and walked by a river. The water was quiet and I felt completely relaxed. I met an old friend, thanked her for the tea, and then climbed the hill. From the top I could see the fields. I went home in the evening, glad that I had taken a break.',
      questions: [
        { number: 11, questionType: 'detail', prompt: 'What did the writer do first?', options: ['A) Walked by a river', 'B) Climbed a hill', 'C) Took a train', 'D) Cooked a meal'] },
        { number: 12, questionType: 'inference', prompt: 'How did the writer feel by the river?', options: ['A) Relaxed', 'B) Bored', 'C) Angry', 'D) Frightened'] },
        { number: 13, questionType: 'attitude', prompt: 'How did the writer treat the friend?', options: ['A) She thanked her', 'B) She avoided her', 'C) She argued with her', 'D) She forgot her'] },
        { number: 14, questionType: 'detail', prompt: 'What could the writer see from the hill?', options: ['A) The fields', 'B) The sea', 'C) A station', 'D) A hospital'] },
        { number: 15, questionType: 'gist', prompt: 'What is the writer doing in the whole text?', options: ['A) Describing a calm day out of the city', 'B) Explaining how to climb a hill', 'C) Complaining about a friend', 'D) Giving advice about trains'] },
      ],
      modelAnswers: [
        { number: 11, answer: 'A' },
        { number: 12, answer: 'A' },
        { number: 13, answer: 'A' },
        { number: 14, answer: 'A' },
        { number: 15, answer: 'A' },
      ],
    },
  },
  {
    id: 'p4-redundant-sentence',
    partNumber: 4,
    callsExpected: 2,
    callsCeiling: 2,
    outcome: 'fail',
    explanation: 'Sentence A repeats the previous statement that Mia baked bread every morning. The other keyed sentences add a person, a purchase, a prize or a time that the neighbours do not already state.',
    mustDetect: [{ gap: 16, redundant: true }],
    generated: {
      title: 'Mia\'s bakery',
      passage: 'Mia opened a small bakery in the town. She baked bread every morning. (16) ___ After a year her brother joined her at weekends. (17) ___ They used the extra money to buy a new oven. (18) ___ Last spring the bakery won a local prize. (19) ___ Mia now teaches a Saturday class for adults. (20) ___',
      sentencePool: [
        'A) She baked bread every morning for her customers.',
        'B) The railway station had closed many years earlier.',
        'C) The prize was for the best new shop in the area.',
        'D) A football team won the cup that winter.',
        'E) Those lessons start at ten and last two hours.',
        'F) He had worked in a hotel kitchen before.',
        'G) The river flooded the market in June.',
        'H) The oven arrived before the busy summer.',
      ],
      modelAnswers: [
        { number: 16, answer: 'A' },
        { number: 17, answer: 'F' },
        { number: 18, answer: 'H' },
        { number: 19, answer: 'C' },
        { number: 20, answer: 'E' },
      ],
    },
  },
];

function part2Generated(cookingText) {
  return {
    questions: [
      { number: 6, prompt: 'Sophie is 10 and wants a Saturday morning dance class with other children.' },
      { number: 7, prompt: 'Tom is 20 and wants an intensive cooking course that fits his weekend.' },
      { number: 8, prompt: 'Anna is 15 and wants a Saturday afternoon art class that costs £15.' },
      { number: 9, prompt: 'James is 18 and wants a one-day cycling activity for his age.' },
      { number: 10, prompt: 'Emily is 35 and wants an evening photography class after work.' },
    ],
    sections: [
      { letter: 'A', text: 'Dance for children aged 8 to 12, every Saturday from 11 am to 1 pm.' },
      { letter: 'B', text: 'Yoga for adults every Friday at 10 am. Please bring a mat.' },
      { letter: 'C', text: 'A one-day cycling ride for people over 16. The group leaves at 9 am.' },
      { letter: 'D', text: cookingText },
      { letter: 'E', text: 'Pottery for all ages on Sunday from 10 am to 4 pm. Materials are included.' },
      { letter: 'F', text: 'Photography for adults on Wednesday at 6:30 pm. A camera is provided.' },
      { letter: 'G', text: 'Art for teenagers aged 13 to 17 on Saturday afternoon. The fee is £15.' },
      { letter: 'H', text: 'Gardening for anyone over 12 on Tuesday from 2 pm to 4 pm.' },
    ],
    modelAnswers: [
      { number: 6, answer: 'A' },
      { number: 7, answer: 'D' },
      { number: 8, answer: 'G' },
      { number: 9, answer: 'C' },
      { number: 10, answer: 'F' },
    ],
  };
}

export function reliabilityCallPlan(cases = RELIABILITY_CASES) {
  const callsExpected = cases.reduce((sum, item) => sum + item.callsExpected, 0);
  const callsCeiling = cases.reduce((sum, item) => sum + item.callsCeiling, 0);
  return { cases: cases.length, callsExpected, callsCeiling };
}
