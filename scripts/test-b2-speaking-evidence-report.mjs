import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSpeakingEvidenceReport,
  formatMinimalTranscriptForEvidenceTest,
  applyEvidenceCapsToScores,
  capEstimatedLevel,
  enforceTotalCapOnScores,
} from '../src/features/speaking/services/evaluation/speaking-evidence-report.ts';
import {
  buildB2SpeakingScoreReport,
  estimateB2LevelFromSpeakingTotal,
} from '../src/features/speaking/domain/b2-speaking-score.ts';

const SAMPLE_LINES = [
  'i am from madrid',
  'i work like an engnieer there',
  'I work with EDM machines that are used to make turbines for aerospace and energy',
  'the edm machiens remove material with electricity, it creates a spark thanks to the difernce of potential between the piece and the electrode that is in the head.',
  'i was inspired from my brother in law that worked in the company and advised me to join this company',
  'ya he hecho 5 partes cuando acaba esto?',
];

test('sample incomplete transcript cannot receive full B2 score', () => {
  const transcript = formatMinimalTranscriptForEvidenceTest(SAMPLE_LINES);
  const evidence = buildSpeakingEvidenceReport(transcript, { partsCompleted: [1] });

  assert.equal(evidence.canProvideFullScore, false);
  assert.equal(evidence.partialFeedback, true);
  assert.equal(evidence.isCompleteExam, false);
  assert.equal(evidence.nonEnglishDetected, true);
  assert.ok(evidence.partsMissing.includes(2));
  assert.ok(evidence.totalCandidateWordCount < 120);
  assert.ok(evidence.maxTotalCap != null && evidence.maxTotalCap <= 30);

  const generousLlm = {
    grammar_vocabulary: 3.5,
    discourse_management: 3.5,
    pronunciation: 4,
    interactive_communication: 3,
    global_achievement: 3.5,
  };
  const capped = enforceTotalCapOnScores(
    applyEvidenceCapsToScores(generousLlm, evidence),
    evidence.maxTotalCap,
  );
  const report = buildB2SpeakingScoreReport(capped);
  const level = capEstimatedLevel(report.estimatedLevel, evidence.maxLevelCap);

  assert.ok(report.total <= 30, `total ${report.total} should be capped`);
  assert.notEqual(level, 'B2');
  assert.notEqual(level, 'C1');
  assert.match(evidence.message, /not a complete speaking exam/i);
});

test('full exam evidence requires four parts and minimum words', () => {
  const transcript = [
    'Part 1 - Interview\n' + Array.from({ length: 5 }, (_, i) => `Candidate: Answer ${i + 1} with enough words here today.`).join('\n'),
    'Part 2 - Long turn\n' + 'Candidate: ' + Array.from({ length: 110 }, (_, i) => `word${i}`).join(' '),
    'Part 3 - Collaborative task\nCandidate: I agree with that idea because it helps everyone.\nCandidate: Maybe we should choose option B for practical reasons.',
    'Part 4 - Discussion\nCandidate: In my opinion technology helps society in many useful ways.\nCandidate: Older people and younger people may prefer different hobbies for cultural reasons.',
  ].join('\n\n');

  const evidence = buildSpeakingEvidenceReport(transcript, { partsCompleted: [1, 2, 3, 4] });
  assert.equal(evidence.canScoreAsFullExam, true);
  assert.equal(evidence.canProvideFullScore, true);
  assert.equal(evidence.nonEnglishDetected, false);
});

test('non-English caps global achievement', () => {
  const evidence = buildSpeakingEvidenceReport(
    formatMinimalTranscriptForEvidenceTest(['hello', 'ya he hecho esto']),
    {},
  );
  assert.equal(evidence.nonEnglishDetected, true);
  assert.equal(evidence.criterionCaps.global_achievement, 2);
});

test('capped level never exceeds B1 for very short output', () => {
  const evidence = buildSpeakingEvidenceReport(
    formatMinimalTranscriptForEvidenceTest(['short answer only']),
    {},
  );
  const report = buildB2SpeakingScoreReport({ global_achievement: 3.5 });
  const level = capEstimatedLevel(report.estimatedLevel, evidence.maxLevelCap);
  assert.notEqual(level, 'B2');
  assert.ok((evidence.maxTotalCap ?? 60) <= 30);
  assert.ok(estimateB2LevelFromSpeakingTotal(Math.min(report.total, evidence.maxTotalCap ?? 30)) !== 'B2');
});

test('Part 1 only transcript detects candidate words and missing parts 2-4', () => {
  const transcript = [
    `Part 1 - Interview
Examiner: Let's begin. Do you work or are you a student at the moment?
Candidate: I work like an engineer in a company.
Examiner: Can you tell me about the town or city where you live?
Candidate: I am from Madrid. It is big and there are many people.
Examiner: What do you enjoy doing in your free time?
Candidate: I like watch TV and sometimes I play football.
Examiner: How do people usually get around in your area?
Candidate: People go by car and metro. It is normal.
Examiner: Is there anything new you would like to learn or achieve?
Candidate: I want learn more English because it is important for my job.`,
    'Part 2 - Long turn\n[Not completed — no transcript for this part.]',
    'Part 3 - Collaborative task\n[Not completed — no transcript for this part.]',
    'Part 4 - Discussion\n[Not completed — no transcript for this part.]',
  ].join('\n\n');

  const evidence = buildSpeakingEvidenceReport(transcript, { partsCompleted: [1] });

  assert.ok(evidence.partsPresent.includes(1));
  assert.equal(evidence.candidateTurnCountByPart[1], 5);
  assert.ok(evidence.totalCandidateWordCount > 0);
  assert.deepEqual(evidence.partsMissing, [2, 3, 4]);
  assert.ok(!evidence.partsMissing.includes(1));
  assert.equal(evidence.canProvideFullScore, false);
});

test('Student and User labels are recognized as candidate speech', () => {
  const transcript = [
    `Part 1 - Interview
Examiner: Hello
Student: I am from Madrid.`,
    'Part 2 - Long turn\n[Not completed — no transcript for this part.]',
    'Part 3 - Collaborative task\n[Not completed — no transcript for this part.]',
    'Part 4 - Discussion\n[Not completed — no transcript for this part.]',
  ].join('\n\n');

  const evidence = buildSpeakingEvidenceReport(transcript, {});
  assert.ok(evidence.totalCandidateWordCount > 0);
  assert.ok(evidence.partsPresent.includes(1));
});
