'use client';

import Link from 'next/link';
import DraloTagline from '@/components/DraloTagline';
import { SITE_FOOTER_TAGLINE } from '@/lib/siteSeo';

const LEGAL_LINKS = [
  { href: '/terminos-condiciones', label: 'Términos y condiciones' },
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/politica-reembolsos', label: 'Política de reembolsos' },
  { href: '/normas-comunidad', label: 'Normas de comunidad' },
  { href: '/contact', label: 'Contacta con nosotros' },
];

const PRIVACY_LINKS = [
  { href: '/politica-privacidad', label: 'Política de privacidad' },
  { href: '/politica-cookies', label: 'Política de cookies' },
  { href: '/proteccion-datos', label: 'Protección de datos' },
  { href: '/blog', label: 'Blog' },
];

export default function LegalHubPage() {
  return (
    <div className="legal-hub">
      <h1>Legal y privacidad</h1>

      <section className="legal-hub__group">
        <p className="legal-hub__title">Legal</p>
        <ul className="legal-hub__list">
          {LEGAL_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="legal-hub__group">
        <p className="legal-hub__title">Privacidad</p>
        <ul className="legal-hub__list">
          {PRIVACY_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => window.dispatchEvent(new Event('dralo:open-cookie-settings'))}>
              Ajustes de cookies
            </button>
          </li>
        </ul>
      </section>

      <p className="legal-hub__note">
        En iPhone o iPad: pulsa Compartir y “Añadir a pantalla de inicio”. En Android: abre el menú ⋮ y
        pulsa “Instalar aplicación”.
      </p>

      <div className="legal-hub__tagline">
        <DraloTagline className="dralo-tagline--footer" />
        <p>{SITE_FOOTER_TAGLINE}</p>
        <p>© {new Date().getFullYear()} Dralo · Versión Alpha 1.0.0</p>
      </div>
    </div>
  );
}
