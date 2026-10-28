import { readSpeakingB2TestTargetFromEnv } from '../src/features/speaking-b2-motor/services/test-target-guard.js';

const target = readSpeakingB2TestTargetFromEnv();
const report = {
  phase: 'V2.3',
  remoteExecution: target.ok ? 'allowed' : 'stopped',
  target,
  reason:
    target.code === 'MISSING_TEST_URL'
      ? 'No hay SPEAKING_B2_TEST_DATABASE_URL / SPEAKING_B2_TEST_SUPABASE_URL.'
      : target.code === 'PROD_REFUSED'
        ? 'La URL o el ref apuntan a ENGLISH_PROD / dralo.es. Ejecución remota detenida.'
        : target.code === 'NOT_AUTHORIZED'
          ? 'Falta SPEAKING_B2_TEST_AUTHORIZED=YES_ISOLATED_SPEAKING_TEST.'
          : target.code === 'REF_MISMATCH'
            ? 'SPEAKING_B2_TEST_PROJECT_REF no coincide con el host.'
            : 'Objetivo de prueba autorizado.',
};
console.log(JSON.stringify(report, null, 2));
if (!target.ok) process.exitCode = 2;
