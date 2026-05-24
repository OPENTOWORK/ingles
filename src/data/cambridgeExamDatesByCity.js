/**
 * Convocatorias habituales y enlaces oficiales por ciudad (España).
 * Las fechas exactas dependen de cada centro autorizado — enlaces a sus páginas.
 */

export const CAMBRIDGE_EXAM_OFFICIAL_LINKS = [
  {
    id: 'register-es',
    label: 'Cómo inscribirse (Cambridge English)',
    href: 'https://www.cambridgeenglish.org/es/examenes-y-pruebas/como-inscribirse/',
    description: 'Guía oficial de inscripción y requisitos.',
  },
  {
    id: 'find-centre-es',
    label: 'Buscar centro de examen en España',
    href: 'https://www.cambridgeenglish.org/es/buscar-centro-de-examen/?country=ES',
    description: 'Localiza centros autorizados y modalidades disponibles.',
  },
  {
    id: 'british-council-es',
    label: 'British Council — exámenes Cambridge',
    href: 'https://www.britishcouncil.es/examen/cambridge-english',
    description: 'Fechas e inscripción en centros British Council.',
  },
  {
    id: 'dates-deadlines',
    label: 'Fechas y plazos de inscripción',
    href: 'https://www.cambridgeenglish.org/es/examenes-y-pruebas/fechas-y-plazos/',
    description: 'Calendario general y plazos orientativos.',
  },
];

/** @type {Array<{ id: string, name: string, region: string, typicalSessions: string[], centreUrl: string, extraUrl?: string }>} */
export const CAMBRIDGE_EXAM_CITIES = [
  {
    id: 'madrid',
    name: 'Madrid',
    region: 'Comunidad de Madrid',
    typicalSessions: ['Junio 2026 (papel)', 'Agosto 2026', 'Diciembre 2026', 'Computer-based: fechas mensuales'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/madrid/',
    extraUrl: 'https://www.britishcouncil.es/examen/cambridge-english',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    region: 'Cataluña',
    typicalSessions: ['Junio 2026 (papel)', 'Agosto 2026', 'Diciembre 2026', 'Computer-based: fechas mensuales'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/barcelona/',
    extraUrl: 'https://www.britishcouncil.es/examen/cambridge-english',
  },
  {
    id: 'valencia',
    name: 'Valencia',
    region: 'Comunidad Valenciana',
    typicalSessions: ['Junio 2026', 'Agosto 2026', 'Diciembre 2026', 'Computer-based: consultar centro'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/valencia/',
  },
  {
    id: 'sevilla',
    name: 'Sevilla',
    region: 'Andalucía',
    typicalSessions: ['Junio 2026', 'Diciembre 2026', 'Computer-based: fechas mensuales'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/seville/',
  },
  {
    id: 'bilbao',
    name: 'Bilbao',
    region: 'País Vasco',
    typicalSessions: ['Junio 2026', 'Diciembre 2026', 'Computer-based: consultar centro'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/bilbao/',
  },
  {
    id: 'malaga',
    name: 'Málaga',
    region: 'Andalucía',
    typicalSessions: ['Junio 2026', 'Agosto 2026', 'Diciembre 2026', 'Computer-based: consultar centro'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/malaga/',
  },
  {
    id: 'zaragoza',
    name: 'Zaragoza',
    region: 'Aragón',
    typicalSessions: ['Junio 2026', 'Diciembre 2026', 'Computer-based: consultar centro'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/zaragoza/',
  },
  {
    id: 'palma',
    name: 'Palma de Mallorca',
    region: 'Islas Baleares',
    typicalSessions: ['Junio 2026', 'Diciembre 2026', 'Computer-based: consultar centro'],
    centreUrl: 'https://www.cambridgeenglish.org/find-an-exam-centre/spain/palma-de-mallorca/',
  },
];
