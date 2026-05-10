/** Reserved for future TTS (browser SpeechSynthesis or OpenAI tts-1 on server). */
export interface TTSAdapter {
  /** Returns a URL or data URL playable in the browser if supported. */
  synthesize?(text: string): Promise<{ url: string; mime: string } | null>;
}

export class BrowserPlaceholderTTS implements TTSAdapter {
  async synthesize() {
    return null;
  }
}
