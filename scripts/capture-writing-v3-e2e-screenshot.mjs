/**
 * Save a slim UI fixture from the Phase 10 E2E run for /dralo-dev/writing-v3?fixture=e2e-live
 * and capture a desktop screenshot when a local server is available.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs', 'writing-v3', 'beta', 'e2e-last-run.json');
const FIXTURE = path.join(
  ROOT,
  'src',
  'features',
  'writing',
  '__tests__',
  'fixtures',
  'ui',
  'e2e-live.json',
);
const OUT_SHOT = path.join(ROOT, 'docs', 'writing-v3', 'beta', 'e2e-feedback-desktop.png');

if (!fs.existsSync(SRC)) {
  console.error('Missing', SRC, '— run npm run writing:e2e-v3 first');
  process.exit(2);
}

const run = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!run.ok || !run.feedback_payload) {
  console.error('E2E run was not successful');
  process.exit(1);
}

const fixture = {
  id: 'e2e-live',
  label: 'Phase 10 real E2E (not a golden fixture)',
  candidate_response: run.candidate_response,
  task_prompt: run.task_prompt_snapshot,
  feedback_payload: run.feedback_payload,
  provenance: {
    execution_id: run.execution_id,
    model: run.model,
    generated_at: run.generated_at,
    persistence: run.persistence,
  },
};

fs.writeFileSync(FIXTURE, JSON.stringify(fixture, null, 2), 'utf8');
console.log('wrote', path.relative(ROOT, FIXTURE));

const base = process.env.WRITING_V3_BASE_URL || 'http://localhost:3000';
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`${base}/dralo-dev/writing-v3/?fixture=e2e-live`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForSelector('.writing-map__text', { timeout: 90_000 });
  await page.waitForTimeout(400);
  fs.mkdirSync(path.dirname(OUT_SHOT), { recursive: true });
  await page.screenshot({ path: OUT_SHOT, fullPage: true });
  await browser.close();
  console.log('screenshot', path.relative(ROOT, OUT_SHOT));
} catch (err) {
  console.warn('screenshot skipped:', err.message || err);
  console.warn('Start npm run dev and re-run: node scripts/capture-writing-v3-e2e-screenshot.mjs');
}
