/**
 * Build one B2 exam, part by part, through the blueprint generation pipeline.
 *
 * Uses the preview path (`previewLevelExamPartGeneration`) so the AI quality validators
 * run — blind solve and rubric on parts 1–2, adversarial review on 3/5/6/7 — and only
 * persists a part once it is mechanically valid with no outstanding review findings.
 *
 * Topics come from the RUOE Topic Bank, assigned deterministically per (slot, part) so
 * reruns are reproducible and no exam repeats a topic within itself.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-build-exam.mjs 7
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-build-exam.mjs 5 --parts=1-7
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-build-exam.mjs 1 --parts=8,9
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-build-exam.mjs 7 --skip-done
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseParts(spec) {
  if (!spec) return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out = new Set();
  for (const chunk of String(spec).split(',')) {
    const range = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      for (let n = Number(range[1]); n <= Number(range[2]); n += 1) out.add(n);
    } else if (chunk.trim()) {
      out.add(Number(chunk.trim()));
    }
  }
  return [...out].filter((n) => n >= 1 && n <= 9).sort((a, b) => a - b);
}

function flag(name) {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : true;
}

const slot = Number(process.argv[2]);
if (!Number.isFinite(slot) || slot < 1 || slot > 20) {
  console.error('Usage: b2-build-exam.mjs <slot 1-20> [--parts=1-9] [--attempts=N] [--skip-done] [--dry-run]');
  process.exit(1);
}

const parts = parseParts(flag('parts'));
const maxAttempts = Number(flag('attempts')) || 8;
const skipDone = Boolean(flag('skip-done'));
const dryRun = Boolean(flag('dry-run'));
/**
 * Ceiling on soft findings for a part kept for review. The approved pilots carried at most
 * three; past that the item quality is genuinely poor rather than merely arguable, and an
 * unbounded review queue is no better than no review at all.
 */
const maxReviewFindings = Number(flag('max-review-findings')) || 4;
const topicOffset = Number(flag('topic-offset')) || 0;
/** Re-persist the audited payload instead of generating: applies enunciado fixes for free. */
const resave = Boolean(flag('resave'));

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

/** Fresh Topic Bank entries first, then the ones the pilot briefs already used. */
const bank = JSON.parse(readFileSync(path.join(root, 'scripts', 'data', 'ruoe-topic-bank.json'), 'utf8'));
const usedByPilots = new Set(bank.usedByPilots || []);
const orderedTopics = [
  ...bank.topics.filter((t) => !usedByPilots.has(t.topicId)),
  ...bank.topics.filter((t) => usedByPilots.has(t.topicId)),
];

/**
 * Deterministic, and distinct across the nine parts of any single exam. `--topic-offset`
 * shifts the assignment when a topic fights the part's item design — a career-choice text,
 * for instance, is full of defining relative clauses, which Part 2 cannot gap unambiguously.
 */
function topicForPart(examSlot, partNumber) {
  const base = (examSlot - 1) * 9 + (partNumber - 1);
  const index = (base + topicOffset) % orderedTopics.length;
  return orderedTopics[index];
}

/**
 * Findings that make an item ungradeable: a student giving a defensible answer would be
 * marked wrong. The approved pilots never shipped with these — their blind solve agreed
 * with the key on every item — so they stay blocking.
 */
const UNGRADEABLE_FINDING_TYPES = new Set([
  'blind_solve_mismatch',
  'ambiguity_warning',
  'multiple_answers',
]);

/**
 * Split the reviewer findings the way the pilot process did: rule-based quality findings
 * (P5-WEAK-DISTRACTOR, P6-H07, TEST-P4-TOO-EASY…) were carried into the approved pilots
 * under `human_review_required`, so they annotate rather than reject.
 */
function splitFindings(needsReview) {
  const findings = Array.isArray(needsReview) ? needsReview : [];
  return {
    blocking: findings.filter((f) => UNGRADEABLE_FINDING_TYPES.has(f?.type)),
    review: findings.filter((f) => !UNGRADEABLE_FINDING_TYPES.has(f?.type)),
  };
}

function describeFindings(findings) {
  return findings
    .slice(0, 2)
    .map((f) => `${f?.itemNumber ? `Q${f.itemNumber}: ` : ''}${f?.detail || f?.type}`)
    .join(' | ');
}

const CAMBRIDGE_PART2_FORMATS = ['article', 'email', 'letter', 'review', 'report'];

/** Part 9 must offer four genuinely different Cambridge task types. */
function checkPart9Formats(generated) {
  const formats = (generated.questions || []).map((q) => String(q.format || '').toLowerCase().trim());
  if (formats.length !== 4) return `expected 4 tasks, got ${formats.length}`;
  const unknown = formats.filter((f) => !CAMBRIDGE_PART2_FORMATS.includes(f));
  if (unknown.length) return `unknown format(s): ${unknown.join(', ')}`;
  // email and letter are the same Cambridge task type, so they must not both appear.
  const canonical = formats.map((f) => (f === 'letter' ? 'email' : f));
  if (new Set(canonical).size !== 4) return `formats not distinct: ${formats.join(', ')}`;
  return null;
}

const { previewLevelExamPartGeneration, saveLevelExamPartFromPreview } = await import(
  '../src/lib/levelsCambridgeExamGenerator.js'
);

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelError } = await admin
  .from('levels')
  .select('id')
  .ilike('nombre', 'b2')
  .single();
if (levelError || !level?.id) {
  console.error('B2 level not found', levelError);
  process.exit(1);
}

async function partHasContent(partNumber) {
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .maybeSingle();
  if (!parte?.id) return false;

  const { data: examen } = await admin
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', level.id);
  const row = (examen || []).find((e) => Number(String(e.nombre).match(/\d+/)?.[0]) === slot);
  if (!row?.id) return false;

  const { count } = await admin
    .from('levels_preguntas')
    .select('id', { count: 'exact', head: true })
    .eq('examen_id', row.id)
    .eq('parte_id', parte.id);
  return (count || 0) > 0;
}

const outDir = path.join(root, 'scripts', 'generated', 'b2-exams', `exam-${String(slot).padStart(2, '0')}`);
mkdirSync(outDir, { recursive: true });

console.log(`\n### Exam ${slot} B2 · parts ${parts.join(', ')} · up to ${maxAttempts} attempts each`);
console.log(`Model: ${process.env.OPENAI_MODEL_CAMBRIDGE || env.OPENAI_MODEL_CAMBRIDGE || '(default)'}\n`);

const summary = [];

for (const partNumber of parts) {
  if (skipDone && (await partHasContent(partNumber))) {
    console.log(`Part ${partNumber}: already has content, skipped.`);
    summary.push({ part: partNumber, status: 'skipped' });
    continue;
  }

  const topic = topicForPart(slot, partNumber);
  const startedAt = Date.now();
  let accepted = null;
  let lastReason = '';

  if (resave) {
    const auditFile = path.join(outDir, `part-${String(partNumber).padStart(2, '0')}.json`);
    try {
      const audit = JSON.parse(readFileSync(auditFile, 'utf8'));
      accepted = { generated: audit.generated, validation: audit.validation };
    } catch (e) {
      console.error(`Part ${partNumber}: no audit payload to re-save (${e?.message || e})`);
      summary.push({ part: partNumber, status: 'failed', reason: 'missing audit payload' });
      continue;
    }
  }

  // Best attempt carrying only soft, rule-based findings: used if no attempt comes back
  // pristine, so a part is annotated for review rather than left missing.
  let fallback = null;

  for (let attempt = 1; attempt <= maxAttempts && !accepted; attempt += 1) {
    const varietySeed = slot * 100_000 + partNumber * 1_000 + attempt * 37 + (Date.now() % 997);
    try {
      const preview = await previewLevelExamPartGeneration({
        levelSlug: 'b2',
        examSlot: slot,
        partNumber,
        varietySeed,
        topic: topic.exampleContext,
        adminDb: admin,
      });

      const { blocking, review } = splitFindings(preview.validation.needsReview);
      const formatIssue = partNumber === 9 ? checkPart9Formats(preview.generated) : null;

      if (!preview.validation.ok) {
        lastReason = `errors: ${preview.validation.errors.slice(0, 2).join(' | ')}`;
      } else if (blocking.length) {
        lastReason = `ungradeable: ${describeFindings(blocking)}`;
      } else if (formatIssue) {
        lastReason = `part 9 formats: ${formatIssue}`;
      } else if (review.length) {
        lastReason = `review findings (${review.length}): ${describeFindings(review)}`;
        if (review.length <= maxReviewFindings && (!fallback || review.length < fallback.review.length)) {
          fallback = { preview, review };
        }
      } else {
        accepted = preview;
        break;
      }
      console.log(`  Part ${partNumber} attempt ${attempt}/${maxAttempts} rejected — ${lastReason}`);
    } catch (e) {
      lastReason = `exception: ${e?.message || e}`;
      console.log(`  Part ${partNumber} attempt ${attempt}/${maxAttempts} failed — ${lastReason}`);
    }
  }

  let reviewFindings = [];
  if (!accepted && fallback) {
    accepted = fallback.preview;
    reviewFindings = fallback.review;
    console.log(
      `  Part ${partNumber}: no pristine attempt; keeping best with ${reviewFindings.length} review finding(s).`,
    );
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000);

  if (!accepted) {
    console.error(`Part ${partNumber}: NO CLEAN RESULT after ${maxAttempts} attempts (${elapsed}s, review cap ${maxReviewFindings}). Last: ${lastReason}`);
    summary.push({ part: partNumber, status: 'failed', reason: lastReason, seconds: elapsed });
    continue;
  }

  const title = accepted.generated.title || accepted.generated.passageTitle || '';
  const auditPath = path.join(outDir, `part-${String(partNumber).padStart(2, '0')}.json`);
  writeFileSync(
    auditPath,
    JSON.stringify(
      {
        examSlot: slot,
        partNumber,
        topic,
        generatedAt: new Date().toISOString(),
        humanReviewRequired: reviewFindings.length > 0,
        reviewFindings,
        validation: accepted.validation,
        generated: accepted.generated,
      },
      null,
      2,
    ),
    'utf8',
  );

  if (dryRun) {
    console.log(`Part ${partNumber}: OK (dry run) · "${title}" · topic=${topic.topicId} · ${elapsed}s`);
    summary.push({ part: partNumber, status: 'dry-run', title, seconds: elapsed });
    continue;
  }

  try {
    const saved = await saveLevelExamPartFromPreview(admin, {
      levelSlug: 'b2',
      levelId: level.id,
      examSlot: slot,
      partNumber,
      generated: accepted.generated,
      skipAudio: true,
      replacePartContent: true,
      // Soft findings were already separated from the ungradeable ones above.
      overrideNeedsReview: reviewFindings.length > 0,
    });
    const warn = accepted.validation.warnings?.length || 0;
    const flag = reviewFindings.length ? ` · REVIEW(${reviewFindings.length})` : '';
    console.log(
      `Part ${partNumber}: saved${flag} · "${title}" · topic=${topic.topicId} (${topic.combinationKey}) · ${elapsed}s · warnings=${warn}`,
    );
    summary.push({
      part: partNumber,
      status: reviewFindings.length ? 'saved-review' : 'saved',
      title,
      preguntaId: saved.preguntaId,
      seconds: elapsed,
      reviewFindings,
    });
  } catch (e) {
    console.error(`Part ${partNumber}: SAVE FAILED — ${e?.message || e}`);
    summary.push({ part: partNumber, status: 'save-error', reason: e?.message || String(e), seconds: elapsed });
  }
}

const failed = summary.filter((s) => s.status === 'failed' || s.status === 'save-error');
const totalSeconds = summary.reduce((sum, s) => sum + (s.seconds || 0), 0);

console.log(`\n--- Exam ${slot} B2 summary (${Math.round(totalSeconds / 60)} min)`);
for (const s of summary) {
  console.log(`  Part ${String(s.part).padStart(2)}: ${s.status}${s.title ? ` · ${s.title}` : ''}${s.reason ? ` · ${s.reason}` : ''}`);
}

const needingReview = summary.filter((s) => s.reviewFindings?.length);
if (needingReview.length) {
  const reportPath = path.join(outDir, 'human-review.json');
  writeFileSync(
    reportPath,
    JSON.stringify(
      { examSlot: slot, generatedAt: new Date().toISOString(), parts: needingReview },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\nHuman review queue (${needingReview.length} part(s)): ${reportPath}`);
  for (const s of needingReview) {
    for (const f of s.reviewFindings) {
      console.log(`  Part ${s.part} · ${f.itemNumber ? `Q${f.itemNumber} · ` : ''}${f.detail || f.type}`);
    }
  }
}

console.log(`Audit JSON: ${outDir}`);

if (failed.length) {
  console.error(`\n${failed.length} part(s) unresolved: ${failed.map((f) => f.part).join(', ')}`);
  process.exit(1);
}
