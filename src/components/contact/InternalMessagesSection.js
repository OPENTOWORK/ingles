'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId, normalizeRoleName } from '@/utils/authRoles';
import { INTERNAL_MESSAGE_CHANNELS } from '@/utils/contactModuleConfig';

const STUDENT_ROLES = new Set(['student', 'alumno']);

export default function InternalMessagesSection({ session }) {
  const [messageLoading, setMessageLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const [form, setForm] = useState({
    toProfile: INTERNAL_MESSAGE_CHANNELS[0].value,
    subject: '',
    message: '',
  });

  const isLoggedIn = Boolean(session?.user?.id);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsStudent(false);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    getRoleNameByUserId(session.user.id, session.user.email).then((role) => {
      if (!cancelled) {
        setIsStudent(STUDENT_ROLES.has(normalizeRoleName(role)));
        setRoleLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.user?.email]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('You must sign in to send internal messages.');
      return;
    }

    setMessageLoading(true);
    const { error } = await supabase.from('internal_messages').insert({
      from_user_id: session.user.id,
      to_profile: form.toProfile,
      subject: form.subject,
      message: form.message,
    });
    setMessageLoading(false);

    if (error) {
      toast.error('Could not send the message. Please try again.');
      return;
    }

    toast.success('Message sent successfully.');
    setForm((prev) => ({ ...prev, subject: '', message: '' }));
  };

  return (
    <section className="contact-section contact-section--internal">
      <div className="internal-messages__header">
        <span className="internal-messages__icon" aria-hidden>
          💬
        </span>
        <div>
          <h2>Internal messages</h2>
          <p>
            Private in-platform messaging between students, teachers, and support.
            Choose who you want to reach, then send your message securely.
          </p>
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="internal-messages__signin" role="status">
          <strong>Sign in required</strong>
          <p>You need to be logged in to send internal messages.</p>
        </div>
      ) : null}

      {isLoggedIn && !roleLoading && isStudent ? (
        <div className="internal-messages__coming-soon" role="status">
          <span className="internal-messages__coming-soon-badge">Coming soon</span>
          <p>
            Internal messaging for students will be available soon. For now, use{' '}
            <strong>Support</strong> below to open a ticket.
          </p>
        </div>
      ) : null}

      {isLoggedIn && (roleLoading || isStudent) ? null : (
        <>
      <div className="internal-channels" role="radiogroup" aria-label="Message channel">
        {INTERNAL_MESSAGE_CHANNELS.map((channel) => {
          const selected = form.toProfile === channel.value;
          return (
            <button
              key={channel.value}
              type="button"
              className={`internal-channel${selected ? ' internal-channel--active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, toProfile: channel.value }))}
              aria-pressed={selected}
              disabled={!isLoggedIn}
            >
              <span className="internal-channel__icon" aria-hidden>
                {channel.icon}
              </span>
              <span className="internal-channel__label">{channel.label}</span>
              <span className="internal-channel__desc">{channel.description}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="internal-form">
        <div className="form-group">
          <label htmlFor="internal-subject">Subject</label>
          <input
            id="internal-subject"
            type="text"
            name="subject"
            placeholder="What is your message about?"
            value={form.subject}
            onChange={handleChange}
            required
            className="form-input"
            disabled={!isLoggedIn}
          />
        </div>

        <div className="form-group">
          <label htmlFor="internal-message">Message</label>
          <textarea
            id="internal-message"
            name="message"
            placeholder="Write your message here…"
            value={form.message}
            onChange={handleChange}
            required
            rows={6}
            className="form-textarea"
            disabled={!isLoggedIn}
          />
        </div>

        <div className="internal-form__footer">
          <p className="internal-form__hint">
            Messages are delivered inside the platform to the selected profile.
          </p>
          <button
            type="submit"
            disabled={messageLoading || !isLoggedIn}
            className="submit-btn submit-btn--internal"
          >
            {messageLoading ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </form>
        </>
      )}

      <style jsx global>{`
        .contact-section--internal {
          border: 1px solid #fce7f3;
          background: linear-gradient(180deg, #fff 0%, #fff7fb 100%);
        }
        .internal-messages__header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .internal-messages__icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          font-size: 1.35rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          box-shadow: 0 4px 14px rgba(219, 39, 119, 0.15);
        }
        .contact-section--internal h2 {
          margin: 0 0 6px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }
        .contact-section--internal .internal-messages__header p {
          margin: 0;
          color: #64748b;
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .internal-messages__signin {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }
        .internal-messages__signin strong {
          display: block;
          margin-bottom: 4px;
          color: #9f1239;
        }
        .internal-messages__signin p {
          margin: 0;
          font-size: 0.9rem;
          color: #be123c;
        }
        .internal-messages__coming-soon {
          margin-bottom: 0;
          padding: 2rem 1.5rem;
          border-radius: 16px;
          background: #fff;
          border: 1px dashed #f9a8d4;
          text-align: center;
        }
        .internal-messages__coming-soon-badge {
          display: inline-block;
          margin-bottom: 0.75rem;
          padding: 0.35rem 1rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          color: #9d174d;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .internal-messages__coming-soon p {
          margin: 0;
          max-width: 36rem;
          margin-left: auto;
          margin-right: auto;
          color: #64748b;
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .internal-channels {
          display: grid;
          gap: 12px;
          margin-bottom: 22px;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
          .internal-channels {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        .internal-channel {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          text-align: left;
          padding: 16px;
          border-radius: 16px;
          border: 2px solid #f1f5f9;
          background: #fff;
          cursor: pointer;
          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            transform 0.2s;
        }
        .internal-channel:hover:not(:disabled) {
          border-color: #f9a8d4;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(219, 39, 119, 0.12);
        }
        .internal-channel--active {
          border-color: #ec4899;
          background: linear-gradient(180deg, #fff 0%, #fdf2f8 100%);
          box-shadow: 0 8px 28px rgba(219, 39, 119, 0.18);
        }
        .internal-channel:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .internal-channel__icon {
          font-size: 1.5rem;
          line-height: 1;
        }
        .internal-channel__label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }
        .internal-channel__desc {
          font-size: 0.8rem;
          line-height: 1.4;
          color: #64748b;
        }
        .internal-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 20px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #f1f5f9;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        .internal-form__footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 4px;
        }
        .internal-form__hint {
          margin: 0;
          flex: 1 1 200px;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.45;
        }
        .submit-btn--internal {
          background: linear-gradient(135deg, #e11d48 0%, #db2777 100%);
          box-shadow: 0 10px 28px rgba(219, 39, 119, 0.35);
        }
        .submit-btn--internal:hover:not(:disabled) {
          box-shadow: 0 14px 36px rgba(219, 39, 119, 0.45);
        }
      `}</style>
    </section>
  );
}
