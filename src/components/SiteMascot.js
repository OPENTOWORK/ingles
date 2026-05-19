'use client';

import { sitePublicPath } from '@/utils/sitePublicPath';
import { MASCOT_LOGO_VARIANT, MASCOT_VARIANTS } from '@/config/mascotAssets';

const VALID = new Set(MASCOT_VARIANTS);

/**
 * Mascota Dralo (PNG sin fondo en /public/mascot/).
 * @param {number} variant 1–8, 10 o 11 (logo)
 * @param {number} [width] ancho mostrado en px
 */
export default function SiteMascot({
  variant = 6,
  width = 200,
  className = '',
  style,
  alt,
  priority = false,
}) {
  const n = Number(variant);
  const v = VALID.has(n) ? n : 6;
  const w = typeof width === 'number' && width > 0 ? width : 200;
  const isLogo = v === MASCOT_LOGO_VARIANT;

  return (
    <img
      className={`site-mascot${isLogo ? ' site-mascot--logo' : ''} ${className}`.trim()}
      src={sitePublicPath(`/mascot/${v}.png`)}
      alt={alt ?? (isLogo ? 'Dralo' : 'Dralo, mascota de English Practice')}
      width={w}
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={{
        width: w,
        height: 'auto',
        maxWidth: '100%',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
