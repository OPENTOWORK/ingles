'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import { resolveB2ExamenId } from '@/utils/b2ResolveExam';
import { supabase } from '@/utils/supabaseClient';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { withBasePath } from '@/lib/base-path';
import { playExaminerAudio, stopExaminerAudio } from '@/utils/playExaminerAudio';
import ExaminerVoiceVisualizer from '@/components/b2/ExaminerVoiceVisualizer';
import { partInfo as b2SpeakingPartInfo } from '@/data/part-info/b2-speaking';
import {
  B2_SPEAKING_EXAM_PARTS,
  B2_SPEAKING_PART_MAX,
  B2_SPEAKING_PART_MIN,
  getB2SpeakingPartConfig,
} from '@/features/speaking/domain/b2-speaking-exam-parts';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import { getB2LongTurnPhotoUrls } from '@/data/b2-speaking-long-turn-photos';
import { sitePublicPath } from '@/utils/sitePublicPath';

const buttonStyle = {
  backgroundColor: '#c1f2cd',
  padding: '0.75rem 1.25rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  display: 'inline-block',
  textAlign: 'center',
};

function extractImageUrls(text = '') {
  const urls = [];
  const re = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp)|\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp))/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    urls.push(m[1]);
  }
  return urls.slice(0, 2).map((url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return sitePublicPath(url.startsWith('/') ? url : `/${url}`);
  });
}

function resolveLongTurnPhotos(taskContext, examSlot) {
  const fromDb = extractImageUrls(taskContext);
  if (fromDb.length >= 2) return fromDb;
  return getB2LongTurnPhotoUrls(examSlot);
}

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} props.loadingLabel
 * @param {string} props.refreshLabel
 */
function B2SpeakingExamPracticeInner({ title, subtitle, loadingLabel, refreshLabel }) {
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoring = useB2ExamScoringSession({
    partMin: B2_SPEAKING_PART_MIN,
    partMax: B2_SPEAKING_PART_MAX,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadParts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const partNames = Array.from(
        { length: B2_SPEAKING_PART_MAX - B2_SPEAKING_PART_MIN + 1 },
        (_, i) => `Parte ${B2_SPEAKING_PART_MIN + i} B2`,
      );
      const { data, error: partsError } = await supabase
        .from('levels_partes')
        .select('*')
        .in('nombre_parte', partNames);
      if (partsError) throw partsError;
      const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';
      const mapped = partNames
        .map((name) => (data || []).find((p) => p.nombre_parte === name))
        .filter(Boolean)
        .map((part) => {
          const num = Number(String(part.nombre_parte).match(/\d+/)?.[0] || 0);
          return {
            id: part.id,
            nombre: formatLevelsPartDisplayName(part.nombre_parte),
            descripcion: partDescription(part),
            partNumber: num,
          };
        });
      setPartsData(mapped);
      setSelectedPartId((prev) => {
        if (prev && mapped.some((p) => p.id === prev)) return prev;
        return mapped[0]?.id ?? null;
      });
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar las partes de Speaking.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParts();
  }, [loadParts]);

  useEffect(() => () => stopExaminerAudio(), []);

  const selectedPart = useMemo(
    () => partsData.find((p) => p.id === selectedPartId),
    [partsData, selectedPartId],
  );

  const partNumber = selectedPart?.partNumber ?? 0;
  const b2PartCfg = getB2PartScoring(partNumber);
  const savedPartScore = scoring.progressBySlot[examSlot]?.parts?.[partNumber];

  useEffect(() => {
    if (!scoring.examPracticeOpen || !scoring.b2LevelId) return;
    void (async () => {
      const { examenId } = await resolveB2ExamenId(supabase, scoring.b2LevelId, { slot: examSlot });
      if (examenId) scoring.setExamenContext(examenId);
    })();
  }, [examSlot, scoring.examPracticeOpen, scoring.b2LevelId]);

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    scoring.resetPartNoticeOnPartChange(examSlot, partNumber, scoring.progressBySlot);
  }, [examSlot, partNumber, selectedPart?.id, scoring.examPracticeOpen]);

  const scorePanelProps = {
    correctCount: savedPartScore?.correct ?? 0,
    totalSlots: b2PartCfg?.total ?? 5,
    passingCount: b2PartCfg?.passing ?? 3,
  };

  const handleSaveSpeakingPart = useCallback(
    ({ correct, total, passed }) => {
      if (!selectedPart?.id || !scoring.examPracticeOpen) return;
      void scoring.saveWritingOrSpeakingScore({
        examSlot,
        partNumber: selectedPart.partNumber,
        preguntaId: selectedPart.id,
        parteId: selectedPart.id,
        correct,
        total,
        passed,
      });
    },
    [scoring, examSlot, selectedPart],
  );

  return (
    <B2ExamPracticeLayout examPracticeOpen={scoring.examPracticeOpen}>
      <B2ExamPracticeChrome
        examSlot={examSlot}
        onSelectExam={(n) => scoring.handleSelectExam(selectExamSlot, n)}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={scoring.partsInPaper}
        examPracticeOpen={scoring.examPracticeOpen}
        title={title}
        subtitle={subtitle}
        timerLabel={timerLabel}
        refreshLabel={refreshLabel}
        loading={loading}
        onRefresh={() => loadParts()}
        partScoreMetrics={scorePanelProps}
        partFinishNotice={scoring.partFinishNotice}
        partsData={!loading && !error ? partsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={(part) => setSelectedPartId(part.id)}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
      >
      <section style={{ maxWidth: '820px', margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center' }}>{loadingLabel}</p>}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && selectedPart ? (
          <B2SpeakingPartSession
            key={`${selectedPart.id}-${examSlot}`}
            part={selectedPart}
            examSlot={examSlot}
            onSavePartScore={handleSaveSpeakingPart}
            partScoring={b2PartCfg}
          />
        ) : null}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <Link
          href={`/niveles/b2/exam-1?examen=${examSlot}`}
          style={{ color: '#047857', fontWeight: 'bold', textDecoration: 'none' }}
        >
          ← Full Exam
        </Link>
        <Link href="/niveles/b2" style={{ color: '#0070f3', fontWeight: 'bold' }}>
          ← Back to B2 Overview
        </Link>
      </div>
      </B2ExamPracticeChrome>
    </B2ExamPracticeLayout>
  );
}

/** @param {{ part: { id: string, nombre: string, descripcion: string, partNumber: number }, examSlot: number, onSavePartScore?: (p: { correct: number, total: number, passed: boolean }) => void, partScoring?: { total: number, passing: number } | null }} props */
function B2SpeakingPartSession({ part, examSlot, onSavePartScore, partScoring }) {
  const partConfig = getB2SpeakingPartConfig(part.partNumber);
  const cambridgeKey = String(part.partNumber - 13);
  const staticInfo = b2SpeakingPartInfo[cambridgeKey];

  const [sessionId, setSessionId] = useState(null);
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('intro');
  const [longTurnLeft, setLongTurnLeft] = useState(partConfig?.longTurnSeconds ?? 60);
  const [typed, setTyped] = useState('');
  const [apiError, setApiError] = useState('');
  const media = useMediaRecorder();
  /** false al desmontar o cambiar de parte: no actualizar estado ni reproducir audio. */
  const aliveRef = useRef(true);
  const abortRef = useRef(null);

  const taskContext = part.descripcion || partConfig?.instructions || '';
  const photoUrls = useMemo(
    () => resolveLongTurnPhotos(taskContext, examSlot),
    [taskContext, examSlot],
  );

  const isAlive = useCallback(() => aliveRef.current, []);

  const applyAssistantTurn = useCallback(
    async (data) => {
      if (!isAlive()) return;
      const assistantText = data.assistantText || '';
      setLines((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      setHistory((h) => [...h, { role: 'assistant', content: assistantText }]);
      if (!isAlive()) return;
      await playExaminerAudio({
        base64: data.assistantAudioBase64,
        mime: data.assistantAudioMime,
        text: assistantText,
      });
    },
    [isAlive],
  );

  const callTurn = useCallback(
    async (payload, sid = sessionId, historySnapshot = history) => {
      if (!sid || !isAlive()) return null;
      const signal = abortRef.current?.signal;
      if (isAlive()) {
        setLoading(true);
        setApiError('');
      }
      try {
        let res;
        if (payload.audio) {
          const form = new FormData();
          form.set('sessionId', sid);
          form.set('cefr', 'B2');
          form.set('mode', 'EXAM');
          form.set('prompt', taskContext);
          form.set('history', JSON.stringify(historySnapshot));
          form.set('examPartIndex', String(partConfig?.blueprintIndex ?? 0));
          form.set('b2PartNumber', String(part.partNumber));
          form.set('taskContext', taskContext);
          if (payload.isOpening) form.set('isOpening', 'true');
          form.append('audio', payload.audio, 'capture.webm');
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            body: form,
            signal,
          });
        } else {
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              cefr: 'B2',
              mode: 'EXAM',
              prompt: taskContext,
              history: historySnapshot,
              text: payload.text ?? '',
              examPartIndex: partConfig?.blueprintIndex ?? 0,
              b2PartNumber: part.partNumber,
              taskContext,
              isOpening: Boolean(payload.isOpening),
            }),
            signal,
          });
        }
        if (!isAlive()) return null;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error en el turno de speaking.');
        }
        return await res.json();
      } catch (e) {
        if (e?.name === 'AbortError') return null;
        if (isAlive()) setApiError(e?.message || 'Error de conexión.');
        return null;
      } finally {
        if (isAlive()) setLoading(false);
      }
    },
    [sessionId, history, taskContext, part.partNumber, partConfig?.blueprintIndex, isAlive],
  );

  useEffect(() => {
    aliveRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    stopExaminerAudio();

    setSessionId(null);
    setLines([]);
    setHistory([]);
    setPhase('intro');
    setLongTurnLeft(partConfig?.longTurnSeconds ?? 60);
    setApiError('');
    setLoading(true);

    const run = async () => {
      try {
        const sessionRes = await fetch(withBasePath('/api/speaking/session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'EXAM', cefr: 'B2' }),
          signal: ac.signal,
        });
        if (!sessionRes.ok) throw new Error('No se pudo iniciar la sesión de speaking.');
        const { sessionId: newSid } = await sessionRes.json();
        if (!aliveRef.current) return;
        setSessionId(newSid);

        const turnRes = await fetch(withBasePath('/api/speaking/turn'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: newSid,
            cefr: 'B2',
            mode: 'EXAM',
            prompt: taskContext,
            history: [],
            text: '',
            examPartIndex: partConfig?.blueprintIndex ?? 0,
            b2PartNumber: part.partNumber,
            taskContext,
            isOpening: true,
          }),
          signal: ac.signal,
        });
        if (!turnRes.ok) {
          const err = await turnRes.json().catch(() => ({}));
          throw new Error(err.error || 'Error al cargar la pregunta del examinador.');
        }
        const data = await turnRes.json();
        if (!aliveRef.current || !data) return;

        if (data.assistantText) {
          const assistantText = data.assistantText;
          setLines([{ role: 'assistant', content: assistantText }]);
          setHistory([{ role: 'assistant', content: assistantText }]);
          if (!aliveRef.current) return;
          await playExaminerAudio({
            base64: data.assistantAudioBase64,
            mime: data.assistantAudioMime,
            text: assistantText,
          });
          if (!aliveRef.current) return;
          setPhase(partConfig?.uiMode === 'long_turn' ? 'await_long_turn' : 'dialogue');
        }
      } catch (e) {
        if (e?.name === 'AbortError') return;
        if (aliveRef.current) setApiError(e?.message || 'Error');
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    };

    void run();

    return () => {
      aliveRef.current = false;
      ac.abort();
      stopExaminerAudio();
      if (media.isRecording) void media.stop();
    };
  }, [
    part.id,
    examSlot,
    taskContext,
    part.partNumber,
    partConfig?.blueprintIndex,
    partConfig?.longTurnSeconds,
    partConfig?.uiMode,
  ]);

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft <= 0) return;
    const t = window.setTimeout(() => setLongTurnLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, longTurnLeft]);

  const submitCandidateTurn = useCallback(
    async (audioOrText) => {
      if (!isAlive()) return;
      let data;
      if (audioOrText instanceof Blob) {
        data = await callTurn({ audio: audioOrText });
      } else {
        const text = String(audioOrText || '').trim();
        if (!text) return;
        setLines((prev) => [...prev, { role: 'user', content: text }]);
        setHistory((h) => [...h, { role: 'user', content: text }]);
        data = await callTurn({ text });
      }
      if (!isAlive() || !data) return;
      if (data.transcript && audioOrText instanceof Blob) {
        setLines((prev) => [...prev, { role: 'user', content: data.transcript }]);
        setHistory((h) => [...h, { role: 'user', content: data.transcript }]);
      }
      if (data.assistantText) await applyAssistantTurn(data);
    },
    [applyAssistantTurn, callTurn, isAlive],
  );

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft !== 0 || !media.isRecording) return;
    void (async () => {
      if (!aliveRef.current) return;
      const blob = await media.stop();
      if (!aliveRef.current || !blob?.size) return;
      await submitCandidateTurn(blob);
      if (aliveRef.current) setPhase('dialogue');
    })();
  }, [phase, longTurnLeft, media.isRecording, submitCandidateTurn]);

  const onMicClick = async () => {
    if (loading || !sessionId) return;
    if (partConfig?.uiMode === 'long_turn' && phase === 'await_long_turn') return;
    if (media.isRecording) {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
    } else {
      await media.start();
    }
  };

  const startLongTurn = () => {
    setPhase('long_turn');
    setLongTurnLeft(partConfig?.longTurnSeconds ?? 60);
    void media.start();
  };

  const finishLongTurn = async () => {
    if (media.isRecording) {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
    }
    setPhase('dialogue');
  };

  const userLines = lines.filter((l) => l.role === 'user');
  const speakingTotal = partScoring?.total ?? 5;
  const speakingPassing = partScoring?.passing ?? 3;

  const saveSpeakingScore = () => {
    if (!onSavePartScore || userLines.length === 0) return;
    const correct = Math.min(speakingTotal, userLines.length);
    onSavePartScore({
      correct,
      total: speakingTotal,
      passed: correct >= speakingPassing,
    });
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0 }}>{part.nombre}</h2>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1a365d' }}>
        {partConfig?.title || 'Speaking'}
      </p>
      <p style={{ color: '#4a5568', lineHeight: 1.65, fontSize: '0.95rem' }}>
        {part.descripcion || partConfig?.instructions}
      </p>
      {staticInfo?.tips ? (
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.75rem' }}>
          <strong>Consejo:</strong> {staticInfo.tips}
        </p>
      ) : null}

      {partConfig?.uiMode === 'long_turn' ? (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                minHeight: '140px',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {photoUrls[i] ? (
                <img
                  src={photoUrls[i]}
                  alt={i === 0 ? 'Photograph A' : 'Photograph B'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Photo {i === 0 ? 'A' : 'B'}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {partConfig?.uiMode === 'collaborative' ? (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '10px',
            fontSize: '0.92rem',
            lineHeight: 1.6,
          }}
        >
          Trabaja con el examinador como si fuera tu compañero: intercambia ideas y intentad llegar a una
          decisión.
        </div>
      ) : null}

      <ExaminerVoiceVisualizer isLoading={loading} />

      {userLines.length > 0 ? (
        <div
          style={{
            marginTop: '1rem',
            maxHeight: '160px',
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem',
            background: '#f8fafc',
          }}
        >
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
            Tus respuestas
          </p>
          {userLines.map((l, i) => (
            <p key={`${i}-user`} style={{ margin: '0.35rem 0', fontSize: '0.9rem', color: '#1e293b' }}>
              {l.content}
            </p>
          ))}
        </div>
      ) : null}

      {phase === 'long_turn' ? (
        <p style={{ marginTop: '0.75rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.25rem' }}>
          Tiempo: {String(Math.floor(longTurnLeft / 60)).padStart(2, '0')}:
          {String(longTurnLeft % 60).padStart(2, '0')}
        </p>
      ) : null}

      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
        {partConfig?.uiMode === 'long_turn' && phase === 'await_long_turn' ? (
          <button
            type="button"
            onClick={startLongTurn}
            disabled={loading}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#047857',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Iniciar mi turno (1 min)
          </button>
        ) : null}
        {partConfig?.uiMode === 'long_turn' && phase === 'long_turn' ? (
          <button
            type="button"
            onClick={() => finishLongTurn()}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '9999px',
              border: '1px solid #2f855a',
              background: '#f0fff4',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            He terminado
          </button>
        ) : null}
        {(partConfig?.uiMode !== 'long_turn' || phase === 'dialogue') && (
          <button
            type="button"
            onClick={onMicClick}
            disabled={loading || !sessionId}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: media.isRecording ? '#dc2626' : '#0284c7',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {media.isRecording ? '■ Parar y enviar' : '🎤 Hablar'}
          </button>
        )}
        <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
          {loading ? 'Procesando…' : media.isRecording ? 'Grabando…' : 'Pulsa para responder'}
        </span>
      </div>

      {(partConfig?.uiMode !== 'long_turn' || phase === 'dialogue') && (
        <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="O escribe tu respuesta"
            style={{
              flex: '1 1 200px',
              borderRadius: '8px',
              border: '1px solid #cbd5e0',
              padding: '0.6rem 0.75rem',
            }}
          />
          <button
            type="button"
            disabled={loading || !typed.trim()}
            onClick={async () => {
              const t = typed.trim();
              setTyped('');
              await submitCandidateTurn(t);
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e0',
              background: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Enviar texto
          </button>
        </div>
      )}

      {media.error ? (
        <p style={{ color: '#b45309', marginTop: '0.5rem', fontSize: '0.88rem' }}>{media.error}</p>
      ) : null}
      {apiError ? (
        <p style={{ color: '#c53030', marginTop: '0.5rem', fontSize: '0.88rem' }}>{apiError}</p>
      ) : null}

      {onSavePartScore && userLines.length > 0 ? (
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={saveSpeakingScore}
            style={{
              padding: '0.65rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid #2f855a',
              background: '#f0fff4',
              color: '#1a202c',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Guardar puntuación de esta parte ({Math.min(speakingTotal, userLines.length)}/{speakingTotal})
          </button>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Necesitas al menos {speakingPassing} interacciones completadas para aprobar (máx. {speakingTotal}).
          </p>
        </div>
      ) : null}

      {!process.env.NEXT_PUBLIC_OPENAI_HINT && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          La voz del examinador usa OpenAI en el servidor (OPENAI_API_KEY). Sin clave, se usa la voz del
          navegador.
        </p>
      )}
    </div>
  );
}

export default function B2SpeakingExamPractice(props) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Cargando práctica de speaking…
        </main>
      }
    >
      <B2SpeakingExamPracticeInner {...props} />
    </Suspense>
  );
}
