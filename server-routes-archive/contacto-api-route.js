/**
 * Copia de referencia de `src/app/contacto/api/route.js`.
 * No compatible con export estático; usa Supabase desde el cliente o un backend.
 */
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import ContactEmail from '@/components/contactemail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'carlos.garcia.cano87@gmail.com',
      subject: `New message from ${name}`,
      react: ContactEmail({ name, email, message }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
