import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSpeakingB2IssueId, isKnownSpeakingB2ErrorCode } from '../domain/error-taxonomy.js';
import {
  applyInsufficientEvidence,
  evidenceFlagsFromSession,
  readSpeakingB2Scores,
  SPEAKING_B2_SCORE_DISCLAIMER,
} from '../domain/rubric-b2-part1.js';
import { estimateSttConfidence, isUncertainTranscript } from '../domain/stt-quality.js';

describe('speaking B2 taxonomy and evidence', () => {
  it('builds deterministic issue ids', () => {
    assert.equal(
      buildSpeakingB2IssueId({ questionId: 'SP-EX001-P1-Q02', code: 'GR-AR', index: 1 }),
      'SP-EX001-P1-Q02-GR-AR-001',
    );
    assert.equal(isKnownSpeakingB2ErrorCode('GR-AR'), true);
    assert.equal(isKnownSpeakingB2ErrorCode('review_required'), true);
    assert.equal(isKnownSpeakingB2ErrorCode('XX-99'), false);
  });

  it('does not score pronunciation without audio', () => {
    const flags = evidenceFlagsFromSession({
      candidateTurns: [{ transcript: 'I usually visit my family at the weekend because I like talking to them.' }],
      hasAudio: false,
    });
    const scores = applyInsufficientEvidence(
      { pronunciation: 4, grammarVocabulary: 3, discourseManagement: 3, interactiveCommunication: 3, globalAchievement: 3 },
      flags,
    );
    assert.equal(scores.pronunciation, null);
    assert.equal(scores.grammarVocabulary, 3);
    assert.equal(scores.interactiveCommunication, null);
    assert.equal(scores.globalAchievement, null);
  });

  it('does not score pronunciation from audio presence alone', () => {
    const flags = evidenceFlagsFromSession({
      candidateTurns: [
        { transcript: 'I enjoy studying English because I can travel and speak with people at work.' },
        { transcript: 'At the weekend I usually meet my friends and walk around the city centre.' },
      ],
      hasAudio: true,
      acoustic: { hasAudio: true, hasAcousticAnalysis: false },
    });
    assert.equal(flags.pronunciation, false);
    assert.equal(flags.interactiveCommunication, false);
    assert.equal(flags.globalAchievement, false);
    assert.equal(flags.grammarVocabulary, true);
    assert.equal(flags.discourseManagement, true);
  });

  it('recovers valid bands and does not invent them when evidence is thin', () => {
    const recovered = readSpeakingB2Scores({
      grammar_vocabulary: '3,5',
      scores: { discourseManagement: { value: 3 } },
    });
    assert.equal(recovered.grammarVocabulary, 3.5);
    assert.equal(recovered.discourseManagement, 3);

    const thin = evidenceFlagsFromSession({
      candidateTurns: [{ transcript: "We'll see." }],
    });
    assert.equal(thin.grammarVocabulary, false);
    assert.equal(thin.discourseManagement, false);

    const single = evidenceFlagsFromSession({
      candidateTurns: [
        {
          transcript:
            'I prefer familiar places because I already know the transport and I can spend more time with people I trust.',
        },
      ],
    });
    assert.equal(single.grammarVocabulary, true);
    assert.equal(single.discourseManagement, true);
  });

  it('keeps RLS and private bucket in the local SQL review file', () => {
    const sqlPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../scripts/speaking_b2_motor.sql',
    );
    const sql = readFileSync(sqlPath, 'utf8');
    assert.match(sql, /enable row level security/);
    assert.match(sql, /speaking_b2_sessions_select_own/);
    assert.match(sql, /speaking-b2-audio/);
    assert.match(sql, /public = false/);
    assert.match(sql, /Do not apply to production/);
    assert.match(sql, /drop policy if exists "speaking_b2_sessions_select_own"/);
    assert.match(sql, /No public\/authenticated storage policies/);
    assert.match(sql, /access_token_hash/);
    assert.match(sql, /revoke select \(access_token_hash\)/);
    assert.match(sql, /grant select \(access_token_hash\) on public.speaking_b2_sessions to service_role/);
    assert.match(sql, /Staff reads\/writes go through service-role APIs/);
    assert.match(sql, /revoke all on public.speaking_b2_exams from public, anon, authenticated/);
    assert.equal(sql.includes('grant select on public.speaking_b2_exams to anon'), false);
    assert.match(sql, /expires_at/);
  });

  it('marks uncertain transcripts without treating them as scored evidence', () => {
    assert.equal(isUncertainTranscript('[inaudible] hello', 0.9), true);
    assert.equal(isUncertainTranscript('I usually visit my family at the weekend.', 0.8), false);
    assert.ok(estimateSttConfidence('Yes', 'STT') < 0.6);
  });

  it('keeps Spanish pedagogical copy and refuses invented errors', () => {
    const pedagogy = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/evaluation/pedagogy-es.js'),
      'utf8',
    );
    assert.match(pedagogy, /feedback pedagógico en español/);
    assert.match(pedagogy, /No inventes errores/);
    assert.match(pedagogy, /Esta corrección es orientativa/);
    assert.match(pedagogy, /SPEAKING_B2_SCORE_DISCLAIMER/);
    assert.match(SPEAKING_B2_SCORE_DISCLAIMER, /No es una nota oficial de Cambridge/);

    const acoustic = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/evaluation/transcribe-acoustic.js'),
      'utf8',
    );
    assert.match(acoustic, /hasAcousticAnalysis: false/);
    assert.match(acoustic, /isUncertainTranscript/);
  });

  it('keeps the authorised British examiner voice and OpenAI fallback', () => {
    const tts = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../app/api/speaking-b2/tts/route.js'),
      'utf8',
    );
    assert.match(tts, /en-GB-SoniaNeural/);
    assert.match(tts, /openaiVoice: 'nova'/);
    assert.match(tts, /examinerLineIsAuthorised/);
    assert.match(tts, /TTS timeout/);
    assert.match(tts, /\[speaking-b2\/tts\] fallback/);
    assert.match(tts, /x-speaking-tts-engine/);
    assert.match(tts, /edgeOnly: true/);
  });
});
