/** Colores del camino de niveles (referencia: teal 1–6, azul 7–12). */
export const THEORY_PATH_THEMES = {
  teal: {
    id: 'teal',
    main: '#26b4a1',
    mainDark: '#1f9a8a',
    bandBg: 'rgba(38, 180, 161, 0.08)',
    bandBorder: 'rgba(38, 180, 161, 0.22)',
    connector: '#26b4a1',
  },
  blue: {
    id: 'blue',
    main: '#29abe2',
    mainDark: '#1e96c8',
    bandBg: 'rgba(41, 171, 226, 0.08)',
    bandBorder: 'rgba(41, 171, 226, 0.22)',
    connector: '#29abe2',
  },
};

export function getTheoryLevelPathTheme(levelNum) {
  const n = Number(levelNum) || 1;
  return n <= 6 ? THEORY_PATH_THEMES.teal : THEORY_PATH_THEMES.blue;
}

export function formatLevelBadge(num) {
  return String(num).padStart(2, '0');
}

/** Estilo de conector entre dos niveles (degradado si cambia de tramo). */
export function getTheoryPathConnectorStyle(fromLevel, toLevel, direction = 'horizontal') {
  const from = getTheoryLevelPathTheme(fromLevel);
  const to = getTheoryLevelPathTheme(toLevel);
  if (from.connector === to.connector) {
    return { background: from.connector };
  }
  const axis = direction === 'vertical' ? '180deg' : '90deg';
  return { background: `linear-gradient(${axis}, ${from.connector}, ${to.connector})` };
}

/** Filas del camino tipo serpiente: 4 + 4 + 4 */
export const THEORY_LEVEL_PATH_ROWS = [
  { levels: [1, 2, 3, 4], connectorSide: 'right' },
  { levels: [8, 7, 6, 5], connectorSide: 'left' },
  { levels: [9, 10, 11, 12], connectorSide: null },
];
