/**
 * Genera UNA Part 2 (open cloze) B2 en modo PREVIEW: IA + validador mecánico +
 * validador de calidad (blind solve + rúbrica) + marca needs_review.
 * NO guarda nada en Supabase (la función de preview no escribe).
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/preview-b2-part2.mjs [examSlot]
 * Output: scripts/generated/preview-b2-part2-exam<slot>-<timestamp>.json
 */
import { writeFileSync, mkdirSync } from 'fs';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

const { previewLevelExamPartGeneration } = await import('../src/lib/levelsCambridgeExamGenerator.js');

const examSlot = Number(process.argv[2] || 5);
console.log(`Generando preview B2 Part 2 (open cloze) para exam ${examSlot} — SIN guardar…\n`);

const t0 = Date.now();
const preview = await previewLevelExamPartGeneration({
  levelSlug: 'b2',
  examSlot,
  partNumber: 2,
});
const secs = ((Date.now() - t0) / 1000).toFixed(1);

const gen = preview.generated || {};
const passage = String(gen.passage || '');
const wordCount = passage.replace(/\(\d+\)\s*_+/g, ' ').split(/\s+/).filter(Boolean).length;
const gaps = [...passage.matchAll(/\((\d{1,2})\)\s*(?:_+|\.{2,}|…+)/g)].map((m) => Number(m[1]));
const answers = (gen.modelAnswers || []).map((m) => m.answer);

console.log(`Generado y validado en ${secs}s\n`);
console.log('--- Example (separado) ---');
console.log(`  ${gen.example?.sentence || gen.example?.text || '—'}`);
console.log(`  Answer: 0 → ${gen.example?.answer || '—'}`);
console.log('--- Title ---');
console.log(`  ${gen.title || '—'}`);
console.log('--- Passage ---');
passage.split('\n').forEach((l) => console.log(`  ${l}`));
console.log(`\n  Palabras (sin marcadores): ${wordCount}`);
console.log(`  Gaps en pasaje: ${gaps.join(',')}`);
console.log(`  Answer key: ${(gen.questions || []).map((q, i) => `${q.number}=${answers[i]}`).join('  ')}`);

console.log('\n--- Validación mecánica + calidad ---');
console.log(`  ok: ${preview.validation.ok}`);
if (preview.validation.errors.length) {
  console.log('  ERRORES:');
  preview.validation.errors.forEach((e) => console.log(`    - ${e}`));
}
if (preview.validation.warnings.length) {
  console.log('  Warnings:');
  preview.validation.warnings.forEach((w) => console.log(`    ~ ${w}`));
}

console.log('\n--- Blind solve / needs_review ---');
const nr = preview.validation.needsReview || [];
if (nr.length) {
  console.log(`  needs_review (${nr.length}) → el SAVE quedaría BLOQUEADO sin override:`);
  nr.forEach((f) => console.log(`    - Q${f.itemNumber ?? '?'} [${f.type}] ${f.detail}`));
} else {
  console.log('  Sin discrepancias: el blind solve coincide con el answer key en los 8 gaps.');
}
if (preview.quality?.rubric) {
  const r = preview.quality.rubric;
  console.log('\n--- Rúbrica IA ---');
  console.log(`  CEFR: ${r.cefrLevel} · naturalidad: ${r.textNaturalness}/5 · realisticB2: ${r.realisticB2} · verdict: ${r.verdict}`);
  console.log(`  Categorías testadas: ${(r.categoriesTested || []).join(', ') || '—'}`);
  if ((r.vocabularyStyleItems || []).length) console.log(`  Gaps estilo vocabulario (Part 1): ${r.vocabularyStyleItems.join(', ')}`);
}

mkdirSync('scripts/generated', { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = `scripts/generated/preview-b2-part2-exam${examSlot}-${stamp}.json`;
writeFileSync(outFile, JSON.stringify(preview, null, 2), 'utf8');
console.log(`\nPreview JSON completo guardado en ${outFile} (archivo local; nada en Supabase).`);
console.log(`__needsReview en payload: ${gen.__needsReview ? 'SÍ (bloquearía el save)' : 'no'}`);
