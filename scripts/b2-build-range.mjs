/**
 * Build a range of B2 exams strictly one at a time.
 *
 * Each exam runs in its own child process so a crash or a leaked handle in one exam
 * cannot take the rest of the run down, and so progress survives an interruption:
 * re-invoking with the same arguments resumes because `--skip-done` leaves parts that
 * already have content alone.
 *
 * Usage:
 *   node scripts/b2-build-range.mjs 7-20
 *   node scripts/b2-build-range.mjs 6 --regenerate      # ignore existing content
 *   node scripts/b2-build-range.mjs 7-20 --attempts=4
 */
import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function flag(name) {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : true;
}

const rangeArg = process.argv[2];
const range = String(rangeArg || '').match(/^(\d+)(?:\s*-\s*(\d+))?$/);
if (!range) {
  console.error('Usage: b2-build-range.mjs <slot|from-to> [--parts=1-9] [--attempts=N] [--regenerate]');
  process.exit(1);
}

const from = Number(range[1]);
const to = Number(range[2] ?? range[1]);
const slots = [];
for (let s = from; s <= to; s += 1) slots.push(s);

const attempts = flag('attempts') || '4';
const partsSpec = flag('parts') || '1-9';
const regenerate = Boolean(flag('regenerate'));
const maxReviewFindings = flag('max-review-findings');

const logDir = path.join(root, 'scripts', 'generated', 'b2-exams');
mkdirSync(logDir, { recursive: true });
const logPath = path.join(logDir, 'build-range.log');

function log(line) {
  console.log(line);
  appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, 'utf8');
}

/** Resolves with the child's exit code instead of rejecting, so one bad exam is not fatal. */
function buildExam(slot) {
  return new Promise((resolve) => {
    const args = [
      '--loader',
      './scripts/alias-loader.mjs',
      'scripts/b2-build-exam.mjs',
      String(slot),
      `--parts=${partsSpec}`,
      `--attempts=${attempts}`,
    ];
    if (!regenerate) args.push('--skip-done');
    if (maxReviewFindings) args.push(`--max-review-findings=${maxReviewFindings}`);

    const child = spawn(process.execPath, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let buffered = '';

    const consume = (chunk) => {
      buffered += chunk.toString();
      const lines = buffered.split('\n');
      buffered = lines.pop() || '';
      for (const line of lines) {
        // The generator is chatty about assistant fallbacks and Node loader warnings.
        if (/ExperimentalWarning|MODULE_TYPELESS|Reparsing|trace-warnings|register\(|draloAiEngine|exam-generation/.test(line)) continue;
        if (line.trim()) log(`[E${String(slot).padStart(2, '0')}] ${line.trimEnd()}`);
      }
    };

    child.stdout.on('data', consume);
    child.stderr.on('data', consume);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

log(`=== Building exams ${from}..${to} · parts ${partsSpec} · ${attempts} attempts · ${regenerate ? 'regenerate' : 'skip parts that already have content'}`);
log(`Model: ${process.env.OPENAI_MODEL_CAMBRIDGE || '(from .env.local)'}`);

const started = Date.now();
const results = [];

for (const slot of slots) {
  const t0 = Date.now();
  const code = await buildExam(slot);
  const minutes = Math.round((Date.now() - t0) / 60000);
  results.push({ slot, code, minutes });
  log(`=== Exam ${slot}: ${code === 0 ? 'complete' : `INCOMPLETE (exit ${code})`} · ${minutes} min`);
}

const bad = results.filter((r) => r.code !== 0);
log(`\n=== Range done in ${Math.round((Date.now() - started) / 60000)} min`);
for (const r of results) log(`  Exam ${String(r.slot).padStart(2)}: ${r.code === 0 ? 'complete' : 'INCOMPLETE'} · ${r.minutes} min`);
if (bad.length) {
  log(`Exams needing another pass: ${bad.map((b) => b.slot).join(', ')}`);
  log('Re-run the same command to retry only the parts still missing.');
}
log(`Log: ${logPath}`);
