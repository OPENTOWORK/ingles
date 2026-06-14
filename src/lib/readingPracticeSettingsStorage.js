const STORAGE_KEY = 'dralo_reading_practice_settings';

export const DEFAULT_READING_SETTINGS = {
  fontSize: 100,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  wideSpacing: false,
  highContrast: false,
  dyslexiaFont: false,
  theme: 'normal',
  showFeedback: true,
};

const LINE_HEIGHT_MAP = {
  normal: 1.5,
  comfortable: 1.75,
  large: 2,
};

const LETTER_SPACING_MAP = {
  normal: '0',
  wide: '0.04em',
  extrawide: '0.08em',
};

export function loadReadingSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_READING_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_READING_SETTINGS };
    return { ...DEFAULT_READING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_READING_SETTINGS };
  }
}

export function saveReadingSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent('dralo-reading-settings-changed', { detail: settings }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function isReadingPracticePath(pathname = '') {
  if (!pathname) return false;
  return (
    pathname.includes('/exam-reading-and-use-of-english') ||
    pathname.includes('/exam-reading')
  );
}

export function setReadingTheme(theme) {
  const next = { ...loadReadingSettings(), theme };
  saveReadingSettings(next);
  return next;
}

export function toggleReadingTheme() {
  const current = loadReadingSettings();
  return setReadingTheme(current.theme === 'night' ? 'normal' : 'night');
}

export function applyReadingNightBodyClass(theme) {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('reading-night-mode', theme === 'night');
}

export function readingSettingsToStyle(settings) {
  const s = { ...DEFAULT_READING_SETTINGS, ...settings };
  const lineHeight = LINE_HEIGHT_MAP[s.lineHeight] ?? LINE_HEIGHT_MAP.normal;
  const letterSpacing = LETTER_SPACING_MAP[s.letterSpacing] ?? LETTER_SPACING_MAP.normal;
  const effectiveLineHeight = s.wideSpacing ? Math.max(lineHeight, 1.85) : lineHeight;

  return {
    '--reading-font-size': `${s.fontSize / 100}`,
    '--reading-line-height': String(effectiveLineHeight),
    '--reading-letter-spacing': letterSpacing,
  };
}

export function readingSettingsClassNames(settings) {
  const s = { ...DEFAULT_READING_SETTINGS, ...settings };
  const classes = ['reading-area'];
  if (s.highContrast) classes.push('reading-area--high-contrast');
  if (s.dyslexiaFont) classes.push('reading-area--dyslexia-font');
  if (s.wideSpacing) classes.push('reading-area--wide-spacing');
  if (s.theme === 'night') classes.push('reading-area--night');
  return classes.join(' ');
}
