'use client';

import { useEffect, useId, useState } from 'react';

const TABS = [
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

function tabFromHash(hash) {
  const value = String(hash || '').replace(/^#/, '');
  if (value.startsWith('blog-articulos')) return 'articles';
  return 'news';
}

/**
 * @param {{
 *   newsPanel: import('react').ReactNode,
 *   articlesPanel: import('react').ReactNode,
 * }} props
 */
export default function BlogTopicNav({ newsPanel, articlesPanel }) {
  const baseId = useId();
  const [active, setActive] = useState('news');

  useEffect(() => {
    const sync = () => setActive(tabFromHash(window.location.hash));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  function selectTab(tab) {
    setActive(tab.id);
    const next = `${window.location.pathname}${window.location.search}#${tab.hash}`;
    window.history.replaceState(null, '', next);
  }

  const activeTab = TABS.find((tab) => tab.id === active) || TABS[0];
  const panels = { news: newsPanel, articles: articlesPanel };

  return (
    <div className="blog-mag__feed">
      <div className="blog-mag__tabs" role="tablist" aria-label="Contenido del blog">
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={`blog-mag__tab${selected ? ' is-active' : ''}`}
              onClick={() => selectTab(tab)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="blog-mag__tabs-subtitle">{activeTab.subtitle}</p>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-${tab.id}`}
          hidden={active !== tab.id}
        >
          {panels[tab.id]}
        </div>
      ))}
    </div>
  );
}
