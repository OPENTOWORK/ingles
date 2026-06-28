import { sitePublicPath } from '@/utils/sitePublicPath';
import { getB2LongTurnPhotoUrls, B2_LONG_TURN_PHOTO_SETS } from '@/data/b2-speaking-long-turn-photos';
import type { B2SpeakingExamContent } from '@/features/speaking/domain/b2-speaking-exam-bank.types';

const PART1_QUESTION_COUNT = 5;

/**
 * Five fixed Part 1 interview questions per exam slot.
 * Each set spreads themes: work/studies, free time, home/hometown, travel/tech/daily life, future/opinion.
 */
const PART1_QUESTIONS_BY_SLOT: Record<number, string[]> = {
  1: [
    'Good morning. Can you tell me your full name, please?',
    'Do you work or are you a student at the moment?',
    'What do you enjoy doing in your free time?',
    'Can you tell me about the town or city where you live?',
    'Is there anything new you would like to learn in the future?',
  ],
  2: [
    'Good morning. Where are you from?',
    'What are you studying, or what kind of work do you do?',
    'How do you usually spend your weekends?',
    'Do you live in a house or a flat? Which do you prefer?',
    'Would you like to live in another country one day? Why or why not?',
  ],
  3: [
    'Good morning. Can you spell your surname for me, please?',
    'Tell me about your daily routine on a typical weekday.',
    'What kind of music, films or books do you like?',
    'How do people usually travel around your area?',
    'Do you think technology has changed daily life? In what way?',
  ],
  4: [
    'Good morning. Can you tell me your full name, please?',
    'What subject or job are you most interested in at the moment?',
    'Do you prefer doing sport indoors or outdoors? Why?',
    'What is the best thing about the place where you live?',
    'What are your plans for the next year or two?',
  ],
  5: [
    'Good morning. Where do you live at the moment?',
    'Do you work full-time, part-time or study?',
    'What hobby would you recommend to a friend?',
    'When did you last go on a trip or holiday?',
    'Is there a skill you would like to improve? Which one?',
  ],
  6: [
    'Good morning. Can you tell me your first name and where you are from?',
    'Are you working at the moment or preparing for exams?',
    'Who do you usually spend your free time with?',
    'How has your hometown changed in recent years?',
    'If you could change one thing about your daily life, what would it be?',
  ],
};

function part2ForSlot(slot: number): B2SpeakingExamContent['part2'] {
  const key = slot as keyof typeof B2_LONG_TURN_PHOTO_SETS;
  const meta = B2_LONG_TURN_PHOTO_SETS[key] ?? B2_LONG_TURN_PHOTO_SETS[1];
  const [imageA, imageB] = getB2LongTurnPhotoUrls(slot);
  return {
    imageA,
    imageB,
    prompt: meta.comparePrompt,
    examinerIntro:
      'Now, in this part I\'m going to give you a question and two photographs. ' +
      'I\'d like you to talk about them for about one minute. ' +
      'Here are your photographs. They show different ways of ' +
      `${String(meta.theme).toLowerCase()}.`,
    followUpQuestion:
      'Thank you. Now, which of these activities do you think would be more popular with young people? Why?',
  };
}

function part1ForSlot(slot: number): string[] {
  const slotKey = Math.min(6, Math.max(1, Number(slot) || 1));
  const questions = PART1_QUESTIONS_BY_SLOT[slotKey] ?? PART1_QUESTIONS_BY_SLOT[1];
  if (questions.length !== PART1_QUESTION_COUNT) {
    throw new Error(
      `B2 speaking exam slot ${slotKey} must have exactly ${PART1_QUESTION_COUNT} Part 1 questions.`,
    );
  }
  return questions;
}

function buildExam(slot: number, overrides: Partial<B2SpeakingExamContent>): B2SpeakingExamContent {
  const photoKey = slot as keyof typeof B2_LONG_TURN_PHOTO_SETS;
  const theme = B2_LONG_TURN_PHOTO_SETS[photoKey]?.theme ?? 'General';
  return {
    id: `b2-speaking-exam-${slot}`,
    cefr: 'B2',
    title: `B2 Speaking Exam ${slot}`,
    theme,
    examSlot: slot,
    estimatedDurationMinutes: 14,
    isActive: true,
    part1_questions: part1ForSlot(slot),
    part2: part2ForSlot(slot),
    part3: {
      examinerIntro:
        'Now, in this part of the test you are going to talk together. ' +
        'Here is a situation for you to discuss.',
      taskPrompt:
        `Your town wants to improve how people spend their free time related to ${theme.toLowerCase()}. ` +
        'Talk together about the different ideas and decide which one would be best for most people.',
      options: [
        'Build a new community centre',
        'Organise free outdoor events every month',
        'Create an online platform to share local activities',
        'Offer discounted classes for adults',
      ],
      partnerLines: [
        'I see your point, but I think the community centre is more practical because it affects people every day.',
        'That\'s true, but outdoor events might be cheaper and attract more families at first.',
        'Maybe we should choose the option that helps the widest range of age groups.',
      ],
      decisionQuestion:
        'So, which option do you both think would be best? Why?',
    },
    part4_questions: [
      `Why do you think ${theme.toLowerCase()} is important in modern life?`,
      'How has technology changed the way people spend their free time?',
      'Do you think young people and older people enjoy the same activities? Why or why not?',
      'What advice would you give someone who wants to make new friends in a new city?',
    ],
    ...overrides,
  };
}

/** Script bank: one full exam per levels slot 1–6. */
export const B2_SPEAKING_EXAM_BANK: B2SpeakingExamContent[] = [1, 2, 3, 4, 5, 6].map((slot) =>
  buildExam(slot, {}),
);

export function getB2SpeakingExamById(examId: string): B2SpeakingExamContent | null {
  return B2_SPEAKING_EXAM_BANK.find((e) => e.id === examId) ?? null;
}

export function getB2SpeakingExamBySlot(examSlot: number): B2SpeakingExamContent {
  const slot = Math.min(6, Math.max(1, Number(examSlot) || 1));
  return B2_SPEAKING_EXAM_BANK.find((e) => e.examSlot === slot) ?? B2_SPEAKING_EXAM_BANK[0];
}

export function listActiveB2SpeakingExams(): B2SpeakingExamContent[] {
  return B2_SPEAKING_EXAM_BANK.filter((e) => e.isActive);
}

/** Public asset paths for cached TTS (future); V1 uses visible text only. */
export function getExaminerAudioCacheKey(examId: string, partNumber: number, lineKey: string): string {
  return `${examId}-p${partNumber}-${lineKey}`;
}

export { sitePublicPath };
