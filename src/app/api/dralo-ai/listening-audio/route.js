import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  isDialogueScript,
  listeningActivityPrefersDialogue,
  parseListeningScript,
  voiceRoleForLabel,
} from '@/lib/parseListeningScript';

export const runtime = 'nodejs';

const MAX_CHARS_PER_TURN = 800;
const MAX_TURNS = 24;

const VOICES = {
  female: process.env.OPENAI_TTS_VOICE_FEMALE || 'nova',
  male: process.env.OPENAI_TTS_VOICE_MALE || 'onyx',
  narrator: process.env.OPENAI_TTS_VOICE || 'nova',
};

const MODEL = process.env.OPENAI_TTS_MODEL_HD || 'tts-1-hd';

/**
 * High-quality listening audio (OpenAI TTS HD).
 * Dialogues: woman + man voices stitched into one MP3.
 */
export async function POST(req) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 503 });
    }

    const body = await req.json();
    const script = String(body?.script ?? '').trim();
    if (!script) {
      return NextResponse.json({ error: 'Missing script.' }, { status: 400 });
    }

    const activityId = String(body?.activity || '');
    const turns = parseListeningScript(script).slice(0, MAX_TURNS);
    const useDialogue =
      listeningActivityPrefersDialogue(activityId) || isDialogueScript(turns);

    const client = new OpenAI({ apiKey: key });
    let speed = Number(process.env.OPENAI_TTS_LISTENING_SPEED ?? 0.98);
    if (!Number.isFinite(speed)) speed = 0.98;
    speed = Math.min(1.15, Math.max(0.85, speed));

    async function synthesize(text, voice) {
      const input = String(text || '').trim().slice(0, MAX_CHARS_PER_TURN);
      if (!input) return null;
      const mp3 = await client.audio.speech.create({
        model: MODEL,
        voice,
        input,
        speed,
      });
      return Buffer.from(await mp3.arrayBuffer());
    }

    /** @type {Buffer[]} */
    let chunks = [];

    if (useDialogue && turns.length >= 2) {
      // Sintetiza todos los turnos en paralelo y conserva el orden original.
      const bufs = await Promise.all(
        turns.map((turn, i) => {
          const role = voiceRoleForLabel(turn.label, i);
          const voice = VOICES[role] || VOICES.narrator;
          return synthesize(turn.text, voice);
        }),
      );
      chunks = bufs.filter((buf) => buf?.length);
    } else {
      const fullText = turns.map((t) => t.text).join(' ') || script;
      const buf = await synthesize(fullText, VOICES.narrator);
      if (buf?.length) chunks.push(buf);
    }

    if (!chunks.length) {
      return NextResponse.json({ error: 'Could not generate audio.' }, { status: 502 });
    }

    const combined = Buffer.concat(chunks);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Listening-Audio': useDialogue && turns.length >= 2 ? 'dialogue' : 'monologue',
      },
    });
  } catch (e) {
    console.error('[dralo-ai/listening-audio]', e?.message || e);
    return NextResponse.json(
      { error: 'Audio generation failed.', details: e?.message },
      { status: 502 },
    );
  }
}
