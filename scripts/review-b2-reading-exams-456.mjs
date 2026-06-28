/**
 * Validate improved Part 5/7 for exams 4–6; write review reports.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/review-b2-reading-exams-456.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getImprovedPart } from './b2ReadingImprovedContent.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const examSlots = [4, 5, 6];

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const {
  analyzePart5Quality,
  analyzePart7Quality,
  countWords,
} = await import('../src/lib/b2RuoeExamQuality.js');

const reviewsDir = path.join(root, 'scripts', 'generated', 'reviews');
const genDir = path.join(root, 'scripts', 'generated');
mkdirSync(reviewsDir, { recursive: true });
mkdirSync(genDir, { recursive: true });

const summary = { generatedAt: new Date().toISOString(), exams: [], allOk: true };

for (const slot of examSlots) {
  const examReport = { examSlot: slot, parts: {} };

  for (const partNumber of [5, 7]) {
    const generated = getImprovedPart(slot, partNumber);
    if (!generated) {
      examReport.parts[partNumber] = { ok: false, error: 'missing content' };
      summary.allOk = false;
      continue;
    }

    const validation = validateGeneratedExamPart('b2', partNumber, generated);
    const analysis = partNumber === 5 ? analyzePart5Quality(generated) : analyzePart7Quality(generated);
    const key =
      partNumber === 5
        ? generated.questions.map((q, i) => `${q.number}${generated.modelAnswers[i]?.answer || '?'}`).join(' ')
        : generated.questions.map((q, i) => `${q.number}${generated.modelAnswers[i]?.answer || '?'}`).join(' ');

    const severeWarnings = validation.warnings.filter(
      (w) => /keyword matching|absurd|consecutive|only \d different letters/i.test(w),
    );

    const report = {
      examSlot: slot,
      partNumber,
      title: partNumber === 5 ? generated.title : generated.sections?.map((s) => s.name).join(', '),
      passageWordCount: partNumber === 5 ? countWords(generated.passage) : null,
      sectionWordCounts: partNumber === 7 ? generated.sections?.map((s) => countWords(s.text)) : null,
      answerKey: key,
      validation: { ok: validation.ok, errors: validation.errors, warnings: validation.warnings },
      severeWarnings,
      questionTypes: partNumber === 5 ? generated.questions.map((q) => q.questionType) : null,
    };

    const previewPath = path.join(genDir, `preview-exam${slot}-part${partNumber}-b2.json`);
    writeFileSync(
      previewPath,
      JSON.stringify({ levelSlug: 'b2', examSlot: slot, partNumber, generated, validation }, null, 2),
      'utf8',
    );

    const jsonPath = path.join(reviewsDir, `exam${slot}-part${partNumber}-review-456.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

    const ok = validation.ok && severeWarnings.length === 0;
    if (!ok) summary.allOk = false;

    examReport.parts[partNumber] = { ok, jsonPath, previewPath, report };
    console.log(
      `Exam ${slot} Part ${partNumber}: ${ok ? 'OK' : 'FAIL'} | wc=${report.passageWordCount || report.sectionWordCounts?.join(',')} | key=${key}`,
    );
    if (validation.errors.length) console.log('  errors:', validation.errors.join('; '));
    if (severeWarnings.length) console.log('  severe warnings:', severeWarnings.join('; '));
  }

  summary.exams.push(examReport);
}

writeFileSync(path.join(reviewsDir, 'b2-reading-exams-456-pre-apply-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify({ allOk: summary.allOk }, null, 2));
process.exit(summary.allOk ? 0 : 1);
