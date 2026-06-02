'use client';

import { sitePublicPath } from '@/utils/sitePublicPath';

function resolveStimulusImageUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return sitePublicPath(raw.startsWith('/') ? raw : `/${raw}`);
}

const STIMULUS_ALT = {
  classified_ad: 'Classified advertisement',
  text_message: 'Text message on a phone',
  shop_sign: 'Shop sign',
  public_sign: 'Public notice sign',
  email_note: 'Short email or note',
  notice: 'Notice or sign',
};

/**
 * Estímulo visual Part 1 — réplica del estilo Cambridge (caja aviso / móvil / cartel).
 */
export function A2Part1Stimulus({ stimulusType, message, imageUrl, prompt, textOnly = true }) {
  const type = stimulusType || 'notice';
  const lines = String(message || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const resolvedImageUrl = textOnly ? '' : resolveStimulusImageUrl(imageUrl);
  const showImage = Boolean(resolvedImageUrl);
  const showHtml = lines.length > 0;
  const showImageSlot = !textOnly && !showImage;
  const alt = STIMULUS_ALT[type] || STIMULUS_ALT.notice;

  return (
    <figure
      className={[
        'a2-p1-stimulus',
        `a2-p1-stimulus--${type}`,
        showImage ? 'a2-p1-stimulus--has-image' : '',
        textOnly ? 'a2-p1-stimulus--text-only' : '',
        showImageSlot ? 'a2-p1-stimulus--awaiting-image' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showImage ? (
        <div className="a2-p1-stimulus__media">
          <div className="a2-p1-stimulus__img-frame">
            <img
              src={resolvedImageUrl}
              alt={alt}
              className="a2-p1-stimulus__img"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      ) : null}
      {showImageSlot ? (
        <div className="a2-p1-stimulus__img-slot" aria-hidden="true">
          <span>Image</span>
        </div>
      ) : null}
      {showHtml ? (
        <div className="a2-p1-stimulus__html">
          <StimulusBody type={type} lines={lines} />
        </div>
      ) : !showImage && !showImageSlot ? (
        <div className="a2-p1-stimulus__html a2-p1-stimulus__html--empty">
          <p className="a2-p1-stimulus__placeholder">Read the notice or message.</p>
        </div>
      ) : null}
      {prompt ? (
        <figcaption className="a2-p1-stimulus__prompt">{prompt}</figcaption>
      ) : null}
    </figure>
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
