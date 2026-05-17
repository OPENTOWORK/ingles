/** Configuración por apartado del menú Dralo AI */

export const DRALO_AI_HUB = {
  title: 'Dralo AI',
  description:
    'Practica cada habilidad del examen con ejercicios generados al momento y feedback de ChatGPT.',
  items: [
    {
      id: 'use-of-english',
      href: '/dralo-ai/use-of-english',
      label: 'Use of English',
      icon: '✏️',
      tagline: 'Gramática, transformaciones y vocabulario en contexto',
      accent: 'indigo',
    },
    {
      id: 'reading',
      href: '/dralo-ai/reading',
      label: 'Reading',
      icon: '📖',
      tagline: 'Textos cortos con comprensión y vocabulario',
      accent: 'ocean',
    },
    {
      id: 'writing',
      href: '/dralo-ai/writing',
      label: 'Writing',
      icon: '📝',
      tagline: 'Redacción guiada con corrección de examen',
      accent: 'amber',
    },
    {
      id: 'listening',
      href: '/dralo-ai/listening',
      label: 'Listening',
      icon: '🎧',
      tagline: 'Diálogos y comprensión auditiva (con guion)',
      accent: 'emerald',
    },
    {
      id: 'speaking',
      href: '/speaking',
      label: 'Speaking',
      icon: '🎤',
      tagline: 'Simulación oral con coach de voz',
      accent: 'rose',
      external: true,
    },
  ],
};

export const DRALO_AI_MODES = {
  'use-of-english': {
    id: 'use-of-english',
    title: 'Use of English',
    eyebrow: 'Dralo AI · Grammar & vocabulary',
    description:
      'Transformaciones, huecos y elección múltiple al estilo Cambridge. Dralo genera el ejercicio y corrige tu respuesta.',
    accent: 'indigo',
    mascotVariant: 6,
    levels: ['B1', 'B2', 'C1'],
    defaultLevel: 'B2',
    activities: [
      {
        id: 'key-word',
        label: 'Key word transformation',
        icon: '🔑',
        hint: 'Completa la segunda frase con la palabra clave (2–5 palabras).',
      },
      {
        id: 'open-cloze',
        label: 'Open cloze',
        icon: '🕳️',
        hint: 'Un solo hueco por frase; sin opciones.',
      },
      {
        id: 'word-formation',
        label: 'Word formation',
        icon: '🧩',
        hint: 'Forma la palabra correcta a partir del stem entre paréntesis.',
      },
    ],
  },
  reading: {
    id: 'reading',
    title: 'Reading',
    eyebrow: 'Dralo AI · Comprehension',
    description:
      'Lee un texto generado para tu nivel y responde preguntas. Dralo explica por qué aciertas o fallas.',
    accent: 'ocean',
    mascotVariant: 2,
    levels: ['B1', 'B2', 'C1'],
    defaultLevel: 'B2',
    activities: [
      {
        id: 'gist',
        label: 'Reading for gist',
        icon: '🌐',
        hint: 'Preguntas sobre idea general y actitud del autor.',
      },
      {
        id: 'detail',
        label: 'Reading for detail',
        icon: '🔍',
        hint: 'Respuestas concretas en el texto.',
      },
      {
        id: 'vocabulary',
        label: 'Vocabulary in context',
        icon: '📚',
        hint: 'Significado de palabras o expresiones en contexto.',
      },
    ],
  },
  writing: {
    id: 'writing',
    title: 'Writing',
    eyebrow: 'Dralo AI · Production',
    description:
      'Elige un tipo de tarea, escribe tu texto y recibe corrección al estilo B2 First con criterios de examen.',
    accent: 'amber',
    mascotVariant: 8,
    levels: ['B1', 'B2', 'C1'],
    defaultLevel: 'B2',
    activities: [
      {
        id: 'essay',
        label: 'Essay',
        icon: '📄',
        hint: 'Opinión con introducción, párrafos y conclusión.',
      },
      {
        id: 'email',
        label: 'Email / letter',
        icon: '✉️',
        hint: 'Registro formal o semiformal según consigna.',
      },
      {
        id: 'article',
        label: 'Article / review',
        icon: '📰',
        hint: 'Texto para público concreto con tono adecuado.',
      },
    ],
  },
  listening: {
    id: 'listening',
    title: 'Listening',
    eyebrow: 'Dralo AI · Audio comprehension',
    description:
      'Escucha el guion (voz Dralo), responde y comprueba. Ideal para practicar antes del examen real.',
    accent: 'emerald',
    mascotVariant: 7,
    levels: ['B1', 'B2', 'C1'],
    defaultLevel: 'B2',
    activities: [
      {
        id: 'dialogue',
        label: 'Short dialogue',
        icon: '💬',
        hint: 'Conversación breve con preguntas de comprensión.',
      },
      {
        id: 'monologue',
        label: 'Monologue',
        icon: '🗣️',
        hint: 'Un hablante; preguntas de detalle o actitud.',
      },
      {
        id: 'note-taking',
        label: 'Note completion',
        icon: '📋',
        hint: 'Completa notas mientras «escuchas» el texto.',
      },
    ],
  },
};
