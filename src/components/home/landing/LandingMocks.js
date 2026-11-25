'use client';

import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';

const WRITING_LEGEND = [
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'spelling', label: 'Spelling' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'content', label: 'Content' },
  { key: 'strength', label: 'Strength' },
];

const WRITING_CRITERIA = [
  { label: 'Content', mark: 3, summary: 'The essay answers the question, but some points stay general.' },
  { label: 'Communicative Achievement', mark: 4, summary: 'The tone is suitable for an essay.' },
  { label: 'Organisation', mark: 3, summary: 'There is a beginning, a middle and an end.' },
  { label: 'Language', mark: 3, summary: 'Most sentences are clear. The slips are local.' },
];

const PRACTICE_TILES = [
  { icon: BookOpen, label: 'Reading', second: '& Use of English', accent: '#38bdf8', ink: '#1e628c' },
  { icon: PenLine, label: 'Writing', accent: '#1b9a62', ink: '#1a6b48' },
  { icon: Headphones, label: 'Listening', accent: '#d97706', ink: '#a15c12' },
  { icon: Mic, label: 'Speaking', accent: '#db2777', ink: '#b4256c' },
];

const RESULT_BARS = [
  { label: 'Reading and Use of English', value: 72 },
  { label: 'Writing', value: 64 },
  { label: 'Listening', value: 58 },
];

/** Ejemplo estático de la corrección real: texto marcado, comentario y criterios. */
export function WritingFeedbackMock() {
  return (
    <div className="hl-wmock">
      <p className="hl-wmock__example">Ejemplo</p>
      <p className="hl-wmock__title">Your corrected writing</p>
      <ul className="hl-wmock__legend" aria-label="Mark categories in your writing">
        {WRITING_LEGEND.map((item) => (
          <li key={item.key}>
            <span className={`hl-wmock__legend-word hl-mark--${item.key}`}>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="hl-wmock__body">
        <p className="hl-essay">
          Plastic waste is a serious problem in many cities.{' '}
          <mark className="hl-mark hl-mark--grammar hl-mark--open">People has throw</mark> too much
          packaging away every day, and the <mark className="hl-mark hl-mark--spelling">enviroment</mark>{' '}
          is paying the price. <mark className="hl-mark hl-mark--vocabulary">A lot of stuff</mark> ends
          up in the sea because there are not enough bins.
        </p>
        <aside className="hl-wmock__bubble" aria-label="Feedback on People has throw">
          <p className="hl-wmock__tag hl-mark--grammar">Grammar</p>
          <p className="hl-wmock__kicker">Why</p>
          <p className="hl-wmock__bubble-text">
            The subject is “People”, so the verb needs a plural form.
          </p>
          <p className="hl-wmock__kicker">Suggestion</p>
          <p className="hl-wmock__suggestion">People throw</p>
        </aside>
      </div>
      <p className="hl-wmock__criteria-label">Cambridge criteria</p>
      <ul className="hl-wmock__criteria">
        {WRITING_CRITERIA.map((item) => (
          <li key={item.label}>
            <p>
              <span>{item.label}</span>
              <strong>
                {item.mark}
                <span>/5</span>
              </strong>
            </p>
            <small>{item.summary}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PracticePickerMock() {
  return (
    <div className="hl-mini hl-mini--practice" aria-hidden="true">
      <div className="hl-mini__nav">
        <span>Practice</span>
        <span>Exam Strategies</span>
        <span className="hl-mini__login">Login</span>
      </div>
      <p className="hl-mini__title">Choose what to practise</p>
      <div className="hl-mini__tiles">
        {PRACTICE_TILES.map(({ icon: Icon, label, second, accent, ink }) => (
          <div key={label} className="hl-mini__tile">
            <span
              className="hl-mini__tile-icon"
              style={{ background: `color-mix(in srgb, ${accent} 16%, white)`, color: ink }}
            >
              <Icon />
            </span>
            <span className="hl-mini__tile-label" style={{ color: ink }}>
              {label}
              {second ? (
                <>
                  <br />
                  {second}
                </>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewMock() {
  return (
    <div className="hl-mini hl-mini--review" aria-hidden="true">
      <p className="hl-mini__title">Your corrected writing</p>
      <p className="hl-mini__essay">
        <mark className="hl-mark hl-mark--grammar">People has throw</mark> too much packaging away,
        and the <mark className="hl-mark hl-mark--spelling">enviroment</mark> is paying the price.
      </p>
      <p className="hl-mini__bubble">
        <strong>Grammar</strong>
        <span>Suggestion: People throw</span>
      </p>
    </div>
  );
}

export function ResultsMock() {
  return (
    <div className="hl-mini hl-mini--results" aria-hidden="true">
      <p className="hl-mini__title">Mis resultados</p>
      <p className="hl-mini__sub">Tu progreso por parte del examen</p>
      <div className="hl-mini__bars">
        {RESULT_BARS.map(({ label, value }) => (
          <div key={label} className="hl-mini__bar-row">
            <span className="hl-mini__bar-label">{label}</span>
            <span className="hl-mini__bar">
              <span style={{ width: `${value}%` }} />
            </span>
            <span className="hl-mini__bar-value">{value}%</span>
          </div>
        ))}
      </div>
      <p className="hl-mini__focus">
        Siguiente sesión: <strong>Listening</strong>
      </p>
    </div>
  );
}
