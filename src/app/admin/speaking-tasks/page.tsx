'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { supabase } from '@/utils/supabaseClient';

type Task = {
  id: string;
  title: string;
  cefr: string;
  examType: string;
  part: number;
  prompt: string;
  followUpQuestions: string[];
  targetVocabulary: string[];
  timeLimitSec: number | null;
  taskType: string;
  published: boolean;
};

type Analytics = {
  byCefrMode: { cefr: string; mode: string; _count: { id: number } }[];
  taskCount: number;
};

export default function AdminSpeakingTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('New task');
  const [cefr, setCefr] = useState<'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B2');
  const [examType, setExamType] = useState<'KEY' | 'PET' | 'FIRST' | 'ADVANCED' | 'PROFICIENCY'>('FIRST');
  const [part, setPart] = useState(1);
  const [prompt, setPrompt] = useState('Speak about ...');
  const [taskType, setTaskType] = useState<
    'INTERVIEW' | 'LONG_TURN' | 'COLLABORATIVE' | 'DISCUSSION' | 'OTHER'
  >('INTERVIEW');

  const load = useCallback(async () => {
    setLoading(true);
    const sessionRes = await supabase.auth.getSession();
    if (!sessionRes.data.session) {
      router.replace('/login');
      return;
    }
    const [tRes, aRes] = await Promise.all([
      fetch(withBasePath('/api/admin/speaking-tasks')),
      fetch(withBasePath('/api/admin/speaking-analytics')),
    ]);
    if (tRes.status === 403) {
      setError('Admin only');
      setLoading(false);
      return;
    }
    const tData = (await tRes.json()) as { tasks?: Task[] };
    const aData = (await aRes.json()) as Analytics;
    setTasks(tData.tasks ?? []);
    setAnalytics(aData);
    setError(null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <p>
        <Link href="/admin/">← Admin</Link>
      </p>
      <h1 style={{ marginTop: 16 }}>Speaking tasks (CMS)</h1>
      <p style={{ color: '#555' }}>
        Requires Postgres (<code>DATABASE_URL</code>) and admin role. Seeds: <code>npm run db:seed</code>
      </p>

      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      {analytics ? (
        <section style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Analytics</h2>
          <p>Tasks in DB: {analytics.taskCount}</p>
          <ul>
            {analytics.byCefrMode?.map((row) => (
              <li key={`${row.cefr}-${row.mode}`}>
                {row.cefr} / {row.mode}: {row._count.id} sessions
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {loading ? <p>Loading…</p> : null}

      <section style={{ marginTop: 32 }}>
        <h2>Create task</h2>
        <div style={{ display: 'grid', gap: 8, maxWidth: 560 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <select value={cefr} onChange={(e) => setCefr(e.target.value as typeof cefr)}>
            {(['A2', 'B1', 'B2', 'C1', 'C2'] as const).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={examType} onChange={(e) => setExamType(e.target.value as typeof examType)}>
            {(['KEY', 'PET', 'FIRST', 'ADVANCED', 'PROFICIENCY'] as const).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <input type="number" value={part} onChange={(e) => setPart(Number(e.target.value))} min={1} />
          <select value={taskType} onChange={(e) => setTaskType(e.target.value as typeof taskType)}>
            {(['INTERVIEW', 'LONG_TURN', 'COLLABORATIVE', 'DISCUSSION', 'OTHER'] as const).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Prompt"
          />
          <button
            type="button"
            onClick={async () => {
              await fetch(withBasePath('/api/admin/speaking-tasks'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title,
                  cefr,
                  examType,
                  part,
                  prompt,
                  taskType,
                  followUpQuestions: [],
                  targetVocabulary: [],
                  published: true,
                }),
              });
              await load();
            }}
          >
            Save
          </button>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Existing tasks</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Title</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>CEFR</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Part</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: '6px 0' }}>{t.title}</td>
                <td>{t.cefr}</td>
                <td>{t.part}</td>
                <td>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(withBasePath(`/api/admin/speaking-tasks/${t.id}`), {
                        method: 'DELETE',
                      });
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
