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
      'date-fns',
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
    unoptimized: isStaticExport,
  },
  compress: true,
  serverExternalPackages: ['ffmpeg-static', 'music-metadata'],
  async headers() {
    if (isStaticExport) return [];
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  async rewrites() {
    const examSkillSlugs =
      'reading-and-use-of-english|writing|listening|speaking|use-of-english|reading';

    return {
      beforeFiles: [
        {
          source: '/exam-practice/:path+',
          destination: '/niveles/:path+',
        },
        {
          source: '/contact/:path*',
          destination: '/contacto/:path*',
        },
        {
          source: '/profile/:path*',
          destination: '/perfil/:path*',
        },
        {
          source: '/exam-strategies/exam-part-tips/:path*',
          destination: '/teoria/exam-part-tips/:path*',
        },
        {
          source: '/exam-strategies/:skill/:chapter',
          destination: '/teoria/exam-strategies/:skill/:chapter',
        },
        {
          source: `/exam-strategies/:skill(${examSkillSlugs})`,
          destination: '/teoria/:skill',
        },
      ],
    };
  },
  async redirects() {
    const cefr = 'a2|b1|b2|c1|c2';
    const examSkillSlugs = [
      'reading-and-use-of-english',
      'writing',
      'listening',
      'speaking',
      'use-of-english',
      'reading',
    ];

    /* Old short URLs (/b2, /b2/exam-reading, /speaking-lab/b2, …) → /exam-practice/… */
    const legacyLevelRedirects = [
      {
        source: `/speaking-lab/:level(${cefr})/:path*`,
        destination: `/exam-practice/speaking-lab/:level/:path*`,
        permanent: true,
      },
      {
        source: `/speaking-lab/:level(${cefr})`,
        destination: `/exam-practice/speaking-lab/:level/`,
        permanent: true,
      },
      {
        source: `/level/:level(${cefr})/:path*`,
        destination: `/exam-practice/:level/:path*`,
        permanent: true,
      },
      {
        source: `/level/:level(${cefr})`,
        destination: `/exam-practice/:level/`,
        permanent: true,
      },
      {
        source: `/nivel/:level(${cefr})/:path*`,
        destination: `/exam-practice/:level/:path*`,
        permanent: true,
      },
      {
        source: `/nivel/:level(${cefr})`,
        destination: `/exam-practice/:level/`,
        permanent: true,
      },
      {
        source: '/levels',
        destination: '/exam-practice/b2/',
        permanent: true,
      },
      {
        source: `/:level(${cefr})/:path*`,
        destination: `/exam-practice/:level/:path*`,
        permanent: true,
      },
      {
        source: `/:level(${cefr})`,
        destination: `/exam-practice/:level/`,
        permanent: true,
      },
    ];

    const examPartTipsRedirects = [
      'reading-and-use-of-english',
      'writing',
      'listening',
      'speaking',
    ].flatMap((skill) => {
      const rules = [
        {
          source: `/niveles/:level(a2|b1|b2|c1|c2)/${skill}/part-:part`,
          destination: `/exam-strategies/exam-part-tips/:level/${skill}/part-:part`,
        },
      ];
      if (skill === 'listening' || skill === 'speaking') {
        rules.push({
          source: `/niveles/:level(a2|b1|b2|c1|c2)/${skill}/:part`,
          destination: `/exam-strategies/exam-part-tips/:level/${skill}/:part`,
        });
      }
      return rules.map((rule) => ({ ...rule, permanent: true }));
    });

    const teoriaExamSkillRedirects = examSkillSlugs.map((skill) => ({
      source: `/teoria/${skill}`,
      destination: `/exam-strategies/${skill}/`,
      permanent: true,
    }));

    const canonicalSectionRedirects = [
      {
        source: '/niveles',
        has: [{ type: 'query', key: 'tab', value: 'theory' }],
        destination: '/exam-strategies/',
        permanent: true,
      },
      {
        source: '/niveles/',
        has: [{ type: 'query', key: 'tab', value: 'theory' }],
        destination: '/exam-strategies/',
        permanent: true,
      },
      {
        source: '/niveles',
        destination: '/exam-practice/b2/',
        permanent: true,
      },
      {
        source: '/niveles/:path*',
        destination: '/exam-practice/:path*',
        permanent: true,
      },
      {
        source: '/teoria/exam-part-tips/:path*',
        destination: '/exam-strategies/exam-part-tips/:path*',
        permanent: true,
      },
      {
        source: '/teoria/exam-strategies/:skill/:chapter',
        destination: '/exam-strategies/:skill/:chapter/',
        permanent: true,
      },
      ...teoriaExamSkillRedirects,
      {
        source: '/contacto/:path*',
        destination: '/contact/:path*',
        permanent: true,
      },
      {
        source: '/contacto',
        destination: '/contact/',
        permanent: true,
      },
      {
        source: '/perfil/:path*',
        destination: '/profile/:path*',
        permanent: true,
      },
      {
        source: '/perfil',
        destination: '/profile/',
        permanent: true,
      },
      {
        source: '/exam-theory',
        destination: '/exam-strategies/',
        permanent: true,
      },
      {
        source: '/exam-theory/:path*',
        destination: '/exam-strategies/',
        permanent: true,
      },
    ];

    return [
      ...canonicalSectionRedirects,
      ...legacyLevelRedirects,
      {
        source: '/register',
        destination: '/registro/',
        permanent: true,
      },
      {
        source: '/niveles/:cefr(a2|b1|b2|c1|c2)/speaking-lab/:path*',
        destination: '/exam-practice/speaking-lab/:cefr/:path*',
        permanent: true,
      },
      ...examPartTipsRedirects,
    ];
  },
};

module.exports = nextConfig;
