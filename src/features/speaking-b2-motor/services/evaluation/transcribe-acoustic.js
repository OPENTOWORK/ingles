import { createSttAdapter } from '@/features/speaking/services/speech/stt.adapter';
import { estimateSttConfidence, isUncertainTranscript } from '../../domain/stt-quality.js';

export { estimateSttConfidence, isUncertainTranscript };

export async function transcribeCandidateAudio({ buffer, mimeType, filename }) {
  if (!buffer?.length) {
    return { text: '', source: 'STT', confidence: 0, hasAudio: false };
  }
  const stt = createSttAdapter();
  const result = await stt.transcribe({
    buffer,
    mimeType: mimeType || 'audio/webm',
    filename: filename || 'answer.webm',
  });
  const confidence = estimateSttConfidence(result.text, result.source);
  return {
    text: result.text,
    source: result.source,
    confidence,
    hasAudio: true,
    uncertain: isUncertainTranscript(result.text, confidence),
  };
}

export function buildAcousticContext(turns) {
  const audioTurns = turns.filter((turn) => turn.role === 'candidate' && turn.hasAudio);
  return {
    hasAudio: audioTurns.length > 0,
    clipCount: audioTurns.length,
    uncertainCount: audioTurns.filter((turn) => turn.uncertain).length,
    // Whisper text confidence is not an acoustic pronunciation model.
    hasAcousticAnalysis: false,
  };
}
