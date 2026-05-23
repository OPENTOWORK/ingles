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
    "description": "You will hear a longer monologue (speech, interview, etc.) and see ten incomplete sentences. You need to complete each sentence with 1-3 words that you hear in the recording. This tests your ability to follow longer listening texts and extract specific information.",
    "tips": "Read the incomplete sentences first to know what information you're looking for. Listen for the exact words mentioned in the recording. Write clearly and check your spelling. Use capital letters for names and places. You will hear the monologue twice.",
    "commonErrors": "Not reading the sentences first, paraphrasing instead of writing exact words, writing more than 3 words, or not using the second listening to check your answers"
  },
  "3": {
    "title": "Part 3: Multiple choice (conversation)",
    "description": "You will hear a conversation between two or more speakers and answer five multiple-choice questions about it. The questions test your understanding of the speakers' opinions, attitudes, and specific information. This tests your ability to understand longer conversations and different speakers.",
    "tips": "Read the questions first to know what information you're looking for. Listen for the speakers' opinions and attitudes, not just facts. Pay attention to all speakers' views and how they interact. You will hear the conversation twice.",
    "commonErrors": "Not reading the questions first, focusing only on facts rather than opinions, or not paying attention to all speakers' views and interactions"
  },
  "4": {
    "title": "Part 4: Multiple choice (multiple speakers)",
    "description": "You will hear five different speakers talking about the same topic. You need to match each speaker to one of eight options (A-H). Each option is used once, and some options may not be used. This tests your ability to understand different speakers' views and match them to specific options.",
    "tips": "Read all the options first to understand what you're looking for. Listen for each speaker's main point and attitude. Look for paraphrasing and different ways of expressing the same idea. Don't match too quickly based on individual words - understand the complete meaning.",
    "commonErrors": "Not reading all the options first, matching too quickly based on word similarity, or not understanding the complete meaning of what each speaker says"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 10);