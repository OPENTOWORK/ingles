'use client';

import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';
import type { MicroFeedback } from '@/features/speaking/domain/types';
import { formatB2SpeakingScoreLine } from '@/features/speaking/domain/b2-speaking-score';

type Props = {
  micro?: MicroFeedback | null;
  report?: CorrectionReportPayload | null;
};

export function FeedbackCards({ micro, report }: Props) {
  if (!micro && !report) return null;

  if (report) {
    const b2 = report.b2Speaking;

    return (
      <div className="mt-6 grid gap-4">
        {b2 ? (
          <div className="rounded-lg border border-sky-700/40 bg-sky-950/30 p-4">
            <p className="text-sm font-semibold text-sky-200">
              Speaking score: {b2.total}/{b2.maxTotal}
            </p>
            <p className="mt-1 text-lg font-bold text-white">Estimated level: {b2.estimatedLevel}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {b2.criteria.map((c) => (
                <li key={c.key} className="text-sm text-slate-200">
                  {c.label}: {formatB2SpeakingScoreLine(c.score)}
                </li>
              ))}
            </ul>
            {b2.partFeedback?.length ? (
              <div className="mt-4 border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Part feedback</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {b2.partFeedback.map((item) => (
                    <li key={item.part}>
                      <strong>{item.part}:</strong> {item.note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {report.criteria.map((c) => (
            <div key={c.criterion} className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold capitalize text-sky-300">{c.criterion}</h3>
              <p className="mt-1 text-2xl font-bold text-white">{c.score}/5</p>
              {c.errors.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-xs text-slate-400">
                  {c.errors.slice(0, 3).map((e, i) => (
                    <li key={i}>
                      <em>{e.excerpt}</em> — {e.suggestion}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <h3 className="text-sm font-semibold text-sky-300">Corrected version</h3>
          <p className="mt-2 text-sm text-slate-200">{report.correctedVersion}</p>
          <h3 className="mt-4 text-sm font-semibold text-sky-300">Model answer</h3>
          <p className="mt-2 text-sm text-slate-200">{report.modelAnswer}</p>
          <p className="mt-3 text-xs text-slate-400">{report.shortExplanation}</p>
          <p className="mt-2 text-xs text-amber-200/90">
            Pronunciation: {report.pronunciation.score}/5 — {report.pronunciation.feedback}{' '}
            {report.pronunciation.isEstimated ? '(estimated)' : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grammar</h3>
        <p className="mt-1 text-sm text-slate-200">{micro?.grammarCorrection}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vocabulary</h3>
        <p className="mt-1 text-sm text-slate-200">{micro?.vocabularyImprovement}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Natural alternative</h3>
        <p className="mt-1 text-sm text-slate-200">{micro?.naturalAlternative}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated CEFR fit</h3>
        <p className="mt-1 text-sm text-slate-200">{micro?.estimatedCefrFit}</p>
        {micro?.pronunciationNote ? (
          <p className="mt-2 text-xs text-amber-200/80">{micro.pronunciationNote}</p>
        ) : null}
      </div>
    </div>
  );
}
