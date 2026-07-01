# Speaking en Dralo — Documentación técnica

> Resumen del estado del código en el proyecto `english-practice` (dralo.es).  
> Última revisión: junio 2025.

---

## 1. Resumen ejecutivo

El speaking en Dralo **no es un solo módulo**: hay varias capas que conviven.

| Capa | Ruta principal | Estado |
|------|----------------|--------|
| **Speaking Coach (misiones)** | `/dralo-ai/speaking` | Activo — entrada principal del hub |
| **Speaking Lab** | `/niveles/speaking-lab/[cefr]/` | Activo — Practice / Correction / Exam |
| **Simulador examen Dralo AI** | `DraloAiSpeakingStudio` | Implementado pero **sin ruta enlazada** |
| **Roleplay situacional legacy** | `DraloAiSpeakingSituational` | Legacy — redirige al coach de misiones |
| **Pronunciation Coach** | `/dralo-ai/pronunciation-coach` | Activo — solo texto, no roleplay |

---

## 2. Rutas y redirecciones

### 2.1 Entrada principal

- **`/dralo-ai/speaking`** → `DraloAiSpeakingCoach` → `LevelsSpeakingAiPanel`
- Configuración del hub: `src/data/draloAiConfig.js` (Speaking Coach, niveles A2–C2)
- Menú: `src/config/appNavMenu.js` → “Speaking Coach”

### 2.2 Redirecciones (todas van al coach de misiones)

| Ruta antigua | Destino |
|--------------|---------|
| `/speaking` | `/dralo-ai/speaking` |
| `/niveles/{level}/speaking-ai` | `/dralo-ai/speaking?level={LEVEL}` |
| `/dralo-ai/speaking/exam` | `/dralo-ai/speaking` |
| `/dralo-ai/speaking/situational` | `/dralo-ai/speaking` |

### 2.3 Speaking Lab

- **`/niveles/speaking-lab/{a2|b1|b2|c1|c2}/`**
- Submodos:
  - `/practice/` — conversación + micro-feedback
  - `/correction/` — análisis estructurado
  - `/exam/` — simulación examinador + informe final

Enlazado desde `src/data/nivelesLevelHub.js`.

---

## 3. Speaking Coach — Misiones (flujo activo principal)

### 3.1 Qué es

Práctica de **inglés real** con roleplays guiados (aeropuerto, restaurante, hotel, entrevista, etc.).  
**No** simula el examen Cambridge.

### 3.2 Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/components/dralo-ai/DraloAiSpeakingCoach.js` | Wrapper con `?level=` |
| `src/components/niveles/LevelsSpeakingAiPanel.js` | UI principal |
| `src/data/speakingMissions.js` | Escenarios, objetivos, personajes, XP |
| `src/lib/ai/services/speakingCoachService.js` | Orquestación LLM |
| `src/lib/ai/prompts/speakingCoachPrompt.js` | System prompt + formato JSON |
| `src/lib/speakingCoachProgress.js` | Progreso local (XP, niveles) |
| `dralo-speaking/lib/useSpeechRecognition.js` | STT (Web Speech API) |

### 3.3 Flujo técnico

```
Usuario (micrófono o texto)
  → Web Speech API (STT)
  → POST /api/dralo-ai  { action: "speaking_ai", ... }
  → handleDraloAiSpeakingMission (aiActionHandlers.js)
  → runSpeakingCoach (speakingCoachService.js)
  → draloChatCompletion (OpenAI)
  → Respuesta JSON parseada en UI
  → TTS: window.speechSynthesis (en-GB) — sin /api/coach-tts
```

### 3.4 Prompt — `speakingCoachPrompt.js`

**Persona:** “Dralo AI Speaking Coach” — roleplay real, no examen.

**Reglas principales:**

1. Actuar como el personaje de la misión
2. Una pregunta corta por turno
3. Adaptar vocabulario al CEFR
4. Corregir **solo un** error importante por turno
5. Trackear objetivos completados
6. Dar XP y puntuaciones por turno

**Respuesta JSON (turno normal, `finish: false`):**

```json
{
  "reply": "...",
  "quickTip": { "original": "", "better": "", "why": "" },
  "completedObjectives": [0],
  "xpEarned": 10,
  "xpReason": "...",
  "scores": { "grammar": 70, "vocabulary": 70, "fluency": 70, "confidence": 70 },
  "avatarState": "speaking"
}
```

**Respuesta JSON (fin de misión, `finish: true`):**

- `missionComplete`, `overallFeedback`, `stars` (1–3)
- `usefulExpressions`, `mainCorrection`, `nextMissionRecommendation`

Se combina con el system base Real-Life: `src/lib/draloAiSystemPrompt.js` → `DRALO_REAL_LIFE_CORE_SYSTEM`.

### 3.5 Modelo y motor IA

- Motor: `src/lib/ai/draloAiEngine.js`
- Modelo por defecto: **`gpt-4o`**
- Variables: `OPENAI_API_KEY`, `DRALO_OPENAI_MODEL`, `OPENAI_MODEL`
- Temperatura: ~0.7 (turnos), ~0.4 (cierre)
- `response_format: { type: "json_object" }` cuando está soportado

### 3.6 Auth, límites y uso

- Acción: `dralo_ai_speaking_mission`
- Requiere login + acceso Dralo AI (`DRALO_AI_HIDDEN_ACTIONS`)
- Uso registrado en Supabase (`src/lib/aiUsage.js`)
- **Sin límite diario fijo** en `DAILY_LIMITS` (a diferencia del feedback de examen)

### 3.7 Progreso y gamificación

- LocalStorage: `speakingCoachProgress.js`
- XP global Dralo: `DraloXpContext`
- Misiones con objetivos indexados (0, 1, 2…)

---

## 4. Speaking Lab — Arquitectura modular

### 4.1 Ubicación

- `src/features/speaking/` — dominio, servicios, UI
- Rutas: `src/app/niveles/speaking-lab/[cefr]/`

### 4.2 APIs

| Endpoint | Función |
|----------|---------|
| `POST /api/speaking/session` | Crear sesión (Prisma) |
| `POST /api/speaking/turn` | Turno: STT + LLM + TTS |
| `POST /api/speaking/evaluate` | Informe final de sesión |

También: acción `exam_speaking_feedback` vía `POST /api/dralo-ai`.

### 4.3 Pipeline de un turno (`/api/speaking/turn`)

1. **Entrada:** texto JSON o `multipart/form-data` con audio webm
2. **STT:** OpenAI Whisper (`whisper-1`) — `stt.adapter.ts` — o mock sin API key
3. **LLM:** `llm.adapter.ts`
   - `EXAM` → `examReply()` — examinador, sin corregir
   - `PRACTICE` → `practiceReply()` + `microFeedback()` en paralelo
4. **TTS:** `synthesizeExamTtsMp3` → audio base64
5. **Persistencia:** `SpeakingSession`, `SpeakingTurn` (Prisma)

### 4.4 Base de datos (Prisma)

```
SpeakingSession  → mode (EXAM | PRACTICE | …)
SpeakingTurn     → role, text, transcriptSource, microFeedback
SpeakingEvaluation → informes
```

Schema: `prisma/schema.prisma`

### 4.5 Prompts del examinador

**Fuente principal:** `dralo-speaking/prompts/cambridge-prompts.js`

Por nivel A2–C2, tres modos:

- `practice` — tutor conversacional (“Emma”)
- `correction` — JSON estructurado con scores y correcciones
- `exam` — examinador oficial Cambridge, sin enseñar

**Adaptador LLM:** `src/features/speaking/services/llm/llm.adapter.ts`

- `examinerSystem()`: mezcla `SYSTEM_PROMPTS[cefr].exam` + instrucciones de parte + `taskContext`
- Envuelto con `mergeDraloSystem()` (Real-Life core)

**Plantillas markdown (referencia):**

- `src/features/speaking/domain/prompts/exam.interlocutor.md`
- `src/features/speaking/domain/prompts/practice.system.md`

**Blueprints de examen:** `src/features/speaking/domain/exam-blueprints.ts`  
(Part 1 Interview, Part 2 Long turn, Part 3 Collaborative, Part 4 Discussion — según nivel)

### 4.6 Modelo IA (turnos en tiempo real)

- **`gpt-4o-mini`** vía `getDraloFastModel()`
- Variable: `DRALO_OPENAI_MODEL_FAST` / `OPENAI_MODEL_FAST`

### 4.7 Audio

**Voz del examinador:**

```
playExaminerAudio (utils/playExaminerAudio.js)
  → speakText (dralo-speaking/lib/gemini-coach.js)
  → POST /api/coach-tts/  (OpenAI TTS mp3)
  → fallback: Google Translate TTS
  → fallback: Web Speech API (voces en-GB)
```

**Micrófono:**

- Exam: `useMediaRecorder` + Whisper
- Practice lab: puede usar texto o audio según página

### 4.8 Informe final

Archivo: `src/features/speaking/services/evaluation/exam-final-report.ts`

- **Exam B2:** criterios Cambridge (grammar_vocabulary, discourse_management, pronunciation, interactive_communication, global_achievement) — escala 0–5
- **Practice:** wrap-up amigable post-conversación
- Motor: `cambridgeChatCompletion` o `realLifeChatCompletion` según contexto

**Límite:** `exam_speaking_feedback` → **3 usos/día** (requiere login)

---

## 5. Simulador de examen Dralo AI (código huérfano)

### 5.1 Componentes

- `src/components/dralo-ai/DraloAiSpeakingStudio.js` — selector de parte por nivel
- `src/components/dralo-ai/DraloAiSpeakingExamPractice.js` — sesión en vivo
- `src/data/draloAiSpeakingExam.js` — actividades por blueprint Cambridge

### 5.2 Funcionalidad

- Llama a `/api/speaking/session` + `/api/speaking/turn` con `mode: 'EXAM'`
- Part 2 B2: fotos vía `POST /api/dralo-ai/speaking/long-turn-photos`
  - Generador: `src/lib/draloAiLongTurnPhotos.js`
- Al terminar: `POST /api/speaking/evaluate`

### 5.3 Estado

**`DraloAiSpeakingStudio` no está importado en ninguna ruta.**  
`/dralo-ai/speaking/exam` redirige al coach de misiones.  
El simulador existe en código pero **no está expuesto** en la navegación actual.

---

## 6. Roleplay situacional legacy

### 6.1 Componente

- `src/components/dralo-ai/DraloAiSpeakingSituational.js`

### 6.2 Escenarios

Definidos en `src/data/draloAiSituationalConfig.js`:

- Airport passport control, security, hotel check-in, restaurant, job interview, custom

Cada escenario incluye `prompt` (system) y `starter` (primera línea).

### 6.3 API

`POST /api/gemini-coach` con `mode: 'roleplay'`

**Prioridad de motores (`gemini-coach/route.js`):**

1. OpenAI (`realLifeChatCompletion`) — principal
2. Gemini — solo si `DRALO_ALLOW_GEMINI_FALLBACK=true` + `GEMINI_API_KEY`
3. Respuesta local de emergencia si todo falla

**TTS:** `speakText` → `/api/coach-tts/` (misma cadena que el examinador)

### 6.4 Estado

Ruta `/dralo-ai/speaking/situational` **redirige** a `/dralo-ai/speaking`.  
Flujo legacy; sustituido en la práctica por el Speaking Coach de misiones.

---

## 7. Otros módulos relacionados

| Módulo | Descripción |
|--------|-------------|
| **Pronunciation Coach** | `/dralo-ai/pronunciation-coach` — chat texto, prompt en `pronunciationCoachPrompt.js`. No escucha audio. |
| **B2SpeakingExamPractice** | Speaking “clásico” en Niveles (`/niveles/b2/exam-speaking`) — scripts, no necesariamente IA en vivo. |
| **draloAiA2ExamPrompts.js** | Prompts para **generar** contenido A2 Key (admin), no coach en vivo. |
| **realLifeCoachPrompt.js** | Base del motor Real-Life (gemini-coach, grammar, dictionary…). |
| **Carpeta `dralo-speaking/`** | MVP original: prompts Cambridge, gemini-coach, speech recognition. |

---

## 8. Variables de entorno

| Variable | Uso |
|----------|-----|
| `OPENAI_API_KEY` | Obligatorio para casi todo |
| `DRALO_OPENAI_MODEL` / `OPENAI_MODEL` | Default `gpt-4o` (misiones, informes) |
| `DRALO_OPENAI_MODEL_FAST` / `OPENAI_MODEL_FAST` | Default `gpt-4o-mini` (turnos lab) |
| `OPENAI_STT_MODEL` | Default `whisper-1` |
| `GEMINI_API_KEY` | Fallback opcional |
| `DRALO_ALLOW_GEMINI_FALLBACK` | `true` para activar Gemini |
| `GEMINI_MODEL` | Default `gemini-2.0-flash` |
| `COACH_CHAT_MAX_TOKENS` | Tokens máx. gemini-coach |
| `DATABASE_URL` | Sesiones Prisma (Speaking Lab) |

---

## 9. Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    DRALO AI HUB — /dralo-ai/speaking             │
│  LevelsSpeakingAiPanel + speakingMissions                        │
│  STT: Web Speech │ LLM: gpt-4o │ TTS: speechSynthesis           │
│  API: /api/dralo-ai (action: speaking_ai)                       │
│  Prompt: speakingCoachPrompt.js                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              SPEAKING LAB — /niveles/speaking-lab/[cefr]/        │
│  Practice │ Correction │ Exam                                   │
│  STT: Whisper │ LLM: gpt-4o-mini │ TTS: /api/coach-tts         │
│  API: /api/speaking/session | turn | evaluate                    │
│  Prompts: cambridge-prompts.js + llm.adapter.ts                  │
│  DB: Prisma (SpeakingSession, SpeakingTurn)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LEGACY (sin ruta activa)                       │
│  DraloAiSpeakingStudio (exam) → /api/speaking/*                │
│  DraloAiSpeakingSituational → /api/gemini-coach                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Acciones IA registradas

| Acción | Límite diario | Auth | Área |
|--------|---------------|------|------|
| `dralo_ai_speaking_mission` | — | Sí + Dralo AI | dralo_ai |
| `exam_speaking_feedback` | 3 | Sí | exam_practice |

Definidas en `src/lib/aiUsage.js`.

---

## 11. Conclusión para producto

- **Lo que ve el alumno hoy** desde Dralo AI → Speaking Coach: **misiones roleplay** con JSON estructurado, XP y objetivos.
- **El simulador de examen con voz de examinador** está en **Speaking Lab** y en código de `DraloAiSpeakingExamPractice`, pero **no en la ruta principal** del hub.
- Hay **duplicidad histórica** (gemini-coach + situational vs misiones + speaking-lab); conviene unificar rutas si el objetivo es un solo flujo de speaking.

---

## 12. Índice de archivos

```
src/app/dralo-ai/speaking/page.js
src/components/niveles/LevelsSpeakingAiPanel.js
src/data/speakingMissions.js
src/lib/ai/prompts/speakingCoachPrompt.js
src/lib/ai/services/speakingCoachService.js
src/app/api/dralo-ai/route.js
src/app/api/speaking/turn/route.ts
src/app/api/speaking/session/route.ts
src/app/api/speaking/evaluate/route.ts
src/app/api/gemini-coach/route.js
src/features/speaking/services/llm/llm.adapter.ts
dralo-speaking/prompts/cambridge-prompts.js
dralo-speaking/lib/gemini-coach.js
src/data/draloAiSituationalConfig.js
src/components/dralo-ai/DraloAiSpeakingExamPractice.js
src/components/dralo-ai/DraloAiSpeakingStudio.js
```

---

*Documento generado a partir del análisis del repositorio english-practice.*
