'use client';

import { useState } from 'react';
import StaffTasksPanel from '@/components/tasks/StaffTasksPanel';
import StaffMeetingsPanel from '@/components/coordinator/StaffMeetingsPanel';

const TABS = [
  { id: 'tareas', label: 'Tareas' },
  { id: 'reuniones', label: 'Reuniones' },
];

export default function StaffTasksPanelPage({ currentUserId, userRole }) {
  const [tab, setTab] = useState('tareas');

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-t text-sm font-medium ${
              tab === item.id
                ? 'bg-violet-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'tareas' ? (
        <StaffTasksPanel currentUserId={currentUserId} userRole={userRole} embedded />
      ) : null}
      {tab === 'reuniones' ? <StaffMeetingsPanel /> : null}
    </div>
  );
}
