'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CONTACT_FAQ_ITEMS, CONTACT_FAQ_TOPIC_ORDER } from '@/data/contactFaq';

function FaqItem({ item, open, onToggle }) {
  const panelId = `faq-${item.id}`;

  return (
    <article className={`contact-faq__item${open ? ' contact-faq__item--open' : ''}`}>
      <button
        type="button"
        className="contact-faq__trigger"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="contact-faq__chevron" aria-hidden>
          {open ? '−' : '+'}
        </span>
        <span className="contact-faq__question">{item.question}</span>
        <span className="contact-faq__topic-pill">{item.topic}</span>
      </button>
      {open ? (
        <div id={panelId} className="contact-faq__panel" role="region">
          <p className="contact-faq__answer">{item.answer}</p>
          {item.quickLink ? (
            <Link href={item.quickLink.href} className="contact-faq__link">
              {item.quickLink.label} →
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function ContactFaqSection({
  hideTitle = false,
  supportTicketHref = '#support-ticket-form',
  supportTicketHint = 'above',
}) {
  const [activeTopic, setActiveTopic] = useState('All');
  const [openId, setOpenId] = useState(CONTACT_FAQ_ITEMS[0]?.id ?? null);

  const filtered = useMemo(() => {
    if (activeTopic === 'All') return CONTACT_FAQ_ITEMS;
    return CONTACT_FAQ_ITEMS.filter((item) => item.topic === activeTopic);
  }, [activeTopic]);

  const topicCounts = useMemo(() => {
    const counts = { All: CONTACT_FAQ_ITEMS.length };
    for (const item of CONTACT_FAQ_ITEMS) {
      counts[item.topic] = (counts[item.topic] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <section className="contact-section contact-section--faq">
      <div className="contact-faq__intro">
        {hideTitle ? null : <h2>FAQ</h2>}
        <p>
          Answers to common questions about accounts, exams, progress, billing, and technical
          issues. Use the filters to narrow by topic, or open a support ticket if you need
          personal help.
        </p>
      </div>

      <div className="contact-faq__filters" role="tablist" aria-label="Filter FAQ by topic">
        {CONTACT_FAQ_TOPIC_ORDER.filter((t) => t === 'All' || topicCounts[t]).map((topic) => {
          const active = activeTopic === topic;
          return (
            <button
              key={topic}
              type="button"
              role="tab"
              aria-selected={active}
              className={`contact-faq__filter${active ? ' contact-faq__filter--active' : ''}`}
              onClick={() => {
                setActiveTopic(topic);
                setOpenId(null);
              }}
            >
              {topic}
              <span className="contact-faq__filter-count">{topicCounts[topic] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="contact-faq__list">
        {filtered.length === 0 ? (
          <p className="contact-faq__empty">No questions in this topic yet.</p>
        ) : (
          filtered.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
            />
          ))
        )}
      </div>

      <p className="contact-faq__footer">
        Still stuck?{' '}
        <a href={supportTicketHref} className="contact-faq__footer-link">
          Open a support ticket
        </a>{' '}
        {supportTicketHint} and we will get back to you within 48 hours.
      </p>

      <style jsx global>{`
        .contact-section--faq {
          border-color: #dbeafe;
          background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
        }
        .contact-faq__intro h2 {
          margin: 0 0 8px;
        }
        .contact-faq__intro p {
          margin: 0;
          max-width: 42rem;
          color: #64748b;
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .contact-faq__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0 16px;
        }
        .contact-faq__filter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
          font-family: inherit;
        }
        .contact-faq__filter:hover {
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .contact-faq__filter--active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }
        .contact-faq__filter-count {
          min-width: 1.25rem;
          padding: 0 5px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.1);
          font-size: 0.7rem;
          font-weight: 700;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }
        .contact-faq__filter--active .contact-faq__filter-count {
          background: rgba(37, 99, 235, 0.18);
        }
        .contact-faq__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .contact-faq__item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
          transition: box-shadow 0.15s ease;
        }
        .contact-faq__item--open {
          border-color: #bfdbfe;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
        }
        .contact-faq__trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }
        .contact-faq__item--open .contact-faq__trigger {
          background: linear-gradient(180deg, #eff6ff 0%, #fff 100%);
        }
        .contact-faq__chevron {
          flex-shrink: 0;
          width: 1.5rem;
          height: 1.5rem;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f1f5f9;
          color: #2563eb;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1;
        }
        .contact-faq__question {
          flex: 1;
          min-width: 0;
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
        }
        .contact-faq__topic-pill {
          flex-shrink: 0;
          display: none;
          padding: 3px 8px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
        }
        @media (min-width: 720px) {
          .contact-faq__topic-pill {
            display: inline-block;
          }
        }
        .contact-faq__panel {
          padding: 0 16px 14px 3.25rem;
        }
        .contact-faq__answer {
          margin: 0 0 10px;
          font-size: 0.88rem;
          line-height: 1.55;
          color: #475569;
        }
        .contact-faq__link {
          display: inline-flex;
          font-size: 0.82rem;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
        }
        .contact-faq__link:hover {
          text-decoration: underline;
        }
        .contact-faq__empty {
          margin: 0;
          padding: 16px;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
        }
        .contact-faq__footer {
          margin: 18px 0 0;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
        }
        .contact-faq__footer-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .contact-faq__footer-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
}
