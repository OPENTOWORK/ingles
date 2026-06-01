'use client';

import { useCallback, useEffect, useState } from 'react';
import { callDraloAi } from '@/lib/ai/draloAiClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { EXAM_COACH_TASK_TYPES } from '@/lib/ai/services/examCoachService';
import { REAL_LIFE_TASK_TYPES } from '@/lib/ai/services/realLifeCoachService';

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const PRESET_TEST_1 = {
  label: 'TEST 1 — Exam Coach / Writing (B1)',
  assistantType: 'exam',
  taskType: 'writing_correction',
  level: 'B1',
  situation: '',
  userInput:
    'I think technology are very important because help people in their lifes.',
};

const PRESET_TEST_2 = {
  label: 'TEST 2 — Real-Life / Role play (B2)',
  assistantType: 'realLife',
  taskType: 'role_play',
  level: 'B2',
  situation: 'Sales call with a difficult client',
  userInput: 'I work in sales. Act as a difficult client and start the conversation.',
};

export default function DraloAiTestPage() {
  const [assistantType, setAssistantType] = useState('exam');
  const [taskType, setTaskType] = useState('writing_correction');
  const [level, setLevel] = useState('B2');
  const [situation, setSituation] = useState('');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');

  const taskOptions = assistantType === 'exam' ? EXAM_COACH_TASK_TYPES : REAL_LIFE_TASK_TYPES;

  const loadHealth = useCallback(async () => {
    setHealthError('');
    try {
      const res = await fetch(buildClientApiUrl('/api/dralo-ai'), { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Health check failed (${res.status})`);
      setHealth(data);
    } catch (e) {
      setHealth(null);
      setHealthError(e?.message || 'No se pudo comprobar el servidor.');
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  function applyPreset(preset) {
    setAssistantType(preset.assistantType);
    setTaskType(preset.taskType);
    setLevel(preset.level);
    setSituation(preset.situation);
    setUserInput(preset.userInput);
    setError('');
    setResult('');
  }

  async function runRequest(payload) {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const text = await callDraloAi(payload);
      setResult(text);
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await runRequest({
      assistantType,
      taskType,
      level,
      situation: assistantType === 'realLife' ? situation : '',
      userInput,
    });
  }

  async function runPreset(preset) {
    applyPreset(preset);
    await runRequest({
      assistantType: preset.assistantType,
      taskType: preset.taskType,
      level: preset.level,
      situation: preset.situation,
      userInput: preset.userInput,
    });
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.35rem' }}>DRALO AI — Test lab</h1>
      <p style={{ color: '#4a5568', lineHeight: 1.5 }}>
        Verificación local de <strong>POST /api/dralo-ai</strong>. El navegador no llama a OpenAI
        directamente; solo al backend.
      </p>

      <section
        style={{
          marginTop: '1rem',
          padding: '0.85rem 1rem',
          background: health?.openaiConfigured ? '#f0fff4' : '#fff5f5',
          border: `1px solid ${health?.openaiConfigured ? '#9ae6b4' : '#feb2b2'}`,
          borderRadius: 8,
          fontSize: '0.9rem',
        }}
      >
        <strong>Estado del servidor</strong>
        {healthError ? (
          <p style={{ margin: '0.5rem 0 0', color: '#c53030' }}>{healthError}</p>
        ) : health ? (
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
            <li>
              OPENAI_API_KEY en servidor:{' '}
              <strong>{health.openaiConfigured ? 'sí (configurada)' : 'no'}</strong>
            </li>
            <li>
              Modelo: <code>{health.model}</code>
            </li>
            <li>
              Integración: <code>{health.integration}</code>
            </li>
            <li>
              Assistants (laboratorio):{' '}
              <strong>{health.assistantsEnabled ? 'activados' : 'desactivados'}</strong>
            </li>
          </ul>
        ) : (
          <p style={{ margin: '0.5rem 0 0' }}>Comprobando…</p>
        )}
        <button
          type="button"
          onClick={() => void loadHealth()}
          style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
        >
          Refrescar estado
        </button>
        <p style={{ margin: '0.65rem 0 0', color: '#718096', fontSize: '0.82rem' }}>
          Si cambias <code>.env.local</code>, reinicia el servidor: Ctrl+C → <code>npm run dev</code>
        </p>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runPreset(PRESET_TEST_1)}
          style={{ padding: '0.5rem 0.75rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}
        >
          {PRESET_TEST_1.label}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runPreset(PRESET_TEST_2)}
          style={{ padding: '0.5rem 0.75rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}
        >
          {PRESET_TEST_2.label}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
        <label>
          Assistant
          <select
            value={assistantType}
            onChange={(e) => {
              const v = e.target.value;
              setAssistantType(v);
              setTaskType(v === 'exam' ? 'writing_correction' : 'role_play');
            }}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            <option value="exam">exam — DRALO Exam Coach (LEVELS)</option>
            <option value="realLife">realLife — Real-Life Coach (DRALO AI)</option>
          </select>
        </label>

        <label>
          Level
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label>
          Task type
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            {taskOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {assistantType === 'realLife' ? (
          <label>
            Situation
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g. Sales call with a difficult client"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
        ) : null}

        <label>
          User input
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={6}
            required
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            placeholder="Student writing, role-play start message, exam generation brief…"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !userInput.trim()}
          style={{
            padding: '0.65rem 1rem',
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Calling OpenAI…' : 'Send (custom)'}
        </button>
      </form>

      {error ? (
        <p style={{ color: '#c53030', marginTop: '1rem', fontWeight: 600 }}>{error}</p>
      ) : null}

      {result ? (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
          }}
        >
          {result}
        </pre>
      ) : null}
    </main>
  );
}
