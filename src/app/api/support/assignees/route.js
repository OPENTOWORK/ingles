import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';
import { listSupportAssignees } from '@/lib/supportAssignees';

export async function GET(req) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const assignees = await listSupportAssignees(auth.db);
    return NextResponse.json({ assignees });
  } catch (error) {
    console.error('[support/assignees GET]', error);
    return NextResponse.json({ error: 'No se pudo cargar el equipo de soporte.' }, { status: 500 });
  }
}
