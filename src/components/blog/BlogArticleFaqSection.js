'use client';

import { useState } from 'react';
import { serializeBlogFaqItems } from '@/lib/blogFaq';

export default function BlogArticleFaqSection({ items = [] }) {
  const faqs = serializeBlogFaqItems(items);
  const [openId, setOpenId] = useState(faqs[0]?.id || '');

  if (!faqs.length) return null;

  return (
    <section className="blog-faq" aria-labelledby="blog-faq-title">
      <header className="blog-faq__header">
        <h2 id="blog-faq-title">Preguntas frecuentes</h2>
      </header>

      <div className="blog-faq__list">
        {faqs.map((item) => {
          const isOpen = openId === item.id;
          return (
            <article key={item.id} className="blog-faq__item">
              <button
                type="button"
                className="blog-faq__question"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? '' : item.id)}
              >
                <span>{item.question}</span>
                <span className="blog-faq__icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen ? (
                <div className="blog-faq__answer">
                  <p>{item.answer}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
