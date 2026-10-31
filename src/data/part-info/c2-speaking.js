import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Interview",
    "description": "The examiner will ask each candidate questions about themselves: where they live, work or study, and how they spend their time. This part lasts about 2 minutes (3 minutes for groups of three). This tests your ability to use general social and interactional language clearly and fluently with sophisticated language.",
    "tips": "Answer each question completely and give detailed, sophisticated information. Use a wide range of vocabulary and complex grammar appropriate for C2 level. Express your opinions clearly and give detailed reasons for your views. Focus on communicating your ideas effectively and naturally.",
    "commonErrors": "Giving very short answers without details, not using a wide range of vocabulary and complex grammar, not expressing sophisticated opinions clearly, or being too nervous to communicate effectively"
  },
  "2": {
    "title": "Part 2: Collaborative task (pictures)",
    "description": "You and your partner first talk together about two of the pictures for about 1 minute. Then you look at all the pictures and work through a decision-making task for about 3 minutes. This tests your ability to exchange ideas, express and justify opinions, agree and disagree, speculate, evaluate, and reach a decision through negotiation.",
    "tips": "Listen to your partner's ideas and respond to them appropriately with sophisticated language. Speculate about the pictures and give detailed reasons for your opinions. Ask your partner for their views and build on what they say. Negotiate and try to reach a decision together; it is fine to keep different opinions. Use appropriate sophisticated language for discussion and negotiation.",
    "commonErrors": "Describing the pictures one by one instead of discussing them, not listening to your partner's ideas, not giving your own detailed opinions, not trying to negotiate, or not using appropriate sophisticated language for discussion"
  },
  "3": {
    "title": "Part 3: Long turn and discussion",
    "description": "Each candidate receives a card with a question and some ideas, and talks on their own for about 2 minutes. After each long turn, the examiner asks the other candidate a follow-up question and then invites both candidates to join in (about 1 minute). Finally, the examiner leads a discussion on the topic of the cards with both candidates. The whole part lasts about 10 minutes. This tests your ability to organise a longer piece of discourse, develop a topic, and express and justify opinions.",
    "tips": "Use the ideas on the card as a starting point and add your own. Organise your long turn with a short introduction, two or three developed points, and a brief conclusion. Give examples from your own experience and general knowledge. In the discussion, listen to your partner and build on their ideas with sophisticated language.",
    "commonErrors": "Stopping well before the 2 minutes, listing the ideas on the card without developing them, not answering the question on the card, or not engaging with your partner's ideas in the discussion"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 14);
