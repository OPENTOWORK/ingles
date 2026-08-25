import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function splitMP(answer, keyword) {
  const words = answer.trim().split(/\s+/);
  const kw = String(keyword).toUpperCase();
  const idx = words.findIndex(
    (w) => w.replace(/[^A-Za-z]/g, '').toUpperCase() === kw,
  );
  if (words.length === 2) return [words[0], words[1]];
  if (words.length === 3) {
    if (idx <= 1) return [words.slice(0, 2).join(' '), words[2]];
    return [words[0], words.slice(1).join(' ')];
  }
  if (words.length === 4) {
    if (words[words.length - 1].replace(/[^A-Za-z]/g, '').toUpperCase() === kw) {
      return [words.slice(0, 3).join(' '), words[3]];
    }
    return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  }
  return [words.slice(0, 3).join(' '), words.slice(3).join(' ')];
}

function revalidate(item) {
  const words = item.answer.trim().split(/\s+/);
  const errors = [];
  if (words.length < 2 || words.length > 5) errors.push('word_count');
  const joined = `${item.marking_points[0]} ${item.marking_points[1]}`.trim();
  if (joined !== item.answer.trim()) errors.push('mp mismatch');
  const kw = String(item.keyword).toUpperCase();
  if (
    !words.some((w) => w.replace(/[^A-Za-z]/g, '').toUpperCase() === kw)
  ) {
    errors.push('keyword missing');
  }
  return {
    status: errors.length ? 'fail' : 'pass',
    errors,
    warnings: [],
    word_count: words.length,
  };
}

function alignAll(doc) {
  for (const q of doc.exercise.questions) {
    const mp = splitMP(q.answer, q.keyword);
    if (`${mp[0]} ${mp[1]}` === q.answer.trim()) {
      q.marking_points = mp;
    }
    doc.item_checks[`Q${q.question_number}`] = revalidate(q);
  }
  if (doc.exercise.example) {
    const ex = doc.exercise.example;
    const mp = splitMP(ex.answer, ex.keyword);
    if (`${mp[0]} ${mp[1]}` === ex.answer.trim()) ex.marking_points = mp;
    doc.item_checks.example = revalidate(ex);
  }
  const checks = [
    doc.item_checks.example,
    ...doc.exercise.questions.map((q) => doc.item_checks[`Q${q.question_number}`]),
  ];
  doc.self_check = {
    status: checks.some((c) => c.status === 'fail')
      ? 'fail'
      : checks.some((c) => c.status === 'pass_with_warnings')
        ? 'pass_with_warnings'
        : 'pass',
    fail_count: checks.filter((c) => c.status === 'fail').length,
    warning_count: checks.filter((c) => c.status === 'pass_with_warnings').length,
    scored_items: 6,
  };
}

// EX01
{
  const f = path.join(PACK, '05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json');
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const q26 = d.exercise.questions.find((q) => q.question_number === 26);
  q26.sentence1 = 'I am going to ask the hairdresser to cut my hair.';
  q26.sentence2 = 'I am going to ____ by the hairdresser.';
  q26.answer = 'get my hair cut';
  q26.marking_points = ['get', 'my hair cut'];
  q26.accepted_variants = ['get my hair cut'];
  q26.semantic_equivalence_rationale =
    'Both sentences express that a hairdresser will cut the speakers hair as a causative service arrangement.';
  alignAll(d);
  d.repaired_items = [...new Set([...(d.repaired_items || []), 'Q26', 'Q27', 'Q28'])];
  d.repair_pass = {
    at: new Date().toISOString(),
    kind: 'marking_points_and_q26_tense_local',
  };
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  console.log('EX01', d.self_check.status, d.exercise.questions.map((q) => [q.question_number, q.answer, q.marking_points, d.item_checks[`Q${q.question_number}`].status]));
}

// EX02
{
  const f = path.join(PACK, '05_OUTPUTS/EXAM-02/TBP-PILOT-EX02_Part4.json');
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  alignAll(d);
  d.repaired_items = [...new Set([...(d.repaired_items || []), 'Q28'])];
  d.repair_pass = { at: new Date().toISOString(), kind: 'marking_points_local' };
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  console.log('EX02', d.self_check.status, d.exercise.questions.map((q) => [q.question_number, q.answer, q.marking_points, d.item_checks[`Q${q.question_number}`].status]));
}
