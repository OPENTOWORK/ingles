import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Essay (summary of two texts)",
    "description": "You will read two short texts on the same topic and write an essay (240-280 words) summarising and evaluating the key points from both texts. You need to use your own words as far as possible and include your own ideas. This tests your ability to summarise, evaluate, and argue in a formal register with sophisticated language.",
    "tips": "Read both texts and underline the key points in each one. Plan your essay before you start writing: introduction, the key points of each text with your evaluation, and a conclusion with your own view. Paraphrase the ideas in your own words. Use advanced linking words to connect and contrast the two texts (whereas, by contrast, similarly). Check your grammar, spelling, and punctuation.",
    "commonErrors": "Copying phrases from the texts instead of paraphrasing, summarising only one of the texts, leaving out your own evaluation, writing outside the 240-280 word range, or making grammar and spelling mistakes"
  },
  "2": {
    "title": "Part 2: Article, letter, report or review",
    "description": "You will choose one of three tasks and write 280-320 words. The task can be an article, a letter, a report or a review, based on a given situation. This tests your ability to write different types of texts with appropriate sophisticated language, structure, and register for different purposes and audiences.",
    "tips": "Choose the option you feel most confident about. Read the task carefully to understand the purpose, audience, and required information. Use appropriate sophisticated language and register for the type of text. Include all the required information. Use appropriate greetings, closings, and structure. Check your grammar, spelling, and punctuation.",
    "commonErrors": "Not reading the task carefully, not using appropriate sophisticated language and register, not including all required information, not using appropriate structure, or making grammar and spelling mistakes"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 8);
