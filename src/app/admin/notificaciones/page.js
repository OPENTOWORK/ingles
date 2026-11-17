'use client';

import PageHero from '@/components/PageHero';
import PlatformNotificationsPanel from '@/components/admin/PlatformNotificationsPanel';

export default function AdminNotificacionesPage() {
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <PageHero
        eyebrow="Comercial"
        title="Notificaciones"
        description="Avisos que salen de la plataforma, al móvil, al ordenador y a la tablet."
        accent="ocean"
        mascotVariant={8}
        mascotWidth={130}
      />
      <PlatformNotificationsPanel />
    </main>
  );
}
