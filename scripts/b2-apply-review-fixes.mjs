/**
 * Apply the teacher's human-review corrections to already-published B2 RUOE exams.
 *
 * The exams live in Supabase; `scripts/generated/b2-exams/exam-NN/part-NN.json` holds the exact
 * payload that was persisted. This script patches that payload, re-runs the full validator, and
 * only then re-persists — so a correction can never ship a part that would have been rejected at
 * generation time.
 *
 * Corrections are declared in `scripts/data/ruoe-review-fixes.json` rather than edited into the
 * audit files directly, because `scripts/generated/` is gitignored and the fixes need a review
 * trail.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-apply-review-fixes.mjs --exams=5-10
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-apply-review-fixes.mjs --exams=5 --apply
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function flag(name) {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : true;
}

function parseRange(spec, fallback) {
  if (!spec || spec === true) return fallback;
  const out = new Set();
  for (const chunk of String(spec).split(',')) {
    const range = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      for (let n = Number(range[1]); n <= Number(range[2]); n += 1) out.add(n);
    } else if (chunk.trim()) {
      out.add(Number(chunk.trim()));
    }
  }
  return [...out].sort((a, b) => a - b);
}

const exams = parseRange(flag('exams'), [5, 6, 7, 8, 9, 10]);
const parts = parseRange(flag('parts'), [1, 2, 3, 4, 5, 6, 7]);
const apply = Boolean(flag('apply'));

const fixes = JSON.parse(readFileSync(path.join(root, 'scripts', 'data', 'ruoe-review-fixes.json'), 'utf8'));

/** Apply `[find, replace]` pairs to every string in the payload (British spelling sweeps). */
function applyTextReplacements(node, pairs) {
  if (typeof node === 'string') {
    return pairs.reduce((text, [find, replace]) => text.split(find).join(replace), node);
  }
  if (Array.isArray(node)) return node.map((item) => applyTextReplacements(item, pairs));
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, applyTextReplacements(value, pairs)]),
    );
  }
  return node;
}

function patchByNumber(list, patchMap, label) {
  const seen = new Set();
  const next = (list || []).map((entry) => {
    const patch = patchMap[String(entry.number)];
    if (!patch) return entry;
    seen.add(String(entry.number));
    return { ...entry, ...patch };
  });
  const missing = Object.keys(patchMap).filter((n) => !seen.has(n));
  if (missing.length) throw new Error(`${label}: no item numbered ${missing.join(', ')}`);
  return next;
}

function patchByLetter(list, patchMap, label) {
  const seen = new Set();
  const next = (list || []).map((entry) => {
    const patch = patchMap[String(entry.letter)];
    if (!patch) return entry;
    seen.add(String(entry.letter));
    return { ...entry, ...patch };
  });
  const missing = Object.keys(patchMap).filter((l) => !seen.has(l));
  if (missing.length) throw new Error(`${label}: no section lettered ${missing.join(', ')}`);
  return next;
}

function applyPatch(generated, patch, label) {
  let next = { ...generated };

  for (const key of ['title', 'passage', 'passageWordCount', 'matchingIntro', 'sentencePool', 'optionPool']) {
    if (patch[key] !== undefined) next[key] = patch[key];
  }
  if (patch.example) next.example = { ...next.example, ...patch.example };
  if (patch.questions) next.questions = patchByNumber(next.questions, patch.questions, `${label} questions`);
  if (patch.modelAnswers) {
    next.modelAnswers = patchByNumber(next.modelAnswers, patch.modelAnswers, `${label} modelAnswers`);
  }
  if (patch.matchingAnswers) {
    next.matchingAnswers = patchByNumber(next.matchingAnswers, patch.matchingAnswers, `${label} matchingAnswers`);
  }
  if (patch.sections) next.sections = patchByLetter(next.sections, patch.sections, `${label} sections`);
  if (patch.replaceText) next = applyTextReplacements(next, patch.replaceText);
  // Declared per part so that dropping a preview-time AI finding is always a deliberate claim that
  // the item it referred to has been rewritten.
  for (const field of patch.dropFields || []) delete next[field];

  return next;
}

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');

let db = null;
let levelId = null;
let saveLevelExamPartFromPreview = null;

if (apply) {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  ({ saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js'));

  const { data: level, error } = await db.from('levels').select('id').ilike('nombre', 'b2').single();
  if (error || !level?.id) {
    console.error('B2 level not found', error);
    process.exit(1);
  }
  levelId = level.id;
}

console.log(`\n### RUOE review fixes · exams ${exams.join(', ')} · parts ${parts.join(', ')} · ${apply ? 'APPLY' : 'dry run'}\n`);

const summary = [];
let blocked = 0;

for (const examSlot of exams) {
  const examFixes = fixes.exams?.[String(examSlot)];
  if (!examFixes) continue;

  for (const partNumber of parts) {
    const patch = examFixes[String(partNumber)];
    if (!patch) continue;

    const label = `E${String(examSlot).padStart(2, '0')} P${partNumber}`;
    const auditPath = path.join(
      root,
      'scripts',
      'generated',
      'b2-exams',
      `exam-${String(examSlot).padStart(2, '0')}`,
      `part-${String(partNumber).padStart(2, '0')}.json`,
    );

    let audit;
    try {
      audit = JSON.parse(readFileSync(auditPath, 'utf8'));
    } catch (e) {
      console.error(`${label}: cannot read audit payload — ${e?.message || e}`);
      blocked += 1;
      continue;
    }

    let generated;
    try {
      generated = applyPatch(audit.generated, patch, label);
    } catch (e) {
      console.error(`${label}: patch failed — ${e?.message || e}`);
      blocked += 1;
      continue;
    }

    const validation = validateGeneratedExamPart('b2', partNumber, generated);
    const normalized = validation.normalized || generated;
    const hardFails = [...validation.errors, ...(validation.qualityFails || [])];

    // The audit payload carries the `__needsReview` marker from the original preview. It is stale
    // once the flagged item has been rewritten, and the save path refuses to persist while it is
    // present, so rebuild it from this run's verdict instead of trusting the copy on disk.
    if (hardFails.length) {
      normalized.__needsReview = {
        status: 'ambiguity_warning',
        findings: hardFails.map((detail) => ({ itemNumber: null, type: 'quality_fail', detail })),
        detectedAt: new Date().toISOString(),
      };
    } else {
      delete normalized.__needsReview;
    }

    if (hardFails.length) {
      console.error(`${label}: BLOCKED — ${hardFails.slice(0, 3).join(' | ')}`);
      blocked += 1;
      summary.push({ label, status: 'blocked', notes: patch.notes });
      continue;
    }

    const warn = validation.warnings?.length || 0;
    const review = validation.needsReview?.length || 0;

    if (!apply) {
      console.log(`${label}: ok (dry run) · warnings=${warn} · review=${review}`);
      for (const w of validation.warnings || []) console.log(`    warn: ${w}`);
      for (const r of validation.needsReview || []) console.log(`    review: ${r.detail || r.type}`);
      summary.push({ label, status: 'dry-run', notes: patch.notes });
      continue;
    }

    try {
      await saveLevelExamPartFromPreview(db, {
        levelSlug: 'b2',
        levelId,
        examSlot,
        partNumber,
        generated: normalized,
        skipAudio: true,
        replacePartContent: true,
        overrideNeedsReview: review > 0,
      });
      writeFileSync(
        auditPath,
        JSON.stringify(
          {
            ...audit,
            reviewFixApplied: { at: new Date().toISOString(), notes: patch.notes || null },
            validation: {
              ok: validation.ok,
              errors: validation.errors,
              qualityFails: validation.qualityFails || [],
              warnings: validation.warnings || [],
              needsReview: validation.needsReview || [],
            },
            generated: normalized,
          },
          null,
          2,
        ),
        'utf8',
      );
      console.log(`${label}: SAVED · warnings=${warn} · review=${review} · ${patch.notes || ''}`);
      summary.push({ label, status: 'saved', notes: patch.notes });
    } catch (e) {
      console.error(`${label}: SAVE FAILED — ${e?.message || e}`);
      blocked += 1;
      summary.push({ label, status: 'save-error', notes: patch.notes });
    }
  }
}

console.log(`\n--- ${summary.length} part(s) processed, ${blocked} blocked`);
for (const s of summary) console.log(`  ${s.label}: ${s.status}`);
if (blocked) process.exit(1);
