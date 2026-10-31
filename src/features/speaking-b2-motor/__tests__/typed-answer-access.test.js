import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { canSubmitSpeakingB2TypedAnswer } from '../services/typed-answer-access.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('speaking B2 typed answers', () => {
  it('allows typed answers for every role', () => {
    assert.equal(canSubmitSpeakingB2TypedAnswer({ session: { fixtureMode: false }, isAdmin: true }), true);
    assert.equal(canSubmitSpeakingB2TypedAnswer({ session: { fixtureMode: false }, isAdmin: false }), true);
    assert.equal(canSubmitSpeakingB2TypedAnswer({ session: { fixtureMode: true }, isAdmin: false }), true);
  });

  it('opens the typed fallback for every role', () => {
    const motor = readFileSync(
      path.join(root, 'src/features/speaking-b2-motor/ui/SpeakingMotorV1.js'),
      'utf8',
    );
    assert.match(motor, /canStartSpeakingB2Interview/);
    assert.equal(motor.includes('isAdminRole'), false);
    assert.equal(motor.includes('As admin you can continue without a microphone'), false);
    assert.match(motor, /Continue without microphone/);
    assert.match(motor, /startExam\(\{ typed: true \}\)/);
    assert.match(motor, /Start the interview/);
    assert.equal(motor.includes('typed || isAdminRef.current'), false);
    assert.match(motor, /typedModeRef/);
    assert.match(motor, /ExaminerVoiceVisualizer/);
    assert.match(motor, /SpeakingExerciseControls/);
    assert.match(motor, /prefetchSpeakingB2Line/);
    assert.equal(motor.includes('{examinerText ||'), false);
    assert.equal(motor.includes('candidateText'), false);

    const turn = readFileSync(path.join(root, 'src/app/api/speaking-b2/turn/route.js'), 'utf8');
    assert.match(turn, /TYPED_FORBIDDEN/);
    assert.match(turn, /canSubmitSpeakingB2TypedAnswer/);
    assert.match(turn, /speakingB2RequestIsAdmin/);
  });
});
