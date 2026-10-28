# DRALO Speaking Motor V2.3 — validación remota y piloto oral

Fecha: 2026-10-27. Local. Sin commit, sin deploy, sin SQL en producción.

La interfaz `/exam-practice/b2/exam-speaking/` no se ha modificado. Parts 2–4, hub, exam mode, RUOE, Writing, Listening, planes, rúbricas y prompts no se han tocado.

**El Speaking no está preparado para publicación.** Falta un Supabase de prueba autorizado, dos instancias Next reales y las cinco grabaciones humanas.

## 1. Pruebas ejecutadas realmente

- Inventario de proyectos Supabase de la organización OPENTOWORK (solo lectura).
- Comprobación de hosts en `.env.local` (nombres, no secretos): `NEXT_PUBLIC_SUPABASE_URL` apunta a ENGLISH_PROD.
- DNS de Supabase B (`cmeruknhkcxveygeeuji.supabase.co`): no existe.
- Banco humano V1.9: carpeta local presente, `originals/` vacío, `granted: false`, transcripciones vacías.
- `npm run speaking:human-check` — estado PENDING, 0/5.
- Gate fail-closed: `speaking:v23-guard` y tests `v23-gates` (rechaza ENGLISH_PROD).
- La suite V2.2 local (129 tests, PostgreSQL aislado) sigue siendo la evidencia de cuotas/RLS stub. No se ha repetido aquí como “validación remota”.

## 2. Pruebas bloqueadas por falta de infraestructura

No existe un proyecto de pruebas independiente y autorizado.

| Objetivo | Resultado |
|---|---|
| Aplicar V1 → V2 → V2.1 → V2.2 en remoto | Detenido |
| Usuarios ficticios + JWT reales | Detenido |
| RLS y Storage Cloud | Detenido |
| URL firmada y aislamiento de audio entre usuarios | Detenido |
| Dos instancias Next (puertos y `.next` distintos) contra la misma base de prueba | Detenido |

Motivos:

1. ENGLISH_PROD está activo. Queda prohibido.
2. El clon B no resuelve y no está en la cuenta. Aunque volviera, no es un sandbox vacío.
3. “Auro Asistente personal” está inactivo y no es Speaking.
4. `npm run dev` usa el `.next` local y las claves de producción. Levantarlo una segunda vez contra ese `.env` habría sido una prueba contra prod.

Instrucciones: `docs/speaking-motor-v2.3-supabase-test-runbook.md`.  
Scripts preparados, no lanzados contra remoto: `speaking-b2-apply-test-migrations.mjs`, `speaking-b2-two-next.mjs`, `speaking-b2-two-next-probe.mjs`.

Dos procesos Node sobre PostgreSQL local (V2.2) **no** sustituyen esta prueba.

## 3. Pruebas pendientes por falta de audios humanos

Infraestructura V1.9 intacta (`speaking:human-prepare` / `check` / `eval`, tarjeta de grabación, carpeta gitignorada).

| Ítem | Audio | Transcripción | Consentimiento |
|---|---|---|---|
| hum-v19-q01 … q05 | no | no | `granted: false` |

Whisper no se ha ejecutado. No hay WER, ni comparación de códigos/bandas, ni FP/FN. Audio sintético no cuenta.

Sigue PENDING. Ver `src/features/speaking-b2-motor/fixtures/human/README.md`.

## 4. Problemas confirmados

1. No hay sandbox remoto de Speaking.
2. El `.env.local` de desarrollo apunta a producción. Cualquier `next dev` extra sin override es riesgo.
3. No hay borrado de audio ni retención implementada.
4. El SQL de sesiones no limpia Storage al borrar la cuenta.
5. Cinco tomas humanas siguen sin existir; no hay validación oral real.

## 5. Recomendaciones antes de un piloto cerrado

1. Crear y autorizar `DRALO_SPEAKING_TEST` (vacío). Firmar `SPEAKING_B2_TEST_AUTHORIZED=YES_ISOLATED_SPEAKING_TEST`.
2. Aplicar V1–V2.2 solo ahí. Crear dos usuarios ficticios.
3. Levantar 3011/3012 con `.next-speaking-a/b` y el probe HTTP: una sesión, recover, turnos, un solo cobro, recover tras matar una instancia.
4. Aprobar la retención (`docs/speaking-motor-v2.3-audio-retention.md`) antes de guardar voces identificables en Cloud.
5. Grabar las cinco respuestas autorizadas en el móvil, importar, `SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval`.
6. No abrir Speaking a alumnos ni activar exam mode.

## 6. Entrega de artefactos

- Este informe.
- `docs/speaking-motor-v2.3-supabase-test-runbook.md`
- `docs/speaking-motor-v2.3-audio-retention.md`
- Gate y scripts de dos Next (fail-closed).

No se afirma que el motor esté listo para alumnos.
