/**
 * Review B2 Reading Part 5 & Part 7 quality; write reports to scripts/generated/reviews/
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/review-b2-reading-quality.mjs [1] [2] [3]
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPartFromDump } from './b2ExamDumpToGenerated.mjs';
import { getImprovedPart } from './b2ReadingImprovedContent.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const slots = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= 6);
const examSlots = slots.length ? slots : [1, 2, 3];

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const {
  analyzePart5Quality,
  analyzePart7Quality,
  countWords,
  detectRepeatedNamesAcrossExams,
} = await import('../src/lib/b2RuoeExamQuality.js');

const reviewsDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(reviewsDir, { recursive: true });

const summary = { generatedAt: new Date().toISOString(), exams: [] };
const improvedGens = [];

for (const slot of examSlots) {
  const dumpPath = path.join(root, 'scripts', 'generated', `dump-exam${slot}-b2.json`);
  let dump;
  try {
    dump = JSON.parse(readFileSync(dumpPath, 'utf8'));
  } catch {
    console.error(`Missing dump: ${dumpPath} — run: node scripts/dump-b2-exam.mjs ${slot}`);
    continue;
  }

  const examReport = { examSlot: slot, parts: {} };

  for (const partNumber of [5, 7]) {
    const before = buildPartFromDump(dump, partNumber);
    const after = getImprovedPart(slot, partNumber);
    const beforeVal = before ? validateGeneratedExamPart('b2', partNumber, before) : null;
    const afterVal = after ? validateGeneratedExamPart('b2', partNumber, after) : null;
    const analysisBefore = partNumber === 5 ? analyzePart5Quality(before || {}) : analyzePart7Quality(before || {});
    const analysisAfter = partNumber === 5 ? analyzePart5Quality(after || {}) : analyzePart7Quality(after || {});

    if (after) improvedGens.push({ examSlot: slot, partNumber, gen: after });

    const report = {
      examSlot: slot,
      partNumber,
      before: before
        ? {
            title: before.title || before.sections?.map((s) => s.name).join(', '),
            passageWordCount: partNumber === 5 ? countWords(before.passage) : null,
            sectionWordCounts: partNumber === 7 ? before.sections?.map((s) => countWords(s.text)) : null,
            validation: { ok: beforeVal.ok, errors: beforeVal.errors, warnings: beforeVal.warnings },
            quality: analysisBefore,
          }
        : null,
      after: after
        ? {
            title: after.title || after.sections?.map((s) => s.name).join(', '),
            passageWordCount: partNumber === 5 ? countWords(after.passage) : null,
            sectionWordCounts: partNumber === 7 ? after.sections?.map((s) => countWords(s.text)) : null,
            validation: { ok: afterVal.ok, errors: afterVal.errors, warnings: afterVal.warnings },
            quality: analysisAfter,
            questionTypes: after.questions?.map((q) => q.questionType).filter(Boolean),
          }
        : null,
      rewriteActions: [],
    };

    if (before && after) {
      if (partNumber === 5) {
        report.rewriteActions.push('Replaced passage and all 6 MCQ items with inference-focused questions and plausible distractors.');
        if (analysisBefore.metrics?.literalMatches?.length) {
          report.rewriteActions.push(`Removed ${analysisBefore.metrics.literalMatches.length} literal word-matching issue(s) from previous version.`);
        }
      }
      if (partNumber === 7) {
        report.rewriteActions.push('Replaced theme, names and all 4 profile texts; added overlapping details and Who-prefixed prompts 43–52.');
      }
    }

    const jsonPath = path.join(reviewsDir, `exam${slot}-part${partNumber}-review.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

    const md = [
      `# B2 Exam ${slot} — Part ${partNumber} Quality Review`,
      '',
      `Generated: ${summary.generatedAt}`,
      '',
      '## Before (production dump)',
      before
        ? [
            `- Validation OK: **${beforeVal.ok}**`,
            `- Errors: ${beforeVal.errors.length ? beforeVal.errors.join('; ') : 'none'}`,
            `- Warnings: ${beforeVal.warnings.length ? beforeVal.warnings.join('; ') : 'none'}`,
            partNumber === 5 ? `- Passage words: ${countWords(before.passage)}` : '',
            partNumber === 7
              ? `- Section words: ${(before.sections || []).map((s) => `${s.letter}=${countWords(s.text)}`).join(', ')}`
              : '',
          ].filter(Boolean).join('\n')
        : '_No dump data_',
      '',
      '## After (improved preview)',
      after
        ? [
            `- Validation OK: **${afterVal.ok}**`,
            `- Errors: ${afterVal.errors.length ? afterVal.errors.join('; ') : 'none'}`,
            `- Warnings: ${afterVal.warnings.length ? afterVal.warnings.join('; ') : 'none'}`,
            partNumber === 5 ? `- Passage words: ${countWords(after.passage)}` : '',
            partNumber === 7
              ? `- Section words: ${(after.sections || []).map((s) => `${s.letter}=${countWords(s.text)}`).join(', ')}`
              : '',
            partNumber === 5 && after.questions
              ? `- Question types: ${after.questions.map((q) => q.questionType || '?').join(', ')}`
              : '',
          ].filter(Boolean).join('\n')
        : '_No improved content_',
      '',
      '## Rewrite actions',
      ...(report.rewriteActions.length ? report.rewriteActions.map((a) => `- ${a}`) : ['- None']),
      '',
    ].join('\n');

    writeFileSync(path.join(reviewsDir, `exam${slot}-part${partNumber}-review.md`), md, 'utf8');
    examReport.parts[partNumber] = { json: jsonPath, afterOk: afterVal?.ok ?? false };
    console.log(`Exam ${slot} Part ${partNumber}: before=${beforeVal?.ok} after=${afterVal?.ok}`);
    if (afterVal?.errors?.length) console.log('  after errors:', afterVal.errors);
  }

  summary.exams.push(examReport);
}

summary.repeatedNames = detectRepeatedNamesAcrossExams(improvedGens);
writeFileSync(path.join(reviewsDir, 'b2-reading-quality-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify(summary, null, 2));
