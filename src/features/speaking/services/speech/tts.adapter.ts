import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';

export interface TtsResult {
  base64: string;
  mime: string;
}

export interface TTSAdapter {
  synthesize(text: string): Promise<TtsResult | null>;
}

/** OpenAI TTS with Edge TTS fallback — same pipeline as listening / coach. */
export class SpeakingTTSAdapter implements TTSAdapter {
  async synthesize(text: string): Promise<TtsResult | null> {
    return synthesizeExamTtsMp3(text);
  }
}

export function createTtsAdapter(): TTSAdapter {
  return new SpeakingTTSAdapter();
}
