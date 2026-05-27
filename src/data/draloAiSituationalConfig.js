/** Escenarios «situaciones reales» por habilidad (segunda vía en Dralo AI). */

export const DRALO_AI_EXAM_TRACK = {
  id: 'exam',
  label: 'Preparación del examen',
  icon: '🏆',
  description:
    'Tareas y partes al estilo Cambridge: las mismas actividades que en el examen oficial.',
};

export const DRALO_AI_SITUATIONAL_TRACK = {
  id: 'situational',
  label: 'Situaciones reales',
  icon: '🌍',
  description:
    'Role play, mensajes, correos y textos del día a día para practicar inglés útil fuera del examen.',
};

export const DRALO_AI_SITUATIONAL = {
  speaking: {
    title: 'Speaking · Role play',
    description:
      'Habla con el avatar de Dralo en situaciones reales: aeropuerto, hotel, entrevistas… o describe tu propia situación.',
    scenarios: [
      {
        id: 'airport-passport',
        label: 'Aeropuerto · control de pasaportes',
        icon: '✈️',
        prompt:
          'You are an immigration officer at an international airport. The student is travelling to Canada. Conduct passport control professionally but kindly. Ask about purpose of visit, length of stay, accommodation, and return ticket. Keep replies short (2–3 sentences) and ask one question at a time. Stay in character.',
        starter:
          'Good afternoon. May I see your passport and boarding pass, please? What is the purpose of your visit to Canada?',
      },
      {
        id: 'airport-security',
        label: 'Aeropuerto · seguridad',
        icon: '🛂',
        prompt:
          'You are airport security staff. Guide the student through a security check: liquids, laptops, shoes if needed. Be clear and calm. Short instructions, one step at a time.',
        starter:
          'Hello. Please place your bag on the belt and take out any laptops or large electronics.',
      },
      {
        id: 'hotel-checkin',
        label: 'Hotel · check-in',
        icon: '🏨',
        prompt:
          'You are a hotel receptionist. Help the student check in: name, reservation, room type, breakfast times, Wi‑Fi password. Polite hospitality English.',
        starter:
          'Good evening, welcome to the hotel. Do you have a reservation with us?',
      },
      {
        id: 'restaurant',
        label: 'Restaurante',
        icon: '🍽️',
        prompt:
          'You are a waiter in a mid-range restaurant. Take orders, explain dishes, handle allergies, offer dessert and the bill. Natural service English.',
        starter:
          'Good evening. Are you ready to order, or would you like a few more minutes with the menu?',
      },
      {
        id: 'job-interview',
        label: 'Entrevista de trabajo',
        icon: '💼',
        prompt:
          'You are a friendly HR interviewer for an international company. Ask about experience, strengths, teamwork, and why they want the job. One question per turn.',
        starter:
          'Thanks for coming in today. Could you start by telling me a little about yourself?',
      },
      {
        id: 'custom',
        label: 'Tu situación (personalizada)',
        icon: '✨',
        prompt: null,
        starter:
          'Tell me what situation you want to practise (e.g. "I am travelling to Canada and need help at the airport"), and I will play the other role.',
      },
    ],
  },
  writing: {
    title: 'Writing · Formatos reales',
    description:
      'Practica WhatsApp, emails de trabajo, artículos y otros formatos con feedback de Dralo.',
    scenarios: [
      {
        id: 'sms-whatsapp',
        label: 'SMS / WhatsApp',
        icon: '💬',
        ui: 'whatsapp',
        hint: 'Mensajes cortos con acrónimos naturales (OMG, BTW, FYI…).',
      },
      {
        id: 'work-email',
        label: 'Email de trabajo',
        icon: '📧',
        hint: 'Formal o semi-formal: peticiones, disculpas, reuniones.',
      },
      {
        id: 'article',
        label: 'Artículo / blog',
        icon: '📰',
        hint: 'Opinión o reseña para web o revista escolar.',
      },
      {
        id: 'social-post',
        label: 'Red social',
        icon: '📱',
        hint: 'Post o hilo breve (LinkedIn, Instagram caption…).',
      },
      {
        id: 'formal-letter',
        label: 'Carta formal',
        icon: '✉️',
        hint: 'Queja, solicitud o carta de presentación.',
      },
    ],
  },
  listening: {
    title: 'Listening · Situaciones reales',
    description: 'Audios del mundo real: anuncios, podcasts, llamadas y noticias breves.',
    scenarios: [
      { id: 'airport-announcement', label: 'Anuncios en aeropuerto', icon: '📢' },
      { id: 'podcast-snippet', label: 'Fragmento de podcast', icon: '🎙️' },
      { id: 'customer-service', label: 'Llamada atención al cliente', icon: '☎️' },
      { id: 'news-bulletin', label: 'Noticias breves', icon: '📻' },
      { id: 'work-meeting', label: 'Reunión de trabajo (extracto)', icon: '👥' },
    ],
  },
  reading: {
    title: 'Reading · Textos auténticos',
    description: 'Blogs, anuncios, reseñas y hilos para leer como en la vida real.',
    scenarios: [
      { id: 'travel-blog', label: 'Blog de viajes', icon: '🧳' },
      { id: 'job-adverts', label: 'Anuncios de empleo', icon: '💼' },
      { id: 'product-reviews', label: 'Reseñas de productos', icon: '⭐' },
      { id: 'social-thread', label: 'Hilo en redes', icon: '💬' },
      { id: 'how-to-guide', label: 'Guía práctica (how-to)', icon: '📋' },
    ],
  },
  'use-of-english': {
    title: 'Use of English · Lenguaje cotidiano',
    description: 'Emails, carteles, chats y notas de trabajo — gramática en contexto real.',
    scenarios: [
      { id: 'work-email-uoe', label: 'Emails (tono y conectores)', icon: '📧' },
      { id: 'signs-notices', label: 'Carteles y avisos públicos', icon: '🪧' },
      { id: 'chat-messages', label: 'Mensajes de chat', icon: '💬' },
      { id: 'workplace-memo', label: 'Notas internas de trabajo', icon: '📝' },
      { id: 'form-filling', label: 'Formularios y fichas', icon: '📄' },
    ],
  },
};

export function getSkillConfig(modeId) {
  return DRALO_AI_SITUATIONAL[modeId] || null;
}
