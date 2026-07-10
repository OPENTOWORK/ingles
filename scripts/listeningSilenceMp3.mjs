import { execFileSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @param {number} seconds */
export function makeSilenceMp3(seconds) {
  const sec = Math.max(0.1, Number(seconds) || 0);
  let ffmpegPath = 'ffmpeg';
  try {
    ffmpegPath = require('ffmpeg-static');
  } catch {
    /* use system ffmpeg */
  }

  try {
    const buf = execFileSync(
      ffmpegPath,
      [
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=24000:cl=mono',
        '-t',
        String(sec),
        '-q:a',
        '9',
        '-acodec',
        'libmp3lame',
        '-f',
        'mp3',
        'pipe:1',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024 },
    );
    return Buffer.from(buf);
  } catch (err) {
    throw new Error(
      `Could not generate ${sec}s silence MP3 (ffmpeg): ${err?.message || err}`,
    );
  }
}
