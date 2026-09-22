# RUOE — plan de migración a una capa de prompts en inglés británico

**Versión:** v1 — propuesta. No está integrada.  
**No hacer en esta fase:** editar runtime, cambiar `useCodePrompts`, escribir en Supabase, regenerar exámenes, tocar briefs, Style Card IDs, Transformation Family IDs ni salidas ya publicadas.

El estándar canónico futuro es `RUOE_BRITISH_ENGLISH_GENERATION_STANDARD_v1.md`. Ese texto va en inglés británico. No se crea un estándar de generación en español.

---

## 1. Principio de la migración

No sustituir el sistema actual en el sitio.

Añadir una capa paralela, versionada, que el runtime pueda elegir más adelante. Hasta ese cambio explícito, la resolución actual sigue igual:

- `useCodePrompts = false`
- `resolveEffectiveExamPartGenerationPrompt()` lee `levels_exam_part_prompt_overrides`
- si hay `user_prompt`, ese texto gana al código
- el piloto local (`ruoePilotRegeneration.js`) sigue siendo el único sitio que ya añade `BRITISH_ENGLISH_BLOCK`

La capa nueva no borra la vieja. Conviven hasta que una prueba controlada demuestre que la nueva juzga y escribe mejor.

---

## 2. Qué se conserva tal cual

- Topic Bank
- arquitectura de Content Briefs y el Brief Map
- Style Card IDs (`SC-01` … `SC-06`)
- Transformation Family IDs
- Usage History (aunque el cableado a base de datos siga pendiente)
- Part 6 Architecture v2 (artículo completo → oportunidades de cohesión → extracción → pool A–G)
- normalización de metadatos de Part 4
- reparación de marking points (la lógica de partición; no el prompt que regenera el ítem)
- jerarquía de severidad (`HARD_FAIL` / `QUALITY_FAIL` / `WARNING`, y `__needsReview`)
- exámenes y JSON ya generados

Los briefs y las Style Cards aprobadas se siguen inyectando. No se reescriben para “traducirlos”: ya están en inglés. Solo se revisan si una frase choca con el estándar nuevo.

---

## 3. Cuatro capas, cuatro tratos

### 3.1 Prompts de generación (A)

Crear un módulo nuevo, por ejemplo `src/lib/ruoePrompts/en-GB/v1/`, sin enchufarlo al resolver.

Contenido propuesto:

- un bloque compartido, en inglés británico, copiado y ampliado desde `BRITISH_ENGLISH_BLOCK` y desde el estándar v1
- un prompt por parte (1–7), copiado del bloque actual de `buildExamGeneratePrompt` y corregido donde el audit lo marca
- el system prompt, hoy una sola línea en `getLevelExamPartSystemPrompt`, pasa a incluir el contrato

El system prompt futuro debe decir, en inglés británico, como mínimo:

```
Think, evaluate, and write in British English throughout.
Natural British English before exercise convenience.
If a sentence would not be produced by a competent British English speaker, change the item. Do not force the English to save a planned gap, keyword, stem, or transformation.
```

La Parte 1 futura debe incluir, en inglés británico:

```
Substitute A, B, C and D independently into the complete sentence.
Reject the item if more than one option produces natural, grammatical, semantically defensible British English, or an acceptable collocation in that exact context.
A distractor is not acceptable merely because it is less idiomatic than the key.
If it is still genuinely natural, regenerate the item.
```

Quitar, en esa copia versionada, la frase actual que permite que el distractor “tenga sentido como idea” y falle solo por no ser “the natural combination”. Esa frase es el agujero de ambigüedad.

No editar todavía la función viva `buildExamGeneratePrompt`.

### 3.2 Validación lingüística (B)

Crear jueces paralelos, no reemplazar los actuales:

| Juez actual | Copia versionada |
|---|---|
| `blindSolve` + `rubricReview` (Parte 1) | Exigen la sustitución A–D. Una segunda opción natural es fallo, no “menos idiomática”. |
| `blindSolveOpenCloze` + rúbrica Parte 2 | Mismo contrato de inglés; la lista de huecos con dos palabras válidas se mantiene. |
| `reviewB2Part3AdversarialQuality` | Naturalidad de la palabra derivada en la frase, no solo “suffix added”. |
| `reviewB2Part5AdversarialQuality` | Sigue tratando el distractor tentador como diseño correcto de lectura. No copiar esa regla a la Parte 1. |
| Partes 6 y 7 | Misma tarea (multifit, paráfrasis), voz del estándar. |
| `analyzeNaturalness` (regex Parte 4) | Se queda como red mecánica estrecha. No es el juez principal. |

Los prompts de reparación local (Parte 3, pasaje de Parte 5, tallo de Parte 7, `regeneratePart4Item`) se versionan en el mismo paquete, porque escriben inglés nuevo.

### 3.3 Validadores mecánicos (C)

No se traducen y no se reescriben para esta migración.

Siguen en su sitio: `examPartValidation.js`, conteos, letras, 2–5 palabras, keyword intacta, huecos, esquema JSON, partición de marking points, Architecture v2, IDs de Style Card y de familias.

Un aviso que solo mira una lista de verbos frecuentes no es un juez de inglés. No hace falta pasarlo al estándar.

### 3.4 Documentación humana (D)

Comentarios y documentos internos pueden seguir en español. No se pegan a un prompt.

El estándar de generación y cualquier ejemplo que vaya a entrar en un prompt van en inglés británico. No hay versión española canónica.

---

## 4. Versiones, no parche in situ

Propuesta de nombres, sin crearlos todavía en el runtime:

| Pieza | Nombre |
|---|---|
| Contrato | `RUOE_BRITISH_ENGLISH_GENERATION_STANDARD_v1` (este borrador) |
| Prompts de parte | `ruoe-en-GB-v1` por parte 1–7 |
| Jueces | `ruoe-en-GB-judge-v1` |
| Fila de override, cuando exista una fase posterior | misma tabla, con una marca de versión en el texto o en una columna nueva — decidir entonces, sin migrar datos ahora |

La selección futura sería explícita, por ejemplo un argumento `promptLayer: 'en-GB-v1' | 'legacy'`, por defecto `legacy` hasta que se pida el cambio.

`legacy` significa: el comportamiento de hoy (`useCodePrompts` false y override de base de datos).

---

## 5. Overrides de base de datos (solo diseño)

Hecho observado en código, sin leer la tabla:

- Tabla: `levels_exam_part_prompt_overrides`
- Clave: `level_slug` + `part_number`
- Campos que el modelo recibe: `system_prompt`, `user_prompt`
- `scripts/sync-b2-ruoe-prompts-from-code.mjs` sobrescribe las partes B2 1–7 con el prompt del código

Consecuencia para más adelante:

1. Publicar `en-GB-v1` en código no cambia producción mientras el override tenga texto.
2. No lanzar el script de sync como si fuera la migración. Ese script pisa filas vivas.
3. Cuando se apruebe el cambio, copiar el prompt versionado a filas **nuevas** o a un nivel/parte de prueba. No resetear las filas de producción en el mismo paso.
4. `ensureExamPartPromptStored()` copia el prompt de código si la fila está vacía. Una fila vacía no es un problema; una fila antigua con texto sí lo es, porque gana al código.

No se ha consultado cuántas filas hay ni qué dicen. Eso queda para una fase que tenga permiso de lectura.

---

## 6. Orden recomendado, cuando se autorice implementar

1. Extraer el contrato compartido al módulo versionado, todavía sin importarlo desde `resolveEffectiveExamPartGenerationPrompt`.
2. Copiar la Parte 1 y su juez (sustitución A–D). Comparar en local, con `useCodePrompts` solo en un script de prueba, contra el prompt legacy. No guardar exámenes.
3. Copiar Partes 2, 3 y 4, y los prompts de reparación que escriben frases.
4. Copiar Partes 5, 6 y 7 sin tocar Architecture v2 ni los validadores duros.
5. Revisar ejemplos marcados en el audit (la paráfrasis de Parte 7; la frase “natural combination” de Parte 1). Sustituirlos solo dentro de `en-GB-v1`.
6. Dejar Style Cards, briefs, familias y Topic Bank como están. Si una Style Card se inyecta, el contrato va **encima**, no dentro del ID.
7. Solo después de una revisión humana de ítems de prueba: decidir si el resolver puede pedir `en-GB-v1`. Hasta entonces el default sigue siendo el camino actual.

---

## 7. Qué no entra en el primer corte

- Listening, Writing y Speaking, aunque vivan en `draloAiExamPrompts.js`. Si se toca ese archivo más adelante, hay que no arrastrarlos sin querer. Por eso el plan copia a un módulo nuevo en lugar de editar la función viva.
- Regenerar el banco piloto o los exámenes publicados.
- Cambiar la severidad que bloquea el guardado (`__needsReview`) hasta que el juez nuevo esté medido. El juez nuevo puede ser más estricto; no debe aflojar el cerrojo actual por el camino.

---

## 8. Criterio de hecho para una fase posterior

La migración de la capa de prompts se considerará lista para un ensayo local cuando:

- el system prompt y los siete prompts de parte de `en-GB-v1` estén en inglés británico;
- la Parte 1 exija la sustitución independiente de A, B, C y D;
- ningún prompt de esa capa diga que un distractor vale por ser menos idiomático;
- el resolver de producción siga en `legacy` y la tabla de overrides no se haya escrito.

Hasta entonces, este plan y el estándar son documentos. No son runtime.
