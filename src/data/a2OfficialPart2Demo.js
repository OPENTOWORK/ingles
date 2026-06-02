import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

const TASHA_TEXT =
  "Last year I wrote for my college magazine, which I found really difficult, but I don't think it's hard to write a good blog. Mine is about things from daily life that make me laugh. My older brother also has a blog, but we're writing about different subjects. We don't discuss what we're planning, but we read each other's blogs sometimes. I like giving advice to people who write in asking for it – it's good to know I've helped.";

const DANNI_TEXT =
  "I started writing my popular film blog because I love movies. I like it when readers send me articles by email about a film they've seen, and I put these on my blog for everyone to read. I'm still at college, so I'm careful about spending too long on my blog, which is difficult as writing well takes time. I don't think I'll write it for much longer. I'm busy, and it's time to do something new.";

const CHRISSIE_TEXT =
  "I began writing on a school magazine. I stopped after a few years, but I missed it, so I started my own – I'm still writing it now! The blog's new for me, and I write about daily life. I get ideas from friends or my sister when I can't decide what to write about – we always think of something interesting, sad or serious. At first, almost nobody visited my site, but now more do. I've had some lovely comments.";

export const A2_OFFICIAL_PART2_DEMO = {
  directions: `Part 2\n\n${A2_RW_DIRECTIONS[2]}`,
  passageText: `Young blog writers\n\nA) Tasha\n${TASHA_TEXT}\n\nB) Danni\n${DANNI_TEXT}\n\nC) Chrissie\n${CHRISSIE_TEXT}`,
  items: [
    {
      questionNumber: 7,
      prompt: 'Who writes both a magazine and a blog?',
      correctLetter: 'C',
    },
    {
      questionNumber: 8,
      prompt: 'Who says that studying and writing a blog at the same time can be hard?',
      correctLetter: 'B',
    },
    {
      questionNumber: 9,
      prompt: 'Who answers questions from other people who read her blog?',
      correctLetter: 'A',
    },
    {
      questionNumber: 10,
      prompt: 'Who plans to stop writing her blog soon?',
      correctLetter: 'B',
    },
    {
      questionNumber: 11,
      prompt: "Who didn't have many people reading her blog in the beginning?",
      correctLetter: 'C',
    },
    {
      questionNumber: 12,
      prompt: 'Who asks a member of her family to help her write her blog?',
      correctLetter: 'C',
    },
    {
      questionNumber: 13,
      prompt: 'Who says writing a blog is easier than some other types of writing?',
      correctLetter: 'A',
    },
  ],
};

export function buildA2Part2GroupsFromDemoItems(items = []) {
  const letters = ['A', 'B', 'C'];
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    prompt: item.prompt,
    questionStem: item.prompt,
    options: letters.map((letter) => ({
      id: `a2-p2-demo-${item.questionNumber}-${letter}`,
      respuesta: `${item.questionNumber} ${letter}`,
      formattedText: letter,
      correcta: letter === item.correctLetter,
    })),
  }));
}

export function isA2Part2DemoEmpty({ enunciado = '', respuestasCount = 0, part2GroupCount = 0 }) {
  if (Number(part2GroupCount) >= 7) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 7;
  return !(hasEnunciado && hasAnswers);
}
