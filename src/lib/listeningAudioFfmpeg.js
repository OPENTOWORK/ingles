import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** Formato común de las grabaciones de listening; evita duraciones erróneas al concatenar. */
export const LISTENING_AUDIO_SAMPLE_RATE = 24000;
export const LISTENING_AUDIO_BITRATE = '64k';

const silenceCache = new Map();

export function resolveFfmpegPath() {
  try {
    const require = createRequire(import.meta.url);
    return require('ffmpeg-static') || 'ffmpeg';
  } catch {
    return 'ffmpeg';
  }
}

function runFfmpeg(args) {
  return execFileSync(resolveFfmpegPath(), args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 128 * 1024 * 1024,
  });
}

/**
 * MP3 de silencio para las pausas de las grabaciones de listening.
 * @param {number} seconds
 * @returns {Buffer}
 */
export function makeSilenceMp3(seconds) {
  const sec = Math.max(0.1, Number(seconds) || 0);
  const key = sec.toFixed(2);
  const cached = silenceCache.get(key);
  if (cached) return cached;

  try {
    const buf = Buffer.from(
      runFfmpeg([
        '-f',
        'lavfi',
        '-i',
        `anullsrc=r=${LISTENING_AUDIO_SAMPLE_RATE}:cl=mono`,
        '-t',
        String(sec),
        '-b:a',
        LISTENING_AUDIO_BITRATE,
        '-acodec',
        'libmp3lame',
        '-f',
        'mp3',
        'pipe:1',
      ]),
    );
    silenceCache.set(key, buf);
    return buf;
  } catch (err) {
    throw new Error(`Could not generate ${sec}s silence MP3 (ffmpeg): ${err?.message || err}`);
  }
}

/**
 * Concatena MP3 de orígenes distintos (intro, TTS, silencios) reencodificando a un
 * formato único. La concatenación byte a byte deja cabeceras incoherentes y hace que
 * el navegador calcule mal la duración y no pueda buscar dentro del audio.
 * @param {Buffer[]} buffers
 * @returns {Buffer}
 */
export function concatMp3BuffersNormalized(buffers) {
  const parts = (buffers || []).filter((b) => b?.length);
  if (!parts.length) return Buffer.alloc(0);

  const dir = mkdtempSync(path.join(tmpdir(), 'listening-audio-'));
  try {
    const inputs = [];
    parts.forEach((buf, i) => {
      const file = path.join(dir, `part-${String(i).padStart(3, '0')}.mp3`);
      writeFileSync(file, buf);
      inputs.push('-i', file);
    });

    const out = path.join(dir, 'out.mp3');
    const filter = `${parts.map((_, i) => `[${i}:a]`).join('')}concat=n=${parts.length}:v=0:a=1[a]`;

    runFfmpeg([
      ...inputs,
      '-filter_complex',
      filter,
      '-map',
      '[a]',
      '-ar',
      String(LISTENING_AUDIO_SAMPLE_RATE),
      '-ac',
      '1',
      '-b:a',
      LISTENING_AUDIO_BITRATE,
      '-write_xing',
      '1',
      '-y',
      out,
    ]);

    return readFileSync(out);
  } catch (err) {
    throw new Error(`Could not concatenate listening MP3s (ffmpeg): ${err?.message || err}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
