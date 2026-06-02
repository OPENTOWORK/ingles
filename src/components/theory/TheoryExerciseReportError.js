'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { TICKET_STATUS, USER_TYPES } from '@/utils/contactModuleConfig';

export default function TheoryExerciseReportError({
  exerciseId = '',
  question = '',
  topicHref = '',
  cefrLevel = '',
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const canonicalTopic = topicHref || pathname || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < 10) {
      toast.error('Please describe the issue in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session?.access_token) {
        toast.error('Sign in to send a report to support.');
        return;
      }

      const user = session.user;
      const name =
        String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim() ||
        user.email?.split('@')[0] ||
        'Student';
      const email = user.email || '';

      const subject = exerciseId
        ? `Theory exercise error (${String(exerciseId).slice(0, 8)}…)`
        : 'Theory exercise error';

      const body = [
        text,
        '',
        '---',
        'Context (automatic):',
        `Topic: ${canonicalTopic}`,
        cefrLevel ? `Level: ${cefrLevel}` : null,
        exerciseId ? `Exercise ID: ${exerciseId}` : null,
        question ? `Question: ${question}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/contact/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message: body,
          userType: USER_TYPES.CONFIRMED,
          status: TICKET_STATUS.UNANSWERED,
          topic: 'uso de la plataforma',
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not send the report.');

      setSent(true);
      setMessage('');
      toast.success('Report sent to support. We will review it soon.');
    } catch (err) {
      toast.error(err.message || 'Error sending report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <p className="theory-exercise-report-error__done" role="status">
        ✓ Report sent to support
      </p>
    );
  }

  return (
    <div className="theory-exercise-report-error-wrap">
      <button
        type="button"
        className="theory-exercise-report-error"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Report error
      </button>

      {open ? (
        <form className="theory-exercise-report-error__form" onSubmit={handleSubmit}>
          <label className="theory-exercise-report-error__label" htmlFor="theory-error-report">
            What went wrong with this exercise?
          </label>
          <textarea
            id="theory-error-report"
            className="theory-exercise-report-error__textarea"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the mistake (wrong answer, typo, unclear wording…)"
            disabled={submitting}
            required
            minLength={10}
          />
          <div className="theory-exercise-report-error__actions">
            <button
              type="button"
              className="theory-exercise-report-error__cancel"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theory-exercise-report-error__submit"
              disabled={submitting || message.trim().length < 10}
            >
              {submitting ? 'Sending…' : 'Send to support'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
