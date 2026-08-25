import DraloTagline from '@/components/DraloTagline';
import SiteMascot from '@/components/SiteMascot';

export default function BlogMasthead() {
  return (
    <header className="blog-mag__masthead">
      <div className="blog-mag__masthead-scene" aria-hidden="true">
        <svg
          className="blog-mag__masthead-blobs"
          viewBox="0 0 1440 640"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <defs>
            <linearGradient id="blogMastBase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="48%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#5b21b6" />
            </linearGradient>
            <filter id="blogMastGoo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"
                result="goo"
              />
            </filter>
          </defs>
          <rect width="1440" height="640" fill="url(#blogMastBase)" />
          <g filter="url(#blogMastGoo)" fill="#4c1d95">
            <circle className="blog-mag__blob blog-mag__blob--a" cx="150" cy="70" r="190" />
            <circle className="blog-mag__blob blog-mag__blob--b" cx="420" cy="-10" r="160" />
            <circle className="blog-mag__blob blog-mag__blob--c" cx="70" cy="430" r="170" />
            <circle className="blog-mag__blob blog-mag__blob--d" cx="560" cy="520" r="150" />
            <circle className="blog-mag__blob blog-mag__blob--e" cx="880" cy="80" r="180" />
            <circle className="blog-mag__blob blog-mag__blob--f" cx="1180" cy="40" r="200" />
            <circle className="blog-mag__blob blog-mag__blob--g" cx="1320" cy="380" r="170" />
            <circle className="blog-mag__blob blog-mag__blob--h" cx="980" cy="480" r="140" />
            <circle className="blog-mag__blob blog-mag__blob--i" cx="720" cy="260" r="110" />
          </g>
          <g filter="url(#blogMastGoo)" fill="#6d28d9" opacity="0.55">
            <circle className="blog-mag__blob blog-mag__blob--j" cx="300" cy="240" r="90" />
            <circle className="blog-mag__blob blog-mag__blob--k" cx="1080" cy="220" r="100" />
          </g>
        </svg>

        <span className="blog-mag__masthead-spark blog-mag__masthead-spark--1" />
        <span className="blog-mag__masthead-spark blog-mag__masthead-spark--2" />
        <span className="blog-mag__masthead-spark blog-mag__masthead-spark--3" />
        <span className="blog-mag__masthead-spark blog-mag__masthead-spark--4" />
        <span className="blog-mag__masthead-spark blog-mag__masthead-spark--5" />
      </div>

      <div className="blog-mag__shell blog-mag__masthead-inner">
        <div className="blog-mag__masthead-copy">
          <p className="blog-mag__masthead-eyebrow">Blog Dralo</p>
          <h1 className="blog-mag__masthead-title">
            Reflexiones, consejos e ideas para aprender inglés
          </h1>
          <p className="blog-mag__masthead-lead">
            Novedades de la plataforma, recursos para estudiantes y contenido en profundidad del
            equipo Dralo. Practica, mejora y mantente al día.
          </p>
          <DraloTagline className="blog-mag__masthead-tagline" />
        </div>

        <div className="blog-mag__masthead-hero">
          <div className="blog-mag__masthead-orb" />
          <SiteMascot
            variant={3}
            width={440}
            priority
            className="blog-mag__masthead-mascot"
            alt="Dralo"
          />
        </div>
      </div>

      <svg
        className="blog-mag__masthead-wave"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path fill="#f8fafc" d="M0 48H1440v42H0Z" />
      </svg>
    </header>
  );
}
