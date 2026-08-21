import Link from 'next/link';
import DraloTagline from '@/components/DraloTagline';
import SiteMascot from '@/components/SiteMascot';
import { MASCOT_LOGO_VARIANT } from '@/config/mascotAssets';

/**
 * @param {{
 *   variant?: 'masthead' | 'section' | 'article' | 'discover' | 'placeholder' | 'inline',
 *   className?: string,
 * }} props
 */
export default function BlogDraloBrand({ variant = 'section', className = '' }) {
  const rootClass = ['blog-dralo-brand', `blog-dralo-brand--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  if (variant === 'inline') {
    return (
      <span className={rootClass} aria-label="Dralo">
        <SiteMascot variant={MASCOT_LOGO_VARIANT} width={52} className="blog-dralo-brand__logo" />
      </span>
    );
  }

  if (variant === 'masthead') {
    return (
      <div className={rootClass} aria-hidden="false">
        <SiteMascot variant={MASCOT_LOGO_VARIANT} width={112} priority className="blog-dralo-brand__logo" />
        <DraloTagline className="blog-dralo-brand__tagline" />
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={rootClass}>
        <SiteMascot variant={MASCOT_LOGO_VARIANT} width={88} className="blog-dralo-brand__logo" />
        <div className="blog-dralo-brand__copy">
          <p className="blog-dralo-brand__kicker">Por Dralo</p>
          <DraloTagline className="blog-dralo-brand__tagline blog-dralo-brand__tagline--sm" />
        </div>
      </div>
    );
  }

  if (variant === 'article') {
    return (
      <aside className={rootClass} aria-label="Dralo">
        <SiteMascot variant={6} width={96} className="blog-dralo-brand__mascot" />
        <div className="blog-dralo-brand__copy">
          <p className="blog-dralo-brand__kicker">¿Te ha gustado?</p>
          <p className="blog-dralo-brand__title">Practica inglés con exámenes oficiales en Dralo</p>
          <DraloTagline className="blog-dralo-brand__tagline blog-dralo-brand__tagline--sm" />
          <div className="blog-dralo-brand__actions">
            <Link href="/exam-practice" className="blog-dralo-brand__btn">
              Empezar a practicar
            </Link>
            <Link href="/blog" className="blog-dralo-brand__btn blog-dralo-brand__btn--ghost">
              Más del blog
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  if (variant === 'discover') {
    return (
      <div className={rootClass} aria-hidden="true">
        <SiteMascot variant={12} width={84} className="blog-dralo-brand__mascot" />
      </div>
    );
  }

  return (
    <div className={rootClass} aria-hidden="true">
      <SiteMascot variant={6} width={72} className="blog-dralo-brand__mascot" />
    </div>
  );
}
