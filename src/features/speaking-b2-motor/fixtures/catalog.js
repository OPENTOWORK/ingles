/** Synthetic B2 Part 1 fixtures. Not authentic student recordings. */

export const SPEAKING_B2_FIXTURE_AUTHENTICITY = 'synthetic-technical';

export const SPEAKING_B2_FIXTURES = [
  {
    id: 'name-developed',
    questionId: 'SP-EX001-P1-INTRO',
    question: 'And what is your name?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: 'My name is Alex Rivera.',
    knownIssues: [],
    strengths: ['Answers the opening question clearly.'],
    expectedIssueCodes: [],
    durationMs: 2200,
  },
  {
    id: 'q01-developed',
    questionId: 'SP-EX001-P1-Q01',
    question: 'What do you enjoy most about studying English?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.',
    knownIssues: [],
    strengths: ['Developed answer with a reason and an example.'],
    expectedIssueCodes: [],
    durationMs: 9000,
  },
  {
    id: 'q02-articles',
    questionId: 'SP-EX001-P1-Q02',
    question: 'How do you usually spend your weekends?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'At the weekend I usually visit the my family and we cook a dinner together. After that I go to the park if the weather is good.',
    knownIssues: ['the my family', 'a dinner'],
    strengths: ['Gives a routine and a second idea.'],
    expectedIssueCodes: ['GR-AR'],
    durationMs: 8000,
  },
  {
    id: 'q03-tenses',
    questionId: 'SP-EX001-P1-Q03',
    question: 'Do you prefer visiting new places or returning to places you know? Why?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'Last year I go to a new city and I enjoy it a lot. I prefer visiting new places because I like discovering different food and streets.',
    knownIssues: ['Last year I go', 'I enjoy it a lot'],
    strengths: ['States a preference and a reason.'],
    expectedIssueCodes: ['GR-VT'],
    durationMs: 8500,
  },
  {
    id: 'q04-vocabulary',
    questionId: 'SP-EX001-P1-Q04',
    question: 'How has technology changed the way you communicate with your friends?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'Technology has changed a lot because now I make messages all the time and I do a video call instead of meeting. It is more comfortable but also more superficial.',
    knownIssues: ['make messages', 'do a video call'],
    strengths: ['Compares past and present communication.'],
    expectedIssueCodes: ['VC-CO', 'VC-WW'],
    durationMs: 9000,
  },
  {
    id: 'q05-short',
    questionId: 'SP-EX001-P1-Q05',
    question: 'Is there a new skill you would like to learn in the future?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: 'Yes.',
    knownIssues: ['Answer is too short to develop the idea.'],
    strengths: [],
    expectedIssueCodes: ['DM-EL'],
    durationMs: 800,
  },
  {
    id: 'q02-repetition',
    questionId: 'SP-EX001-P1-Q02',
    question: 'How do you usually spend your weekends?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'I like weekends. I like weekends because I like relaxing and I like seeing my friends. I like it a lot and I like doing the same things.',
    knownIssues: ['like repeated throughout'],
    strengths: ['Stays on the weekend topic.'],
    expectedIssueCodes: ['VC-RP'],
    durationMs: 7000,
  },
  {
    id: 'q03-hesitation',
    questionId: 'SP-EX001-P1-Q03',
    question: 'Do you prefer visiting new places or returning to places you know? Why?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'Um, I do not know, uh, maybe new places, um, because, uh, they are interesting, I think.',
    knownIssues: ['um / uh hesitation', 'thin development'],
    strengths: ['Eventually states a preference.'],
    expectedIssueCodes: ['FL-HP', 'DM-EL'],
    durationMs: 6500,
  },
  {
    id: 'q04-irrelevant',
    questionId: 'SP-EX001-P1-Q04',
    question: 'How has technology changed the way you communicate with your friends?',
    kind: 'speech',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript:
      'I really like cooking pasta at home and on Sundays I bake a cake for my family. The recipe is simple and everyone enjoys it.',
    knownIssues: ['Answer is not about technology or communication.'],
    strengths: [],
    expectedIssueCodes: ['DM-RV'],
    durationMs: 7000,
  },
  {
    id: 'unintelligible-noise',
    questionId: 'SP-EX001-P1-Q01',
    question: 'What do you enjoy most about studying English?',
    kind: 'non-linguistic',
    audioFile: 'non-linguistic-tone.wav',
    mimeType: 'audio/wav',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: '[inaudible]',
    knownIssues: ['Audio is not intelligible.'],
    strengths: [],
    expectedIssueCodes: [],
    durationMs: 1600,
    expectUncertain: true,
  },
  {
    id: 'empty-audio',
    questionId: 'SP-EX001-P1-Q02',
    question: 'How do you usually spend your weekends?',
    kind: 'empty',
    audioFile: 'empty.wav',
    mimeType: 'audio/wav',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: '',
    knownIssues: [],
    strengths: [],
    expectedIssueCodes: [],
    durationMs: 0,
    expectedAudioCode: 'AUDIO_EMPTY',
  },
  {
    id: 'invalid-format',
    questionId: 'SP-EX001-P1-Q03',
    question: 'Do you prefer visiting new places or returning to places you know? Why?',
    kind: 'invalid',
    audioFile: 'corrupt.bin',
    mimeType: 'application/octet-stream',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: '',
    knownIssues: [],
    strengths: [],
    expectedIssueCodes: [],
    durationMs: 0,
    expectedAudioCode: 'AUDIO_FORMAT',
  },
  {
    id: 'too-long',
    questionId: 'SP-EX001-P1-Q04',
    question: 'How has technology changed the way you communicate with your friends?',
    kind: 'too-long',
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    referenceTranscript: '',
    knownIssues: [],
    strengths: [],
    expectedIssueCodes: [],
    durationMs: 0,
    expectedAudioCode: 'AUDIO_TOO_LONG',
  },
];

export const SPEAKING_B2_FIXTURE_PACKS = {
  'full-mixed': [
    'name-developed',
    'q01-developed',
    'q02-articles',
    'q03-tenses',
    'q04-vocabulary',
    'q05-short',
  ],
  'edge-cases': ['empty-audio', 'invalid-format', 'too-long', 'unintelligible-noise'],
};

export function getSpeakingB2Fixture(id) {
  return SPEAKING_B2_FIXTURES.find((item) => item.id === id) || null;
}

export function listSpeakingB2FixturePack(packId = 'full-mixed') {
  const ids = SPEAKING_B2_FIXTURE_PACKS[packId] || [];
  return ids.map((id) => getSpeakingB2Fixture(id)).filter(Boolean);
}

export function publicSpeakingB2FixtureCatalog() {
  return {
    authenticity: SPEAKING_B2_FIXTURE_AUTHENTICITY,
    warning: 'Synthetic technical audio. Not authentic student recordings.',
    fixtures: SPEAKING_B2_FIXTURES.map((item) => ({
      id: item.id,
      questionId: item.questionId,
      question: item.question,
      kind: item.kind,
      sourceKind:
        item.kind === 'speech'
          ? 'synthetic'
          : item.kind === 'empty'
            ? 'empty'
            : item.kind === 'invalid'
              ? 'corrupt'
              : 'non-linguistic',
      authenticity: item.authenticity,
      humanRecording: false,
      durationMs: item.durationMs,
      expectedAudioCode: item.expectedAudioCode || null,
    })),
    packs: Object.keys(SPEAKING_B2_FIXTURE_PACKS),
  };
}
