/**
 * Read-only dump: B2 Exam 1 Speaking Parts 14–17 (post-improvements review).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dump-exam1-b2-speaking-final.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getB2LongTurnPhotoUrls } from '../src/data/b2-speaking-long-turn-photos.js';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXAM_SLOT = 1;
const SPEAKING_PARTS = [
  { partNumber: 14, cambridge: 'Speaking Part 1 — Interview', activity: 'interview' },
  { partNumber: 15, cambridge: 'Speaking Part 2 — Long turn / photographs', activity: 'long-turn' },
  { partNumber: 16, cambridge: 'Speaking Part 3 — Collaborative task', activity: 'collaborative' },
  { partNumber: 17, cambridge: 'Speaking Part 4 — Discussion', activity: 'discussion' },
];

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

const JSON_OUT = path.join(outDir, 'dump-exam1-b2-speaking-final.json');
const MD_OUT = path.join(outDir, 'dump-exam1-b2-speaking-final.md');

const env = loadEnvLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function parseNumberedQuestions(text) {
  return (String(text || '').match(/^\d+\.\s+.+$/gm) || []).map((line) => line.trim());
}

function parseBulletPrompts(text) {
  return (String(text || '').match(/^•\s+.+$/gm) || []).map((line) => line.replace(/^•\s+/, '').trim());
}

function extractCentralQuestion(text) {
  const m = String(text || '').match(/Central question\s*\n([\s\S]*?)(?=\n\nTask prompts|\nTask prompts)/i);
  return m ? m[1].trim() : '';
}

function extractFollowUp(text) {
  const m = String(text || '').match(/Follow-up question:\s*\n?([\s\S]+?)$/i);
  return m ? m[1].trim() : '';
}

function part14Questions(enunciado) {
  const lines = String(enunciado || '').split('\n');
  const questions = [];
  let current = null;
  for (const line of lines) {
    const q = line.match(/^(\d+)\.\s+(.+)/);
    if (q) {
      if (current) questions.push(current);
      current = { number: Number(q[1]), text: q[2].trim() };
    }
  }
  if (current) questions.push(current);
  return questions;
}

async function fetchSpeakingPart(partNumber) {
  const { data: parte, error: parteErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  if (parteErr || !parte?.id) throw new Error(parteErr?.message || `Parte ${partNumber} not found`);

  const { data: pregunta, error: qErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado, creado_en')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id)
    .maybeSingle();
  if (qErr) throw new Error(qErr.message);

  const [mcq, open, audios] = await Promise.all([
    admin.from('levels_respuestas').select('id').eq('pregunta_id', pregunta?.id),
    admin.from('levels_respuestas_abiertas').select('id').eq('pregunta_id_abierta', pregunta?.id),
    admin
      .from('levels_preguntas_audios')
      .select('id, orden, titulo, audio_url')
      .eq('pregunta_id', pregunta?.id)
      .order('orden'),
  ]);

  const descripcion = parte['Descripción'] ?? parte.Descripción ?? '';
  const enunciado = String(pregunta?.enunciado || '');

  let resources = null;
  let technicalNotes = [];

  if (partNumber === 15) {
    const photoUrls = getB2LongTurnPhotoUrls(EXAM_SLOT);
    const publicDir = path.join(root, 'public');
    resources = {
      type: 'photographs',
      configUrls: photoUrls,
      files: [
        'public/b2-speaking/exam-1/photo-a.png',
        'public/b2-speaking/exam-1/photo-b.png',
      ],
      filesExist: {
        photoA: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-a.png')),
        photoB: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-b.png')),
      },
      source: 'src/data/b2-speaking-long-turn-photos.js (UI resolves images; not stored in Supabase)',
    };
    technicalNotes.push('Photos are served from public/ and mapped in b2-speaking-long-turn-photos.js for exam slot 1.');
  } else {
    resources = { type: 'text-only', audioClips: audios.data?.length || 0 };
    if (partNumber === 16) {
      technicalNotes.push('Collaborative task: no image asset in DB; task sheet is text in enunciado.');
    }
    if (partNumber === 17) {
      technicalNotes.push('Discussion links thematically to Part 16 (technology + city life).');
    }
  }

  if ((mcq.data?.length || 0) > 0) technicalNotes.push(`MCQ rows in DB: ${mcq.data.length}`);
  if ((open.data?.length || 0) > 0) technicalNotes.push(`Open answer rows in DB: ${open.data.length}`);
  if ((audios.data?.length || 0) > 0) {
    technicalNotes.push(`Audio clips linked: ${audios.data.length}`);
  }

  return {
    partNumber,
    parteId: parte.id,
    parteNombre: parte.nombre_parte,
    preguntaId: pregunta?.id || null,
    descripcionParte: descripcion,
    enunciado,
    resources,
    technicalNotes,
    dbCounts: {
      mcqRows: mcq.data?.length || 0,
      openAnswerRows: open.data?.length || 0,
      audioClips: audios.data?.length || 0,
    },
  };
}

const { data: examRow } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('id', EXAMEN_ID)
  .single();

const parts = [];
for (const spec of SPEAKING_PARTS) {
  const row = await fetchSpeakingPart(spec.partNumber);
  parts.push({ ...spec, ...row });
}

const p14 = parts.find((p) => p.partNumber === 14);
const p15 = parts.find((p) => p.partNumber === 15);
const p16 = parts.find((p) => p.partNumber === 16);
const p17 = parts.find((p) => p.partNumber === 17);

const p14Questions = part14Questions(p14.enunciado);
const p16Bullets = parseBulletPrompts(p16.enunciado);
const p17Questions = parseNumberedQuestions(p17.enunciado);

const confirmations = [
  {
    id: 'part14_eight_questions',
    label: 'Part 14 has 8 numbered questions',
    ok: p14Questions.length === 8,
    detail: `found ${p14Questions.length}`,
  },
  {
    id: 'part15_no_candidate_ab',
    label: 'Part 15 does not mention Candidate A/B',
    ok: !/Candidate A:/i.test(p15.enunciado) && !/Candidate B:/i.test(p15.enunciado),
  },
  {
    id: 'part15_no_four_minutes_total',
    label: 'Part 15 does not mention "4 minutes in total"',
    ok: !/4 minutes in total/i.test(p15.enunciado),
  },
  {
    id: 'part15_photos_config',
    label: 'Part 15 photo paths in app config',
    ok:
      p15.resources?.configUrls?.some((u) => u.includes('/b2-speaking/exam-1/photo-a.png')) &&
      p15.resources?.configUrls?.some((u) => u.includes('/b2-speaking/exam-1/photo-b.png')),
  },
  {
    id: 'part15_photos_on_disk',
    label: 'Part 15 photo files exist on disk',
    ok: p15.resources?.filesExist?.photoA && p15.resources?.filesExist?.photoB,
  },
  {
    id: 'part16_central_question',
    label: 'Part 16 central question: technology and city life',
    ok: /How could technology make city life better without creating new problems for residents/i.test(
      p16.enunciado,
    ),
  },
  {
    id: 'part16_five_prompts',
    label: 'Part 16 has 5 task prompts',
    ok: p16Bullets.length === 5,
    detail: `found ${p16Bullets.length}`,
  },
  {
    id: 'part17_no_image_below',
    label: 'Part 17 does not mention "image shown below"',
    ok: !/image shown below/i.test(p17.descripcionParte + p17.enunciado),
  },
  {
    id: 'part17_links_part16',
    label: 'Part 17 connects to Part 16 / Part 3',
    ok:
      /In Part 3, you talked about different ways cities could use technology/i.test(p17.enunciado) &&
      /technology and city life/i.test(p17.enunciado),
  },
];

const dump = {
  meta: {
    examenId: EXAMEN_ID,
    examenNombre: examRow?.nombre || `Exam ${EXAM_SLOT}`,
    examSlot: EXAM_SLOT,
    level: 'B2',
    section: 'Speaking',
    dumpedAt: new Date().toISOString(),
    outputJson: JSON_OUT,
    outputMarkdown: MD_OUT,
    note: 'Read-only review dump. No Supabase or production code modified.',
  },
  parts,
  confirmations,
  allConfirmationsOk: confirmations.every((c) => c.ok),
  parsed: {
    part14: { questions: p14Questions },
    part15: {
      comparePrompt:
        (p15.enunciado.match(/Compare the two photographs[^\n]*/i) || [])[0]?.trim() ||
        'Compare the two photographs and say why the people might prefer each way of studying.',
      theme: (p15.enunciado.match(/Theme:\s*(.+)/i) || [])[1]?.trim() || 'Studying',
      photoA: (p15.enunciado.match(/Photo A:\s*(.+)/i) || [])[1]?.trim() || '',
      photoB: (p15.enunciado.match(/Photo B:\s*(.+)/i) || [])[1]?.trim() || '',
      followUp: extractFollowUp(p15.enunciado),
      photoUrls: p15.resources?.configUrls || [],
    },
    part16: {
      centralQuestion: extractCentralQuestion(p16.enunciado),
      taskPrompts: p16Bullets,
      decisionQuestion:
        (p16.enunciado.match(/Decision question\n([\s\S]+?)$/) || [])[1]?.trim() || '',
    },
    part17: { discussionQuestions: p17Questions },
  },
};

function buildMarkdown(d) {
  const p = d.parsed;
  const lines = [
    '# B2 Exam 1 — Speaking (Parts 14–17) — Review dump',
    '',
    `**Exam:** ${d.meta.examenNombre} · **examenId:** \`${d.meta.examenId}\``,
    `**Generated:** ${d.meta.dumpedAt}`,
    '',
    '---',
    '',
    '## Part 14 — Interview (Cambridge Speaking Part 1)',
    '',
    '**Duration:** about 2 minutes',
    '',
    '**Questions:**',
    ...p.part14.questions.map((q) => `${q.number}. ${q.text}`),
    '',
    '---',
    '',
    '## Part 15 — Long turn / Photographs (Cambridge Speaking Part 2)',
    '',
    `**Theme:** ${p.part15.theme}`,
    '',
    '**Photographs:**',
    `- Photo A: ${p.part15.photoA}`,
    `  - File: \`public/b2-speaking/exam-1/photo-a.png\``,
    `- Photo B: ${p.part15.photoB}`,
    `  - File: \`public/b2-speaking/exam-1/photo-b.png\``,
    '',
    '**Compare prompt:**',
    p.part15.comparePrompt || 'Compare the two photographs and say why the people might prefer each way of studying.',
    '',
    '**Follow-up question:**',
    p.part15.followUp,
    '',
    '---',
    '',
    '## Part 16 — Collaborative task (Cambridge Speaking Part 3)',
    '',
    '**Central question:**',
    p.part16.centralQuestion,
    '',
    '**Task prompts:**',
    ...p.part16.taskPrompts.map((t) => `- ${t}`),
    '',
    '**Decision question:**',
    p.part16.decisionQuestion,
    '',
    '---',
    '',
    '## Part 17 — Discussion (Cambridge Speaking Part 4)',
    '',
    '**Bridge from Part 3:** In Part 3, you talked about different ways cities could use technology to improve residents\' daily lives.',
    '',
    '**Discussion questions:**',
    ...p.part17.discussionQuestions,
    '',
    '---',
    '',
    '## Confirmations',
    '',
    ...d.confirmations.map((c) => `- [${c.ok ? 'x' : ' '}] ${c.label}${c.detail ? ` (${c.detail})` : ''}`),
    '',
  ];
  return lines.join('\n');
}

const markdown = buildMarkdown(dump);
writeFileSync(JSON_OUT, JSON.stringify(dump, null, 2), 'utf8');
writeFileSync(MD_OUT, markdown, 'utf8');

console.log(JSON.stringify({ ok: dump.allConfirmationsOk, json: JSON_OUT, markdown: MD_OUT }, null, 2));
console.error(`\nMarkdown preview written to ${MD_OUT}\n`);
if (!dump.allConfirmationsOk) process.exit(1);
