'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { withBasePath } from '@/lib/base-path';
import { SpeakingLayout } from '@/features/speaking/ui/components/SpeakingLayout';
import { ModeTabs } from '@/features/speaking/ui/components/ModeTabs';
import { VoiceControls } from '@/features/speaking/ui/components/VoiceControls';
import { TranscriptPanel, type ChatLine } from '@/features/speaking/ui/components/TranscriptPanel';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import type { MicroFeedback } from '@/features/speaking/domain/types';

const VALID = new Set(['a2', 'b1', 'b2', 'c1', 'c2']);

const PROMPTS: { id: string; label: string; text: string }[] = [
  {
    id: 'general',
    label: 'Personal & goals',
    text: 'Talk about your studies or work and why English matters to you.',
  },
  {
    id: 'place',
    label: 'Places',
    text: 'Describe a town or area you like spending time in and what you do there.',
  },
  {
    id: 'future',
    label: 'Plans',
    text: 'Discuss something you would like to achieve in the next year.',
  },
];

export default function SpeakingPracticePage() {
  const params = useParams();
  const slug = String(params?.cefr ?? '').toLowerCase();
  const okSlug = VALID.has(slug);
  const cefr = (okSlug ? slug.toUpperCase() : 'B2') as CefrLevel;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(PROMPTS[0].text);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [micro, setMicro] = useState<MicroFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState('');
  const media = useMediaRecorder();

  useEffect(() => {
    if (!okSlug) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(withBasePath('/api/speaking/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PRACTICE', cefr }),
      });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { sessionId: string };
      if (!cancelled) setSessionId(data.sessionId);
    })();
    return () => {
      cancelled = true;
    };
  }, [cefr, okSlug]);

  const sendTurn = useCallback(
    async (text: string, audio?: Blob) => {
      if (!sessionId) return;
      setLoading(true);
      setMicro(null);
      try {
        let res: Response;
        if (audio) {
          const form = new FormData();
          form.set('sessionId', sessionId);
          form.set('cefr', cefr);
          form.set('mode', 'PRACTICE' satisfies SpeakingMode as string);
          form.set('prompt', prompt);
          form.append('audio', audio, 'capture.webm');
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            body: form,
          });
        } else {
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              cefr,
              mode: 'PRACTICE' as SpeakingMode,
              prompt,
              text,
            }),
          });
        }
        const data = (await res.json()) as {
          assistantText: string;
          transcript: string;
          microFeedback: MicroFeedback | null;
        };
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
        setMicro(data.microFeedback);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, cefr, prompt],
  );

  if (!okSlug) {
    notFound();
  }

  return (
    <SpeakingLayout
      title="Practice mode"
      subtitle={`Level ${cefr} — coach-style dialogue + micro-feedback.`}
      backHref={`/niveles/speaking-lab/${slug}/`}
    >
      <ModeTabs cefr={slug} current="practice" />
      <div className="mb-4">
        <label htmlFor="prompt-select" className="text-sm text-slate-400">
          Context
        </label>
        <select
          id="prompt-select"
          value={PROMPTS.find((p) => p.text === prompt)?.id ?? 'general'}
          onChange={(e) => {
            const p = PROMPTS.find((x) => x.id === e.target.value);
            if (p) setPrompt(p.text);
          }}
          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          {PROMPTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-slate-400">{prompt}</p>
      </div>

      <TranscriptPanel lines={lines} />

      <div className="mt-6 space-y-4">
        <VoiceControls
          media={media}
          disabled={loading || !sessionId}
          onRecorded={async (blob) => {
            await sendTurn('', blob);
          }}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex-1 text-sm text-slate-400">
            Or type your answer
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              placeholder="Type here, then press Send"
            />
          </label>
          <button
            type="button"
            disabled={loading || !sessionId || !typed.trim()}
            onClick={async () => {
              const t = typed.trim();
              setTyped('');
              await sendTurn(t);
            }}
            className="self-end rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <FeedbackCards micro={micro} />
    </SpeakingLayout>
  );
}
