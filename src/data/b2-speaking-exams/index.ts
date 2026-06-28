import { sitePublicPath } from '@/utils/sitePublicPath';
import { getB2LongTurnPhotoUrls, B2_LONG_TURN_PHOTO_SETS } from '@/data/b2-speaking-long-turn-photos';
import type { B2SpeakingExamContent } from '@/features/speaking/domain/b2-speaking-exam-bank.types';

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
    part1_questions: [
      'Good morning. Can you tell me your full name, please?',
      'Where do you live at the moment?',
      'What do you enjoy doing in your free time?',
      'How long have you been learning English?',
      'Is there anything you would like to study or learn in the future?',
      'Do you prefer spending time alone or with other people? Why?',
    ],
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
