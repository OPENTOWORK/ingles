/** Última entrega fechada de cada proyecto del plan de noviembre 2026. */

export const PROJECT_WINDOW = {
  start: '2026-11-09',
  end: '2027-01-08',
};

export const PROJECT_DELIVERIES = [
  {
    id: 'listening',
    name: 'Listening',
    deliverable: 'Maquetación de los Exams 1 y 11–15',
    date: '2026-11-11',
    kind: 'Fijada',
    color: '#0369a1',
    note: 'La generación de audio de los Exams 16–20 sigue sin fecha.',
  },
  {
    id: 'error-tracking',
    name: 'Error Tracking',
    deliverable: 'Ejercicios revisados · Bloque A3',
    date: '2026-11-22',
    kind: 'Fijada',
    color: '#6a4be8',
    note: 'Cierra la revisión de ejercicios. La primera implementación del diseño fue el 11 de noviembre.',
  },
  {
    id: 'ruoe-b1',
    name: 'Motor RUOE B1',
    deliverable: 'Lanzamiento en la plataforma',
    date: '2026-11-30',
    kind: 'Fijada',
    color: '#0f766e',
    note: '20 exámenes previstos para el 22 de noviembre, con revisión la semana previa al lanzamiento.',
  },
  {
    id: 'placement',
    name: 'Placement Tests',
    deliverable: 'Lanzamiento',
    date: '2026-11-30',
    kind: 'Orientativa',
    color: '#a16207',
    note: 'Misma fecha que el motor RUOE B1, condicionada por las prioridades del departamento.',
  },
  {
    id: 'exam-strategies',
    name: 'Exam Strategies',
    deliverable: 'Guía de email',
    date: '2026-12-16',
    kind: 'Orientativa',
    color: '#c2410c',
    note: 'Última guía de Writing del calendario. El curso de Speaking queda para 2027, sin fecha.',
  },
  {
    id: 'redes',
    name: 'Contenido Redes',
    deliverable: 'Última entrega de posts',
    date: '2027-01-08',
    kind: 'Orientativa',
    color: '#db2777',
    note: 'Cierra el plan de noviembre y diciembre: 36 posts acumulados.',
  },
];

/** Hoja de ruta sin fecha. Las guías de nivel se añaden a la visión original. */
export const FUTURE_PROJECTS = [
  {
    id: 'mas-examenes-b2',
    name: 'Más exámenes B2',
    summary: 'Ampliar el banco de B2 First con temas variados y las cuatro destrezas. A más largo plazo.',
  },
  {
    id: 'niveles',
    name: 'Niveles A2–C2',
    summary: 'Completar A2, B1, C1 y C2 con exámenes y actividades del formato de cada certificación.',
  },
  {
    id: 'guia-b2',
    name: 'Guía B2',
    summary: 'Guía de preparación del B2 First, con el estilo pedagógico de DRALO.',
  },
  {
    id: 'guias-niveles',
    name: 'Guías A2, B1, C1 y C2',
    summary: 'Una guía de preparación para cada uno del resto de niveles.',
  },
  {
    id: 'training',
    name: 'Training',
    summary: 'Práctica breve por habilidad, parte del examen y tipo de error, recomendada según el alumno.',
  },
  {
    id: 'placement-vision',
    name: 'Placement Tests',
    summary: 'Dos pruebas: una rápida y orientativa, y otra completa, con diagnóstico y siguientes pasos.',
  },
  {
    id: 'perfil',
    name: 'Perfil del alumno',
    summary: 'Centro de seguimiento: evolución, historial, puntos fuertes y débiles, objetivos y recomendaciones.',
  },
  {
    id: 'error-tracking-vision',
    name: 'Error Tracking',
    summary: 'Clasificar errores, explicarlos y conectarlos con Training y el perfil.',
  },
  {
    id: 'speaking',
    name: 'Speaking sólido',
    summary: 'Simulador con todas las partes, interacción oral y feedback específico. A más largo plazo.',
  },
  {
    id: 'strategies-vision',
    name: 'Exam Strategies',
    summary: 'Píldoras breves por tarea y error, con guías útiles de Writing, Speaking y el resto de partes.',
  },
  {
    id: 'interfaz',
    name: 'Interfaz y funciones',
    summary: 'Unificar diseño y navegación, sobre todo en móvil: claridad, accesibilidad y continuidad.',
  },
  {
    id: 'dralo-ai',
    name: 'DRALO AI',
    summary: 'Asistente que resuelve dudas y recomienda el siguiente paso según la práctica del alumno.',
  },
  {
    id: 'gamificacion',
    name: 'Gamificación',
    summary: 'Retos, hitos y progreso en la práctica, después de Error Tracking, Exam Strategies y la interfaz.',
  },
];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** Salidas que el calendario de marketing tiene que enseñar, fijadas u orientativas. */
export function projectCalendarEvents(year) {
  return PROJECT_DELIVERIES.flatMap((project) => {
    const date = parseRoadmapDate(project.date);
    if (date.year !== year) return [];
    return [{
      ...date,
      name: project.name,
      category: 'proyecto',
      kind: project.kind,
      color: project.color,
      note: `${project.deliverable}. Fecha ${project.kind.toLowerCase()}. ${project.note}`,
    }];
  });
}

export function parseRoadmapDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return { year, month, day };
}

export function formatRoadmapDate(iso) {
  const { day, month, year } = parseRoadmapDate(iso);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Posición 0–100 de una fecha dentro de la ventana de entregas. */
export function roadmapPosition(iso, window = PROJECT_WINDOW) {
  const toUtc = (value) => {
    const { year, month, day } = parseRoadmapDate(value);
    return Date.UTC(year, month - 1, day);
  };
  const span = toUtc(window.end) - toUtc(window.start);
  if (span <= 0) return 0;
  const ratio = (toUtc(iso) - toUtc(window.start)) / span;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 1000) / 10;
}
