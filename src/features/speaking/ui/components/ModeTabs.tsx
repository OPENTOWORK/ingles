'use client';

import Link from 'next/link';

type Props = {
  cefr: string;
  /** Omit or null on hub page — no tab highlighted */
  current?: 'practice' | 'correction' | 'exam' | null;
};

const tabs: { id: 'practice' | 'correction' | 'exam'; label: string; path: string }[] = [
  { id: 'practice', label: 'Practice', path: 'practice' },
  { id: 'correction', label: 'Correction', path: 'correction' },
  { id: 'exam', label: 'Exam', path: 'exam' },
];

export function ModeTabs({ cefr, current }: Props) {
  const base = `/niveles/speaking-lab/${cefr}`;
  return (
    <nav aria-label="Speaking modes" className="mb-8 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = current != null && t.id === current;
        return (
          <Link
            key={t.id}
            href={`${base}/${t.path}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              active
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
