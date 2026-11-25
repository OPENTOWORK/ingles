import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildB1TwentyExamAllocation } from '../src/lib/b1PreliminaryReadingSpec.js';
import { resolveCallModel } from '../src/lib/b1ReadingMotorGuard.js';
import {
  B1_READING_MOTOR_VERSION,
  createFileB1MotorStore,
  createMemoryB1MotorStore,
  createSupabaseB1MotorStore,
  runB1ReadingMotor,
} from '../src/lib/b1ReadingMotorRun.js';

const dryRun = process.argv.includes('--dry-run')
  || ['1', 'true'].includes(String(process.env.B1_MOTOR_DRY_RUN || '').toLowerCase());
const isolatedDevDb = process.argv.includes('--isolated-dev-db');

function readSlot() {
  const inline = process.argv.find((arg) => arg.startsWith('--slot='));
  if (inline) return Number(inline.slice('--slot='.length));
  const index = process.argv.indexOf('--slot');
  if (index >= 0) return Number(process.argv[index + 1]);
  return null;
}

const examSlot = readSlot();
if (!Number.isInteger(examSlot) || examSlot < 1 || examSlot > 20) {
  console.error('Pass --slot with an exam number from 1 to 20.');
  process.exit(1);
}
if (!dryRun && examSlot <= 7) {
  console.error(`Refusing Exam ${examSlot}. Exams 1–7 already exist and must not be overwritten. Use --slot 8 or later.`);
  process.exit(1);
}

const reportDir = path.join(process.cwd(), 'diagnostics', 'b1-reading-motor');
const localCacheDir = path.join(reportDir, 'cache', `exam-${examSlot}`);

function allocationChooser() {
  const plan = buildB1TwentyExamAllocation();
  const exam = plan[examSlot - 1];
  return async ({ partNumber }) => {
    const part = exam.parts.find((item) => item.partNumber === partNumber);
    if (!part) throw new Error(`No topic allocation for Exam ${examSlot} Part ${partNumber}.`);
    return part;
  };
}

let store;
let chooseVariety;
let beforeSaveExam;

if (dryRun) {
  console.log('B1 reading motor dry run: retry and circuit-breaker controls only. No paid API calls and no database writes.');
  store = createMemoryB1MotorStore();
  chooseVariety = allocationChooser();
} else if (isolatedDevDb) {
  const env = loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!(process.env.OPENAI_API_KEY || env.OPENAI_API_KEY)) {
    console.error('Missing OPENAI_API_KEY in .env.local');
    process.exit(1);
  }
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  store = createSupabaseB1MotorStore(admin);
  const {
    chooseB1ReadingVariety,
    recordB1ReadingVariety,
  } = await import('../src/lib/b1ReadingVarietyHistory.js');
  chooseVariety = (args) => chooseB1ReadingVariety(admin, args);
  beforeSaveExam = async (parts) => {
    for (const part of parts) {
      await recordB1ReadingVariety(admin, {
        examSlot,
        partNumber: part.partNumber,
        chosen: part.allocation,
      });
    }
  };
} else {
  const env = loadEnvLocal();
  if (!(process.env.OPENAI_API_KEY || env.OPENAI_API_KEY)) {
    console.error('Missing OPENAI_API_KEY. Put it only in .env.local.');
    process.exit(1);
  }
  const model = resolveCallModel({});
  const validatorModel = String(process.env.DRALO_OPENAI_MODEL_VALIDATOR || '').trim();
  if (model !== 'gpt-4o' || (validatorModel && validatorModel !== 'gpt-4o')) {
    console.error('This pilot is locked to gpt-4o for generation and semantic review.');
    process.exit(1);
  }
  if (String(process.env.DRALO_USE_OPENAI_ASSISTANTS || '').trim() === 'true') {
    console.error('Turn DRALO_USE_OPENAI_ASSISTANTS off. This pilot uses Chat Completions.');
    process.exit(1);
  }
  console.log(`B1 Exam ${examSlot} local pilot. Model gpt-4o. Spend cap USD 1. Four attempts per part. Cache ${localCacheDir}. No Supabase and no live exam tables.`);
  store = createFileB1MotorStore(localCacheDir);
  chooseVariety = allocationChooser();
}

const result = await runB1ReadingMotor({
  examSlot,
  motorVersion: B1_READING_MOTOR_VERSION,
  store,
  dryRun,
  chooseVariety,
  beforeSaveExam,
  reportDir,
});

if (result.report) {
  const usage = result.report.tokens || {};
  console.log(
    `Pilot summary: passed ${JSON.stringify((result.summaries || []).map((row) => row.partNumber))} preserved ${JSON.stringify(result.report.preservedPartNumbers || [])} paid calls ${result.report.paidApiCalls} input ${usage.input} output ${usage.output} source ${usage.source} estimated USD ${result.report.approximateCostUsd}.`,
  );
}

if (result.skipped) {
  console.log(`B1 pilot Exam ${examSlot} already exists in the selected cache; skipping regeneration.`);
  process.exit(0);
}

if (result.stopped) {
  if (dryRun) {
    console.log('Dry run finished without paid API calls. The stop above is the circuit breaker exercising its controls.');
    process.exit(0);
  }
  process.exit(1);
}
