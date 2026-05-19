import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legalDir = path.join(__dirname, '..', 'src', 'data', 'legal');

// Inline minimal parser (same rules as parseLegalContent.js)
function stripPreamble(raw) {
  const markers = [
    'POLÍTICA DE PRIVACIDAD',
    'POLITICA DE PRIVACIDAD',
    'POLÍTICA DE COOKIES',
    'POLITICA DE COOKIES',
    'POLÍTICA DE REEMBOLSOS',
    'TÉRMINOS Y CONDICIONES',
    'AVISO LEGAL',
    'NORMAS DE COMUNIDAD',
    'TEXTOS CORTOS',
  ];
  let text = raw.trim();
  for (const m of markers) {
    const i = text.indexOf(m);
    if (i >= 0) return text.slice(i);
  }
  return text;
}

function parseSections(text) {
  const body = stripPreamble(text);
  const updatedMatch = body.match(/Última actualización:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const updatedAt = updatedMatch ? updatedMatch[1] : null;
  const sectionRegex = /(\d+)\.\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g;
  const matches = [...body.matchAll(sectionRegex)];
  if (!matches.length) return { updatedAt, intro: body, sections: [] };

  const intro = body.slice(0, matches[0].index).trim();
  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = matches[i + 1]?.index ?? body.length;
    const chunk = body.slice(start, end).trim();
    const headerMatch = chunk.match(/^(\d+)\.\s+(.+?)(?=[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ])/s);
    const num = Number(matches[i][1]);
    const heading = headerMatch ? headerMatch[2].trim() : `Sección ${num}`;
    const sectionBody = headerMatch
      ? chunk.slice(headerMatch[0].length).trim()
      : chunk.replace(/^\d+\.\s+/, '').trim();
    sections.push({ number: num, title: `${num}. ${heading}`, body: sectionBody });
  }
  return { updatedAt, intro, sections };
}

const DOCS = [
  { slug: 'politica-privacidad', titulo: 'Política de privacidad', categoria: 'privacidad', orden: 1, file: 'politica-privacidad-dralo.json' },
  { slug: 'politica-cookies', titulo: 'Política de cookies', categoria: 'privacidad', orden: 2, file: 'politica-cookies.json' },
  { slug: 'terminos-condiciones', titulo: 'Términos y condiciones de uso', categoria: 'legal', orden: 3, file: 'terminos-y-condiciones-de-uso.json' },
  { slug: 'proteccion-datos', titulo: 'Protección de datos', categoria: 'privacidad', orden: 4, file: 'politica-privacidad-dralo.json', sectionFilter: [11, 12, 13, 14, 15, 16, 17] },
  { slug: 'aviso-legal', titulo: 'Aviso legal', categoria: 'legal', orden: 5, file: 'aviso-legal-dralo.json' },
  { slug: 'normas-comunidad', titulo: 'Normas de comunidad', categoria: 'comunidad', orden: 6, file: 'normas-de-comunidad.json' },
  { slug: 'politica-reembolsos', titulo: 'Política de reembolsos', categoria: 'comercial', orden: 7, file: 'politica-de-reembolsos.json' },
];

const rows = [];

for (const doc of DOCS) {
  const json = JSON.parse(fs.readFileSync(path.join(legalDir, doc.file), 'utf8'));
  let { updatedAt, intro, sections } = parseSections(json.content);
  if (doc.sectionFilter) {
    sections = sections.filter((s) => doc.sectionFilter.includes(s.number));
    intro =
      'En Dralo tratamos tus datos personales conforme al RGPD y la normativa española aplicable.';
  }
  rows.push({
    slug: doc.slug,
    titulo: doc.titulo,
    categoria: doc.categoria,
    orden: doc.orden,
    actualizado: updatedAt,
    intro,
    secciones: sections,
  });
}

function sqlEscape(str) {
  return String(str).replace(/'/g, "''");
}

let sql = `-- Tabla de políticas legales DRALO (generado desde Word en politicas RPD/)
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.politicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'legal',
  orden INT NOT NULL DEFAULT 0,
  actualizado TEXT,
  intro TEXT,
  secciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  publicado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.politicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS politicas_public_read ON public.politicas;
CREATE POLICY politicas_public_read ON public.politicas
  FOR SELECT USING (publicado = true);

DROP POLICY IF EXISTS politicas_service_all ON public.politicas;
CREATE POLICY politicas_service_all ON public.politicas
  FOR ALL TO service_role USING (true) WITH CHECK (true);

`;

for (const row of rows) {
  const seccionesJson = sqlEscape(JSON.stringify(row.secciones));
  sql += `
INSERT INTO public.politicas (slug, titulo, categoria, orden, actualizado, intro, secciones)
VALUES (
  '${sqlEscape(row.slug)}',
  '${sqlEscape(row.titulo)}',
  '${sqlEscape(row.categoria)}',
  ${row.orden},
  ${row.actualizado ? `'${sqlEscape(row.actualizado)}'` : 'NULL'},
  '${sqlEscape(row.intro)}',
  '${seccionesJson}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  categoria = EXCLUDED.categoria,
  orden = EXCLUDED.orden,
  actualizado = EXCLUDED.actualizado,
  intro = EXCLUDED.intro,
  secciones = EXCLUDED.secciones,
  updated_at = now();
`;
}

sql += '\nNOTIFY pgrst, \'reload schema\';\n';

const outPath = path.join(__dirname, 'politicas_tables.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Wrote', outPath, 'with', rows.length, 'documents');
