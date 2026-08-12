'use client';

import { useId, useState } from 'react';

/**
 * One Cambridge criterion, with progressive disclosure (Doc 04 §6).
 *
 * Collapsed it is a name, a mark and one useful sentence. Expanded it adds what
 * worked, what held the band back, the learner's own words as evidence, and the
 * next focus. It never shows the decision record behind the mark: no rule ids, no
 * confidence, no `why_not_lower` structure, no provenance — the view model does not
 * even carry them.
 *
 * At band 5 the wording consolidates instead of pointing at a band 6, because
 * Cambridge B2 First has no band 6.
 */
export default function WritingCriterionCard({ criterion, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = `${useId()}-panel`;

  return (
    <article className={`writing-criterion${expanded ? ' writing-criterion--expanded' : ''}`}>
      <h3 className="writing-criterion__heading">
        <button
          type="button"
          className="writing-criterion__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className="writing-criterion__name">{criterion.label}</span>
          <span className="writing-criterion__mark">
            {criterion.mark}
            <span aria-hidden="true">/{criterion.max}</span>
            <span className="writing-result__sr-only"> out of {criterion.max}</span>
          </span>
          <span className="writing-criterion__chevron" aria-hidden="true">
            {expanded ? '−' : '+'}
          </span>
        </button>
      </h3>

      <p className="writing-criterion__summary">{criterion.summary}</p>

      <div className="writing-criterion__panel" id={panelId} hidden={!expanded}>
        <dl className="writing-criterion__detail">
          <dt>What worked</dt>
          <dd>{criterion.expanded.what_worked}</dd>
          <dt>{criterion.is_top_band ? 'Where to stay careful' : 'What limited this band'}</dt>
          <dd>{criterion.expanded.what_limited_the_band}</dd>
          {criterion.expanded.evidence.length ? (
            <>
              <dt>From your writing</dt>
              <dd>
                <ul className="writing-criterion__evidence">
                  {criterion.expanded.evidence.map((quote) => (
                    <li key={quote}>“{quote}”</li>
                  ))}
                </ul>
              </dd>
            </>
          ) : null}
          <dt>{criterion.next_focus_label}</dt>
          <dd>{criterion.expanded.next_focus}</dd>
        </dl>
      </div>
    </article>
  );
}
