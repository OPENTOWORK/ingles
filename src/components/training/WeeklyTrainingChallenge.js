'use client';

import { useEffect, useState } from 'react';
import { getWeeklyChallenge } from '@/data/weeklyTrainingChallenges';
import styles from './WeeklyTrainingChallenge.module.css';

const STORAGE_KEY = 'dralo-training-weekly-challenge';

export default function WeeklyTrainingChallenge({ className = '' }) {
  const challenge = getWeeklyChallenge();
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      setChoice(saved?.weekId === challenge.weekId ? saved.choice : null);
    } catch {
      setChoice(null);
    }
  }, [challenge.weekId]);

  const answered = Boolean(choice);
  const correct = choice === challenge.correct;

  const choose = (id) => {
    if (answered) return;
    setChoice(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ weekId: challenge.weekId, choice: id }));
    } catch {
      /* La respuesta sigue en pantalla aunque el navegador no guarde. */
    }
  };

  return (
    <section
      className={`${open ? styles.card : styles.cardClosed}${className ? ` ${className}` : ''}`}
      aria-labelledby="weekly-challenge-title"
    >
      <div className={styles.bar}>
        <div>
          <p className={styles.kicker} id="weekly-challenge-title">El reto del martes · desde el {challenge.since}</p>
          {open ? <h2 className={styles.title}>¿Cuál pondrías tú?</h2> : null}
        </div>
        <button
          type="button"
          className={styles.start}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Cerrar' : 'Hacer reto'}
        </button>
      </div>
      {open ? (
        <>
      <p className={styles.lead}>Sin traductor. Confía en lo que sabes. El martes que viene cambia.</p>
      <p className={styles.prompt} lang="en">{challenge.prompt}</p>
      <div className={styles.options} role="group" aria-label="Opciones">
        {challenge.options.map((option) => {
          const selected = choice === option.id;
          const isAnswer = answered && option.id === challenge.correct;
          const isWrong = selected && !correct;
          const className = [
            styles.option,
            selected ? styles.optionSelected : '',
            isAnswer ? styles.optionCorrect : '',
            isWrong ? styles.optionWrong : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={option.id}
              type="button"
              className={className}
              onClick={() => choose(option.id)}
              disabled={answered}
              aria-pressed={selected}
            >
              <span className={styles.letter}>{option.id}</span>
              <span lang="en">{option.label}</span>
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className={correct ? styles.ok : styles.miss} role="status">
          {correct ? 'Bien. ' : 'Casi. '}
          {challenge.solution}
        </p>
      ) : (
        <p className={styles.hint}>Elige una. La solución aparece al responder.</p>
      )}
        </>
      ) : null}
    </section>
  );
}
