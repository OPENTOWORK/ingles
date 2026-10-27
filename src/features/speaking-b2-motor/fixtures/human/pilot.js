import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { SPEAKING_B2_EX001_QUESTIONS } from '../../domain/question-bank/sp-ex001-part1.js';
import { preserveSpeakingB2HumanTranscript } from './manifest.js';
import { speakingB2AudioMimeFromName, validateSpeakingB2HumanAudioFile } from './import.js';

export const SPEAKING_B2_HUMAN_PILOT_ID = 'pilot-sp-ex001-v1.9';
export const SPEAKING_B2_HUMAN_PILOT_SET = 'human-v1.9';
export const SPEAKING_B2_HUMAN_PILOT_EXTS = ['.m4a', '.mp3', '.wav', '.aac', '.ogg', '.webm'];

export const SPEAKING_B2_HUMAN_PILOT_ITEMS = SPEAKING_B2_EX001_QUESTIONS.map((question) => {
  const n = String(question.sortOrder).padStart(2, '0');
  const id = `hum-v19-q${n}`;
  return {
    id,
    questionId: question.id,
    question: question.question,
    theme: question.theme,
    stemFile: `originals/${id}`,
    suggestedFile: `originals/${id}.m4a`,
    targetSeconds: '20-40',
  };
});

export function speakingB2HumanPilotTemplate() {
  return {
    setVersion: SPEAKING_B2_HUMAN_PILOT_SET,
    packId: SPEAKING_B2_HUMAN_PILOT_ID,
    authorizationNote:
      'Fill authorization only after the speaker consents. Do not invent consent, level or transcripts.',
    samples: SPEAKING_B2_HUMAN_PILOT_ITEMS.map((item) => ({
      id: item.id,
      questionId: item.questionId,
      question: item.question,
      audioFile: item.suggestedFile,
      humanTranscript: '',
      durationMs: null,
      language: 'en',
      estimatedLevel: null,
      levelVerified: false,
      microphone: '',
      notes: '',
      speakerId: '',
      sessionId: '',
      captureKind: 'isolated-answer',
      authorization: {
        granted: false,
        purpose: '',
        scope: 'local-dev-only',
        identifiable: true,
        consentRef: '',
        recordedAt: null,
      },
      setVersion: SPEAKING_B2_HUMAN_PILOT_SET,
    })),
  };
}

function listMatchingAudio(dir, stemFile) {
  const folder = path.join(dir, path.dirname(stemFile));
  const base = path.basename(stemFile);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return name.startsWith(base) && SPEAKING_B2_HUMAN_PILOT_EXTS.includes(ext);
    })
    .map((name) => path.join(path.dirname(stemFile), name).replaceAll('\\', '/'));
}

export function classifySpeakingB2PilotSample(raw = {}, { audioPath = null } = {}) {
  const missing = [];
  if (!String(raw.id || '').trim()) missing.push('id');
  if (!String(raw.questionId || '').trim()) missing.push('questionId');
  if (!preserveSpeakingB2HumanTranscript(raw.humanTranscript)) missing.push('humanTranscript');
  if (raw.authorization?.granted !== true) missing.push('authorization.granted');
  if (!String(raw.authorization?.purpose || '').trim()) missing.push('authorization.purpose');
  if (!String(raw.authorization?.consentRef || '').trim()) missing.push('authorization.consentRef');
  if (!audioPath) missing.push('audioFile');
  if (raw.estimatedLevel && raw.levelVerified !== true) missing.push('level_not_verified');
  return {
    id: raw.id || null,
    questionId: raw.questionId || null,
    status: missing.length ? 'draft' : 'ready',
    missing,
    audioPath,
  };
}

export function inspectSpeakingB2HumanPilot({ dir, manifest } = {}) {
  const template = speakingB2HumanPilotTemplate();
  const rawSamples = Array.isArray(manifest?.samples) ? manifest.samples : template.samples;
  const items = SPEAKING_B2_HUMAN_PILOT_ITEMS.map((packItem) => {
    const raw = rawSamples.find((sample) => sample.id === packItem.id) || {
      id: packItem.id,
      questionId: packItem.questionId,
      humanTranscript: '',
      authorization: { granted: false },
    };
    const matches = dir ? listMatchingAudio(dir, packItem.stemFile) : [];
    const declared = raw.audioFile && dir ? path.join(dir, raw.audioFile) : null;
    const audioPath =
      (declared && existsSync(declared) && raw.audioFile) ||
      matches[0] ||
      null;
    const audioCheck =
      audioPath && dir
        ? validateSpeakingB2HumanAudioFile(path.join(dir, audioPath), {
            mimeType: speakingB2AudioMimeFromName(audioPath),
          })
        : { ok: false, code: 'AUDIO_MISSING' };
    const classified = classifySpeakingB2PilotSample(raw, {
      audioPath: audioCheck.ok ? audioPath : null,
    });
    return {
      ...packItem,
      ...classified,
      audioPresent: Boolean(audioCheck.ok),
      audioCode: audioCheck.ok ? null : audioCheck.code,
      transcriptPresent: Boolean(preserveSpeakingB2HumanTranscript(raw.humanTranscript)),
    };
  });
  const ready = items.filter((item) => item.status === 'ready');
  return {
    packId: SPEAKING_B2_HUMAN_PILOT_ID,
    setVersion: SPEAKING_B2_HUMAN_PILOT_SET,
    items,
    readyCount: ready.length,
    draftCount: items.length - ready.length,
    status: ready.length === items.length ? 'ready' : 'PENDING',
    humanValidationApproved: false,
    reason:
      ready.length === 0
        ? 'no_authorized_human_recordings'
        : ready.length < items.length
          ? 'pilot_incomplete'
          : 'authorized_samples_present_needs_eval',
  };
}
