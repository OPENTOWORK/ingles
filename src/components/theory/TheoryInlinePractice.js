'use client';

import { useMemo, useState } from 'react';
import '@/components/theory/present-tenses/PresentTensesInteractive.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuizItems(topicTitle) {
  return [
    {
      prompt: `What is the main purpose of studying "${topicTitle}"?`,
      options: [
        'To memorise random vocabulary only',
        'To understand rules and apply them in real English',
        'To avoid grammar completely',
        'To translate word by word from Spanish',
      ],
      correct: 1,
      feedback: 'Theory topics help you understand patterns and use them accurately in context.',
    },
    {
      prompt: 'When learning a new grammar or skill point, what should you do first?',
      options: [
        'Skip examples and go straight to the exam',
        'Read the rule and study clear examples',
        'Only listen without reading',
        'Guess every answer without checking',
      ],
      correct: 1,
      feedback: 'Rules plus examples build a clear mental model before practice.',
    },
    {
      prompt: 'Why is practice after theory important?',
      options: [
        'It is not important',
        'It turns passive knowledge into active skill',
        'It replaces the need to read',
        'It only helps writing, not other skills',
      ],
      correct: 1,
      feedback: 'Exercises help you retrieve and apply what you learned.',
    },
    {
      prompt: `Which strategy best supports "${topicTitle}" in an exam?`,
      options: [
        'Ignore time expressions and context',
        'Notice signal words and situation clues',
        'Always choose the longest option',
        'Never review your mistakes',
      ],
      correct: 1,
      feedback: 'Context and signal words (time, connectors, register) guide the right choice.',
    },
    {
      prompt: 'What should you do when you are unsure between two answers?',
      options: [
        'Pick at random',
        'Re-read the relevant theory and look for evidence',
        'Stop the test immediately',
        'Change your answer without reason',
      ],
      correct: 1,
      feedback: 'Go back to the rule or example that matches the situation.',
    },
    {
      prompt: 'How can you keep improving after finishing this topic?',
      options: [
        'Never revisit it',
        'Review mistakes and do spaced repetition',
        'Only study once before the exam',
        'Avoid using English outside class',
      ],
      correct: 1,
      feedback: 'Reviewing errors and revisiting the topic over time strengthens memory.',
    },
  ];
}

function TopicQuiz({ topicTitle }) {
  const items = useMemo(() => shuffleArray(buildQuizItems(topicTitle)), [topicTitle]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = items[index];
  const total = items.length;

  const handlePick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === item.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="pt-card pt-card--result">
        <h3 className="pt-card__title">🎯 Quick check complete</h3>
        <p className="pt-card__score">
          You got <strong>{score}</strong> of <strong>{total}</strong> ({pct}%)
        </p>
        <p className="pt-card__hint">
          {pct >= 80
            ? 'Great! Open the sections below to deepen your knowledge.'
            : 'Review the theory sections above, then try again.'}
        </p>
        <button type="button" className="pt-btn pt-btn--primary" onClick={handleRestart}>
          Play again
        </button>
      </div>
    );
  }

  const isCorrect = picked === item.correct;

  return (
    <div className="pt-card">
      <div className="pt-card__head">
        <h3 className="pt-card__title">🎯 Quick check</h3>
        <span className="pt-badge">
          {index + 1} / {total}
        </span>
      </div>
      <p className="pt-prompt">{item.prompt}</p>
      <div className="pt-fill-options" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {item.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className={`pt-chip${
              picked === i
                ? i === item.correct
                  ? ' pt-chip--ok'
                  : ' pt-chip--bad'
                : picked !== null
                  ? ''
                  : ''
            }`}
            style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
            onClick={() => handlePick(i)}
            disabled={picked !== null}
          >
            {opt}
          </button>
        ))}
      </div>
      {picked !== null ? (
        <div className={`pt-feedback${isCorrect ? ' pt-feedback--ok' : ' pt-feedback--bad'}`} style={{ marginTop: '1rem' }}>
          <strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong> {item.feedback}
          <button type="button" className="pt-btn pt-btn--primary pt-btn--block" onClick={handleNext}>
            {index + 1 >= total ? 'See results' : 'Next question →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TheoryInlinePractice({ topicTitle, embedded = true }) {
  return (
    <div className={`pt-hub${embedded ? ' pt-hub--embedded' : ''}`}>
      <h3 className="pt-hub__title">Interactive practice</h3>
      <p className="pt-hub__text">
        Test your understanding of <strong>{topicTitle}</strong> before you dive into the sections below.
      </p>
      <TopicQuiz topicTitle={topicTitle} />
    </div>
  );
}
