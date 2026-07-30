import OpenAI from 'openai';
import { EdgeTTS } from 'edge-tts-universal';
import {
  getExtractVoiceProfile,
  getPart2InterviewVoiceProfile,
  parseDialogueSegments,
} from '@/lib/listeningTtsVoices';

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-GB-SoniaNeural';

async function synthesizeWithEdge(text, voice = EDGE_VOICE, prosody = {}) {
  const tts = new EdgeTTS(text, voice, {
    rate: prosody.rate ?? '+0%',
    volume: prosody.volume ?? '+0%',
    pitch: prosody.pitch ?? '+0Hz',
  });
  const result = await tts.synthesize();
  const buf = Buffer.from(await result.audio.arrayBuffer());
  return { base64: buf.toString('base64'), mime: 'audio/mpeg' };
}

/**
 * TTS for a single utterance.
 * When `edgeVoice` is set, Edge TTS is preferred (better accent variety for listening).
 * @param {string} text
 * @param {{ edgeVoice?: string, openaiVoice?: string, preferEdge?: boolean, edgeOnly?: boolean, openaiOnly?: boolean }} [options]
 * @returns {Promise<{ base64: string, mime: string } | null>}
 */
export async function synthesizeExamTtsMp3(text, options = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;

  const edgeVoice = options.edgeVoice?.trim() || null;
  const openaiVoice = options.openaiVoice || process.env.OPENAI_TTS_VOICE || 'nova';
  const preferEdge = options.preferEdge !== false && Boolean(edgeVoice);
  const edgeOnly = options.edgeOnly === true;
  const openaiOnly = options.openaiOnly === true;
  const prosody = options.prosody || {};

  if (preferEdge && edgeVoice) {
    try {
      return await synthesizeWithEdge(trimmed, edgeVoice, prosody);
    } catch (err) {
      if (edgeOnly) {
        console.warn('[levelsExamTts] Fixed Edge voice unavailable:', err?.message || err);
        return null;
      }
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
      if (openaiOnly) {
        console.warn('[levelsExamTts] Fixed OpenAI voice unavailable:', err?.message || err);
        return null;
      }
      if (code !== 'insufficient_quota' && err?.status !== 429) {
        if (!edgeVoice) throw err;
        console.warn('[levelsExamTts] OpenAI TTS failed:', err?.message || err);
      } else {
        console.warn('[levelsExamTts] OpenAI quota/rate limit — usando Edge TTS');
      }
    }
  }

  if (openaiOnly) return null;

  try {
    return await synthesizeWithEdge(trimmed, edgeVoice || EDGE_VOICE, prosody);
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
  const listeningRate = options.prosody?.rate ?? process.env.LISTENING_TTS_RATE ?? '-12%';
  const prosody = { rate: listeningRate, ...options.prosody };

  if (segments.length <= 1) {
    const mono = profile.mono;
    return synthesizeExamTtsMp3(segments[0]?.text || text, {
      edgeVoice: mono.edge,
      openaiVoice: mono.openai,
      preferEdge: true,
      prosody,
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
      prosody,
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

/**
 * Listening Part 2: one recording with host (A) + guest (B) — same Edge TTS stack as Part 1 extracts.
 * @param {string} text — script with "A:" / "B:" lines
 */
export async function synthesizePart2ListeningMp3(text) {
  const profile = getPart2InterviewVoiceProfile();
  const segments = parseDialogueSegments(text);

  if (segments.length <= 1) {
    const guest = profile.speakers.B;
    return synthesizeExamTtsMp3(segments[0]?.text || text, {
      edgeVoice: guest.edge,
      openaiVoice: guest.openai,
      preferEdge: true,
    });
  }

  const buffers = [];
  for (const segment of segments) {
    const speaker = segment.speaker || 'B';
    const voice = profile.speakers[speaker] || profile.speakers.B;
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
