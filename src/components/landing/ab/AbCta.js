'use client';

import Link from 'next/link';
import { AB_EVENTS } from '@/lib/abExperiment';
import { trackAbEvent } from '@/lib/abExperimentTrack';

export default function AbCta({ href, pageType, variant, source = 'direct', children, className }) {
  return (
    <Link
      href={href}
      className={className || 'ab-cta'}
      onClick={() => trackAbEvent(AB_EVENTS.ctaClick, { pageType, variant, source })}
    >
      {children}
    </Link>
  );
}
