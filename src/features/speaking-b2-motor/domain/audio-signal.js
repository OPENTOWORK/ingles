function crossingRegularity(indices) {
  if (indices.length < 8) return 0;
  const gaps = [];
  for (let i = 1; i < indices.length; i += 1) {
    gaps.push(indices[i] - indices[i - 1]);
  }
  const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  if (!mean) return 0;
  const variance = gaps.reduce((sum, gap) => sum + (gap - mean) ** 2, 0) / gaps.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, 1 - Math.min(1, cv));
}

export function analyzeSpeakingB2AudioSignal(buffer, { mimeType = '', declaredKind = '' } = {}) {
  if (!buffer?.length) {
    return {
      parseable: true,
      hasLikelySpeech: false,
      isSilent: true,
      isTone: false,
      rms: 0,
      peak: 0,
      durationMs: 0,
      kind: 'empty',
    };
  }

  const mime = String(mimeType || '').toLowerCase();
  const declared = String(declaredKind || '');
  const isWavHeader = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE';
  if (!isWavHeader) {
    let kind = 'compressed-or-unknown';
    if (mime.includes('octet') || declared === 'invalid') kind = 'corrupt';
    else if (declared === 'empty') kind = 'empty';
    else if (declared === 'non-linguistic' || declared === 'unintelligible') kind = 'non-linguistic';
    return {
      parseable: false,
      hasLikelySpeech: false,
      isSilent: declared === 'empty',
      isTone: declared === 'non-linguistic' || declared === 'unintelligible',
      rms: null,
      peak: null,
      durationMs: null,
      kind,
    };
  }

  const sampleRate = buffer.readUInt32LE(24) || 16000;
  const dataSize = Math.max(0, buffer.readUInt32LE(40));
  const samples = Math.floor(dataSize / 2);
  let sum = 0;
  let peak = 0;
  const crossings = [];
  let previous = 0;
  for (let i = 0; i < samples; i += 1) {
    const offset = 44 + i * 2;
    if (offset + 1 >= buffer.length) break;
    const sample = buffer.readInt16LE(offset);
    const normalized = sample / 32768;
    sum += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
    if (i && ((previous >= 0 && sample < 0) || (previous < 0 && sample >= 0))) {
      crossings.push(i);
    }
    previous = sample;
  }

  const rms = samples ? Math.sqrt(sum / samples) : 0;
  const durationMs = sampleRate ? (samples / sampleRate) * 1000 : 0;
  const isSilent = rms < 0.012;
  const regularity = crossingRegularity(crossings);
  const isTone = !isSilent && regularity >= 0.82;
  const hasLikelySpeech = !isSilent && !isTone && peak > 0.05 && durationMs >= 250;

  let kind = 'uncertain-signal';
  if (isSilent) kind = 'empty';
  else if (isTone || declared === 'unintelligible' || declared === 'non-linguistic') kind = 'non-linguistic';
  else if (hasLikelySpeech) kind = 'speech-like';

  return {
    parseable: true,
    hasLikelySpeech,
    isSilent,
    isTone,
    rms: Number(rms.toFixed(4)),
    peak: Number(peak.toFixed(4)),
    durationMs: Math.round(durationMs),
    kind,
  };
}
