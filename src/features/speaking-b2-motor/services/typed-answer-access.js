import { canUseSpeakingB2FixtureAnswer } from '../fixtures/runtime.js';

export function canSubmitSpeakingB2TypedAnswer({
  session,
  isAdmin = false,
  runtime,
} = {}) {
  if (isAdmin === true) return true;
  return canUseSpeakingB2FixtureAnswer(session, runtime);
}
