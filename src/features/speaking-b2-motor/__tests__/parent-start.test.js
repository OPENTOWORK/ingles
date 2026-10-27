import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import {
  createSpeakingStartLock,
  describeSpeakingMotorLifecycle,
  resolveEmbeddedStartMode,
  SPEAKING_MOTOR_START_MODE,
} from '../ui/speakingMotorParentApi.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('speaking motor parent start interface', () => {
  it('exposes a single start lock so a double click cannot open two sessions', async () => {
    const lock = createSpeakingStartLock();
    let created = 0;
    const begin = async () => {
      if (!lock.acquire()) return { started: false, reason: 'IN_FLIGHT' };
      created += 1;
      await Promise.resolve();
      return { started: true };
    };

    const [first, second] = await Promise.all([begin(), begin()]);
    assert.deepEqual(first, { started: true });
    assert.deepEqual(second, { started: false, reason: 'IN_FLIGHT' });
    assert.equal(created, 1);
    assert.equal(lock.isLocked(), true);
  });

  it('describes when the parent may start and when the interview has already begun', () => {
    assert.deepEqual(describeSpeakingMotorLifecycle({ screen: 'select', busy: false }), {
      screen: 'select',
      busy: false,
      canStart: true,
      interviewStarted: false,
    });
    assert.equal(describeSpeakingMotorLifecycle({ screen: 'select', busy: true }).canStart, false);
    assert.equal(describeSpeakingMotorLifecycle({ screen: 'audio-check' }).canStart, false);
    assert.equal(describeSpeakingMotorLifecycle({ screen: 'audio-check' }).interviewStarted, true);
  });

  it('keeps the parent in control on the original Speaking page', () => {
    assert.equal(resolveEmbeddedStartMode(true), SPEAKING_MOTOR_START_MODE.parent);
    assert.equal(resolveEmbeddedStartMode(false), SPEAKING_MOTOR_START_MODE.self);

    const practice = readFileSync(path.join(root, 'src/components/b2/B2SpeakingExamPractice.js'), 'utf8');
    assert.match(practice, /useSpeakingMotorParent/);
    assert.match(practice, /onPhoneStartExercise=\{isPart1Motor \? speakingMotor\.beginAudioCheck/);
    assert.match(practice, /startMode=\{phoneSkillSteps \? speakingMotor\.startMode : 'self'\}/);
    assert.match(practice, /ref=\{speakingMotor\.motorRef\}/);
    assert.equal(practice.includes('<SpeakingMotorV1 embedded />'), false);

    const motor = readFileSync(
      path.join(root, 'src/features/speaking-b2-motor/ui/SpeakingMotorV1.js'),
      'utf8',
    );
    assert.match(motor, /useImperativeHandle/);
    assert.match(motor, /beginAudioCheck/);
    assert.match(motor, /createSpeakingStartLock/);
    assert.match(motor, /if \(parentControlled\)/);
    assert.match(motor, /await mic\.startPreview\(\)/);
    assert.equal(motor.indexOf('await mic.startPreview()') > motor.indexOf('beginAudioCheck'), true);

    const chrome = readFileSync(path.join(root, 'src/components/b2/B2ExamPracticeChrome.js'), 'utf8');
    assert.match(chrome, /onPhoneStartExercise = null/);
    assert.match(chrome, /onPhoneStartExercise\?\.\(\)/);

    const phoneSteps = readFileSync(path.join(root, 'src/components/exam/ExamPracticePhoneSteps.js'), 'utf8');
    assert.match(phoneSteps, /className="phone-practice-step__cta"/);
    assert.match(phoneSteps, /Start exercise/);
    assert.match(phoneSteps, /Empezar ejercicio/);
  });
});
