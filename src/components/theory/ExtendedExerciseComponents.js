'use client';

import { useMemo, useState } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const exerciseShell = (isCompleted) => ({
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.5rem',
  background: isCompleted ? '#f0fff4' : 'white',
  borderColor: isCompleted ? '#68d391' : '#e2e8f0',
});

const btnPrimary = (enabled) => ({
  padding: '0.75rem 1.5rem',
  background: enabled ? '#667eea' : '#e2e8f0',
  color: enabled ? 'white' : '#a0aec0',
  border: 'none',
  borderRadius: '8px',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontWeight: '500',
});

const btnSecondary = {
  padding: '0.75rem 1.5rem',
  background: '#4a5568',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '500',
};

function ExerciseHeader({ title, isCompleted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', margin: 0, flex: 1 }}>{title}</h3>
      {isCompleted ? (
        <span style={{ background: '#68d391', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
          ✅ Completed
        </span>
      ) : null}
    </div>
  );
}

function ResultBox({ ok, title, children }) {
  return (
    <div style={{
      background: ok ? '#f0fff4' : '#fff5f5',
      border: `1px solid ${ok ? '#68d391' : '#fc8181'}`,
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
    }}>
      <div style={{ fontWeight: '600', color: ok ? '#38a169' : '#e53e3e', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ margin: 0, color: '#4a5568', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function ActionButtons({ showResult, canSubmit, onSubmit, onReset }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      {!showResult ? (
        <button type="button" onClick={onSubmit} disabled={!canSubmit} style={btnPrimary(canSubmit)}>
          Check Answer
        </button>
      ) : (
        <button type="button" onClick={onReset} style={btnSecondary}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function MatchingExercise({ title = 'Match the pairs', pairs = [], explanation, onComplete, isCompleted = false }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const leftItems = pairs.map((p) => p.left);
  const rightItems = [...new Set(pairs.map((p) => p.right))];

  const handleRightClick = (right) => {
    if (!selectedLeft || showResult || matches[selectedLeft]) return;
    setMatches((m) => ({ ...m, [selectedLeft]: right }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    let correct = 0;
    pairs.forEach((p) => {
      if (matches[p.left] === p.right) correct += 1;
    });
    const points = Math.round((correct / pairs.length) * 100);
    setScore(points);
    setShowResult(true);
    onComplete?.(points);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLeft(null);
    setShowResult(false);
    setScore(0);
  };

  const allMatched = pairs.every((p) => matches[p.left]);

  return (
    <div style={exerciseShell(isCompleted)}>
      <ExerciseHeader title={title} isCompleted={isCompleted} />
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem' }}>
        Click a phrase on the left, then its matching tense on the right.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {leftItems.map((left) => {
            const matched = matches[left];
            const pair = pairs.find((p) => p.left === left);
            const isOk = showResult && matched === pair?.right;
            const isBad = showResult && matched && matched !== pair?.right;
            return (
              <button
                key={left}
                type="button"
                disabled={showResult || Boolean(matched)}
                onClick={() => setSelectedLeft(left)}
                style={{
                  padding: '0.65rem 0.85rem',
                  textAlign: 'left',
                  borderRadius: '10px',
                  border: selectedLeft === left ? '2px solid #667eea' : '1px solid #e2e8f0',
                  background: isOk ? '#f0fff4' : isBad ? '#fed7d7' : matched ? '#eef2ff' : selectedLeft === left ? '#f7fafc' : '#fff',
                  cursor: matched || showResult ? 'default' : 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                }}
              >
                {left}
                {matched ? <span style={{ display: 'block', fontSize: '0.75rem', color: '#667eea', marginTop: 4 }}>→ {matched}</span> : null}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rightItems.map((right) => (
            <button
              key={right}
              type="button"
              disabled={showResult || !selectedLeft}
              onClick={() => handleRightClick(right)}
              style={{
                padding: '0.65rem 0.85rem',
                textAlign: 'left',
                borderRadius: '10px',
                border: '1px solid #c7d2fe',
                background: '#eef2ff',
                color: '#4338ca',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: !selectedLeft || showResult ? 'default' : 'pointer',
                opacity: !selectedLeft && !showResult ? 0.6 : 1,
              }}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      {showResult ? (
        <ResultBox ok={score >= 70} title={score >= 70 ? '🎉 Well done!' : '😔 Keep practising'}>
          Score: {score}%. {explanation}
        </ResultBox>
      ) : null}
      <ActionButtons showResult={showResult} canSubmit={allMatched} onSubmit={handleSubmit} onReset={handleReset} />
    </div>
  );
}

export function FindErrorExercise({
  title = 'Find the mistake',
  sentence,
  options = [],
  correctIndex,
  explanation,
  onComplete,
  isCompleted = false,
}) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    const points = selected === correctIndex ? 100 : 0;
    setShowResult(true);
    onComplete?.(points);
  };

  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div style={exerciseShell(isCompleted)}>
      <ExerciseHeader title={title} isCompleted={isCompleted} />
      <p style={{ fontSize: '1.1rem', color: '#2d3748', lineHeight: 1.6, margin: '0 0 1rem', padding: '1rem', background: '#f7fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {sentence}
      </p>
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>Which part is wrong?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {options.map((opt, i) => {
          const isSel = selected === i;
          const isOk = showResult && i === correctIndex;
          const isBad = showResult && isSel && i !== correctIndex;
          return (
            <button
              key={opt}
              type="button"
              disabled={showResult}
              onClick={() => setSelected(i)}
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                borderRadius: 10,
                border: isSel ? '2px solid #667eea' : '1px solid #e2e8f0',
                background: isOk ? '#f0fff4' : isBad ? '#fed7d7' : isSel ? '#f7fafc' : '#fff',
                cursor: showResult ? 'default' : 'pointer',
                color: '#334155',
                fontSize: '0.95rem',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {showResult ? (
        <ResultBox ok={selected === correctIndex} title={selected === correctIndex ? '🎉 Correct!' : '😔 Not quite'}>
          {explanation}
        </ResultBox>
      ) : null}
      <ActionButtons showResult={showResult} canSubmit={selected !== null} onSubmit={handleSubmit} onReset={handleReset} />
    </div>
  );
}

export function SentenceOrderExercise({
  title = 'Put the words in order',
  words = [],
  explanation,
  onComplete,
  isCompleted = false,
}) {
  const shuffled = useMemo(() => shuffle(words), [words]);
  const [pool, setPool] = useState(shuffled);
  const [built, setBuilt] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const addWord = (word, fromPoolIndex) => {
    if (showResult) return;
    setBuilt((b) => [...b, word]);
    setPool((p) => p.filter((_, i) => i !== fromPoolIndex));
  };

  const removeLast = () => {
    if (showResult || built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((b) => b.slice(0, -1));
    setPool((p) => [...p, last]);
  };

  const handleSubmit = () => {
    const ok = built.length === words.length && built.every((w, i) => w === words[i]);
    setShowResult(true);
    onComplete?.(ok ? 100 : 0);
  };

  const handleReset = () => {
    setPool(shuffle(words));
    setBuilt([]);
    setShowResult(false);
  };

  const isCorrect = showResult && built.every((w, i) => w === words[i]);

  return (
    <div style={exerciseShell(isCompleted)}>
      <ExerciseHeader title={title} isCompleted={isCompleted} />
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>Click words in the correct order. Use Undo to remove the last word.</p>
      <div style={{ minHeight: 48, padding: '0.75rem 1rem', marginBottom: '1rem', background: '#eef2ff', borderRadius: 10, border: '1px dashed #c7d2fe', fontSize: '1.05rem', color: '#334155', lineHeight: 1.6 }}>
        {built.length ? built.join(' ') : <span style={{ color: '#94a3b8' }}>Your sentence appears here…</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {pool.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={showResult}
            onClick={() => addWord(word, i)}
            style={{ padding: '0.5rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: showResult ? 'default' : 'pointer', fontSize: '0.95rem' }}
          >
            {word}
          </button>
        ))}
      </div>
      {!showResult && built.length > 0 ? (
        <button type="button" onClick={removeLast} style={{ ...btnSecondary, marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          ↩ Undo last word
        </button>
      ) : null}
      {showResult ? (
        <ResultBox ok={isCorrect} title={isCorrect ? '🎉 Perfect order!' : '😔 Check the answer'}>
          Correct: <strong>{words.join(' ')}</strong>. {explanation}
        </ResultBox>
      ) : null}
      <ActionButtons showResult={showResult} canSubmit={built.length === words.length} onSubmit={handleSubmit} onReset={handleReset} />
    </div>
  );
}

export function SelectAllExercise({
  title = 'Select all correct answers',
  prompt,
  options = [],
  explanation,
  onComplete,
  isCompleted = false,
}) {
  const [selected, setSelected] = useState(new Set());
  const [showResult, setShowResult] = useState(false);

  const toggle = (index) => {
    if (showResult) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSubmit = () => {
    const perfect = options.every((o, i) => (o.isCorrect ? selected.has(i) : !selected.has(i)));
    setShowResult(true);
    onComplete?.(perfect ? 100 : 0);
  };

  const handleReset = () => {
    setSelected(new Set());
    setShowResult(false);
  };

  const allCorrectSelected = options.every((o, i) => (o.isCorrect ? selected.has(i) : !selected.has(i))) && selected.size > 0;

  return (
    <div style={exerciseShell(isCompleted)}>
      <ExerciseHeader title={title} isCompleted={isCompleted} />
      {prompt ? <p style={{ color: '#4a5568', margin: '0 0 1rem', lineHeight: 1.5 }}>{prompt}</p> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {options.map((opt, i) => {
          const isSel = selected.has(i);
          const showOk = showResult && opt.isCorrect;
          const showBad = showResult && isSel && !opt.isCorrect;
          return (
            <label
              key={opt.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: showOk ? '#f0fff4' : showBad ? '#fed7d7' : isSel ? '#f7fafc' : '#fff',
                cursor: showResult ? 'default' : 'pointer',
              }}
            >
              <input type="checkbox" checked={isSel} disabled={showResult} onChange={() => toggle(i)} />
              <span style={{ color: '#334155', fontSize: '0.95rem' }}>{opt.text}</span>
            </label>
          );
        })}
      </div>
      {showResult ? (
        <ResultBox ok={allCorrectSelected} title={allCorrectSelected ? '🎉 All correct!' : '😔 Review your choices'}>
          {explanation}
        </ResultBox>
      ) : null}
      <ActionButtons showResult={showResult} canSubmit={selected.size > 0} onSubmit={handleSubmit} onReset={handleReset} />
    </div>
  );
}
