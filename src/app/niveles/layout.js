'use client';
import '@/styles/app-routes.css';

import NivelesLevelRouteGate from '@/components/niveles/NivelesLevelRouteGate';

export default function NivelesLayout({ children }) {
  return <NivelesLevelRouteGate>{children}</NivelesLevelRouteGate>;
}
