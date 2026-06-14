'use client';

import { useEffect, useState } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/**
 * Blocks Dralo AI advanced routes unless NEXT_PUBLIC_ENABLE_DRALO_AI=true or user is admin.
 */
export default function DraloAiFeatureGuard({ children }) {
  const [state, setState] = useState('loading');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DRALO_AI === 'true') {
      setState('allowed');
      return;
    }

    void (async () => {
      try {
        const res = await fetch(buildClientApiUrl('/api/dralo-ai/access'), {
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        setState(data.allowed ? 'allowed' : 'blocked');
      } catch {
        setState('blocked');
      }
    })();
  }, []);

  if (state === 'loading') {
    return (
      <main className="dralo-ai-page">
        <p style={{ padding: 24 }}>Loading…</p>
      </main>
    );
  }

  if (state === 'blocked') {
    return (
      <main className="dralo-ai-page">
        <section style={{ padding: '2rem 1.5rem', maxWidth: 520 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Not available yet
          </h1>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            Dralo AI advanced tools are coming soon. Exam practice (writing and speaking feedback)
            remains available in the main course areas.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
