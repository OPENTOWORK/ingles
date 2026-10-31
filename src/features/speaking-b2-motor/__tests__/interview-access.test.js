import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { canStartSpeakingB2Interview } from '../services/interview-access.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const closed = { SPEAKING_B2_OPEN_TO_STUDENTS: '' };
const open = { SPEAKING_B2_OPEN_TO_STUDENTS: '1' };

describe('speaking B2 interview access', () => {
  it('lets only the teaching team start while the interview is closed to students', () => {
    for (const role of ['admin', 'administrador', 'profesor', 'teacher', 'coordinador', 'coordinator', 'informatico', 'it']) {
      assert.equal(canStartSpeakingB2Interview(role, closed), true, role);
    }
    for (const role of ['', 'alumno', 'student', 'marketing', 'soporte', 'support']) {
      assert.equal(canStartSpeakingB2Interview(role, closed), false, role);
    }
  });

  it('admits a signed-in student only when the interview is opened', () => {
    assert.equal(canStartSpeakingB2Interview('alumno', open), true);
    assert.equal(canStartSpeakingB2Interview('teacher', open), true);
    assert.equal(canStartSpeakingB2Interview('', open), false);
  });

  it('enforces the gate when a session is created and does not time the whole open turn', () => {
    const session = readFileSync(path.join(root, 'src/app/api/speaking-b2/session/route.js'), 'utf8');
    assert.match(session, /canStartSpeakingB2Interview/);
    assert.match(session, /SPEAKING_CLOSED/);
    const motor = readFileSync(path.join(root, 'src/features/speaking-b2-motor/ui/SpeakingMotorV1.js'), 'utf8');
    assert.equal(motor.includes('Math.min(25000'), false);
    assert.match(motor, /speechStartedAt/);
    assert.match(motor, /forceSilence: true/);
    assert.match(motor, /turnLabel === 'Checking' \|\| ttsLoading \|\| exercisePaused/);
    const mic = readFileSync(path.join(root, 'src/features/speaking-b2-motor/ui/useSpeakingMic.js'), 'utf8');
    assert.match(mic, /silenceMs: 6000/);
    const turn = readFileSync(path.join(root, 'src/app/api/speaking-b2/turn/route.js'), 'utf8');
    assert.ok(turn.indexOf('session.turns = [') < turn.indexOf('resolveSpeakingB2Turn('));
  });
});
