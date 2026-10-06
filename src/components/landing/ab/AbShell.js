import AbTracker from '@/components/landing/ab/AbTracker';
import './ab-landing.css';

export function AbPage({ pageType, variant, source = 'direct', tone = 'product', children }) {
  return (
    <article className={`ab-landing ab-landing--${tone}`} lang="es">
      <AbTracker pageType={pageType} variant={variant} source={source} />
      <div className="ab-shell">{children}</div>
    </article>
  );
}

export function AbHero({ kicker, title, lead, actions, extra, visual }) {
  return (
    <header className="ab-hero">
      <div className="ab-hero__copy">
        {kicker ? <p className="ab-kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="ab-lead">{lead}</p> : null}
        {actions ? <div className="ab-hero__actions">{actions}</div> : null}
        {extra}
      </div>
      {visual ? <div className="ab-hero__visual">{visual}</div> : null}
    </header>
  );
}

export function AbTrust({ items }) {
  return (
    <ul className="ab-trust">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function AbQuote({ label, text, note }) {
  return (
    <section className="ab-quote">
      <blockquote>
        {label ? <p className="ab-kicker">{label}</p> : null}
        <p>{text}</p>
      </blockquote>
      {note ? <p className="ab-quote__note">{note}</p> : null}
    </section>
  );
}

export function AbCards({ title, lead, items, columns }) {
  return (
    <section className="ab-block">
      {title ? <h2>{title}</h2> : null}
      {lead ? <p className="ab-block__lead">{lead}</p> : null}
      <div className={`ab-cards${columns ? ` ab-cards--${columns}` : ''}`}>
        {items.map((item) => (
          <article key={item.title} className={`ab-card ab-card--${item.tone || 'purple'}`}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AbSteps({ title, lead, steps }) {
  return (
    <section className="ab-block">
      {title ? <h2>{title}</h2> : null}
      {lead ? <p className="ab-block__lead">{lead}</p> : null}
      <ol className="ab-steps">
        {steps.map((step, index) => (
          <li key={step.title || step}>
            <div className="ab-step__head">
              <span>{index + 1}</span>
              {typeof step === 'string' ? null : <strong>{step.title}</strong>}
            </div>
            <p>{typeof step === 'string' ? step : step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AbSplit({ title, text, points, media, flip = false }) {
  return (
    <section className={`ab-split${flip ? ' ab-split--flip' : ''}`}>
      <div>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
        {points?.length ? (
          <ul className="ab-ticks">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="ab-split__media">{media}</div>
    </section>
  );
}

export function AbOffer({ title, text, points, cta, seats }) {
  const chips = points?.length ? points : null;
  return (
    <section className={`ab-offer${chips ? ' ab-offer--chips' : ''}`}>
      <div className="ab-offer__main">
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
        {chips ? (
          <ul className="ab-chips">
            {chips.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : (
          cta
        )}
      </div>
      <div className="ab-offer__aside">
        {seats}
        {chips ? cta : null}
      </div>
    </section>
  );
}

export function AbFaq({ title, items }) {
  return (
    <section className="ab-block" id="faq">
      <h2>{title}</h2>
      <div className="ab-faq">
        {items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function AbFinal({ title, text, cta }) {
  return (
    <section className="ab-final">
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {cta}
    </section>
  );
}

export function OfferPreview({ children }) {
  return (
    <div className="ab-preview ab-preview--offer">
      <p className="ab-kicker">Plan Plus</p>
      <strong>Gratis para siempre</strong>
      <p>Para los primeros registros que completen el formulario a los 30 días.</p>
      {children}
    </div>
  );
}

export function ReadingPreview() {
  const parts = [
    ['1', 'Part 1', 'Multiple choice'],
    ['2', 'Part 2', 'Open cloze'],
    ['3', 'Part 3', 'Word formation'],
    ['4', 'Part 4', 'Key word'],
  ];
  return (
    <div className="ab-preview ab-preview--exam">
      <div className="ab-preview__top">
        <span>Dralo</span>
        <strong>Reading & Use of English</strong>
      </div>
      <ul>
        {parts.map(([n, name, kind]) => (
          <li key={n}>
            <b>{n}</b>
            <span>
              {name}
              <small>{kind}</small>
            </span>
          </li>
        ))}
      </ul>
      <img src="/mascot/poses/cheer.png" alt="" width="120" height="120" />
    </div>
  );
}

export function PaperBars({ papers }) {
  return (
    <div className="ab-preview ab-preview--papers">
      <p className="ab-kicker">Cuatro pruebas</p>
      <ul>
        {papers.map((paper) => (
          <li key={paper.name}>
            <span>{paper.name}</span>
            <strong>{paper.weight}</strong>
            <i style={{ width: String(paper.weight).replace(/\s+/g, '') }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
