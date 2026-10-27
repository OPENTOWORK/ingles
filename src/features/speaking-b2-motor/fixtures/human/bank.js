import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { emptySpeakingB2HumanManifest, validateSpeakingB2HumanManifest } from './manifest.js';
import { speakingB2PublicHumanSample } from './privacy.js';

export function speakingB2HumanBankDir({
  env = process.env,
  cwd = process.cwd(),
} = {}) {
  if (env.SPEAKING_B2_HUMAN_AUDIO_DIR) return path.resolve(env.SPEAKING_B2_HUMAN_AUDIO_DIR);
  return path.resolve(cwd, 'local/speaking-b2-human');
}

export function readSpeakingB2HumanManifestRaw(dir) {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) return { exists: false, raw: null };
  try {
    return { exists: true, raw: JSON.parse(readFileSync(manifestPath, 'utf8')) };
  } catch (error) {
    return { exists: true, raw: null, error: error.message };
  }
}

export function loadSpeakingB2HumanManifest(dir) {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    return { ok: true, empty: true, ...emptySpeakingB2HumanManifest(), errors: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return { empty: false, ...validateSpeakingB2HumanManifest(raw) };
  } catch (error) {
    return { ok: false, empty: false, samples: [], errors: [`invalid_json:${error.message}`] };
  }
}

export function loadSpeakingB2HumanBank(options = {}) {
  const dir = speakingB2HumanBankDir(options);
  const loaded = loadSpeakingB2HumanManifest(dir);
  const samples = loaded.ok ? loaded.samples || [] : [];
  return {
    dir,
    setVersion: loaded.setVersion || 'human-v1',
    ok: loaded.ok,
    errors: loaded.errors || [],
    samples,
    count: samples.length,
    status: samples.length ? 'ready' : 'PENDING',
    humanValidationApproved: false,
    reason: samples.length ? 'authorized_samples_present' : 'no_authorized_human_recordings',
  };
}

export function publicSpeakingB2HumanCatalog(options = {}) {
  const bank = loadSpeakingB2HumanBank(options);
  return {
    authenticity: 'human-authorized',
    warning:
      'Human recordings stay local. This catalog never includes audio bytes. Validation is PENDING until authorized files exist and a teacher reviews them.',
    status: bank.status,
    humanValidationApproved: false,
    setVersion: bank.setVersion,
    count: bank.count,
    samples: bank.samples.map(speakingB2PublicHumanSample),
    errors: bank.ok ? [] : bank.errors,
  };
}

export function readSpeakingB2HumanAudio(sample, { dir } = {}) {
  if (!sample?.audioFile) return { ok: false, code: 'AUDIO_MISSING' };
  const root = dir || speakingB2HumanBankDir();
  const target = path.resolve(root, sample.audioFile);
  if (!target.startsWith(path.resolve(root))) return { ok: false, code: 'AUDIO_PATH' };
  if (!existsSync(target)) return { ok: false, code: 'AUDIO_MISSING' };
  return { ok: true, buffer: readFileSync(target), file: sample.audioFile };
}
