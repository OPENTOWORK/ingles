import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

const buildAuthClient = () => createClient(supabaseUrl, supabaseAnonKey);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase para validar sesión.' },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authClient = buildAuthClient();
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const to = String(body?.to || '').trim().toLowerCase();
    const customMessage = String(body?.message || '').trim();

    if (!isValidEmail(to)) {
      return NextResponse.json({ error: 'El email del destinatario no es válido.' }, { status: 400 });
    }

    const senderName =
      authData.user.user_metadata?.name ||
      authData.user.email?.split('@')[0] ||
      'Un amigo';
    const senderEmail = authData.user.email?.trim() || undefined;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      'https://dralo.es';

    const adminClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : null;

    const result = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FRIEND_INVITED,
      to,
      replyTo: senderEmail,
      variables: {
        sender_name: senderName,
        app_url: appUrl.replace(/\/$/, ''),
        invite_message: customMessage ? `Mensaje personal: ${customMessage}` : '',
      },
    });

    if (!result.sent && !result.queued) {
      return NextResponse.json(
        { error: result.error || 'No se pudo enviar la invitación.' },
        { status: 500 },
      );
    }

    const channel = result.results?.[0]?.channel;
    return NextResponse.json({
      success: true,
      channel,
      sandbox:
        channel === 'resend-sandbox'
          ? 'El correo se envió a la bandeja de prueba del servidor, no al destinatario real.'
          : undefined,
    });
  } catch (err) {
    console.error('Error sending invite email:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
