/** Retos de Use of English. El índice avanza cada martes (hora de Madrid). */
const CHALLENGES = [
  {
    id: 'used-to-ing',
    prompt: 'I’m not used to _____ English every day.',
    options: [
      { id: 'A', label: 'speak' },
      { id: 'B', label: 'speaking' },
      { id: 'C', label: 'spoke' },
    ],
    correct: 'B',
    solution: 'B) speaking. Después de be used to, el verbo va en -ing. Significa «estar acostumbrado a».',
  },
  {
    id: 'second-conditional',
    prompt: 'If I _____ more time, I would take the exam this month.',
    options: [
      { id: 'A', label: 'have' },
      { id: 'B', label: 'had' },
      { id: 'C', label: 'would have' },
    ],
    correct: 'B',
    solution: 'B) had. En la segunda condicional, la hipótesis va en pasado y el resultado con would.',
  },
  {
    id: 'suggest-ing',
    prompt: 'She suggested _____ the essay again before sending it.',
    options: [
      { id: 'A', label: 'to rewrite' },
      { id: 'B', label: 'rewriting' },
      { id: 'C', label: 'rewrite' },
    ],
    correct: 'B',
    solution: 'B) rewriting. Suggest va seguido de -ing, no de to + infinitivo.',
  },
  {
    id: 'past-perfect',
    prompt: 'By the time we arrived, the talk _____.',
    options: [
      { id: 'A', label: 'already started' },
      { id: 'B', label: 'had already started' },
      { id: 'C', label: 'has already started' },
    ],
    correct: 'B',
    solution: 'B) had already started. La charla empezó antes de que llegáramos: pasado perfecto.',
  },
  {
    id: 'would-rather',
    prompt: 'I’d rather you _____ here before nine.',
    options: [
      { id: 'A', label: 'are' },
      { id: 'B', label: 'be' },
      { id: 'C', label: 'were' },
    ],
    correct: 'C',
    solution: 'C) were. Con would rather y otra persona, el verbo va en pasado.',
  },
  {
    id: 'needs-ing',
    prompt: 'The report needs _____ before Friday.',
    options: [
      { id: 'A', label: 'finishing' },
      { id: 'B', label: 'finish' },
      { id: 'C', label: 'finished' },
    ],
    correct: 'A',
    solution: 'A) finishing. Need + -ing significa que algo necesita que lo hagan: «hay que terminarlo».',
  },
  {
    id: 'not-only-inversion',
    prompt: 'Not only _____ late, he also forgot the notes.',
    options: [
      { id: 'A', label: 'he was' },
      { id: 'B', label: 'was he' },
      { id: 'C', label: 'he is' },
    ],
    correct: 'B',
    solution: 'B) was he. Tras not only al principio de la frase, el verbo se invierte.',
  },
  {
    id: 'look-forward-to',
    prompt: 'We look forward to _____ from you.',
    options: [
      { id: 'A', label: 'hear' },
      { id: 'B', label: 'hearing' },
      { id: 'C', label: 'heard' },
    ],
    correct: 'B',
    solution: 'B) hearing. Look forward to lleva -ing: to es preposición, no infinitivo.',
  },
  {
    id: 'so-such',
    prompt: 'It was _____ a difficult paper that I ran out of time.',
    options: [
      { id: 'A', label: 'so' },
      { id: 'B', label: 'such' },
      { id: 'C', label: 'too' },
    ],
    correct: 'B',
    solution: 'B) such. Such va con un sustantivo. So iría con el adjetivo solo: so difficult.',
  },
  {
    id: 'third-conditional',
    prompt: 'If she _____ the instructions, she would have finished on time.',
    options: [
      { id: 'A', label: 'read' },
      { id: 'B', label: 'had read' },
      { id: 'C', label: 'would read' },
    ],
    correct: 'B',
    solution: 'B) had read. Tercera condicional: if + pasado perfecto, y would have en el resultado.',
  },
  {
    id: 'wish-past',
    prompt: 'I wish I _____ that question more carefully yesterday.',
    options: [
      { id: 'A', label: 'check' },
      { id: 'B', label: 'checked' },
      { id: 'C', label: 'had checked' },
    ],
    correct: 'C',
    solution: 'C) had checked. Wish sobre el pasado se construye con pasado perfecto.',
  },
  {
    id: 'causative-have',
    prompt: 'I had my essay _____ by my teacher before I sent it.',
    options: [
      { id: 'A', label: 'check' },
      { id: 'B', label: 'checked' },
      { id: 'C', label: 'to check' },
    ],
    correct: 'B',
    solution: 'B) checked. Have something done: otra persona hace la acción.',
  },
  {
    id: 'whose',
    prompt: 'The candidate _____ essay won the prize is in my class.',
    options: [
      { id: 'A', label: 'who' },
      { id: 'B', label: 'whose' },
      { id: 'C', label: 'which' },
    ],
    correct: 'B',
    solution: 'B) whose. Whose indica posesión: el ensayo de esa persona.',
  },
  {
    id: 'remember-to',
    prompt: 'Remember _____ your identification to the speaking test.',
    options: [
      { id: 'A', label: 'bringing' },
      { id: 'B', label: 'to bring' },
      { id: 'C', label: 'bring' },
    ],
    correct: 'B',
    solution: 'B) to bring. Remember to + infinitivo significa «no olvides hacerlo».',
  },
  {
    id: 'make-bare-infinitive',
    prompt: 'The invigilator made us _____ our phones in the bag.',
    options: [
      { id: 'A', label: 'leave' },
      { id: 'B', label: 'to leave' },
      { id: 'C', label: 'leaving' },
    ],
    correct: 'A',
    solution: 'A) leave. Make y let van con infinitivo sin to.',
  },
  {
    id: 'hardly-inversion',
    prompt: 'Hardly _____ the exam started when the alarm rang.',
    options: [
      { id: 'A', label: 'had' },
      { id: 'B', label: 'has' },
      { id: 'C', label: 'did' },
    ],
    correct: 'A',
    solution: 'A) had. Tras hardly al principio, el auxiliar se invierte: hardly had the exam started.',
  },
  {
    id: 'its-time',
    prompt: 'It is high time we _____ some writing practice.',
    options: [
      { id: 'A', label: 'do' },
      { id: 'B', label: 'did' },
      { id: 'C', label: 'will do' },
    ],
    correct: 'B',
    solution: 'B) did. It is time / it is high time + pasado: algo que ya debería estar pasando.',
  },
  {
    id: 'neither-inversion',
    prompt: 'I have not finished the reading, and _____ has my partner.',
    options: [
      { id: 'A', label: 'either' },
      { id: 'B', label: 'neither' },
      { id: 'C', label: 'so' },
    ],
    correct: 'B',
    solution: 'B) neither. Neither + auxiliar + sujeto repite una idea negativa.',
  },
  {
    id: 'in-case',
    prompt: 'Take a spare pen _____ yours runs out during the exam.',
    options: [
      { id: 'A', label: 'in case' },
      { id: 'B', label: 'unless' },
      { id: 'C', label: 'so that' },
    ],
    correct: 'A',
    solution: 'A) in case. In case presenta una precaución: por si acaso.',
  },
  {
    id: 'despite-ing',
    prompt: 'She felt confident _____ having slept badly the night before.',
    options: [
      { id: 'A', label: 'although' },
      { id: 'B', label: 'despite' },
      { id: 'C', label: 'even' },
    ],
    correct: 'B',
    solution: 'B) despite. Despite va seguido de sustantivo o -ing. Although necesita una oración.',
  },
  {
    id: 'reported-speech',
    prompt: 'She said she _____ the exam the week before.',
    options: [
      { id: 'A', label: 'takes' },
      { id: 'B', label: 'has taken' },
      { id: 'C', label: 'had taken' },
    ],
    correct: 'C',
    solution: 'C) had taken. En estilo indirecto, el pasado pasa a pasado perfecto.',
  },
  {
    id: 'cant-have',
    prompt: 'She _____ have left already: her coat is still on the chair.',
    options: [
      { id: 'A', label: "can't" },
      { id: 'B', label: 'must' },
      { id: 'C', label: 'should' },
    ],
    correct: 'A',
    solution: "A) can't. Can't have + participio niega una deducción: es imposible que se haya ido.",
  },
  {
    id: 'prefer-ing',
    prompt: 'I prefer _____ notes to memorising whole paragraphs.',
    options: [
      { id: 'A', label: 'making' },
      { id: 'B', label: 'make' },
      { id: 'C', label: 'to making' },
    ],
    correct: 'A',
    solution: 'A) making. Prefer + -ing, y to para comparar con otra actividad en -ing.',
  },
  {
    id: 'unless',
    prompt: 'You will not pass _____ you work on your writing.',
    options: [
      { id: 'A', label: 'unless' },
      { id: 'B', label: 'if' },
      { id: 'C', label: 'although' },
    ],
    correct: 'A',
    solution: 'A) unless. Unless significa «si no»: no aprobarás si no trabajas la writing.',
  },
];

const WEEKDAY_FROM_TUESDAY = { Tue: 0, Wed: 1, Thu: 2, Fri: 3, Sat: 4, Sun: 5, Mon: 6 };
/** Semana del 20 de octubre de 2026: el primer reto, el del correo. */
const EPOCH_MS = Date.UTC(2026, 9, 20);

export function madridWeekday(date = new Date()) {
  return madridDateParts(date).weekday;
}

function madridDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value;
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    weekday: read('weekday'),
  };
}

/** Martes que abre la semana en curso, en calendario de Madrid. */
export function weeklyChallengeWeekId(date = new Date()) {
  const { year, month, day, weekday } = madridDateParts(date);
  const offset = WEEKDAY_FROM_TUESDAY[weekday] ?? 0;
  const tuesday = Date.UTC(year, month - 1, day) - offset * 86400000;
  return new Date(tuesday).toISOString().slice(0, 10);
}

export function getWeeklyChallenge(date = new Date()) {
  const weekId = weeklyChallengeWeekId(date);
  const [year, month, day] = weekId.split('-').map(Number);
  const weeks = Math.round((Date.UTC(year, month - 1, day) - EPOCH_MS) / (7 * 86400000));
  const index = ((weeks % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length;
  const since = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return { ...CHALLENGES[index], weekId, since };
}

/** Opción marcada en el correo de esa semana. Otra semana o una letra rara no cuenta. */
export function weeklyChallengeMailChoice(weekId, reto, opcion) {
  if (!weekId || String(reto || '') !== String(weekId)) return null;
  const choice = String(opcion || '').trim().toUpperCase();
  return choice === 'A' || choice === 'B' || choice === 'C' ? choice : null;
}
