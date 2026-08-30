-- Actualiza precios de lanzamiento en monetizacion_planes (sin columna slug).
UPDATE monetizacion_planes SET precio = 3.99, activo = true WHERE nombre = 'PLUS';
UPDATE monetizacion_planes SET precio = 8.99, activo = true WHERE nombre = 'PREMIUM';
UPDATE monetizacion_planes SET activo = false WHERE nombre IN ('STARTER', 'PRO');
