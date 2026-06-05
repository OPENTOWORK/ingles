'use client';

import { useState } from 'react';
import {
  STUDY_PLAN_GOALS,
  STUDY_PLAN_HOUR_OPTIONS,
  STUDY_PLAN_SKILLS,
  STUDY_PLAN_SURVEY_STEPS,
} from '@/data/studyPlanSurveyConfig';
import styles from './StudyPlanSurvey.module.css';

function toggleInList(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function buildPreviewPlan({
  placementLevel,
  examGoalDate,
  hoursPerWeek,
  studyGoals,
  strengths,
  weaknesses,
  otherNotes,
}) {
  return {
    placement_level: placementLevel,
    exam_goal_date: examGoalDate,
    hours_per_week: hoursPerWeek,
    study_goals: studyGoals,
    strengths,
    weaknesses,
    other_notes: otherNotes,
    completed_at: new Date().toISOString(),
  };
}

export default function StudyPlanSurvey({
  placementLevel,
  placementBreakdown,
  accessToken,
  onComplete,
  onSkip,
  compact = false,
  previewMode = false,
}) {
  const [step, setStep] = useState(0);
  const [studyGoals, setStudyGoals] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(7);
  const [examGoalDate, setExamGoalDate] = useState('');
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [otherNotes, setOtherNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const current = STUDY_PLAN_SURVEY_STEPS[step];
  const progress = ((step + 1) / STUDY_PLAN_SURVEY_STEPS.length) * 100;

  const canNext = () => {
    if (current.id === 'goals') return studyGoals.length > 0;
    if (current.id === 'hours') return hoursPerWeek > 0;
    if (current.id === 'exam') return Boolean(examGoalDate);
    if (current.id === 'weaknesses') return weaknesses.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < STUDY_PLAN_SURVEY_STEPS.length - 1) {
      setStep(step + 1);
      setError('');
      return;
    }

    if (previewMode) {
      onComplete?.(
        buildPreviewPlan({
          placementLevel,
          examGoalDate,
          hoursPerWeek,
          studyGoals,
          strengths,
          weaknesses,
          otherNotes,
        }),
      );
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/plan-objetivos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          placementLevel,
          placementBreakdown,
          examGoalDate,
          hoursPerWeek,
          studyGoals,
          strengths,
          weaknesses,
          otherNotes,
          surveyData: {
            studyGoals,
            hoursPerWeek,
            examGoalDate,
            strengths,
            weaknesses,
            otherNotes,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Could not save the survey.');
        return;
      }
      onComplete?.(json.plan);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {!compact && (
        <p className="text-sm text-indigo-700 font-medium mb-3">
          Placement level: <strong>{placementLevel || '—'}</strong>
          {previewMode && (
            <span className="text-amber-700"> (preview example)</span>
          )}
        </p>
      )}
      <div className={styles.progress} aria-hidden>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>{current.title}</h2>
        <p className={styles.desc}>{current.desc}</p>

        {current.id === 'goals' && (
          <div className={styles.options}>
            {STUDY_PLAN_GOALS.map((g) => (
              <label
                key={g.id}
                className={`${styles.option} ${studyGoals.includes(g.id) ? styles.optionSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={studyGoals.includes(g.id)}
                  onChange={() => setStudyGoals((prev) => toggleInList(prev, g.id))}
                />
                <span className={styles.optionLabel}>{g.name}</span>
              </label>
            ))}
          </div>
        )}

        {current.id === 'hours' && (
          <div className={styles.hoursGrid}>
            {STUDY_PLAN_HOUR_OPTIONS.map((h) => (
              <button
                key={h.value}
                type="button"
                className={`${styles.hourBtn} ${hoursPerWeek === h.value ? styles.hourBtnActive : ''}`}
                onClick={() => setHoursPerWeek(h.value)}
              >
                {h.label}
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginTop: 4 }}>
                  {h.hint}
                </span>
              </button>
            ))}
          </div>
        )}

        {current.id === 'exam' && (
          <input
            type="date"
            className={styles.dateInput}
            value={examGoalDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setExamGoalDate(e.target.value)}
            aria-label="Target exam date"
          />
        )}

        {current.id === 'strengths' && (
          <div className={styles.options}>
            {STUDY_PLAN_SKILLS.map((s) => (
              <label
                key={s.id}
                className={`${styles.option} ${strengths.includes(s.id) ? styles.optionSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={strengths.includes(s.id)}
                  onChange={() => setStrengths((prev) => toggleInList(prev, s.id))}
                />
                <span className={styles.optionLabel}>{s.name}</span>
              </label>
            ))}
          </div>
        )}

        {current.id === 'weaknesses' && (
          <div className={styles.options}>
            {STUDY_PLAN_SKILLS.map((s) => (
              <label
                key={s.id}
                className={`${styles.option} ${weaknesses.includes(s.id) ? styles.optionSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={weaknesses.includes(s.id)}
                  onChange={() => setWeaknesses((prev) => toggleInList(prev, s.id))}
                />
                <span className={styles.optionLabel}>{s.name}</span>
              </label>
            ))}
          </div>
        )}

        {current.id === 'notes' && (
          <textarea
            className={styles.textarea}
            placeholder="E.g. I can only study in the evenings, I have B2 First in June…"
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
          />
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions}>
          <span className={styles.stepHint}>
            Step {step + 1} of {STUDY_PLAN_SURVEY_STEPS.length}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {step > 0 && (
              <button type="button" className={styles.btnSecondary} onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {onSkip && step === 0 && !previewMode && (
              <button type="button" className={styles.btnSecondary} onClick={onSkip}>
                Later
              </button>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!canNext() || saving}
              onClick={handleNext}
            >
              {previewMode
                ? step === STUDY_PLAN_SURVEY_STEPS.length - 1
                  ? 'View preview summary'
                  : 'Next'
                : saving
                  ? 'Saving…'
                  : step === STUDY_PLAN_SURVEY_STEPS.length - 1
                    ? 'Save survey'
                    : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
