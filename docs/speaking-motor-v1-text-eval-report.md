# Speaking Motor V1.5 — evaluación independiente sobre texto

Fecha: 2026-10-24T15:04:29.733Z
Fuente: api

Este informe compara el evaluador real con el banco held-out. Las expectativas del banco no son puntuaciones oficiales.

El éxito técnico no implica corrección pedagógica. PASS solo se marca cuando los códigos esperados coinciden y no se puntúan criterios sin evidencia.

## Tabla comparativa (set validate)

| Campo | Resultado |
|---|---|
| Caso | Identificador |
| Pregunta | Texto |
| Respuesta de referencia | Texto |
| Errores esperados | Códigos |
| Errores detectados | Códigos |
| Falsos positivos | Número |
| Errores omitidos | Número |
| Calidad del feedback | Resultado |
| Evaluación | Resultado |
| Estado | PASS / REVIEW / FAIL |

| Caso | Pregunta | Respuesta de referencia | Errores esperados | Errores detectados | Falsos positivos | Errores omitidos | Calidad del feedback | Evaluación | Estado |
|---|---|---|---|---|---|---|---|---|---|
| val-q01-clean | What do you enjoy most about studying English? | The part I enjoy most is being able to explain my ideas more clearly. For example, I can now talk about my studies and my plans without stopping after every sentence. | — | — | 0 | 0 | weak | El candidato comunica de manera efectiva su disfrute al explicar ideas con claridad, proporcionando un ejemplo relevante. | REVIEW |
| val-q02-articles | How do you usually spend your weekends? | I usually spend the weekends with a my friends. We have the breakfast late and then we walk around a city centre. | GR-AR | GR-VT | 1 | 1 | review | El candidato proporciona una respuesta clara sobre sus actividades de fin de semana, pero hay algunos errores gramaticales menores. | FAIL |
| val-q03-tenses | Do you prefer visiting new places or returning to places you know? Why? | I prefer returning to places I know because last summer I visit the same village three times and I feel safer there. | GR-VT | GR-VT | 0 | 0 | weak | El candidato expresa una preferencia por regresar a lugares familiares, citando la seguridad y una experiencia pasada como razones. | REVIEW |
| val-q02-prepositions | How do you usually spend your weekends? | I usually stay in home on Sunday morning and then I go in the cinema with my sister if we find a good film. | GR-PR | GR-VT, GR-VT | 2 | 1 | review | Has proporcionado una respuesta clara sobre tu rutina del domingo, pero hay algunos errores gramaticales menores que se pueden corregir para mejorar la fluidez de tu inglés. | FAIL |
| val-q04-collocation | How has technology changed the way you communicate with your friends? | Now I make messages all day and I do a video call when I cannot meet my friends. It is faster, but the conversation is often shorter. | VC-CO, VC-WW | — | 0 | 2 | review | El alumno ha presentado una respuesta clara y relevante sobre sus hábitos de comunicación, mostrando un buen uso del vocabulario y la estructura. | FAIL |
| val-q01-unnatural | What do you enjoy most about studying English? | I enjoy to make my English more big because it helps me to have more opportunities in the job. | VC-WW, GR-VT | GR-VT | 0 | 1 | review | El alumno expresa un deseo de mejorar su inglés para tener mejores oportunidades laborales, lo cual es positivo. Sin embargo, hay un error gramatical en la frase 'to make my English more big'. | REVIEW |
| val-q05-short | Is there a new skill you would like to learn in the future? | Yes, cooking. | DM-EL | GR-VT | 1 | 1 | review | El alumno mostró interés en la cocina, pero su respuesta fue demasiado breve y careció de detalles. | FAIL |
| val-q02-repetition | How do you usually spend your weekends? | I like weekends. I like weekends because I like relaxing and I like seeing my friends. I like it a lot and I like doing the same things. | VC-RP | GR-VT | 1 | 1 | review | El alumno expresa su disfrute de los fines de semana, mencionando la relajación y la socialización con amigos. Sin embargo, la repetición de frases indica la necesidad de un vocabulario más variado y estructuras de oraciones más complejas. | FAIL |
| val-q04-irrelevant | How has technology changed the way you communicate with your friends? | I really like cooking pasta at home and on Sundays I bake a cake for my family. The recipe is simple and everyone enjoys it. | DM-RV | — | 0 | 1 | review | El alumno ha expresado de manera clara y coherente sus hábitos culinarios, lo que refleja un buen dominio del vocabulario relacionado con la cocina. | FAIL |
| val-q03-organised | Do you prefer visiting new places or returning to places you know? Why? | I prefer visiting new places. First, I like the surprise of a different city. Also, I usually learn something practical, like how to ask for directions or order food. So for me, new places are more useful than repeating the same trip. | — | — | 0 | 0 | adequate | El alumno muestra un buen dominio de la gramática y el vocabulario, proporcionando respuestas claras y relevantes. Su discurso está bien estructurado y comunica sus ideas de manera efectiva. | PASS |

## Resumen

- PASS: 1
- REVIEW: 3
- FAIL: 6
- Códigos detectados: GR-VT
- Códigos omitidos: GR-AR, GR-PR, VC-CO, VC-WW, DM-EL, VC-RP, DM-RV
- Falsos positivos: GR-VT

## Lectura pedagógica

Errores detectados con el código esperado:

- `val-q03-tenses`: GR-VT (`last summer I visit`).
- `val-q01-unnatural`: GR-VT (`enjoy to make`). El resumen menciona `more big`, pero no emitió VC-WW.

Errores omitidos: GR-AR, GR-PR, VC-CO, VC-WW, DM-EL, VC-RP, DM-RV.

Falsos positivos: GR-VT en artículos, preposiciones, respuesta corta y repetición. El modelo está usando el código de tiempos como cajón de sastre.

Pronunciation, Interactive Communication y Global Achievement permanecen en `null`.

`val-q01-clean` y `val-q03-tenses` quedaron en REVIEW por el heurístico de español del juez (el resumen era español correcto pero no coincidía con el patrón). No es un fallo del evaluador en esos dos casos.

## Límites

- Esta pasada no usa Whisper ni micrófono.
- Un resultado 200 de API no se considera validación pedagógica.
- No se declara validado el Speaking oral completo.
