'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import {
  IT_PREVIEW_ROLE_PARAM,
  resolveItPreviewState,
} from '@/lib/itPreviewRole';

const IT_PREVIEW_ROLE_STORAGE_KEY = 'dralo_it_preview_role';
const IT_PREVIEW_RELOAD_PARAM = '_itPreview';

function preservePreviewParams(url) {
  const next = new URL(url, window.location.origin);
  if (next.origin !== window.location.origin) return null;
  const current = new URLSearchParams(window.location.search);
  let role = current.get(IT_PREVIEW_ROLE_PARAM);
  try {
    role = role || sessionStorage.getItem(IT_PREVIEW_ROLE_STORAGE_KEY);
  } catch {
    /* private mode */
  }
  const reload = current.get(IT_PREVIEW_RELOAD_PARAM) || '1';
  if (role && !next.searchParams.has(IT_PREVIEW_ROLE_PARAM)) {
    next.searchParams.set(IT_PREVIEW_ROLE_PARAM, role);
  }
  if (!next.searchParams.has(IT_PREVIEW_RELOAD_PARAM)) {
    next.searchParams.set(IT_PREVIEW_RELOAD_PARAM, reload);
  }
  return `${next.pathname}${next.search}${next.hash}`;
}

function installPreviewNavigationGuard() {
  if (typeof window === 'undefined' || window.__draloPreviewNavGuard) return;
  if (!isEmbeddedPreviewFrame()) return;
  window.__draloPreviewNavGuard = true;

  const wrap = (original) =>
    function previewHistory(state, title, url) {
      if (url == null) return original.call(this, state, title, url);
      try {
        const stamped = preservePreviewParams(url);
        return original.call(this, state, title, stamped || url);
      } catch {
        return original.call(this, state, title, url);
      }
    };

  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);

  try {
    const stamped = preservePreviewParams(window.location.href);
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (stamped && stamped !== current) {
      history.replaceState(history.state, '', stamped);
    }
  } catch {
    /* ignore */
  }
}

function isEmbeddedPreviewFrame() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function useItPreviewRole(realRole, realSession) {
  const searchParams = useMountedSearchParams();
  const requestedRoleId = searchParams.get(IT_PREVIEW_ROLE_PARAM);
  const [storedRoleId, setStoredRoleId] = useState(null);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const inFrame = isEmbeddedPreviewFrame();
    setEmbedded(inFrame);
    if (!inFrame) return undefined;
    installPreviewNavigationGuard();
    if (requestedRoleId) {
      sessionStorage.setItem(IT_PREVIEW_ROLE_STORAGE_KEY, requestedRoleId);
      setStoredRoleId(requestedRoleId);
      return undefined;
    }
    try {
      setStoredRoleId(sessionStorage.getItem(IT_PREVIEW_ROLE_STORAGE_KEY));
    } catch {
      setStoredRoleId(null);
    }
    return undefined;
  }, [requestedRoleId]);

  const effectiveRoleId = requestedRoleId || storedRoleId;

  return useMemo(
    () => resolveItPreviewState(effectiveRoleId, realRole, realSession, { embedded }),
    [effectiveRoleId, realRole, realSession, embedded],
  );
}
