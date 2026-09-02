'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

let historyPatched = false;

function notifySearchChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('dralo:searchchange'));
}

function ensureHistoryPatch() {
  if (historyPatched || typeof window === 'undefined') return;
  historyPatched = true;
  const { pushState, replaceState } = window.history;
  window.history.pushState = function patchedPushState(...args) {
    const result = pushState.apply(this, args);
    notifySearchChange();
    return result;
  };
  window.history.replaceState = function patchedReplaceState(...args) {
    const result = replaceState.apply(this, args);
    notifySearchChange();
    return result;
  };
}

function readSearch() {
  if (typeof window === 'undefined') return '';
  return window.location.search.replace(/^\?/, '');
}

/**
 * Equivalente a useSearchParams() sin suspender en SSR.
 * Primer render (servidor y cliente) = query vacía; se rellena tras montar.
 */
export function useMountedSearchParams() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  useEffect(() => {
    ensureHistoryPatch();
    const sync = () => setSearch(readSearch());
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('dralo:searchchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('dralo:searchchange', sync);
    };
  }, [pathname]);

  return useMemo(() => new URLSearchParams(search), [search]);
}
