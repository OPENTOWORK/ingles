'use client';

import { useId, useState } from 'react';

function ChevronIcon({ open }) {
  return (
    <svg
      className={`profile-collapse__chevron${open ? ' profile-collapse__chevron--open' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Collapsible block inside a profile tab (e.g. General statistics, Exam statistics).
 */
export default function ProfileCollapsibleSection({
  title,
  description = '',
  defaultOpen = false,
  children,
  className = '',
  style,
  actions = null,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={`profile-section profile-section--collapsible profile-collapse${open ? ' profile-collapse--open' : ''}${className ? ` ${className}` : ''}`.trim()}
      style={style}
    >
      <div className="profile-collapse__head">
        <button
          type="button"
          className="profile-collapse__trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="profile-collapse__chevron-wrap">
            <ChevronIcon open={open} />
          </span>
          <span className="profile-collapse__label">
            <span className="profile-collapse__title">{title}</span>
            {description && !open ? (
              <span className="profile-collapse__preview">{description}</span>
            ) : null}
          </span>
        </button>
        {actions ? <div className="profile-collapse__actions">{actions}</div> : null}
      </div>

      {open ? (
        <div id={panelId} className="profile-collapse__panel">
          <div className="profile-collapse__panel-inner">
            {description ? <p className="profile-collapse__desc">{description}</p> : null}
            {children}
          </div>
        </div>
      ) : null}
    </section>
  );
}
