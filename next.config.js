// Build estático: tras `npm run build`, sube TODO el contenido de la carpeta `out/`
// al directorio public_html de tu hosting (Dondominio), sustituyendo o mezclando archivos según tu caso.
// Si el sitio vive en una subcarpeta del dominio, compila con NEXT_PUBLIC_BASE_PATH=/nombre-subcarpeta
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
};

module.exports = nextConfig;
