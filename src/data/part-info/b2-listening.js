import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Multiple choice (short extracts)",
    "description": "You will hear eight short extracts from different situations (conversations, announcements, interviews, etc.). For each extract, you need to choose the best answer from three options. This tests your ability to understand the main points, specific information, and speakers' attitudes in short listening texts.",
    "tips": "Read the questions and options before listening. Listen for the main points, specific information, and speakers' attitudes asked in each question. Don't choose answers based on just one word - understand the complete meaning and context. You will hear each extract twice.",
    "commonErrors": "Not reading the questions first, choosing answers based on individual words rather than understanding, or not using the second listening to check your answers"
  },
  "2": {
    "title": "Part 2: Sentence completion (monologue)",
    "description": "You will hear one longer monologue (a lecture, talk or interview-style speech, about 2½–3½ minutes) and see ten incomplete sentences numbered 9–18. Complete each gap with 1–3 words taken literally from the recording. The sentences paraphrase what you hear — the answers follow the order of the audio.",
    "tips": "Read all the sentences before you listen so you know what to expect. Write the exact words you hear (1–3 words only). The information appears in linear order — question 9 comes before question 10 in the audio. Check spelling on the second listen. Use capital letters for names and places.",
    "commonErrors": "Paraphrasing instead of copying exact words, writing more than 3 words, inferring an answer that was not said, or losing track because the sentences on screen do not match the audio word-for-word"
  },
  "3": {
    "title": "Part 3: Multiple matching",
    "description": "You will hear five short monologues (~30–35 seconds each) from different speakers on the same general topic. For questions 19–23, match each speaker to one of eight options (A–H). Each letter is used once; three options are distractors. This tests gist, attitude and paraphrase — not keyword matching.",
    "tips": "Read all eight options before the first speaker. Note the main point of each monologue, not one detail. Eliminate letters you are sure about after each speaker. Options paraphrase the audio — the exact words on screen rarely appear in the recording.",
    "commonErrors": "Matching on a single word from the audio, reusing a letter for two speakers, choosing an option that fits two speakers equally well, or picking a distractor that was mentioned but is not the speaker's main message"
  },
  "4": {
    "title": "Part 4: Multiple choice (interview / discussion)",
    "description": "You will hear one long interview or discussion (~3–4 minutes) between two or three speakers. For questions 24–30, choose the best answer (A, B or C). Questions test opinion, attitude, purpose and inference — not literal word-matching. You will hear the recording twice.",
    "tips": "Read each question before that section of the audio. Note who says what, especially agreement and disagreement. The correct option usually paraphrases the recording. Eliminate distractors that mention something true but do not answer the question.",
    "commonErrors": "Keyword matching from the audio, choosing an answer without listening, confusing which speaker holds which view, or picking an option that is partly true but not the best answer"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 10);