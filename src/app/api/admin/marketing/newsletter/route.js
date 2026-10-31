import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';

const STATUS_LABEL = {
  pending: 'Pendiente',
  active: 'Apuntado',
  unsubscribed: 'Baja',
};

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.db
      .from('newsletter_suscriptores')
      .select('id, email, status, created_at, confirmed_at, unsubscribed_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      const missing = error.code === '42P01' || /newsletter_suscriptores/i.test(error.message || '');
      if (missing) {
        return NextResponse.json(
          { error: 'Falta crear la tabla de la newsletter en la base de datos.' },
          { status: 503 },
        );
      }
      throw error;
    }

    const subscribers = (data || [])
      .map((row) => ({
        id: row.id,
        email: String(row.email || '').trim(),
        status: STATUS_LABEL[row.status] ? row.status : 'pending',
        statusLabel: STATUS_LABEL[row.status] || 'Pendiente',
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        unsubscribedAt: row.unsubscribed_at,
        updatedAt: row.updated_at,
      }))
      .filter((row) => row.email);

    return NextResponse.json({ subscribers });
  } catch (err) {
    console.error('[api/admin/marketing/newsletter] GET', err);
    return NextResponse.json(
      { error: err.message || 'No se pudo cargar la newsletter.' },
      { status: 500 },
    );
  }
}
