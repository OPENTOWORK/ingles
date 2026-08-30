import { NextResponse } from 'next/server';
import { authenticateTeacherRequest } from '@/lib/teacherAccess';
import { isValidEmail, sendBulkTransactionalEmail } from '@/lib/sendTransactionalEmail';
import { buildBrandedManualMessageEmail } from '@/lib/emailBrandedLayout';

export async function POST(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const rawTo = Array.isArray(body?.to) ? body.to : body?.to ? [body.to] : [];
    const alumnoIds = Array.isArray(body?.alumnoIds) ? body.alumnoIds : [];

    if (!subject || !message) {
      return NextResponse.json({ error: 'Asunto y mensaje son obligatorios.' }, { status: 400 });
    }

    const { db, studentIds, user } = auth;
    let emails = rawTo.map((e) => String(e).trim().toLowerCase()).filter(isValidEmail);

    if (alumnoIds.length) {
      const allowed = alumnoIds.filter((id) => studentIds.includes(id));
      if (allowed.length) {
        const { data } = await db
          .from('Usuarios_y_Perfil_users')
          .select('email')
          .in('id', allowed);
        emails = [...new Set([...emails, ...(data || []).map((r) => r.email).filter(isValidEmail)])];
      }
    }

    if (!emails.length) {
      return NextResponse.json({ error: 'No hay destinatarios válidos entre tus alumnos.' }, { status: 400 });
    }

    const senderName =
      user.user_metadata?.name || user.email?.split('@')[0] || 'Tu profesor Dralo';

    const { text } = buildBrandedManualMessageEmail({
      message,
      subject,
      senderName,
    });
    const { sent, failed, errors } = await sendBulkTransactionalEmail({
      recipients: emails,
      subject,
      text,
      branded: true,
      preheader: message.slice(0, 140),
    });

    if (sent === 0) {
      return NextResponse.json(
        { error: errors[0]?.error || 'No se pudo enviar ningún correo.', sent: 0, errors },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, sent, failed, errors: errors.length ? errors : undefined });
  } catch (err) {
    console.error('[teacher/send-mail]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
