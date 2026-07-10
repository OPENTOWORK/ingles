/**
 * Verify B2 Exam 1 Speaking Part 16 content in Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/verify-b2-speaking-exam1-part16.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_PREGUNTA_ID = '40aabf02-cae3-4471-908d-5c87b44ee886';
const PART17_PREGUNTA_ID = '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded';

const env = loadEnvLocal();
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('nombre_parte', 'Parte 16 B2')
  .single();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte.id)
  .maybeSingle();

const { data: parte17 } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 17 B2')
  .single();

const { data: pregunta17 } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte17?.id)
  .maybeSingle();

const descripcion = String(parte?.['Descripción'] ?? parte?.Descripción ?? '');
const enunciado = String(pregunta?.enunciado || '');
const enunciado17 = String(pregunta17?.enunciado || '');

const report = {
  parteId: parte?.id,
  preguntaId: pregunta?.id,
  descripcionParte: descripcion,
  enunciado,
  part17PreguntaId: pregunta17?.id,
  part17EnunciadoPreview: enunciado17.slice(0, 220),
  checks: [
    { name: 'Expected preguntaId', ok: pregunta?.id === EXPECTED_PREGUNTA_ID },
    { name: 'Negotiation in description', ok: /negotiation/i.test(descripcion) },
    { name: 'Central question present', ok: /Central question/i.test(enunciado) },
    {
      name: 'Debatable central question',
      ok: /without creating new problems for residents/i.test(enunciado),
    },
    { name: 'Five bullet prompts', ok: (enunciado.match(/^• /gm) || []).length === 5 },
    {
      name: 'Smart traffic prompt',
      ok: /smart traffic systems to reduce congestion and pollution/i.test(enunciado),
    },
    {
      name: 'Decision question',
      ok: /Which two ideas would have the biggest positive impact/i.test(enunciado),
    },
    {
      name: 'Part 17 still connects (technology + Part 3 bridge)',
      ok:
        pregunta17?.id === PART17_PREGUNTA_ID &&
        /technology and city life/i.test(enunciado17) &&
        /In Part 3, you talked about different ways cities could use technology/i.test(enunciado17),
    },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'generated',
  'verify-b2-speaking-exam1-part16-result.json',
);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
