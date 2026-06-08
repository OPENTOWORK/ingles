/** Accurate MP3 duration (seconds) via music-metadata. */
export async function getMp3DurationSec(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  try {
    const { parseBuffer } = await import('music-metadata');
    const meta = await parseBuffer(buf, { mimeType: 'audio/mpeg' });
    const sec = meta.format.duration;
    if (Number.isFinite(sec) && sec > 0) {
      return Math.round(sec * 10) / 10;
    }
  } catch {
    /* fallback below */
  }
  return Math.round(((buf.length * 8) / 128000) * 10) / 10;
}
