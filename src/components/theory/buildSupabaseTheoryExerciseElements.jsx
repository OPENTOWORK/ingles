'use client';

import { useState } from 'react';
import { MultipleChoiceExercise } from '@/components/theory/ExerciseComponents';
import TheoryCorrectAnswerFeedback from '@/components/theory/TheoryCorrectAnswerFeedback';
import TheoryExerciseReportError from '@/components/theory/TheoryExerciseReportError';
import TheoryExerciseShell from '@/components/theory/TheoryExerciseShell';
import { normalizeTeoriaClosedOpciones } from '@/lib/levelsTeoriaExerciseTypes';

function normalizeForCompare(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function OpenTextExercise({
  question,
  rubric,
  modelAnswer,
  onComplete,
  onAdvance,
  engagementMode = false,
  isLastStep = false,
  isCompleted = false,
  reportExerciseId = '',
  reportQuestion = '',
  topicHref = '',
  cefrLevel = '',
}) {
  const [value, setValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    const learner = normalizeForCompare(value);
    const model = normalizeForCompare(modelAnswer);
    const ok =
      learner.length > 0 &&
      (learner === model ||
        (model.length > 8 && (learner.includes(model) || model.includes(learner))));
    const points = ok ? 100 : 0;
    setScore(points);
    setShowResult(true);
    if (!engagementMode) {
      onComplete?.(points);
    }
  };

  const handleContinue = () => {
    onComplete?.(score);
    onAdvance?.(score);
  };

  return (
    <div
      style={{
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.5rem',
        background: isCompleted ? '#f0fff4' : 'white',
        borderColor: isCompleted ? '#68d391' : '#e2e8f0',
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d3748', margin: '0 0 1rem' }}>
        {question}
      </h3>
      {rubric ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem' }}>{rubric}</p>
      ) : null}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        disabled={showResult}
        placeholder="Write your answer in English…"
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          fontSize: '1rem',
          resize: 'vertical',
        }}
      />
      {!showResult ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          style={{
            marginTop: '1rem',
            padding: '0.65rem 1.25rem',
            background: value.trim() ? '#667eea' : '#e2e8f0',
            color: value.trim() ? 'white' : '#a0aec0',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: value.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Check Answer
        </button>
      ) : (
        <>
          {modelAnswer?.trim() ? (
            <TheoryCorrectAnswerFeedback
              isCorrect={score >= 100}
              answer={modelAnswer}
              explanation={score >= 100 ? '' : rubric}
            />
          ) : null}
          <div className="theory-exercise-actions" style={{ marginTop: '1rem' }}>
            {engagementMode ? (
              <button
                type="button"
                onClick={handleContinue}
                className="theory-exercise-actions__primary"
                style={{
                padding: '0.75rem 1.75rem',
                background: score >= 100 ? '#16a34a' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow:
                  score >= 100
                    ? '0 6px 16px rgba(22, 163, 74, 0.35)'
                    : '0 6px 16px rgba(220, 38, 38, 0.35)',
              }}
              >
                {isLastStep ? 'Finish ✓' : 'Continue →'}
              </button>
            ) : (
              <p
                className="theory-exercise-actions__primary"
                style={{ margin: 0, color: score === 100 ? '#276749' : '#c53030' }}
              >
                {score === 100 ? '✅ Correct' : '❌ Review the model answer and try again.'}
              </p>
            )}
          </div>
          <div className="theory-exercise-report-row">
            <TheoryExerciseReportError
              exerciseId={reportExerciseId}
              question={reportQuestion || question}
              topicHref={topicHref}
              cefrLevel={cefrLevel}
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * @param {import('@/lib/fetchTeoriaExercisesForTopic').TeoriaExerciseDto[]} exercises
 */
export function buildSupabaseTheoryExerciseElements(exercises) {
  return (exercises || [])
    .map((ex) => {
      const exerciseKey = `supabase:${ex.id}`;
      const colloquialLabel = ex.tipoColloquialLabel || ex.tipoLabel || 'Exercise';

      if (ex.answerMode === 'open') {
      return (
        <TheoryExerciseShell
          key={exerciseKey}
          typeLabel={colloquialLabel}
          colloquialLabel={colloquialLabel}
          reportExerciseId={ex.id}
          reportQuestion={ex.pregunta}
        >
          <OpenTextExercise
            question={ex.pregunta}
            rubric={ex.instruction || ex.respuestaAbiertaDescripcion}
            modelAnswer={ex.respuestaAbierta || ''}
          />
        </TheoryExerciseShell>
      );
      }

      const opciones = normalizeTeoriaClosedOpciones(
        ex.tipoNum,
        (ex.opciones || []).filter((o) => o.text),
      );
      if (!opciones.length) return null;

      const correctIndex = Math.max(
        0,
        opciones.findIndex((o) => o.correcta),
      );
      const options = opciones.map((o) => o.text);
      const explanation = ex.instruction || undefined;

      return (
        <TheoryExerciseShell
          key={exerciseKey}
          typeLabel={colloquialLabel}
          colloquialLabel={colloquialLabel}
          reportExerciseId={ex.id}
          reportQuestion={ex.pregunta}
        >
          <MultipleChoiceExercise
            question={ex.pregunta}
            options={options}
            correctAnswer={correctIndex}
            explanation={explanation}
          />
        </TheoryExerciseShell>
      );
    })
    .filter(Boolean);
}
