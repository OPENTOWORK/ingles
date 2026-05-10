/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function tasksForBlueprint(cefr, exam, parts) {
  const out = [];
  for (const p of parts) {
    out.push({
      title: `${cefr} Part ${p.part} — ${p.name}`,
      cefr,
      examType: exam,
      part: p.part,
      prompt: p.instructions,
      followUpQuestions: [p.name, 'Could you add a brief example?'],
      targetVocabulary: ['develop', 'opinion', 'prefer', 'reason'],
      timeLimitSec: p.suggestedTimeSec,
      taskType: p.taskType,
      published: true,
    });
  }
  return out;
}

const T = {
  INTERVIEW: 'INTERVIEW',
  LONG_TURN: 'LONG_TURN',
  COLLABORATIVE: 'COLLABORATIVE',
  DISCUSSION: 'DISCUSSION',
};

const A2 = {
  cefr: 'A2',
  exam: 'KEY',
  parts: [
    {
      part: 1,
      name: 'Interview',
      instructions: 'Answer questions about yourself and your daily life.',
      suggestedTimeSec: 120,
      taskType: T.INTERVIEW,
    },
    {
      part: 2,
      name: 'Discussion',
      instructions: 'Discuss a simple topic with the examiner.',
      suggestedTimeSec: 180,
      taskType: T.DISCUSSION,
    },
  ],
};

const B1 = {
  cefr: 'B1',
  exam: 'PET',
  parts: [
    {
      part: 1,
      name: 'Interview',
      instructions: 'Personal questions and habits.',
      suggestedTimeSec: 120,
      taskType: T.INTERVIEW,
    },
    {
      part: 2,
      name: 'Long turn',
      instructions: 'Describe photographs and compare them.',
      suggestedTimeSec: 180,
      taskType: T.LONG_TURN,
    },
    {
      part: 3,
      name: 'Collaborative',
      instructions: 'Work together on a decision.',
      suggestedTimeSec: 180,
      taskType: T.COLLABORATIVE,
    },
    {
      part: 4,
      name: 'Discussion',
      instructions: 'Follow-up on the collaborative topic.',
      suggestedTimeSec: 180,
      taskType: T.DISCUSSION,
    },
  ],
};

const B2 = {
  cefr: 'B2',
  exam: 'FIRST',
  parts: [
    {
      part: 1,
      name: 'Interview',
      instructions: 'Answer questions with reasons and examples.',
      suggestedTimeSec: 120,
      taskType: T.INTERVIEW,
    },
    {
      part: 2,
      name: 'Long turn',
      instructions: 'Individual long turn with prompt photos.',
      suggestedTimeSec: 240,
      taskType: T.LONG_TURN,
    },
    {
      part: 3,
      name: 'Collaborative',
      instructions: 'Negotiate a solution together.',
      suggestedTimeSec: 240,
      taskType: T.COLLABORATIVE,
    },
    {
      part: 4,
      name: 'Discussion',
      instructions: 'Further questions linked to Part 3.',
      suggestedTimeSec: 240,
      taskType: T.DISCUSSION,
    },
  ],
};

const C1 = {
  cefr: 'C1',
  exam: 'ADVANCED',
  parts: [
    {
      part: 1,
      name: 'Interview',
      instructions: 'Abstract and personal topics.',
      suggestedTimeSec: 150,
      taskType: T.INTERVIEW,
    },
    {
      part: 2,
      name: 'Long turn',
      instructions: 'Sophisticated long turn with evaluation.',
      suggestedTimeSec: 300,
      taskType: T.LONG_TURN,
    },
    {
      part: 3,
      name: 'Collaborative',
      instructions: 'Collaborative speculation and planning.',
      suggestedTimeSec: 300,
      taskType: T.COLLABORATIVE,
    },
    {
      part: 4,
      name: 'Discussion',
      instructions: 'Abstract follow-up and attitudes.',
      suggestedTimeSec: 300,
      taskType: T.DISCUSSION,
    },
  ],
};

const C2 = {
  cefr: 'C2',
  exam: 'PROFICIENCY',
  parts: [
    {
      part: 1,
      name: 'Interview',
      instructions: 'Challenging interview questions.',
      suggestedTimeSec: 180,
      taskType: T.INTERVIEW,
    },
    {
      part: 2,
      name: 'Long turn',
      instructions: 'Dense prompt requiring nuance and control.',
      suggestedTimeSec: 300,
      taskType: T.LONG_TURN,
    },
    {
      part: 3,
      name: 'Discussion',
      instructions: 'Advanced discourse and evaluation.',
      suggestedTimeSec: 300,
      taskType: T.DISCUSSION,
    },
  ],
};

async function main() {
  const all = [
    ...tasksForBlueprint(A2.cefr, A2.exam, A2.parts),
    ...tasksForBlueprint(B1.cefr, B1.exam, B1.parts),
    ...tasksForBlueprint(B2.cefr, B2.exam, B2.parts),
    ...tasksForBlueprint(C1.cefr, C1.exam, C1.parts),
    ...tasksForBlueprint(C2.cefr, C2.exam, C2.parts),
  ];

  for (const row of all) {
    await prisma.speakingTask.create({ data: row });
  }

  console.log(`Seeded ${all.length} speaking tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
