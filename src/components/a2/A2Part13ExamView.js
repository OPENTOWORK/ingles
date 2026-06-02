'use client';

/**
 * A2 Key Speaking Part 1 (parte global 13) — fase de presentación (entrevista)
 * + prompt con rejilla de fotos (3 arriba, 2 abajo). Solo formato visual demo.
 */
export function A2Part13ExamView({
  directions = '',
  interviewIntro = '',
  interviewPrompts = [],
  photoTitle = '',
  photos = [],
}) {
  const directionLines = String(directions || 'Part 1')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 1' ? directionLines[0] : 'Part 1';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 1' ? directionLines.slice(1) : directionLines;

  return (
    <div className="a2-p13-paper">
      <header className="a2-p13-paper__header">
        <h3 className="a2-p13-paper__part-title">{partTitle}</h3>
        <div className="a2-p13-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <p>The examiner asks you questions and shows you pictures to talk about.</p>
          )}
        </div>
        <hr className="a2-p13-paper__rule" />
      </header>

      <section className="a2-p13-interview" aria-label="Personal interview">
        <h4 className="a2-p13-section-title">Phase 1 — Personal interview</h4>
        {interviewIntro ? <p className="a2-p13-interview__intro">{interviewIntro}</p> : null}
        <ul className="a2-p13-interview__list">
          {interviewPrompts.map((prompt, i) => (
            <li key={i} className="a2-p13-interview__item">
              <span className="a2-p13-interview__speaker">Examiner:</span>
              <span className="a2-p13-interview__text">{prompt}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="a2-p13-photos" aria-label="Picture prompt">
        <h4 className="a2-p13-section-title">Phase 2 — Pictures</h4>
        {photoTitle ? <p className="a2-p13-photos__title">{photoTitle}</p> : null}
        <div className="a2-p13-photos__grid">
          {photos.map((photo) => (
            <figure key={photo.id} className="a2-p13-photo">
              <div className="a2-p13-photo__frame">
                {photo.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || `Picture ${photo.id}`}
                    className="a2-p13-photo__img"
                  />
                ) : (
                  <span className="a2-p13-photo__placeholder" aria-hidden="true">
                    {photo.id}
                  </span>
                )}
              </div>
              <figcaption className="a2-p13-photo__caption">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
