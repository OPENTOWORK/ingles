'use client';

/**
 * A2 Key Speaking Part 2 (parte global 14) — tarea colaborativa: comparar fotos
 * con el compañero (rejilla 3 arriba + 2 abajo) y follow-up. Solo formato visual demo.
 */
export function A2Part14ExamView({
  directions = '',
  taskInstruction = '',
  photoTitle = '',
  photos = [],
  followUpIntro = '',
  followUpPrompts = [],
}) {
  const directionLines = String(directions || 'Part 2')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 2' ? directionLines[0] : 'Part 2';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 2' ? directionLines.slice(1) : directionLines;

  return (
    <div className="a2-p14-paper">
      <header className="a2-p14-paper__header">
        <h3 className="a2-p14-paper__part-title">{partTitle}</h3>
        <div className="a2-p14-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <p>Talk together with your partner about the pictures, then answer some questions.</p>
          )}
        </div>
        <hr className="a2-p14-paper__rule" />
      </header>

      <section className="a2-p14-task" aria-label="Collaborative task">
        <h4 className="a2-p14-section-title">Phase 1 — Talk together</h4>
        {taskInstruction ? <p className="a2-p14-task__instruction">{taskInstruction}</p> : null}
      </section>

      <section className="a2-p14-photos" aria-label="Picture prompt">
        {photoTitle ? <p className="a2-p14-photos__title">{photoTitle}</p> : null}
        <div className="a2-p14-photos__grid">
          {photos.map((photo) => (
            <figure key={photo.id} className="a2-p14-photo">
              <div className="a2-p14-photo__frame">
                {photo.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || `Picture ${photo.id}`}
                    className="a2-p14-photo__img"
                  />
                ) : (
                  <span className="a2-p14-photo__placeholder" aria-hidden="true">
                    {photo.id}
                  </span>
                )}
              </div>
              <figcaption className="a2-p14-photo__caption">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="a2-p14-followup" aria-label="Follow-up questions">
        <h4 className="a2-p14-section-title">Phase 2 — Follow-up questions</h4>
        {followUpIntro ? <p className="a2-p14-followup__intro">{followUpIntro}</p> : null}
        <ul className="a2-p14-followup__list">
          {followUpPrompts.map((prompt, i) => (
            <li key={i} className="a2-p14-followup__item">
              <span className="a2-p14-followup__speaker">Examiner:</span>
              <span className="a2-p14-followup__text">{prompt}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
