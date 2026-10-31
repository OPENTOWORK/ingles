import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Multiple choice (three short extracts)",
    "description": "You will hear three short extracts from different situations. There are two questions for each extract, and you need to choose the best answer from three options (A, B, C). This tests your ability to understand gist, detail, opinion, attitude, and purpose in sophisticated listening texts.",
    "tips": "Read the questions and options before listening. Listen for the main points, specific information, and speakers' sophisticated attitudes and opinions. Choose answers based on the complete meaning and sophisticated context of what you hear. You will hear each extract twice.",
    "commonErrors": "Not reading the questions first, choosing answers based on individual words rather than understanding, or not using the second listening to check your answers"
  },
  "2": {
    "title": "Part 2: Sentence completion",
    "description": "You will hear a monologue (a talk, lecture, or broadcast) and see nine incomplete sentences. You need to complete each sentence with a word or short phrase that you hear in the recording. This tests your ability to follow longer, sophisticated listening texts and extract specific information.",
    "tips": "Read the incomplete sentences first to know what information you're looking for. Write the exact words you hear in the recording and check that each sentence is grammatically complete. Write clearly and check your spelling. You will hear the monologue twice.",
    "commonErrors": "Not reading the sentences first, paraphrasing instead of writing the words you hear, writing answers that don't fit the sentence grammatically, or not using the second listening to check your answers"
  },
  "3": {
    "title": "Part 3: Multiple choice (discussion)",
    "description": "You will hear an interview or discussion between two or more speakers and answer five multiple-choice questions with four options (A, B, C, D). The questions test your understanding of the speakers' sophisticated opinions, attitudes, and specific information. This tests your ability to understand longer, complex conversations and different speakers.",
    "tips": "Read the questions first to know what information you're looking for. Listen for the speakers' sophisticated opinions and attitudes as well as facts. Pay attention to all speakers' views and how they interact with sophisticated language. You will hear the recording twice.",
    "commonErrors": "Not reading the questions first, focusing only on facts rather than sophisticated opinions, or not paying attention to all speakers' views and complex interactions"
  },
  "4": {
    "title": "Part 4: Multiple matching (two tasks)",
    "description": "You will hear five short monologues on a related theme. While you listen, you complete two tasks: for each speaker, you choose one option from a list (A-H) in Task One and one option from another list (A-H) in Task Two. This tests your ability to understand gist, attitude, opinion, and the main points of different speakers.",
    "tips": "Read both lists of options before you listen. Use the first listening for one task and the second listening for the other, or answer both as you go. Listen for each speaker's main point and sophisticated attitude. Look for sophisticated paraphrasing and different ways of expressing the same idea. You will hear the recording twice.",
    "commonErrors": "Not reading both lists first, matching too quickly based on word similarity, or not understanding the complete sophisticated meaning of what each speaker says"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 10);
