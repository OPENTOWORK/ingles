/**
 * DRALO RUOE PHASE A pilot generator — pack-local only.
 * Does not write to production DB or app routes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACK_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACK_ROOT, '..', '..');

const { loadEnvLocal } = await import(
  pathToFileURL(path.join(REPO_ROOT, 'scripts', 'load-env-local.mjs')).href
);
loadEnvLocal();

const GENERATION_VERSION = 'phase-a-v1.1-2026-08-12';
const MODEL = process.env.DRALO_RUOE_PILOT_MODEL || 'gpt-4o-2024-08-06';

const PART_NUM = {
  'Part 1': 1,
  'Part 2': 2,
  'Part 3': 3,
  'Part 5': 5,
  'Part 6': 6,
  'Part 7': 7,
};

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function loadPromptsByPart() {
  const md = read(path.join(__dirname, 'DRALO_RUOE_Pilot_Runtime_Prompts_v1_1.md'));
  const global = md.split('## Part 1 —')[0].trim();
  const map = {};
  const re = /## Part (\d+) —([\s\S]*?)(?=\n## Part \d+ —|\n---\n\n## Part|\n*$)/g;
  let m;
  while ((m = re.exec(md))) {
    map[Number(m[1])] = (`## Part ${m[1]} —` + m[2]).trim();
  }
  return { global, map };
}

function examFolder(examId) {
  return examId.includes('E01') ? 'EXAM-01' : 'EXAM-02';
}

function partSlug(part) {
  return part.replace(/\s+/g, '');
}

function countWords(text) {
  return String(text || '')
    .replace(/\([0-9]+\)/g, ' ')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function schemaForPart(partNumber) {
  const baseMeta = {
    type: 'object',
    additionalProperties: false,
    properties: {
      brief_fidelity_notes: { type: 'string' },
      style_card_notes: { type: 'string' },
      british_english_notes: { type: 'string' },
      factuality_notes: { type: 'string' },
      answer_validity_notes: { type: 'string' },
      self_check_flags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'brief_fidelity_notes',
      'style_card_notes',
      'british_english_notes',
      'factuality_notes',
      'answer_validity_notes',
      'self_check_flags',
    ],
  };

  if (partNumber === 1) {
    return {
      name: 'ruoe_part1',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          part_title: { type: 'string' },
          instructions: { type: 'string' },
          text_title: { type: 'string' },
          passage_with_gaps: { type: 'string' },
          example: {
            type: 'object',
            additionalProperties: false,
            properties: {
              number: { type: 'integer' },
              options: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  A: { type: 'string' },
                  B: { type: 'string' },
                  C: { type: 'string' },
                  D: { type: 'string' },
                },
                required: ['A', 'B', 'C', 'D'],
              },
              answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              explanation: { type: 'string' },
            },
            required: ['number', 'options', 'answer', 'explanation'],
          },
          questions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'integer' },
                options: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    A: { type: 'string' },
                    B: { type: 'string' },
                    C: { type: 'string' },
                    D: { type: 'string' },
                  },
                  required: ['A', 'B', 'C', 'D'],
                },
                answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                lexical_focus: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: ['number', 'options', 'answer', 'lexical_focus', 'rationale'],
            },
          },
          validation_notes: baseMeta,
        },
        required: [
          'part_title',
          'instructions',
          'text_title',
          'passage_with_gaps',
          'example',
          'questions',
          'validation_notes',
        ],
      },
    };
  }

  if (partNumber === 2) {
    return {
      name: 'ruoe_part2',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          part_title: { type: 'string' },
          instructions: { type: 'string' },
          text_title: { type: 'string' },
          passage_with_gaps: { type: 'string' },
          example: {
            type: 'object',
            additionalProperties: false,
            properties: {
              number: { type: 'integer' },
              answer: { type: 'string' },
              explanation: { type: 'string' },
            },
            required: ['number', 'answer', 'explanation'],
          },
          questions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'integer' },
                answer: { type: 'string' },
                grammar_focus: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: ['number', 'answer', 'grammar_focus', 'rationale'],
            },
          },
          validation_notes: baseMeta,
        },
        required: [
          'part_title',
          'instructions',
          'text_title',
          'passage_with_gaps',
          'example',
          'questions',
          'validation_notes',
        ],
      },
    };
  }

  if (partNumber === 3) {
    return {
      name: 'ruoe_part3',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          part_title: { type: 'string' },
          instructions: { type: 'string' },
          text_title: { type: 'string' },
          passage_with_gaps: { type: 'string' },
          example: {
            type: 'object',
            additionalProperties: false,
            properties: {
              number: { type: 'integer' },
              stem: { type: 'string' },
              answer: { type: 'string' },
              explanation: { type: 'string' },
            },
            required: ['number', 'stem', 'answer', 'explanation'],
          },
          questions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'integer' },
                stem: { type: 'string' },
                answer: { type: 'string' },
                transformation_type: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: ['number', 'stem', 'answer', 'transformation_type', 'rationale'],
            },
          },
          validation_notes: baseMeta,
        },
        required: [
          'part_title',
          'instructions',
          'text_title',
          'passage_with_gaps',
          'example',
          'questions',
          'validation_notes',
        ],
      },
    };
  }

  if (partNumber === 5) {
    return {
      name: 'ruoe_part5',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          part_title: { type: 'string' },
          instructions: { type: 'string' },
          text_title: { type: 'string' },
          article: { type: 'string' },
          questions: {
            type: 'array',
            minItems: 6,
            maxItems: 6,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'integer' },
                question_type: { type: 'string' },
                prompt: { type: 'string' },
                options: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    A: { type: 'string' },
                    B: { type: 'string' },
                    C: { type: 'string' },
                    D: { type: 'string' },
                  },
                  required: ['A', 'B', 'C', 'D'],
                },
                answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                evidence: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: [
                'number',
                'question_type',
                'prompt',
                'options',
                'answer',
                'evidence',
                'rationale',
              ],
            },
          },
          validation_notes: baseMeta,
        },
        required: [
          'part_title',
          'instructions',
          'text_title',
          'article',
          'questions',
          'validation_notes',
        ],
      },
    };
  }

  if (partNumber === 6) {
    return {
      name: 'ruoe_part6',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          part_title: { type: 'string' },
          instructions: { type: 'string' },
          text_title: { type: 'string' },
          passage_with_gaps: { type: 'string' },
          sentence_pool: {
            type: 'object',
            additionalProperties: false,
            properties: {
              A: { type: 'string' },
              B: { type: 'string' },
              C: { type: 'string' },
              D: { type: 'string' },
              E: { type: 'string' },
              F: { type: 'string' },
              G: { type: 'string' },
            },
            required: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          },
          questions: {
            type: 'array',
            minItems: 6,
            maxItems: 6,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'integer' },
                answer: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
                cohesion_focus: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: ['number', 'answer', 'cohesion_focus', 'rationale'],
            },
          },
          unused_sentence: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
          validation_notes: baseMeta,
        },
        required: [
          'part_title',
          'instructions',
          'text_title',
          'passage_with_gaps',
          'sentence_pool',
          'questions',
          'unused_sentence',
          'validation_notes',
        ],
      },
    };
  }

  // Part 7
  return {
    name: 'ruoe_part7',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        part_title: { type: 'string' },
        instructions: { type: 'string' },
        matching_intro: { type: 'string' },
        common_context_title: { type: 'string' },
        sections: {
          type: 'object',
          additionalProperties: false,
          properties: {
            A: {
              type: 'object',
              additionalProperties: false,
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['label', 'text'],
            },
            B: {
              type: 'object',
              additionalProperties: false,
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['label', 'text'],
            },
            C: {
              type: 'object',
              additionalProperties: false,
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['label', 'text'],
            },
            D: {
              type: 'object',
              additionalProperties: false,
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['label', 'text'],
            },
          },
          required: ['A', 'B', 'C', 'D'],
        },
        questions: {
          type: 'array',
          minItems: 10,
          maxItems: 10,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              number: { type: 'integer' },
              prompt: { type: 'string' },
              answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              evidence: { type: 'string' },
              rationale: { type: 'string' },
            },
            required: ['number', 'prompt', 'answer', 'evidence', 'rationale'],
          },
        },
        validation_notes: baseMeta,
      },
      required: [
        'part_title',
        'instructions',
        'matching_intro',
        'common_context_title',
        'sections',
        'questions',
        'validation_notes',
      ],
    },
  };
}

function selfCheck(brief, exercise, partNumber) {
  const errors = [];
  const warnings = [];

  if (brief.editorial_status !== 'Approved') {
    errors.push(`editorial_status is ${brief.editorial_status}, expected Approved`);
  }

  const passage =
    exercise.passage_with_gaps ||
    exercise.article ||
    Object.values(exercise.sections || {})
      .map((s) => s.text)
      .join(' ');

  const wc = countWords(passage);
  exercise._word_count = wc;

  if (partNumber === 1 || partNumber === 2 || partNumber === 3) {
    if (wc < 150 || wc > 180) errors.push(`word_count ${wc} outside 150–180`);
    else if (wc < 160 || wc > 170) warnings.push(`word_count ${wc} outside target 160–170`);
  }
  if (partNumber === 5) {
    if (wc < 550 || wc > 650) errors.push(`word_count ${wc} outside 550–650`);
    else if (wc < 580 || wc > 620) warnings.push(`word_count ${wc} outside target 580–620`);
  }
  if (partNumber === 6) {
    if (wc < 500 || wc > 600) errors.push(`word_count ${wc} outside 500–600`);
    else if (wc < 540 || wc > 570) warnings.push(`word_count ${wc} outside target 540–570`);
  }
  if (partNumber === 7) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      const swc = countWords(exercise.sections?.[letter]?.text);
      if (swc < 120 || swc > 150) {
        warnings.push(`section ${letter} word_count ${swc} outside target 120–150`);
      }
      if (swc < 100 || swc > 180) errors.push(`section ${letter} word_count ${swc} severely off-range`);
    }
  }

  const textBlob = JSON.stringify(exercise).toLowerCase();
  if (/\bcambridge\b/.test(textBlob) && partNumber >= 5) {
    warnings.push('visible text may mention Cambridge');
  }

  if (partNumber === 1) {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) {
        errors.push(`missing gap marker (${n})`);
      }
    }
    if (exercise.questions?.length !== 8) errors.push('expected 8 scored questions');
    const letters = (exercise.questions || []).map((q) => q.answer);
    for (const L of ['A', 'B', 'C', 'D']) {
      if (letters.filter((x) => x === L).length > 3) {
        errors.push(`answer letter ${L} appears more than 3 times`);
      }
    }
    for (const q of exercise.questions || []) {
      for (const L of ['A', 'B', 'C', 'D']) {
        const opt = q.options?.[L] || '';
        if (opt.trim().split(/\s+/).length !== 1) {
          errors.push(`Q${q.number} option ${L} is not a single word`);
        }
      }
    }
  }

  if (partNumber === 2) {
    for (const n of [0, 9, 10, 11, 12, 13, 14, 15, 16]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) {
        errors.push(`missing gap marker (${n})`);
      }
    }
    for (const q of exercise.questions || []) {
      if (String(q.answer || '').trim().split(/\s+/).length !== 1) {
        errors.push(`Q${q.number} answer is not one word`);
      }
    }
  }

  if (partNumber === 3) {
    for (const n of [0, 17, 18, 19, 20, 21, 22, 23, 24]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) {
        errors.push(`missing gap marker (${n})`);
      }
    }
    for (const q of exercise.questions || []) {
      if (!q.stem || q.stem !== q.stem.toUpperCase()) {
        errors.push(`Q${q.number} stem must be CAPITALS`);
      }
      if (String(q.answer || '').trim().split(/\s+/).length !== 1) {
        errors.push(`Q${q.number} answer must be one derived word`);
      }
    }
  }

  if (partNumber === 5) {
    const nums = (exercise.questions || []).map((q) => q.number);
    if (JSON.stringify(nums) !== JSON.stringify([31, 32, 33, 34, 35, 36])) {
      errors.push('Part 5 numbers must be 31–36');
    }
    const letters = (exercise.questions || []).map((q) => q.answer);
    const uniq = new Set(letters);
    if (uniq.size < 3) errors.push('Part 5 answers use fewer than 3 different letters');
    let run = 1;
    for (let i = 1; i < letters.length; i++) {
      run = letters[i] === letters[i - 1] ? run + 1 : 1;
      if (run > 2) errors.push(`Part 5 answer letter run exceeds 2 at Q${31 + i}`);
    }
  }

  if (partNumber === 6) {
    for (const n of [37, 38, 39, 40, 41, 42]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) {
        errors.push(`missing gap marker (${n})`);
      }
    }
    const answers = (exercise.questions || []).map((q) => q.answer);
    if (new Set(answers).size !== 6) errors.push('Part 6 answers must be six distinct letters');
    if (!exercise.unused_sentence) errors.push('missing unused_sentence');
    if (answers.includes(exercise.unused_sentence)) {
      errors.push('unused_sentence appears among answers');
    }
  }

  if (partNumber === 7) {
    const nums = (exercise.questions || []).map((q) => q.number);
    if (nums.length !== 10 || nums[0] !== 43 || nums[9] !== 52) {
      errors.push('Part 7 numbers must be 43–52');
    }
    const used = new Set((exercise.questions || []).map((q) => q.answer));
    for (const L of ['A', 'B', 'C', 'D']) {
      if (!used.has(L)) warnings.push(`profile ${L} unused in answers`);
    }
  }

  // Avoid list soft check
  for (const item of brief.avoid || []) {
    const needle = String(item).toLowerCase().slice(0, 40);
    if (needle.length > 12 && textBlob.includes(needle)) {
      warnings.push(`possible Avoid hit: ${String(item).slice(0, 80)}`);
    }
  }

  return {
    status: errors.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass',
    errors,
    warnings,
    word_count: wc,
  };
}

async function generateOne(client, brief, styleCardText, prompts, repairContext = null) {
  const partNumber = PART_NUM[brief.part];
  if (!partNumber) throw new Error(`Unsupported part ${brief.part}`);

  const format = schemaForPart(partNumber);
  const system = [
    'You are generating one B2 First Reading and Use of English pilot exercise for DRALO.',
    'Follow the Part runtime prompt for exam mechanics.',
    'Follow the Approved Content Brief for editorial direction.',
    'Follow the assigned Style Card for editorial personality.',
    'British English only. CEFR B2.',
    'Do not invent statistics, studies, institutions or quotations.',
    'Do not copy CambridgeOne wording or scenarios.',
    'Do not mention Cambridge in learner-visible content.',
    'Do not change brief IDs, topic assignments or style card assignment.',
    'Every scored item must have exactly one defendable answer.',
    'Return JSON matching the schema exactly.',
  ].join(' ');

  const hardLength = {
    1: 'HARD LENGTH: passage_with_gaps must contain 150–180 words total (target 160–170). Count words before returning. If over 180, shorten; if under 150, expand.',
    2: 'HARD LENGTH: passage_with_gaps must contain 150–180 words total (target 160–170). Count words before returning.',
    3: 'HARD LENGTH: passage_with_gaps must contain 150–180 words total (target ~165). Count words before returning.',
    5: 'HARD LENGTH: article must contain 550–650 words (target 580–620). This is a full magazine-length article with several developed paragraphs. Do NOT write a short summary. Count words before returning. If under 550, add developed paragraphs with concrete detail.',
    6: 'HARD LENGTH: passage_with_gaps must contain 500–600 words (target 540–570), about seven paragraphs of 70–90 words. Do NOT write a short text. Count words before returning.',
    7: 'HARD LENGTH: each of sections A–D.text must contain 120–150 words. Expand each profile with concrete detail. Do NOT write short blurbs under 120 words.',
  }[partNumber];

  const hardMechanics = {
    1: 'HARD MECHANICS: exactly markers (0)–(8); each option A–D is ONE word only; scored answers 1–8 must use varied letters — no letter more than three times; mix lexical focuses.',
    2: 'HARD MECHANICS: markers (0) and (9)–(16); each answer exactly ONE function word; unique acceptable answer; varied grammar categories.',
    3: 'HARD MECHANICS: markers (0) and (17)–(24); stems in CAPITALS; one derived word answer; varied transformation types; no repeated word family.',
    5: 'HARD MECHANICS: questions 31–36 in order; answers use at least three different letters A–D; never more than two consecutive identical answer letters; at least two inference/attitude/purpose/reference/global questions.',
    6: 'HARD MECHANICS: markers (37)–(42); sentence_pool A–G; six distinct answers; exactly one unused_sentence; cohesion-based, not keyword matching.',
    7: 'HARD MECHANICS: questions 43–52; answers A–D may repeat but all four profiles should be used; one defendable answer each; avoid keyword matching.',
  }[partNumber];

  const user = [
    prompts.global,
    '',
    '=== PART RUNTIME PROMPT ===',
    prompts.map[partNumber],
    '',
    hardLength,
    hardMechanics,
    '',
    '=== APPROVED CONTENT BRIEF (do not alter) ===',
    JSON.stringify(brief, null, 2),
    '',
    '=== ASSIGNED STYLE CARD ===',
    styleCardText,
    '',
    repairContext
      ? [
          '=== PREVIOUS DRAFT TO REPAIR (keep editorial fidelity; fix ONLY the listed errors) ===',
          JSON.stringify(repairContext.previousExercise, null, 2),
          '',
          '=== SELF-CHECK ERRORS TO FIX ===',
          repairContext.errors.join('\n'),
          repairContext.warnings?.length
            ? 'Warnings to improve:\n' + repairContext.warnings.join('\n')
            : '',
          '',
          'Return a complete corrected exercise JSON.',
        ].join('\n')
      : 'Generate the complete exercise now.',
  ].join('\n');

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: repairContext ? 0.35 : 0.45,
    max_tokens: partNumber >= 5 ? 8000 : 4000,
    response_format: {
      type: 'json_schema',
      json_schema: format,
    },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  const exercise = JSON.parse(raw);
  const usage = completion.usage || {};
  return {
    exercise,
    usage: {
      model: completion.model || MODEL,
      prompt_tokens: usage.prompt_tokens ?? null,
      completion_tokens: usage.completion_tokens ?? null,
      total_tokens: usage.total_tokens ?? null,
    },
  };
}

function buildOutput(brief, exercise, check, usage, attempt) {
  return {
    pack_version: '1.1',
    batch_id: brief.batch_id,
    phase: 'A',
    generation_version: GENERATION_VERSION,
    attempt,
    generated_at: new Date().toISOString(),
    exam_id: brief.exam_id,
    part: brief.part,
    part_number: PART_NUM[brief.part],
    brief_id: brief.brief_id,
    brief_version: brief.brief_version,
    style_card_id: brief.style_card_id,
    style_card_version: brief.style_card_version,
    working_title: brief.working_title,
    editorial_status_input: brief.editorial_status,
    provider_usage: usage,
    self_check: check,
    exercise,
    human_review_required: true,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
  };
}

async function main() {
  const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] || null;
  const failedOnly = process.argv.includes('--failed-only');
  const maxAttempts = Number(process.env.RUOE_PILOT_MAX_ATTEMPTS || 4);

  const briefsDoc = JSON.parse(
    read(path.join(PACK_ROOT, '02_APPROVED_INPUTS', 'DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json')),
  );
  const prompts = loadPromptsByPart();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing');
    process.exit(1);
  }

  const prevRunPath = path.join(PACK_ROOT, '05_OUTPUTS', '_phase_a_run_results.json');
  const prevFailed = new Set();
  if (failedOnly && fs.existsSync(prevRunPath)) {
    const prev = JSON.parse(read(prevRunPath));
    for (const r of prev.results || []) {
      if (r.status === 'fail') prevFailed.add(r.brief_id);
    }
  }

  const results = [];
  const briefs = briefsDoc.briefs.filter((b) => {
    if (only && b.brief_id !== only) return false;
    if (failedOnly && !prevFailed.has(b.brief_id)) return false;
    return true;
  });

  for (const brief of briefs) {
    console.log(`\n=== ${brief.brief_id} ${brief.exam_id} ${brief.part} ===`);
    if (brief.editorial_status !== 'Approved') {
      console.error('SKIP: not Approved');
      results.push({ brief_id: brief.brief_id, status: 'skipped_not_approved' });
      continue;
    }

    const stylePath = path.join(__dirname, '_style_cards', `${brief.style_card_id}.txt`);
    if (!fs.existsSync(stylePath)) {
      throw new Error(`Missing style card file ${stylePath}`);
    }
    const styleCardText = read(stylePath);

    const folder = path.join(PACK_ROOT, '05_OUTPUTS', examFolder(brief.exam_id));
    fs.mkdirSync(folder, { recursive: true });
    const baseName = `${brief.brief_id}_${partSlug(brief.part)}`;
    const latestPath = path.join(folder, `${baseName}.json`);

    let previousExercise = null;
    let previousErrors = [];
    let previousWarnings = [];
    let startAttempt = 1;
    if (fs.existsSync(latestPath)) {
      try {
        const prevDoc = JSON.parse(read(latestPath));
        previousExercise = prevDoc.exercise || null;
        previousErrors = prevDoc.self_check?.errors || [];
        previousWarnings = prevDoc.self_check?.warnings || [];
        startAttempt = Number(prevDoc.attempt || 0) + 1;
      } catch {
        /* ignore */
      }
    }

    let finalDoc = null;
    for (let i = 0; i < maxAttempts; i++) {
      const attempt = startAttempt + i;
      console.log(`attempt ${attempt} model=${MODEL}`);
      try {
        const repairContext =
          previousExercise && previousErrors.length
            ? {
                previousExercise,
                errors: previousErrors,
                warnings: previousWarnings,
              }
            : null;
        const { exercise, usage } = await generateOne(
          client,
          brief,
          styleCardText,
          prompts,
          repairContext,
        );
        const check = selfCheck(brief, exercise, PART_NUM[brief.part]);
        const doc = buildOutput(brief, exercise, check, usage, attempt);
        const attemptPath = path.join(folder, `${baseName}.v${attempt}.json`);
        fs.writeFileSync(attemptPath, JSON.stringify(doc, null, 2));
        console.log(
          `saved ${path.relative(PACK_ROOT, attemptPath)} status=${check.status} words=${check.word_count}`,
        );
        if (check.errors.length) console.log('errors:', check.errors.join(' | '));
        if (check.warnings.length) console.log('warnings:', check.warnings.join(' | '));

        finalDoc = doc;
        previousExercise = exercise;
        previousErrors = check.errors;
        previousWarnings = check.warnings;
        if (check.status !== 'fail') break;
        console.log('fail — regenerating only this exercise');
      } catch (err) {
        console.error('generation error:', err.message || err);
        if (i === maxAttempts - 1) {
          finalDoc = {
            brief_id: brief.brief_id,
            exam_id: brief.exam_id,
            part: brief.part,
            phase: 'A',
            self_check: { status: 'fail', errors: [String(err.message || err)], warnings: [] },
            human_review_required: true,
            pedagogical_approval: 'PENDING_HUMAN_REVIEW',
          };
        }
      }
    }

    if (finalDoc) {
      fs.writeFileSync(latestPath, JSON.stringify(finalDoc, null, 2));
      results.push({
        brief_id: brief.brief_id,
        exam_id: brief.exam_id,
        part: brief.part,
        file: path.relative(PACK_ROOT, latestPath).replace(/\\/g, '/'),
        status: finalDoc.self_check?.status || 'unknown',
        errors: finalDoc.self_check?.errors || [],
        warnings: finalDoc.self_check?.warnings || [],
        word_count: finalDoc.self_check?.word_count ?? null,
        attempt: finalDoc.attempt || null,
      });
    }
  }

  // Merge with previous pass results for non-rerun briefs
  let merged = results;
  if (failedOnly && fs.existsSync(prevRunPath)) {
    const prev = JSON.parse(read(prevRunPath));
    const byId = new Map((prev.results || []).map((r) => [r.brief_id, r]));
    for (const r of results) byId.set(r.brief_id, r);
    merged = [...byId.values()].sort((a, b) => a.brief_id.localeCompare(b.brief_id));
  }

  const summaryPath = path.join(PACK_ROOT, '05_OUTPUTS', '_phase_a_run_results.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        model: MODEL,
        generation_version: GENERATION_VERSION,
        results: merged,
      },
      null,
      2,
    ),
  );
  console.log('\nWrote', summaryPath);
  console.log(JSON.stringify(merged, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
