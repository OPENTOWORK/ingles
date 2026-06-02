-- Catálogo Dralo: FREE · STARTER · PREMIUM · PRO
-- Ejecutar en Supabase SQL Editor. Compatible con tablas existentes.

ALTER TABLE monetizacion_planes ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE monetizacion_planes ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE monetizacion_planes ADD COLUMN IF NOT EXISTS orden integer DEFAULT 0;
ALTER TABLE monetizacion_planes ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE monetizacion_planes ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS monetizacion_planes_slug_key ON monetizacion_planes (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN monetizacion_planes.slug IS 'free | starter | premium | pro';
COMMENT ON COLUMN monetizacion_planes.stripe_price_id IS 'Stripe Price ID (price_xxx) para checkout';
COMMENT ON COLUMN monetizacion_planes.metadata IS 'entitlements, descripcion_corta, recommended';

-- Desactivar planes legacy (no borrar suscripciones históricas)
UPDATE monetizacion_planes
SET activo = false
WHERE nombre IN (
  'Gratis A2',
  'Premium B2 mensual',
  'Premium B2 anual',
  'Premium C1 mensual',
  'Premium todo acceso'
);

-- Upsert catálogo (ajusta stripe_price_id cuando conectes Stripe)
INSERT INTO monetizacion_planes (nombre, slug, descripcion, precio, duracion_dias, activo, badge, orden, stripe_price_id, metadata, creado_en)
VALUES
  (
    'FREE',
    'free',
    'Acceso completo al nivel A2, 1 examen mensual, Placement Test y Dralo AI limitado (3 consultas/día).',
    0,
    36500,
    true,
    NULL,
    0,
    NULL,
    '{"descripcion_corta":"Empieza a aprender inglés gratis.","recommended":false}'::jsonb,
    now()
  ),
  (
    'STARTER',
    'starter',
    'A2 y B1 completos, exámenes ilimitados en esos niveles, corrección Writing básica y 20 consultas Dralo AI al día.',
    4.99,
    30,
    true,
    NULL,
    1,
    NULL,
    '{"descripcion_corta":"Para estudiantes que quieren progresar de forma constante.","recommended":false}'::jsonb,
    now()
  ),
  (
    'PREMIUM',
    'premium',
    'Todos los niveles A2–C2, exámenes ilimitados, Writing avanzado, Speaking Coach y 60 consultas Dralo AI al día.',
    9.99,
    30,
    true,
    '🏆 MÁS POPULAR',
    2,
    NULL,
    '{"descripcion_corta":"La opción más popular para preparar exámenes y mejorar rápidamente.","recommended":true}'::jsonb,
    now()
  ),
  (
    'PRO',
    'pro',
    'Todo lo de Premium más AI Personal Tutor, Pronunciation Coach y conversaciones ilimitadas con Dralo AI.',
    14.99,
    30,
    true,
    '🚀 MEJOR VALOR',
    3,
    NULL,
    '{"descripcion_corta":"La experiencia más completa con IA avanzada.","recommended":false}'::jsonb,
    now()
  )
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  duracion_dias = EXCLUDED.duracion_dias,
  activo = EXCLUDED.activo,
  badge = EXCLUDED.badge,
  orden = EXCLUDED.orden,
  stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, monetizacion_planes.stripe_price_id);
