'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studyTrackRecordProfileHref } from '@/lib/studyTrackRecord';

/** Legacy URL — opens the Track record tab in Profile. */
export default function TrackRecordRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(studyTrackRecordProfileHref());
  }, [router]);

  return null;
}
