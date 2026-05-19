'use client';

import SiteMascot from '@/components/SiteMascot';
import { mascotVariantForKey } from '@/config/mascotAssets';

/**
 * Estado de carga con mascota Dralo (sustituye o acompaña el spinner).
 */
export default function RouteLoadingMascot({
  label = 'Cargando…',
  variant,
  width = 120,
  className = '',
}) {
  const v = variant ?? mascotVariantForKey(label, 6);

  return (
    <div
      className={`route-loading route-loading--mascot ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <SiteMascot variant={v} width={width} alt="" className="route-loading__mascot" />
      <span className="route-loading__spinner" aria-hidden="true" />
      {label ? <p className="route-loading__label">{label}</p> : null}
    </div>
  );
}
