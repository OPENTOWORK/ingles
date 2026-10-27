import { existsSync, statSync } from 'fs';
import path from 'path';
import { isAllowedSpeakingB2AudioMime, SPEAKING_B2_AUDIO_MAX_BYTES } from '../../services/audio/persist.js';
import { validateSpeakingB2HumanManifest, validateSpeakingB2HumanSample } from './manifest.js';

const EXT_MIME = {
  '.wav': 'audio/wav',
  '.wave': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
};

export function speakingB2AudioMimeFromName(fileName) {
  const ext = path.extname(String(fileName || '')).toLowerCase();
  return EXT_MIME[ext] || '';
}

export function validateSpeakingB2HumanAudioFile(filePath, { mimeType = '' } = {}) {
  if (!filePath || !existsSync(filePath)) return { ok: false, code: 'AUDIO_MISSING', error: 'Audio file is missing.' };
  const stat = statSync(filePath);
  if (!stat.size) return { ok: false, code: 'AUDIO_EMPTY', error: 'Empty audio.' };
  if (stat.size > SPEAKING_B2_AUDIO_MAX_BYTES) {
    return { ok: false, code: 'AUDIO_TOO_LONG', error: 'Audio is too long.' };
  }
  const mime = mimeType || speakingB2AudioMimeFromName(filePath);
  if (!isAllowedSpeakingB2AudioMime(mime)) {
    return { ok: false, code: 'AUDIO_FORMAT', error: 'Audio format is not supported.' };
  }
  return { ok: true, bytes: stat.size, mimeType: mime };
}

export function importSpeakingB2HumanManifest(dir, rawManifest) {
  const root = path.resolve(dir);
  const checked = validateSpeakingB2HumanManifest(rawManifest);
  if (!checked.ok) return { ok: false, errors: checked.errors, samples: [] };

  const imported = [];
  const errors = [];
  for (const sample of checked.samples) {
    const meta = validateSpeakingB2HumanSample(sample);
    if (!meta.ok) {
      errors.push({ id: sample.id, errors: meta.errors });
      continue;
    }
    const audioPath = path.resolve(root, sample.audioFile);
    if (!audioPath.startsWith(root)) {
      errors.push({ id: sample.id, errors: ['unsafe_audio_path'] });
      continue;
    }
    const audio = validateSpeakingB2HumanAudioFile(audioPath);
    if (!audio.ok) {
      errors.push({ id: sample.id, errors: [audio.code] });
      continue;
    }
    imported.push({
      ...meta.sample,
      bytes: audio.bytes,
      mimeType: audio.mimeType,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    setVersion: checked.setVersion,
    samples: imported,
    humanValidationApproved: false,
    status: imported.length ? 'imported' : 'PENDING',
  };
}

export function associateSpeakingB2HumanSample(sample) {
  return {
    sampleId: sample?.id || null,
    questionId: sample?.questionId || null,
    associated: Boolean(sample?.id && sample?.questionId),
  };
}
