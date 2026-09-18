import { NextResponse } from 'next/server';
import { ingestMarketingEvent } from '@/lib/marketing/crm/eventsServer';
import { authenticateMarketingIngestRequest } from '@/lib/marketing/crm/ingestAuth';
import {
  getClientIpFromRequest,
  tryConsumeMarketingIngestRate,
} from '@/lib/marketing/crm/rateLimit';
import { validateMarketingEventPayload } from '@/lib/marketing/crm/validation';

export async function POST(req) {
  try {
    const auth = await authenticateMarketingIngestRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    if (auth.mode === 'ingest_key') {
      const ip = getClientIpFromRequest(req);
      if (!tryConsumeMarketingIngestRate(ip, 'marketing:events')) {
        return NextResponse.json(
          { success: false, error: 'Demasiadas solicitudes. Prueba más tarde.' },
          { status: 429 },
        );
      }
    }

    const body = await req.json().catch(() => null);
    const validated = validateMarketingEventPayload(body);
    if (!validated.ok) {
      return NextResponse.json(
        { success: false, error: validated.error },
        { status: validated.status || 400 },
      );
    }

    const result = await ingestMarketingEvent(validated.data, { db: auth.db });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/marketing/events] POST', err);
    return NextResponse.json(
      { success: false, error: 'No se pudo registrar el evento.' },
      { status: 500 },
    );
  }
}
