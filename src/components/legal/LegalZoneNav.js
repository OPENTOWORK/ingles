'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { getLegalMainMenuTree } from '@/lib/legal/legalDocuments';
import styles from './LegalZoneNav.module.css';

function slugifySection(number, title) {
  return `section-${number}-${String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('dralo:open-cookie-settings'));
}

/**
 * @param {{
 *   currentSlug: string;
 *   sections?: { number?: number; title: string }[];
 * }} props
 */
export default function LegalZoneNav({ currentSlug, sections = [] }) {
  const menus = useMemo(() => getLegalMainMenuTree(), []);

  return (
    <nav className={styles.nav} aria-label="Navegación legal y de privacidad">
      <div className={styles.hub}>
        <p className={styles.hubTitle}>Documentación legal</p>

        {menus.map((menu) => {
          const isActiveMenu = menu.items.some((item) => item.slug === currentSlug);

          return (
            <section
              key={menu.id}
              className={`${styles.menuBlock}${isActiveMenu ? ` ${styles.menuBlockActive}` : ''}`}
              aria-labelledby={`legal-menu-${menu.id}`}
            >
              <h2 id={`legal-menu-${menu.id}`} className={styles.menuTitle}>
                {menu.label}
              </h2>
              <ul className={styles.submenuList}>
                {menu.items.map((item) => {
                  const isActive = item.slug === currentSlug;

                  if (item.type === 'action') {
                    return (
                      <li key={item.slug}>
                        <button
                          type="button"
                          className={styles.submenuButton}
                          onClick={openCookieSettings}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={item.slug}>
                      <Link
                        href={item.href}
                        className={`${styles.submenuLink}${isActive ? ` ${styles.submenuLinkActive}` : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {sections.length > 0 ? (
        <div className={styles.sectionNav}>
          <p className={styles.sectionNavTitle}>En este documento</p>
          <ol className={styles.sectionList}>
            {sections.map((section) => (
              <li key={section.number ?? section.title}>
                <a href={`#${slugifySection(section.number, section.title)}`}>
                  <span className={styles.sectionNumber}>{section.number}</span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </nav>
  );
}
