/**
 * Catálogo de niveles premium (Exam practice / CEFR) y planes por defecto para monetizacion_planes.
 */

export const PREMIUM_EXAM_LEVELS = [
  {
    slug: 'a2',
    label: 'A2',
    access: 'free',
    note: 'Acceso base para todos los usuarios registrados.',
  },
  {
    slug: 'b1',
    label: 'B1',
    access: 'premium',
    note: 'Simulacros y exam mode completos con suscripción.',
  },
  {
    slug: 'b2',
    label: 'B2',
    access: 'premium',
    note: 'Nivel principal Cambridge; incluye Dralo AI ampliado.',
  },
  {
    slug: 'c1',
    label: 'C1',
    access: 'premium',
    note: 'Contenido avanzado y papers C1.',
  },
  {
    slug: 'c2',
    label: 'C2',
    access: 'premium',
    note: 'Máximo nivel; desbloqueo con plan anual recomendado.',
  },
];

/** Plantillas si monetizacion_planes está vacío (solo seed admin). */
export const DEFAULT_MONETIZATION_PLANS = [
  {
    nombre: 'Gratis A2',
    descripcion: 'Acceso a Exam practice nivel A2 y funciones básicas.',
    precio: 0,
    duracion_dias: 36500,
    activo: true,
  },
  {
    nombre: 'Premium B2 mensual',
    descripcion: 'B2 completo + Dralo AI (Use of English, Reading, Writing, Listening, Speaking).',
    precio: 9.99,
    duracion_dias: 30,
    activo: true,
  },
  {
    nombre: 'Premium B2 anual',
    descripcion: 'Mismo acceso B2 con descuento anual.',
    precio: 89.99,
    duracion_dias: 365,
    activo: true,
  },
  {
    nombre: 'Premium C1 mensual',
    descripcion: 'Nivel C1 y todos los skills premium.',
    precio: 12.99,
    duracion_dias: 30,
    activo: true,
  },
  {
    nombre: 'Premium todo acceso',
    descripcion: 'B1–C2, Exam mode y Dralo AI sin límites.',
    precio: 19.99,
    duracion_dias: 30,
    activo: true,
  },
];

export const SUBSCRIPTION_STATUS_LABELS = {
  activa: 'Activa',
  active: 'Activa',
  cancelada: 'Cancelada',
  cancelled: 'Cancelada',
  pendiente: 'Pendiente',
  pending: 'Pendiente',
  expirada: 'Expirada',
  expired: 'Expirada',
};
