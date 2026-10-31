'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import TestsBranchStyles from '@/components/placement/TestsBranchStyles';
import { landingFont } from '@/components/home/landing/landingFont';
import { canViewPlacementAndTraining, PLACEMENT_MENU_ITEMS } from '@/config/appNavMenu';
import { useUserRole } from '@/context/UserRoleContext';

const CARD_COPY = {
  '/prueba-nivel/placement': {
    kicker: 'Full exam',
    text: 'Grammar, reading and writing. Questions from the whole placement bank.',
    tone: 'solid',
  },
  '/prueba-nivel/quick': {
    kicker: '5 minutes',
    text: 'Ten grammar and vocabulary questions for a quick level estimate.',
    tone: 'light',
  },
};

export default function TestsHubPage() {
  const router = useRouter();
  const { session, userRole } = useUserRole();
  const canAccess = canViewPlacementAndTraining(userRole);

  useEffect(() => {
    if (!session) router.push('/login');
  }, [session, router]);

  useEffect(() => {
    if (userRole && !canAccess) router.replace('/niveles/b2');
  }, [userRole, canAccess, router]);

  if (userRole && !canAccess) return null;

  return (
    <main className={`shell content-hub-shell tests-branch niveles-level-page niveles-level-page--b2 ${landingFont.variable}`}>
      <div className="levels-b2-page-content">
        <PageHero
          eyebrow="Tests"
          title="Choose a test"
          description="Placement Test is the full level check. Quick Test is a 5-minute estimate."
          showMascot
          mascotVariant={2}
          mascotWidth={120}
          accent="violet"
        />

        {!session ? (
          <p>Loading…</p>
        ) : (
          <section className="tests-choices" aria-label="Tests">
            {PLACEMENT_MENU_ITEMS.map((item) => {
              const copy = CARD_COPY[item.href] || { kicker: 'Test', text: '', tone: 'light' };
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`tests-choice tests-choice--${copy.tone}`}
                >
                  <span className="tests-choice__kicker">{copy.kicker}</span>
                  <span className="tests-choice__title">{item.label}</span>
                  <span className="tests-choice__text">{copy.text}</span>
                  <span className="tests-choice__go">Open</span>
                </Link>
              );
            })}
          </section>
        )}
      </div>
      <TestsBranchStyles />
    </main>
  );
}
