import Link from 'next/link';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  title: SEO_PAGE_META.contact.title,
  description: SEO_PAGE_META.contact.description,
  alternates: { canonical: '/contact/' },
};

export default function ContactLandingPage() {
  return (
    <main className="shell public-seo-page">
      <header className="public-seo-page__hero">
        <p className="public-seo-page__eyebrow">Contact</p>
        <h1>Contacta con Dralo Academy</h1>
        <p className="public-seo-page__lead">
          ¿Dudas sobre la plataforma, exámenes o tu cuenta? Escríbenos — también puedes abrir un
          ticket de soporte si ya tienes sesión iniciada.
        </p>
        <div className="public-seo-page__actions">
          <Link href="/contacto/" className="home-cta__btn home-cta__btn--inline">
            Ir al formulario de contacto
          </Link>
          <Link href="/login/" className="public-seo-page__secondary-link">
            Iniciar sesión
          </Link>
        </div>
      </header>
    </main>
  );
}
