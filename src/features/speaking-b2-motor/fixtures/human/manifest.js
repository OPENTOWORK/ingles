import { getSpeakingB2Question } from '../../domain/question-bank/sp-ex001-part1.js';

export const SPEAKING_B2_HUMAN_SET_PREFIX = 'human-';
export const SPEAKING_B2_HUMAN_DEFAULT_DIR = 'local/speaking-b2-human';

const REQUIRED = ['id', 'questionId', 'humanTranscript', 'authorization', 'setVersion'];

/** Keep spoken form. Do not fix grammar, repeats or self-corrections. */
export function preserveSpeakingB2HumanTranscript(text) {
  return String(text ?? '').replace(/^\s+|\s+$/g, '');
}

export function emptySpeakingB2HumanManifest(setVersion = 'human-v1') {
  return {
    setVersion,
    authorizationNote:
      'Only import recordings with explicit consent for internal Speaking Motor validation. Do not commit identifiable audio.',
    samples: [],
  };
}

export function validateSpeakingB2HumanSample(raw = {}, { requireAudioFile = true } = {}) {
  const errors = [];
  for (const key of REQUIRED) {
    if (raw[key] == null || raw[key] === '') errors.push(`missing_${key}`);
  }
  const question = getSpeakingB2Question(raw.questionId);
  if (raw.questionId && !question && raw.questionId !== 'SP-EX001-P1-INTRO') {
    errors.push('unknown_question');
  }
  if (requireAudioFile && !String(raw.audioFile || '').trim()) errors.push('missing_audio_file');
  if (String(raw.audioFile || '').includes('..')) errors.push('unsafe_audio_path');

  const auth = raw.authorization || {};
  if (auth.granted !== true) errors.push('authorization_not_granted');
  if (!String(auth.purpose || '').trim()) errors.push('missing_authorization_purpose');
  if (!String(auth.scope || '').trim()) errors.push('missing_authorization_scope');
  if (!/local|internal|dev/i.test(String(auth.scope || ''))) {
    errors.push('authorization_scope_not_local');
  }

  const level = raw.estimatedLevel == null ? null : String(raw.estimatedLevel).trim();
  if (level) {
    if (raw.levelVerified !== true) errors.push('level_not_verified');
    if (!String(raw.levelVerifier || raw.notes || '').trim()) errors.push('level_missing_verifier');
  }

  if (raw.language && !/^en/i.test(String(raw.language))) {
    errors.push('language_not_english');
  }
  const transcript = preserveSpeakingB2HumanTranscript(raw.humanTranscript);
  if (!transcript) errors.push('empty_human_transcript');
  if (!String(raw.setVersion || '').startsWith(SPEAKING_B2_HUMAN_SET_PREFIX) && raw.setVersion) {
    // allow human-v1 etc.; also accept exact human-* 
    if (!/^human[-_]/i.test(String(raw.setVersion))) errors.push('invalid_set_version');
  }

  return {
    ok: errors.length === 0,
    errors,
    sample: errors.length
      ? null
      : {
          id: String(raw.id),
          questionId: String(raw.questionId),
          question: raw.question || question?.question || '',
          audioFile: String(raw.audioFile || ''),
          humanTranscript: transcript,
          durationMs: Number(raw.durationMs || 0) || null,
          language: raw.language || 'en',
          estimatedLevel: level,
          levelVerified: Boolean(raw.levelVerified),
          microphone: raw.microphone || 'unknown',
          notes: String(raw.notes || ''),
          authorization: {
            granted: true,
            purpose: String(auth.purpose),
            scope: String(auth.scope),
            identifiable: Boolean(auth.identifiable),
            consentRef: String(auth.consentRef || ''),
            recordedAt: auth.recordedAt || null,
          },
          setVersion: String(raw.setVersion),
          speakerId: raw.speakerId || null,
          sessionId: raw.sessionId || null,
          captureKind: raw.captureKind === 'live-interview' ? 'live-interview' : 'isolated-answer',
          authenticity: 'human-authorized',
          humanRecording: true,
        },
  };
}

export function validateSpeakingB2HumanManifest(raw = {}) {
  const samples = Array.isArray(raw.samples) ? raw.samples : [];
  const ids = new Set();
  const items = [];
  const errors = [];
  if (!String(raw.setVersion || '').trim()) errors.push('missing_set_version');
  for (const entry of samples) {
    const checked = validateSpeakingB2HumanSample({ ...entry, setVersion: entry.setVersion || raw.setVersion });
    if (!checked.ok) {
      errors.push({ id: entry?.id || 'unknown', errors: checked.errors });
      continue;
    }
    if (ids.has(checked.sample.id)) {
      errors.push({ id: checked.sample.id, errors: ['duplicate_id'] });
      continue;
    }
    ids.add(checked.sample.id);
    items.push(checked.sample);
  }
  return {
    ok: errors.length === 0,
    errors,
    setVersion: raw.setVersion || 'human-v1',
    samples: items,
  };
}
