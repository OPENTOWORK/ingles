'use client';

type Props = {
  title: string;
  instructions: string;
  lastPrompt?: string;
};

export function ExaminerPanel({ title, instructions, lastPrompt }: Props) {
  return (
    <aside className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <h2 className="text-sm font-semibold text-sky-400">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{instructions}</p>
      {lastPrompt ? (
        <div className="mt-4 border-t border-slate-700 pt-4">
          <p className="text-xs uppercase text-slate-500">Latest examiner turn</p>
          <p className="mt-1 text-sm text-white">{lastPrompt}</p>
        </div>
      ) : null}
    </aside>
  );
}
