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
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  async redirects() {
    /* Old URLs /niveles/b2/speaking-lab/… → /niveles/speaking-lab/b2/… (path* may be empty for hub) */
    return [
      {
        source: '/niveles/:cefr(a2|b1|b2|c1|c2)/speaking-lab/:path*',
        destination: '/niveles/speaking-lab/:cefr/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
