/**
 * Convocatorias habituales y enlaces oficiales por ciudad (España).
 * Las fechas exactas dependen de cada centro autorizado.
 */

/** Buscador oficial Cambridge (español) — filtrar país España y tu ciudad. */
export const CAMBRIDGE_FIND_CENTRE_URL =
  'https://www.cambridgeenglish.org/es/find-a-centre/find-an-exam-centre/';

export const BRITISH_COUNCIL_CAMBRIDGE_URL =
  'https://www.britishcouncil.es/examen/cambridge-english';

export const CAMBRIDGE_EXAM_OFFICIAL_LINKS = [
  {
    id: 'find-centre-es',
    label: 'Buscar centro de examen',
    href: CAMBRIDGE_FIND_CENTRE_URL,
    description: 'Localiza centros autorizados en España y consulta fechas e inscripción.',
  },
  {
    id: 'exam-dates-2026',
    label: 'Calendario oficial 2026 (PDF)',
    href: 'https://www.cambridgeenglish.org/Images/721911-examination-dates-2026.pdf',
    description: 'Fechas globales en papel — confirma siempre con tu centro.',
  },
  {
    id: 'exam-dates-web',
    label: 'Fechas Cambridge English',
    href: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/exam-dates/',
    description: 'Calendario por titulación (B2 First, C1 Advanced, etc.).',
  },
  {
    id: 'british-council-es',
    label: 'British Council — inscripción',
    href: BRITISH_COUNCIL_CAMBRIDGE_URL,
    description: 'Centros British Council en España: fechas y matrícula.',
  },
];

/** @typedef {'major' | 'standard' | 'andalucia'} SessionPreset */

const SESSION_PRESETS = {
  major: [
    'Junio 2026 (papel)',
    'Agosto 2026',
    'Diciembre 2026',
    'Computer-based: fechas mensuales',
  ],
  andalucia: [
    'Junio 2026',
    'Agosto 2026',
    'Diciembre 2026',
    'Computer-based: consultar centro',
  ],
  standard: [
    'Junio 2026',
    'Diciembre 2026',
    'Computer-based: consultar centro',
  ],
};

/**
 * @param {string} id
 * @param {string} name
 * @param {string} region
 * @param {SessionPreset} sessions
 * @param {string} [searchLabel] — texto del botón (por defecto usa `name`)
 */
function buildCity(id, name, region, sessions = 'standard', searchLabel) {
  const label = searchLabel || name;
  return {
    id,
    name,
    region,
    typicalSessions: SESSION_PRESETS[sessions],
    links: [
      {
        label: `Buscar centros en ${label}`,
        href: CAMBRIDGE_FIND_CENTRE_URL,
        variant: 'primary',
      },
      {
        label: 'British Council — inscripción',
        href: BRITISH_COUNCIL_CAMBRIDGE_URL,
        variant: 'secondary',
      },
    ],
  };
}

/** @type {ReturnType<typeof buildCity>[]} */
export const CAMBRIDGE_EXAM_CITIES = [
  buildCity('a-coruna', 'A Coruña', 'Galicia'),
  buildCity('albacete', 'Albacete', 'Castilla-La Mancha'),
  buildCity('alicante', 'Alicante', 'Comunidad Valenciana', 'andalucia'),
  buildCity('almeria', 'Almería', 'Andalucía', 'andalucia'),
  buildCity('avila', 'Ávila', 'Castilla y León'),
  buildCity('badajoz', 'Badajoz', 'Extremadura'),
  buildCity('barcelona', 'Barcelona', 'Cataluña', 'major'),
  buildCity('bilbao', 'Bilbao', 'País Vasco'),
  buildCity('burgos', 'Burgos', 'Castilla y León'),
  buildCity('caceres', 'Cáceres', 'Extremadura'),
  buildCity('cadiz', 'Cádiz', 'Andalucía', 'andalucia'),
  buildCity('castellon', 'Castellón de la Plana', 'Comunidad Valenciana', 'andalucia'),
  buildCity('ceuta', 'Ceuta', 'Ceuta'),
  buildCity('ciudad-real', 'Ciudad Real', 'Castilla-La Mancha'),
  buildCity('cordoba', 'Córdoba', 'Andalucía', 'andalucia'),
  buildCity('cuenca', 'Cuenca', 'Castilla-La Mancha'),
  buildCity('gijon', 'Gijón', 'Asturias'),
  buildCity('girona', 'Girona', 'Cataluña', 'andalucia'),
  buildCity('granada', 'Granada', 'Andalucía', 'andalucia'),
  buildCity('guadalajara', 'Guadalajara', 'Castilla-La Mancha'),
  buildCity('huelva', 'Huelva', 'Andalucía', 'andalucia'),
  buildCity('huesca', 'Huesca', 'Aragón'),
  buildCity('ibiza', 'Ibiza', 'Islas Baleares'),
  buildCity('jaen', 'Jaén', 'Andalucía', 'andalucia'),
  buildCity('jerez', 'Jerez de la Frontera', 'Andalucía', 'andalucia', 'Jerez'),
  buildCity('las-palmas', 'Las Palmas de Gran Canaria', 'Canarias', 'andalucia'),
  buildCity('leon', 'León', 'Castilla y León'),
  buildCity('lleida', 'Lleida', 'Cataluña'),
  buildCity('logrono', 'Logroño', 'La Rioja'),
  buildCity('lugo', 'Lugo', 'Galicia'),
  buildCity('madrid', 'Madrid', 'Comunidad de Madrid', 'major'),
  buildCity('malaga', 'Málaga', 'Andalucía', 'andalucia'),
  buildCity('marbella', 'Marbella', 'Andalucía', 'andalucia'),
  buildCity('melilla', 'Melilla', 'Melilla'),
  buildCity('murcia', 'Murcia', 'Región de Murcia', 'andalucia'),
  buildCity('ourense', 'Ourense', 'Galicia'),
  buildCity('oviedo', 'Oviedo', 'Asturias'),
  buildCity('palencia', 'Palencia', 'Castilla y León'),
  buildCity('palma', 'Palma de Mallorca', 'Islas Baleares'),
  buildCity('pamplona', 'Pamplona', 'Navarra'),
  buildCity('pontevedra', 'Pontevedra', 'Galicia'),
  buildCity('salamanca', 'Salamanca', 'Castilla y León'),
  buildCity('san-sebastian', 'San Sebastián', 'País Vasco'),
  buildCity('santander', 'Santander', 'Cantabria'),
  buildCity('santiago', 'Santiago de Compostela', 'Galicia'),
  buildCity('segovia', 'Segovia', 'Castilla y León'),
  buildCity('sevilla', 'Sevilla', 'Andalucía', 'andalucia'),
  buildCity('soria', 'Soria', 'Castilla y León'),
  buildCity('tarragona', 'Tarragona', 'Cataluña', 'andalucia'),
  buildCity('tenerife', 'Santa Cruz de Tenerife', 'Canarias', 'andalucia', 'Tenerife'),
  buildCity('teruel', 'Teruel', 'Aragón'),
  buildCity('toledo', 'Toledo', 'Castilla-La Mancha'),
  buildCity('valencia', 'Valencia', 'Comunidad Valenciana', 'andalucia'),
  buildCity('valladolid', 'Valladolid', 'Castilla y León'),
  buildCity('vigo', 'Vigo', 'Galicia'),
  buildCity('vitoria', 'Vitoria-Gasteiz', 'País Vasco'),
  buildCity('zamora', 'Zamora', 'Castilla y León'),
  buildCity('zaragoza', 'Zaragoza', 'Aragón'),
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

/** Comunidades autónomas / regiones con al menos una ciudad listada. */
export const CAMBRIDGE_EXAM_REGIONS = [
  ...new Set(CAMBRIDGE_EXAM_CITIES.map((city) => city.region)),
].sort((a, b) => a.localeCompare(b, 'es'));
