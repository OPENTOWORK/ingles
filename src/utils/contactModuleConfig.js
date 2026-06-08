export const CONTACT_REQUIREMENTS_TEXT = `Contacto
Área de comunicación dentro de la plataforma que permite la interacción entre usuarios, profesores y soporte para resolver dudas, incidencias o consultas.
○	Mensajes internos
■	Sistema de mensajería privada integrado en la plataforma para facilitar la comunicación entre los distintos perfiles.
●	Alumno /profesor
●	Alumno/soporte
●	Profesor/soporte
○	Soporte
■	Sistema de atención y gestión de incidencias que permite hacer seguimiento de consultas o problemas reportados dentro de la plataforma.
●	Tipos de usuario
○	Usuario potencial 
■	Estado
●	Abierto
●	Sin responder
●	La solicitud ha sido enviada, pero todavía no ha recibido respuesta.
●	Respondido
●	El ticket ya tiene una contestación, pero sigue abierto porque la incidencia no se ha cerrado.
●	Cerrado
●	La incidencia o consulta ya ha sido resuelta o finalizada.
●	Tiempo del ticket en activo
●	Registro del tiempo que una incidencia ha permanecido abierta desde su creación hasta su cierre.
○	Usuario confirmado
■	Estado
●	Abierto
●	Sin responder
●	La solicitud ha sido enviada, pero todavía no ha recibido respuesta.
●	Respondido
●	El ticket ya tiene una contestación, pero sigue abierto porque la incidencia no se ha cerrado.
●	Cerrado
●	La incidencia o consulta ya ha sido resuelta o finalizada.
●	Tiempo del ticket en activo
●	Registro del tiempo que una incidencia ha permanecido abierta desde su creación hasta su cierre.
○	FAQ
■	Preguntas frecuentes y definiciones además de soluciones
●	Autogestión
○	Permite al usuario encontrar soluciones de forma inmediata y autónoma.
●	Organización por temas
○	cuenta, pagos, uso de la plataforma, etc.
●	Acceso rápido
○	Hipervínculos (Facilita la búsqueda de información relevante sin navegar por toda la plataforma).`;

export const TICKET_STATUS = {
  OPEN: 'Abierto',
  UNANSWERED: 'Sin responder',
  ANSWERED: 'Respondido',
  CLOSED: 'Cerrado',
};

export const USER_TYPES = {
  POTENTIAL: 'Usuario potencial',
  CONFIRMED: 'Usuario confirmado',
};

export const DEFAULT_TICKET_TOPIC = 'Platform usage';

export const FAQ_TOPICS = [
  'Account & login',
  'Payments & subscriptions',
  'Platform usage',
  'Exams & practice',
  'Levels & progress',
  'Theory & exercises',
  'Dralo AI',
  'Speaking & pronunciation',
  'Technical issue',
  'Bug report',
  'Privacy & data',
  'Teacher / class access',
  'Billing & invoices',
  'Other',
];

/** English labels for ticket status values stored in the database. */
export const TICKET_STATUS_LABELS_EN = {
  Abierto: 'Open',
  'Sin responder': 'Unanswered',
  Respondido: 'Answered',
  Cerrado: 'Closed',
};

export const INTERNAL_MESSAGE_CHANNELS = [
  {
    value: 'Alumno /profesor',
    label: 'Student ↔ Teacher',
    description: 'Questions about lessons, feedback, or class-related topics.',
    icon: '🎓',
  },
  {
    value: 'Alumno/soporte',
    label: 'Student ↔ Support',
    description: 'Help with the platform, access, or technical issues.',
    icon: '🛟',
  },
  {
    value: 'Profesor/soporte',
    label: 'Teacher ↔ Support',
    description: 'Administrative or platform support for teaching staff.',
    icon: '💼',
  },
];
