'use client';

import { useEffect, useId, useState } from 'react';

const SECTIONS = [
  {
    id: 'news',
    hash: 'blog-noticias',
    label: 'Noticias',
    subtitle: 'Anuncios breves, lanzamientos y novedades de Dralo.',
  },
  {
    id: 'articles',
    hash: 'blog-articulos',
    label: 'Artículos',
    subtitle: 'Guías, estrategias y recursos para practicar reading, listening, writing y speaking.',
  },
];

function sectionFromHash(hash) {
  const value = String(hash || '').replace(/^#/, '');
  if (value.startsWith('blog-articulos')) return 'articles';
  if (value.startsWith('blog-noticias')) return 'news';
  return null;
}

/**
 * @param {{
 *   newsPanel: import('react').ReactNode,
 *   articlesPanel: import('react').ReactNode,
 * }} props
 */
export default function BlogTopicNav({ newsPanel, articlesPanel }) {
  const baseId = useId();
  const [open, setOpen] = useState({ news: true, articles: true });

  useEffect(() => {
    const applyHash = () => {
      const section = sectionFromHash(window.location.hash);
      if (!section) return;
      setOpen((current) => ({ ...current, [section]: true }));
      const node = document.getElementById(`blog-fold-${section}`);
      node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  function toggle(id) {
    setOpen((current) => {
      const nextOpen = !current[id];
      const tab = SECTIONS.find((section) => section.id === id);
      if (tab) {
        const next = nextOpen
          ? `${window.location.pathname}${window.location.search}#${tab.hash}`
          : `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, '', next);
      }
      return { ...current, [id]: nextOpen };
    });
  }

  const panels = { news: newsPanel, articles: articlesPanel };

  return (
    <div className="blog-mag__feed">
      {SECTIONS.map((section) => {
        const isOpen = open[section.id];
        const panelId = `${baseId}-panel-${section.id}`;
        return (
          <section
            key={section.id}
            id={`blog-fold-${section.id}`}
            className={`blog-mag__fold${isOpen ? ' is-open' : ''}`}
          >
            <h2 className="blog-mag__fold-heading">
              <button
                type="button"
                className="blog-mag__fold-toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(section.id)}
              >
                <span className="blog-mag__fold-copy">
                  <span className="blog-mag__fold-label">{section.label}</span>
                  <span className="blog-mag__fold-subtitle">{section.subtitle}</span>
                </span>
                <span className="blog-mag__fold-chevron" aria-hidden="true">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                    <path
                      d="M5 7.5 L10 12.5 L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </h2>
            <div className="blog-mag__fold-panel" id={panelId} hidden={!isOpen}>
              {panels[section.id]}
            </div>
          </section>
        );
      })}
    </div>
  );
}
