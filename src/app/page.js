'use client';

import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import { MASCOT_LOGO_VARIANT } from '@/config/mascotAssets';

const FEATURES = ['Interactive', 'Automatic correction', 'Free to use'];

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-page__inner">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
            <div className="home-hero__logo-mascot">
              <SiteMascot variant={MASCOT_LOGO_VARIANT} width={140} priority alt="Dralo" />
            </div>
            <h1 id="home-title" className="home-page__title">
              Welcome to Dralo
            </h1>
            <p className="home-hero__subtitle">
              Prepare for the smart and interactive way to learn English.
            </p>
            <ul className="home-page__features" aria-label="Platform highlights">
              {FEATURES.map((item) => (
                <li key={item} className="home-feature">
                  <span aria-hidden>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="home-hero__mascot">
            <SiteMascot variant={10} width={220} priority alt="Dralo mascot" />
          </div>
        </section>

        <blockquote className="home-quote">
          <p>&ldquo;The best preparation for tomorrow is doing your best today.&rdquo;</p>
          <footer>— Your time is now</footer>
        </blockquote>

        <div className="home-cta">
          <Link href="/niveles" className="home-cta__btn">
            Start Practising
          </Link>
        </div>
      </div>
    </main>
  );
}
