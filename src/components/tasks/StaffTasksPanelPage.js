'use client';

import { Suspense } from 'react';
import StaffTasksPanel from '@/components/tasks/StaffTasksPanel';

export default function StaffTasksPanelPage({ currentUserId, userRole }) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 py-4">Cargando tareas…</p>}>
      <StaffTasksPanel currentUserId={currentUserId} userRole={userRole} embedded />
    </Suspense>
  );
}
