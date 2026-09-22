'use client';

/**
 * Pasos previos al ejercicio en móvil: elegir parte del examen de la skill y leer
 * las instrucciones. En tablet y escritorio no se usan.
 */

function StepShell({ eyebrow, title, children }) {
  return (
    <div className="phone-practice-step">
      <div className="phone-practice-step__head">
        {eyebrow ? <p className="phone-practice-step__eyebrow">{eyebrow}</p> : null}
        <h1 className="phone-practice-step__title">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function ExamPracticePhonePartPicker({
  eyebrow,
  items = [],
  selectedPartId = null,
  onSelect,
  lang = 'en',
}) {
  const isEn = lang !== 'es';

  return (
    <StepShell eyebrow={eyebrow} title={isEn ? 'Choose a part' : 'Elige una parte'}>
      <ul className="phone-practice-step__list">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={`phone-practice-step__item${
                item.id === selectedPartId ? ' phone-practice-step__item--current' : ''
              }`}
              onClick={() => onSelect(item)}
            >
              <span className="phone-practice-step__item-num">{index + 1}</span>
              <span className="phone-practice-step__item-body">
                <span className="phone-practice-step__item-label">{item.label}</span>
                {item.subtitle ? (
                  <span className="phone-practice-step__item-sub">{item.subtitle}</span>
                ) : null}
              </span>
              {item.score ? (
                <span className="phone-practice-step__item-score">{item.score}</span>
              ) : null}
              <span className="phone-practice-step__item-chevron" aria-hidden>
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </StepShell>
  );
}

export function ExamPracticePhoneInstructions({
  eyebrow,
  title,
  onContinue,
  onBack = null,
  lang = 'en',
  children,
}) {
  const isEn = lang !== 'es';

  return (
    <StepShell eyebrow={eyebrow} title={title}>
      <div className="phone-practice-step__scroll">
        {children ?? (
          <p className="phone-practice-step__empty">
            {isEn
              ? 'Everything is ready. Tap Start to begin the exercise.'
              : 'Todo listo. Pulsa Empezar para comenzar el ejercicio.'}
          </p>
        )}
      </div>
      <div className="phone-practice-step__actions">
        <button type="button" className="phone-practice-step__cta" onClick={onContinue}>
          {isEn ? 'Start exercise' : 'Empezar ejercicio'}
        </button>
        {onBack ? (
          <button type="button" className="phone-practice-step__back" onClick={onBack}>
            {isEn ? 'Choose another part' : 'Elegir otra parte'}
          </button>
        ) : null}
      </div>
    </StepShell>
  );
}

export function ExamPracticePhoneStepLoading({ eyebrow, lang = 'en' }) {
  const isEn = lang !== 'es';
  return (
    <StepShell eyebrow={eyebrow} title={isEn ? 'Choose a part' : 'Elige una parte'}>
      <p className="phone-practice-step__empty">{isEn ? 'Loading…' : 'Cargando…'}</p>
    </StepShell>
  );
}
