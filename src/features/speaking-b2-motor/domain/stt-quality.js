const LOW_CONFIDENCE = 0.55;

export function estimateSttConfidence(transcript, source) {
  const text = String(transcript || '').trim();
  if (!text) return 0;
  if (source === 'MOCK') return 0.4;
  if (source === 'TYPED') return 0.9;
  const words = text.split(/\s+/).length;
  if (words < 2) return 0.5;
  if (/[?]{2,}|\.{3,}|\[inaudible\]|\[unclear\]/i.test(text)) return 0.35;
  return Math.min(0.92, 0.62 + words * 0.02);
}

export function isUncertainTranscript(transcript, confidence) {
  if (confidence != null && confidence < LOW_CONFIDENCE) return true;
  return /\[inaudible\]|\[unclear\]|\[noise\]/i.test(String(transcript || ''));
}

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Grounds an STT transcript against signal evidence.
 * A known-phrase list is never the only reason to reject a transcript.
 */
export function assessSttGrounding({
  transcript = '',
  confidence = null,
  source = '',
  signal = null,
  speakingMs = 0,
  declaredKind = '',
} = {}) {
  const text = String(transcript || '').trim();
  const words = wordCount(text);

  if (source === 'TYPED') {
    return { accept: true, uncertain: false, text, reason: 'typed-fixture' };
  }
  if (!text) {
    return { accept: true, uncertain: Boolean(signal && !signal.hasLikelySpeech), text: '', reason: 'empty-transcript' };
  }
  if (['empty', 'non-linguistic', 'unintelligible', 'invalid', 'corrupt'].includes(signal?.kind || declaredKind)) {
    return { accept: false, uncertain: true, text: '', reason: 'declared-or-detected-non-speech' };
  }
  if (isUncertainTranscript(text, confidence)) {
    return { accept: false, uncertain: true, text: '', reason: 'low-confidence-or-markers' };
  }
  if (signal?.isSilent || signal?.kind === 'empty') {
    return { accept: false, uncertain: true, text: '', reason: 'transcript-from-silence' };
  }
  if (signal?.isTone || signal?.kind === 'non-linguistic') {
    return { accept: false, uncertain: true, text: '', reason: 'transcript-from-non-speech' };
  }
  if (signal && signal.parseable && !signal.hasLikelySpeech) {
    return { accept: false, uncertain: true, text: '', reason: 'no-speech-evidence' };
  }
  const durationMs = signal?.durationMs || speakingMs || 0;
  if (durationMs > 0 && durationMs < 450 && words >= 8) {
    return { accept: false, uncertain: true, text: '', reason: 'transcript-too-long-for-audio' };
  }
  const seconds = durationMs / 1000;
  if (seconds >= 0.6 && words / seconds > 5.2) {
    return { accept: false, uncertain: true, text: '', reason: 'transcript-too-dense-for-audio' };
  }
  return { accept: true, uncertain: false, text, reason: 'grounded' };
}

export function turnsForSpeakingB2Evaluation(turns = []) {
  return turns.map((turn) => {
    if (turn?.role === 'candidate' && (turn.uncertain || turn.hallucination)) {
      return { ...turn, transcript: '', excludedFromPedagogy: true };
    }
    return turn;
  });
}
