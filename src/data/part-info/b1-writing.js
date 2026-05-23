import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Email",
    "description": "You will write an email (about 100 words) responding to a given situation. The task will tell you what information to include and who you are writing to. This tests your ability to write appropriate emails for different purposes and audiences.",
    "tips": "Read the task carefully to understand what you need to include. Use appropriate language for the situation and audience. Include all the required information. Use appropriate greetings and closings. Check your grammar, spelling, and punctuation.",
    "commonErrors": "Not including all the required information, using inappropriate language for the situation, not using appropriate greetings and closings, or making grammar and spelling mistakes"
  },
  "2": {
    "title": "Part 2: Article or story",
    "description": "You will choose to write either an article (about 100 words) or a story (about 100 words) based on a given topic. This tests your ability to write different types of texts and use appropriate language for different purposes.",
    "tips": "Choose the option you feel more confident about. Plan your writing before you start. Use appropriate language for the type of text you're writing. Include interesting details and examples. Check your grammar, spelling, and punctuation.",
    "commonErrors": "Not planning your writing first, not using appropriate language for the type of text, not including interesting details, or making grammar and spelling mistakes"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 7);
