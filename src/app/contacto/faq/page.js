'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ContactFaqSection from '@/components/contact/ContactFaqSection';

export default function ContactFaqPage() {
  return (
    <main className="shell contacto-page contacto-faq-page">
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Find quick answers about accounts, exams, progress, billing, and technical issues. If you still need help, open a support ticket from the Contact page."
        mascotVariant={8}
        mascotWidth={130}
        accent="ocean"
        stats={[
          { value: '19', label: 'Topics covered' },
          { value: 'Self-service', label: 'Instant answers' },
        ]}
      />

      <p className="contact-faq-page__back">
        <Link href="/contacto">← Back to Contact</Link>
      </p>

      <ContactFaqSection
        hideTitle
        supportTicketHref="/contacto#support-ticket-form"
        supportTicketHint="on the Contact page"
      />

      <style jsx global>{`
        .contacto-faq-page {
          background-color: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
        .contacto-faq-page.shell {
          min-height: 100svh;
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 20px;
        }
        .contact-faq-page__back {
          margin: 0 0 12px;
        }
        .contact-faq-page__back a {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
        }
        .contact-faq-page__back a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
