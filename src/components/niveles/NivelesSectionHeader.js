'use client';

export default function NivelesSectionHeader({ eyebrow, title, count, description }) {
  return (
    <header className="niveles-section-head">
      <div className="niveles-section-head__row">
        <div className="niveles-section-head__title-wrap">
          {eyebrow ? <span className="niveles-section-head__eyebrow">{eyebrow}</span> : null}
          <h2 className="niveles-section-head__title">{title}</h2>
        </div>
        {count != null ? (
          <span className="niveles-section-head__count" aria-label={`${count} items`}>
            {count}
          </span>
        ) : null}
      </div>
      {description ? <p className="niveles-section-head__desc">{description}</p> : null}
    </header>
  );
}
