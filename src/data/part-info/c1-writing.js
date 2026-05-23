import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Essay",
    "description": "You will write an essay (220-260 words) giving your opinion on a given topic. You need to present sophisticated arguments for and against the topic and give your own detailed opinion. This tests your ability to write a formal essay with clear structure and sophisticated language.",
    "tips": "Plan your essay before you start writing. Use a clear structure: introduction, sophisticated arguments for, sophisticated arguments against, and conclusion. Use formal, sophisticated language appropriate for an essay. Include advanced linking words to connect your ideas. Give your own detailed opinion clearly. Check your grammar, spelling, and punctuation.",
    "commonErrors": "Not planning your essay first, not using a clear structure, not including sophisticated arguments, not giving your own detailed opinion, or making grammar and spelling mistakes"
  },
  "2": {
    "title": "Part 2: Article, email, letter, or report",
    "description": "You will choose to write one of four different types of texts (220-260 words) based on a given situation. This tests your ability to write different types of texts with appropriate sophisticated language, structure, and register for different purposes and audiences.",
    "tips": "Choose the option you feel most confident about. Read the task carefully to understand the purpose, audience, and required information. Use appropriate sophisticated language and register for the type of text. Include all the required information. Use appropriate greetings, closings, and structure. Check your grammar, spelling, and punctuation.",
    "commonErrors": "Not reading the task carefully, not using appropriate sophisticated language and register, not including all required information, not using appropriate structure, or making grammar and spelling mistakes"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 9);
