export function classifyMicError(error) {
  const name = error?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'MIC_PERMISSION';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'MIC_NOT_FOUND';
  if (name === 'NotReadableError' || name === 'AbortError') return 'MIC_IN_USE';
  return 'MIC_FAILED';
}

export function micErrorMessage(code) {
  if (code === 'MIC_PERMISSION') return 'Permite el micrófono para continuar.';
  if (code === 'MIC_NOT_FOUND') return 'No se ha encontrado un micrófono.';
  if (code === 'MIC_IN_USE') return 'El micrófono está ocupado por otra aplicación.';
  return 'No se pudo usar el micrófono.';
}

export function computePcmRms(bytes) {
  if (!bytes?.length) return 0;
  let sum = 0;
  for (const value of bytes) {
    const n = (value - 128) / 128;
    sum += n * n;
  }
  return Math.sqrt(sum / bytes.length);
}

export function shouldEndTurnOnSilence({
  rms,
  now,
  speechAt,
  silentAt,
  rmsThreshold = 0.04,
  minSpeechMs = 1200,
  silenceMs = 1800,
}) {
  const speaking = rms > rmsThreshold;
  if (speaking) {
    return { speechAt: speechAt || now, silentAt: 0, ended: false };
  }
  if (speechAt && now - speechAt > minSpeechMs) {
    const nextSilent = silentAt || now;
    return {
      speechAt,
      silentAt: nextSilent,
      ended: now - nextSilent >= silenceMs,
    };
  }
  return { speechAt, silentAt, ended: false };
}

export function buildReferenceWav({ seconds = 0.4, sampleRate = 16000, frequency = 0 } = {}) {
  const samples = Math.max(1, Math.floor(seconds * sampleRate));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const value = frequency
      ? Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 8000)
      : 0;
    buffer.writeInt16LE(value, 44 + i * 2);
  }
  return buffer;
}

/** Irregular synthetic energy for STT-guard tests. Not a human recording. */
export function buildSpeechLikeWav({ seconds = 1.2, sampleRate = 16000 } = {}) {
  const samples = Math.max(1, Math.floor(seconds * sampleRate));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const burst = Math.sin((2 * Math.PI * (130 + (i % 41)) * i) / sampleRate);
    const noise = ((i * 13) % 19) / 19 - 0.5;
    buffer.writeInt16LE(Math.round((burst * 0.6 + noise * 0.4) * 10000), 44 + i * 2);
  }
  return buffer;
}
