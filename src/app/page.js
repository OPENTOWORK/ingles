'use client';

import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import DraloTagline from '@/components/DraloTagline';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeQuickNav from '@/components/home/HomeQuickNav';
import { useGuidedTour } from '@/context/GuidedTourContext';
import { useUserRole } from '@/context/UserRoleContext';

const FEATURES = [
  'Interactive',
  'Personalised progress',
  'Instant feedback',
  'Free to use',
];

export default function Home() {
  const { session } = useUserRole();
  const { startTour } = useGuidedTour();
  const isRegistered = Boolean(session?.user);
  return (
    <main className="home-page">
      <div className="home-page__inner">
        <section className="home-hero" aria-labelledby="home-title">
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
            <div className="home-hero__cta">
              <Link href="/niveles" className="home-cta__btn home-cta__btn--inline">
                Start practising
              </Link>
            </div>
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
