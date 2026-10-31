import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Interview",
    "description": "The examiner will ask you questions about yourself, your interests, and your experiences. You should answer clearly and give detailed, sophisticated information about your life, opinions, and future plans. This tests your ability to talk about personal topics and express your ideas clearly and fluently with sophisticated language.",
    "tips": "Answer each question completely and give detailed, sophisticated information. Use a wide range of vocabulary and complex grammar appropriate for C1 level. Express your opinions clearly and give detailed reasons for your views. Use sophisticated language and don't worry about making small mistakes - focus on communicating your ideas effectively.",
    "commonErrors": "Giving very short answers without details, not using a wide range of vocabulary and complex grammar, not expressing sophisticated opinions clearly, or being too nervous to communicate effectively"
  },
  "2": {
    "title": "Part 2: Long turn (three pictures)",
    "description": "You will see three pictures and talk about two of them for about one minute, answering the two questions printed above the pictures. Then you answer a short question about your partner's pictures for about 30 seconds. This tests your ability to speak at length, compare, speculate, and use sophisticated language for comparison.",
    "tips": "Choose the two pictures you have most to say about and read both questions before you start speaking. Compare them systematically: people, activities, settings, and feelings. Use sophisticated comparative language, speculate about the situations, and answer both printed questions. Give your sophisticated opinion. Don't worry about making small mistakes - focus on comparing effectively with advanced language.",
    "commonErrors": "Describing the pictures one by one instead of comparing them, answering only one of the two printed questions, not using sophisticated comparative language, or stopping too early without trying to speak for the full minute"
  },
  "3": {
    "title": "Part 3: Collaborative task",
    "description": "You and your partner will discuss a situation and make a decision together. You need to exchange sophisticated ideas, give detailed opinions, negotiate, and reach an agreement. This tests your ability to interact with another person, negotiate meaning, and work collaboratively with advanced language.",
    "tips": "Listen to your partner's ideas and respond to them appropriately with sophisticated language. Give your own detailed opinions and explain why you think that way. Ask sophisticated questions to clarify your partner's ideas. Negotiate and try to reach an agreement, but don't worry if you have different opinions. Use appropriate sophisticated language for discussion and negotiation.",
    "commonErrors": "Not listening to your partner's ideas, not giving your own detailed opinions, not asking sophisticated questions to clarify, not trying to negotiate, or not using appropriate sophisticated language for discussion"
  },
  "4": {
    "title": "Part 4: Discussion",
    "description": "You and your partner will discuss a topic related to the task from Part 3. You need to exchange sophisticated ideas, give detailed opinions, and discuss the topic in depth. This tests your ability to discuss abstract topics, express complex ideas, and engage in extended conversation with advanced language.",
    "tips": "Give detailed, sophisticated opinions and explain why you think that way. Listen to your partner's ideas and respond to them thoughtfully with advanced language. Use examples from your own experience and general knowledge. Engage with your partner's ideas and build on them with sophisticated language. Use appropriate language for discussion and debate.",
    "commonErrors": "Not giving detailed, sophisticated opinions, not responding thoughtfully to your partner's ideas, not using examples, not engaging with your partner, or not using appropriate sophisticated language for discussion"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 15);
