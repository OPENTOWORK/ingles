'use client';

import StaffTasksPanel from '@/components/tasks/StaffTasksPanel';

export default function StaffTasksPanelPage({ currentUserId, userRole }) {
  return <StaffTasksPanel currentUserId={currentUserId} userRole={userRole} embedded />;
}
