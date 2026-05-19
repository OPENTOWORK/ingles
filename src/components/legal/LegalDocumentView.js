'use client';

import Link from 'next/link';
import styles from './LegalDocumentView.module.css';

function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜ0-9])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
}

/**
 * @param {{ document: { title: string, updatedAt?: string|null, introParagraphs?: string[], sections: { title: string, body: string }[] } }} props
 */
export default function LegalDocumentView({ document }) {
  if (!document) return null;

  const intro = document.introParagraphs?.length
    ? document.introParagraphs
    : splitParagraphs(document.rawIntro);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>{document.title}</h1>
        {document.updatedAt && (
          <p className={styles.updated}>Última actualización: {document.updatedAt}</p>
        )}
      </header>

      {intro.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className={styles.lead}>
          {paragraph}
        </p>
      ))}

      {document.sections.map((section) => (
        <section key={section.number ?? section.title} className={styles.section}>
          <h2>{section.title}</h2>
          {splitParagraphs(section.body).map((paragraph) => (
            <p key={`${section.title}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
          ))}
        </section>
      ))}

      <footer className={styles.footer}>
        <p>
          ¿Tienes dudas?{' '}
          <Link href="/contacto">Contacta con nosotros</Link>.
        </p>
      </footer>
    </article>
  );
}
