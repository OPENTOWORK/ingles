'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  IT_PREVIEW_ROLE_PARAM,
  resolveItPreviewState,
} from '@/lib/itPreviewRole';

const IT_PREVIEW_ROLE_STORAGE_KEY = 'dralo_it_preview_role';

function isEmbeddedPreviewFrame() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function useItPreviewRole(realRole, realSession) {
  const searchParams = useSearchParams();
  const requestedRoleId = searchParams.get(IT_PREVIEW_ROLE_PARAM);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (requestedRoleId && isEmbeddedPreviewFrame()) {
      sessionStorage.setItem(IT_PREVIEW_ROLE_STORAGE_KEY, requestedRoleId);
    }
  }, [requestedRoleId]);

  const effectiveRoleId = useMemo(() => {
    if (requestedRoleId) return requestedRoleId;
    if (typeof window === 'undefined' || !isEmbeddedPreviewFrame()) return null;
    try {
      return sessionStorage.getItem(IT_PREVIEW_ROLE_STORAGE_KEY);
    } catch {
      return null;
    }
  }, [requestedRoleId]);

  return useMemo(
    () => resolveItPreviewState(effectiveRoleId, realRole, realSession),
    [effectiveRoleId, realRole, realSession],
  );
}
