'use client';

import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
const NAV_CARDS = [
  { href: '/dralo-ai', icon: '✨', label: 'Dralo AI' },
  { href: '/teoria', icon: '📖', label: 'Theory' },
  { href: '/niveles', icon: '📚', label: 'Levels' },
  { href: '/prueba-nivel', icon: '🧪', label: 'Placement Test' },
  { href: '/training', icon: '🎮', label: 'Training' },
  { href: '/login', icon: '🔐', label: 'Login' },
];

const FEATURES = ['Interactive', 'Automatic correction', 'Free to use'];

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-page__inner">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
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

        <section className="home-nav" aria-label="Quick links">
          <h2 className="home-nav__heading">Explore</h2>
          <div className="home-page__cards">
            {NAV_CARDS.map((card) => (
              <Link key={card.href} href={card.href} className="home-page__card">
                <span className="home-page__card-icon" aria-hidden>
                  {card.icon}
                </span>
                <span className="home-page__card-label">{card.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
