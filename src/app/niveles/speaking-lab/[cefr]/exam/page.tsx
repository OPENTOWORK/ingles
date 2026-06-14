'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { withBasePath } from '@/lib/base-path';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import { SpeakingLayout } from '@/features/speaking/ui/components/SpeakingLayout';
import { ModeTabs } from '@/features/speaking/ui/components/ModeTabs';
import { TranscriptPanel, type ChatLine } from '@/features/speaking/ui/components/TranscriptPanel';
import { VoiceControls } from '@/features/speaking/ui/components/VoiceControls';
import { ExamTimer } from '@/features/speaking/ui/components/ExamTimer';
import { PartStepper } from '@/features/speaking/ui/components/PartStepper';
import { ExaminerPanel } from '@/features/speaking/ui/components/ExaminerPanel';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';

const VALID = new Set(['a2', 'b1', 'b2', 'c1', 'c2']);

export default function SpeakingExamPage() {
  const params = useParams();
  const slug = String(params?.cefr ?? '').toLowerCase();
  const okSlug = VALID.has(slug);
  const blueprint = okSlug ? getExamBlueprint(slug.toUpperCase() as CefrLevel) : getExamBlueprint('B2');
  const cefr = blueprint.cefr;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partIndex, setPartIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState<CorrectionReportPayload | null>(null);
  const [typed, setTyped] = useState('');
  const media = useMediaRecorder();

  const currentPart = blueprint.parts[partIndex] ?? blueprint.parts[0];
  const promptStub = currentPart?.instructions ?? '';

  useEffect(() => {
    if (!okSlug) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(withBasePath('/api/speaking/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'EXAM', cefr }),
      });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { sessionId: string };
      if (!cancelled) setSessionId(data.sessionId);
    })();
    return () => {
      cancelled = true;
    };
  }, [cefr, okSlug]);

  const submitTurn = useCallback(
    async (text: string, audio?: Blob) => {
      if (!sessionId || finished) return;
      setLoading(true);
      try {
        let res: Response;
        if (audio) {
          const form = new FormData();
          form.set('sessionId', sessionId);
          form.set('cefr', cefr);
          form.set('mode', 'EXAM');
          form.set('prompt', promptStub);
          form.set('history', JSON.stringify(history));
          form.set('examPartIndex', String(partIndex));
          form.append('audio', audio, 'capture.webm');
          res = await fetch(withBasePath('/api/speaking/turn'), { method: 'POST', body: form });
        } else {
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              cefr,
              mode: 'EXAM' as SpeakingMode,
              prompt: promptStub,
              history,
              text,
              examPartIndex: partIndex,
            }),
          });
        }
        const data = (await res.json()) as { transcript: string; assistantText: string };
        setLines((prev) => [
          ...prev,
          { role: 'user', content: data.transcript },
          { role: 'assistant', content: data.assistantText },
        ]);
        setHistory((h) => [
          ...h,
          { role: 'user', content: data.transcript },
          { role: 'assistant', content: data.assistantText },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, cefr, promptStub, history, partIndex, finished],
  );

  const finalReport = useCallback(async () => {
    if (!sessionId) return;
    const userOnly = lines.filter((l) => l.role === 'user').map((l) => l.content);
    const combinedTranscript = userOnly.join('\n\n');
    setLoading(true);
    try {
      const res = await fetch(withBasePath('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          cefr,
          mode: 'EXAM' satisfies SpeakingMode as SpeakingMode,
          combinedTranscript,
        }),
      });
      const data = (await res.json()) as {
        report?: CorrectionReportPayload;
        error?: boolean | string;
        code?: string;
        message?: string;
      };
      if (!res.ok || data.error === true) {
        throw new Error(
          data.message ||
            (typeof data.error === 'string' ? data.error : 'Could not generate feedback'),
        );
      }
      if (!data.report) throw new Error('Could not generate feedback');
      setReport(data.report);
      setFinished(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId, cefr, lines]);

  if (!okSlug) notFound();

  const lastAssistant = [...lines].reverse().find((l) => l.role === 'assistant');

  return (
    <SpeakingLayout
      title="Exam simulation"
      subtitle={`${cefr} — examiner role only until the final report.`}
      backHref={`/niveles/speaking-lab/${slug}/`}
    >
      <p className="mb-4 text-sm text-slate-400">
        Alpha: 3 speaking exam feedbacks per day.
      </p>
      <ModeTabs cefr={slug} current="exam" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PartStepper parts={blueprint.parts} currentIndex={partIndex} />
        <ExamTimer
          key={`${partIndex}-${timerKey}`}
          seconds={currentPart?.suggestedTimeSec ?? 120}
          resetKey={timerKey}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TranscriptPanel lines={lines} />
          <div className="mt-4 space-y-4">
            <VoiceControls
              media={media}
              disabled={loading || !sessionId || finished}
              onRecorded={(blob) => submitTurn('', blob)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Or type your answer"
              />
              <button
                type="button"
                disabled={loading || !typed.trim() || finished}
                onClick={async () => {
                  const t = typed.trim();
                  setTyped('');
                  await submitTurn(t);
                }}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        <ExaminerPanel
          title={currentPart?.name ?? 'Part'}
          instructions={currentPart?.instructions ?? ''}
          lastPrompt={lastAssistant?.content}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={partIndex >= blueprint.parts.length - 1 || finished}
          onClick={() => {
            setPartIndex((i) => Math.min(i + 1, blueprint.parts.length - 1));
            setTimerKey((k) => k + 1);
          }}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:opacity-40"
        >
          Next part
        </button>
        <button
          type="button"
          disabled={loading || lines.length === 0 || finished}
          onClick={() => finalReport()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
        >
          End exam & get report
        </button>
      </div>

      {finished ? <FeedbackCards report={report} /> : null}
    </SpeakingLayout>
  );
}
