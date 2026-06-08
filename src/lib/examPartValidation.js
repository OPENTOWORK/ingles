import { getLevelExamLabel, getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import { isA2GeneratedPartComplete } from '@/lib/draloAiA2ExamPrompts';

const WRITING_PART2_FORMATS = new Set(['article', 'email', 'letter', 'review', 'report']);

const SUMMARY_ESSAY_MARKERS = [
  'text1title',
  'text2title',
  'text1body',
  'text2body',
  'passagea',
  'passageb',
  'summaris',
  'summariz',
  '240',
  '280',
  'two texts',
  'both texts',
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function hasText(value) {
  return String(value || '').trim().length > 0;
}

function normalizeWritingFormat(format) {
  const f = String(format || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (f.includes('email') || f.includes('letter')) return f.includes('letter') ? 'letter' : 'email';
  if (f.includes('article')) return 'article';
  if (f.includes('review')) return 'review';
  if (f.includes('report')) return 'report';
  return f || 'article';
}

/** Fix common B2 Writing AI mistakes before validation/persist. */
export function normalizeGeneratedExamPart(slug, partDef, generated) {
  if (!generated || typeof generated !== 'object' || !partDef) return generated;

  const levelLabel = getLevelExamLabel(slug);
  const gen = { ...generated };

  gen.questions = asArray(gen.questions).map((q, i) => ({
    ...q,
    number: q?.number ?? i + 1,
  }));
  gen.bulletPoints = asArray(gen.bulletPoints);
  gen.modelAnswers = asArray(gen.modelAnswers);
  gen.speakingPrompts = asArray(gen.speakingPrompts);
  gen.discussionQuestions = asArray(gen.discussionQuestions);
  gen.collaborativePrompts = asArray(gen.collaborativePrompts);
  gen.sections = asArray(gen.sections);
  gen.sentencePool = asArray(gen.sentencePool);

  if (partDef.mode !== 'writing') {
    gen.partNumber = partDef.partNumber;
    return gen;
  }

  if (levelLabel === 'B2' && partDef.activity === 'essay') {
    gen.wordMin = 140;
    gen.wordMax = 190;
    for (const key of [
      'text1Title',
      'text1Body',
      'text2Title',
      'text2Body',
      'text1',
      'text2',
      'passageA',
      'passageB',
      'summaryInstruction',
      'example',
    ]) {
      delete gen[key];
    }
    if (!gen.bulletPoints.length && asArray(gen.requiredPoints).length) {
      gen.bulletPoints = asArray(gen.requiredPoints);
    }
    if (!gen.question && hasText(gen.taskTitle)) gen.question = gen.taskTitle;
    if (!gen.instructions && hasText(gen.directions)) gen.instructions = gen.directions;
  }

  if (partDef.activity === 'part-2') {
    const wordMin = levelLabel === 'A2' ? 80 : levelLabel === 'B1' ? 120 : 140;
    const wordMax = levelLabel === 'A2' ? 100 : levelLabel === 'B1' ? 150 : 190;
    gen.wordMin = gen.wordMin || wordMin;
    gen.wordMax = gen.wordMax || wordMax;
    gen.questions = gen.questions.map((q, i) => ({
      ...q,
      number: q.number ?? i + 1,
      format: normalizeWritingFormat(q.format || q.writingType || q.type),
      prompt: q.prompt || q.task || q.instructions || '',
      context: q.context || q.scenario || '',
      targetReader: q.targetReader || q.reader || q.audience || '',
    }));
  }

  gen.partNumber = partDef.partNumber;
  return gen;
}

function looksLikeSummaryEssay(gen) {
  const blob = JSON.stringify(gen).toLowerCase();
  if (gen.text1Title || gen.text2Title || gen.text1Body || gen.text2Body) return true;
  if (Number(gen.wordMin) >= 200 || Number(gen.wordMax) >= 220) return true;
  return SUMMARY_ESSAY_MARKERS.some((m) => blob.includes(m));
}

function validateWritingPart(slug, partDef, gen, errors, warnings) {
  const levelLabel = getLevelExamLabel(slug);

  if (!hasText(gen.directions) && !hasText(gen.instructions)) {
    errors.push('Missing instructions or directions.');
  }

  if (partDef.activity === 'essay') {
    if (!hasText(gen.question)) errors.push('Essay task must include a clear question.');
    if (gen.bulletPoints.length < 3) {
      errors.push('Essay task must include exactly three bullet points (including “your own idea”).');
    }
    if (levelLabel === 'B2') {
      if (looksLikeSummaryEssay(gen)) {
        errors.push('B2 Writing Part 1 must be an essay, not a two-text summary task.');
      }
      if (Number(gen.wordMin) !== 140 || Number(gen.wordMax) !== 190) {
        warnings.push(`Word limit should be 140–190 words (got ${gen.wordMin ?? '?'}–${gen.wordMax ?? '?'}).`);
      }
    }
  }

  if (partDef.activity === 'email') {
    if (!hasText(gen.taskTitle) && !hasText(gen.instructions)) {
      errors.push('Email task must include taskTitle or instructions.');
    }
    if (!gen.bulletPoints.length && !hasText(gen.inputNotes)) {
      warnings.push('Email task should include bulletPoints or inputNotes.');
    }
  }

  if (partDef.activity === 'part-2') {
    if (gen.questions.length < 4) {
      errors.push('Writing Part 2 must include four optional tasks.');
    }
    const formats = new Set();
    gen.questions.forEach((q, i) => {
      const label = `Task ${q.number ?? i + 1}`;
      if (!hasText(q.prompt)) errors.push(`${label}: missing prompt/task text.`);
      const fmt = normalizeWritingFormat(q.format);
      if (!WRITING_PART2_FORMATS.has(fmt)) {
        errors.push(`${label}: format must be article, email, letter, review, or report.`);
      }
      formats.add(fmt);
      if (levelLabel === 'B2' && !hasText(q.context) && !hasText(q.targetReader)) {
        warnings.push(`${label}: add context and targetReader for clarity.`);
      }
    });
    if (formats.size < Math.min(4, gen.questions.length)) {
      warnings.push('Part 2 tasks should use different writing formats where possible.');
    }
    if (levelLabel === 'B2' && (Number(gen.wordMin) > 150 || Number(gen.wordMax) > 200)) {
      warnings.push('B2 Writing Part 2 word limit should be 140–190 words.');
    }
  }
}

function validateReadingUseOfEnglish(partDef, gen, errors, warnings) {
  if (!hasText(gen.instructions) && !hasText(gen.directions) && partDef.mode !== 'use-of-english') {
    warnings.push('Missing instructions (optional for some cloze parts).');
  }

  const needsPassage =
    partDef.activity !== 'key-word' &&
    !(partDef.activity === 'multiple-matching' && partDef.mode === 'reading' && gen.sections?.length);

  if (needsPassage && partDef.mode !== 'speaking' && partDef.mode !== 'writing') {
    if (!hasText(gen.passage) && !gen.sections?.length && !gen.sentencePool?.length) {
      errors.push('Missing passage, sections, or sentence pool.');
    }
  }

  const questions = gen.questions;
  if (!questions.length && !gen.modelAnswers?.length) {
    errors.push('Missing questions or model answers.');
  }

  if (partDef.activity === 'multiple-choice-cloze' || partDef.activity === 'multiple-choice') {
    const withOptions = questions.filter((q) => asArray(q.options).length >= 2);
    if (withOptions.length < 2) errors.push('Multiple-choice parts need options on questions.');
  }

  if (partDef.activity === 'key-word' && questions.length < 6) {
    errors.push('Key word transformations need at least 6 items (questions 25–30).');
  }
}

function validateListening(partDef, gen, errors, warnings) {
  if (!hasText(gen.script)) errors.push('Listening part must include a script.');
  if (!gen.questions.length && !gen.modelAnswers.length) {
    errors.push('Listening part must include questions or model answers.');
  }
  if (partDef.activity === 'multiple-matching' && partDef.mode === 'listening') {
    const pool = asArray(gen.optionPool);
    const matching = asArray(gen.matchingAnswers);
    if (pool.length < 8) errors.push('Listening Part 3 matching needs an A–H option pool (8 items).');
    if (matching.length < 5) errors.push('Listening Part 3 matching needs five matchingAnswers (Q19–23).');
  }
  if (partDef.activity === 'conversation' && partDef.mode === 'listening' && partDef.partNumber === 13) {
    const mcq = asArray(gen.questions).filter((q) => asArray(q.options).length >= 3);
    if (mcq.length < 7) errors.push('Listening Part 4 needs seven MCQ questions (Q24–30) with A/B/C options.');
    if (asArray(gen.optionPool).length) {
      warnings.push('Part 13 should not include an A–H matching pool (use per-question A/B/C options).');
    }
  }
  if (partDef.needsAudio && !hasText(gen.script)) {
    errors.push('Audio generation requires a script.');
  } else if (partDef.needsAudio) {
    warnings.push('Audio will be synthesized on save unless skipAudio is enabled.');
  }
}

function validateSpeaking(gen, errors) {
  const hasPrompts =
    gen.speakingPrompts.length ||
    gen.discussionQuestions.length ||
    gen.collaborativePrompts.length ||
    hasText(gen.picturePrompt) ||
    hasText(gen.photoDescription) ||
    hasText(gen.comparePrompt);

  if (!hasText(gen.directions) && !hasText(gen.instructions)) {
    errors.push('Speaking part must include examiner directions or instructions.');
  }
  if (!hasPrompts) errors.push('Speaking part must include prompts or discussion questions.');
}

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[], normalized: object }}
 */
export function validateGeneratedExamPart(slug, partNumber, generated) {
  const key = String(slug || '').toLowerCase();
  const pn = Number(partNumber);
  const errors = [];
  const warnings = [];

  let partDef =
    key === 'a2'
      ? A2_EXAM_PARTS.find((p) => p.partNumber === pn)
      : getLevelExamPartDef(key, pn);

  if (!partDef) {
    return { ok: false, errors: [`Unknown part: ${pn}`], warnings: [], normalized: generated };
  }

  const normalized = normalizeGeneratedExamPart(key, partDef, generated);

  if (key === 'a2') {
    if (!isA2GeneratedPartComplete(normalized, partDef)) {
      errors.push('Generated A2 part appears incomplete (questions, options, or script missing).');
    }
    return { ok: errors.length === 0, errors, warnings, normalized };
  }

  switch (partDef.mode) {
    case 'writing':
      validateWritingPart(key, partDef, normalized, errors, warnings);
      break;
    case 'listening':
      validateListening(partDef, normalized, errors, warnings);
      break;
    case 'speaking':
      validateSpeaking(normalized, errors);
      break;
    default:
      validateReadingUseOfEnglish(partDef, normalized, errors, warnings);
      break;
  }

  const qCount = normalized.questions?.length || 0;
  const maCount = normalized.modelAnswers?.length || 0;
  if (partDef.mode === 'reading' || partDef.mode === 'use-of-english') {
    if (qCount < 1 && maCount < 1) errors.push('No scorable questions found.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    normalized,
  };
}
