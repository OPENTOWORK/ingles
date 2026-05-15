import OpenAI from 'openai';

export interface TtsResult {
  base64: string;
  mime: string;
}

export interface TTSAdapter {
  synthesize(text: string): Promise<TtsResult | null>;
}

export class MockTTSAdapter implements TTSAdapter {
  async synthesize() {
    return null;
  }
}

export class OpenAITTSAdapter implements TTSAdapter {
  constructor(private client: OpenAI) {}

  async synthesize(text: string): Promise<TtsResult | null> {
    const trimmed = String(text || '').trim();
    if (!trimmed) return null;
    const voice = process.env.OPENAI_TTS_VOICE ?? 'nova';
    const model = process.env.OPENAI_TTS_MODEL ?? 'tts-1';
    const res = await this.client.audio.speech.create({
      model,
      voice: voice as 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx',
      input: trimmed.slice(0, 4096),
      response_format: 'mp3',
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
  }
}

export function createTtsAdapter(): TTSAdapter {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAITTSAdapter(new OpenAI({ apiKey: key }));
  }
  return new MockTTSAdapter();
}
