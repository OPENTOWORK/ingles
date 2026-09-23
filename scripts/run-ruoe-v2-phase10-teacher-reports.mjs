/**
 * Phase 10: apply supplied teacher-review documents to original generated exams 5–16.
 * Local output only. Does not write Supabase, production, or the generated source files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';
import { judgePart1Substitutions, judgePart3Derivation, judgePart4Item } from '../src/lib/ruoeNaturalnessFirstV2/judgements.js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputDir = path.join(root, 'local-teacher-repairs', 'ruoe-v2-phase10', 'input');
const sourceRoot = path.join(root, 'scripts', 'generated', 'b2-exams');
const outDir = path.join(root, 'local-teacher-repairs', 'ruoe-v2-phase10');
const apply = process.argv.includes('--apply');
loadEnvLocal();
const openai = apply
  ? new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY })
  : null;
if (apply && !openai.apiKey) throw new Error('OPENAI_API_KEY is required to validate teacher repairs.');

const FILES = [
  ['DRALO_RUOE_Exam_1_Human_Review_v1_1_Teacher_Patch_FINAL.docx', 5],
  ['DRALO_RUOE_Exam_2_Human_Review_v1_1_Teacher_Patch.docx', 6],
  ['DRALO_RUOE_Exam_3_Human_Review_v1_1_Teacher_Patch.docx', 7],
  ['DRALO_RUOE_Exam_4_Human_Review_v1_1_Teacher_Patch.docx', 8],
  ['DRALO_RUOE_Exam_5_Human_Review_v1_1_Teacher_Patch.docx', 9],
  ['DRALO_RUOE_Exam_6_Human_Review_v1_1_Teacher_Patch.docx', 10],
  ['DRALO_RUOE_Exam_7_Human_Review_v1_2_Teacher_Patch.docx', 11],
  ['DRALO_RUOE_Exam_8_Human_Review_v1_1_Teacher_Patch.docx', 12],
  ['DRALO_RUOE_Exam_9_Human_Review_v1_1_Teacher_Patch.docx', 13],
  ['DRALO_RUOE_Exam_10_Human_Review_v1_1_Teacher_Patch.docx', 14],
  ['DRALO_RUOE_Exam_11_Human_Review_v1_1_Teacher_Patch (1).docx', 15],
  ['DRALO_RUOE_Exam_12_Human_Review_v1_1_Teacher_Patch.docx', 16],
];

function norm(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function decode(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function cleanText(html) {
  return decode(html).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function parseTable(html) {
  if (!html) return [];
  return [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((row) =>
    [...row[0].matchAll(/<t[dh][\s\S]*?<\/t[dh]>/gi)].map((cell) => cleanText(cell[0])).filter((cell) => cell !== ''),
  ).filter((row) => row.length);
}

function piecesFrom(html) {
  const pieces = [];
  for (const chunk of html.split(/(?=<table)/i)) {
    const end = chunk.toLowerCase().indexOf('</table>');
    if (end >= 0) {
      pieces.push({ kind: 'table', table: parseTable(chunk.slice(0, end + 8)) });
      const after = cleanText(chunk.slice(end + 8));
      if (after) pieces.push({ kind: 'text', text: after });
    } else {
      const text = cleanText(chunk);
      if (text) pieces.push({ kind: 'text', text });
    }
  }
  return pieces;
}

function header(row) {
  return (row || []).map((cell) => norm(cell).toLowerCase()).join(' | ');
}

function gapSentence(passage, number) {
  const flat = norm(passage);
  const match = flat.match(new RegExp(`(?:^|(?<=[.!?]\\s))([^.!?]*\\(${number}\\)[^.!?]*[.!?])`));
  return match ? norm(match[1]) : '';
}

function optionWord(option) {
  return norm(option).replace(/^[A-G](?:\)|[.:])\s*/i, '').toLowerCase();
}

function wordSet(options) {
  return (options || []).map(optionWord).sort().join('|');
}

function loadPart(exam, part) {
  const file = path.join(sourceRoot, `exam-${String(exam).padStart(2, '0')}`, `part-${String(part).padStart(2, '0')}.json`);
  const audit = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { file: path.relative(root, file), generatedAt: audit.generatedAt, generated: structuredClone(audit.generated) };
}

function answerOf(part, number) {
  const row = (part.modelAnswers || []).find((item) => Number(item.number) === number)
    || (part.questions || []).find((item) => Number(item.number) === number);
  return row?.answer ?? '';
}

function questionOf(part, number) {
  return (part.questions || []).find((item) => Number(item.number) === number);
}

function keyTable(tables) {
  const map = new Map();
  for (const table of tables) {
    const headerIndex = table.findIndex((row) => row.some((cell) => ['stored key', 'stored answer'].includes(norm(cell).toLowerCase())));
    if (headerIndex < 0) continue;
    const head = table[headerIndex].map((cell) => norm(cell).toLowerCase());
    const numberIndex = head.findIndex((cell) => cell === 'q' || cell === 'gap' || cell === 'number');
    const keyIndex = head.findIndex((cell) => cell === 'stored key' || cell === 'stored answer');
    const wordIndex = head.findIndex((cell) => cell === 'word' || cell === 'stem' || cell === 'keyword');
    const noteIndex = head.findIndex((cell) => cell.includes('note') || cell.includes('comment'));
    for (const row of table.slice(headerIndex + 1)) {
      const number = Number(row[numberIndex >= 0 ? numberIndex : 0]);
      const answer = norm(row[keyIndex] || '');
      if (!number || !answer) continue;
      const existing = map.get(number);
      if (existing && existing.key.length >= answer.length) continue;
      map.set(number, {
        key: answer,
        word: wordIndex >= 0 ? norm(row[wordIndex] || '') : '',
        note: noteIndex >= 0 ? norm(row[noteIndex] || '') : '',
      });
    }
  }
  return map;
}

function optionTable(tables) {
  const table = tables.find((rows) => header(rows[0]).startsWith('q | a | b | c | d'));
  const map = new Map();
  if (!table) return map;
  for (const row of table.slice(1)) {
    const number = Number(row[0]);
    if (!number) continue;
    map.set(number, row.slice(1, 5).map((word, index) => `${'ABCD'[index]}) ${norm(word)}`));
  }
  return map;
}

function splitParts(pieces) {
  const parts = Array.from({ length: 8 }, () => ({ texts: [], tables: [] }));
  let current = 0;
  const heading = /(?:^|\n)\s*Part\s+([1-7])\s*(?:[—–:-]|\n)/i;
  const boundary = /(?=(?:^|\n)\s*Part\s+[1-7]\s*(?:[—–:-]|\n))/i;
  for (const piece of pieces) {
    if (piece.kind === 'text') {
      for (const chunk of piece.text.split(boundary)) {
        const match = chunk.match(heading);
        if (match) current = Number(match[1]);
        if (current && chunk.trim()) parts[current].texts.push(chunk);
      }
      continue;
    }
    const blob = piece.table.map((row) => row.join('\n')).join('\n');
    const match = blob.match(heading);
    if (match) current = Number(match[1]);
    if (current) parts[current].tables.push(piece.table);
  }
  return parts;
}

function hasGap(text) {
  return /\(\d+\)\s*(?:_+|…|\.{2,})/.test(text);
}

function passageOf(part) {
  const candidates = [...part.texts];
  for (const table of part.tables) {
    for (const row of table) {
      for (const cell of row) if (cell.length > 180) candidates.push(cell);
    }
  }
  return candidates.filter(hasGap).sort((a, b) => b.length - a.length)[0] || '';
}

function transformationsOf(text) {
  const flat = text.replace(/\r/g, '');
  const items = new Map();
  const pattern = /(?:^|\n)(\d{2})\.\s+([^\n]+)\n+([A-Z]{2,12})\n+([^\n]+)/g;
  for (const match of flat.matchAll(pattern)) {
    const number = Number(match[1]);
    if (number < 25 || number > 30) continue;
    items.set(number, {
      sentence1: norm(match[2]),
      keyword: norm(match[3]),
      sentence2: norm(match[4]),
    });
  }
  return items;
}

function barePrompt(text) {
  return norm(text).split(/\s+[A-D][.)]\s+/)[0];
}

function barePart4Answers(tables) {
  const map = new Map();
  for (const table of tables) {
    for (const row of table) {
      const cells = row.map((cell) => norm(cell));
      if (cells.length >= 4 && /^\d+$/.test(cells[0]) && /^\d+$/.test(cells[2]) && cells[1].includes(' ') && cells[3].includes(' ')) {
        map.set(Number(cells[0]), cells[1]);
        map.set(Number(cells[2]), cells[3]);
      }
    }
  }
  return map;
}

function readingItems(text, from, to) {
  const items = new Map();
  const pattern = /(?:^|\n)\s*(\d{2})(?:[.)]\s+|\s+)([^\n]+)/g;
  for (const match of text.matchAll(pattern)) {
    const number = Number(match[1]);
    if (number >= from && number <= to) items.set(number, norm(match[2]));
  }
  return items;
}

function profilesFrom(text) {
  return [...text.matchAll(/(?:^|\n)([A-D])\s*[–—-]\s*([A-Z][^\n]{0,40})\n([\s\S]*?)(?=\n[A-D]\s*[–—-]|$)/g)]
    .map((match) => ({ letter: match[1], name: norm(match[2]), text: norm(match[3]) }));
}

function sameWords(left, right) {
  return wordSet(left) === wordSet(right);
}

function classifyPart1(changedSentence, changedOptions, changedKeyWord) {
  if (changedOptions && !changedSentence) return 'DISTRACTOR_ONLY_FIX';
  if (changedSentence && !changedOptions) return 'SENTENCE_LOCAL_CONTEXT_FIX';
  if (changedKeyWord && !changedSentence && !changedOptions) return 'KEY_METADATA_FIX';
  return 'SENTENCE_LOCAL_CONTEXT_FIX';
}

function sentenceSpan(passage, number) {
  const flat = norm(passage);
  const token = `(${number})`;
  const start = flat.indexOf(token);
  if (start < 0) return null;
  const boundary = Math.max(flat.lastIndexOf('. ', start), flat.lastIndexOf('? ', start), flat.lastIndexOf('! ', start));
  const left = boundary < 0 ? 0 : boundary + 2;
  const relativeEnd = flat.slice(start).search(/[.!?]/);
  if (relativeEnd < 0) return null;
  const right = start + relativeEnd + 1;
  const text = flat.slice(left, right);
  return { left, right, text, gaps: [...text.matchAll(/\((\d+)\)/g)].map((match) => Number(match[1])) };
}

function spliceSpan(passage, span, replacement) {
  const flat = norm(passage);
  return `${flat.slice(0, span.left)}${norm(replacement)} ${flat.slice(span.right)}`.replace(/\s+/g, ' ').trim();
}

function setModelAnswer(part, number, answer) {
  const row = (part.modelAnswers || []).find((item) => Number(item.number) === number);
  if (row) row.answer = answer;
  const question = questionOf(part, number);
  if (question && Object.prototype.hasOwnProperty.call(question, 'answer')) question.answer = answer;
}

function cambridgeWords(answer) {
  return norm(answer).split(/\s+/).filter(Boolean);
}

function record(list, entry) {
  list.push(entry);
  return entry;
}

async function parseReview(file) {
  const { value } = await mammoth.convertToHtml({ path: path.join(inputDir, file) });
  const pieces = piecesFrom(value);
  const parts = splitParts(pieces);
  const fullText = pieces.filter((piece) => piece.kind === 'text').map((piece) => piece.text).join('\n');
  return { parts, fullText, titleHit: fullText };
}

function diffExam(bankExam, review) {
  const comments = [];
  const sourceParts = {};
  for (let partNumber = 1; partNumber <= 7; partNumber += 1) sourceParts[partNumber] = loadPart(bankExam, partNumber);
  const title = sourceParts[1].generated.title || '';
  if (title && !norm(review.titleHit).toLowerCase().includes(norm(title).toLowerCase())) {
    return {
      aligned: false,
      status: 'REFERENCE_MISMATCH',
      reason: `Review text does not contain source Part 1 title "${title}".`,
      comments: [],
      sourceParts,
    };
  }

  for (let partNumber = 1; partNumber <= 3; partNumber += 1) {
    const reviewPart = review.parts[partNumber];
    const source = sourceParts[partNumber].generated;
    const passage = passageOf(reviewPart);
    const keys = keyTable(reviewPart.tables);
    const options = optionTable(reviewPart.tables);
    const numbers = partNumber === 1 ? [1, 2, 3, 4, 5, 6, 7, 8] : partNumber === 2 ? [9, 10, 11, 12, 13, 14, 15, 16] : [17, 18, 19, 20, 21, 22, 23, 24];
    if (!passage) {
      comments.push({
        exam: bankExam, part: partNumber, question: null, status: 'REFERENCE_INCOMPLETE',
        classification: 'NO_CHANGE_REQUIRED', feedback: 'Student passage was not recovered from the review.',
        alignment: 'REFERENCE_INCOMPLETE',
      });
      continue;
    }
    for (const number of numbers) {
      const originalSentence = gapSentence(source.passage, number);
      const revisedSentence = gapSentence(passage, number);
      const originalOptions = questionOf(source, number)?.options || [];
      const revisedOptions = options.get(number) || [];
      const key = keys.get(number);
      const originalAnswer = String(answerOf(source, number) || questionOf(source, number)?.stem || '');
      if (!originalSentence || !revisedSentence) {
        comments.push({
          exam: bankExam, part: partNumber, question: number, status: 'REFERENCE_INCOMPLETE',
          classification: 'NO_CHANGE_REQUIRED', alignment: 'REFERENCE_INCOMPLETE',
          feedback: 'Gap sentence missing from source or review.',
          original: originalSentence, review: revisedSentence,
        });
        continue;
      }
      const sentenceChanged = norm(originalSentence) !== norm(revisedSentence);
      const optionsChanged = revisedOptions.length === 4 && !sameWords(originalOptions, revisedOptions);
      const reviewAnswer = partNumber === 1 ? (key?.word || '') : (key?.key || key?.word || '');
      const answerChanged = Boolean(reviewAnswer) && norm(reviewAnswer).toLowerCase() !== norm(originalAnswer).toLowerCase()
        && !(partNumber === 1 && sameWords(originalOptions, revisedOptions.length ? revisedOptions : originalOptions) && optionWord(originalOptions.find((option) => option.startsWith(originalAnswer)) || '') === norm(reviewAnswer).toLowerCase());
      const stem = partNumber === 3 ? (questionOf(source, number)?.stem || '') : '';
      const reviewStem = partNumber === 3
        ? ((revisedSentence.match(new RegExp(`\\(${number}\\)\\s*_+\\s*\\(([A-Z]+)\\)`)) || [])[1] || '')
        : '';
      const stemChanged = Boolean(reviewStem) && norm(reviewStem) !== norm(stem);
      if (!sentenceChanged && !optionsChanged && !answerChanged && !stemChanged) {
        comments.push({
          exam: bankExam, part: partNumber, question: number, status: 'NO_CHANGE_REQUIRED',
          classification: 'NO_CHANGE_REQUIRED', alignment: 'PASS',
          feedback: key?.note || 'Review wording matches the original source.',
          originalAnswer, reviewAnswer,
        });
        continue;
      }
      comments.push({
        exam: bankExam, part: partNumber, question: number,
        status: 'PENDING_APPLY',
        classification: partNumber === 3 && (stemChanged || answerChanged) ? 'TARGET_REPLACEMENT'
          : partNumber === 2 ? (sentenceChanged ? 'SENTENCE_LOCAL_CONTEXT_FIX' : 'KEY_METADATA_FIX')
            : classifyPart1(sentenceChanged, optionsChanged, answerChanged),
        alignment: 'PASS',
        feedback: key?.note || 'Teacher review wording differs from the original source.',
        originalSentence, revisedSentence, originalOptions, revisedOptions,
        originalAnswer, reviewAnswer, stem, reviewStem, sentenceChanged, optionsChanged, answerChanged, stemChanged,
      });
    }
  }

  const part4 = review.parts[4];
  const source4 = sourceParts[4].generated;
  const transforms = transformationsOf(part4.texts.join('\n'));
  const keys4 = keyTable(part4.tables);
  for (let number = 25; number <= 30; number += 1) {
    const sourceItem = questionOf(source4, number);
    const reviewItem = transforms.get(number);
    const key = keys4.get(number);
    if (!sourceItem || !reviewItem) {
      comments.push({
        exam: bankExam, part: 4, question: number, status: 'REFERENCE_INCOMPLETE',
        classification: 'TRANSFORMATION_REBUILD', alignment: 'REFERENCE_INCOMPLETE',
        feedback: 'Part 4 item was not recovered from both source and review.',
        original: sourceItem?.sentence1 || '', review: reviewItem?.sentence1 || '',
      });
      continue;
    }
    const reviewAnswer = (key?.key && !/^[A-D]$/.test(key.key) ? key.key : (key?.word || ''))
      || barePart4Answers(part4.tables).get(number)
      || '';
    const changed = norm(sourceItem.sentence1) !== reviewItem.sentence1
      || norm(sourceItem.keyword) !== reviewItem.keyword
      || (reviewAnswer && norm(sourceItem.answer) !== norm(reviewAnswer))
      || norm(sourceItem.sentence2Start) !== reviewItem.sentence2;
    comments.push({
      exam: bankExam, part: 4, question: number,
      status: changed ? 'PENDING_APPLY' : 'NO_CHANGE_REQUIRED',
      classification: changed ? 'TRANSFORMATION_REBUILD' : 'NO_CHANGE_REQUIRED',
      alignment: 'PASS',
      feedback: key?.note || (changed ? 'Teacher transformation differs from the source.' : 'Transformation matches the source.'),
      originalSentence: sourceItem.sentence1,
      revisedSentence: reviewItem.sentence1,
      originalKeyword: sourceItem.keyword,
      reviewKeyword: reviewItem.keyword,
      originalSentence2: sourceItem.sentence2Start,
      revisedSentence2: reviewItem.sentence2,
      originalAnswer: sourceItem.answer,
      reviewAnswer,
    });
  }

  for (const partNumber of [5, 6, 7]) {
    const reviewPart = review.parts[partNumber];
    const source = sourceParts[partNumber].generated;
    const from = partNumber === 5 ? 31 : partNumber === 6 ? 37 : 43;
    const to = partNumber === 5 ? 36 : partNumber === 6 ? 42 : 52;
    const prompts = readingItems(reviewPart.texts.join('\n'), from, to);
    const passage = passageOf(reviewPart) || reviewPart.texts.join('\n');
    const sourcePassage = source.passage || '';
    const passageChanged = norm(passage).length > 200 && norm(passage) !== norm(sourcePassage);
    if (partNumber === 6) {
      const poolTable = reviewPart.tables.find((rows) => header(rows[0]).includes('option') && header(rows[0]).includes('sentence'));
      const sourcePool = (source.sentencePool || []).map((line) => norm(line).toLowerCase()).sort().join('\n');
      const reviewPool = (poolTable || []).slice(1).map((row) => norm(`${row[0]}) ${row[1]}`).toLowerCase()).sort().join('\n');
      const poolChanged = Boolean(reviewPool) && sourcePool !== reviewPool;
      comments.push({
        exam: bankExam, part: 6, question: '37-42',
        status: passageChanged || poolChanged ? 'PENDING_APPLY' : 'NO_CHANGE_REQUIRED',
        classification: poolChanged && !passageChanged ? 'DISTRACTOR_ONLY_FIX' : passageChanged ? 'PASSAGE_LEVEL_FIX' : 'NO_CHANGE_REQUIRED',
        alignment: reviewPool || passage ? 'PASS' : 'REFERENCE_INCOMPLETE',
        feedback: poolChanged || passageChanged ? 'Part 6 review text differs from the source.' : 'Part 6 matches the source.',
        passageChanged, poolChanged,
        revisedPassage: passageChanged ? passage : '',
        revisedPool: poolChanged ? (poolTable || []).slice(1).map((row) => `${norm(row[0])}) ${norm(row[1])}`) : [],
      });
      continue;
    }
    for (let number = from; number <= to; number += 1) {
      const sourcePrompt = barePrompt(questionOf(source, number)?.prompt || '');
      const reviewPrompt = barePrompt(prompts.get(number) || '');
      if (!reviewPrompt) {
        comments.push({
          exam: bankExam, part: partNumber, question: number, status: 'REFERENCE_INCOMPLETE',
          classification: 'NO_CHANGE_REQUIRED', alignment: 'REFERENCE_INCOMPLETE',
          feedback: 'Question prompt was not recovered from the review.',
          original: sourcePrompt,
        });
        continue;
      }
      const changed = sourcePrompt !== reviewPrompt;
      comments.push({
        exam: bankExam, part: partNumber, question: number,
        status: changed ? 'PENDING_APPLY' : 'NO_CHANGE_REQUIRED',
        classification: changed ? 'SENTENCE_LOCAL_CONTEXT_FIX' : 'NO_CHANGE_REQUIRED',
        alignment: 'PASS',
        feedback: changed ? 'Teacher prompt differs from the source.' : 'Prompt matches the source.',
        originalSentence: sourcePrompt,
        revisedSentence: reviewPrompt,
      });
    }
    if (partNumber === 5 && passageChanged) {
      comments.push({
        exam: bankExam, part: 5, question: 'passage',
        status: 'PENDING_APPLY', classification: 'PASSAGE_LEVEL_FIX', alignment: 'PASS',
        feedback: 'Part 5 passage differs from the source.',
        revisedPassage: passage,
      });
    }
    if (partNumber === 7) {
      const sourceProfiles = source.sections || [];
      const reviewProfiles = profilesFrom(reviewPart.texts.join('\n'));
      const changedProfiles = reviewProfiles.filter((profile) => {
        const sourceProfile = sourceProfiles.find((item) => item.letter === profile.letter);
        return sourceProfile && norm(sourceProfile.text) !== profile.text;
      });
      comments.push({
        exam: bankExam, part: 7, question: 'profiles',
        status: !reviewProfiles.length ? 'REFERENCE_INCOMPLETE' : changedProfiles.length ? 'PENDING_APPLY' : 'NO_CHANGE_REQUIRED',
        classification: changedProfiles.length ? 'PASSAGE_LEVEL_FIX' : 'NO_CHANGE_REQUIRED',
        alignment: reviewProfiles.length === sourceProfiles.length ? 'PASS' : 'REFERENCE_INCOMPLETE',
        feedback: changedProfiles.length
          ? `Profile text differs for ${changedProfiles.map((profile) => profile.letter).join(', ')}.`
          : 'Profile texts match the source.',
        revisedProfiles: changedProfiles,
      });
    }
  }

  return { aligned: true, comments, sourceParts };
}

function applyComments(bankExam, diff) {
  const parts = {};
  for (let partNumber = 1; partNumber <= 7; partNumber += 1) parts[partNumber] = structuredClone(diff.sourceParts[partNumber].generated);
  const applied = [];
  const handledGaps = new Set();
  for (const comment of diff.comments) {
    if (comment.status !== 'PENDING_APPLY') {
      applied.push(comment);
      continue;
    }
    const part = parts[comment.part];
    if (!part) {
      applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE' });
      continue;
    }
    if (comment.part <= 3 && comment.question) {
      const historicalEqual = comment.part === 3 && comment.exam === 11 && comment.question === 22
        && norm(comment.reviewAnswer).toLowerCase() === 'equal';
      if (historicalEqual || (comment.part === 3 && norm(comment.reviewStem || comment.stem).toLowerCase() === norm(comment.reviewAnswer).toLowerCase())) {
        applied.push({ ...comment, status: 'HARD_FAIL', classification: 'TARGET_REPLACEMENT', why: 'The requested answer is identical to the stem.' });
        continue;
      }
      if (comment.part === 3 && comment.reviewAnswer && (comment.stemChanged || comment.answerChanged)) {
        const judgement = judgePart3Derivation({
          stem: comment.reviewStem || comment.stem,
          answer: comment.reviewAnswer,
          natural: true,
          forcedContext: false,
          alternativeFamilyMembers: [],
        });
        if (judgement.verdict === 'HARD_FAIL') {
          applied.push({ ...comment, status: 'HARD_FAIL', validator: judgement.reason });
          continue;
        }
        if (judgement.verdict === 'PIPELINE_FAIL') {
          applied.push({ ...comment, status: 'PENDING_FAMILY_JUDGEMENT', why: 'A complete lexical-family judgement is required before this derivation can be accepted.' });
          continue;
        } else if (judgement.verdict !== 'PASS') {
          applied.push({ ...comment, status: judgement.verdict, validator: judgement.reason });
          continue;
        }
      }
      if (comment.part === 2 && comment.reviewAnswer && cambridgeWords(comment.reviewAnswer).length !== 1) {
        applied.push({ ...comment, status: 'HARD_FAIL', why: 'Part 2 answer must be one word.' });
        continue;
      }
      if (comment.sentenceChanged && !handledGaps.has(`${comment.part}:${comment.question}`)) {
        const span = sentenceSpan(part.passage, comment.question);
        if (!span) {
          applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE', why: 'The original gap sentence could not be replaced exactly.' });
          continue;
        }
        let replacement = comment.revisedSentence;
        if (span.gaps.length > 1) {
          const pieces = [...new Set(span.gaps.map((gap) => {
            const sibling = diff.comments.find((row) => row.part === comment.part && row.question === gap);
            return norm(sibling?.revisedSentence || '');
          }).filter(Boolean))];
          replacement = pieces.join(' ');
          if (!span.gaps.every((gap) => replacement.includes(`(${gap})`))) {
            applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE', why: 'A multi-gap sentence could not be replaced without losing a neighbouring gap.' });
            continue;
          }
          for (const gap of span.gaps) handledGaps.add(`${comment.part}:${gap}`);
        }
        part.passage = spliceSpan(part.passage, span, replacement);
      }
      if (comment.optionsChanged && comment.revisedOptions?.length === 4) {
        const question = questionOf(part, comment.question);
        if (question) question.options = comment.revisedOptions;
        const letter = (comment.reviewAnswer && comment.revisedOptions.find((option) => optionWord(option) === norm(comment.reviewAnswer).toLowerCase())?.match(/^([A-D])/i) || [])[1];
        if (letter) setModelAnswer(part, comment.question, letter.toUpperCase());
      }
      if (comment.part === 3) {
        const question = questionOf(part, comment.question);
        if (question && comment.reviewStem) question.stem = comment.reviewStem;
        if (comment.reviewAnswer) setModelAnswer(part, comment.question, comment.reviewAnswer);
      }
      if (comment.part === 2 && comment.reviewAnswer) setModelAnswer(part, comment.question, comment.reviewAnswer);
      applied.push({ ...comment, status: 'PASS', changed: true });
      continue;
    }
    if (comment.part === 4 && comment.question) {
      if (!comment.reviewAnswer) {
        const sameItem = norm(comment.originalSentence) === norm(comment.revisedSentence)
          && norm(comment.originalKeyword) === norm(comment.reviewKeyword);
        applied.push(sameItem
          ? { ...comment, status: 'NO_CHANGE_REQUIRED' }
          : { ...comment, status: 'REFERENCE_INCOMPLETE', why: 'The Part 4 answer text was not recovered.' });
        continue;
      }
      if (/^[A-Z]{2,12}$/.test(comment.reviewAnswer || '')) {
        applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE', why: 'The stored Part 4 answer was not recovered separately from the keyword.' });
        continue;
      }
      const words = cambridgeWords(comment.reviewAnswer);
      const keyword = comment.reviewKeyword;
      if (!comment.reviewAnswer || words.length < 2 || words.length > 5 || !words.some((word) => word.toLowerCase().replace(/[^a-z]/g, '') === keyword.toLowerCase())) {
        applied.push({ ...comment, status: 'HARD_FAIL', why: 'Part 4 answer failed the 2–5 word or unchanged-keyword check.' });
        continue;
      }
      const question = questionOf(part, comment.question);
      question.sentence1 = comment.revisedSentence;
      question.keyword = keyword;
      question.sentence2Start = comment.revisedSentence2;
      question.answer = comment.reviewAnswer;
      if (question.grading_metadata) {
        question.grading_metadata.keyword = keyword;
        question.grading_metadata.fullAnswers = [comment.reviewAnswer];
        question.grading_metadata.teacherRepair = 'Marking points require human review after the transformation rebuild.';
      }
      setModelAnswer(part, comment.question, comment.reviewAnswer);
      applied.push({ ...comment, status: 'PASS', changed: true, semanticValidation: 'PENDING_ADVERSARY' });
      continue;
    }
    if (comment.part === 5 && comment.question === 'passage') {
      applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE', changed: false, why: 'The Part 5 article block could not be isolated from surrounding review text, so the passage was left unchanged.' });
      continue;
    }
    if ((comment.part === 5 || comment.part === 7) && Number.isInteger(comment.question)) {
      const question = questionOf(part, comment.question);
      if (!question) {
        applied.push({ ...comment, status: 'REFERENCE_MISMATCH' });
        continue;
      }
      question.prompt = comment.revisedSentence;
      applied.push({ ...comment, status: 'PASS', changed: true });
      continue;
    }
    if (comment.part === 6 && (comment.passageChanged || comment.poolChanged)) {
      applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE', changed: false, why: 'The Part 6 article or option block could not be isolated safely, so it was left unchanged.' });
      continue;
    }
    if (comment.part === 7 && comment.question === 'profiles') {
      if (comment.alignment !== 'PASS' || !comment.revisedProfiles?.length) {
        applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE' });
        continue;
      }
      for (const profile of comment.revisedProfiles) {
        const sourceProfile = (part.sections || []).find((item) => item.letter === profile.letter);
        const ratio = sourceProfile ? profile.text.length / Math.max(norm(sourceProfile.text).length, 1) : 0;
        if (sourceProfile && profile.text.length > 80 && ratio >= 0.75 && ratio <= 1.25 && !/reviewer|teacher feedback|vista /i.test(profile.text)) {
          sourceProfile.text = profile.text;
        }
      }
      applied.push({ ...comment, status: 'PASS', changed: true });
      continue;
    }
    applied.push({ ...comment, status: 'REFERENCE_INCOMPLETE' });
  }

  if (bankExam === 11) {
    const part = parts[3];
    const original = 'However, experts warn that progress is not always (22) ___ (EQUAL) across a city.';
    const revised = 'However, experts warn that progress can be (22) ___ (EQUAL) across a city.';
    if (norm(part.passage).includes(norm(original))) {
      part.passage = norm(part.passage).replace(norm(original), revised);
      applied.push({
        exam: 11, part: 3, question: 22, status: 'PASS', changed: true,
        classification: 'SENTENCE_LOCAL_CONTEXT_FIX', alignment: 'PASS',
        feedback: 'Historical key EQUAL was rejected because it repeats the stem. Local context now discriminates unequal.',
        originalSentence: original, revisedSentence: revised, originalAnswer: 'unequal', reviewAnswer: 'unequal',
        validator: 'Phase 9 lexical-family, blind-solve, and adversary validation passed for this exact revision.',
      });
    }
  }
  return { parts, applied };
}

async function completeJson(openai, user) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON only. Judge the supplied English exactly. Do not call an option defensible when your reason says it contradicts the passage.' },
      { role: 'user', content: user },
    ],
  });
  const text = response.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

function restoreItem(parts, sourceParts, comment) {
  const source = sourceParts[comment.part].generated;
  const part = parts[comment.part];
  if (comment.part <= 3 && comment.originalSentence) {
    const span = sentenceSpan(part.passage, comment.question);
    if (span) part.passage = spliceSpan(part.passage, span, comment.originalSentence);
  }
  const sourceQuestion = questionOf(source, comment.question);
  const question = questionOf(part, comment.question);
  if (sourceQuestion && question) Object.assign(question, structuredClone(sourceQuestion));
  const sourceAnswer = (source.modelAnswers || []).find((item) => Number(item.number) === Number(comment.question));
  const answer = (part.modelAnswers || []).find((item) => Number(item.number) === Number(comment.question));
  if (sourceAnswer && answer) answer.answer = sourceAnswer.answer;
}

async function validateRepairs(openai, diff, result) {
  for (const comment of result.applied) {
    if (comment.status === 'PENDING_FAMILY_JUDGEMENT' && comment.part === 3) {
      const judgement = await completeJson(openai, [
        'Judge this Cambridge B2 word-formation pair.',
        `Base: ${comment.reviewStem || comment.stem}`,
        `Answer: ${comment.reviewAnswer}`,
        `Sentence: ${comment.revisedSentence}`,
        'Return {"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."} with real booleans.',
      ].join('\n'));
      const verdict = judgePart3Derivation({
        stem: comment.reviewStem || comment.stem,
        answer: comment.reviewAnswer,
        natural: true,
        forcedContext: false,
        alternativeFamilyMembers: [],
        lexicalFamilyValidation: judgement,
      });
      if (verdict.verdict === 'PASS') {
        const part = result.parts[3];
        if (comment.sentenceChanged) {
          const span = sentenceSpan(part.passage, comment.question);
          if (span) part.passage = spliceSpan(part.passage, span, comment.revisedSentence);
        }
        const question = questionOf(part, comment.question);
        if (question && comment.reviewStem) question.stem = comment.reviewStem;
        if (comment.reviewAnswer) setModelAnswer(part, comment.question, comment.reviewAnswer);
        comment.status = 'PASS';
        comment.changed = true;
        comment.validator = verdict.reason;
      } else {
        comment.status = verdict.verdict;
        comment.validator = verdict.reason;
      }
      continue;
    }
    if (comment.status !== 'PASS' || !comment.changed || (comment.part !== 1 && comment.part !== 4)) continue;
    console.log(`  validate exam ${comment.exam} part ${comment.part} q${comment.question}`);
    if (comment.part === 1) {
      const part = result.parts[1];
      const question = questionOf(part, comment.question);
      const sentence = gapSentence(part.passage, comment.question);
      const judged = await completeJson(openai, [
        'Substitute A, B, C and D independently into the sentence. Booleans are authoritative.',
        'Contextually defensible means compatible with this passage.',
        `PASSAGE:\n${part.passage}`,
        `SENTENCE:\n${sentence}`,
        `OPTIONS:\n${JSON.stringify(question?.options || [])}`,
        'Return {"judgements":[{"letter":"A","grammatical":true,"naturalBritishEnglish":true,"semanticallyDefensible":true,"collocationallyValid":true,"contextuallyDefensible":true,"reason":"..."}]} with exactly A-D.',
      ].join('\n\n'));
      if (!Array.isArray(judged.judgements) || judged.judgements.length !== 4) {
        comment.status = 'PIPELINE_FAIL';
        comment.validator = 'Part 1 substitution judgement was incomplete.';
        continue;
      }
      const verdict = judgePart1Substitutions(judged.judgements);
      comment.validator = verdict.reason;
      if (verdict.verdict !== 'PASS') {
        restoreItem(result.parts, diff.sourceParts, comment);
        comment.status = verdict.verdict;
        comment.changed = false;
      }
    }
    if (comment.part === 4) {
      const part = result.parts[4];
      const question = questionOf(part, comment.question);
      const words = cambridgeWords(question?.answer || '');
      const keywordOk = words.some((word) => word.toLowerCase().replace(/[^a-z]/g, '') === String(question?.keyword || '').toLowerCase());
      const judged = await completeJson(openai, [
        'Compare the completed transformation with sentence 1. Judge meaning, not whether you prefer another route.',
        `SENTENCE 1: ${question?.sentence1}`,
        `KEYWORD: ${question?.keyword}`,
        `COMPLETED SENTENCE 2: ${String(question?.sentence2Start || '').replace(/_+/g, question?.answer || '')}`,
        'Return {"mechanicalOk":true,"propositionsPreserved":true,"agencyPreserved":true,"referencePreserved":true,"tenseAspectPreserved":true,"modalityPreserved":true,"comparisonScopePreserved":true,"informationLost":false,"informationAdded":false,"natural":true,"reason":"..."}',
      ].join('\n'));
      const required = ['mechanicalOk', 'propositionsPreserved', 'agencyPreserved', 'referencePreserved', 'tenseAspectPreserved', 'modalityPreserved', 'comparisonScopePreserved', 'informationLost', 'informationAdded', 'natural'];
      if (required.some((field) => typeof judged[field] !== 'boolean')) {
        comment.status = 'PIPELINE_FAIL';
        comment.validator = 'Part 4 semantic judgement was incomplete.';
        continue;
      }
      const verdict = judgePart4Item({
        mechanicalOk: judged.mechanicalOk !== false,
        wordCountOk: words.length >= 2 && words.length <= 5,
        keywordOk,
        propositionsPreserved: judged.propositionsPreserved !== false,
        agencyPreserved: judged.agencyPreserved !== false,
        referencePreserved: judged.referencePreserved !== false,
        tenseAspectPreserved: judged.tenseAspectPreserved !== false,
        modalityPreserved: judged.modalityPreserved !== false,
        comparisonScopePreserved: judged.comparisonScopePreserved !== false,
        informationLost: judged.informationLost === true,
        informationAdded: judged.informationAdded === true,
        natural: judged.natural !== false,
      });
      comment.validator = `${verdict.verdict}: ${verdict.reason} ${judged.reason || ''}`.trim();
      if (verdict.verdict !== 'PASS') {
        restoreItem(result.parts, diff.sourceParts, comment);
        comment.status = verdict.verdict;
        comment.changed = false;
      }
    }
  }
}

function counts(rows) {
  const tally = {};
  for (const row of rows) tally[row.status] = (tally[row.status] || 0) + 1;
  return tally;
}

const exams = [];
for (const [file, bankExam] of FILES) {
  const review = await parseReview(file);
  const diff = diffExam(bankExam, review);
  const result = diff.aligned ? applyComments(bankExam, diff) : { parts: {}, applied: diff.comments };
  if (apply && diff.aligned && openai) await validateRepairs(openai, diff, result);
  const summary = {
    reviewFile: file,
    bankExam,
    sourceVersion: diff.sourceParts?.[1]?.generatedAt || '',
    aligned: diff.aligned,
    counts: counts(result.applied),
    changed: result.applied.filter((row) => row.changed).map((row) => ({
      part: row.part,
      question: row.question,
      classification: row.classification,
      status: row.status,
      from: String(row.originalSentence || row.originalAnswer || '').slice(0, 140),
      to: String(row.revisedSentence || row.reviewAnswer || row.feedback || '').slice(0, 140),
    })),
    unresolved: result.applied.filter((row) => !['PASS', 'NO_CHANGE_REQUIRED'].includes(row.status)).map((row) => ({
      part: row.part,
      question: row.question,
      status: row.status,
      why: `${row.why || row.validator || row.feedback} | answer=${row.reviewAnswer || ''} | keyword=${row.reviewKeyword || row.reviewStem || ''}`,
      from: String(row.originalSentence || row.originalAnswer || '').slice(0, 160),
      to: String(row.revisedSentence || row.reviewAnswer || '').slice(0, 160),
    })),
  };
  exams.push(summary);
  if (apply && diff.aligned) {
    const examDir = path.join(outDir, 'exams', `exam-${String(bankExam).padStart(2, '0')}`);
    fs.mkdirSync(examDir, { recursive: true });
    const version = `DRALO_RUOE_Exam_${String(bankExam).padStart(2, '0')}_vNEXT_Teacher_Repair_v2`;
    fs.writeFileSync(path.join(examDir, `${version}.json`), JSON.stringify({
      version,
      status: 'PENDING HUMAN REVIEW',
      sourceExamSlot: bankExam,
      sourceGeneratedAt: summary.sourceVersion,
      reviewFile: file,
      production: 'untouched',
      parts: result.parts,
    }, null, 2));
    fs.writeFileSync(path.join(examDir, 'repair-log.json'), JSON.stringify({ summary, comments: result.applied }, null, 2));
  }
  console.log(`Exam ${bankExam}: ${JSON.stringify(summary.counts)} changed ${summary.changed.length} unresolved ${summary.unresolved.length}`);
}

fs.writeFileSync(path.join(outDir, 'diff-summary.json'), JSON.stringify(exams, null, 2));
console.log(apply ? 'Applied local versions.' : 'Diff only.');
