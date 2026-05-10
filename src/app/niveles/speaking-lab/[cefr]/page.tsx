import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SpeakingLayout } from '@/features/speaking/ui/components/SpeakingLayout';
import { ModeTabs } from '@/features/speaking/ui/components/ModeTabs';
import { parseCefrFromSlug } from '@/features/speaking/domain/exam-blueprints';

const VALID = new Set(['a2', 'b1', 'b2', 'c1', 'c2']);

/** URL: /niveles/speaking-lab/b2/ — must live outside static /niveles/b2/ tree (Next route matching). */
export default function SpeakingLabHubPage({ params }: { params: { cefr: string } }) {
  const slug = params.cefr.toLowerCase();
  if (!VALID.has(slug)) notFound();
  const cefr = parseCefrFromSlug(slug);
  if (!cefr) notFound();

  const base = `/niveles/speaking-lab/${slug}`;

  return (
    <SpeakingLayout
      title={`Speaking Lab — ${cefr}`}
      subtitle="Practice conversation, deep correction, or a full Cambridge-style speaking run."
      backHref={`/niveles/${slug}/`}
    >
      <ModeTabs cefr={slug} current={null} />
      <p className="mb-6 text-sm text-slate-400">
        Choose a mode below. Your progress links here from the main level page under <strong>Speaking</strong>.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`${base}/practice/`}
          className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <h2 className="text-lg font-semibold text-white">Practice</h2>
          <p className="mt-2 text-sm text-slate-400">Free speaking with AI + micro-feedback each turn.</p>
        </Link>
        <Link
          href={`${base}/correction/`}
          className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <h2 className="text-lg font-semibold text-white">Correction</h2>
          <p className="mt-2 text-sm text-slate-400">Structured scores and a model answer for your text.</p>
        </Link>
        <Link
          href={`${base}/exam/`}
          className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <h2 className="text-lg font-semibold text-white">Exam</h2>
          <p className="mt-2 text-sm text-slate-400">Timed parts, examiner role, report at the end only.</p>
        </Link>
      </div>
      <section className="mt-10 rounded-xl border border-dashed border-slate-600 p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-400">Student dashboard (preview)</p>
        <ul className="mt-2 space-y-1">
          <li>Speaking streak: connect database to track</li>
          <li>Weakest criteria: last evaluation summary</li>
          <li>Latest sessions: stored when `DATABASE_URL` is set</li>
        </ul>
      </section>
    </SpeakingLayout>
  );
}
