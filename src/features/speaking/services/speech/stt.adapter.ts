import OpenAI from 'openai';

export type TranscriptionSource = 'STT' | 'MOCK';

export interface SttResult {
  text: string;
  source: TranscriptionSource;
}

export interface STTAdapter {
  transcribe(input: { buffer: Buffer; mimeType: string; filename: string }): Promise<SttResult>;
}

export class MockSTTAdapter implements STTAdapter {
  async transcribe(): Promise<SttResult> {
    await delay(200);
    return {
      text: "I'm practising my English speaking because I want to study abroad next year.",
      source: 'MOCK',
    };
  }
}

export class OpenAISTTAdapter implements STTAdapter {
  constructor(private client: OpenAI) {}

  async transcribe(input: {
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }): Promise<SttResult> {
    const file = await OpenAI.toFile(input.buffer, input.filename, { type: input.mimeType });
    const tr = await this.client.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_STT_MODEL ?? 'whisper-1',
    });
    return { text: (tr.text ?? '').trim(), source: 'STT' };
  }
}

export function createSttAdapter(): STTAdapter {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAISTTAdapter(new OpenAI({ apiKey: key }));
  }
  return new MockSTTAdapter();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
