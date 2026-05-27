import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

/** Partes locales 1–5 = Cambridge A2 Key Listening; globales 8–12 (partMin 8). */
const localPartInfo = {
  1: {
    title: 'Part 1: Multiple choice (pictures)',
    description:
      'You will hear five short conversations. For each question there are three pictures (A, B and C). Choose the picture that best answers the question. This tests your ability to understand everyday spoken English and connect what you hear to visual information.',
    tips:
      'Look at all three pictures before each conversation starts. Listen for key words that describe the pictures, not just one word. The recording is played twice — use the second listen to check your answer.',
    commonErrors:
      'Choosing the first picture that matches a single word, not listening to the whole conversation, or confusing similar-looking pictures',
  },
  2: {
    title: 'Part 2: Gap-fill (monologue)',
    description:
      'You will hear a monologue (one speaker), for example an announcement or message. You complete five gaps with one word or a number in each gap. This tests your ability to listen for specific factual information.',
    tips:
      'Read the notes or form before you listen. Predict what type of word fits each gap (name, place, number, time). Write clearly. You hear the recording twice.',
    commonErrors:
      'Not reading the gaps first, writing more than one word when only one is required, or putting answers in the wrong gap',
  },
  3: {
    title: 'Part 3: Multiple choice (conversation)',
    description:
      'You will hear a longer conversation between two people. You answer five multiple-choice questions with three options (A, B and C) for each. This tests understanding of opinions, reasons and main points.',
    tips:
      'Read the questions before listening. Listen for attitudes and reasons, not only facts. Eliminate wrong options. Use the second listening to confirm.',
    commonErrors:
      'Reading questions too late, choosing an option because of one word only, or ignoring what the second speaker says',
  },
  4: {
    title: 'Part 4: Multiple choice (short extracts)',
    description:
      'You will hear five short recordings (dialogues or monologues). There is one multiple-choice question per recording with three options. This tests understanding of gist and detail in short spoken texts.',
    tips:
      'Each extract is separate — focus on the current question only. Listen for the main idea and specific details asked in the question. You hear each extract twice.',
    commonErrors:
      'Confusing information from a previous extract, not reading the question first, or selecting an answer too quickly',
  },
  5: {
    title: 'Part 5: Matching (long conversation)',
    description:
      'You will hear an informal conversation between two people (about 70 seconds). You match five people or items from the left list (questions 21–25) to eight options (A–H) on the right. Three options are not used. There is usually an example at the start. This tests listening for paraphrased information and dealing with distractors.',
    tips:
      'Use the 15 seconds before the audio: read the rubric (topic and speakers), the question (e.g. “What will each person bring?”), and all eight options — they are in alphabetical order. Cross out the example letter. Information follows the order of questions 21–25. Expect paraphrasing (different words from the options). Cross out letters as you use them. The recording is played twice.',
    commonErrors:
      'Not reading all eight options first, choosing an option because you hear the same word (distractor), matching before the speaker gives the correct information, or reusing a letter',
  },
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 8);
