/** Idiomas destino para traducción en Dictionary (código ISO → etiqueta UI). */
export const DICTIONARY_TARGET_LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'eu', label: 'Euskara', flag: '🇪🇺' },
  { code: 'ca', label: 'Català', flag: '🇪🇸' },
  { code: 'gl', label: 'Galego', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function getDictionaryLanguageLabel(code) {
  return DICTIONARY_TARGET_LANGUAGES.find((l) => l.code === code)?.label || code;
}

export const DEFAULT_DICTIONARY_LANGUAGE = 'es';
