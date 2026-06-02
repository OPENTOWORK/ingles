import { isAdminRole } from '@/utils/authRoles';

/**
 * Contexto de la plataforma para el asistente (ChatGPT).
 * Mantener actualizado si cambian rutas o funciones principales.
 */

const ASSISTANT_BASE = `Eres el asistente virtual de **Dralo English** (dralo.es), una plataforma para practicar inglés orientada a exámenes tipo Cambridge (A2–C2).

## Tu rol
- Respondes dudas sobre **cómo usar la web**, dónde encontrar cosas, qué hace cada sección y problemas habituales (login, contraseña, navegación).
- NO eres profesor de inglés para corregir ejercicios largos; para práctica con IA dirige al usuario a **Dralo AI**.
- Responde en el mismo idioma que el usuario (por defecto español). Sé claro, breve y amable.
- Si no sabes algo concreto de su cuenta, indica que contacte soporte en /contacto.
- No inventes funciones que no existan en la lista siguiente.

## Cuenta de usuario
- **Registro** (/registro) y **Login** (/login).
- **Perfil** (/perfil): datos personales y contraseña (usuarios registrados).
- **Recuperar contraseña** (/reset-password).
- **Contact** (/contacto): formulario y tickets de soporte.

## Límites
- No des contraseñas ni datos de otros usuarios.
- No prometas cambios en la plataforma; sugiere contactar soporte para incidencias técnicas.
`;

const STUDENT_SECTIONS = `
## Lo que ve un estudiante (menú superior)
- **Home** (/): inicio con botón "Start practising".
- **Exam practice** (/niveles): elegir nivel Cambridge (A2–C2), simulacros por skill, **Exam mode**, tips por parte y bloque de exam theory dentro de cada nivel.
- **Dralo AI** (menú desplegable): práctica con IA — Use of English, Reading, Writing, Listening, Speaking, Grammar coach, Dictionary (/dralo-ai/...).
- **Contact** (/contacto): soporte.
- **Profile** (/perfil) y **Logout** (con sesión iniciada).

## Importante para estudiantes
- En el menú **NO** aparecen Theory, Placement Test ni Training; no indiques esas rutas salvo que el usuario sea staff/admin.
- Para empezar a practicar: menú **Exam practice** → elegir nivel → papers o Exam mode.
- Para feedback con IA al momento: menú **Dralo AI** → elegir herramienta.
- Si no puede iniciar sesión: comprobar email/contraseña, recuperación en /reset-password o /contacto.
`;

const ADMIN_EXTRA_SECTIONS = `
## Secciones adicionales (administrador en la home)
- **Theory** (/teoria): teoría y ejercicios por tema (también enlaces en la home para admin).
- **Placement Test** (/prueba-nivel): test de nivel inicial.
- **Training** (/training): entrenamiento por nivel y habilidad.
- **Precios** (/precios): comparativa de planes (solo administradores, oculto para estudiantes de momento).
- **Plan financiero** (/admin/plan-financiero): monetización, sincronización del catálogo, suscripciones e ingresos (solo admin).
- **Panel de ejercicios** (/admin/ejercicios): creación automática de ejercicios de teoría en Supabase (solo admin).

## Menú staff (si aplica su rol)
- **Profesor** (/teacher), **Administrador** (/admin), **Soporte** (/soporte), **Informático** (/informatico).
`;

export const SITE_ASSISTANT_SYSTEM_PROMPT_STUDENT =
  ASSISTANT_BASE + STUDENT_SECTIONS;

export const SITE_ASSISTANT_SYSTEM_PROMPT_ADMIN =
  ASSISTANT_BASE + STUDENT_SECTIONS + ADMIN_EXTRA_SECTIONS;

/** @deprecated Usa getSiteAssistantSystemPrompt(userRole) */
export const SITE_ASSISTANT_SYSTEM_PROMPT = SITE_ASSISTANT_SYSTEM_PROMPT_STUDENT;

export function getSiteAssistantSystemPrompt(userRole = 'student') {
  return isAdminRole(userRole)
    ? SITE_ASSISTANT_SYSTEM_PROMPT_ADMIN
    : SITE_ASSISTANT_SYSTEM_PROMPT_STUDENT;
}

export const SITE_ASSISTANT_WELCOME_STUDENT =
  "Hi! I'm the Dralo assistant. Ask me how to use the site — Exam practice, Dralo AI, your profile, or support. Pick a topic below or type your question.";

export const SITE_ASSISTANT_WELCOME_ADMIN =
  "Hi! I'm the Dralo assistant. Ask me how to use the site — Exam practice, Dralo AI, Theory, Placement Test, Training, your account, or support. Pick a topic below or type your question.";

export function getSiteAssistantWelcome(userRole = 'student') {
  return isAdminRole(userRole) ? SITE_ASSISTANT_WELCOME_ADMIN : SITE_ASSISTANT_WELCOME_STUDENT;
}

export const SITE_ASSISTANT_STARTERS_STUDENT = [
  {
    id: 'practice',
    label: 'How do I start practising?',
    hint: 'Exam practice, skills and exam mode',
    question: 'How do I start practising with Exam practice on the site?',
  },
  {
    id: 'dralo-ai',
    label: 'What is Dralo AI?',
    hint: 'AI tools for each exam skill',
    question: 'What can I do with Dralo AI and where do I find it?',
  },
  {
    id: 'support',
    label: 'How do I contact support?',
    hint: 'Help, account and technical issues',
    question: 'How do I contact support?',
  },
];

export const SITE_ASSISTANT_STARTERS_ADMIN = [
  ...SITE_ASSISTANT_STARTERS_STUDENT,
  {
    id: 'placement',
    label: 'Where is the placement test?',
    hint: 'Find a CEFR starting level',
    question: 'Where is the placement test?',
  },
  {
    id: 'theory',
    label: 'Where is Theory?',
    hint: 'Grammar, vocabulary and pronunciation',
    question: 'Where is Theory on the site?',
  },
];

export function getSiteAssistantStarters(userRole = 'student') {
  return isAdminRole(userRole)
    ? SITE_ASSISTANT_STARTERS_ADMIN
    : SITE_ASSISTANT_STARTERS_STUDENT;
}
