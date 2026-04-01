// next.config.js
const isProd = process.env.NODE_ENV === 'production'
const repo = 'ingles'  // <- nombre exacto del repo

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true }, // requerido para Pages
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  trailingSlash: true            // evita 404 con rutas estáticas
}

// Export estático solo si NEXT_STATIC_EXPORT=1 (GitHub Pages). Sin eso, `next build` falla por rutas dinámicas [part], etc.
const useStaticExport = process.env.NEXT_STATIC_EXPORT === '1'
module.exports =
  isProd && useStaticExport ? { ...nextConfig, output: 'export' } : nextConfig
