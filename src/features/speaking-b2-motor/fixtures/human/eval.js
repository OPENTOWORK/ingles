import { resolveSpeakingB2AnswerAudio } from '../../services/evaluation/answer-audio.js';
import { runSpeakingB2Complete } from '../../services/evaluation/run-complete.js';
import { compareSpeakingTranscripts, sttHarmLevel } from '../../domain/transcript-compare.js';
import { loadSpeakingB2HumanBank, readSpeakingB2HumanAudio } from './bank.js';
import { speakingB2PublicHumanSample, redactSpeakingB2AudioValue } from './privacy.js';

function issueCodes(report) {
  return (report?.issues || []).map((issue) => issue.code).filter(Boolean);
}

function buildHumanTextSession(sample, transcript, source) {
  return {
    id: `human-${sample.id}-${source}`,
    examCode: 'SP-EX001',
    persisted: false,
    fixtureMode: true,
    turns: [
      { role: 'examiner', questionId: sample.questionId, transcript: sample.question, source: 'SCRIPT' },
      {
        role: 'candidate',
        questionId: sample.questionId,
        transcript,
        source,
        hasAudio: source === 'STT',
        uncertain: false,
      },
    ],
  };
}

export function compareSpeakingB2HumanVsWhisper({
  humanReport = null,
  whisperReport = null,
  alignment = null,
} = {}) {
  const humanCodes = issueCodes(humanReport);
  const whisperCodes = issueCodes(whisperReport);
  const missedByWhisper = humanCodes.filter((code) => !whisperCodes.includes(code));
  const extraFromWhisper = whisperCodes.filter((code) => !humanCodes.includes(code));
  const humanScores = humanReport?.scores || {};
  const whisperScores = whisperReport?.scores || {};
  const bandDelta = {
    grammarVocabulary:
      humanScores.grammarVocabulary != null && whisperScores.grammarVocabulary != null
        ? Number((whisperScores.grammarVocabulary - humanScores.grammarVocabulary).toFixed(1))
        : null,
    discourseManagement:
      humanScores.discourseManagement != null && whisperScores.discourseManagement != null
        ? Number((whisperScores.discourseManagement - humanScores.discourseManagement).toFixed(1))
        : null,
  };
  const harm = sttHarmLevel(alignment);
  return {
    humanIssueCodes: humanCodes,
    whisperIssueCodes: whisperCodes,
    missedByWhisper,
    extraFromWhisper,
    falsePositivesFromStt: extraFromWhisper,
    falseNegativesFromStt: missedByWhisper,
    bandDelta,
    humanSummary: humanReport?.summaryEs || '',
    whisperSummary: whisperReport?.summaryEs || '',
    sttHarm: harm,
    reviewRequired: harm !== 'none' || missedByWhisper.length > 0 || extraFromWhisper.length > 0,
  };
}

export async function evaluateSpeakingB2HumanSample(sample, {
  evaluate,
  transcribe,
  audioBuffer = null,
  mimeType = 'audio/wav',
  dir,
} = {}) {
  const run = evaluate || ((session) => runSpeakingB2Complete({ session, persist: false }));
  const humanSession = buildHumanTextSession(sample, sample.humanTranscript, 'TYPED');
  const humanReport = await run(humanSession);

  let whisperTranscript = '';
  let sttSource = '';
  let sttExecuted = false;
  let whisperReport = null;
  let grounding = null;
  let audio = audioBuffer
    ? { ok: true, buffer: audioBuffer }
    : sample.audioFile
      ? readSpeakingB2HumanAudio(sample, { dir })
      : { ok: false, code: 'AUDIO_MISSING' };

  if (audio.ok && typeof transcribe === 'function') {
    const resolved = await resolveSpeakingB2AnswerAudio({
      buffer: audio.buffer,
      mimeType: mimeType || audio.mimeType,
      transcribe,
      speakingMs: sample.durationMs || 0,
    });
    sttExecuted = true;
    grounding = resolved.ok ? resolved.stt : { code: resolved.code, error: resolved.error };
    whisperTranscript = resolved.ok ? resolved.stt.text || '' : '';
    sttSource = resolved.ok ? resolved.stt.source : '';
    if (resolved.ok && whisperTranscript && !resolved.stt.uncertain) {
      whisperReport = await run(buildHumanTextSession(sample, whisperTranscript, 'STT'));
    }
  }

  const alignment = compareSpeakingTranscripts(sample.humanTranscript, whisperTranscript);
  const comparison = compareSpeakingB2HumanVsWhisper({ humanReport, whisperReport, alignment });

  return redactSpeakingB2AudioValue({
    sample: speakingB2PublicHumanSample(sample),
    human: {
      transcript: sample.humanTranscript,
      report: humanReport,
    },
    whisper: {
      transcript: whisperTranscript,
      source: sttSource,
      executed: sttExecuted,
      grounding: grounding?.grounding || grounding?.reason || grounding?.code || null,
      uncertain: Boolean(grounding?.uncertain),
      hallucination: Boolean(grounding?.hallucination),
      report: whisperReport,
    },
    alignment,
    comparison,
    status: sttExecuted ? (comparison.reviewRequired ? 'REVIEW' : 'COMPARED') : 'HUMAN_ONLY',
  });
}

export function speakingB2HumanValidationVerdict({ samples = [], items = [] } = {}) {
  if (!samples.length) {
    return {
      status: 'PENDING',
      humanValidationApproved: false,
      reason: 'no_authorized_human_recordings',
    };
  }
  if (samples.every((sample) => sample.authenticity !== 'human-authorized')) {
    return {
      status: 'PENDING',
      humanValidationApproved: false,
      reason: 'synthetic_only',
    };
  }
  if (!items.some((item) => item.whisper?.executed)) {
    return {
      status: 'PENDING',
      humanValidationApproved: false,
      reason: 'stt_not_executed',
    };
  }
  return {
    status: 'REVIEW',
    humanValidationApproved: false,
    reason: 'human_set_present_needs_teacher_review',
  };
}

export async function evaluateSpeakingB2HumanBank(options = {}) {
  const bank = loadSpeakingB2HumanBank(options);
  if (!bank.count) {
    return {
      ...speakingB2HumanValidationVerdict({ samples: [], items: [] }),
      setVersion: bank.setVersion,
      items: [],
      persist: false,
      quotaCharged: false,
    };
  }
  const items = [];
  for (const sample of bank.samples) {
    items.push(await evaluateSpeakingB2HumanSample(sample, { ...options, dir: bank.dir }));
  }
  return {
    ...speakingB2HumanValidationVerdict({ samples: bank.samples, items }),
    setVersion: bank.setVersion,
    items,
    persist: false,
    quotaCharged: false,
  };
}
