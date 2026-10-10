'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import DraloTagline from '@/components/DraloTagline';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeQuickNav from '@/components/home/HomeQuickNav';
import HomeStudentMobileBoard from '@/components/home/HomeStudentMobileBoard';
import InviteFriendPromoBanner from '@/components/layout/InviteFriendPromoBanner';
import FoundingMemberSlotsBanner from '@/components/home/FoundingMemberSlotsBanner';
import { useEffect, useState } from 'react';
import { useGuidedTour } from '@/context/GuidedTourContext';
import { useConfirmedUserRole, useUserRole } from '@/context/UserRoleContext';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { supabase } from '@/utils/supabaseClient';

const HomeInstallAppButton = dynamic(() => import('@/components/home/HomeInstallAppButton'), {
  ssr: false,
});

const FEATURES = [
  'Interactive',
  'Personalised progress',
  'Instant feedback',
];

export default function Home() {
  const { session } = useUserRole();
  const { roleConfirmed, userRole: confirmedRole } = useConfirmedUserRole();
  const { startTour } = useGuidedTour();
  const isRegistered = Boolean(session?.user);
  /** Home de alumno en móvil: exige rol resuelto para esta misma sesión, no el valor por defecto. */
  const showStudentBoard = roleConfirmed && usesStudentContentRestrictions(confirmedRole);
  /** null hasta leer la sesión; false = invitado, true = hay usuario. */
  const [hasStoredUser, setHasStoredUser] = useState(null);
  const isGuestHome = hasStoredUser === false && !session?.user;
  const authPending = hasStoredUser === null && !session?.user;
  const rolePending = Boolean(session?.user) && !roleConfirmed;
  /** Misma Home de app en móvil: no pintar el welcome de invitado ni un frame. */
  const showAppHome = showStudentBoard || isGuestHome || authPending || rolePending;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('error_code') || '';
    const description = params.get('error_description') || '';
    if (code === 'bad_oauth_state' || /oauth state/i.test(description)) {
      window.location.replace('/login/?error=oauth_state');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasStoredUser(Boolean(data.session?.user));
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <main className={`home-page${showAppHome ? ' home-page--student-mobile' : ''}${isGuestHome ? ' home-page--guest' : ''}`}>
      <div className="home-page__inner">
        {isRegistered ? <InviteFriendPromoBanner /> : null}
        {isGuestHome ? <FoundingMemberSlotsBanner /> : null}
        <section className="home-hero" aria-labelledby="home-title">
          <HomeInstallAppButton />

          <div className="home-hero__copy">
            <h1 id="home-title" className="home-page__title">
              Welcome to Dralo
            </h1>
            {isRegistered ? (
              <p className="home-hero__subtitle">
                Prepare for the smart and interactive way to learn English
              </p>
            ) : (
              <Link href="/login" className="home-cta__btn home-hero__auth-btn">
                Sign up / Log in
              </Link>
            )}
            <ul className="home-page__features" aria-label="Platform highlights">
              {FEATURES.map((item) => (
                <li key={item} className="home-feature">
                  <span aria-hidden>✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="home-hero__cta">
              <Link href="/exam-practice/b2/exam-reading-and-use-of-english/?examen=1" className="home-cta__btn home-cta__btn--inline home-cta__btn--start">
                Start practising
              </Link>
            </div>
          </div>

          <div className="home-hero__mascot">
            <SiteMascot variant={10} width={300} priority alt="Dralo mascot" />
          </div>
        </section>

        {showAppHome ? <HomeStudentMobileBoard guest={isGuestHome || authPending} /> : null}

        <blockquote className="home-quote">
          {isGuestHome ? (
            <div className="home-quote__frame">
              <video
                className="home-quote__video"
                controls
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                aria-label="Práctica en Dralo: reading, writing, listening, quiz y training"
              >
                <source src="/dralo-tour.mp4?v=4" type="video/mp4" />
              </video>
            </div>
          ) : null}
          <DraloTagline />
        </blockquote>

        {isRegistered && roleConfirmed && !usesStudentContentRestrictions(confirmedRole) ? (
          <HomeHowItWorks onStartTour={startTour} />
        ) : null}
        {isRegistered ? <HomeQuickNav /> : null}
      </div>
    </main>
  );
}
