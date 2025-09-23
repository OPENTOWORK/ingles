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

// Solo export estático en producción (por ejemplo, para GitHub Pages)
module.exports = isProd ? { ...nextConfig, output: 'export' } : nextConfig
