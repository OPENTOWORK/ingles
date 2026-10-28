import { spawn } from 'node:child_process';
import { readSpeakingB2TestTargetFromEnv } from '../src/features/speaking-b2-motor/services/test-target-guard.js';

const mode = process.argv[2] || 'status';
const target = readSpeakingB2TestTargetFromEnv();

if (!target.ok) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        mode,
        started: false,
        code: target.code,
        note: 'No se levantan instancias Next. Falta un proyecto Supabase de prueba autorizado.',
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const instances = [
  { name: 'speaking-a', port: process.env.SPEAKING_B2_NEXT_PORT_A || '3011', dist: '.next-speaking-a' },
  { name: 'speaking-b', port: process.env.SPEAKING_B2_NEXT_PORT_B || '3012', dist: '.next-speaking-b' },
];

if (mode !== 'start') {
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode,
        started: false,
        instances,
        note: 'Pasa start para levantar las dos instancias contra el proyecto de prueba.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const children = instances.map((instance) => {
  const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'dev', '-p', instance.port], {
    env: {
      ...process.env,
      PORT: instance.port,
      SPEAKING_B2_NEXT_DIST: instance.dist,
      NEXT_PUBLIC_SUPABASE_URL: process.env.SPEAKING_B2_TEST_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SPEAKING_B2_TEST_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SPEAKING_B2_TEST_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.SPEAKING_B2_TEST_DATABASE_URL,
    },
    stdio: 'inherit',
    windowsHide: true,
  });
  return { ...instance, pid: child.pid };
});

console.log(JSON.stringify({ ok: true, mode: 'start', started: true, children }, null, 2));
