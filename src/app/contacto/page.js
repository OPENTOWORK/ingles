'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Clock3, Headphones, LifeBuoy, MessageSquareText } from 'lucide-react';
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

function ticketStatusClass(status) {
  switch (status) {
    case 'Respondido':
      return 'contact-status contact-status--answered';
    case 'Cerrado':
      return 'contact-status contact-status--closed';
    case 'Sin responder':
      return 'contact-status contact-status--pending';
    default:
      return 'contact-status contact-status--open';
  }
}

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
        description="Get in touch with our support team, track your requests, or browse the FAQ for quick answers about accounts, exams, and billing."
        mascotVariant={8}
        mascotWidth={140}
        accent="ocean"
        stats={[
          { value: '48h', label: 'Response time' },
          { value: 'FAQ', label: 'Self-service' },
        ]}
      />

      <InternalMessagesSection session={session} />

      <section id="support-ticket-form" className="contact-section contact-section--support">
        <div className="contact-section__head">
          <div className="contact-section__icon" aria-hidden>
            <Headphones size={22} strokeWidth={2} />
          </div>
          <div className="contact-section__copy">
            <h2>Support</h2>
            <p>
              Open a ticket for questions, technical issues, or account help. We reply by email and
              you can track progress here.
            </p>
          </div>
        </div>

        <div className="contact-meta">
          <span className="contact-meta__item">
            <Clock3 size={15} aria-hidden />
            Typical reply within 48 hours
          </span>
          <span className="contact-meta__item">
            <LifeBuoy size={15} aria-hidden />
            Ticket tracking included
          </span>
        </div>

        <form onSubmit={handleTicketSubmit} className="contact-form">
          <div className="two-cols">
            <div className="form-group">
              <label htmlFor="ticket-name">Name</label>
              <input
                id="ticket-name"
                className="form-input"
                name="name"
                value={ticketForm.name}
                onChange={handleTicketChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ticket-email">Email</label>
              <input
                id="ticket-email"
                className="form-input"
                type="email"
                name="email"
                value={ticketForm.email}
                onChange={handleTicketChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-topic">Topic</label>
            <select
              id="ticket-topic"
              className="form-input"
              name="topic"
              value={ticketForm.topic}
              onChange={handleTicketChange}
            >
              {FAQ_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-subject">Subject</label>
            <input
              id="ticket-subject"
              className="form-input"
              name="subject"
              value={ticketForm.subject}
              onChange={handleTicketChange}
              placeholder="Brief summary of your request"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-message">Message</label>
            <textarea
              id="ticket-message"
              className="form-textarea"
              name="message"
              value={ticketForm.message}
              onChange={handleTicketChange}
              placeholder="Describe your question or issue in as much detail as you can."
              rows={6}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={ticketLoading}>
            {ticketLoading ? 'Sending…' : 'Open support ticket'}
          </button>
        </form>

        {session?.user?.id && (
          <div className="tickets-panel">
            <div className="tickets-panel__head">
              <h3>My tickets</h3>
              <p>Track the status of your recent support requests.</p>
            </div>

            {myTickets.length === 0 ? (
              <div className="tickets-empty" role="status">
                <MessageSquareText size={28} strokeWidth={1.75} aria-hidden />
                <strong>No tickets yet</strong>
                <p>When you open a support ticket, it will appear here with its current status.</p>
              </div>
            ) : (
              <div className="tickets-table-wrap">
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
                    {myTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="tickets-table__col-id">
                          <span className="tickets-table__ticket-ref" title={ticket.id}>
                            {formatTicketNumber(ticket.id)}
                          </span>
                        </td>
                        <td className="tickets-table__subject">{ticket.asunto}</td>
                        <td>
                          <span className={ticketStatusClass(ticket.estado)}>
                            {TICKET_STATUS_LABELS_EN[ticket.estado] || ticket.estado}
                          </span>
                        </td>
                        <td className="tickets-table__muted">
                          {formatActiveDuration(ticket.creado_en, ticket.cerrado_en)}
                        </td>
                        <td className="tickets-table__muted">
                          {formatTicketDateTime(ticket.creado_en, 'en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
      .shell {
        min-height: 100svh;
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }
      .center {
        display: grid;
        place-items: center;
      }
      .contact-section {
        margin: 24px 0;
        padding: 28px;
        border: 1px solid var(--color-border-tertiary, #e2e8f0);
        border-radius: 20px;
        background: var(--card, #fff);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      }
      .contact-section--support {
        background: linear-gradient(
          180deg,
          var(--card, #ffffff) 0%,
          var(--color-background-secondary, #f8fafc) 100%
        );
      }
      .contact-section__head {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 18px;
      }
      .contact-section__icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
        color: #2563eb;
        flex-shrink: 0;
      }
      .contact-section__copy h2 {
        margin: 0 0 6px;
        font-size: 1.45rem;
        letter-spacing: -0.02em;
        color: var(--color-text-primary, #0f172a);
      }
      .contact-section__copy p {
        margin: 0;
        color: var(--color-text-secondary, #64748b);
        font-size: 0.95rem;
        line-height: 1.6;
        max-width: 52rem;
      }
      .contact-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        margin-bottom: 22px;
      }
      .contact-meta__item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--color-background-secondary, #f8fafc);
        border: 1px solid var(--color-border-tertiary, #e2e8f0);
        color: var(--color-text-secondary, #475569);
        font-size: 0.82rem;
        font-weight: 600;
      }
      .contact-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 22px;
        border-radius: 16px;
        background: var(--color-background-secondary, #fff);
        border: 1px solid var(--color-border-tertiary, #e2e8f0);
      }
      .two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-group label {
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--color-text-secondary, #64748b);
      }
      .form-input,
      .form-textarea {
        padding: 12px 14px;
        font-size: 0.95rem;
        border: 1px solid var(--color-border-tertiary, #cbd5e1);
        border-radius: 12px;
        background: var(--card, #fff);
        color: var(--text);
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-input:focus,
      .form-textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
      }
      .form-textarea {
        resize: vertical;
        min-height: 140px;
        font-family: inherit;
        line-height: 1.55;
      }
      .submit-btn {
        align-self: flex-start;
        min-width: 220px;
        padding: 13px 22px;
        background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 700;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
      }
      .submit-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.03);
        box-shadow: 0 14px 30px rgba(37, 99, 235, 0.34);
      }
      .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      .tickets-panel {
        margin-top: 24px;
        padding-top: 22px;
        border-top: 1px solid var(--color-border-tertiary, #e2e8f0);
      }
      .tickets-panel__head h3 {
        margin: 0 0 4px;
        font-size: 1.1rem;
        color: var(--color-text-primary, #0f172a);
      }
      .tickets-panel__head p {
        margin: 0 0 16px;
        color: var(--color-text-secondary, #64748b);
        font-size: 0.9rem;
      }
      .tickets-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 28px 20px;
        border-radius: 14px;
        border: 1px dashed var(--color-border-tertiary, #cbd5e1);
        background: var(--color-background-secondary, #f8fafc);
        text-align: center;
        color: var(--color-text-secondary, #64748b);
      }
      .tickets-empty strong {
        color: var(--color-text-primary, #334155);
        font-size: 0.98rem;
      }
      .tickets-empty p {
        margin: 0;
        max-width: 28rem;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .tickets-table-wrap {
        overflow-x: auto;
        border: 1px solid var(--color-border-tertiary, #e2e8f0);
        border-radius: 14px;
        background: var(--card, #fff);
      }
      .tickets-table {
        width: 100%;
        border-collapse: collapse;
      }
      .tickets-table th,
      .tickets-table td {
        padding: 12px 14px;
        text-align: left;
        font-size: 0.88rem;
        vertical-align: middle;
        border-bottom: 1px solid #f1f5f9;
      }
      .tickets-table th {
        background: var(--color-background-secondary, #f8fafc);
        color: var(--color-text-secondary, #64748b);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .tickets-table tbody tr:last-child td {
        border-bottom: none;
      }
      .tickets-table tbody tr:hover {
        background: var(--color-background-secondary, #fafbff);
      }
      .tickets-table__col-id {
        width: 1%;
        white-space: nowrap;
      }
      .tickets-table__subject {
        font-weight: 600;
        color: var(--color-text-primary, #0f172a);
      }
      .tickets-table__muted {
        color: var(--color-text-secondary, #64748b);
        white-space: nowrap;
      }
      .tickets-table__ticket-ref {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 8px;
        background: #eff6ff;
        border: 1px solid #dbeafe;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #1d4ed8;
      }
      .contact-status {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        white-space: nowrap;
      }
      .contact-status--open {
        background: #eff6ff;
        color: #1d4ed8;
      }
      .contact-status--pending {
        background: #fff7ed;
        color: #c2410c;
      }
      .contact-status--answered {
        background: #ecfdf5;
        color: #047857;
      }
      .contact-status--closed {
        background: #f1f5f9;
        color: #475569;
      }
      .contact-faq-entry {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px 24px;
        margin: 24px 0 0;
        padding: 24px 26px;
        border: 1px solid #dbeafe;
        border-radius: 18px;
        background: linear-gradient(135deg, #eff6ff 0%, #fff 55%, #f8fafc 100%);
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
      }
      .contact-faq-entry__copy {
        flex: 1 1 240px;
        min-width: 0;
      }
      .contact-faq-entry h2 {
        margin: 0 0 6px;
        font-size: 1.2rem;
        color: var(--color-text-primary, #0f172a);
      }
      .contact-faq-entry p {
        margin: 0;
        color: var(--color-text-secondary, #64748b);
        font-size: 0.92rem;
        line-height: 1.55;
        max-width: 36rem;
      }
      .contact-faq-entry__btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 12px;
        background: #2563eb;
        color: #fff;
        font-size: 0.92rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .contact-faq-entry__btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(37, 99, 235, 0.3);
      }
      .loader {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid rgba(37, 99, 235, 0.2);
        border-top-color: #2563eb;
        animation: spin 1s linear infinite;
      }
      @media (max-width: 768px) {
        .two-cols {
          grid-template-columns: 1fr;
        }
        .contact-section {
          padding: 20px;
        }
        .contact-form {
          padding: 16px;
        }
        .submit-btn {
          width: 100%;
          min-width: 0;
        }
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  );
}
