import OpenAI from 'openai';
import { EdgeTTS } from 'edge-tts-universal';
import {
  getExtractVoiceProfile,
  parseDialogueSegments,
} from '@/lib/listeningTtsVoices';

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-GB-SoniaNeural';

async function synthesizeWithEdge(text, voice = EDGE_VOICE) {
  const tts = new EdgeTTS(text, voice);
  const result = await tts.synthesize();
  const buf = Buffer.from(await result.audio.arrayBuffer());
  return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
}

/**
 * TTS for a single utterance.
 * When `edgeVoice` is set, Edge TTS is preferred (better accent variety for listening).
 * @param {string} text
 * @param {{ edgeVoice?: string, openaiVoice?: string, preferEdge?: boolean }} [options]
 * @returns {Promise<{ base64: string, mime: string } | null>}
 */
export async function synthesizeExamTtsMp3(text, options = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;

  const edgeVoice = options.edgeVoice?.trim() || null;
  const openaiVoice = options.openaiVoice || process.env.OPENAI_TTS_VOICE || 'nova';
  const preferEdge = options.preferEdge !== false && Boolean(edgeVoice);

  if (preferEdge && edgeVoice) {
    try {
      return await synthesizeWithEdge(trimmed, edgeVoice);
    } catch (err) {
      console.warn('[levelsExamTts] Edge TTS failed, trying OpenAI:', err?.message || err);
    }
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (key) {
    try {
      const client = new OpenAI({ apiKey: key });
      const model = process.env.OPENAI_TTS_MODEL ?? 'tts-1';
      const res = await client.audio.speech.create({
        model,
        voice: openaiVoice,
        input: trimmed.slice(0, 4096),
        response_format: 'mp3',
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
    } catch (err) {
      const code = err?.code || err?.error?.code;
      if (code !== 'insufficient_quota' && err?.status !== 429) {
        if (!edgeVoice) throw err;
        console.warn('[levelsExamTts] OpenAI TTS failed:', err?.message || err);
      } else {
        console.warn('[levelsExamTts] OpenAI quota/rate limit — usando Edge TTS');
      }
    }
  }

  try {
    return await synthesizeWithEdge(trimmed, edgeVoice || EDGE_VOICE);
  } catch (err) {
    console.warn('[levelsExamTts] Edge TTS failed:', err?.message || err);
    return null;
  }
}

/**
 * Synthesize one listening extract with distinct voice(s) per scenario.
 * Dialogues ("A:" / "B:") use different voices; monologues use the extract profile.
 * @param {string} text
 * @param {{ extractIndex?: number }} [options]
 */
export async function synthesizeListeningClipMp3(text, options = {}) {
  const profile = getExtractVoiceProfile(options.extractIndex ?? 0);
  const segments = parseDialogueSegments(text);

  if (segments.length <= 1) {
    const mono = profile.mono;
    return synthesizeExamTtsMp3(segments[0]?.text || text, {
      edgeVoice: mono.edge,
      openaiVoice: mono.openai,
      preferEdge: true,
    });
  }

  const buffers = [];
  for (const segment of segments) {
    const speaker = segment.speaker || 'A';
    const voice = profile.speakers[speaker] || profile.mono;
    const result = await synthesizeExamTtsMp3(segment.text, {
      edgeVoice: voice.edge,
      openaiVoice: voice.openai,
      preferEdge: true,
    });
    if (result?.base64) {
      buffers.push(Buffer.from(result.base64, 'base64'));
    }
  }

  if (!buffers.length) return null;
  return {
    base64: Buffer.concat(buffers).toString('base64'),
    mime: 'audio/mpeg',
  };
}
