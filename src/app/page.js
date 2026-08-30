'use client';

import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import DraloTagline from '@/components/DraloTagline';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeInstallAppButton from '@/components/home/HomeInstallAppButton';
import HomeQuickNav from '@/components/home/HomeQuickNav';
import InviteFriendPromoBanner from '@/components/layout/InviteFriendPromoBanner';
import { useGuidedTour } from '@/context/GuidedTourContext';
import { useUserRole } from '@/context/UserRoleContext';
import { isStudentRole } from '@/utils/authRoles';

const FEATURES = [
  'Interactive',
  'Personalised progress',
  'Instant feedback',
];

export default function Home() {
  const { session, userRole } = useUserRole();
  const { startTour } = useGuidedTour();
  const isRegistered = Boolean(session?.user);
  const isStudentView = isRegistered && isStudentRole(userRole);
  return (
    <main className="home-page">
      <div className="home-page__inner">
        {isRegistered ? <InviteFriendPromoBanner /> : null}

        <section className="home-hero" aria-labelledby="home-title">
          <HomeInstallAppButton />

          <div className="home-hero__copy">
            <h1 id="home-title" className="home-page__title">
              Welcome to Dralo
            </h1>
            <p className="home-hero__subtitle">
              Prepare for the smart and interactive way to learn English
            </p>
            <ul className="home-page__features" aria-label="Platform highlights">
              {FEATURES.map((item) => (
                <li key={item} className="home-feature">
                  <span aria-hidden>✓</span> {item}
                </li>
              ))}
            </ul>
            {!isStudentView ? (
              <div className="home-hero__cta">
                <Link href="/niveles" className="home-cta__btn home-cta__btn--inline">
                  Start practising
                </Link>
              </div>
            ) : null}
          </div>

          <div className="home-hero__mascot">
            <SiteMascot variant={10} width={300} priority alt="Dralo mascot" />
          </div>
        </section>

        <blockquote className="home-quote">
          <DraloTagline />
        </blockquote>

        {isRegistered ? <HomeHowItWorks onStartTour={startTour} /> : null}
        {isRegistered ? <HomeQuickNav /> : null}
      </div>
    </main>
  );
}
