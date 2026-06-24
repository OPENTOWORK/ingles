'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { isDraloAiLockedForRole } from '@/config/appNavMenu';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

function DraloAiBlockedScreen() {
  return (
    <main className="dralo-ai-page">
      <section style={{ padding: '2rem 1.5rem', maxWidth: 520 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Coming soon
        </h1>
        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
          Dralo AI is not available for students yet. Keep practising in{' '}
          <strong>Exam practice</strong> — writing and speaking feedback are there when you need
          them.
        </p>
        <Link href="/niveles/b2" className="home-cta__btn home-cta__btn--inline">
          Go to Exam practice
        </Link>
      </section>
    </main>
  );
}

/**
 * Blocks all /dralo-ai routes for students and other locked roles.
 */
export default function DraloAiFeatureGuard({ children }) {
  const { userRole, session } = useUserRole();
  const [apiState, setApiState] = useState('pending');

  const roleLocked = Boolean(session) && isDraloAiLockedForRole(userRole);

  useEffect(() => {
    if (roleLocked) {
      setApiState('blocked');
      return;
    }

    void (async () => {
      try {
        const res = await fetch(buildClientApiUrl('/api/dralo-ai/access'), {
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        setApiState(data.allowed ? 'allowed' : 'blocked');
      } catch {
        setApiState('blocked');
      }
    })();
  }, [roleLocked, session, userRole]);

  if (apiState === 'pending') {
    return (
      <main className="dralo-ai-page">
        <p style={{ padding: 24 }}>Loading…</p>
      </main>
    );
  }

  if (apiState === 'blocked') {
    return <DraloAiBlockedScreen />;
  }

  return children;
}
