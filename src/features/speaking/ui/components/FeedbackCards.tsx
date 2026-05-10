'use client';

import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';
import type { MicroFeedback } from '@/features/speaking/domain/types';

type Props = {
  micro?: MicroFeedback | null;
  report?: CorrectionReportPayload | null;
};

export function FeedbackCards({ micro, report }: Props) {
  if (!micro && !report) return null;

  if (report) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
        <div className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
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
