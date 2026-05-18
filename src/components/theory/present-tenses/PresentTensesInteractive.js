'use client';

import { useState } from 'react';
import './PresentTensesInteractive.css';

const TENSES = [
  { id: 'simple', label: 'Present Simple', short: 'Simple', color: '#667eea' },
  { id: 'continuous', label: 'Present Continuous', short: 'Continuous', color: '#0891b2' },
  { id: 'perfect', label: 'Present Perfect', short: 'Perfect', color: '#7c3aed' },
];

const TENSE_PICKER_ITEMS = [
  {
    sentence: 'I work in an office.',
    tense: 'simple',
    feedback: 'A general fact about your job — not an action in progress right now.',
  },
  {
    sentence: 'She is reading a book right now.',
    tense: 'continuous',
    feedback: '"Right now" + am/is/are + -ing → action happening at this moment.',
  },
  {
    sentence: 'I have visited Paris twice.',
    tense: 'perfect',
    feedback: 'Life experience — when is not important; have + past participle.',
  },
  {
    sentence: 'The train leaves at 8 PM.',
    tense: 'simple',
    feedback: 'Fixed schedules and timetables use Present Simple.',
  },
  {
    sentence: 'They are playing football in the park.',
    tense: 'continuous',
    feedback: 'Activity in progress around now.',
  },
  {
    sentence: 'We have lived here since 2019.',
    tense: 'perfect',
    feedback: '"Since" links a past start to now — still true today.',
  },
  {
    sentence: 'Water boils at 100°C.',
    tense: 'simple',
    feedback: 'Scientific facts and universal truths → Present Simple.',
  },
  {
    sentence: 'Have you finished your homework?',
    tense: 'perfect',
    feedback: 'Recent completion with present relevance — Present Perfect question.',
  },
];

const KEYWORD_ITEMS = [
  { word: 'every day', tense: 'simple' },
  { word: 'usually', tense: 'simple' },
  { word: 'on Mondays', tense: 'simple' },
  { word: 'now', tense: 'continuous' },
  { word: 'at the moment', tense: 'continuous' },
  { word: 'right now', tense: 'continuous' },
  { word: 'already', tense: 'perfect' },
  { word: 'just', tense: 'perfect' },
  { word: 'since', tense: 'perfect' },
  { word: 'for 5 years', tense: 'perfect' },
  { word: 'ever / never', tense: 'perfect' },
];

const FILL_BLANKS = [
  {
    before: 'She ',
    after: ' to school every day.',
    answer: 'goes',
    options: ['goes', 'is going', 'has gone'],
    explanation: 'Daily routine → Present Simple. Third person: goes.',
  },
  {
    before: 'I ',
    after: ' my homework at the moment.',
    answer: 'am doing',
    options: ['do', 'am doing', 'have done'],
    explanation: '"At the moment" → action in progress → Present Continuous.',
  },
  {
    before: 'They ',
    after: ' here for three years.',
    answer: 'have lived',
    options: ['live', 'are living', 'have lived'],
    explanation: '"For three years" (unfinished period) → Present Perfect.',
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TensePickerQuiz() {
  const [order] = useState(() => shuffleArray(TENSE_PICKER_ITEMS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = order[index];
  const total = order.length;

  const handlePick = (tenseId) => {
    if (picked) return;
    setPicked(tenseId);
    if (tenseId === item.tense) setScore((s) => s + 1);
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
        <h3 className="pt-card__title">🎯 Tense challenge complete</h3>
        <p className="pt-card__score">
          You got <strong>{score}</strong> of <strong>{total}</strong> ({pct}%)
        </p>
        <p className="pt-card__hint">
          {pct >= 80
            ? 'Excellent! You can spot the tense confidently.'
            : pct >= 50
              ? 'Good effort — review the sections you find tricky and try again.'
              : 'Keep practising — open each section above and use the examples.'}
        </p>
        <button type="button" className="pt-btn pt-btn--primary" onClick={handleRestart}>
          Play again
        </button>
      </div>
    );
  }

  const isCorrect = picked === item.tense;

  return (
    <div className="pt-card">
      <div className="pt-card__head">
        <h3 className="pt-card__title">🎯 Which tense is it?</h3>
        <span className="pt-badge">
          {index + 1} / {total}
        </span>
      </div>
      <p className="pt-prompt">Read the sentence and choose the tense:</p>
      <blockquote className="pt-sentence">&ldquo;{item.sentence}&rdquo;</blockquote>
      <div className="pt-tense-btns">
        {TENSES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pt-tense-btn${
              picked === t.id
                ? item.tense === t.id
                  ? ' pt-tense-btn--correct'
                  : ' pt-tense-btn--wrong'
                : picked
                  ? ' pt-tense-btn--dim'
                  : ''
            }`}
            onClick={() => handlePick(t.id)}
            disabled={Boolean(picked)}
            style={{ '--tense-color': t.color }}
          >
            {t.short}
          </button>
        ))}
      </div>
      {picked ? (
        <div className={`pt-feedback${isCorrect ? ' pt-feedback--ok' : ' pt-feedback--bad'}`}>
          <strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong> {item.feedback}
          <button type="button" className="pt-btn pt-btn--primary pt-btn--block" onClick={handleNext}>
            {index + 1 >= total ? 'See results' : 'Next sentence →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function KeywordMatcher() {
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState({});
  const [lastResult, setLastResult] = useState(null);

  const remaining = KEYWORD_ITEMS.filter((k) => !matches[k.word]);

  const handleTenseClick = (tenseId) => {
    if (!selectedWord) return;
    const item = KEYWORD_ITEMS.find((k) => k.word === selectedWord);
    if (!item || matches[selectedWord]) return;

    const correct = item.tense === tenseId;
    setMatches((m) => ({ ...m, [selectedWord]: { tense: tenseId, correct } }));
    setLastResult({
      word: selectedWord,
      correct,
      expected: item.tense,
    });
    setSelectedWord(null);
  };

  const correctCount = Object.values(matches).filter((m) => m.correct).length;
  const allDone = remaining.length === 0;

  return (
    <div className="pt-card">
      <h3 className="pt-card__title">🔑 Match keywords to a tense</h3>
      <p className="pt-card__hint">
        Click a keyword, then click the tense it belongs to. Score: {correctCount} / {KEYWORD_ITEMS.length}
      </p>
      <div className="pt-keywords">
        {KEYWORD_ITEMS.map((k) => {
          const m = matches[k.word];
          return (
            <button
              key={k.word}
              type="button"
              className={`pt-chip${
                selectedWord === k.word ? ' pt-chip--selected' : ''
              }${m ? (m.correct ? ' pt-chip--ok' : ' pt-chip--bad') : ''}`}
              onClick={() => !m && setSelectedWord(k.word)}
              disabled={Boolean(m)}
            >
              {k.word}
            </button>
          );
        })}
      </div>
      <p className="pt-prompt">
        {selectedWord ? `Now choose a tense for “${selectedWord}”:` : 'Select a keyword above'}
      </p>
      <div className="pt-tense-btns">
        {TENSES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="pt-tense-btn"
            onClick={() => handleTenseClick(t.id)}
            disabled={!selectedWord}
            style={{ '--tense-color': t.color }}
          >
            {t.short}
          </button>
        ))}
      </div>
      {lastResult && !selectedWord ? (
        <p className={`pt-mini-feedback${lastResult.correct ? ' pt-mini-feedback--ok' : ''}`}>
          {lastResult.correct
            ? `✓ “${lastResult.word}” → ${TENSES.find((t) => t.id === lastResult.expected)?.label || lastResult.expected}`
            : `✗ “${lastResult.word}” goes with ${TENSES.find((t) => t.id === lastResult.expected)?.label || lastResult.expected}`}
        </p>
      ) : null}
      {allDone ? (
        <p className="pt-card__hint pt-card__hint--success">
          🎉 All keywords matched! Open the theory sections above to review examples.
        </p>
      ) : null}
    </div>
  );
}

function FillBlankChallenge() {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const handleChange = (i, value) => {
    setAnswers((a) => ({ ...a, [i]: value }));
    setChecked(false);
  };

  const results = FILL_BLANKS.map((q, i) => answers[i] === q.answer);
  const allFilled = FILL_BLANKS.every((_, i) => answers[i]);
  const score = results.filter(Boolean).length;

  return (
    <div className="pt-card">
      <h3 className="pt-card__title">✏️ Quick fill-in</h3>
      <p className="pt-card__hint">Choose the best verb form for each sentence.</p>
      {FILL_BLANKS.map((q, i) => (
        <div key={i} className="pt-fill-row">
          <p className="pt-fill-sentence">
            {q.before}
            <select
              className={`pt-select${checked ? (results[i] ? ' pt-select--ok' : ' pt-select--bad') : ''}`}
              value={answers[i] || ''}
              onChange={(e) => handleChange(i, e.target.value)}
              disabled={checked}
            >
              <option value="">…</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {q.after}
          </p>
          {checked && !results[i] ? (
            <p className="pt-fill-explain">{q.explanation}</p>
          ) : null}
        </div>
      ))}
      <div className="pt-fill-actions">
        {!checked ? (
          <button
            type="button"
            className="pt-btn pt-btn--primary"
            disabled={!allFilled}
            onClick={() => setChecked(true)}
          >
            Check answers
          </button>
        ) : (
          <>
            <p className="pt-card__score">
              {score} / {FILL_BLANKS.length} correct
            </p>
            <button type="button" className="pt-btn pt-btn--secondary" onClick={() => {
              setAnswers({});
              setChecked(false);
            }}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PresentTensesPracticeHub({ embedded = false }) {
  return (
    <section
      className={`pt-hub${embedded ? ' pt-hub--embedded' : ''}`}
      aria-label="Interactive practice"
    >
      <div className="pt-hub__intro">
        <h2 className="pt-hub__title">⚡ Interactive practice</h2>
        <p className="pt-hub__text">
          Test yourself before diving into each section. All activities are only for this topic.
        </p>
      </div>
      <TensePickerQuiz />
    </section>
  );
}

export function PresentTensesFillPractice() {
  return <FillBlankChallenge />;
}

export function PresentTensesKeywordPractice() {
  return <KeywordMatcher />;
}

export default function PresentTensesInteractive() {
  return (
    <>
      <PresentTensesPracticeHub />
      <PresentTensesFillPractice />
    </>
  );
}
