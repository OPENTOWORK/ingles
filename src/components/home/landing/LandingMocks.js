'use client';

import { useId, useState } from 'react';
import { BookOpen, ChartColumn, Headphones, House, PenLine, User } from 'lucide-react';

const WRITING_TABS = [
  { id: 'texto', label: 'Tu texto' },
  { id: 'correccion', label: 'Corrección' },
  { id: 'comentarios', label: 'Comentarios' },
];

const WRITING_COMMENTS = [
  { label: 'Contenido', text: 'Respondes a la pregunta y das tu opinión al final.' },
  { label: 'Organización', text: 'However, For example e In my opinion ordenan bien las ideas.' },
  { label: 'Lenguaje', text: 'Vocabulario variado. Repasa el participio del present perfect.' },
];

const PRACTICE_NAV = [
  { icon: House, label: 'Inicio' },
  { icon: BookOpen, label: 'Practicar', active: true },
  { icon: PenLine, label: 'Writing' },
  { icon: ChartColumn, label: 'Resultados' },
  { icon: User, label: 'Perfil' },
];

const PRACTICE_TILES = [
  { icon: BookOpen, label: 'Reading and Use of English' },
  { icon: PenLine, label: 'Writing' },
  { icon: Headphones, label: 'Listening' },
];

const RESULT_BARS = [
  { label: 'Reading and Use of English', value: 72 },
  { label: 'Writing', value: 64 },
  { label: 'Listening', value: 58 },
];

function SampleEssay({ corrected = false }) {
  return (
    <p className="hl-essay">
      In recent years, the number of people working from home has increased significantly. This
      trend{' '}
      {corrected ? (
        <mark className="hl-mark hl-mark--fix">has brought</mark>
      ) : (
        <mark className="hl-mark hl-mark--err">has bring</mark>
      )}{' '}
      many benefits, such as a better work-life balance and less traffic in cities. However, it
      also presents some challenges. For example,{' '}
      {corrected ? (
        <mark className="hl-mark hl-mark--fix">people may feel isolated</mark>
      ) : (
        <mark className="hl-mark hl-mark--tip">people can feel isolated</mark>
      )}{' '}
      and it may be difficult to separate work from personal life. In my opinion, working from home
      can be positive if companies provide the right support.
    </p>
  );
}

function FeedbackNote({ tone, label, chips, text }) {
  return (
    <div className={`hl-note hl-note--${tone}`}>
      <p className="hl-note__label">{label}</p>
      <p className="hl-note__change">
        {chips.map((chip, index) => (
          <span key={chip.text} className="hl-note__chip-group">
            {index > 0 ? <span aria-hidden="true">→</span> : null}
            <span className={`hl-chip hl-chip--${chip.tone}`}>{chip.text}</span>
          </span>
        ))}
      </p>
      <p className="hl-note__text">{text}</p>
    </div>
  );
}

/** Ejemplo de corrección de Writing con sus tres pestañas. */
export function WritingFeedbackMock() {
  const [active, setActive] = useState('texto');
  const baseId = useId();
  const panelProps = (id) => ({
    role: 'tabpanel',
    id: `${baseId}-panel-${id}`,
    'aria-labelledby': `${baseId}-tab-${id}`,
    hidden: active !== id,
  });

  return (
    <div className="hl-wmock">
      <p className="hl-wmock__example">Ejemplo</p>
      <div className="hl-wmock__tabs" role="tablist" aria-label="Ejemplo de corrección de Writing">
        {WRITING_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-controls={`${baseId}-panel-${tab.id}`}
            aria-selected={active === tab.id}
            className="hl-wmock__tab"
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hl-wmock__panels">
        <div className="hl-wmock__panel" {...panelProps('texto')}>
          <SampleEssay />
          <div className="hl-notes">
            <FeedbackNote
              tone="err"
              label="Corrección"
              chips={[
                { text: 'has bring', tone: 'err' },
                { text: 'has brought', tone: 'ok' },
              ]}
              text="Después de «has» va el participio: bring → brought."
            />
            <FeedbackNote
              tone="tip"
              label="Sugerencia"
              chips={[{ text: 'people can feel isolated', tone: 'tip' }]}
              text="«People may feel isolated» suena más natural y formal en un essay."
            />
          </div>
        </div>

        <div className="hl-wmock__panel" {...panelProps('correccion')}>
          <SampleEssay corrected />
          <div className="hl-notes">
            <FeedbackNote
              tone="fix"
              label="Gramática"
              chips={[{ text: 'has brought', tone: 'fix' }]}
              text="Present perfect: has + participio."
            />
            <FeedbackNote
              tone="fix"
              label="Estilo"
              chips={[{ text: 'may feel isolated', tone: 'fix' }]}
              text="Más prudente y formal que «can feel»."
            />
          </div>
        </div>

        <div className="hl-wmock__panel hl-wmock__panel--single" {...panelProps('comentarios')}>
          <ul className="hl-comments">
            {WRITING_COMMENTS.map((comment) => (
              <li key={comment.label} className="hl-comment">
                <p className="hl-comment__label">{comment.label}</p>
                <p className="hl-comment__text">{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PracticePickerMock() {
  return (
    <div className="hl-mini hl-mini--practice" aria-hidden="true">
      <div className="hl-mini__side">
        {PRACTICE_NAV.map(({ icon: Icon, label, active }) => (
          <span key={label} className={active ? 'is-active' : undefined}>
            <Icon />
            {label}
          </span>
        ))}
      </div>
      <div className="hl-mini__main">
        <p className="hl-mini__title">Practica tu B2 First</p>
        <p className="hl-mini__sub">Elige la parte del examen</p>
        <div className="hl-mini__tiles">
          {PRACTICE_TILES.map(({ icon: Icon, label }) => (
            <div key={label} className="hl-mini__tile">
              <span className="hl-mini__tile-icon">
                <Icon />
              </span>
              <span className="hl-mini__tile-label">{label}</span>
              <span className="hl-mini__btn">Practicar →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewMock() {
  return (
    <div className="hl-mini hl-mini--review" aria-hidden="true">
      <p className="hl-mini__title">Writing · Part 1</p>
      <div className="hl-mini__tabs">
        <span className="is-active">Tu respuesta</span>
        <span>Corrección</span>
        <span>Comentarios</span>
      </div>
      <p className="hl-mini__essay">
        Nowadays, more and more people <mark className="hl-mark hl-mark--err">prefers</mark> to shop
        online. In my opinion, it is a good idea because you can compare prices and save time.
      </p>
      <p className="hl-mini__fix">
        <span className="hl-chip hl-chip--err">prefers</span>
        <span>→</span>
        <span className="hl-chip hl-chip--ok">prefer</span>
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
