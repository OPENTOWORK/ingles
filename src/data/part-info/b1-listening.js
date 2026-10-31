import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Multiple choice (pictures)",
    "description": "You will hear seven short recordings (monologues or conversations). For each one there is a question and three pictures (A, B and C). You choose the picture that answers the question. You hear each recording twice.",
    "tips": "Before you listen, read the question and look at the three pictures; think of the English words for each one. Usually all three pictures are mentioned, so listen for the one that really answers the question (for example, what someone will do, not what they did).",
    "commonErrors": "Choosing the first picture you hear mentioned, missing a change of mind ('Actually, I'll bring…'), and confusing past and future"
  },
  "2": {
    "title": "Part 2: Multiple choice (short dialogues)",
    "description": "You will hear six short conversations. For each one you read a sentence that describes the situation and a question with three options. The questions focus on the speakers' feelings, opinions, agreement or purpose. You hear each conversation twice.",
    "tips": "Use the sentence about the situation to predict the topic. Listen to both speakers: many questions ask what they agree about or what one person thinks. The options say things in different words, so listen for meaning, not for exact words.",
    "commonErrors": "Choosing an option because you heard one of its words, listening to only one speaker when the question asks what they agree on, and not using the second listening to check"
  },
  "3": {
    "title": "Part 3: Gap fill (monologue)",
    "description": "You will hear one speaker (often a talk, an announcement or a radio programme) and complete six gaps in a set of notes or sentences. Each answer is one or two words, a number, a date or a time. You hear the recording twice.",
    "tips": "Read the notes before you listen and predict the type of word for each gap (a noun, a number, a day…). The information comes in the same order as the notes. Write the words you actually hear and check your spelling during the second listening.",
    "commonErrors": "Writing too many words, misspelling common words, writing a word that the speaker mentions but then corrects, and leaving a gap empty"
  },
  "4": {
    "title": "Part 4: Multiple choice (interview)",
    "description": "You will hear a longer interview, usually a radio interview with one guest, and answer six multiple-choice questions with three options. The questions test detail, opinions and attitudes. You hear the interview twice.",
    "tips": "Read the questions before you listen. They follow the order of the interview, and the interviewer's questions help you know which question you are on. Listen for the guest's opinions and reasons, not just facts.",
    "commonErrors": "Getting lost and answering the wrong question, choosing options with words you heard but a different meaning, and confusing what the interviewer says with what the guest says"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 9);
