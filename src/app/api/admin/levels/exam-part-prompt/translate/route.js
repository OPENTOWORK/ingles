import { NextResponse } from 'next/server';
import { requireExamPartPromptAccessFromRequest } from '@/lib/adminApiAuth';
import {
  getDraloFastModel,
  isDraloOpenAIConfigured,
  realLifeChatCompletion,
} from '@/lib/draloAiEngine';

export const dynamic = 'force-dynamic';

const MAX_CHARS = 24000;

function parseJsonLoose(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req) {
  const auth = await requireExamPartPromptAccessFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY no está configurada en el servidor.' },
      { status: 503 },
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const targetLang = String(body.targetLang || body.lang || '').toLowerCase() === 'es' ? 'es' : 'en';
  const targetName = targetLang === 'es' ? 'Spanish' : 'English';
  const html = String(body.html ?? body.text ?? '');
  const trimmed = html.trim();

  if (!trimmed) {
    return NextResponse.json({ error: 'El prompt está vacío.' }, { status: 400 });
  }
  if (trimmed.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `El prompt es demasiado largo (máx. ${MAX_CHARS} caracteres).` },
      { status: 400 },
    );
  }

  const hasHtml = /<[a-z][\s\S]*>/i.test(trimmed);

  try {
    const { text } = await realLifeChatCompletion({
      system: `You translate exam-generation prompts for editors.
Return ONLY valid JSON: {"html":"..."}.
Target language: ${targetName}.
Rules:
- Translate all human-readable text to ${targetName}.
- Keep technical tokens unchanged when they are schema/API literals: JSON field names, gap markers like (0) ___, (17) ___ (STEM), option letters A–D, question number ranges, and placeholders like {variety}, {SHARED_JSON_RULES}, {directions}.
- ${
        hasHtml
          ? 'The input is HTML. Preserve EVERY HTML tag and attribute exactly (especially style/color spans). Translate only visible text nodes.'
          : 'The input is plain text. Preserve line breaks and structure.'
      }
- Do not wrap the result in markdown fences.
- Do not add commentary.`,
      messages: [
        {
          role: 'user',
          content: `Translate this prompt to ${targetName}. Return JSON with key "html".\n\n${trimmed}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
      model: getDraloFastModel(),
    });

    const parsed = parseJsonLoose(text);
    const translated = String(parsed?.html ?? parsed?.text ?? parsed?.content ?? '').trim();
    if (!translated) {
      return NextResponse.json({ error: 'La traducción no devolvió contenido.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, html: translated, targetLang });
  } catch (err) {
    console.error('[admin/levels/exam-part-prompt/translate]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudo traducir el prompt.' },
      { status: 500 },
    );
  }
}
