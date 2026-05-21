'use client';

import ProgressDashboard from '@/components/ProgressDashboard';
import AdaptiveLearningDashboard from '@/components/AdaptiveLearningDashboard';

/**
 * Both dashboards in one chunk — loaded lazily from /training without blocking level cards.
 */
export function TrainingDashboardStack({ userId }) {
  return (
    <>
      <ProgressDashboard userId={userId} />
      <AdaptiveLearningDashboard userId={userId} />
    </>
  );
}
