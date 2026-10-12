import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  chooseCardSide,
  clampRectToViewport,
  easeInOutCubic,
  lerpRect,
  padRect,
  placeCardAtSide,
  unionRects,
} from '@/lib/tutorialGeometry.js';

const desktop = { w: 1280, h: 800 };
const phone = { w: 390, h: 844 };
const card = { w: 392, h: 260 };

describe('tutorialGeometry', () => {
  it('la curva empieza parada, pasa por el medio y termina parada', () => {
    assert.equal(easeInOutCubic(0), 0);
    assert.equal(easeInOutCubic(0.5), 0.5);
    assert.equal(easeInOutCubic(1), 1);
    for (let t = 0; t < 1; t += 0.05) {
      assert.ok(easeInOutCubic(t + 0.05) >= easeInOutCubic(t));
    }
  });

  it('interpola posición, tamaño y radio del foco', () => {
    const from = { x: 0, y: 0, w: 100, h: 50, r: 0 };
    const to = { x: 100, y: 200, w: 300, h: 150, r: 20 };
    assert.deepEqual(lerpRect(from, to, 0.5), { x: 50, y: 100, w: 200, h: 100, r: 10 });
  });

  it('une el destacado con su desplegable y añade margen', () => {
    const union = unionRects([
      { x: 100, y: 10, w: 80, h: 40 },
      { x: 90, y: 50, w: 200, h: 120 },
    ]);
    assert.deepEqual(union, { x: 90, y: 10, w: 200, h: 160 });
    assert.deepEqual(padRect(union, 8), { x: 82, y: 2, w: 216, h: 176 });
  });

  it('recorta el destacado a la pantalla y descarta lo que queda fuera', () => {
    assert.deepEqual(clampRectToViewport({ x: 100, y: -50, w: 200, h: 150 }, desktop), {
      x: 100,
      y: 6,
      w: 200,
      h: 94,
    });
    assert.equal(clampRectToViewport({ x: 100, y: 900, w: 200, h: 100 }, desktop), null);
  });

  it('sin destacado la tarjeta va centrada', () => {
    assert.equal(chooseCardSide({ target: null, card, viewport: desktop }), 'center');
    assert.deepEqual(placeCardAtSide({ side: 'center', target: null, card, viewport: desktop }), {
      x: 444,
      y: 270,
    });
  });

  it('en escritorio busca el lado libre, empezando por el preferido', () => {
    const top = { x: 400, y: 20, w: 120, h: 40 };
    const bottom = { x: 400, y: 640, w: 300, h: 120 };
    assert.equal(chooseCardSide({ target: top, card, viewport: desktop }), 'bottom');
    assert.equal(chooseCardSide({ target: bottom, card, viewport: desktop }), 'top');
    assert.equal(chooseCardSide({ target: bottom, card, viewport: desktop, preferred: 'top' }), 'top');
    assert.equal(chooseCardSide({ target: top, card, viewport: desktop, preferred: 'top' }), 'bottom');
  });

  it('si el destacado ocupa casi toda la pantalla la tarjeta va encima', () => {
    const huge = { x: 10, y: 10, w: 1260, h: 780 };
    assert.equal(chooseCardSide({ target: huge, card, viewport: desktop }), 'overlay');
  });

  it('en móvil la tarjeta es una hoja arriba o abajo del destacado', () => {
    const sheetCard = { w: 366, h: 300 };
    const high = { x: 330, y: 176, w: 40, h: 90 };
    const low = { x: 10, y: 600, w: 370, h: 120 };
    assert.equal(chooseCardSide({ target: high, card: sheetCard, viewport: phone, sheet: true }), 'bottom');
    assert.equal(chooseCardSide({ target: low, card: sheetCard, viewport: phone, sheet: true }), 'top');
    assert.deepEqual(
      placeCardAtSide({ side: 'bottom', target: high, card: sheetCard, viewport: phone, sheet: true }),
      { x: 12, y: 532 },
    );
    assert.deepEqual(
      placeCardAtSide({ side: 'top', target: low, card: sheetCard, viewport: phone, sheet: true }),
      { x: 12, y: 12 },
    );
  });

  it('la tarjeta nunca se sale de la pantalla', () => {
    const corner = { x: 1200, y: 20, w: 60, h: 30 };
    for (const side of ['bottom', 'top', 'right', 'left', 'overlay']) {
      const { x, y } = placeCardAtSide({ side, target: corner, card, viewport: desktop });
      assert.ok(x >= 12 && x + card.w <= desktop.w - 12, `${side}: x=${x}`);
      assert.ok(y >= 12 && y + card.h <= desktop.h - 12, `${side}: y=${y}`);
    }
  });

  it('debajo del destacado queda centrada respecto a él', () => {
    const target = { x: 500, y: 100, w: 200, h: 60 };
    assert.deepEqual(placeCardAtSide({ side: 'bottom', target, card, viewport: desktop }), {
      x: 404,
      y: 176,
    });
  });
});
