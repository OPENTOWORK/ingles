import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const buildAuthClient = () => createClient(supabaseUrl, supabaseAnonKey);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function POST(req) {
  try {
    const authClient = buildAuthClient();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase para validar sesión.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!process.env.RESEND_API_KEY?.trim()) {
      return NextResponse.json(
        { error: 'No hay configuración de RESEND_API_KEY para enviar invitaciones.' },
        { status: 500 }
      );
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
      'Tu amigo';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
    const text = [
      `Hola,`,
      '',
      `${senderName} te ha invitado a practicar inglés en English Practice.`,
      customMessage ? `Mensaje personal: ${customMessage}` : '',
      appUrl ? `Únete aquí: ${appUrl}` : '',
    ].filter(Boolean).join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: `${senderName} te invita a English Practice`,
      text,
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error sending invite email:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
