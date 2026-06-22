import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import { AUTOMATED_EMAIL_TRIGGER_OPTIONS } from '@/lib/automatedEmailTriggers';
import { syncAutomatedEmailSystemTemplates } from '@/lib/syncAutomatedEmailSystemTemplates';

const TABLE = 'soporte_correos_automaticos';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function isMissingTableError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    trigger_event: row.trigger_event,
    trigger_reason: row.trigger_reason || '',
    asunto: row.asunto,
    cuerpo: row.cuerpo,
    activo: row.activo !== false,
    delay_minutos: Number(row.delay_minutos) || 0,
    es_sistema: Boolean(row.es_sistema),
    creado_en: row.creado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function GET(req) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.db.from(TABLE).select('*').order('nombre', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({
        templates: DEFAULT_AUTOMATED_EMAIL_TEMPLATES.map((t, i) => ({
          ...t,
          id: `default-${i}`,
          creado_en: null,
          actualizado_en: null,
        })),
        triggers: AUTOMATED_EMAIL_TRIGGER_OPTIONS,
        usingDefaults: true,
        setupHint: 'Ejecuta scripts/soporte_correos_automaticos.sql en Supabase para persistir plantillas.',
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await syncAutomatedEmailSystemTemplates(auth.db);
  } catch (syncErr) {
    console.error('[automated-emails] sync system templates', syncErr);
  }

  const { data: refreshed, error: reloadError } = await auth.db
    .from(TABLE)
    .select('*')
    .order('nombre', { ascending: true });

  if (reloadError) {
    return NextResponse.json({ error: reloadError.message }, { status: 500 });
  }

  return NextResponse.json({
    templates: (refreshed || data || []).map(mapRow),
    triggers: AUTOMATED_EMAIL_TRIGGER_OPTIONS,
    usingDefaults: false,
  });
}

export async function POST(req) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const nombre = String(body?.nombre || '').trim();
  const trigger_event = String(body?.trigger_event || '').trim();
  const trigger_reason = String(body?.trigger_reason || '').trim();
  const asunto = String(body?.asunto || '').trim();
  const cuerpo = String(body?.cuerpo || '').trim();
  const slug = slugify(body?.slug || nombre);
  const activo = body?.activo !== false;
  const delay_minutos = Math.max(0, Number(body?.delay_minutos) || 0);

  if (!nombre || !trigger_event || !asunto || !cuerpo) {
    return NextResponse.json(
      { error: 'Nombre, evento, asunto y cuerpo son obligatorios.' },
      { status: 400 },
    );
  }

  const row = {
    slug,
    nombre,
    trigger_event,
    trigger_reason,
    asunto,
    cuerpo,
    activo,
    delay_minutos,
    es_sistema: false,
    actualizado_en: new Date().toISOString(),
  };

  const { data, error } = await auth.db.from(TABLE).insert(row).select('*').single();

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        {
          error:
            'La tabla de correos automáticos no existe. Ejecuta scripts/soporte_correos_automaticos.sql en Supabase.',
        },
        { status: 503 },
      );
    }
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una plantilla con ese identificador (slug).' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: mapRow(data) });
}
