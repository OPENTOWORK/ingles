import { validateSpeakingB2CandidateAudio } from '../audio/persist.js';
import { analyzeSpeakingB2AudioSignal } from '../../domain/audio-signal.js';
import { assessSttGrounding, estimateSttConfidence } from '../../domain/stt-quality.js';
import { speakingB2AnswerFilename } from '../../fixtures/materialize.js';

export async function resolveSpeakingB2AnswerAudio({
  buffer = null,
  mimeType = '',
  transcribe,
  declaredKind = '',
  speakingMs = 0,
} = {}) {
  const check = validateSpeakingB2CandidateAudio({ buffer, mimeType });
  if (!check.ok) return check;
  const signal = analyzeSpeakingB2AudioSignal(buffer, { mimeType, declaredKind });
  if (
    check.silent ||
    !buffer?.length ||
    signal.isSilent ||
    signal.isTone ||
    ['empty', 'non-linguistic', 'corrupt'].includes(signal.kind)
  ) {
    return {
      ok: true,
      signal,
      stt: {
        text: '',
        source: 'STT',
        confidence: 0,
        hasAudio: Boolean(buffer?.length),
        uncertain: true,
        hallucination: false,
      },
    };
  }
  if (typeof transcribe !== 'function') {
    return { ok: false, code: 'STT_FAILED', error: 'Transcription failed.' };
  }
  try {
    const raw = await transcribe({
      buffer,
      mimeType,
      filename: speakingB2AnswerFilename(mimeType),
    });
    const confidence = raw.confidence ?? estimateSttConfidence(raw.text, raw.source);
    const grounded = assessSttGrounding({
      transcript: raw.text,
      confidence,
      source: raw.source,
      signal,
      speakingMs,
      declaredKind,
    });
    return {
      ok: true,
      signal,
      stt: {
        text: grounded.text,
        source: raw.source,
        confidence,
        hasAudio: true,
        uncertain: grounded.uncertain,
        hallucination: !grounded.accept && Boolean(String(raw.text || '').trim()),
        grounding: grounded.reason,
      },
    };
  } catch {
    return { ok: false, code: 'STT_FAILED', error: 'Transcription failed.' };
  }
}
