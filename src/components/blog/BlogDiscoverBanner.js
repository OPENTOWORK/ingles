import Link from 'next/link';

/**
 * @param {{ variant?: 'practice' | 'community' }} props
 */
export default function BlogDiscoverBanner({ variant = 'practice' }) {
  if (variant === 'community') {
    return (
      <aside className="blog-mag__discover blog-mag__discover--community">
        <div className="blog-mag__discover-inner">
          <p className="blog-mag__discover-kicker">Comunidad Dralo</p>
          <h3 className="blog-mag__discover-title">¿Tienes dudas o sugerencias?</h3>
          <p className="blog-mag__discover-text">
            Escríbenos desde la página de contacto. Nos ayuda a mejorar la plataforma y el contenido
            del blog.
          </p>
          <Link href="/contact" className="blog-mag__discover-btn blog-mag__discover-btn--ghost">
            Ir a contacto
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="blog-mag__discover">
      <div className="blog-mag__discover-inner">
        <p className="blog-mag__discover-kicker">Pon en práctica lo que lees</p>
        <h3 className="blog-mag__discover-title">Entrena inglés con exámenes por partes en Dralo</h3>
        <p className="blog-mag__discover-text">
          Reading, listening, writing y speaking con feedback, progreso guardado y modo examen cuando
          quieras medirte.
        </p>
        <div className="blog-mag__discover-actions">
          <Link href="/exam-practice" className="blog-mag__discover-btn">
            Empezar a practicar
          </Link>
          <Link href="/niveles/b2/exam-mode" className="blog-mag__discover-btn blog-mag__discover-btn--ghost">
            Modo examen B2
          </Link>
        </div>
      </div>
    </aside>
  );
}
