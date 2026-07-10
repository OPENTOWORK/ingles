/**
 * Verify B2 Exam 1 Speaking Part 17 content in Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/verify-b2-speaking-exam1-part17.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_PREGUNTA_ID = '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded';

const env = loadEnvLocal();
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('nombre_parte', 'Parte 17 B2')
  .single();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte.id)
  .maybeSingle();

const descripcion = String(parte?.['Descripción'] ?? parte?.Descripción ?? '');
const enunciado = String(pregunta?.enunciado || '');

const report = {
  preguntaId: pregunta?.id,
  descripcionParte: descripcion,
  enunciado,
  checks: [
    { name: 'Expected preguntaId', ok: pregunta?.id === EXPECTED_PREGUNTA_ID },
    { name: 'No image shown below', ok: !/image shown below/i.test(descripcion + enunciado) },
    { name: 'Part 3 topic in description', ok: /topic from Part 3/i.test(descripcion) },
    { name: 'Technology and city life in enunciado', ok: /technology and city life/i.test(enunciado) },
    { name: 'Part 3 bridge in enunciado', ok: /In Part 3, you talked about different ways cities could use technology/i.test(enunciado) },
    { name: 'Six numbered questions', ok: (enunciado.match(/^\d+\./gm) || []).length === 6 },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'generated',
  'verify-b2-speaking-exam1-part17-result.json',
);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
