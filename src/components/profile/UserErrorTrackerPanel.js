'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUserErrors,
  markErrorAsMastered,
  generateExercisesFromError,
} from '@/lib/errorTracker';

const CATEGORY_FILTERS = [
  'All',
  'Grammar',
  'Vocabulary',
  'Spelling',
  'Word Order',
  'Prepositions',
  'Verb Tenses',
  'Pronunciation',
];

const SOURCE_FILTERS = ['All', 'Writing', 'Speaking', 'Grammar', 'Use of English'];

const LEVEL_BADGES = ['A2', 'B1', 'B2', 'C1', 'C2'];

const EMPTY_STATE_TEXT =
  'No errors yet. Complete a writing, speaking or grammar activity and Dralo will start tracking your mistakes.';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function UserErrorTrackerPanel({ userId = null }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [masteringId, setMasteringId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [exercisesByError, setExercisesByError] = useState({});
  const [openExercisesId, setOpenExercisesId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadErrors = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const res = await getUserErrors(userId);
    if (!res.ok) {
      setLoadError(res.error || 'Could not load your errors.');
      setErrors([]);
    } else {
      setErrors(res.data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadErrors();
  }, [loadErrors]);

  const filtered = useMemo(() => {
    return errors.filter((e) => {
      const catOk =
        categoryFilter === 'All' ||
        String(e.error_type || '').toLowerCase() === categoryFilter.toLowerCase();
      const srcOk =
        sourceFilter === 'All' ||
        String(e.source || '').toLowerCase() === sourceFilter.toLowerCase();
      return catOk && srcOk;
    });
  }, [errors, categoryFilter, sourceFilter]);

  const handleMaster = async (id) => {
    setActionError('');
    setMasteringId(id);
    const res = await markErrorAsMastered(id);
    if (res.ok) {
      setErrors((prev) =>
        prev.map((e) => (e.id === id ? { ...e, mastered: true } : e)),
      );
    } else {
      setActionError(res.error || 'Could not mark as mastered.');
    }
    setMasteringId(null);
  };

  const handleGenerate = async (error) => {
    setActionError('');
    setGeneratingId(error.id);
    const res = await generateExercisesFromError(error);
    if (res.ok) {
      setExercisesByError((prev) => ({ ...prev, [error.id]: res.data }));
      setOpenExercisesId(error.id);
    } else {
      setActionError(res.error || 'Could not generate exercises.');
    }
    setGeneratingId(null);
  };

  const renderExercises = (error) => {
    const data = exercisesByError[error.id];
    if (!data) return null;
    const mc = Array.isArray(data.multipleChoice) ? data.multipleChoice : [];
    const gaps = Array.isArray(data.fillInTheGap) ? data.fillInTheGap : [];
    return (
      <div className="uet-exercises">
        <div className="uet-exercises__head">
          <h4>Practice exercises</h4>
          <button
            type="button"
            className="uet-btn uet-btn--ghost"
            onClick={() => setOpenExercisesId(null)}
          >
            Close
          </button>
        </div>

        {mc.length > 0 ? (
          <div className="uet-ex-block">
            <h5>Multiple choice</h5>
            <ol className="uet-ex-list">
              {mc.map((q, i) => (
                <li key={`mc-${i}`} className="uet-ex-item">
                  <p className="uet-ex-q">{q.question}</p>
                  <ul className="uet-ex-options">
                    {(q.options || []).map((opt, j) => (
                      <li
                        key={`opt-${j}`}
                        className={
                          String(opt).trim().toLowerCase() ===
                          String(q.answer || '').trim().toLowerCase()
                            ? 'uet-ex-opt uet-ex-opt--correct'
                            : 'uet-ex-opt'
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <p className="uet-ex-answer">Answer: {q.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {gaps.length > 0 ? (
          <div className="uet-ex-block">
            <h5>Fill in the gap</h5>
            <ol className="uet-ex-list">
              {gaps.map((q, i) => (
                <li key={`gap-${i}`} className="uet-ex-item">
                  <p className="uet-ex-q">{q.sentence}</p>
                  <p className="uet-ex-answer">Answer: {q.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {data.finalExplanation ? (
          <div className="uet-ex-final">
            <h5>Explanation</h5>
            <p>{data.finalExplanation}</p>
          </div>
        ) : null}

        {mc.length === 0 && gaps.length === 0 ? (
          <p className="uet-empty-small">{data.finalExplanation || 'No exercises available.'}</p>
        ) : null}
      </div>
    );
  };

  return (
    <section className="uet">
      <header className="uet__hero">
        <h2 className="uet__title">
          <span aria-hidden="true">🧠</span> My Error Tracker
        </h2>
        <p className="uet__subtitle">Review your most common mistakes and practise them.</p>
      </header>

      <div className="uet__filters">
        <div className="uet__filter-group">
          <span className="uet__filter-label">Category</span>
          <div className="uet__chips">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                type="button"
                className={`uet-chip${categoryFilter === c ? ' uet-chip--active' : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="uet__filter-group">
          <span className="uet__filter-label">Source</span>
          <div className="uet__chips">
            {SOURCE_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`uet-chip${sourceFilter === s ? ' uet-chip--active' : ''}`}
                onClick={() => setSourceFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionError ? (
        <p className="uet__alert" role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <div className="uet__state">Loading your mistakes…</div>
      ) : loadError ? (
        <div className="uet__state uet__state--error" role="alert">
          {loadError}
        </div>
      ) : errors.length === 0 ? (
        <div className="uet__state uet__empty">{EMPTY_STATE_TEXT}</div>
      ) : filtered.length === 0 ? (
        <div className="uet__state">No mistakes match these filters.</div>
      ) : (
        <div className="uet__grid">
          {filtered.map((e) => (
            <article
              key={e.id}
              className={`uet-card${e.mastered ? ' uet-card--mastered' : ''}`}
            >
              <div className="uet-card__badges">
                {e.error_type ? (
                  <span className="uet-badge uet-badge--type">{e.error_type}</span>
                ) : null}
                {LEVEL_BADGES.includes(String(e.level || '').toUpperCase()) ? (
                  <span className="uet-badge uet-badge--level">
                    {String(e.level).toUpperCase()}
                  </span>
                ) : null}
                {e.source ? (
                  <span className="uet-badge uet-badge--source">{e.source}</span>
                ) : null}
                <span className="uet-badge uet-badge--freq">×{e.frequency || 1}</span>
                {e.mastered ? (
                  <span className="uet-badge uet-badge--mastered">Mastered</span>
                ) : null}
              </div>

              <div className="uet-card__texts">
                <p className="uet-card__line uet-card__line--wrong">
                  <span className="uet-card__tag">✗</span>
                  {e.original_text}
                </p>
                <p className="uet-card__line uet-card__line--right">
                  <span className="uet-card__tag">✓</span>
                  {e.corrected_text}
                </p>
              </div>

              {e.explanation ? (
                <p className="uet-card__explanation">{e.explanation}</p>
              ) : null}
              {e.suggestion ? (
                <p className="uet-card__suggestion">💡 {e.suggestion}</p>
              ) : null}

              <div className="uet-card__footer">
                <span className="uet-card__date">{formatDate(e.created_at)}</span>
                <div className="uet-card__actions">
                  {!e.mastered ? (
                    <button
                      type="button"
                      className="uet-btn uet-btn--soft"
                      onClick={() => handleMaster(e.id)}
                      disabled={masteringId === e.id}
                    >
                      {masteringId === e.id ? 'Saving…' : 'Mark as mastered'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="uet-btn uet-btn--primary"
                    onClick={() => handleGenerate(e)}
                    disabled={generatingId === e.id}
                  >
                    {generatingId === e.id
                      ? 'Generating…'
                      : exercisesByError[e.id]
                        ? 'Practise this mistake'
                        : 'Generate exercises'}
                  </button>
                </div>
              </div>

              {openExercisesId === e.id ? renderExercises(e) : null}
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .uet {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .uet__hero {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .uet__title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }
        .uet__subtitle {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }
        .uet__filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .uet__filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .uet__filter-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }
        .uet__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .uet-chip {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .uet-chip:hover {
          border-color: #c7d2fe;
        }
        .uet-chip--active {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
        }
        .uet__alert {
          margin: 0;
          padding: 10px 14px;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 0.85rem;
        }
        .uet__state {
          padding: 28px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          color: #64748b;
          text-align: center;
          font-size: 0.95rem;
        }
        .uet__state--error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #b91c1c;
        }
        .uet__empty {
          color: #475569;
        }
        .uet__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .uet-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 18px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }
        .uet-card--mastered {
          opacity: 0.75;
          background: #f8fafc;
        }
        .uet-card__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .uet-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }
        .uet-badge--type {
          background: #eef2ff;
          color: #4338ca;
        }
        .uet-badge--level {
          background: #ecfdf5;
          color: #047857;
        }
        .uet-badge--source {
          background: #fff7ed;
          color: #c2410c;
        }
        .uet-badge--freq {
          background: #f1f5f9;
          color: #475569;
        }
        .uet-badge--mastered {
          background: #dcfce7;
          color: #15803d;
        }
        .uet-card__texts {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .uet-card__line {
          margin: 0;
          display: flex;
          gap: 8px;
          font-size: 0.92rem;
          line-height: 1.4;
        }
        .uet-card__tag {
          font-weight: 800;
        }
        .uet-card__line--wrong {
          color: #b91c1c;
        }
        .uet-card__line--wrong .uet-card__tag {
          color: #dc2626;
        }
        .uet-card__line--right {
          color: #15803d;
        }
        .uet-card__line--right .uet-card__tag {
          color: #16a34a;
        }
        .uet-card__explanation {
          margin: 0;
          color: #334155;
          font-size: 0.86rem;
          line-height: 1.45;
        }
        .uet-card__suggestion {
          margin: 0;
          color: #6d28d9;
          font-size: 0.84rem;
          line-height: 1.4;
        }
        .uet-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .uet-card__date {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .uet-card__actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .uet-btn {
          border: none;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .uet-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .uet-btn--primary {
          background: #6366f1;
          color: #fff;
        }
        .uet-btn--primary:hover:not(:disabled) {
          background: #4f46e5;
        }
        .uet-btn--soft {
          background: #f1f5f9;
          color: #334155;
        }
        .uet-btn--soft:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .uet-btn--ghost {
          background: transparent;
          color: #64748b;
          padding: 4px 10px;
        }
        .uet-exercises {
          margin-top: 8px;
          padding: 14px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .uet-exercises__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .uet-exercises__head h4 {
          margin: 0;
          font-size: 1rem;
          color: #0f172a;
        }
        .uet-ex-block h5,
        .uet-ex-final h5 {
          margin: 0 0 8px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6366f1;
        }
        .uet-ex-list {
          margin: 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .uet-ex-q {
          margin: 0 0 6px;
          font-size: 0.88rem;
          color: #1e293b;
          font-weight: 600;
        }
        .uet-ex-options {
          margin: 0 0 6px;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          list-style: disc;
        }
        .uet-ex-opt {
          font-size: 0.84rem;
          color: #475569;
        }
        .uet-ex-opt--correct {
          color: #15803d;
          font-weight: 700;
        }
        .uet-ex-answer {
          margin: 0;
          font-size: 0.8rem;
          color: #15803d;
          font-weight: 600;
        }
        .uet-ex-final p {
          margin: 0;
          font-size: 0.86rem;
          color: #334155;
          line-height: 1.45;
        }
        .uet-empty-small {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }
        @media (max-width: 520px) {
          .uet__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
