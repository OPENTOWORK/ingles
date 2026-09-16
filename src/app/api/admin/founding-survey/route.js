import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import {
  getFoundingSurveyCampaignStatus,
  runFoundingSurveyCampaign,
} from '@/lib/foundingSurveyServer';
import {
  resolveAdminTestRecipients,
  sendFoundingSurveyTestEmail,
} from '@/lib/foundingSurveyTestEmail';

/** Estado de la campaña de la encuesta founding. */
export async function GET(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const [estado, destinatariosPrueba] = await Promise.all([
      getFoundingSurveyCampaignStatus(auth.db),
      resolveAdminTestRecipients(auth.db),
    ]);

    return NextResponse.json({ ...estado, destinatariosPrueba });
  } catch (err) {
    console.error('api/admin/founding-survey GET:', err);
    return NextResponse.json({ error: 'No se pudo cargar la campaña.' }, { status: 500 });
  }
}

/**
 * `accion: 'prueba'`   → manda el correo real de la encuesta al equipo.
 * `accion: 'ejecutar'` → fuerza la pasada diaria sin esperar al cron.
 */
export async function POST(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const accion = String(body?.accion || 'prueba');

  try {
    if (accion === 'ejecutar') {
      const result = await runFoundingSurveyCampaign(auth.db);
      return NextResponse.json(result, { status: result.ok ? 200 : 500 });
    }

    const to = Array.isArray(body?.to) ? body.to : null;
    const result = await sendFoundingSurveyTestEmail(auth.db, { to });

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    console.error('api/admin/founding-survey POST:', err);
    return NextResponse.json({ error: 'No se pudo completar la acción.' }, { status: 500 });
  }
}
