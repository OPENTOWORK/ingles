'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import {
  formatActiveDuration,
  formatTicketDateTime,
  formatTicketNumber,
} from '@/lib/supportTicketParse';
import {
  DEFAULT_TICKET_TOPIC,
  FAQ_TOPICS,
  TICKET_STATUS_LABELS_EN,
} from '@/utils/contactModuleConfig';
import PageHero from '@/components/PageHero';
import InternalMessagesSection from '@/components/contact/InternalMessagesSection';

export default function ContactPage() {
  const [session, setSession] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    topic: DEFAULT_TICKET_TOPIC,
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession || null);

      if (currentSession?.user) {
        setTicketForm((prev) => ({
          ...prev,
          name: currentSession.user.user_metadata?.name || prev.name,
          email: currentSession.user.email || prev.email,
        }));
      }

      await loadMyTickets(currentSession?.user?.id);
      setPageLoading(false);
    };

    init();
  }, []);

  const loadMyTickets = async (userId) => {
    if (!userId) {
      setMyTickets([]);
      return;
    }

    const { data, error } = await supabase
      .from('contacto_soporte')
      .select('id, asunto, estado, creado_en, cerrado_en, ultimo_mensaje_en')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(20);

    if (!error) {
      setMyTickets(data || []);
    }
  };

  const handleTicketChange = (e) => {
    setTicketForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketLoading(true);

    if (!session?.user?.id) {
      setTicketLoading(false);
      toast.error('Please sign in to open a support ticket.');
      return;
    }

    const accessToken = session.access_token;
    if (!accessToken) {
      setTicketLoading(false);
      toast.error('Your session has expired. Please sign in again.');
      return;
    }

    const res = await fetch('/api/contact/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(ticketForm),
    });

    const data = await res.json().catch(() => ({}));
    setTicketLoading(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not create the support ticket.');
      return;
    }

    if (!data.emailSent) {
      toast.success('Ticket saved on the platform.');
      toast.error(
        (t) => (
          <span>
            {data.emailWarning || 'Email was not sent to draloenglish@gmail.com.'}{' '}
            <a href="/contacto/configurar-correo" style={{ color: '#fff', textDecoration: 'underline' }}>
              Configure email
            </a>
          </span>
        ),
        { duration: 12000 },
      );
    } else if (data.ackEmailSent) {
      toast.success(
        'We have sent you a confirmation email. We will reply within 48 hours at most.',
        { duration: 6000 },
      );
    } else {
      toast.success('Your ticket has been submitted successfully.');
    }
    setTicketForm((prev) => ({
      ...prev,
      subject: '',
      message: '',
    }));
    await loadMyTickets(session?.user?.id);
  };

  if (pageLoading) {
    return (
      <main className="shell contacto-page center">
        <div className="loader" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className="shell contacto-page">
      <PageHero
        eyebrow="Support & messaging"
        title="Contact"
        description="Get in touch with support, send internal messages, or open a ticket — we're here to help with questions, issues, and platform guidance."
        mascotVariant={8}
        mascotWidth={140}
        accent="rose"
        stats={[
          { value: '24/7', label: 'Ticket system' },
          { value: 'FAQ', label: 'Self-service' },
        ]}
      />

      <InternalMessagesSection session={session} />

      <section id="support-ticket-form" className="contact-section">
        <h2>Support</h2>
        <p>
          Help desk and issue tracking so you can follow up on questions or problems reported
          within the platform.
        </p>

        <form onSubmit={handleTicketSubmit} className="contact-form">
          <div className="two-cols">
            <div className="form-group">
              <label>Name</label>
              <input className="form-input" name="name" value={ticketForm.name} onChange={handleTicketChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" name="email" value={ticketForm.email} onChange={handleTicketChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Topic</label>
            <select className="form-input" name="topic" value={ticketForm.topic} onChange={handleTicketChange}>
              {FAQ_TOPICS.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input className="form-input" name="subject" value={ticketForm.subject} onChange={handleTicketChange} placeholder="Subject" required />
          </div>
          <div className="form-group">
            <textarea className="form-textarea" name="message" value={ticketForm.message} onChange={handleTicketChange} placeholder="Describe your question or issue" rows={5} required />
          </div>
          <button type="submit" className="submit-btn" disabled={ticketLoading}>
            {ticketLoading ? 'Sending…' : 'Open support ticket'}
          </button>
        </form>

        {session?.user?.id && (
          <div className="tickets-table-wrap">
            <h3>My tickets</h3>
            <table className="tickets-table">
              <thead>
                <tr>
                  <th className="tickets-table__col-id">Ticket #</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Time open</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No tickets yet.</td>
                  </tr>
                ) : (
                  myTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="tickets-table__col-id">
                        <span className="tickets-table__ticket-ref" title={ticket.id}>
                          {formatTicketNumber(ticket.id)}
                        </span>
                      </td>
                      <td>{ticket.asunto}</td>
                      <td>{TICKET_STATUS_LABELS_EN[ticket.estado] || ticket.estado}</td>
                      <td>{formatActiveDuration(ticket.creado_en, ticket.cerrado_en)}</td>
                      <td>{formatTicketDateTime(ticket.creado_en, 'en-GB')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="contact-faq-entry" aria-labelledby="contact-faq-entry-title">
        <div className="contact-faq-entry__copy">
          <h2 id="contact-faq-entry-title">FAQ</h2>
          <p>
            Browse common questions about accounts, exams, billing, and technical issues before
            opening a ticket.
          </p>
        </div>
        <Link href="/contacto/faq" className="contact-faq-entry__btn">
          View FAQ
          <span aria-hidden>→</span>
        </Link>
      </section>

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .contacto-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666}
      .header--mascot{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-bottom:8px}
      .header__copy{flex:1 1 240px;min-width:0}
      .header__mascot{flex:0 0 auto;line-height:0;filter:drop-shadow(0 8px 18px rgba(0,0,0,.12))}
      h2{margin:0 0 8px}
      h3{margin:0 0 12px}
      .contact-section{margin:22px 0;padding:24px;border:1px solid #eaeaea;border-radius:16px;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,0.1)}
      .contact-form{display:flex;flex-direction:column;gap:20px}
      .two-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .inline-list{margin:8px 0 0 18px;padding:0;display:grid;gap:6px}
      .form-group{display:flex;flex-direction:column}
      .form-group label{font-size:14px;color:#444;margin-bottom:6px}
      .form-input,.form-textarea{padding:12px 16px;font-size:16px;border:1px solid #eaeaea;border-radius:12px;background:white;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s}
      .form-input:focus,.form-textarea:focus{border-color:#0070f3;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .form-textarea{resize:vertical;min-height:120px;font-family:inherit}
      .tickets-table-wrap{margin-top:18px}
      .tickets-table{width:100%;border-collapse:collapse}
      .tickets-table th,.tickets-table td{border:1px solid #eaeaea;padding:10px;text-align:left;font-size:14px;vertical-align:middle}
      .tickets-table th{background:#fafafa;font-weight:600}
      .tickets-table__col-id{width:1%;white-space:nowrap}
      .tickets-table__ticket-ref{display:inline-block;padding:4px 10px;border-radius:8px;background:#f1f5f9;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;font-weight:600;letter-spacing:0.04em;color:#334155}
      .contact-faq-entry{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px 24px;margin:22px 0;padding:22px 24px;border:1px solid #dbeafe;border-radius:16px;background:linear-gradient(135deg,#eff6ff 0%,#fff 55%,#f8fafc 100%);box-shadow:0 4px 18px rgba(37,99,235,.08)}
      .contact-faq-entry__copy{flex:1 1 240px;min-width:0}
      .contact-faq-entry h2{margin:0 0 6px;font-size:1.25rem}
      .contact-faq-entry p{margin:0;color:#64748b;font-size:0.92rem;line-height:1.5;max-width:36rem}
      .contact-faq-entry__btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#2563eb;color:#fff;font-size:0.95rem;font-weight:700;text-decoration:none;box-shadow:0 10px 24px rgba(37,99,235,.28);transition:transform .2s,box-shadow .2s}
      .contact-faq-entry__btn:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(37,99,235,.35)}
      .submit-btn{padding:14px 20px;background:#0070f3;color:white;font-weight:600;border:none;border-radius:12px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 10px 24px rgba(0,112,243,.35)}
      .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,112,243,.4)}
      .submit-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @media (max-width: 768px){.two-cols{grid-template-columns:1fr}}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
