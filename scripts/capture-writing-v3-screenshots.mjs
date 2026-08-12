#!/usr/bin/env node
/**
 * Capturas del interfaz Writing v3 para la revisión visual R6 (Fase 8).
 *
 * Lee la ruta interna de previsualización, que solo sirve fixtures estáticas: no
 * toca base de datos, no llama a ningún modelo y no existe en producción.
 *
 * Uso (con `npm run dev` levantado):
 *   npm run writing:screenshots
 *   WRITING_V3_BASE_URL=http://localhost:3001 npm run writing:screenshots
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const BASE_URL = process.env.WRITING_V3_BASE_URL ?? 'http://localhost:3000';
const ROUTE = '/dralo-dev/writing-v3/';
const OUT_DIR = path.join(process.cwd(), 'docs', 'writing-v3', 'screenshots');

const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 834, height: 1112 };
const MOBILE = { width: 390, height: 844 };

async function dismissCookieBanner(page) {
  // El banner de cookies es parte del shell real; se acepta lo mínimo para que no
  // tape la mitad inferior de la captura.
  const button = page.getByRole('button', { name: /SOLO COOKIES NECESARIAS/i });
  if (await button.count()) {
    await button.first().click();
    await page.waitForTimeout(200);
  }
}

async function waitForWritingMap(page) {
  const loading = page.locator('.writing-v3-harness--loading');
  if (await loading.count()) {
    await loading.waitFor({ state: 'detached', timeout: 90_000 });
  }
  await page.waitForSelector('.writing-map__text', { timeout: 90_000 });
}

async function openFixture(page, viewport, fixture) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE_URL}${ROUTE}?fixture=${fixture}`, { waitUntil: 'domcontentloaded' });
  await waitForWritingMap(page);
  await dismissCookieBanner(page);
  await page.getByRole('tab', { name: fixture, exact: true }).click();
  await waitForWritingMap(page);
  // Las animaciones de entrada duran ~160 ms; se esperan para no capturarlas a medias.
  await page.waitForTimeout(350);
  return page;
}

async function shot(page, name, { fullPage = false } = {}) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  console.log(`ok  ${path.relative(process.cwd(), file)}`);
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 1) {
    console.warn(`WARN ${label}: desbordamiento horizontal de ${overflow}px`);
  } else {
    console.log(`ok  ${label}: sin desbordamiento horizontal`);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();
  const desktopOnly = process.env.WRITING_V3_DESKTOP_ONLY === '1';

  // A — escritorio, estado inicial
  await openFixture(page, DESKTOP, 'standard');
  await assertNoHorizontalOverflow(page, 'desktop');
  await shot(page, 'A-desktop-initial');
  if (!desktopOnly) {
    await shot(page, 'A-desktop-initial-full', { fullPage: true });
  }

  // B — escritorio, una burbuja abierta
  const marks = page.locator('.writing-map__mark');
  await marks.nth(2).scrollIntoViewIfNeeded();
  await marks.nth(2).click();
  await page.waitForSelector('.writing-map__bubble');
  await page.waitForTimeout(250);
  await shot(page, 'B-desktop-annotation-open');

  // C — escritorio, un criterio desplegado
  await page.keyboard.press('Escape');
  await page.locator('.writing-criterion__toggle').first().click();
  await page.waitForTimeout(200);
  await page.locator('.writing-v3__criteria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot(page, 'C-desktop-criterion-expanded');

  if (desktopOnly) {
    await browser.close();
    return;
  }
  await openFixture(page, MOBILE, 'standard');
  await assertNoHorizontalOverflow(page, 'mobile');
  await shot(page, 'D-mobile-initial');

  // E — móvil, hoja inferior abierta
  await page.locator('.writing-map__mark').nth(2).scrollIntoViewIfNeeded();
  await page.locator('.writing-map__mark').nth(2).click();
  await page.waitForSelector('.writing-map__sheet');
  await page.waitForTimeout(300);
  await shot(page, 'E-mobile-bottom-sheet');

  // F — móvil, sección de criterios
  await page.keyboard.press('Escape');
  await page.locator('.writing-v3__criteria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await shot(page, 'F-mobile-criteria');

  // G — sin fortalezas
  await openFixture(page, DESKTOP, 'zero-strengths');
  await shot(page, 'G-desktop-zero-strengths');
  await shot(page, 'G-desktop-zero-strengths-full', { fullPage: true });

  // H — anotaciones densas y solapadas
  await openFixture(page, DESKTOP, 'dense-overlap');
  await page.locator('.writing-map__mark--overlapping').first().scrollIntoViewIfNeeded();
  await page.locator('.writing-map__mark--overlapping').first().click();
  await page.waitForSelector('.writing-map__bubble');
  await page.waitForTimeout(250);
  await shot(page, 'H-desktop-dense-overlap');

  // I — tableta, para comprobar el apilado de las tarjetas
  await openFixture(page, TABLET, 'standard');
  await assertNoHorizontalOverflow(page, 'tablet');
  await page.locator('.writing-v3__criteria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await shot(page, 'I-tablet-criteria');

  // J — banda 5: la tarjeta no puede prometer una banda 6
  await openFixture(page, DESKTOP, 'band-five');
  await page.locator('.writing-criterion__toggle').first().click();
  await page.waitForTimeout(200);
  await page.locator('.writing-v3__criteria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot(page, 'J-desktop-band-five');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
