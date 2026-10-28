import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS } from '@/constants/studentFeatureAccess';
import { NIVELES_LEVEL_HUB } from '@/data/nivelesLevelHub';
import { omitSpeakingExaminerQuestionBlocks } from '@/utils/b2ExamPaperShared';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('previous B2 speaking UI stays in place', () => {
  it('keeps exam-speaking on B2SpeakingExamPractice with the original copy', () => {
    const source = readFileSync(path.join(root, 'src/app/niveles/b2/exam-speaking/page.js'), 'utf8');
    assert.match(source, /import B2SpeakingExamPractice from '@\/components\/b2\/B2SpeakingExamPractice'/);
    assert.match(source, /title="B2 Speaking Practice"/);
    assert.match(source, /subtitle="Parts 1 to 4 — voice examiner simulation"/);
    assert.match(source, /loadingLabel="Loading Speaking \(Parts 1 to 4\)…"/);
    assert.match(source, /refreshLabel="Refresh Speaking \(1–4\)"/);
    assert.equal(source.includes('SpeakingMotorV1'), false);
    assert.equal(source.includes('B2SpeakingExamPage'), false);
    assert.equal(
      existsSync(path.join(root, 'src/app/niveles/b2/exam-speaking/layout.js')),
      false,
      'exam-speaking must not carry a motor-specific layout',
    );
  });

  it('keeps the hub Speaking card locked for students', () => {
    const speaking = NIVELES_LEVEL_HUB.b2.examLinks.find((link) => link.href.includes('exam-speaking'));
    assert.equal(speaking.enabledForStudents, false);
  });

  it('keeps exam-mode Speaking blocked', () => {
    assert.equal(STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS.has('speaking'), true);
  });

  it('embeds SP-EX001 in Part 1 and keeps the old session for Parts 2–4', () => {
    const source = readFileSync(
      path.join(root, 'src/components/b2/B2SpeakingExamPractice.js'),
      'utf8',
    );
    assert.match(source, /import SpeakingMotorV1 from '@\/features\/speaking-b2-motor\/ui\/SpeakingMotorV1'/);
    assert.match(source, /getSkillLocalPartNumber\(partNumber, B2_SPEAKING_PART_MIN\) === 1/);
    assert.match(source, /<SpeakingMotorV1/);
    assert.match(source, /startMode=\{phoneSkillSteps \? speakingMotor\.startMode : 'self'\}/);
    assert.match(source, /onPhoneStartExercise=\{isPart1Motor \? speakingMotor\.beginAudioCheck/);
    assert.match(source, /<B2SpeakingPartSession/);
    assert.match(source, /B2ExamPracticeLayout/);
    assert.match(source, /SkillPartPracticeHeader/);
    assert.equal(source.includes('Start the interview'), false);
    assert.equal(source.includes('SpeakingMotorFixtureHarness'), false);
    assert.equal(source.includes('fixtureMode'), false);
  });

  it('hides every Part 1 examiner prompt from the paper instructions', () => {
    const blocks = [
      { type: 'text', text: 'About 2 minutes' },
      { type: 'text', text: '1. Where are you from?' },
      { type: 'text', text: '4. Tell me about a journey or day out that you remember well.' },
      { type: 'text', text: 'Describe your favourite place.' },
      { type: 'text', text: 'The examiner may ask you to explain your answers or give more details.' },
    ];
    assert.deepEqual(
      omitSpeakingExaminerQuestionBlocks(blocks, 14).map((block) => block.text),
      ['About 2 minutes', 'The examiner may ask you to explain your answers or give more details.'],
    );
  });

  it('keeps the original Start exercise button and only wires Part 1 through it', () => {
    const chrome = readFileSync(path.join(root, 'src/components/b2/B2ExamPracticeChrome.js'), 'utf8');
    assert.match(chrome, /setPhoneStep\('exercise'\)/);
    assert.match(chrome, /onPhoneStartExercise\?\.\(\)/);

    const phoneSteps = readFileSync(path.join(root, 'src/components/exam/ExamPracticePhoneSteps.js'), 'utf8');
    assert.match(phoneSteps, /Start exercise/);
    assert.match(phoneSteps, /phone-practice-step__cta/);
  });
});
