import OpenAI from 'openai';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import type { ExamPartDefinition } from '../../domain/types';
import type { MicroFeedback } from '../../domain/types';

export type PracticeTurnParams = {
  cefr: CefrLevel;
  mode: SpeakingMode;
  prompt: string;
  transcript: string;
  history: { role: 'user' | 'assistant'; content: string }[];
};

export type ExamTurnParams = {
  cefr: CefrLevel;
  examName: string;
  part: ExamPartDefinition;
  transcript: string;
  history: { role: 'user' | 'assistant'; content: string }[];
};

const practiceSystem = (cefr: CefrLevel, prompt: string) =>
  `You are a friendly English speaking tutor for level ${cefr}. ` +
    `Use vocabulary and sentence length appropriate for ${cefr}. ` +
    `Keep replies concise (2-5 sentences) as spoken dialogue. ` +
    `Topic context: ${prompt}`;

const examinerSystem = (cefr: CefrLevel, examName: string, part: ExamPartDefinition) =>
  `You are a Cambridge speaking examiner only (${examName}, CEFR ${cefr}). ` +
    `Part ${part.part}: ${part.name}. ` +
    `Examinee instructions: ${part.instructions} ` +
    `Do not teach grammar or correct the candidate during the exam. ` +
    `One question or instruction per message. No feedback on language form.`;

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
      { role: 'system', content: practiceSystem(p.cefr, p.prompt) },
      ...p.history.map((h) => ({
        role: h.role,
        content: h.content,
      })) as OpenAI.Chat.ChatCompletionMessageParam[],
      { role: 'user', content: p.transcript },
    ];
    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 300,
    });
    return res.choices[0]?.message?.content?.trim() ?? (await super.practiceReply(p));
  }

  override async examReply(p: ExamTurnParams): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: examinerSystem(p.cefr, p.examName, p.part) },
      ...p.history.map((h) => ({
        role: h.role,
        content: h.content,
      })) as OpenAI.Chat.ChatCompletionMessageParam[],
      { role: 'user', content: p.transcript },
    ];
    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages,
      temperature: 0.5,
      max_tokens: 200,
    });
    return res.choices[0]?.message?.content?.trim() ?? (await super.examReply(p));
  }

  override async microFeedback(p: { cefr: CefrLevel; userText: string }): Promise<MicroFeedback> {
    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Return a compact JSON object only with keys: grammarCorrection, vocabularyImprovement, naturalAlternative, estimatedCefrFit (string CEFR level), pronunciationNote (string).',
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
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAILLMAdapter(new OpenAI({ apiKey: key }));
  }
  return new MockLLMAdapter();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
