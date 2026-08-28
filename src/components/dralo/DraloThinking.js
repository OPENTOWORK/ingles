'use client';

import { sitePublicPath } from '@/utils/sitePublicPath';

/** Proporción real del PNG (376 × 512), para reservar el hueco y evitar saltos de layout. */
const MASCOT_RATIO = 512 / 376;

const DEFAULT_LABEL = {
  en: 'Dralo is thinking',
  es: 'Dralo está pensando',
};

/**
 * Estado de espera de la IA: mascota Dralo en pose pensativa + puntos animados.
 * @param {'block'|'inline'} variant `block` centra la mascota; `inline` la coloca en fila.
 */
export default function DraloThinking({
  label,
  lang = 'en',
  size = 96,
  variant = 'block',
  className = '',
}) {
  const text = label ?? (lang === 'es' ? DEFAULT_LABEL.es : DEFAULT_LABEL.en);
  const w = typeof size === 'number' && size > 0 ? size : 96;

  return (
    <div
      className={`dralo-thinking dralo-thinking--${variant} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <img
        className="dralo-thinking__mascot"
        src={sitePublicPath('/dralo-thinking.png')}
        alt=""
        width={w}
        height={Math.round(w * MASCOT_RATIO)}
        draggable={false}
        decoding="async"
        style={{ width: w }}
      />
      <p className="dralo-thinking__label">
        {text}
        <span className="dralo-thinking__dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}
