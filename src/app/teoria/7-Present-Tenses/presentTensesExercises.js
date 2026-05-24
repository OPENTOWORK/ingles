import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  multipleChoice: [
    {
      question: "Complete: 'I ___ in a hospital.'",
      options: ['am working', 'work', 'worked', 'have worked'],
      correctAnswer: 1,
      explanation: "A general fact or habitual job uses Present Simple: 'I work in a hospital.'",
    },
    {
      question: "Complete: 'She ___ to school every day.'",
      options: ['is going', 'goes', 'has gone', 'go'],
      correctAnswer: 1,
      explanation: "Daily routines use Present Simple. With 'she' we add -s: 'goes'.",
    },
    {
      question: "Complete: 'I ___ my homework right now.'",
      options: ['do', 'am doing', 'have done', 'did'],
      correctAnswer: 1,
      explanation: "'Right now' → action in progress → Present Continuous.",
    },
    {
      question: "Complete: 'How long ___ you ___ English?'",
      options: ['do, study', 'are, studying', 'have, studied', 'did, study'],
      correctAnswer: 2,
      explanation: 'Duration from past until now → Present Perfect.',
    },
    {
      question: "Complete: 'I ___ three cups of coffee today.'",
      options: ['drink', 'am drinking', 'have drunk', 'drank'],
      correctAnswer: 2,
      explanation: "'Today' (unfinished period) → Present Perfect.",
    },
  ],
  fillBlanks: [
    {
      text: 'He ___0___ football every Saturday.',
      blanks: [{ answer: 'plays' }],
    },
    {
      text: 'Look! The children ___0___ in the garden right now.',
      blanks: [{ answer: 'are playing' }],
    },
    {
      text: 'I ___0___ never ___1___ sushi before.',
      blanks: [{ answer: 'have' }, { answer: 'eaten' }],
    },
  ],
  trueFalse: [
    {
      statements: [
        {
          text: "'I am liking this movie' is correct.",
          isTrue: false,
          explanation: "'Like' is stative — use Present Simple: 'I like this movie.'",
        },
        {
          text: "'I have been to Paris' talks about a life experience.",
          isTrue: true,
          explanation: 'Present Perfect is used for experiences without a specific time.',
        },
        {
          text: "'I work here since 2020' is correct.",
          isTrue: false,
          explanation: "With 'since' use Present Perfect: 'I have worked here since 2020.'",
        },
      ],
    },
    {
      statements: [
        {
          text: 'Present Continuous can describe an action happening at this moment.',
          isTrue: true,
          explanation: "e.g. 'I am studying now.'",
        },
        {
          text: "'He is having a car' is the correct way to express possession.",
          isTrue: false,
          explanation: "'Have' for possession is not continuous. Say 'He has a car.'",
        },
        {
          text: "'Already' is commonly used with Present Perfect.",
          isTrue: true,
          explanation: "e.g. 'I have already finished.'",
        },
      ],
    },
  ],
  matching: [
    {
      title: 'Match the sentence to the tense',
      pairs: [
        { left: 'Water boils at 100°C', right: 'Present Simple' },
        { left: 'She is cooking dinner now', right: 'Present Continuous' },
        { left: 'We have lived here for five years', right: 'Present Perfect' },
        { left: 'He plays tennis on Fridays', right: 'Present Simple' },
      ],
      explanation: 'Facts and habits → Simple; now → Continuous; unfinished time / duration → Perfect.',
    },
    {
      title: 'Match the time expression to the tense',
      pairs: [
        { left: 'every morning', right: 'Present Simple' },
        { left: 'at the moment', right: 'Present Continuous' },
        { left: 'since 2019', right: 'Present Perfect' },
        { left: 'just', right: 'Present Perfect' },
      ],
      explanation: 'Time markers help you choose the right present tense.',
    },
  ],
  findError: [
    {
      title: 'Find the mistake',
      sentence: "She don't like spicy food.",
      options: ['She', "don't", 'like', 'spicy food'],
      correctIndex: 1,
      explanation: "With he/she/it use 'doesn't', not 'don't': 'She doesn't like…'",
    },
    {
      title: 'Find the mistake',
      sentence: 'I am know the answer.',
      options: ['I', 'am', 'know', 'the answer'],
      correctIndex: 1,
      explanation: "'Know' is stative. Remove 'am': 'I know the answer.'",
    },
    {
      title: 'Find the mistake',
      sentence: 'They have went to the cinema.',
      options: ['They', 'have', 'went', 'to the cinema'],
      correctIndex: 2,
      explanation: "After 'have' use the past participle: 'They have gone…'",
    },
  ],
  sentenceOrder: [
    {
      title: 'Order the words — Present Simple',
      words: ['She', 'usually', 'drinks', 'tea', 'in', 'the', 'morning'],
      explanation: "'Usually' + habit → Present Simple.",
    },
    {
      title: 'Order the words — Present Continuous',
      words: ['What', 'are', 'you', 'doing', 'right', 'now', '?'],
      explanation: 'Question in progress: be + subject + -ing.',
    },
    {
      title: 'Order the words — Present Perfect',
      words: ['I', 'have', 'never', 'seen', 'that', 'film'],
      explanation: 'Experience: have + past participle.',
    },
  ],
  selectAll: [
    {
      title: 'Select all Present Simple sentences',
      prompt: 'Tick every sentence that uses Present Simple correctly.',
      options: [
        { text: 'The Earth goes around the Sun.', isCorrect: true },
        { text: 'She is go to work at eight.', isCorrect: false },
        { text: "We eat lunch at one o'clock.", isCorrect: true },
        { text: 'They are live in Madrid.', isCorrect: false },
      ],
      explanation: "Facts and routines use the base form (with -s for he/she/it), not 'is + verb'.",
    },
    {
      title: 'Select all stative verbs (no Continuous)',
      prompt: 'Which verbs are normally NOT used in the Continuous?',
      options: [
        { text: 'know', isCorrect: true },
        { text: 'run', isCorrect: false },
        { text: 'believe', isCorrect: true },
        { text: 'swim', isCorrect: false },
        { text: 'want', isCorrect: true },
      ],
      explanation: 'Stative verbs (know, believe, want, like, need…) describe states, not actions in progress.',
    },
  ],
};

export function buildPresentTensesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('present-tenses', config, level, primaryLevel);
}
