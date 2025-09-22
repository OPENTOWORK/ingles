// next.config.js
const isProd = process.env.NODE_ENV === 'production'
const repo = 'ingles'  // <- nombre exacto del repo

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',              // genera HTML estático en /out
  images: { unoptimized: true }, // requerido para Pages
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  trailingSlash: true            // evita 404 con rutas estáticas
}
