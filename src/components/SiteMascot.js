'use client';

import { sitePublicPath } from '@/utils/sitePublicPath';

const VALID = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10]);

/**
 * Mascota Dralo (PNG sin fondo en /public/mascot/).
 * @param {1|2|3|4|5|6|7|8|10} variant
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
  const v = VALID.has(Number(variant)) ? Number(variant) : 6;
  const w = typeof width === 'number' && width > 0 ? width : 200;

  return (
    <img
      className={className}
      src={sitePublicPath(`/mascot/${v}.png`)}
      alt={alt ?? 'Dralo, mascota de English Practice'}
      width={w}
      height={w}
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={{
        width: w,
        height: 'auto',
        maxWidth: '100%',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
}
