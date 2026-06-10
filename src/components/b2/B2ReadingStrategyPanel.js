'use client';

import { useState } from 'react';

/**
 * Collapsible Strategy & tips sidebar for Reading and Use of English part practice.
 * Practice Mode only — never rendered during Exam Mode.
 */
export default function B2ReadingStrategyPanel({ pack }) {
  const [open, setOpen] = useState(true);
  if (!pack) return null;

  return (
    <aside className="levels-listening-strategy">
      <button
        type="button"
        className="levels-listening-strategy__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Strategy &amp; tips — {pack.label}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="levels-listening-strategy__body">
          <section>
            <h3 className="levels-listening-strategy__heading">Strategy</h3>
            <p>{pack.strategy}</p>
          </section>
          {pack.commonTraps?.length ? (
            <section>
              <h3 className="levels-listening-strategy__heading">Common traps</h3>
              <ul>
                {pack.commonTraps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {pack.lookFor?.length ? (
            <section>
              <h3 className="levels-listening-strategy__heading">What to look for</h3>
              <ul>
                {pack.lookFor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {pack.studyTip ? (
            <section className="levels-listening-strategy__tip">
              <h3 className="levels-listening-strategy__heading">Study tip</h3>
              <p>{pack.studyTip}</p>
            </section>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
