'use client';

import SiteMascot from '@/components/SiteMascot';

/** Decoración suave de mascotas en esquinas (no interactiva). */
export default function SiteMascotBackdrop() {
  return (
    <div className="site-mascot-backdrop" aria-hidden>
      <SiteMascot variant={7} width={96} alt="" className="site-mascot-backdrop__tl" />
      <SiteMascot variant={2} width={80} alt="" className="site-mascot-backdrop__br" />
    </div>
  );
}
