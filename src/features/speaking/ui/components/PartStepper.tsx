'use client';

import type { ExamPartDefinition } from '@/features/speaking/domain/types';

type Props = {
  parts: ExamPartDefinition[];
  currentIndex: number;
};

export function PartStepper({ parts, currentIndex }: Props) {
  return (
    <ol className="flex flex-wrap gap-2">
      {parts.map((p, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={p.part}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              active
                ? 'bg-sky-600 text-white'
                : done
                  ? 'bg-slate-700 text-slate-400 line-through'
                  : 'bg-slate-800 text-slate-500'
            }`}
          >
            Part {p.part}
          </li>
        );
      })}
    </ol>
  );
}
