'use client';

import { useState } from 'react';
import StaffBuzonPanel from '@/components/buzon/StaffBuzonPanel';
import StaffMeetingsPanel from '@/components/coordinator/StaffMeetingsPanel';

const TABS = [
  { id: 'buzon', label: 'Buzón' },
  { id: 'reuniones', label: 'Reuniones' },
];

export default function StaffBuzonPanelPage({ currentUserId }) {
  const [tab, setTab] = useState('buzon');

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <p className="font-medium">Resumen diario por correo</p>
        <p className="mt-1 text-sky-800/90">
          Cada día (~21:00, hora peninsular) recibes un email con el resumen de tus chats directos y
          grupos del Buzón cuando ha habido mensajes.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-t text-sm font-medium ${
              tab === item.id
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'buzon' ? <StaffBuzonPanel currentUserId={currentUserId} /> : null}
      {tab === 'reuniones' ? <StaffMeetingsPanel /> : null}
    </div>
  );
}
