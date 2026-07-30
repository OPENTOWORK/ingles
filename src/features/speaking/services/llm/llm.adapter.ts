import type OpenAI from 'openai';
import {
  cambridgeSpeakingExaminerTurn,
  getDraloFastModel,
  getDraloOpenAI,
  mergeDraloSystem,
} from '@/lib/draloAiEngine';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import type { ExamPartDefinition } from '../../domain/types';
import type { MicroFeedback } from '../../domain/types';
import { SYSTEM_PROMPTS } from '../../../../../dralo-speaking/prompts/cambridge-prompts';
import {
  B2_PART_1_OPENING_USER_MESSAGE,
  buildB2ExaminerSystemPrompt,
  buildB2Part1TurnUserMessage,
  resolveB2Part1ExaminerReply,
} from '../../domain/b2-examiner-prompts';
import { B2_SPEAKING_PART_MIN } from '../../domain/b2-speaking-exam-parts';

export type PracticeTurnParams = {
  cefr: CefrLevel;
  mode: SpeakingMode;
  prompt: string;
  /** Current turn only — prior turns are supplied in `history` (server-side window). */
  transcript: string;
  history: { role: 'user' | 'assistant'; content: string }[];
};

export type ExamTurnParams = {
  cefr: CefrLevel;
  examName: string;
  part: ExamPartDefinition;
  /** Current turn only — prior turns are supplied in `history` (server-side window). */
  transcript: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  /** Texto extra (enunciado BD, situación, etc.). */
  taskContext?: string;
  /** Primera intervención del examinador sin respuesta del candidato. */
  isOpening?: boolean;
  /** B2 global part (14–17) when using dedicated examiner prompts. */
  b2PartNumber?: number;
};

const practiceSystem = (cefr: CefrLevel, prompt: string) =>
  `You are a friendly English speaking tutor for level ${cefr}. ` +
    `Use vocabulary and sentence length appropriate for ${cefr}. ` +
    `Keep replies concise (2-5 sentences) as spoken dialogue. ` +
    `Topic context: ${prompt}`;

function resolveExaminerSystem(p: ExamTurnParams): string {
  if (p.cefr === 'B2' && p.b2PartNumber) {
    const dedicated = buildB2ExaminerSystemPrompt(p.b2PartNumber, p.taskContext);
    if (dedicated) return dedicated;
  }
  return mergeDraloSystem(
    examinerSystemLegacy(p.cefr, p.examName, p.part, p.taskContext ?? ''),
  );
}

function openingUserMessage(p: ExamTurnParams): string {
  if (p.cefr === 'B2' && p.b2PartNumber === B2_SPEAKING_PART_MIN) {
    const steered = buildB2Part1TurnUserMessage({
      isOpening: Boolean(p.isOpening),
      transcript: p.transcript,
      taskContext: p.taskContext,
      history: p.history,
    });
    if (steered) return steered;
    if (p.isOpening) return B2_PART_1_OPENING_USER_MESSAGE;
  }
  if (p.isOpening) {
    return 'The speaking test for this part is starting now. Greet the candidate briefly and give the first instruction or question only.';
  }
  return p.transcript;
}

const examinerSystemLegacy = (
  cefr: CefrLevel,
  examName: string,
  part: ExamPartDefinition,
  taskContext = '',
) => {
  const cambridgeExam = SYSTEM_PROMPTS[cefr]?.exam;
  const partBlock =
    `You are now on Part ${part.part}: ${part.name} (${examName}, CEFR ${cefr}).\n` +
    `Part instructions: ${part.instructions}\n` +
    (taskContext ? `Task material from the exam paper:\n${taskContext}\n` : '') +
    `Rules: Do not teach or correct the candidate. One question or instruction per message. ` +
    `British English. Keep each turn under 80 words.`;

  if (cambridgeExam) {
    return `${cambridgeExam}\n\n${partBlock}`;
  }

  return (
    `You are a Cambridge speaking examiner only (${examName}, CEFR ${cefr}). ` +
    `Part ${part.part}: ${part.name}. ` +
    `Examinee instructions: ${part.instructions} ` +
    (taskContext ? `Additional context:\n${taskContext}\n` : '') +
    `Do not teach grammar or correct the candidate during the exam. ` +
    `One question or instruction per message. No feedback on language form. ` +
    `Speak naturally as an examiner (British English). Keep each turn under 80 words.`
  );
};

export class MockLLMAdapter {
  async practiceReply(p: PracticeTurnParams): Promise<string> {
    await delay(250);
    return (
      `Thanks for sharing that. For ${p.cefr}, try adding one more detail next time — ` +
        `for example a short example or reason. Why does that matter to you personally?`
    );
  }

  async examReply(p: ExamTurnParams): Promise<string> {
    await delay(250);
    if (p.cefr === 'B2' && p.b2PartNumber === B2_SPEAKING_PART_MIN) {
      return resolveB2Part1ExaminerReply({
        isOpening: p.isOpening,
        transcript: p.transcript,
        taskContext: p.taskContext,
        history: p.history,
      });
    }
    if (p.isOpening) {
      const openers: Record<number, string> = {
        1: 'Good morning. My name is Emma. And what is your name?',
        2: 'Now, in this part I\'d like you to talk about these photographs. Compare them and say why the people might be enjoying these activities.',
        3: 'Now, talk together about the situation and decide which option would be best.',
        4: 'Thank you. Now I\'d like to ask you some questions related to what we discussed.',
      };
      return openers[p.part.part] ?? 'Let\'s begin. Please answer when you are ready.';
    }
    return `Thank you. ${p.part.part === 1 ? 'Can you tell me something about your free time?' : 'What might be a disadvantage of that idea?'}`;
  }

  async microFeedback(p: { cefr: CefrLevel; userText: string }): Promise<MicroFeedback> {
    await delay(180);
    const levelOrder = ['A2', 'B1', 'B2', 'C1', 'C2'] as const;
    const isB2Plus = levelOrder.indexOf(p.cefr) >= levelOrder.indexOf('B2');
    return {
      grammarCorrection: 'Replace "He go" with "He goes" if you used present simple for habits.',
      vocabularyImprovement: isB2Plus
        ? 'Try "I tend to" instead of "I usually" for more natural range.'
        : 'Try using "I usually" + verb for habits.',
      naturalAlternative: "I go jogging two or three times a week because it helps me relax.",
      estimatedCefrFit: p.cefr,
      pronunciationNote: 'Estimated: record audio and connect speech APIs for detailed pronunciation scoring.',
    };
  }
}

export class OpenAILLMAdapter extends MockLLMAdapter {
  constructor(private client: OpenAI) {
    super();
  }

  override async practiceReply(p: PracticeTurnParams): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: mergeDraloSystem(practiceSystem(p.cefr, p.prompt)) },
      ...p.history.map((h) => ({
        role: h.role,
        content: h.content,
      })) as OpenAI.Chat.ChatCompletionMessageParam[],
      { role: 'user', content: p.transcript },
    ];
    const res = await this.client.chat.completions.create({
      model: getDraloFastModel(),
      messages,
      temperature: 0.8,
      max_tokens: 300,
    });
    return res.choices[0]?.message?.content?.trim() ?? (await super.practiceReply(p));
  }

  override async examReply(p: ExamTurnParams): Promise<string> {
    if (p.cefr === 'B2' && p.b2PartNumber === B2_SPEAKING_PART_MIN) {
      return resolveB2Part1ExaminerReply({
        isOpening: p.isOpening,
        transcript: p.transcript,
        taskContext: p.taskContext,
        history: p.history,
      });
    }
    const system = resolveExaminerSystem(p);
    const { text } = await cambridgeSpeakingExaminerTurn({
      system,
      userMessage: openingUserMessage(p),
      conversationHistory: p.history,
    });
    return text?.trim() || (await super.examReply(p));
  }

  override async microFeedback(p: { cefr: CefrLevel; userText: string }): Promise<MicroFeedback> {
    const res = await this.client.chat.completions.create({
      model: getDraloFastModel(),
      messages: [
        {
          role: 'system',
          content: mergeDraloSystem(
            'Return a compact JSON object only with keys: grammarCorrection, vocabularyImprovement, naturalAlternative, estimatedCefrFit (string CEFR level), pronunciationNote (string).',
          ),
        },
        {
          role: 'user',
          content: `CEFR target: ${p.cefr}. Learner said: ${p.userText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    const raw = res.choices[0]?.message?.content;
    try {
      const j = JSON.parse(raw ?? '{}') as Partial<MicroFeedback>;
      return {
        grammarCorrection: j.grammarCorrection ?? '',
        vocabularyImprovement: j.vocabularyImprovement ?? '',
        naturalAlternative: j.naturalAlternative ?? '',
        estimatedCefrFit: j.estimatedCefrFit ?? p.cefr,
        pronunciationNote: j.pronunciationNote,
      };
    } catch {
      return super.microFeedback(p);
    }
  }
}

export function createLlmAdapter(): MockLLMAdapter {
  const client = getDraloOpenAI();
  if (client) {
    return new OpenAILLMAdapter(client);
  }
  return new MockLLMAdapter();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
