/**
 * Genera la guía gratuita del B2 First para Instagram:
 *   - public/guias/guia-b2-first-dralo.pdf (se sirve en dralo.es/guias/…)
 *   - exports/guia-b2/*.png, páginas sueltas a 1080 × 1350 para publicar
 *
 *   node scripts/build-guia-b2.mjs
 *   node scripts/build-guia-b2.mjs --qa <carpeta>   además, cada página en PNG y hojas de contacto
 *
 * Usa el Chrome instalado en el equipo (Playwright con channel: 'chrome').
 */
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { INSTAGRAM_PAGES, renderGuide } from './guia-b2/guide.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'scripts', 'guia-b2');
const PDF_PATH = path.join(ROOT, 'public', 'guias', 'guia-b2-first-dralo.pdf');
const INSTAGRAM_DIR = path.join(ROOT, 'exports', 'guia-b2');

const PAGE_BG = '#fbfaff';

/**
 * Mascotas de public/mascot: ancho al que se incrustan (unas 1,6 veces lo que ocupan en la página) y,
 * si van sobre un color liso, ese color. Con color se aplanan a JPEG, que pesa mucho menos en el PDF;
 * sin él (portada y contraportada, sobre degradado) se quedan en PNG con transparencia.
 */
const MASCOTS = {
  cover: ['mascot/1.png', 900],
  hello: ['mascot/3.png', 320, PAGE_BG],
  think: ['mascot/poses/think.png', 320, PAGE_BG],
  clap: ['mascot/poses/clap.png', 320, PAGE_BG],
  book: ['mascot/5.png', 320, PAGE_BG],
  desk: ['mascot/4.png', 320, PAGE_BG],
  dance: ['mascot/7.png', 320, PAGE_BG],
  relax: ['mascot/13.png', 240, '#fdf1df'],
  board: ['mascot/10.png', 320, PAGE_BG],
  study: ['mascot/12.png', 320, PAGE_BG],
  stand: ['mascot/6.png', 240, '#f0ebff'],
  oops: ['mascot/poses/oops.png', 320, PAGE_BG],
  shrug: ['mascot/poses/shrug.png', 320, PAGE_BG],
  run: ['mascot/2.png', 320, PAGE_BG],
  walk: ['mascot/8.png', 320, PAGE_BG],
  hero: ['mascot/17.png', 320, PAGE_BG],
  badge: ['mascot/11.png', 320, PAGE_BG],
  cheer: ['mascot/poses/cheer.png', 860],
};

async function dataUrl(file, mime) {
  return `data:${mime};base64,${(await readFile(file)).toString('base64')}`;
}

async function loadImages(page) {
  const images = {};
  for (const [key, [file, width, background]] of Object.entries(MASCOTS)) {
    const src = await dataUrl(path.join(ROOT, 'public', file), 'image/png');
    images[key] = await page.evaluate(
      async ({ src, width, background }) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * width);
        const ctx = canvas.getContext('2d');
        if (background) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return background ? canvas.toDataURL('image/jpeg', 0.9) : canvas.toDataURL('image/png');
      },
      { src, width, background },
    );
  }
  return images;
}

async function findOverflow(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('.page')].flatMap((el, index) => {
      const box = el.querySelector('.content');
      const tall = box.scrollHeight - box.clientHeight;
      const wide = box.scrollWidth - box.clientWidth;
      return tall > 1 || wide > 1 ? [{ page: index + 1, id: el.id, tall, wide }] : [];
    }),
  );
}

async function writeQa(browser, page, dir, html) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'guia.html'), html);
  const pages = page.locator('.page');
  const count = await pages.count();
  const shots = [];
  for (let i = 0; i < count; i += 1) {
    const file = path.join(dir, `pagina-${String(i + 1).padStart(2, '0')}.png`);
    await pages.nth(i).screenshot({ path: file });
    shots.push(file);
  }

  const sheet = await browser.newPage({ viewport: { width: 1450, height: 900 } });
  for (let start = 0; start < shots.length; start += 15) {
    const thumbs = await Promise.all(shots.slice(start, start + 15).map((file) => dataUrl(file, 'image/png')));
    await sheet.setContent(`<body style="margin:0;padding:12px;background:#777;display:grid;grid-template-columns:repeat(5,276px);gap:12px">
      ${thumbs
        .map(
          (src, i) => `<figure style="margin:0;position:relative">
            <img src="${src}" style="display:block;width:276px">
            <figcaption style="position:absolute;top:6px;right:6px;padding:0 6px;background:#000;color:#fff;font:700 16px Arial">${start + i + 1}</figcaption>
          </figure>`,
        )
        .join('')}
    </body>`);
    await sheet.screenshot({ path: path.join(dir, `hoja-${start / 15 + 1}.png`), fullPage: true });
  }
  await sheet.close();
  return count;
}

const qaFlag = process.argv.indexOf('--qa');
const qaDir = qaFlag === -1 ? null : path.resolve(process.argv[qaFlag + 1] || path.join(ROOT, 'tmp', 'guia-b2-qa'));

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const images = await loadImages(page);
  const fonts = {
    normal: await dataUrl(path.join(SOURCE_DIR, 'fonts', 'plus-jakarta-sans-latin.woff2'), 'font/woff2'),
    italic: await dataUrl(path.join(SOURCE_DIR, 'fonts', 'plus-jakarta-sans-latin-italic.woff2'), 'font/woff2'),
  };
  const css = await readFile(path.join(SOURCE_DIR, 'guide.css'), 'utf8');
  const html = renderGuide({ css, fonts, images });

  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const fontsReady = await page.evaluate(
    () => document.fonts.check("800 62px 'Jakarta'") && document.fonts.check("italic 400 30px 'Jakarta'"),
  );
  if (!fontsReady) throw new Error('No ha cargado Plus Jakarta Sans.');

  const overflow = await findOverflow(page);

  await mkdir(path.dirname(PDF_PATH), { recursive: true });
  await page.pdf({
    path: PDF_PATH,
    width: '1080px',
    height: '1350px',
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });

  await rm(INSTAGRAM_DIR, { recursive: true, force: true });
  await mkdir(INSTAGRAM_DIR, { recursive: true });
  for (const [name, id] of Object.entries(INSTAGRAM_PAGES)) {
    await page.locator(`#${id}`).screenshot({ path: path.join(INSTAGRAM_DIR, `${name}.png`) });
  }

  const pageCount = await page.locator('.page').count();
  const { size } = await stat(PDF_PATH);
  console.log(`PDF: ${path.relative(ROOT, PDF_PATH)} · ${pageCount} páginas · ${(size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Instagram: ${Object.keys(INSTAGRAM_PAGES).length} imágenes en ${path.relative(ROOT, INSTAGRAM_DIR)}`);

  if (qaDir) {
    await writeQa(browser, page, qaDir, html);
    console.log(`QA: páginas y hojas de contacto en ${qaDir}`);
  }

  if (overflow.length) {
    console.error('Páginas con contenido que no cabe:');
    for (const item of overflow) console.error(`  ${item.page} (${item.id}): ${item.tall}px de alto, ${item.wide}px de ancho`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
