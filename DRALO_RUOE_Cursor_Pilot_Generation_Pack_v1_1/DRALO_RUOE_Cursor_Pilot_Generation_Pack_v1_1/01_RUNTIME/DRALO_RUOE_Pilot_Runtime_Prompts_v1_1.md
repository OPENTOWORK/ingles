# DRALO RUOE — Pilot Runtime Prompts v1.1

## Global execution contract

- This pack contains two authorised pilot phases. Do not combine them into a final autonomous engine yet.
- PHASE A: generate Parts 1, 2, 3, 5, 6 and 7 from the 12 human-approved Content Briefs.
- PHASE B: only after Phase A handoff, generate Part 4 for each pilot exam from the two human-approved Transformation Blueprints.
- Parts 1/2/3/5/6/7 use the matching Approved Content Brief plus its assigned Style Card.
- Part 4 uses the matching Approved Transformation Blueprint only.
- The Content Brief controls editorial direction; the Part prompt controls exam mechanics.
- The Transformation Blueprint controls Part 4 family, target structure, keyword, difficulty and marking-point intent.
- Do not change IDs, Topic Bank assignments, Style Card assignments, brief decisions, Blueprint slots, target structures or keywords silently.
- Use British English at CEFR B2.
- Do not copy CambridgeOne wording or scenarios.
- Do not invent statistics, studies, institutions or quotations.
- If a valid output cannot be created without breaking a hard requirement, return a failure report for that local exercise/item.
- Regenerate locally: one failed exercise or one failed Part 4 item must not trigger full-batch regeneration.
- Preserve exam_id, part, input ID/version and generation version in every output.

---

## Part 1 — Multiple-choice cloze

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 Reading and Use of English Part 1 (Multiple-choice cloze), con un texto original, un ejemplo no puntuable (0) y ocho preguntas puntuables (1–8) de opción múltiple. Debe sentirse como una tarea auténtica y profesional de nivel B2.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Un título breve y un texto de 150–180 palabras, con objetivo aproximado de 160–170. Debe incluir exactamente el ejemplo (0) y los huecos (1)–(8), en ese orden. Cada pregunta 1–8 tendrá cuatro opciones A–D, una sola palabra por opción y exactamente una respuesta correcta.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Texto natural de estilo publicado —revista, periódico, web o divulgación— en inglés británico auténtico de nivel B2. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. El texto completo debe sonar natural una vez insertadas las respuestas. Se evitarán redacción repetitiva de IA, huecos forzados, frases antinaturales, vocabulario C1/C2 y lenguaje excesivamente simple.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Precisión léxica contextual: colocaciones, phrasal verbs, preposiciones dependientes, expresiones fijas, precisión léxica y distinción entre palabras próximas en significado, además del uso natural de sustantivos, verbos, adjetivos y adverbios.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Cada hueco debe medir conocimiento léxico y no gramática aislada. Las cuatro opciones deben ser gramaticalmente posibles, pero solo una debe encajar de manera natural por significado, colocación o uso. Los distractores deben ser plausibles y fallar por razones léxicas o semánticas. La respuesta debe requerir comprensión de la frase y del contexto más amplio.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Los ocho ítems deben mezclar collocations, phrasal verbs, dependent prepositions, fixed expressions, lexical precision y near synonyms. Al menos dos ítems deben evaluar sustantivos, adjetivos o adverbios; al menos uno debe basarse en una preposición dependiente o expresión fija; no puede haber más de cuatro ítems basados en verbos. No se deben repetir patrones léxicos ni familias de palabras en exceso. Ninguna letra correcta puede aparecer más de tres veces.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada pregunta debe tener una sola respuesta defendible. Se revisa o rechaza si la longitud no está entre 150–180 palabras, falta algún marcador 0–8, no hay exactamente ocho preguntas, alguna opción contiene más de una palabra, existe más de una respuesta posible, se incumple la variedad léxica, los distractores son poco plausibles, el reparto A–D es desequilibrado o el texto completo no suena natural. La validación se realiza sobre la versión final.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones; ejemplo (0) con cuatro opciones, respuesta y explicación breve; título del texto; texto completo con marcadores; ocho preguntas 1–8 con sus cuatro opciones; y respuestas correctas de las preguntas puntuables. La estructura técnica exacta se definirá posteriormente.

---

## Part 2 — Open cloze

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 Reading and Use of English Part 2 (Open cloze), con un texto original, un ejemplo no puntuable (0) y ocho huecos puntuables numerados 9–16. El alumno debe escribir una sola palabra en cada hueco.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Un título breve y un texto de 150–180 palabras, con objetivo aproximado de 160–170. Debe incluir exactamente el ejemplo (0) y los huecos (9)–(16), en ese orden. Hay ocho huecos puntuables y una única respuesta correcta de una palabra por hueco.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Texto natural de estilo publicado en inglés británico B2. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. El texto completo debe leerse de forma natural al insertar las respuestas. Se evitarán huecos forzados, redacción repetitiva, frases artificiales, vocabulario demasiado avanzado o demasiado simple.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Conocimiento gramatical y léxico funcional de nivel B2: artículos, auxiliares, preposiciones, conjunciones, pronombres relativos, cuantificadores, determinantes, linking words, reference words y expresiones gramaticales fijas. No debe convertirse en una prueba léxica típica de Part 1.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Cada hueco debe tener una única palabra aceptable y exigir una decisión gramatical o funcional clara dentro del contexto. Se deben evitar construcciones creadas artificialmente para alojar el hueco, respuestas previsibles por pistas obvias y huecos que admitan varias soluciones naturales.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Los ocho huecos deben mezclar categorías gramaticales diferentes. No debe repetirse el mismo punto gramatical de forma excesiva ni aparecer la misma estructura en huecos consecutivos. Las respuestas serán generalmente palabras funcionales de alta frecuencia.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada hueco debe tener una y solo una respuesta aceptable de una palabra. Se revisa o rechaza si el texto no tiene 150–180 palabras, faltan marcadores, no hay exactamente ocho huecos puntuables, alguna respuesta requiere más de una palabra, se repite demasiado un punto gramatical, hay dos soluciones defendibles o el texto completo resulta antinatural.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones; ejemplo (0) con respuesta; título del texto; texto completo con los huecos 9–16; ocho preguntas/huecos con su numeración; y respuestas correctas de una palabra para 9–16. La estructura técnica exacta se definirá posteriormente.

---

## Part 3 — Word formation

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 Reading and Use of English Part 3 (Word formation), con un texto original, un ejemplo no puntuable (0) y ocho huecos puntuables 17–24. Cada hueco debe ir asociado a una palabra base en mayúsculas y resolverse mediante una derivación correcta.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Texto con título de 150–180 palabras, objetivo aproximado de 165. Debe incluir el ejemplo (0) y los huecos (17)–(24), cada uno vinculado a una palabra base en CAPITALS. Hay exactamente ocho preguntas puntuables y cada respuesta final debe ser una sola palabra derivada.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Texto natural de estilo publicado en inglés británico B2. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. El texto final debe sonar natural una vez insertadas todas las palabras derivadas. Se evitarán huecos forzados, frases artificiales, stems oscuros y vocabulario fuera del nivel.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Formación de palabras B2: cambios de clase gramatical, uso de prefijos y sufijos, formas negativas y construcción de sustantivos abstractos u otras derivaciones naturales a partir de la palabra base.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Cada hueco debe exigir una palabra formada a partir del stem dado en mayúsculas. La solución debe ser una derivación real, natural, gramatical y semánticamente adecuada, y la única válida en ese contexto. Las frases no deben construirse de forma artificial solo para introducir una transformación.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Debe existir una mezcla equilibrada de noun→adjective, adjective→noun, adjective→adverb, verb→noun, verb→adjective, noun→verb, prefix changes, suffix changes, negative forms y abstract nouns. El mismo patrón de transformación no debe repetirse más de dos veces y no debe repetirse la misma familia léxica.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada respuesta es una sola palabra y debe ser la única derivación válida. Se revisa o rechaza si el texto queda fuera de 150–180 palabras, faltan huecos 0 o 17–24, falta algún stem en mayúsculas, hay varias derivaciones posibles, se repite una familia, la variedad es insuficiente o el texto completo no resulta natural.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones; ejemplo con número, stem y respuesta; título del texto; texto completo con los huecos y stems; ocho preguntas 17–24 con su palabra base; y respuestas correctas derivadas. La estructura técnica exacta se definirá posteriormente.

---

## Part 4 — Key Word Transformations

**Dynamic input:** Approved Transformation Blueprint only. Do not use Topic Bank, Content Brief or Style Card as direct input.

1. Qué debe generar
Respuesta: Un ejercicio completo de B2 Reading and Use of English Part 4, con un ejemplo no puntuable (0) y exactamente seis ítems puntuables 25–30.

2. Formato obligatorio
Respuesta: Cada ítem debe contener sentence1, una keyword en CAPITALS que no puede modificarse, sentence2 con exactamente un hueco y una respuesta correcta de 2–5 palabras incluyendo la keyword. Cada ítem puntuable debe incluir grading metadata y exactamente dos marking points.

3. Material base
Respuesta: Utiliza exclusivamente el Transformation Blueprint aprobado del examen correspondiente. El Blueprint manda sobre family_id, target_structure, semantic_equivalence_goal, keyword, difficulty y marking-point intent. Cursor puede crear el contenido natural de las frases, pero no sustituir la estructura o keyword asignada.

4. Qué evalúa
Respuesta: Reformulación con mantenimiento de significado mediante estructuras gramaticales y léxicas B2.

5. Cómo se diseñan los ítems
Respuesta: La segunda oración completada debe conservar el significado de la primera. La keyword debe aparecer sin cambios. La solución debe tener 2–5 palabras y una única ruta gramatical válida. Los dos marking points deben cubrir la respuesta completa sin palabras sobrantes.

6. Variedad necesaria
Respuesta: La distribución viene determinada por el Blueprint. No repetir keyword ni reemplazar un target difícil por otro más fácil. El ejemplo (0) debe usar una familia/estructura/keyword que no colisione con los seis scored slots.

7. Respuestas y validación
Respuesta: Rechazar o regenerar localmente un ítem si existe una segunda solución defendible, cambia el significado, la keyword se modifica, la respuesta queda fuera de 2–5 palabras, los marking points son incoherentes, o la redacción resulta artificial/no B2.

8. Información que debe devolver
Respuesta: Título; instrucciones; ejemplo (0); preguntas 25–30 con sentence1, keyword, sentence2Start/sentence2, answer y grading_metadata; fullAnswers controladas cuando proceda; exactamente dos marking points por pregunta; validation metadata y generation version.

**Part 4 pilot rule:** Generate from the approved Blueprint JSON only during PHASE B, after PHASE A has been generated and handed off for human review.

---

## Part 5 — Multiple-choice reading

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 First Reading Part 5 (Multiple-choice reading), con un artículo original y seis preguntas puntuables 31–36 de opción múltiple A–D. Cada pregunta debe tener una única respuesta correcta y suficiente evidencia en el texto.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Un título y un artículo de 550–650 palabras, con objetivo aproximado de 580–620. Debe contener varios párrafos desarrollados. Hay exactamente seis preguntas 31–36 y cada una tiene cuatro opciones A–D. Cada pregunta debe registrar su tipo, evidencia y rationale para la revisión interna.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Artículo natural de estilo publicado en inglés británico B2. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. El artículo debe ser coherente, estar bien estructurado y desarrollar ideas suficientes para permitir inferencia e interpretación. No debe mencionar “Cambridge” en contenido visible al alumno.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Comprensión lectora B2: idea principal, detalle interpretado, inferencia, actitud, propósito, referencia, vocabulario contextual y comprensión global de ideas. La dificultad debe depender de entender el texto, no de localizar palabras idénticas.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Las seis preguntas deben seguir el orden del artículo. Cada una incluye un stem claro, cuatro opciones plausibles y una única respuesta. Los distractores deben basarse en ideas reales del texto, pero resultar incorrectos al interpretar con precisión. Se debe evitar el keyword matching y las preguntas resolubles por simple escaneo.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Debe haber variedad de question types y al menos dos preguntas de inferencia, actitud, propósito, referencia o comprensión global. Las respuestas correctas deben distribuirse entre A–D, con al menos tres letras diferentes y nunca más de dos respuestas consecutivas con la misma letra.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada pregunta debe tener una sola respuesta correcta y distractores plausibles. Se revisa o rechaza si el artículo no tiene 550–650 palabras, no hay exactamente seis preguntas, falta alguna opción A–D, la distribución de respuestas es pobre, los tipos no son variados, hay menos de dos preguntas inferenciales/globales, se puede responder por keyword matching o el texto resulta artificial.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones; título y artículo completo; seis preguntas 31–36 con questionType, prompt y cuatro opciones; evidencia breve de apoyo y rationale interno; y respuestas correctas A–D. La estructura técnica exacta se definirá posteriormente.

---

## Part 6 — Gapped text

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 Reading and Use of English Part 6 (Gapped text), con un artículo original, seis frases retiradas que corresponden a los huecos 37–42 y un pool global de siete frases A–G, de las cuales una es extra y no se utiliza.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Artículo con título de 500–600 palabras; mínimo absoluto 500, objetivo 540–570. Debe tener exactamente seis huecos (37)–(42) y exactamente siete candidate sentences A–G. Las preguntas son seis ítems identificados por número, sin opciones A–D por pregunta; se utiliza una sentencePool global. Debe registrarse también el recuento final de palabras del passage.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Artículo natural de estilo publicado en inglés británico B2, aproximadamente siete párrafos de unas 70–90 palabras. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. La dificultad debe venir de cohesión discursiva, progresión lógica, comprensión de ideas, referencia y desarrollo de párrafos. Se evitarán textos tipo manual, relleno artificial, lenguaje demasiado simple o académico y tareas resolubles por palabras repetidas.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Comprensión de cohesión y estructura textual: relaciones entre oraciones y párrafos, anáfora, referencias, demostrativos, sustitución, linking expressions, secuenciación, contraste, causa/efecto, adición, ejemplificación y progresión lógica.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Se retira una oración completa de seis posiciones. Cada hueco debe quedar rodeado de contexto suficiente y depender de la oración anterior, la posterior, el párrafo y la progresión global. Se prefieren huecos dentro de los párrafos. La respuesta correcta debe depender de lógica y cohesión, no de coincidencia de keywords. Al menos tres huecos deben apoyarse especialmente en anáfora, demostrativos o conectores lógicos.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Las siete frases A–G deben tener longitud natural y parecer auténticas oraciones retiradas. Hay seis respuestas distintas y una sola frase extra. Deben variarse los inicios y mecanismos cohesivos. Varias candidatas pueden parecer parcialmente posibles, pero solo una debe encajar perfectamente en cada hueco. El extra debe ser temáticamente plausible, pero fallar en todos los huecos por significado, referencia, lógica o cohesión.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada hueco 37–42 debe tener una sola respuesta A–G. Se usan seis letras diferentes y queda exactamente una sin usar; no hay duplicados. Se revisa o rechaza si hay menos/más de seis huecos, números fuera de 37–42, texto fuera de 500–600 palabras, pool distinto de siete, letras duplicadas/faltantes, más de una frase defendible, un extra que encaja, referencias inexplicadas, keyword matching o incoherencia al restaurar las frases. Antes de devolver el resultado se cuenta el passage final.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones; título y passage con marcadores 37–42; recuento entero de palabras del passage; sentencePool A–G; seis preguntas identificadas por id y número; y seis respuestas correctas A–G, usando letras distintas y dejando exactamente una candidata sin usar. La estructura técnica exacta se definirá posteriormente.

---

## Part 7 — Multiple matching

**Dynamic input:** Approved Content Brief + assigned Style Card.

1. Qué debe generar
Describe el ejercicio completo que debe producir esta Part.
Respuesta: Un ejercicio completo de B2 Reading Part 7 (Multiple matching), con cuatro textos o perfiles diferenciados A–D y diez preguntas puntuables 43–52. Cada pregunta debe pedir identificar qué persona/sección corresponde a una idea, experiencia, actitud o detalle interpretado, y las letras A–D pueden utilizarse más de una vez.

2. Formato obligatorio
Indica número de preguntas, numeración, ejemplo, opciones, marcadores, secciones y longitud.
Respuesta: Cuatro textos/perfiles A–D de aproximadamente 120–150 palabras cada uno, con un título o contexto común. Hay exactamente diez preguntas 43–52. Cada pregunta tiene una única respuesta A–D. A–D identifican los cuatro textos/perfiles y pueden reutilizarse en varias preguntas.

3. Material base
Describe el tipo de texto o material. Indica cómo debe usar Content Brief y Style Card, cuando aplique.
Respuesta: Cuatro perfiles o testimonios relacionados por un mismo tema, pero suficientemente diferenciados en experiencia, actitud, motivación, problema, resultado o perspectiva. El ejercicio debe utilizar el Content Brief aprobado y la Style Card asignada. El tema no se fija en “urban life and technology”: debe venir del motor de contenido. Los textos deben ser naturales, auténticos y B2, con voces distinguibles y detalles concretos.

4. Qué evalúa
Explica qué conocimiento o comprensión debe medir.
Respuesta: Comprensión de información distribuida entre varios textos: inferencia, interpretación, comparación de experiencias, actitudes, motivaciones, problemas, soluciones, resultados y puntos de vista. Debe exigir distinguir significados próximos entre perfiles, no localizar palabras idénticas.

5. Cómo se diseñan los ítems
Describe cómo crear preguntas, huecos, opciones o transformaciones.
Respuesta: Las diez preguntas deben formular rasgos, experiencias o ideas que obliguen a comparar los cuatro perfiles. Cada pregunta tendrá una sola respuesta correcta A–D y debe poder justificarse por el contenido del perfil correspondiente. Se evitarán preguntas resolubles mediante keyword matching, formulaciones ambiguas y pistas demasiado literales. Las letras A–D pueden aparecer más de una vez.

6. Variedad necesaria
Indica la mezcla obligatoria y lo que no debe repetirse.
Respuesta: Los cuatro perfiles deben diferenciarse claramente y, a la vez, compartir suficientes puntos de comparación para que la tarea sea exigente. Deben aparecer preguntas sobre distintos tipos de información —actitudes, decisiones, dificultades, cambios, beneficios, reacciones o reflexiones—. La distribución de respuestas debe aprovechar los cuatro perfiles y permitir reutilización de letras sin patrones obvios.

7. Respuestas y validación
Define respuesta única, distractores, puntuación y causas de rechazo.
Respuesta: Cada pregunta debe tener una única respuesta defendible entre A–D. Se revisa o rechaza si dos perfiles responden de forma igualmente válida, si una pregunta puede resolverse por simple coincidencia de palabras, si los perfiles son demasiado parecidos, si alguno queda sin función real, si faltan preguntas o si las respuestas incluyen letras fuera de A–D.

8. Información que debe devolver
Enumera el contenido y metadata necesarios. No hace falta escribir JSON.
Respuesta: Título de la Part; instrucciones o matchingIntro; contexto/título común; cuatro secciones/perfiles A–D con su nombre/etiqueta y texto; diez preguntas 43–52 con id, número y prompt; y respuestas correctas A–D. La estructura técnica exacta se definirá posteriormente.

---
