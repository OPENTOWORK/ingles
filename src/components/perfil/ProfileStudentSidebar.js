'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  STUDENT_PROFILE_SECTIONS,
  isStudentSidebarSection,
  reduceStudentDrawer,
  sidebarLinkIndexAfterKey,
  studentDrawerKeyAction,
  studentProfileHref,
} from '@/lib/studentProfileNav';

const GROUPS = ['Learning', 'Profile'];

function focusableItems(root) {
  if (!root) return [];
  return [...root.querySelectorAll('a, button')].filter((node) => !node.hasAttribute('disabled'));
}

export default function ProfileStudentSidebar({
  activeTab,
  onSelectTab,
  displayName = '',
  avatarUrl = '',
  planLabel = '',
}) {
  const [drawer, setDrawer] = useState({ open: false, isMobile: false });
  const { open, isMobile } = drawer;
  const asideRef = useRef(null);
  const toggleRef = useRef(null);
  const titleId = useId();
  const initial = (displayName || 'D').trim().charAt(0).toUpperCase();

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const apply = () => {
      setDrawer((state) => reduceStudentDrawer(state, { type: 'viewport', isMobile: media.matches }));
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!open || !isMobile) return undefined;
    const aside = asideRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('dralo-profile-drawer-open'));
    focusableItems(aside)[0]?.focus();

    const onKeyDown = (event) => {
      const action = studentDrawerKeyAction(event.key);
      if (action === 'close') {
        event.preventDefault();
        setDrawer((state) => reduceStudentDrawer(state, { type: 'close' }));
        toggleRef.current?.focus();
        return;
      }
      if (action !== 'trap') return;
      const items = focusableItems(aside);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event) => {
      const target = event.target;
      if (aside?.contains(target) || toggleRef.current?.contains(target)) return;
      setDrawer((state) => reduceStudentDrawer(state, { type: 'close' }));
      toggleRef.current?.focus();
    };

    const closeFromGlobalMenu = () => {
      setDrawer((state) => reduceStudentDrawer(state, { type: 'close' }));
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('dralo-close-profile-drawer', closeFromGlobalMenu);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('dralo-close-profile-drawer', closeFromGlobalMenu);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isMobile]);

  const close = () => {
    setDrawer((state) => reduceStudentDrawer(state, { type: 'close' }));
    if (isMobile) toggleRef.current?.focus();
  };

  const selectTab = (event, tabId) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onSelectTab(tabId);
    close();
  };

  const onNavKeyDown = (event) => {
    if (studentDrawerKeyAction(event.key) !== 'move') return;
    const links = [...event.currentTarget.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    links[sidebarLinkIndexAfterKey(index, links.length, event.key)]?.focus();
  };

  return (
    <div className="perfil-student__nav">
      <button
        ref={toggleRef}
        type="button"
        className="perfil-student__menu"
        aria-expanded={open}
        aria-controls="profile-student-nav"
        onClick={() => setDrawer((state) => reduceStudentDrawer(state, { type: 'toggle' }))}
      >
        <span aria-hidden>☰</span> Profile
      </button>
      <button
        type="button"
        className={`perfil-student__backdrop${open ? ' is-open' : ''}`}
        aria-label="Close profile menu"
        tabIndex={-1}
        onClick={close}
      />
      <aside
        ref={asideRef}
        id="profile-student-nav"
        className={`perfil-student__side${open ? ' is-open' : ''}`}
        aria-labelledby={titleId}
        aria-hidden={isMobile && !open ? true : undefined}
        inert={isMobile && !open ? true : undefined}
      >
        <div className="perfil-student__identity">
          {avatarUrl ? (
            <img className="perfil-student__avatar" src={avatarUrl} alt="" />
          ) : (
            <span className="perfil-student__avatar perfil-student__avatar--letter" aria-hidden>
              {initial}
            </span>
          )}
          <div>
            <strong id={titleId}>{displayName || 'Your profile'}</strong>
            {planLabel ? <small>{planLabel}</small> : null}
          </div>
        </div>
        <nav aria-label="Profile sections" onKeyDown={onNavKeyDown}>
          {GROUPS.map((group) => (
            <div key={group} className="perfil-student__group">
              <p className="perfil-student__group-label">{group}</p>
              <ul>
                {STUDENT_PROFILE_SECTIONS.filter((section) => section.group === group).map((section) => {
                  const current = isStudentSidebarSection(activeTab) && activeTab === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={studentProfileHref(section.id)}
                        aria-current={current ? 'page' : undefined}
                        className={current ? 'is-active' : undefined}
                        onClick={(event) => selectTab(event, section.id)}
                      >
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
