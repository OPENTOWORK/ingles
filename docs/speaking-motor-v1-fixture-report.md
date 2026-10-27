# Speaking Motor V1.4 — informe de fixtures

Los audios de esta pasada son sintéticos y técnicos. No son grabaciones auténticas de alumnos.

Pack: full-mixed

## Transcripción

### name-developed
- Pregunta: And what is your name?
- Referencia: My name is Alex Rivera.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q02-articles
- Pregunta: How do you usually spend your weekends?
- Referencia: At the weekend I usually visit the my family and we cook a dinner together. After that I go to the park if the weather is good.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: GR-AR
- Errores detectados: ninguno
- No detectados: GR-AR
- Falsos positivos: ninguno

### q03-tenses
- Pregunta: Do you prefer visiting new places or returning to places you know? Why?
- Referencia: Last year I go to a new city and I enjoy it a lot. I prefer visiting new places because I like discovering different food and streets.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: GR-VT
- Errores detectados: ninguno
- No detectados: GR-VT
- Falsos positivos: ninguno

### q04-vocabulary
- Pregunta: How has technology changed the way you communicate with your friends?
- Referencia: Technology has changed a lot because now I make messages all the time and I do a video call instead of meeting. It is more comfortable but also more superficial.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: VC-CO, VC-WW
- Errores detectados: ninguno
- No detectados: VC-CO, VC-WW
- Falsos positivos: ninguno

### q05-short
- Pregunta: Is there a new skill you would like to learn in the future?
- Referencia: Yes.
- Whisper: You
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: DM-EL
- Errores detectados: ninguno
- No detectados: DM-EL
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: If you have any questions or other problems, please post them in the comments.
- Fuente STT: STT (ejecutado)
- Solapamiento: 0.036
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

### q01-developed
- Pregunta: What do you enjoy most about studying English?
- Referencia: I enjoy studying English because it helps me travel and speak with people at work. I usually watch short videos and then try to use the new words the next day.
- Whisper: (vacío)
- Fuente STT: STT (ejecutado)
- Solapamiento: 0
- Errores esperados: ninguno
- Errores detectados: ninguno
- No detectados: ninguno
- Falsos positivos: ninguno

## Evaluación

- Grammar and Vocabulary: null
- Discourse Management: null
- Pronunciation: null
- Interactive Communication: null
- Global Achievement: null

## Feedback

Has completado la Part 1. Esta corrección es orientativa y se basa solo en lo que se ha podido oír con claridad.

Puntuación orientativa de Dralo. No es una nota oficial de Cambridge.

## Problemas encontrados

- Whisper no recuperó el texto de referencia en la mayoría de los turnos. El TTS sintético caducó o cayó a un tono; eso no es habla usable.
- En un turno, Whisper alucinó una frase ajena al examen (`If you have any questions or other problems...`) sobre audio no lingüístico.
- El motor no inventó puntuaciones: Grammar and Vocabulary, Discourse Management, Pronunciation, Interactive Communication y Global Achievement quedaron `null`.
- Por tanto, no se pudo medir la detección de artículos, tiempos ni vocabulario sobre las transcripciones de referencia.
- `fixtureId` en una sesión normal responde 403.

## Live run

- Session: 9c30f5f6-2335-4c6e-80f6-3702c5bfc359
- Complete status: 200
- STT note: Whisper se ejecutó (fuente STT), pero el audio sintético no contenía habla usable.
