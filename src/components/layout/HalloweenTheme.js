'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  HALLOWEEN_BATS_SESSION_KEY,
  HALLOWEEN_CLASS,
  HALLOWEEN_ENDS_AT,
  isHalloweenActive,
  isHalloweenThemedPath,
} from '@/lib/halloweenTheme';

const BAT_PATH =
  'M32 8L34.6 3.5L35.8 9Q46 2.5 63 8.5Q56 11.5 55 19Q50 14.5 45 19.5Q41 14.5 36.5 20Q34.5 24.5 32 25.5Q29.5 24.5 27.5 20Q23 14.5 19 19.5Q14 14.5 9 19Q8 11.5 1 8.5Q18 2.5 28.2 9L29.4 3.5Z';

const BATS = [
  { top: '14vh', size: 46, duration: 6.4, delay: 0.3 },
  { top: '27vh', size: 32, duration: 7.4, delay: 1 },
  { top: '8vh', size: 24, duration: 8.2, delay: 1.8 },
];

/** Lo que tarda el último murciélago en cruzar la pantalla. */
const BATS_FLIGHT_MS = 10500;

/** Una sola pasada por pestaña, y nada si el sistema pide reducir el movimiento. */
function HalloweenBats() {
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (window.sessionStorage.getItem(HALLOWEEN_BATS_SESSION_KEY)) return;
      window.sessionStorage.setItem(HALLOWEEN_BATS_SESSION_KEY, '1');
    } catch {
      return;
    }
    setFlying(true);
  }, []);

  useEffect(() => {
    if (!flying) return undefined;
    const timer = window.setTimeout(() => setFlying(false), BATS_FLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [flying]);

  if (!flying) return null;

  return (
    <div className="halloween-bats" aria-hidden="true">
      {BATS.map(({ top, size, duration, delay }) => (
        <span
          key={top}
          className="halloween-bat"
          style={{ top, width: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        >
          <svg viewBox="0 0 64 28" fill="currentColor" focusable="false">
            <path d={BAT_PATH} />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** El script del <head> pone la clase al cargar; esto la mantiene al navegar y la quita al terminar el plazo. */
export default function HalloweenTheme() {
  const pathname = usePathname() ?? '';
  const [themed, setThemed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const on = isHalloweenActive() && isHalloweenThemedPath(pathname);
      document.documentElement.classList.toggle(HALLOWEEN_CLASS, on);
      setThemed(on);
    };

    sync();
    const remaining = HALLOWEEN_ENDS_AT - Date.now();
    if (remaining <= 0) return undefined;
    const timer = window.setTimeout(sync, remaining + 1000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return themed && pathname === '/' ? <HalloweenBats /> : null;
}
