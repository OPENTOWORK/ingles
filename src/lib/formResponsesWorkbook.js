const PURPLE = '6A4BE8';
const PURPLE_DEEP = '5634D6';
const INK = '1D1857';
const LILAC = 'F4F0FF';
const HEADER = 'EDE9FE';
const LINE = 'E4DEF8';
const WHITE = 'FFFFFF';
const SOFT_TEXT = 'EDE9FE';

const FIXED_WIDTHS = [28, 36, 24, 20];
const QUESTION_WIDTH = 38;

function lineCount(value, width) {
  const usable = Math.max(10, width - 2);
  return String(value || '')
    .split('\n')
    .reduce((sum, part) => sum + Math.max(1, Math.ceil(part.length / usable)), 0);
}

function cell(value, style, link) {
  const text = value == null || value === '' ? ' ' : String(value);
  const next = { v: text, t: 's', s: style };
  if (link) next.l = { Target: link };
  return next;
}

function fill(rgb) {
  return { patternType: 'solid', fgColor: { rgb } };
}

function edge(color, style = 'thin') {
  return { style, color: { rgb: color } };
}

function gridBorder(bottomColor = LINE, bottomStyle = 'thin') {
  return {
    top: edge(LINE),
    bottom: edge(bottomColor, bottomStyle),
    left: edge(LINE),
    right: edge(LINE),
  };
}

function bannerStyle(background, size, color, bold = false) {
  return {
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill(background),
    alignment: { vertical: 'center', horizontal: 'left' },
  };
}

function headerStyle() {
  return {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: INK } },
    fill: fill(HEADER),
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
    border: gridBorder(PURPLE, 'medium'),
  };
}

function bodyStyle({ zebra, bold = false, color = INK, underline = false }) {
  return {
    font: { name: 'Calibri', sz: 11, bold, underline, color: { rgb: color } },
    fill: fill(zebra ? LILAC : WHITE),
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
    border: gridBorder(),
  };
}

/**
 * Libro de respuestas con la cabecera morada de Dralo, filas alternas y columnas legibles.
 * @param {typeof import('xlsx-js-style')} XLSX
 */
export function buildFormResponsesWorkbook(XLSX, { headers, rows, summary }) {
  const columnCount = headers.length;
  const widths = headers.map((_, index) =>
    index < FIXED_WIDTHS.length ? FIXED_WIDTHS[index] : QUESTION_WIDTH,
  );
  const titleStyle = bannerStyle(PURPLE_DEEP, 18, WHITE, true);
  const summaryStyle = bannerStyle(PURPLE, 11, SOFT_TEXT);
  const headStyle = headerStyle();

  const sheetRows = [
    headers.map((_, index) => cell(index === 0 ? 'Dralo Academy' : '', titleStyle)),
    headers.map((_, index) => cell(index === 0 ? summary || 'Respuestas de formularios' : '', summaryStyle)),
    headers.map((header) => cell(header, headStyle)),
    ...rows.map((row, rowIndex) => {
      const zebra = rowIndex % 2 === 1;
      return headers.map((_, columnIndex) => {
        const value = row[columnIndex] ?? '';
        const email = columnIndex === 1 ? String(value).trim() : '';
        const isEmail = columnIndex === 1 && email.includes('@');
        return cell(
          value,
          bodyStyle({
            zebra,
            bold: columnIndex === 0,
            color: isEmail ? PURPLE_DEEP : INK,
            underline: isEmail,
          }),
          isEmail ? `mailto:${email}` : '',
        );
      });
    }),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const lastColumn = columnCount - 1;
  const lastRow = sheetRows.length - 1;
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumn } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumn } },
  ];
  worksheet['!cols'] = widths.map((wch) => ({ wch }));
  worksheet['!rows'] = sheetRows.map((row, rowIndex) => {
    if (rowIndex === 0) return { hpt: 32 };
    if (rowIndex === 1) return { hpt: 22 };
    const lines = row.reduce(
      (max, item, columnIndex) => Math.max(max, lineCount(item.v, widths[columnIndex])),
      1,
    );
    const capped = Math.min(lines, rowIndex === 2 ? 3 : 4);
    return { hpt: rowIndex === 2 ? Math.max(30, 16 * capped + 8) : Math.max(22, 16 * capped + 6) };
  });
  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 2, c: 0 },
      e: { r: lastRow, c: lastColumn },
    }),
  };
  worksheet['!pageSetup'] = {
    orientation: 'landscape',
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: 'Respuestas de formularios',
    Subject: 'Dralo Academy',
    Author: 'Dralo Academy',
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas');
  return workbook;
}

export async function downloadFormResponsesWorkbook({ headers, rows, summary, filename }) {
  const imported = await import('xlsx-js-style');
  const XLSX = imported.default || imported;
  const workbook = buildFormResponsesWorkbook(XLSX, { headers, rows, summary });
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, filename || `respuestas-formularios-${stamp}.xlsx`);
}
