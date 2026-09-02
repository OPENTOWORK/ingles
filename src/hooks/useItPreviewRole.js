'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
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
  const searchParams = useMountedSearchParams();
  const requestedRoleId = searchParams.get(IT_PREVIEW_ROLE_PARAM);
  const [storedRoleId, setStoredRoleId] = useState(null);

  useEffect(() => {
    if (requestedRoleId && isEmbeddedPreviewFrame()) {
      sessionStorage.setItem(IT_PREVIEW_ROLE_STORAGE_KEY, requestedRoleId);
      setStoredRoleId(requestedRoleId);
      return;
    }
    if (!requestedRoleId && isEmbeddedPreviewFrame()) {
      try {
        setStoredRoleId(sessionStorage.getItem(IT_PREVIEW_ROLE_STORAGE_KEY));
      } catch {
        setStoredRoleId(null);
      }
    }
  }, [requestedRoleId]);

  const effectiveRoleId = requestedRoleId || storedRoleId;

  return useMemo(
    () => resolveItPreviewState(effectiveRoleId, realRole, realSession),
    [effectiveRoleId, realRole, realSession],
  );
}
