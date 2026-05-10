'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { withBasePath } from '@/lib/base-path';
import { SpeakingLayout } from '@/features/speaking/ui/components/SpeakingLayout';
import { ModeTabs } from '@/features/speaking/ui/components/ModeTabs';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';

const VALID = new Set(['a2', 'b1', 'b2', 'c1', 'c2']);

export default function SpeakingCorrectionPage() {
  const params = useParams();
  const slug = String(params?.cefr ?? '').toLowerCase();
  const okSlug = VALID.has(slug);
  const cefr = (okSlug ? slug.toUpperCase() : 'B2') as CefrLevel;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [taskPrompt, setTaskPrompt] = useState(
    'Give your opinion on whether teenagers should have part-time jobs.',
  );
  const [report, setReport] = useState<CorrectionReportPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!okSlug) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(withBasePath('/api/speaking/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'CORRECTION', cefr }),
      });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { sessionId: string };
      if (!cancelled) setSessionId(data.sessionId);
    })();
    return () => {
      cancelled = true;
    };
  }, [cefr, okSlug]);

  if (!okSlug) notFound();

  return (
    <SpeakingLayout
      title="Correction mode"
      subtitle={`Level ${cefr} — structured feedback (grammar, vocabulary, fluency, pronunciation, task).`}
      backHref={`/niveles/speaking-lab/${slug}/`}
    >
      <ModeTabs cefr={slug} current="correction" />

      <label className="block text-sm text-slate-400">
        Task / question (optional)
        <textarea
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="mt-4 block text-sm text-slate-400">
        Your answer
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          placeholder="Write or paste what you said…"
        />
      </label>

      <button
        type="button"
        disabled={loading || !sessionId || !text.trim()}
        onClick={async () => {
          if (!sessionId) return;
          setLoading(true);
          setReport(null);
          try {
            const res = await fetch(withBasePath('/api/speaking/evaluate'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                cefr,
                mode: 'CORRECTION' satisfies SpeakingMode as SpeakingMode,
                text: text.trim(),
                taskPrompt: taskPrompt.trim(),
              }),
            });
            const data = (await res.json()) as { report: CorrectionReportPayload };
            setReport(data.report);
          } finally {
            setLoading(false);
          }
        }}
        className="mt-4 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
      >
        {loading ? 'Analysing…' : 'Get detailed feedback'}
      </button>

      <FeedbackCards report={report} />
    </SpeakingLayout>
  );
}
