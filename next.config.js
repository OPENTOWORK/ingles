// Build estático (carpeta `out/`):
//   npm run build:static
// Si `out/` tiene pocas rutas (~cientos de archivos) o ves errores de chunks en dev:
//   1) Para `npm run dev`
//   2) npm run build:static:full   (limpia .next y out, luego export completo)
// Luego sube todo `out/` al hosting. Subcarpeta: NEXT_PUBLIC_BASE_PATH=/ruta npm run build:static
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'react-hot-toast',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },
  // Solo en build de producción: Turbopack (`next dev --turbo`) no admite compiler.removeConsole.
  ...(process.env.NODE_ENV === 'production'
    ? {
        compiler: {
          removeConsole: { exclude: ['error', 'warn'] },
        },
      }
    : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  async redirects() {
    const cefr = 'a2|b1|b2|c1|c2';

    /* Old short URLs (/b2, /b2/exam-reading, /speaking-lab/b2, …) → /niveles/… */
    const legacyLevelRedirects = [
      {
        source: `/speaking-lab/:level(${cefr})/:path*`,
        destination: `/niveles/speaking-lab/:level/:path*`,
        permanent: true,
      },
      {
        source: `/speaking-lab/:level(${cefr})`,
        destination: `/niveles/speaking-lab/:level/`,
        permanent: true,
      },
      {
        source: `/level/:level(${cefr})/:path*`,
        destination: `/niveles/:level/:path*`,
        permanent: true,
      },
      {
        source: `/level/:level(${cefr})`,
        destination: `/niveles/:level/`,
        permanent: true,
      },
      {
        source: `/nivel/:level(${cefr})/:path*`,
        destination: `/niveles/:level/:path*`,
        permanent: true,
      },
      {
        source: `/nivel/:level(${cefr})`,
        destination: `/niveles/:level/`,
        permanent: true,
      },
      {
        source: '/levels',
        destination: '/niveles/',
        permanent: true,
      },
      {
        source: `/:level(${cefr})/:path*`,
        destination: `/niveles/:level/:path*`,
        permanent: true,
      },
      {
        source: `/:level(${cefr})`,
        destination: `/niveles/:level/`,
        permanent: true,
      },
    ];

    /* Old URLs /niveles/b2/speaking-lab/… → /niveles/speaking-lab/b2/… (path* may be empty for hub) */
    const examPartTipsRedirects = [
      'reading-and-use-of-english',
      'writing',
      'listening',
      'speaking',
    ].flatMap((skill) => {
      const rules = [
        {
          source: `/niveles/:level(a2|b1|b2|c1|c2)/${skill}/part-:part`,
          destination: `/teoria/exam-part-tips/:level/${skill}/part-:part`,
        },
      ];
      if (skill === 'listening' || skill === 'speaking') {
        rules.push({
          source: `/niveles/:level(a2|b1|b2|c1|c2)/${skill}/:part`,
          destination: `/teoria/exam-part-tips/:level/${skill}/:part`,
        });
      }
      return rules.map((rule) => ({ ...rule, permanent: false }));
    });

    return [
      ...legacyLevelRedirects,
      {
        source: '/niveles/:cefr(a2|b1|b2|c1|c2)/speaking-lab/:path*',
        destination: '/niveles/speaking-lab/:cefr/:path*',
        permanent: false,
      },
      ...examPartTipsRedirects,
    ];
  },
};

module.exports = nextConfig;
