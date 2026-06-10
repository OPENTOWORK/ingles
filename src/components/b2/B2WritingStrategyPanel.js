'use client';

import { useEffect, useState } from 'react';

/**
 * Collapsible Strategy & tips + interactive Structure checklist for Writing practice.
 * Practice Mode only — never rendered during Exam Mode.
 */
export default function B2WritingStrategyPanel({ pack }) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    setChecked({});
  }, [pack?.label]);

  if (!pack) return null;

  const toggleItem = (item) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const checklist = pack.checklist || [];
  const doneCount = checklist.filter((item) => checked[item]).length;

  return (
    <aside className="levels-listening-strategy levels-writing-strategy">
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

          {pack.commonMistakes?.length ? (
            <section>
              <h3 className="levels-listening-strategy__heading">Common mistakes</h3>
              <ul>
                {pack.commonMistakes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {checklist.length ? (
            <section>
              <h3 className="levels-listening-strategy__heading">
                Structure checklist{' '}
                <span className="levels-writing-strategy__check-count">
                  {doneCount}/{checklist.length}
                </span>
              </h3>
              <ul className="levels-writing-strategy__checklist">
                {checklist.map((item) => (
                  <li key={item}>
                    <label className="levels-writing-strategy__check-item">
                      <input
                        type="checkbox"
                        checked={Boolean(checked[item])}
                        onChange={() => toggleItem(item)}
                      />
                      <span className={checked[item] ? 'levels-writing-strategy__check-done' : ''}>
                        {item}
                      </span>
                    </label>
                  </li>
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
