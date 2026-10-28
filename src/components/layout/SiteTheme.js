'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  DECORATED_SITE_THEMES,
  DEFAULT_SITE_THEME,
  activeSiteTheme,
  isSiteThemedPath,
  siteThemeClass,
} from '@/lib/siteTheme';
import { loadSiteTheme, useSiteTheme } from '@/hooks/useSiteTheme';

/** setTimeout no admite más de ~24,8 días. */
const MAX_TIMER_MS = 2147483647;

const BAT_PATH =
  'M32 8L34.6 3.5L35.8 9Q46 2.5 63 8.5Q56 11.5 55 19Q50 14.5 45 19.5Q41 14.5 36.5 20Q34.5 24.5 32 25.5Q29.5 24.5 27.5 20Q23 14.5 19 19.5Q14 14.5 9 19Q8 11.5 1 8.5Q18 2.5 28.2 9L29.4 3.5Z';

const BATS = [
  { top: '14vh', size: 46, duration: 6.4, delay: 0.3 },
  { top: '27vh', size: 32, duration: 7.4, delay: 1 },
  { top: '8vh', size: 24, duration: 8.2, delay: 1.8 },
];

/** Lo que tarda el último murciélago en cruzar la pantalla. */
const BATS_FLIGHT_MS = 10500;

const FLAKE_ARM = 'M12 2v20M9 3.8l3 2.7 3-2.7M9 20.2l3-2.7 3 2.7';

const FLAKES = [
  { left: 3, size: 16, duration: 9, delay: 0, drift: 26 },
  { left: 11, size: 11, duration: 11, delay: 1.6, drift: -18 },
  { left: 18, size: 20, duration: 8.4, delay: 3.2, drift: 22 },
  { left: 26, size: 12, duration: 10.5, delay: 0.8, drift: -24 },
  { left: 34, size: 15, duration: 9.6, delay: 2.4, drift: 18 },
  { left: 42, size: 10, duration: 12, delay: 4, drift: -14 },
  { left: 49, size: 18, duration: 8.8, delay: 1.2, drift: 28 },
  { left: 57, size: 12, duration: 10.8, delay: 3.6, drift: -20 },
  { left: 64, size: 16, duration: 9.2, delay: 0.4, drift: 16 },
  { left: 71, size: 11, duration: 11.5, delay: 2.8, drift: -26 },
  { left: 78, size: 19, duration: 8.6, delay: 1.9, drift: 20 },
  { left: 85, size: 13, duration: 10.2, delay: 4.4, drift: -16 },
  { left: 91, size: 15, duration: 9.4, delay: 0.9, drift: 24 },
  { left: 97, size: 10, duration: 11.8, delay: 3, drift: -22 },
];

/** Lo que tarda en caer el último copo. */
const SNOW_FALL_MS = 16500;

/** Una sola pasada por pestaña, y nada si el sistema pide reducir el movimiento. */
function useOncePerTab(sessionKey, durationMs) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (window.sessionStorage.getItem(sessionKey)) return;
      window.sessionStorage.setItem(sessionKey, '1');
    } catch {
      return;
    }
    setRunning(true);
  }, [sessionKey]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => setRunning(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [running, durationMs]);

  return running;
}

function HalloweenBats() {
  const flying = useOncePerTab('dralo-halloween-2026-bats', BATS_FLIGHT_MS);
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

function ChristmasSnow() {
  const falling = useOncePerTab('dralo-navidad-snow', SNOW_FALL_MS);
  if (!falling) return null;

  return (
    <div className="navidad-snow" aria-hidden="true">
      {FLAKES.map(({ left, size, duration, delay, drift }) => (
        <span
          key={left}
          className="navidad-flake"
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            '--navidad-drift': `${drift}px`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            {[0, 60, 120].map((angle) => (
              <path key={angle} d={FLAKE_ARM} transform={`rotate(${angle} 12 12)`} />
            ))}
          </svg>
        </span>
      ))}
    </div>
  );
}

/** El script del <head> pinta el último tema conocido; esto lo confirma, lo mantiene al navegar y lo quita si vence. */
export default function SiteTheme() {
  const pathname = usePathname() ?? '';
  const state = useSiteTheme();
  const [shown, setShown] = useState(DEFAULT_SITE_THEME);

  useEffect(() => {
    void loadSiteTheme();
  }, []);

  useEffect(() => {
    if (!state.known) return undefined;
    const sync = () => {
      const theme = isSiteThemedPath(pathname) ? activeSiteTheme(state) : DEFAULT_SITE_THEME;
      const root = document.documentElement;
      DECORATED_SITE_THEMES.forEach((id) => root.classList.toggle(siteThemeClass(id), id === theme));
      setShown(theme);
    };

    sync();
    const remaining = state.until ? state.until - Date.now() : 0;
    if (remaining <= 0) return undefined;
    const timer = window.setTimeout(sync, Math.min(remaining + 1000, MAX_TIMER_MS));
    return () => window.clearTimeout(timer);
  }, [pathname, state]);

  if (pathname !== '/') return null;
  if (shown === 'halloween') return <HalloweenBats />;
  if (shown === 'navidad') return <ChristmasSnow />;
  return null;
}
