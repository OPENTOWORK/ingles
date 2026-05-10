'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
};

export function SpeakingLayout({ title, subtitle, children, backHref = '/niveles' }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href={backHref}
            className="text-sm text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          >
            ← Back
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-slate-400">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
