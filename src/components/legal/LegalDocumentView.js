'use client';

import Link from 'next/link';
import { parseBodyBlocks } from '@/lib/legal/parseLegalContent';
import { getLegalCategoryLabel, getLegalMainMenuLabelForSlug } from '@/lib/legal/legalDocuments';
import LegalZoneNav from '@/components/legal/LegalZoneNav';
import styles from './LegalDocumentView.module.css';

function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜ0-9])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
}

function slugifySection(number, title) {
  return `section-${number}-${String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

function LegalBlock({ block }) {
  if (block.type === 'table') {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {block.columns.map((column) => (
                <th key={column} scope="col">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.purpose}>
                <th scope="row">{row.purpose}</th>
                <td>{row.data}</td>
                <td>{row.legalBasis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === 'subheading') {
    return <p className={styles.subheading}>{block.text}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul className={styles.list}>
        {block.items.map((item) => (
          <li key={item.slice(0, 40)}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'definitions') {
    return (
      <dl className={styles.definitions}>
        {block.entries.map((entry) => (
          <div key={entry.term} className={styles.definitionRow}>
            <dt>{entry.term}</dt>
            <dd>{entry.description}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p>{block.text}</p>;
}

/**
 * @param {{ document: { slug?: string, title: string, category?: string, updatedAt?: string|null, introParagraphs?: string[], sections: { number?: number, title: string, body: string }[] } }} props
 */
export default function LegalDocumentView({ document }) {
  if (!document) return null;

  const intro = document.introParagraphs?.length
    ? document.introParagraphs
    : splitParagraphs(document.rawIntro);

  const categoryLabel = getLegalMainMenuLabelForSlug(document.slug)
    || getLegalCategoryLabel(document.category);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span>Legal y privacidad</span>
        <span aria-hidden="true">/</span>
        <span>{categoryLabel}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{document.title}</span>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <LegalZoneNav currentSlug={document.slug} sections={document.sections} />
        </aside>

        <article className={styles.article}>
          <header className={styles.header}>
            <span className={styles.category}>{categoryLabel}</span>
            <h1>{document.title}</h1>
            {document.updatedAt && (
              <p className={styles.updated}>
                Última actualización: <time dateTime={document.updatedAt}>{document.updatedAt}</time>
              </p>
            )}
          </header>

          {intro.length > 0 && (
            <div className={styles.intro}>
              {intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          )}

          <div className={styles.sections}>
            {document.sections.map((section) => {
              const sectionId = slugifySection(section.number, section.title);
              const blocks = parseBodyBlocks(section.body, { sectionNumber: section.number });

              return (
                <section
                  key={section.number ?? section.title}
                  id={sectionId}
                  className={styles.section}
                  aria-labelledby={`${sectionId}-title`}
                >
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>{section.number}</span>
                    <h2 id={`${sectionId}-title`}>{section.title}</h2>
                  </div>
                  <div className={styles.sectionBody}>
                    {blocks.map((block, index) => (
                      <div key={`${sectionId}-block-${index}`} className={styles.sectionBlock}>
                        <LegalBlock block={block} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <footer className={styles.footer}>
            <p>
              ¿Tienes dudas sobre este documento?{' '}
              <Link href="/contacto">Contacta con nosotros</Link>.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
