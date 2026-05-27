import OpenAI from 'openai';
import { EdgeTTS } from 'edge-tts-universal';

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-GB-SoniaNeural';

async function synthesizeWithEdge(text) {
  const tts = new EdgeTTS(text, EDGE_VOICE);
  const result = await tts.synthesize();
  const buf = Buffer.from(await result.audio.arrayBuffer());
  return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
}

/**
 * TTS para scripts de listening (OpenAI si hay cuota; si no, Microsoft Edge TTS gratuito).
 * @param {string} text
 * @returns {Promise<{ base64: string, mime: string } | null>}
 */
export async function synthesizeExamTtsMp3(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;

  const key = process.env.OPENAI_API_KEY?.trim();
  if (key) {
    try {
      const client = new OpenAI({ apiKey: key });
      const voice = process.env.OPENAI_TTS_VOICE ?? 'nova';
      const model = process.env.OPENAI_TTS_MODEL ?? 'tts-1';
      const res = await client.audio.speech.create({
        model,
        voice,
        input: trimmed.slice(0, 4096),
        response_format: 'mp3',
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
    } catch (err) {
      const code = err?.code || err?.error?.code;
      if (code !== 'insufficient_quota' && err?.status !== 429) {
        throw err;
      }
      console.warn('[levelsExamTts] OpenAI quota/rate limit — usando Edge TTS');
    }
  }

  try {
    return await synthesizeWithEdge(trimmed);
  } catch (err) {
    console.warn('[levelsExamTts] Edge TTS failed:', err?.message || err);
    return null;
  }
}
