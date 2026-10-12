'use client';

/** Vuelve a abrir el tutorial (solo usuarios registrados). */
export default function HomeTutorialButton({ onOpen }) {
  return (
    <div className="home-tutorial-trigger">
      <button type="button" className="home-tutorial-trigger__btn" onClick={onOpen}>
        <svg className="home-tutorial-trigger__icon" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
          <path d="M10 8.3v7.4l6-3.7-6-3.7z" fill="currentColor" />
        </svg>
        Tutorial
      </button>
    </div>
  );
}
