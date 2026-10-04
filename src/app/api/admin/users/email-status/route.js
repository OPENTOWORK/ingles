import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

const PER_PAGE = 200;
const MAX_PAGES = 20;

function shortSendError(message) {
  const text = String(message || '');
  if (/gmail rechazó la contraseña/i.test(text)) {
    return 'El servidor no pudo enviar el correo: Gmail rechazó la contraseña de envío';
  }
  return text.replace(/\s+/g, ' ').trim().slice(0, 180) || 'Error al enviar el correo';
}

async function loadEmailSendProblems(db, triggerEvent) {
  const { data, error } = await db
    .from('soporte_correos_log')
    .select('destinatario, ok, error_msg, enviado_en')
    .eq('trigger_event', triggerEvent)
    .order('enviado_en', { ascending: true });

  if (error || !Array.isArray(data)) return [];

  const byEmail = new Map();
  for (const row of data) {
    const email = String(row.destinatario || '').trim().toLowerCase();
    if (!email) continue;
    const current = byEmail.get(email) || {
      email,
      failedAt: null,
      error: '',
      resent: false,
    };
    if (row.ok) {
      if (current.failedAt) current.resent = true;
    } else {
      current.failedAt = row.enviado_en || current.failedAt;
      current.error = shortSendError(row.error_msg);
    }
    byEmail.set(email, current);
  }

  return [...byEmail.values()]
    .filter((row) => row.failedAt)
    .sort((a, b) => String(b.failedAt).localeCompare(String(a.failedAt)));
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const emailConfirmedByUser = {};
    const authAccounts = [];
    let page = 1;

    while (page <= MAX_PAGES) {
      const { data, error } = await auth.db.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const users = data?.users || [];
      for (const user of users) {
        if (!user?.id) continue;
        const confirmed = Boolean(user.email_confirmed_at);
        emailConfirmedByUser[user.id] = confirmed;
        authAccounts.push({
          id: user.id,
          email: user.email || '',
          createdAt: user.created_at || null,
          confirmed,
        });
      }

      if (users.length < PER_PAGE) break;
      page += 1;
    }

    const [accessCodeProblems, passwordResetProblems] = await Promise.all([
      loadEmailSendProblems(auth.db, 'user_email_confirmation'),
      loadEmailSendProblems(auth.db, 'password_reset_requested'),
    ]);

    return NextResponse.json({
      emailConfirmedByUser,
      authAccounts,
      accessCodeProblems,
      passwordResetProblems,
    });
  } catch (err) {
    console.error('[admin/users/email-status GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
