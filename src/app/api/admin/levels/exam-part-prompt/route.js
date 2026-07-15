import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  getExamPartPromptForAdmin,
  resetExamPartPromptForAdmin,
  saveExamPartPromptForAdmin,
} from '@/lib/examPartGenerationPrompt';
import { isExamGenerationSlug } from '@/lib/levelsExamCatalog';

export const dynamic = 'force-dynamic';

function parsePartNumber(value) {
  const part = Number(value);
  return Number.isFinite(part) && part > 0 ? part : null;
}

export async function GET(req) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get('slug') || 'b2').toLowerCase();
  const partNumber = parsePartNumber(searchParams.get('partNumber'));
  const examSlot = Number(searchParams.get('slot') || searchParams.get('examSlot') || 1) || 1;

  if (!partNumber) {
    return NextResponse.json({ error: 'partNumber es obligatorio.' }, { status: 400 });
  }
  if (slug !== 'a2' && !isExamGenerationSlug(slug)) {
    return NextResponse.json({ error: 'Nivel no soportado.' }, { status: 400 });
  }

  try {
    const prompt = await getExamPartPromptForAdmin(
      auth.adminDb,
      {
        levelSlug: slug,
        partNumber,
        examSlot,
      },
      auth.user.id,
    );
    return NextResponse.json({ ok: true, prompt });
  } catch (err) {
    console.error('[admin/levels/exam-part-prompt GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const slug = String(body.slug || body.level || 'b2').toLowerCase();
  const partNumber = parsePartNumber(body.partNumber ?? body.part);
  const examSlot = Number(body.slot ?? body.examSlot ?? 1) || 1;

  if (!partNumber) {
    return NextResponse.json({ error: 'partNumber es obligatorio.' }, { status: 400 });
  }

  try {
    const prompt = await saveExamPartPromptForAdmin(
      auth.adminDb,
      {
        levelSlug: slug,
        partNumber,
        examSlot,
        topic: body.topic,
        varietySeed: body.varietySeed,
        systemPrompt: body.systemPrompt,
        userPrompt: body.userPrompt,
      },
      auth.user.id,
    );
    return NextResponse.json({ ok: true, prompt });
  } catch (err) {
    console.error('[admin/levels/exam-part-prompt PUT]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const slug = String(body.slug || body.level || 'b2').toLowerCase();
  const partNumber = parsePartNumber(body.partNumber ?? body.part);
  const examSlot = Number(body.slot ?? body.examSlot ?? 1) || 1;

  if (!partNumber) {
    return NextResponse.json({ error: 'partNumber es obligatorio.' }, { status: 400 });
  }

  try {
    const prompt = await resetExamPartPromptForAdmin(
      auth.adminDb,
      {
        levelSlug: slug,
        partNumber,
        examSlot,
      },
      auth.user.id,
    );
    return NextResponse.json({ ok: true, prompt });
  } catch (err) {
    console.error('[admin/levels/exam-part-prompt DELETE]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
