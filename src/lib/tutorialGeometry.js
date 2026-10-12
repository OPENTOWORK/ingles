const GAP = 16;
const MARGIN = 12;
const SIDES = ['bottom', 'top', 'right', 'left'];

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpPoint(from, to, t) {
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
}

export function lerpRect(from, to, t) {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    w: lerp(from.w, to.w, t),
    h: lerp(from.h, to.h, t),
    r: lerp(from.r || 0, to.r || 0, t),
  };
}

export function padRect(rect, pad) {
  return { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
}

export function unionRects(rects) {
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.w));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** Parte visible del destacado; null si queda fuera de la pantalla. */
export function clampRectToViewport(rect, viewport, margin = 6) {
  const left = Math.max(rect.x, margin);
  const top = Math.max(rect.y, margin);
  const right = Math.min(rect.x + rect.w, viewport.w - margin);
  const bottom = Math.min(rect.y + rect.h, viewport.h - margin);
  if (right - left < 8 || bottom - top < 8) return null;
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function fitsSide(side, target, card, viewport) {
  switch (side) {
    case 'bottom':
      return target.y + target.h + GAP + card.h <= viewport.h - MARGIN;
    case 'top':
      return target.y - GAP - card.h >= MARGIN;
    case 'right':
      return target.x + target.w + GAP + card.w <= viewport.w - MARGIN;
    case 'left':
      return target.x - GAP - card.w >= MARGIN;
    default:
      return false;
  }
}

/**
 * Lado de la tarjeta respecto al destacado: el preferido si cabe, si no el primero libre.
 * En móvil la tarjeta es una hoja arriba o abajo; `overlay` = no cabe en ningún lado.
 */
export function chooseCardSide({ target, card, viewport, sheet = false, preferred = null }) {
  if (!target) return 'center';
  if (sheet) {
    const below = target.y + target.h + GAP + card.h <= viewport.h - MARGIN;
    const above = target.y - GAP - card.h >= MARGIN;
    if (preferred === 'top' && above) return 'top';
    if (below) return 'bottom';
    if (above) return 'top';
    return target.y + target.h / 2 > viewport.h / 2 ? 'top' : 'bottom';
  }
  const order = SIDES.includes(preferred)
    ? [preferred, ...SIDES.filter((side) => side !== preferred)]
    : SIDES;
  return order.find((side) => fitsSide(side, target, card, viewport)) || 'overlay';
}

/** Posición de la tarjeta en un lado, siempre dentro de la pantalla. */
export function placeCardAtSide({ side, target, card, viewport, sheet = false }) {
  const maxX = Math.max(MARGIN, viewport.w - card.w - MARGIN);
  const maxY = Math.max(MARGIN, viewport.h - card.h - MARGIN);
  const clampX = (x) => Math.min(Math.max(x, MARGIN), maxX);
  const clampY = (y) => Math.min(Math.max(y, MARGIN), maxY);
  const centeredX = clampX((viewport.w - card.w) / 2);

  if (!target || side === 'center') {
    return { x: centeredX, y: clampY((viewport.h - card.h) / 2) };
  }
  if (sheet) {
    return { x: centeredX, y: side === 'top' ? MARGIN : maxY };
  }

  const centerX = target.x + target.w / 2;
  const centerY = target.y + target.h / 2;
  switch (side) {
    case 'bottom':
      return { x: clampX(centerX - card.w / 2), y: clampY(target.y + target.h + GAP) };
    case 'top':
      return { x: clampX(centerX - card.w / 2), y: clampY(target.y - GAP - card.h) };
    case 'right':
      return { x: clampX(target.x + target.w + GAP), y: clampY(centerY - card.h / 2) };
    case 'left':
      return { x: clampX(target.x - GAP - card.w), y: clampY(centerY - card.h / 2) };
    default:
      return { x: clampX(maxX - MARGIN), y: clampY(maxY - MARGIN) };
  }
}
