/**
 * READ-ONLY verification of B2 Examen 1 Writing content in production Supabase.
 * No writes. Usage: node scripts/verify-writing-exam1-readonly.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { parseB2WritingPart2Task } from '../src/data/b2WritingTasks.js';

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
// Mismo fallback público (anon) que scripts/push-writing-exam1.mjs — clave pública del cliente.
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const db = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';

async function getEnunciado(partNumber) {
  const { data: parte } = await db
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  const { data: preguntas } = await db
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id);
  return preguntas?.[0] || {};
}

const p1 = await getEnunciado(8);
const p2 = await getEnunciado(9);
const e1 = p1.enunciado || '';
const e2 = p2.enunciado || '';

const parsedPart2 = parseB2WritingPart2Task(e2);
const options = parsedPart2.fromDefault ? [] : parsedPart2.options || [];

const checks = [
  ['P1 practical life skills topic', e1.includes('practical life skills, such as cooking or managing money')],
  ['P1 word limit 140-190', e1.includes('140–190 words')],
  ['P2 article (Switch off and relax!)', e2.includes('Switch off and relax!')],
  ['P2 email (friend Alex)', e2.includes('English-speaking friend Alex')],
  ['P2 report (study areas)', e2.includes('improve the study areas')],
  ['P2 no review task', !/Write your review\./.test(e2)],
  ['Parser returns exactly 3 options', options.length === 3],
  ['Option 1 = article', /article/i.test(options[0]?.title || options[0]?.format || JSON.stringify(options[0]) || '')],
];

console.log(`preguntaId Part 1: ${p1.id}`);
console.log(`preguntaId Part 2: ${p2.id}`);
console.log(`Parser options: ${options.length}`);
options.forEach((o, i) => console.log(`  ${i + 1}. ${(o.title || o.format || '').toString().slice(0, 60)}`));

let allOk = true;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) allOk = false;
}
console.log(allOk ? '\nALL CONTENT CHECKS PASSED (read-only)' : '\nSOME CHECKS FAILED');
process.exit(allOk ? 0 : 1);
