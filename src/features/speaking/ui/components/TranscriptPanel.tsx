'use client';

export type ChatLine = { role: 'user' | 'assistant'; content: string };

type Props = {
  lines: ChatLine[];
};

export function TranscriptPanel({ lines }: Props) {
  return (
    <div
      className="max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/50 p-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {lines.length === 0 ? (
        <p className="text-sm text-slate-500">No messages yet. Choose a prompt and start speaking.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {lines.map((l, i) => (
            <li key={`${i}-${l.role}`} className={l.role === 'user' ? 'text-slate-200' : 'text-sky-200'}>
              <span className="font-semibold text-slate-500">{l.role === 'user' ? 'You' : 'Examiner / AI'}:</span>{' '}
              {l.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
