'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import {
  FAQ_TOPICS,
  TICKET_STATUS,
  USER_TYPES,
} from '@/utils/contactModuleConfig';
import SiteMascot from '@/components/SiteMascot';

export default function ContactPage() {
  const [session, setSession] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: USER_TYPES.POTENTIAL,
    status: TICKET_STATUS.UNANSWERED,
    topic: 'uso de la plataforma',
  });
  const [internalForm, setInternalForm] = useState({
    toProfile: 'Alumno /profesor',
    subject: '',
    message: '',
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
          userType: USER_TYPES.CONFIRMED,
        }));
      }

      await Promise.all([loadMyTickets(currentSession?.user?.id), loadFaq()]);
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
      .from('contact_tickets')
      .select('id, subject, status, created_at, first_response_at, closed_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      setMyTickets(data || []);
    }
  };

  const loadFaq = async () => {
    const { data } = await supabase
      .from('contact_faq')
      .select('id, question, answer, topic, quick_link')
      .order('topic', { ascending: true })
      .limit(50);

    setFaqList(data || []);
  };

  const handleTicketChange = (e) => {
    setTicketForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInternalChange = (e) => {
    setInternalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketLoading(true);

    const payload = {
      created_by: session?.user?.id || null,
      requester_name: ticketForm.name,
      requester_email: ticketForm.email,
      requester_type: ticketForm.userType,
      subject: ticketForm.subject,
      message: ticketForm.message,
      status: ticketForm.status,
      topic: ticketForm.topic,
    };

    const { error } = await supabase.from('contact_tickets').insert(payload);
    setTicketLoading(false);

    if (error) {
      toast.error('No se pudo crear el ticket de soporte.');
      return;
    }

    toast.success('Ticket enviado correctamente.');
    setTicketForm((prev) => ({
      ...prev,
      subject: '',
      message: '',
      status: TICKET_STATUS.UNANSWERED,
    }));
    await loadMyTickets(session?.user?.id);
  };

  const handleInternalSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para usar mensajes internos.');
      return;
    }

    setMessageLoading(true);
    const { error } = await supabase.from('internal_messages').insert({
      from_user_id: session.user.id,
      to_profile: internalForm.toProfile,
      subject: internalForm.subject,
      message: internalForm.message,
    });
    setMessageLoading(false);

    if (error) {
      toast.error('No se pudo enviar el mensaje interno.');
      return;
    }

    toast.success('Mensaje interno enviado.');
    setInternalForm((prev) => ({ ...prev, subject: '', message: '' }));
  };

  const getActiveTicketTime = (ticket) => {
    const start = ticket?.created_at ? new Date(ticket.created_at) : null;
    if (!start) return 'N/A';

    const end = ticket?.closed_at ? new Date(ticket.closed_at) : new Date();
    const diffHours = Math.max(0, Math.round((end - start) / (1000 * 60 * 60)));
    return `${diffHours} h`;
  };

  if (pageLoading) {
    return (
      <main className="shell contacto-page center">
        <div className="loader" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="shell contacto-page">
      <header className="header header--mascot">
        <div className="header__copy">
          <h1>Contacto</h1>
          <p>Area de comunicacion dentro de la plataforma que permite la interaccion entre usuarios, profesores y soporte para resolver dudas, incidencias o consultas.</p>
        </div>
        <div className="header__mascot" aria-hidden>
          <SiteMascot variant={8} width={140} alt="" />
        </div>
      </header>

      <section className="contact-section">
        <h2>Mensajes internos</h2>
        <p>Sistema de mensajeria privada integrado en la plataforma para facilitar la comunicacion entre los distintos perfiles.</p>
        <ul className="inline-list">
          <li>Alumno /profesor</li>
          <li>Alumno/soporte</li>
          <li>Profesor/soporte</li>
        </ul>
        <form onSubmit={handleInternalSubmit} className="contact-form">
          <div className="form-group">
            <label>Tipo de comunicacion</label>
            <select
              name="toProfile"
              value={internalForm.toProfile}
              onChange={handleInternalChange}
              className="form-input"
            >
              <option>Alumno /profesor</option>
              <option>Alumno/soporte</option>
              <option>Profesor/soporte</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="subject"
              placeholder="Asunto del mensaje interno"
              value={internalForm.subject}
              onChange={handleInternalChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Mensaje"
              value={internalForm.message}
              onChange={handleInternalChange}
              required
              rows={6}
              className="form-textarea"
            />
          </div>
          <button type="submit" disabled={messageLoading} className="submit-btn">
            {messageLoading ? 'Enviando...' : 'Enviar mensaje interno'}
          </button>
        </form>
      </section>

      <section className="contact-section">
        <h2>Soporte</h2>
        <p>Sistema de atencion y gestion de incidencias que permite hacer seguimiento de consultas o problemas reportados dentro de la plataforma.</p>

        <form onSubmit={handleTicketSubmit} className="contact-form">
          <div className="two-cols">
            <div className="form-group">
              <label>Nombre</label>
              <input className="form-input" name="name" value={ticketForm.name} onChange={handleTicketChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" name="email" value={ticketForm.email} onChange={handleTicketChange} required />
            </div>
          </div>

          <div className="two-cols">
            <div className="form-group">
              <label>Tipos de usuario</label>
              <select className="form-input" name="userType" value={ticketForm.userType} onChange={handleTicketChange}>
                <option>{USER_TYPES.POTENTIAL}</option>
                <option>{USER_TYPES.CONFIRMED}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-input" name="status" value={ticketForm.status} onChange={handleTicketChange}>
                <option>{TICKET_STATUS.OPEN}</option>
                <option>{TICKET_STATUS.UNANSWERED}</option>
                <option>{TICKET_STATUS.ANSWERED}</option>
                <option>{TICKET_STATUS.CLOSED}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Organizacion por temas</label>
            <select className="form-input" name="topic" value={ticketForm.topic} onChange={handleTicketChange}>
              {FAQ_TOPICS.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input className="form-input" name="subject" value={ticketForm.subject} onChange={handleTicketChange} placeholder="Asunto" required />
          </div>
          <div className="form-group">
            <textarea className="form-textarea" name="message" value={ticketForm.message} onChange={handleTicketChange} placeholder="Describe tu consulta o incidencia" rows={5} required />
          </div>
          <button type="submit" className="submit-btn" disabled={ticketLoading}>
            {ticketLoading ? 'Enviando...' : 'Crear ticket de soporte'}
          </button>
        </form>

        {session?.user?.id && (
          <div className="tickets-table-wrap">
            <h3>Mis tickets</h3>
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Tiempo del ticket en activo</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Sin tickets registrados.</td>
                  </tr>
                ) : (
                  myTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.subject}</td>
                      <td>{ticket.status}</td>
                      <td>{getActiveTicketTime(ticket)}</td>
                      <td>{new Date(ticket.created_at).toLocaleString('es-ES')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="contact-section">
        <h2>FAQ</h2>
        <p>Preguntas frecuentes y definiciones ademas de soluciones.</p>
        <ul className="inline-list">
          <li>Autogestion: Permite al usuario encontrar soluciones de forma inmediata y autonoma.</li>
          <li>Organizacion por temas: cuenta, pagos, uso de la plataforma, etc.</li>
          <li>Acceso rapido: Hipervinculos (Facilita la busqueda de informacion relevante sin navegar por toda la plataforma).</li>
        </ul>

        {faqList.length > 0 && (
          <div className="faq-grid">
            {faqList.map((faq) => (
              <article key={faq.id} className="faq-card">
                <strong>{faq.question}</strong>
                <p>{faq.answer}</p>
                <small>{faq.topic}</small>
                {faq.quick_link && (
                  <a href={faq.quick_link} target="_blank" rel="noreferrer">Acceso rapido</a>
                )}
              </article>
            ))}
          </div>
        )}
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
      .tickets-table th,.tickets-table td{border:1px solid #eaeaea;padding:10px;text-align:left;font-size:14px}
      .tickets-table th{background:#fafafa}
      .faq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px}
      .faq-card{border:1px solid #eaeaea;border-radius:12px;padding:12px;background:#fff;display:grid;gap:6px}
      .faq-card p{margin:0;color:#333}
      .faq-card small{color:#666}
      .faq-card a{color:#0070f3;text-decoration:none}
      .submit-btn{padding:14px 20px;background:#0070f3;color:white;font-weight:600;border:none;border-radius:12px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 10px 24px rgba(0,112,243,.35)}
      .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,112,243,.4)}
      .submit-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @media (max-width: 768px){.two-cols{grid-template-columns:1fr}}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
