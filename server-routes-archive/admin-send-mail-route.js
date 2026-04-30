/**
 * Copia de referencia de `src/app/api/admin/send-mail/route.js`.
 * Las rutas API no se incluyen en `output: 'export'`. Para usar el envío
 * de correos desde el panel admin, despliega este handler en Node/Vercel
 * o define NEXT_PUBLIC_ADMIN_SEND_MAIL_URL apuntando a ese endpoint.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'direccion@opentowork.com';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const isAdminUser = async (user) => {
  if (!user?.id) return false;
  if ((user.email || '').toLowerCase() === ADMIN_EMAIL) return true;

  const { data: userRow, error: userError } = await supabase
    .from('Usuarios_y_Perfil_users')
    .select('rol_id')
    .eq('id', user.id)
    .single();

  if (userError || !userRow?.rol_id) return false;

  const { data: roleRow, error: roleError } = await supabase
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', userRow.rol_id)
    .single();

  if (roleError || !roleRow?.nombre) return false;
  const role = roleRow.nombre.toLowerCase();
  return role === 'admin' || role === 'administrador';
};

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canSend = await isAdminUser(authData.user);
    if (!canSend) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { to, subject, message } = body;

    if (!Array.isArray(to) || to.length === 0 || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    const emails = [...new Set(to.map((email) => String(email).trim().toLowerCase()))]
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid recipient emails provided' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: emails,
      subject: String(subject).trim(),
      text: String(message).trim(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error('Error in admin send-mail route:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
