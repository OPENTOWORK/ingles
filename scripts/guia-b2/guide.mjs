const SITE = 'https://www.dralo.es';
const UTM = 'utm_source=instagram&utm_medium=organic_social&utm_campaign=guia_b2_2026';
const CAMBRIDGE_FIRST_URL = 'https://www.cambridgeenglish.org/exams-and-tests/first/';

/** Páginas que se exportan también como imagen: un carrusel de Instagram, en el orden de publicación. */
export const INSTAGRAM_PAGES = {
  'guia-b2-01-portada': 'portada',
  'guia-b2-02-indice': 'indice',
  'guia-b2-03-examen': 'examen',
  'guia-b2-04-nota': 'nota',
  'guia-b2-05-errores': 'errores-1',
  'guia-b2-06-semana-tipo': 'semana-tipo',
  'guia-b2-07-contraportada': 'contraportada',
};

export function siteLink(pathname, content) {
  return `${SITE}${pathname}?${UTM}&utm_content=${content}`;
}

const ICON = {
  check: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cross: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
};

const GAP = '<span class="gap"></span>';
const en = (text) => `<span lang="en">${text}</span>`;
const enI = (text) => `<i lang="en">${text}</i>`;

const SECTIONS = [
  ['01', 'El examen en 10 minutos', 'examen'],
  ['02', 'Reading and Use of English', 'ruoe'],
  ['03', 'Writing', 'writing'],
  ['04', 'Listening', 'listening'],
  ['05', 'Speaking', 'speaking'],
  ['06', 'Gramática y vocabulario', 'gramatica-1'],
  ['07', 'Errores típicos', 'errores-1'],
  ['08', 'Tu plan de 12 semanas', 'plan'],
  ['09', 'La última semana y el día D', 'dia-d'],
  ['10', 'Sigue practicando con Dralo', 'dralo'],
];

const PHRASAL_VERBS = [
  ['bring up', 'sacar un tema', 'She brought up an interesting point.'],
  ['carry on', 'continuar', 'Carry on reading until the end.'],
  ['catch up with', 'ponerse al día con', 'Let’s catch up with Ana this weekend.'],
  ['come up with', 'idear, ocurrírsele', 'She came up with a great idea.'],
  ['cut down on', 'reducir', 'I’m trying to cut down on sugar.'],
  ['deal with', 'ocuparse de', 'Who deals with complaints?'],
  ['end up', 'acabar haciendo', 'We ended up staying at home.'],
  ['figure out', 'entender, dar con', 'I can’t figure out this exercise.'],
  ['find out', 'enterarse', 'I found out the results yesterday.'],
  ['get on with', 'llevarse bien con', 'I get on well with my classmates.'],
  ['get over', 'superar', 'It took her weeks to get over the flu.'],
  ['give up', 'dejar, rendirse', 'Don’t give up now!'],
  ['look after', 'cuidar', 'Can you look after my cat?'],
  ['look forward to', 'tener ganas de', 'I’m looking forward to the holidays.'],
  ['look up', 'buscar (un dato)', 'Look the word up in a dictionary.'],
  ['make up', 'inventar', 'He made up an excuse.'],
  ['pick up', 'pillar (un idioma)', 'I picked up some Italian in Rome.'],
  ['point out', 'señalar', 'She pointed out a mistake in my essay.'],
  ['put off', 'aplazar', 'Stop putting off your revision.'],
  ['put up with', 'aguantar', 'I can’t put up with this noise.'],
  ['run out of', 'quedarse sin', 'We’ve run out of time.'],
  ['set up', 'montar, crear', 'They set up a study group.'],
  ['take up', 'aficionarse a', 'I’ve taken up running.'],
  ['turn down', 'rechazar', 'She turned down the job offer.'],
];

const ERRORS = [
  ['I have 20 years.', 'I’m 20 years old.', `La edad va con ${enI('be')}.`],
  ['People is very friendly.', 'People are very friendly.', `${enI('People')} es plural.`],
  ['It depends of the weather.', 'It depends on the weather.', `${enI('Depend')} va con ${enI('on')}.`],
  ['Can you explain me this?', 'Can you explain this to me?', `Se dice ${enI('explain something to someone')}.`],
  ['I am agree.', 'I agree.', `${enI('Agree')} ya es un verbo.`],
  ['I live here since 2020.', 'I’ve lived here since 2020.', 'Desde un momento del pasado hasta hoy: present perfect.'],
  ['She suggested to go out.', 'She suggested going out.', `${enI('Suggest')} va con -ing.`],
  ['I look forward to see you.', 'I look forward to seeing you.', `Aquí ${enI('to')} es una preposición: va con -ing.`],
  ['If I would have time, I would go.', 'If I had time, I would go.', `Detrás de ${enI('if')} no va ${enI('would')}.`],
  ['The life is short.', 'Life is short.', `Cuando hablas en general, sin ${enI('the')}.`],
  ['It’s more better.', 'It’s much better.', `${enI('Better')} ya es comparativo.`],
  ['Some informations and advices', 'Some information and advice', 'Son incontables: nunca llevan -s.'],
  ['I did a mistake.', 'I made a mistake.', `${enI('Mistake')} va con ${enI('make')}.`],
  ['We discussed about the problem.', 'We discussed the problem.', `${enI('Discuss')} no lleva ${enI('about')}.`],
  ['Is important to practise.', 'It’s important to practise.', 'En inglés, el sujeto siempre aparece.'],
  ['The film was very bored.', 'The film was very boring.', '-ing describe la cosa; -ed, cómo te sientes tú.'],
];

const FALSE_FRIENDS = [
  ['actually', 'en realidad', `actualmente: ${enI('currently')}`],
  ['eventually', 'al final', `eventualmente: ${enI('possibly')}`],
  ['sensible', 'sensato', `sensible: ${enI('sensitive')}`],
  ['library', 'biblioteca', `librería: ${enI('bookshop')}`],
  ['embarrassed', 'avergonzado', `embarazada: ${enI('pregnant')}`],
  ['career', 'carrera profesional', `carrera universitaria: ${enI('degree')}`],
  ['realise', 'darse cuenta', `realizar: ${enI('carry out')}`],
  ['assist', 'ayudar', `asistir a clase: ${enI('attend')}`],
  ['pretend', 'fingir', `pretender: ${enI('intend')}`],
  ['argument', 'discusión', `argumento de una película: ${enI('plot')}`],
  ['constipated', 'estreñido', `estar constipado: ${enI('have a cold')}`],
  ['exit', 'salida', `éxito: ${enI('success')}`],
];

function head(kicker, title, image, size = '') {
  return `<div class="head${size ? ` head--${size}` : ''}">
    <div class="head__text"><p class="kicker">${kicker}</p><h1>${title}</h1></div>
    ${image ? `<img class="head__img" src="${image}" alt="">` : ''}
  </div>`;
}

const lead = (html) => `<p class="lead">${html}</p>`;
const chips = (items) => `<ul class="chips">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const ticks = (items) => `<ul class="ticks">${items.map((t) => `<li>${ICON.check}<p>${t}</p></li>`).join('')}</ul>`;

function steps(items) {
  return `<ol class="steps">${items
    .map((t, i) => `<li><span class="n">${i + 1}</span><p>${t}</p></li>`)
    .join('')}</ol>`;
}

function tip(label, html, image) {
  return `<aside class="tip">${image ? `<img src="${image}" alt="">` : ''}<div><p class="label">${label}</p><p>${html}</p></div></aside>`;
}

function example({ label = 'Ejemplo', question, options, answer }) {
  return `<div class="panel example">
    <p class="label">${label}</p>
    <p class="q" lang="en">${question}</p>
    ${options ? `<ul class="opts" lang="en">${options.map(([k, v]) => `<li><b>${k}</b>${v}</li>`).join('')}</ul>` : ''}
    <p class="a">${answer}</p>
  </div>`;
}

function minis(label, items) {
  return `<div class="panel">
    <p class="label">${label}</p>
    <ul class="minis">${items
      .map(
        ({ q, a, note }) =>
          `<li><p lang="en">${q}</p><span class="ans" lang="en">${a}</span>${note ? `<p class="note">${note}</p>` : ''}</li>`,
      )
      .join('')}</ul>
  </div>`;
}

function checks(items, variant = '') {
  return `<ul class="checks${variant ? ` checks--${variant}` : ''}">${items
    .map(([title, ex]) => `<li><span class="box"></span><p>${variant ? title : `<b>${title}</b>`}${ex ? `<span class="ex" lang="en">${ex}</span>` : ''}</p></li>`)
    .join('')}</ul>`;
}

function phrases(groups) {
  return `<div class="phr">${groups
    .map(([title, items]) => `<section><h3>${title}</h3><ul lang="en">${items.map((t) => `<li>${t}</li>`).join('')}</ul></section>`)
    .join('')}</div>`;
}

function phrasalVerbs(items) {
  return `<table class="t t--pv">
    <thead><tr><th>Phrasal verb</th><th>Significa</th><th>Ejemplo</th></tr></thead>
    <tbody>${items
      .map(([verb, meaning, sample]) => `<tr><td class="strong" lang="en">${verb}</td><td>${meaning}</td><td lang="en">${sample}</td></tr>`)
      .join('')}</tbody>
  </table>`;
}

function partRow(n, name, count, text) {
  return `<li class="part"><span class="part__n">Part ${n}</span><div><h3 lang="en">${name}</h3><p>${text}</p></div><span class="part__c">${count}</span></li>`;
}

function errs(items) {
  return `<ul class="errs">${items
    .map(
      ([ko, ok, why]) =>
        `<li><p class="ko">${ICON.cross}<span lang="en">${ko}</span></p><p class="ok">${ICON.check}<span lang="en">${ok}</span></p><p class="why">${why}</p></li>`,
    )
    .join('')}</ul>`;
}

function week(n, title, items, goal) {
  const phase = n <= 3 ? 1 : n <= 7 ? 2 : n <= 10 ? 3 : 4;
  return `<article class="week" data-phase="${phase}">
    <header><span class="wk">Semana ${n}</span><h2>${title}</h2></header>
    <ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>
    <p class="goal"><b>Meta:</b> ${goal}</p>
  </article>`;
}

function day(name, focus, text) {
  return `<li><p class="d">${name}<b>${focus}</b></p><p>${text}</p></li>`;
}

function tool(kind, title, text, href) {
  return `<a class="tool" data-tool="${kind}" href="${href}"><span class="tool__bar"></span><div><h3>${title}</h3><p>${text}</p></div>${ICON.arrow}</a>`;
}

function button(href, label, variant = '') {
  return `<a class="btn${variant ? ` btn--${variant}` : ''}" href="${href}">${label} ${ICON.arrow}</a>`;
}

function partPage({ part, name, measures, chips: chipList, steps: stepList, extra }) {
  return `${head(`Reading and Use of English · Part ${part}`, `<span lang="en">${name}</span>`)}
    ${lead(`<b>Qué mide:</b> ${measures}`)}
    ${chips(chipList)}
    ${steps(stepList)}
    ${extra}`;
}

function buildPages({ img, ref, link }) {
  const weekPage = (id, kicker, title, weeks) => ({
    id,
    section: 'Plan de estudio',
    render: () => `${head(kicker, title, null, 'sm')}${weeks.join('')}`,
  });

  return [
    {
      id: 'portada',
      special: true,
      render: () => `<section class="page cover" id="portada">
  <div class="content">
    <div class="cover__top"><span class="brand">Dralo Academy</span><span class="pill">Guía gratuita</span></div>
    <p class="kicker">B2 First · Cambridge English</p>
    <h1>La guía<br>completa del<br>B2 First</h1>
    <p class="cover__sub">Qué te piden, cómo se puntúa y qué practicar cada semana para aprobar.</p>
    <ul class="cover__list">
      <li>${ICON.check}<span>Las 17 partes del examen, explicadas</span></li>
      <li>${ICON.check}<span>Un plan de estudio de 12&nbsp;semanas</span></li>
      <li>${ICON.check}<span>Errores típicos y frases útiles</span></li>
    </ul>
    <p class="cover__foot">Edición 2026 · dralo.es</p>
  </div>
  <img class="cover__img" src="${img.cover}" alt="La mascota de Dralo, con un libro y un lápiz">
</section>`,
    },
    {
      id: 'hola',
      section: 'Antes de empezar',
      render: () => `${head('Antes de empezar', 'Esta guía es para ti si…', img.hello)}
        ${ticks([
          'Te vas a presentar al B2 First de Cambridge, o te lo estás pensando.',
          'Estudias o trabajas, y el tiempo para el inglés es el que es.',
          'Quieres saber qué practicar, en vez de estudiar «más por estudiar».',
        ])}
        <div class="panel">
          <p class="label">Cómo usarla</p>
          ${steps([
            'Lee la sección 01: el examen entero en diez minutos.',
            'Haz un Reading and Use of English completo para saber de dónde partes.',
            'Sigue el plan de 12 semanas y marca lo que vayas haciendo.',
          ])}
        </div>
        <blockquote class="quote"><p>«No se trata de estudiar más. Se trata de saber qué necesitas mejorar.»</p><cite>El equipo de Dralo</cite></blockquote>`,
    },
    {
      id: 'indice',
      section: 'Índice',
      render: () => `${head('Índice', 'Qué hay dentro')}
        <ol class="toc">${SECTIONS.map(
          ([n, title, id]) =>
            `<li><a href="#${id}"><span class="toc__n">${n}</span><span class="toc__t">${title}</span><span class="toc__p">${ref(id)}</span></a></li>`,
        ).join('')}</ol>`,
    },
    {
      id: 'examen',
      section: 'El examen',
      render: () => `${head('01 · El examen en 10 minutos', 'Cuatro pruebas, cinco notas')}
        ${lead('El B2 First certifica el nivel B2 del Marco Común Europeo. Tiene cuatro pruebas, pero recibes cinco notas: Reading y Use of English se puntúan por separado, aunque vayan en el mismo examen.')}
        <table class="t">
          <thead><tr><th>Prueba</th><th>Duración</th><th>Qué hay</th><th class="num">Peso</th></tr></thead>
          <tbody>
            <tr><td class="strong"><i class="dot" style="--c:#0ea5e9"></i>Reading and Use of English</td><td class="nowrap">1 h 15 min</td><td class="nowrap">7 partes<br>52 preguntas</td><td class="num">40 %</td></tr>
            <tr><td class="strong"><i class="dot" style="--c:#059669"></i>Writing</td><td class="nowrap">1 h 20 min</td><td class="nowrap">2 textos<br>140–190 palabras</td><td class="num">20 %</td></tr>
            <tr><td class="strong"><i class="dot" style="--c:#d97706"></i>Listening</td><td class="nowrap">unos 40 min</td><td class="nowrap">4 partes<br>30 preguntas</td><td class="num">20 %</td></tr>
            <tr><td class="strong"><i class="dot" style="--c:#db2777"></i>Speaking</td><td class="nowrap">14 min</td><td class="nowrap">4 partes<br>en pareja</td><td class="num">20 %</td></tr>
          </tbody>
        </table>
        <div class="cards">
          <div class="card"><h3>Unas 3 horas y media</h3><p>El Speaking puede ser el mismo día o en otra fecha cercana. Te lo indica tu centro.</p></div>
          <div class="card"><h3>En papel o en ordenador</h3><p>Las tareas, el formato y la dificultad son los mismos. Elige donde estés más a gusto.</p></div>
        </div>`,
    },
    {
      id: 'nota',
      section: 'El examen',
      render: () => `${head('01 · El examen en 10 minutos', 'Cómo se aprueba', img.think)}
        ${lead('Cada una de las cinco notas va en la Cambridge English Scale. Tu resultado final es la media de las cinco.')}
        <ol class="ladder">
          <li class="l4"><span class="r">180–190</span><span class="g">Grade A</span><span class="c">Certificado C1</span></li>
          <li class="l3"><span class="r">173–179</span><span class="g">Grade B</span><span class="c">Certificado B2</span></li>
          <li class="l2"><span class="r">160–172</span><span class="g">Grade C</span><span class="c">Certificado B2</span></li>
          <li class="l1"><span class="r">140–159</span><span class="g">Level B1</span><span class="c">Certificado B1</span></li>
        </ol>
        ${ticks([
          'Apruebas con <b>160 de media</b>. No hace falta aprobar cada prueba: una nota alta compensa otra más baja.',
          'Los errores <b>no restan</b>. Nunca dejes una respuesta en blanco.',
          'No hay un porcentaje fijo de aciertos que, por sí solo, sea el aprobado. Lo que cuenta es la media.',
          'El certificado <b>no caduca</b>, aunque algunas universidades y empresas lo piden reciente.',
        ])}
        <p class="small muted">Por debajo de 140 no se emite certificado.</p>`,
    },
    {
      id: 'reglas',
      section: 'El examen',
      render: () => `${head('01 · El examen en 10 minutos', 'Cinco reglas para todo el examen', img.clap)}
        ${steps([
          '<b>Practica con el formato real desde la primera semana.</b> Cuanto antes sepas cómo es cada parte, menos puntos regalas.',
          '<b>Cronometra siempre.</b> En Reading and Use of English, el reloj aprieta tanto como la gramática.',
          '<b>Corrige más de lo que haces.</b> Un ejercicio revisado a fondo enseña más que tres hechos deprisa.',
          '<b>Lee la instrucción y cuenta.</b> En la Part 4 de Use of English van de 2 a 5 palabras; en Writing, de 140 a 190.',
          '<b>En papel, pasa las respuestas a tiempo.</b> En Reading and Use of English no hay minutos extra para la hoja de respuestas; en Listening tienes 5 al final.',
        ])}`,
    },
    {
      id: 'ruoe',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () => `${head('02 · Reading and Use of English', '7 partes en 75 minutos', img.book)}
        ${lead('Partes 1 a 4: vocabulario y gramática. Partes 5 a 7: comprensión lectora. Puedes hacerlas en el orden que quieras.')}
        <table class="t">
          <thead><tr><th>Parte</th><th>Tarea</th><th class="num">Preguntas</th><th class="num">Tiempo</th></tr></thead>
          <tbody>
            <tr><td class="strong">1</td><td lang="en">Multiple-choice cloze</td><td class="num">8</td><td class="num">7 min</td></tr>
            <tr><td class="strong">2</td><td lang="en">Open cloze</td><td class="num">8</td><td class="num">8 min</td></tr>
            <tr><td class="strong">3</td><td lang="en">Word formation</td><td class="num">8</td><td class="num">8 min</td></tr>
            <tr><td class="strong">4</td><td lang="en">Key word transformations</td><td class="num">6</td><td class="num">10 min</td></tr>
            <tr><td class="strong">5</td><td lang="en">Multiple choice</td><td class="num">6</td><td class="num">14 min</td></tr>
            <tr><td class="strong">6</td><td lang="en">Gapped text</td><td class="num">6</td><td class="num">13 min</td></tr>
            <tr><td class="strong">7</td><td lang="en">Multiple matching</td><td class="num">10</td><td class="num">12 min</td></tr>
            <tr class="sub"><td></td><td>Repaso y hoja de respuestas</td><td></td><td class="num">3 min</td></tr>
          </tbody>
        </table>
        ${tip('Ojo con el tiempo', 'Los tiempos son orientativos. Las partes 5 y 6 dan 2 puntos por pregunta, y la Part 4, hasta 2 por frase: que el reloj no te pille en ellas.')}`,
    },
    {
      id: 'p1',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 1,
          name: 'Multiple-choice cloze',
          measures: 'vocabulario en contexto: colocaciones, phrasal verbs y palabras parecidas que no se usan igual.',
          chips: ['8 huecos', '4 opciones', '1 punto cada uno', 'unos 7 min'],
          steps: [
            'Lee el texto entero antes de elegir. El sentido general ya descarta opciones.',
            `Mira lo que va justo después del hueco: una preposición suele decidir (${en('depend on, interested in')}).`,
            'Si dos opciones significan lo mismo, la clave está en cuál «va» con la palabra de al lado.',
            'Si dudas, elige una y sigue. Los errores no restan.',
          ],
          extra: example({
            question: `Our teacher always ${GAP} a lot of attention to pronunciation.`,
            options: [
              ['A', 'gives'],
              ['B', 'pays'],
              ['C', 'makes'],
              ['D', 'takes'],
            ],
            answer: `<b>B) pays.</b> ${enI('Pay attention')} es una colocación fija: en español «prestamos» atención; en inglés, se «paga».`,
          }),
        }),
    },
    {
      id: 'p2',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 2,
          name: 'Open cloze',
          measures: 'gramática: preposiciones, artículos, auxiliares, pronombres, relativos, conectores y cuantificadores.',
          chips: ['8 huecos', 'sin opciones', '1 palabra por hueco', 'unos 8 min'],
          steps: [
            'Pregúntate qué tipo de palabra falta: ¿un auxiliar, una preposición, un relativo?',
            `Mira la estructura completa, no solo el hueco: ${en('such… that, as… as, not only… but also')}.`,
            'Comprueba el tiempo verbal y la concordancia de toda la frase.',
            `Una sola palabra, bien escrita. Una contracción como ${en('don’t')} cuenta como dos.`,
          ],
          extra: minis('Ejemplos', [
            { q: `We went for a walk ${GAP} the rain.`, a: 'despite', note: `${enI('In spite of')} serían tres palabras.` },
            { q: `It was ${GAP} a good film that we watched it twice.`, a: 'such' },
            { q: `That’s the café ${GAP} we first met.`, a: 'where' },
          ]),
        }),
    },
    {
      id: 'p3',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 3,
          name: 'Word formation',
          measures: 'que sepas transformar una palabra en sustantivo, adjetivo, adverbio o verbo, con prefijos negativos y plurales.',
          chips: ['8 huecos', 'te dan la palabra base', '1 punto cada uno', 'unos 8 min'],
          steps: [
            'Decide qué falta: ¿sustantivo, adjetivo, adverbio o verbo? Lo que va antes y después del hueco te lo dice.',
            `Lee la frase entera: ¿pide un sentido negativo (${en('un-, in-, im-, dis-, ir-')})?`,
            'Comprueba si va en plural o si el verbo cambia de forma.',
          ],
          extra: `<div class="split">
            <div class="panel affix">
              <p class="label">Terminaciones</p>
              <dl lang="en">
                <div><dt lang="es">Sustantivo</dt><dd>-tion, -ment, -ness, -ity, -ance</dd></div>
                <div><dt lang="es">Adjetivo</dt><dd>-ful, -less, -ous, -able, -ive</dd></div>
                <div><dt lang="es">Adverbio</dt><dd>-ly</dd></div>
                <div><dt lang="es">Negativo</dt><dd>un-, in-, im-, il-, ir-, dis-</dd></div>
              </dl>
            </div>
            ${minis('Ejemplos', [
              { q: 'The film was (INCREDIBLE) boring.', a: 'incredibly' },
              { q: 'You can’t park here: it’s (LEGAL).', a: 'illegal' },
              { q: 'You need (STRONG) for this job.', a: 'strength' },
            ])}
          </div>`,
        }),
    },
    {
      id: 'p4',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 4,
          name: 'Key word transformations',
          measures: 'decir lo mismo con otra estructura: pasiva, estilo indirecto, condicionales, comparativos o phrasal verbs.',
          chips: ['6 frases', 'de 2 a 5 palabras', 'hasta 2 puntos cada una', 'unos 10 min'],
          steps: [
            'No cambies la palabra clave, ni su forma.',
            'Busca las dos cosas que se evalúan: una estructura y una expresión. Cada una suele valer un punto.',
            'Cuenta: de 2 a 5 palabras, con la clave incluida. Las contracciones cuentan como dos.',
            'Escribe algo siempre: media respuesta puede darte un punto.',
          ],
          extra: `<div class="panel">
            <p class="label">Ejemplos</p>
            <div class="kwt__item" lang="en">
              <p>“I’m sorry I’m late,” said Tom. <span class="key">APOLOGISED</span></p>
              <p>Tom <span class="fill">apologised for being</span> late.</p>
            </div>
            <div class="kwt__item" lang="en">
              <p>I haven’t seen Laura for ages. <span class="key">LAST</span></p>
              <p>It’s ages <span class="fill">since I last saw</span> Laura.</p>
            </div>
          </div>`,
        }),
    },
    {
      id: 'p5',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 5,
          name: 'Multiple choice',
          measures: 'comprensión detallada: la opinión y la actitud del autor, el propósito, el significado por el contexto y a qué se refiere cada palabra.',
          chips: ['1 texto largo', '6 preguntas', '4 opciones', '2 puntos cada una', 'unos 14 min'],
          steps: [
            'Lee el texto deprisa para saber de qué va.',
            'Lee la pregunta, sin las opciones, y localiza el párrafo: las preguntas siguen el orden del texto.',
            'Responde con tus palabras antes de mirar las opciones.',
            'Desconfía de la opción que repite palabras del texto: la buena suele estar dicha de otra forma.',
          ],
          extra: tip(
            'La pregunta clave',
            'Casi todas las opciones dicen algo que aparece en el texto, pero solo una responde a lo que te preguntan. Antes de marcar, comprueba: ¿esto contesta la pregunta?',
          ),
        }),
    },
    {
      id: 'p6',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 6,
          name: 'Gapped text',
          measures: `cómo se une un texto: referencias (${en('this, they')}), conectores y el orden de las ideas.`,
          chips: ['6 huecos', '7 frases: sobra una', '2 puntos cada una', 'unos 13 min'],
          steps: [
            'Lee el texto sin las frases para entender cómo avanza.',
            `Subraya las pistas antes y después de cada hueco: pronombres (${en('it, they, this')}), conectores (${en('however, as a result')}) y nombres.`,
            'La frase tiene que encajar con lo de antes y con lo de después.',
            'Empieza por los huecos claros. La frase que sobra parece del tema, pero choca con algo.',
          ],
          extra: example({
            question: `…so the company decided to move its office to Madrid. <span class="slot">1</span> Not everyone was happy about it.`,
            answer: `<b>Encaja:</b> ${enI('This decision surprised many employees.')} Recoge lo de antes y prepara el ${enI('it')} de después.`,
          }),
        }),
    },
    {
      id: 'p7',
      section: 'Reading and Use of English',
      accent: 'reading',
      render: () =>
        partPage({
          part: 7,
          name: 'Multiple matching',
          measures: 'encontrar información concreta y reconocer una idea dicha con otras palabras.',
          chips: ['1 texto largo o varios cortos', '10 preguntas', '1 punto cada una', 'unos 12 min'],
          steps: [
            'Lee primero las 10 afirmaciones y subraya la idea clave de cada una.',
            'Busca la misma idea con otras palabras, no las mismas palabras.',
            'Ve sección por sección y anota qué afirmaciones encajan.',
            'Es la última parte: guárdale al menos 12 minutos.',
          ],
          extra: `<div class="panel example">
            <p class="label">Así se esconde una respuesta</p>
            <p class="pair"><span class="tag">Pregunta</span><span lang="en">The writer regrets not starting earlier.</span></p>
            <p class="pair"><span class="tag">Texto</span><span lang="en">If only I had begun my preparation a few months before the exam.</span></p>
            <p class="a"><b lang="en">regrets</b> = <b lang="en">if only</b>: la misma idea, con otras palabras.</p>
          </div>`,
        }),
    },
    {
      id: 'writing',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing', 'Dos textos en 80 minutos', img.desk)}
        <div class="cards">
          <div class="card"><p class="label">Part 1 · Obligatoria</p><h3 lang="en">Essay</h3><p>Te dan una pregunta y dos ideas, y tú añades una tercera. Das tu opinión.</p></div>
          <div class="card"><p class="label">Part 2 · Eliges 1 de 3</p><h3>Article, email o letter, report o review</h3><p>En la versión for Schools también puede salir una story.</p></div>
        </div>
        ${chips(['De 140 a 190 palabras', '40 min por texto', '10 planificar · 25 escribir · 5 revisar'])}
        <div class="panel">
          <p class="label">Cómo se corrige: 4 criterios, de 0 a 5</p>
          <dl class="criteria">
            <div><dt lang="en">Content</dt><dd>¿Has respondido a todo lo que pide la tarea?</dd></div>
            <div><dt lang="en">Communicative Achievement</dt><dd>¿El tono y el formato encajan con el lector?</dd></div>
            <div><dt lang="en">Organisation</dt><dd>¿Párrafos claros, conectores variados, ideas que avanzan?</dd></div>
            <div><dt lang="en">Language</dt><dd>¿Vocabulario y gramática variados y correctos?</dd></div>
          </dl>
        </div>`,
    },
    {
      id: 'essay',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing · Part 1', 'El essay, paso a paso')}
        <div class="panel task" lang="en">
          <p class="label" lang="es">Así es la tarea</p>
          <p>In your English class you have been talking about technology. Now your English teacher has asked you to write an essay.</p>
          <p class="task__q">Do teenagers spend too much time on social media?</p>
          <p><b>Notes.</b> Write about: 1. friendships · 2. mental health · 3.&nbsp;………&nbsp;(your&nbsp;own&nbsp;idea)</p>
        </div>
        <ol class="plan5">
          <li><span class="wc">25–30<small>palabras</small></span><p><b>Introducción.</b> Presenta el tema y anticipa tu postura.</p></li>
          <li><span class="wc">35–45<small>palabras</small></span><p><b>Idea 1:</b> ${enI('friendships')}, con un ejemplo.</p></li>
          <li><span class="wc">35–45<small>palabras</small></span><p><b>Idea 2:</b> ${enI('mental health')}, con un ejemplo.</p></li>
          <li><span class="wc">35–45<small>palabras</small></span><p><b>Tu idea.</b> Por ejemplo, lo que se aprende: tutoriales, idiomas, noticias.</p></li>
          <li><span class="wc">25–30<small>palabras</small></span><p><b>Conclusión.</b> Tu opinión, clara y sin ideas nuevas.</p></li>
        </ol>
        <p class="small"><b>Usa las tres notas.</b> Si te dejas una, pierdes puntos de Content aunque tu inglés sea muy bueno.</p>`,
    },
    {
      id: 'essay-2',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing · Part 1', 'Cómo abrir y cerrar tu essay')}
        <div class="cards">
          <div class="card"><p class="label">Para empezar</p><p lang="en">Nowadays, most teenagers spend several hours a day on social media, and many adults see this as a problem.</p></div>
          <div class="card"><p class="label">Para cerrar</p><p lang="en">In conclusion, I believe social media is not harmful in itself, but teenagers need to use it in moderation.</p></div>
        </div>
        <div class="panel">
          <p class="label">Antes de entregar cualquier texto</p>
          ${checks(
            [
              ['¿Has respondido a todo lo que pide la tarea?'],
              ['¿El tono es el que espera ese lector?'],
              ['¿Un párrafo por idea, unidos con conectores?'],
              ['¿Entre 140 y 190 palabras? Pasarte no suma puntos.'],
              ['¿Has buscado tus errores de siempre?'],
            ],
            'plain',
          )}
        </div>
        ${tip('En papel', 'No cuentes palabra por palabra. Cuenta las de tres líneas, saca la media y multiplica por el número de líneas.')}`,
    },
    {
      id: 'formatos',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing · Part 2', 'Los cuatro formatos de la Part 2')}
        <div class="cards">
          <div class="card"><h3 lang="en">Article</h3><p><b>Para:</b> los lectores de una revista o una web.</p><p><b>Tono:</b> cercano y con chispa.</p><p><b>Clave:</b> un título con gancho, preguntas al lector, ejemplos personales y un final que se recuerde.</p></div>
          <div class="card"><h3>Email o letter</h3><p><b>Para:</b> un amigo, una empresa o una institución.</p><p><b>Tono:</b> informal o formal, según a quién escribas.</p><p><b>Clave:</b> el saludo y la despedida adecuados, y responder a todo lo que te preguntan.</p></div>
          <div class="card"><h3 lang="en">Report</h3><p><b>Para:</b> un jefe, un profesor o un comité.</p><p><b>Tono:</b> formal.</p><p><b>Clave:</b> título, apartados con encabezados y recomendaciones al final. Sin anécdotas.</p></div>
          <div class="card"><h3 lang="en">Review</h3><p><b>Para:</b> los lectores de una web o una revista.</p><p><b>Tono:</b> semiformal.</p><p><b>Clave:</b> describe lo justo, valora con adjetivos precisos y termina recomendando, o no.</p></div>
        </div>
        ${tip('Truco', 'Prepara a fondo dos formatos. Entre las tres opciones, lo normal es que salga al menos uno de los tuyos.')}`,
    },
    {
      id: 'conectores',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing', 'Conectores que suman puntos')}
        ${phrases([
          ['Añadir', ['In addition, …', 'Furthermore, …', 'What is more, …']],
          ['Contrastar', ['However, …', 'On the other hand, …', 'Although … / Despite + -ing']],
          ['Causa y efecto', ['As a result, …', 'Therefore, …', 'This is why …']],
          ['Poner ejemplos', ['For instance, …', '… such as …', 'A good example of this is …']],
          ['Opinar', ['In my view, …', 'I strongly believe that …', 'It seems to me that …']],
          ['Concluir', ['In conclusion, …', 'All things considered, …', 'On balance, …']],
        ])}
        ${tip('Truco', `Varía: si tres párrafos empiezan por ${enI('However')}, se nota. Y usa los conectores para unir ideas, no para adornar.`)}`,
    },
    {
      id: 'frases-formato',
      section: 'Writing',
      accent: 'writing',
      render: () => `${head('03 · Writing', 'Frases útiles para cada formato')}
        ${phrases([
          ['Article', ['Have you ever wondered …?', 'Let me tell you about …', 'So, what are you waiting for?']],
          ['Email informal', ['It was great to hear from you!', 'Anyway, I’d better go now.', 'Write back soon!']],
          ['Email o letter formal', ['Dear Sir or Madam,', 'I am writing to enquire about …', 'I look forward to hearing from you.']],
          ['Report', ['The aim of this report is to …', 'It is recommended that …', 'Overall, …']],
          ['Review', ['If you enjoy …, you will love …', 'The only drawback is …', 'I would highly recommend it to …']],
          ['Despedidas formales', ['Yours faithfully, (si empiezas con Dear Sir or Madam)', 'Yours sincerely, (si sabes el nombre: Dear Ms Smith)']],
        ])}
        ${tip('Truco', 'Apréndete tres frases por formato y úsalas en cada texto que escribas. El día del examen saldrán solas.')}`,
    },
    {
      id: 'listening',
      section: 'Listening',
      accent: 'listening',
      render: () => `${head('04 · Listening', 'Cuatro partes, y todo se oye dos veces', img.dance)}
        ${lead('Unos 40 minutos y 30 preguntas. En papel, al final tienes 5 minutos para pasar las respuestas a la hoja.')}
        <ol class="parts">
          ${partRow(1, 'Multiple choice', '8 preguntas', 'Ocho audios cortos sin relación entre sí. Una pregunta de 3 opciones por audio.')}
          ${partRow(2, 'Sentence completion', '10 preguntas', 'Una persona habla unos 3 minutos. Completas 10 frases con palabras que oyes.')}
          ${partRow(3, 'Multiple matching', '5 preguntas', 'Cinco personas hablan del mismo tema. Para cada una eliges entre 8 opciones: sobran 3.')}
          ${partRow(4, 'Multiple choice', '7 preguntas', 'Una entrevista o una conversación de 3 a 4 minutos, con 7 preguntas de 3 opciones.')}
        </ol>`,
    },
    {
      id: 'listening-estrategias',
      section: 'Listening',
      accent: 'listening',
      render: () => `${head('04 · Listening', 'Cómo escuchar en el examen')}
        ${steps([
          'Usa el tiempo de lectura: subraya la idea clave de cada pregunta antes de que empiece el audio.',
          'Primera escucha, para la idea general. Segunda, para confirmar o corregir.',
          'Cuidado con las trampas: el audio suele mencionar varias opciones, pero solo una responde a la pregunta.',
          'En la Part 2, escribe las palabras exactas que oyes, sin sinónimos, y revisa la ortografía.',
          'Si se te escapa una respuesta, olvídala y céntrate en la siguiente. Al final, marca algo: no restan.',
        ])}
        ${tip('Tu hábito diario', `15 minutos al día de algo que te guste en inglés: un podcast (por ejemplo, ${enI('6 Minute English')}, de BBC Learning English), una serie con subtítulos en inglés o un canal de YouTube. Mejor un poco cada día que dos horas el domingo.`, img.relax)}`,
    },
    {
      id: 'speaking',
      section: 'Speaking',
      accent: 'speaking',
      render: () => `${head('05 · Speaking', '14 minutos, en pareja', img.board)}
        ${lead(`Dos examinadores: uno pregunta (el ${enI('interlocutor')}) y otro puntúa (el ${enI('assessor')}). Lo normal es ir en pareja; a veces, en grupo de tres.`)}
        <ol class="parts">
          ${partRow(1, 'Interview', '2 min', 'Preguntas sobre ti: estudios, trabajo, aficiones, planes.')}
          ${partRow(2, 'Long turn', '4 min', 'Comparas dos fotos durante 1 minuto y respondes a una pregunta. Después comentas unos 30 segundos las de tu compañero.')}
          ${partRow(3, 'Collaborative task', '4 min', 'Habláis 2 minutos sobre una pregunta con cinco ideas, y 1 minuto más para decidir algo juntos.')}
          ${partRow(4, 'Discussion', '4 min', 'Preguntas más abiertas sobre el tema de la Part 3.')}
        </ol>
        <p class="small muted">Se puntúan: Grammar and Vocabulary, Discourse Management, Pronunciation, Interactive Communication y una nota global.</p>`,
    },
    {
      id: 'speaking-estrategias',
      section: 'Speaking',
      accent: 'speaking',
      render: () => `${head('05 · Speaking', 'Cómo lucirte en cada parte')}
        <div class="cards">
          <div class="card"><p class="label">Part 1</p><p>Responde con 2 o 3 frases: respuesta, motivo y ejemplo. Ni monosílabos ni discursos aprendidos de memoria.</p></div>
          <div class="card"><p class="label">Part 2</p><p>Compara, no describas. Responde a la pregunta que aparece encima de las fotos. Si te falta una palabra, explícala con otras.</p></div>
          <div class="card"><p class="label">Part 3</p><p>Es una conversación: pregunta, reacciona a lo que dice tu compañero y no acapares. No hace falta comentar las cinco ideas ni acabar de acuerdo.</p></div>
          <div class="card"><p class="label">Part 4</p><p>Desarrolla: da razones y ejemplos, y conecta con lo que ha dicho tu compañero.</p></div>
        </div>
        ${tip('Recuerda', 'Tu compañero no es tu rival: si os ayudáis, la conversación fluye y los dos sumáis. Y si no entiendes una pregunta, pide que te la repitan. Está permitido.')}`,
    },
    {
      id: 'speaking-frases',
      section: 'Speaking',
      accent: 'speaking',
      render: () => `${head('05 · Speaking', 'Frases para el Speaking')}
        ${phrases([
          ['Comparar', ['Both photos show …', 'In the first one …, whereas in the second …', 'The main difference is that …']],
          ['Especular', ['They might be …', 'It looks as if …', 'I’d say they’re probably …']],
          ['Opinar', ['As far as I’m concerned, …', 'To be honest, …', 'I’d say that …']],
          ['Implicar a tu compañero', ['What do you think?', 'Would you agree?', 'How about you?']],
          ['Acuerdo y desacuerdo', ['That’s a good point.', 'I see what you mean, but …', 'I’m not so sure about that.']],
          ['Ganar tiempo', ['That’s an interesting question.', 'Let me think …', 'Well, it depends.']],
          ['Decidir (Part 3)', ['So, which one shall we choose?', 'I think we both agree that …', 'Let’s go for …']],
          ['Si no entiendes', ['Sorry, could you repeat the question, please?', 'Sorry, could you say that again?']],
        ])}`,
    },
    {
      id: 'gramatica-1',
      section: 'Gramática y vocabulario',
      render: () => `${head('06 · Gramática y vocabulario', 'La gramática del B2 en una lista', img.study)}
        ${lead('Marca lo que ya dominas. Lo que quede sin marcar va a tu plan.')}
        ${checks([
          ['Present perfect simple y continuous', 'I’ve been studying English for three years.'],
          ['Pasados: simple, continuous y past perfect', 'By the time we arrived, the talk had started.'],
          ['Futuros', 'I’m meeting Ana tomorrow. I’ll have finished by Friday.'],
          ['used to, be used to y get used to', 'I’m not used to speaking English every day.'],
          ['Condicionales 0, 1, 2, 3 y mixtos', 'If I had studied more, I would be calmer now.'],
          ['wish e if only', 'I wish I had more time.'],
          ['Pasiva y have something done', 'I had my essay checked before sending it.'],
          ['Estilo indirecto', 'She said she had taken the exam the week before.'],
        ])}`,
    },
    {
      id: 'gramatica-2',
      section: 'Gramática y vocabulario',
      render: () => `${head('06 · Gramática y vocabulario', 'La gramática del B2, segunda parte')}
        ${checks([
          ['Modales de deducción', 'She can’t have left: her coat is still here.'],
          ['Relativos: who, which, whose, where', 'The candidate whose essay won is in my class.'],
          ['Gerundio o infinitivo', 'She suggested rewriting it. Remember to bring your ID.'],
          ['Comparativos', 'The more you practise, the easier it gets.'],
          ['so y such, too y enough', 'It was such a long exam that I was exhausted.'],
          ['Conectores: although, despite, unless, in case', 'Take a spare pen in case yours runs out.'],
          ['Inversión', 'Not only was he late, but he also forgot his notes.'],
          ['Cuantificadores', 'I have a few ideas, but little time.'],
        ])}
        ${tip('El reto del martes', `Cada martes, un reto nuevo en Dralo con una de estas estructuras. Dos minutos. <a href="${link('/training/', 'pdf_reto')}">Hazlo en dralo.es/training</a>`, img.stand)}`,
    },
    {
      id: 'phrasal-1',
      section: 'Gramática y vocabulario',
      render: () => `${head('06 · Gramática y vocabulario', '24 phrasal verbs que salen una y&nbsp;otra&nbsp;vez')}
        ${phrasalVerbs(PHRASAL_VERBS.slice(0, 12))}`,
    },
    {
      id: 'phrasal-2',
      section: 'Gramática y vocabulario',
      render: () => `${head('06 · Gramática y vocabulario', 'Phrasal verbs, segunda parte')}
        ${phrasalVerbs(PHRASAL_VERBS.slice(12))}
        <p class="small"><b>Truco:</b> cambia cada ejemplo por una frase sobre tu vida. Así se quedan.</p>`,
    },
    {
      id: 'colocaciones',
      section: 'Gramática y vocabulario',
      render: () => `${head('06 · Gramática y vocabulario', 'Colocaciones: palabras que van juntas')}
        ${lead(`En la Part 1 de Use of English y en el Writing se nota quién las domina. En inglés no «haces» una decisión: la ${enI('make')}.`)}
        <div class="coll">
          <section><h3 lang="en">make</h3><p lang="en">a decision · a mistake · an effort · progress · money · a difference</p></section>
          <section><h3 lang="en">do</h3><p lang="en">homework · research · your best · a course · damage · someone a favour</p></section>
          <section><h3 lang="en">take</h3><p lang="en">a break · an exam · part in · place · advantage of · something into account</p></section>
          <section><h3 lang="en">have</h3><p lang="en">fun · a look · an argument · a good time · an effect on</p></section>
          <section><h3 lang="en">pay</h3><p lang="en">attention · a visit · a compliment</p></section>
          <section><h3>Y además</h3><p lang="en">heavy rain · heavy traffic · highly recommended · deeply regret · fully aware</p></section>
        </div>
        <p class="small"><b>Apunta siempre el bloque, no la palabra suelta:</b> no «${enI('decision')}», sino «${enI('make a decision')}».</p>`,
    },
    {
      id: 'errores-1',
      section: 'Errores típicos',
      render: () => `${head('07 · Errores típicos', 'Los errores que más repetimos', img.oops)}
        ${errs(ERRORS.slice(0, 8))}`,
    },
    {
      id: 'errores-2',
      section: 'Errores típicos',
      render: () => `${head('07 · Errores típicos', 'Y estos también se repiten')}
        ${errs(ERRORS.slice(8))}`,
    },
    {
      id: 'falsos-amigos',
      section: 'Errores típicos',
      render: () => `${head('07 · Errores típicos', '12 falsos amigos', img.shrug)}
        ${lead('Se parecen al español, pero no significan lo mismo.')}
        <table class="t t--tight">
          <thead><tr><th>En inglés</th><th>Significa</th><th>Si querías decir…</th></tr></thead>
          <tbody>${FALSE_FRIENDS.map(([word, means, instead]) => `<tr><td class="strong" lang="en">${word}</td><td>${means}</td><td>${instead}</td></tr>`).join('')}</tbody>
        </table>`,
    },
    {
      id: 'plan',
      section: 'Plan de estudio',
      render: () => `${head('08 · Tu plan de 12 semanas', 'Cómo funciona el plan', img.run)}
        ${lead('Unas 5 horas a la semana: de 45 a 60 minutos al día, cinco días. Si un día falla, no lo recuperes de golpe: sigue.')}
        <ol class="phases">
          <li data-phase="1"><span class="ph__w">Semanas 1–3</span><h3>Conoce el examen</h3><p>Diagnóstico, formato y la gramática base.</p></li>
          <li data-phase="2"><span class="ph__w">Semanas 4–7</span><h3>Parte por parte</h3><p>La técnica de cada parte y un formato de Writing por semana.</p></li>
          <li data-phase="3"><span class="ph__w">Semanas 8–10</span><h3>Con reloj</h3><p>Pruebas completas cronometradas y trabajo con tus errores.</p></li>
          <li data-phase="4"><span class="ph__w">Semanas 11–12</span><h3>Simulacros</h3><p>Dos exámenes completos y repaso final.</p></li>
        </ol>
        <div class="panel">
          <p class="label">¿De dónde saco los ejercicios?</p>
          <p>De los exámenes de muestra de la web de Cambridge, de tu libro de clase o de Dralo, donde cada parte se corrige al momento.</p>
        </div>
        ${button(link('/exam-practice/b2/exam-reading-and-use-of-english/', 'pdf_diagnostico'), 'Haz tu diagnóstico en Dralo')}`,
    },
    {
      id: 'semana-tipo',
      section: 'Plan de estudio',
      render: () => `${head('08 · Tu plan de 12 semanas', 'Tu semana tipo', img.walk)}
        <ul class="days">
          ${day('Lunes', 'Use of English', 'Partes 1 a 4, 40 minutos. Después, 10 minutos para apuntar tus errores.')}
          ${day('Martes', 'Reading y reto', 'El reto del martes en Dralo (2 minutos) y una parte de Reading, 45 minutos.')}
          ${day('Miércoles', 'Writing', 'Planifica y escribe un texto en 40 minutos. Revísalo con la checklist.')}
          ${day('Jueves', 'Listening', `Dos partes, 30 minutos, y 10 de ${enI('shadowing')}: repite en voz alta frases del audio.`)}
          ${day('Viernes', 'Speaking', 'Grábate en las partes 1 y 2 (20 minutos) y repasa vocabulario (20 minutos).')}
          ${day('Fin de semana', 'Descanso', 'Una serie o un podcast en inglés, si te apetece. Descansar también es parte del plan.')}
        </ul>
        <div class="cards">
          <div class="card"><p class="label">Cada día</p><p>10 minutos de vocabulario con tarjetas. Poco y a menudo.</p></div>
          <div class="card"><p class="label">Tu registro de errores</p><p>Cada fallo, a una libreta: la frase, la respuesta buena y por qué. Repásalo los viernes.</p></div>
        </div>`,
    },
    weekPage('semanas-1-2', 'Fase 1 · Conoce el examen', 'Semanas 1 y 2', [
      week(
        1,
        'Tu punto de partida',
        [
          'Haz un Reading and Use of English completo, con reloj. Es tu diagnóstico.',
          'Lee cómo es cada parte del examen (secciones 01 a 05).',
          'Escribe tu primer essay sin límite de tiempo.',
          'Escucha una Part 1 de Listening y graba tu Speaking Part 1.',
          'Empieza tu registro de errores y tu tabla de seguimiento.',
        ],
        'saber de dónde partes y qué parte te cuesta más.',
      ),
      week(
        2,
        'La gramática base',
        [
          'Tiempos verbales y condicionales (pág. ' + ref('gramatica-1') + ').',
          'Use of English Part 2: tres textos.',
          'Writing: el essay con la estructura de cinco párrafos (pág. ' + ref('essay') + ').',
          'Listening Part 2 y Speaking Part 2: compara dos fotos.',
          '10 minutos de vocabulario al día.',
        ],
        'acertar 5 de 8 en la Part 2.',
      ),
    ]),
    weekPage('semanas-3-4', 'Fases 1 y 2 · Del formato a la técnica', 'Semanas 3 y 4', [
      week(
        3,
        'Vocabulario que puntúa',
        [
          'Use of English Part 1: colocaciones y phrasal verbs (pág. ' + ref('phrasal-1') + ').',
          'Reading Part 7: dos textos.',
          'Writing: un essay en 40 minutos.',
          'Listening Part 3 y Speaking Part 3, con alguien o grabándote.',
          'Repasa tu registro de errores.',
        ],
        'tu primer essay de cinco párrafos dentro del tiempo.',
      ),
      week(
        4,
        'Word formation y emails',
        [
          'Use of English Part 3: sufijos y prefijos (pág. ' + ref('p3') + ').',
          'Writing: un email informal y otro formal.',
          'Reading Part 6: un texto.',
          'Listening Part 4.',
          'Speaking Part 4: da razones y ejemplos.',
        ],
        'acertar 6 de 8 en la Part 3.',
      ),
    ]),
    weekPage('semanas-5-6', 'Fase 2 · Parte por parte', 'Semanas 5 y 6', [
      week(
        5,
        'Key word transformations',
        [
          'Use of English Part 4: doce frases, en dos sesiones.',
          'Writing: un article.',
          'Reading Part 5: un texto.',
          'Listening: Part 1 y Part 2.',
          'Speaking: Part 2 con reloj, un minuto exacto.',
        ],
        'sacar 8 de los 12 puntos de la Part 4.',
      ),
      week(
        6,
        'Reading Part 5 a fondo',
        [
          'Reading Part 5: dos textos. Analiza por qué fallas.',
          'Writing: una review.',
          'Use of English Part 2 y Part 4 repasando errores.',
          'Listening Part 3.',
          'Speaking Part 3 con frases para decidir.',
        ],
        'acertar 4 de 6 en la Part 5.',
      ),
    ]),
    weekPage('semanas-7-8', 'Fases 2 y 3 · Hacia el examen completo', 'Semanas 7 y 8', [
      week(
        7,
        'Reading Part 6 y reports',
        [
          'Reading Part 6: dos textos. Subraya las referencias.',
          'Writing: un report con encabezados.',
          'Use of English Part 1 y Part 3.',
          'Listening Part 4.',
          'Speaking: Part 1 y Part 2 seguidas.',
        ],
        'acertar 4 de 6 en la Part 6.',
      ),
      week(
        8,
        'Mitad de camino',
        [
          'Reading and Use of English completo, con reloj.',
          'Compara con la semana 1 en tu tabla de seguimiento (pág. ' + ref('seguimiento') + ').',
          'Writing: tu formato más flojo.',
          'Listening completo.',
          'Speaking completo, cronometrado.',
        ],
        'superar tu resultado de la semana 1.',
      ),
    ]),
    weekPage('semanas-9-10', 'Fase 3 · Con reloj', 'Semanas 9 y 10', [
      week(
        9,
        'Con reloj',
        [
          'Use of English, partes 1 a 4, en 33 minutos.',
          'Reading, partes 5 a 7, en 39 minutos.',
          'Writing: dos textos, 80 minutos seguidos.',
          'Listening completo, con los 5 minutos para pasar respuestas.',
          'Speaking Part 3 y Part 4.',
        ],
        'terminar Reading and Use of English a tiempo.',
      ),
      week(
        10,
        'Tus puntos débiles',
        [
          'Elige tus dos partes más flojas según tu tabla de seguimiento.',
          'Dedícales el 70 % del tiempo de esta semana.',
          'Writing: reescribe un texto antiguo con las correcciones.',
          'Repasa todo tu registro de errores.',
          'Speaking: grábate y escúchate.',
        ],
        'subir en tus dos partes más flojas.',
      ),
    ]),
    weekPage('semanas-11-12', 'Fase 4 · Simulacros', 'Semanas 11 y 12', [
      week(
        11,
        'Simulacro 1',
        [
          'Un examen completo en un día, con los tiempos reales.',
          'Corrígelo y apunta cada fallo en tu registro.',
          'Repasa las partes donde has fallado más.',
          'Writing: el formato que menos has practicado.',
          'Speaking completo con alguien.',
        ],
        'terminar a tiempo y saber qué parte necesita un último empujón.',
      ),
      week(
        12,
        'Simulacro 2 y repaso',
        [
          'Segundo examen completo, como tarde a mitad de semana.',
          'Repasa errores típicos, frases útiles y conectores.',
          'Lee tus mejores textos para tener las estructuras frescas.',
          'Prepara la logística del examen (pág. ' + ref('dia-d') + ').',
          'Los dos últimos días, nada nuevo: repaso suave y descanso.',
        ],
        'llegar al examen con calma y con el formato dominado.',
      ),
    ]),
    {
      id: 'expres',
      section: 'Plan de estudio',
      render: () => `${head('08 · Tu plan de 12 semanas', '¿Tienes el examen en 6 semanas?')}
        ${lead('Sube a unas 8 horas por semana y junta las semanas del plan de dos en dos.')}
        <table class="t">
          <thead><tr><th>Semana</th><th>Qué haces</th></tr></thead>
          <tbody>
            <tr><td class="strong">1</td><td><b>Semanas 1 y 2:</b> diagnóstico y gramática base.</td></tr>
            <tr><td class="strong">2</td><td><b>Semanas 3 y 4:</b> Use of English, partes 1 a 3, y emails.</td></tr>
            <tr><td class="strong">3</td><td><b>Semanas 5 y 6:</b> Part 4, Reading Part 5, article y review.</td></tr>
            <tr><td class="strong">4</td><td><b>Semanas 7 y 8:</b> Reading Part 6, report y primer examen completo.</td></tr>
            <tr><td class="strong">5</td><td><b>Semanas 9 y 10:</b> todo con reloj y tus puntos débiles.</td></tr>
            <tr><td class="strong">6</td><td><b>Semanas 11 y 12:</b> dos simulacros y repaso.</td></tr>
          </tbody>
        </table>
        ${tip('Si vas muy justo', 'Prioriza el formato: cómo es cada parte, cuánto tiempo darle y qué estructura sigue cada texto. Es lo que antes se nota en los resultados.')}`,
    },
    {
      id: 'seguimiento',
      section: 'Plan de estudio',
      render: () => `${head('08 · Tu plan de 12 semanas', 'Tu seguimiento')}
        ${lead('Apunta tus resultados tal como te los dé la corrección: aciertos o puntos. Lo importante es compararte contigo.')}
        <table class="t track">
          <thead><tr><th></th><th>Reading</th><th>Use of English</th><th>Writing</th><th>Listening</th><th>Speaking</th></tr></thead>
          <tbody>${['Semana 1', 'Semana 8', 'Simulacro 1', 'Simulacro 2']
            .map((row) => `<tr><td class="strong">${row}</td>${'<td></td>'.repeat(5)}</tr>`)
            .join('')}</tbody>
        </table>
        <table class="t log">
          <thead><tr><th>Registro de errores: parte</th><th>Lo que puse</th><th>Lo correcto</th><th>Por qué</th></tr></thead>
          <tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody>
        </table>`,
    },
    {
      id: 'dia-d',
      section: 'El día D',
      render: () => `${head('09 · La última semana y el día D', 'Llega con un plan', img.hero)}
        <div class="dd">
          <section><h3>La semana antes</h3>${checks(
            [
              ['Confirma la hora, la dirección y el documento de identidad que te piden.'],
              ['Repasa tu registro de errores y las frases útiles. Nada de temas nuevos.'],
              ['Haz tu último simulacro, como tarde, tres días antes.'],
            ],
            'plain',
          )}</section>
          <section><h3>La víspera</h3>${checks(
            [['Prepara el documento, el material que permita tu centro y agua.'], ['Cena ligero, desconecta y duerme.']],
            'plain',
          )}</section>
          <section><h3>Durante el examen</h3>${checks(
            [
              ['Llega con margen: muchos centros piden estar 30 minutos antes.'],
              ['Reading and Use of English: si una pregunta se atasca, márcala y vuelve después.'],
              ['Writing: planifica antes de escribir y guarda 5 minutos para revisar.'],
              ['Listening: aprovecha cada segundo de lectura previa.'],
              ['Speaking: habla con tu compañero, no solo con el examinador.'],
            ],
            'plain',
          )}</section>
        </div>`,
    },
    {
      id: 'dralo',
      section: 'Dralo',
      render: () => `${head('10 · Sigue practicando', 'Practica cada parte en&nbsp;Dralo', img.badge)}
        <div class="tools">
          ${tool('reading', 'Reading and Use of English', 'Exámenes con las siete partes y la corrección al terminar.', link('/exam-practice/b2/exam-reading-and-use-of-english/', 'pdf_reading'))}
          ${tool('writing', 'Writing', 'Escribe tu texto y recibe la corrección con los cuatro criterios de Cambridge.', link('/exam-practice/b2/exam-writing/', 'pdf_writing'))}
          ${tool('listening', 'Listening', 'Audios tipo examen con las cuatro partes.', link('/exam-practice/b2/exam-listening/', 'pdf_listening'))}
          ${tool('speaking', 'Speaking', 'Practica la parte oral y recibe feedback sobre fluidez y contenido.', link('/exam-practice/b2/exam-speaking/', 'pdf_speaking'))}
          ${tool('training', 'Training', 'Niveles cortos de gramática y el reto del martes.', link('/training/', 'pdf_training'))}
        </div>
        ${button(link('/registro/', 'pdf_registro'), 'Crea tu cuenta gratis')}
        <p class="small muted">Dralo no sustituye a tu academia ni a tu profesor: es tu sitio para practicar entre clase y clase. Información oficial del examen en <a href="${CAMBRIDGE_FIRST_URL}">cambridgeenglish.org</a>.</p>`,
    },
    {
      id: 'contraportada',
      special: true,
      render: () => `<section class="page back" id="contraportada">
  <div class="content">
    <span class="brand">Dralo Academy</span>
    <h1>Ese B2 está cada vez más cerca.</h1>
    <p class="back__sub">Una parte cada día. Practica gratis en dralo.es.</p>
    ${button(link('/registro/', 'pdf_contraportada'), 'Empieza en dralo.es', 'light')}
    <p class="back__share">¿Alguien de tu clase también se presenta? Pásale esta guía.</p>
  </div>
  <img class="back__img" src="${img.cheer}" alt="La mascota de Dralo, celebrándolo">
</section>`,
    },
  ];
}

export function renderGuide({ css, fonts, images }) {
  const numbers = new Map(
    buildPages({ img: images, ref: () => 0, link: siteLink }).map((p, index) => [p.id, index + 1]),
  );
  const ref = (id) => {
    const number = numbers.get(id);
    if (!number) throw new Error(`La guía enlaza a una página que no existe: ${id}`);
    return number;
  };
  const pages = buildPages({ img: images, ref, link: siteLink });

  const body = pages
    .map((p, index) => {
      if (p.special) return p.render();
      return `<section class="page" id="${p.id}"${p.accent ? ` data-accent="${p.accent}"` : ''}>
  <header class="top"><span class="brand">Dralo Academy</span><span class="section">${p.section}</span></header>
  <div class="content">${p.render()}</div>
  <footer class="foot"><span>Guía B2 First · dralo.es</span><span class="num">${String(index + 1).padStart(2, '0')}</span></footer>
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>La guía completa del B2 First · Dralo Academy</title>
<style>
@font-face { font-family: 'Jakarta'; src: url(${fonts.normal}) format('woff2'); font-weight: 400 800; font-style: normal; }
@font-face { font-family: 'Jakarta'; src: url(${fonts.italic}) format('woff2'); font-weight: 400 800; font-style: italic; }
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;
}
