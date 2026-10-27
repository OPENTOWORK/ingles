export function isSpeakingB2FixtureRuntime({
  nodeEnv = process.env.NODE_ENV,
  vercel = process.env.VERCEL,
  flag = process.env.SPEAKING_B2_FIXTURE_MODE,
} = {}) {
  if (nodeEnv === 'production' || vercel === '1') return false;
  if (flag === '0' || flag === 'false') return false;
  return nodeEnv === 'development' || flag === '1';
}

export function createSpeakingB2FixtureQuota() {
  return {
    async check() {
      return { ok: true, skipped: true };
    },
    async charge() {
      return { ok: true, skipped: true };
    },
  };
}

export const SPEAKING_B2_FIXTURE_OWNER = 'fixture-local';

export function canUseSpeakingB2FixtureAnswer(session, runtime = isSpeakingB2FixtureRuntime()) {
  return Boolean(runtime && session?.fixtureMode);
}
