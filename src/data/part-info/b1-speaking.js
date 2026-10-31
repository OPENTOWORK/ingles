import { extendPartInfoWithGlobalKeys } from '@/data/part-info/extendPartInfo';

const localPartInfo = {
  "1": {
    "title": "Part 1: Interview",
    "description": "The examiner asks each candidate questions about themselves: where they live, school or work, daily routine, free time, likes and dislikes. This part lasts 2–3 minutes and helps you settle into the test.",
    "tips": "Give full answers with a reason or an example ('I usually walk to school because it's only ten minutes from my house'). Use present, past and future forms. If you don't understand a question, ask the examiner to repeat it.",
    "commonErrors": "Giving one-word answers, reciting memorised speeches that don't answer the question, and speaking too quietly"
  },
  "2": {
    "title": "Part 2: Individual long turn (photo)",
    "description": "Each candidate talks on their own for about one minute about a colour photograph: the people, the place, what is happening and other things you can see. The two candidates' photos are on related topics.",
    "tips": "Start with a general sentence ('This photo shows a girl and a woman cooking in a kitchen'). Then describe the people, the actions, the place and other details. If you don't know a word, explain it ('a thing you use to…'). Use the present continuous and phrases like 'I think', 'It looks like' and 'Maybe'.",
    "commonErrors": "Stopping after a few sentences, only listing objects, long silences when you can't find a word, and talking about your partner's photo"
  },
  "3": {
    "title": "Part 3: Collaborative task",
    "description": "The examiner describes a situation and shows you pictures of different ideas or options. You and your partner talk together for 2–3 minutes about the options and decide which one is best.",
    "tips": "Talk about the options one by one and give reasons. Ask for your partner's opinion ('What do you think?', 'Do you agree?') and respond to what they say. You don't have to agree, but try to reach a decision at the end.",
    "commonErrors": "Talking only to the examiner, deciding too quickly, not giving reasons, and not listening or reacting to your partner"
  },
  "4": {
    "title": "Part 4: Discussion",
    "description": "The examiner asks questions related to the topic of Part 3. You give your opinions, talk about your own experiences and respond to your partner. Parts 3 and 4 together last about six minutes.",
    "tips": "Develop your answers with reasons and examples from your own life. Use phrases for agreeing and disagreeing, and add to your partner's ideas ('That's true, and also…').",
    "commonErrors": "Giving very short answers, not reacting to your partner, and repeating ideas from Part 3 without developing them"
  }
};

export const partInfo = extendPartInfoWithGlobalKeys(localPartInfo, 13);
