'use client';

/**
 * Estímulo visual Part 1 — réplica del estilo Cambridge (caja aviso / móvil / cartel).
 */
export function A2Part1Stimulus({ stimulusType, message, imageUrl, prompt }) {
  const type = stimulusType || 'notice';
  const lines = String(message || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const showImage = Boolean(imageUrl);
  const showHtml = lines.length > 0;

  return (
    <div className={`a2-p1-stimulus a2-p1-stimulus--${type}`}>
      {showImage ? (
        <div className="a2-p1-stimulus__img-wrap">
          <img src={imageUrl} alt="" className="a2-p1-stimulus__img" />
        </div>
      ) : null}
      {showHtml && !showImage ? (
        <div className="a2-p1-stimulus__html">
          <StimulusBody type={type} lines={lines} />
        </div>
      ) : null}
      {showHtml && showImage ? (
        <details className="a2-p1-stimulus__text-fallback">
          <summary>Ver texto</summary>
          <StimulusBody type={type} lines={lines} />
        </details>
      ) : null}
      {prompt ? <p className="a2-p1-stimulus__prompt">{prompt}</p> : null}
    </div>
  );
}

function StimulusBody({ type, lines }) {
  if (type === 'text_message') {
    const [greeting, ...rest] = lines;
    const last = rest[rest.length - 1] || '';
    const body = rest.length > 1 && rest[rest.length - 1] === last ? rest.slice(0, -1) : rest;
    const sender = /^[A-Z][a-z]+$/.test(last) && last.length < 20 ? last : null;
    const bodyText = sender ? body : rest;
    return (
      <div className="a2-p1-phone">
        <div className="a2-p1-phone__screen">
          {greeting ? <p className="a2-p1-phone__line">{greeting}</p> : null}
          {bodyText.map((line, i) => (
            <p key={i} className="a2-p1-phone__line">
              {line}
            </p>
          ))}
          {sender ? <p className="a2-p1-phone__sender">{sender}</p> : null}
        </div>
      </div>
    );
  }

  if (type === 'shop_sign' || type === 'public_sign') {
    const [title, ...rest] = lines;
    return (
      <div className="a2-p1-sign">
        <p className="a2-p1-sign__title">{title}</p>
        {rest.map((line, i) => (
          <p key={i} className="a2-p1-sign__line">
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (type === 'classified_ad') {
    const [title, ...rest] = lines;
    return (
      <div className="a2-p1-ad">
        <p className="a2-p1-ad__title">{title || 'For Sale'}</p>
        {rest.map((line, i) => (
          <p key={i} className="a2-p1-ad__line">
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="a2-p1-notice">
      {lines.map((line, i) => (
        <p key={i} className={i === 0 ? 'a2-p1-notice__title' : 'a2-p1-notice__line'}>
          {line}
        </p>
      ))}
    </div>
  );
}
