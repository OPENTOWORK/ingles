'use client';

/**
 * Collapsible profile subsection (replaces horizontal tab pills).
 */
export default function ProfileSectionAccordion({
  id,
  title,
  emoji,
  locked = false,
  open = false,
  onToggle,
  children,
}) {
  return (
    <section
      className={`profile-accordion${open ? ' profile-accordion--open' : ''}${locked ? ' profile-accordion--locked' : ''}`}
      data-section={id}
    >
      <button
        type="button"
        className="profile-accordion__trigger"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`profile-section-${id}`}
      >
        <span className="profile-accordion__chevron" aria-hidden>
          {open ? '▼' : '▶'}
        </span>
        {emoji ? (
          <span className="profile-accordion__icon" aria-hidden>
            {emoji}
          </span>
        ) : null}
        <span className="profile-accordion__title">{title}</span>
        {locked ? <span className="profile-accordion__badge">Soon</span> : null}
      </button>
      {open ? (
        <div
          id={`profile-section-${id}`}
          className="profile-accordion__panel"
          role="region"
          aria-label={title}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
