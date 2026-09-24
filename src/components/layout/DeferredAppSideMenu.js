'use client';

import AppSideMenuPanel from '@/components/layout/AppSideMenuPanel';

/**
 * El panel va en el bundle principal. Un import diferido dejaba el menú
 * hamburguesa visible en la primera visita móvil hasta que el hilo quedaba libre.
 */
export default function DeferredAppSideMenu({ defaultOpen }) {
  return <AppSideMenuPanel defaultOpen={defaultOpen} />;
}
