/** Real-world scenario tracks per skill (second path in Dralo AI). */

export const DRALO_AI_EXAM_TRACK = {
  id: 'exam',
  label: 'Exam preparation',
  icon: '🏆',
  description:
    'Cambridge-style tasks and parts — the same activities as in the official exam.',
};

export const DRALO_AI_SITUATIONAL_TRACK = {
  id: 'situational',
  label: 'Real-world situations',
  icon: '🌍',
  description:
    'Role play, messages, emails and everyday texts to practise useful English outside the exam.',
};

export const DRALO_AI_SITUATIONAL_EYEBROW = 'Dralo AI · Real-world situations';
export const DRALO_AI_EXAM_EYEBROW = 'Dralo AI · Exam preparation';

export const DRALO_AI_SITUATIONAL = {
  speaking: {
    title: 'Speaking · Role play',
    description:
      'Talk with the Dralo avatar in real situations: airport, hotel, interviews… or describe your own scenario.',
    scenarios: [
      {
        id: 'airport-passport',
        label: 'Airport · passport control',
        icon: '✈️',
        prompt:
          'You are an immigration officer at an international airport. The student is travelling to Canada. Conduct passport control professionally but kindly. Ask about purpose of visit, length of stay, accommodation, and return ticket. Keep replies short (2–3 sentences) and ask one question at a time. Stay in character.',
        starter:
          'Good afternoon. May I see your passport and boarding pass, please? What is the purpose of your visit to Canada?',
      },
      {
        id: 'airport-security',
        label: 'Airport · security',
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
        label: 'Restaurant',
        icon: '🍽️',
        prompt:
          'You are a waiter in a mid-range restaurant. Take orders, explain dishes, handle allergies, offer dessert and the bill. Natural service English.',
        starter:
          'Good evening. Are you ready to order, or would you like a few more minutes with the menu?',
      },
      {
        id: 'job-interview',
        label: 'Job interview',
        icon: '💼',
        prompt:
          'You are a friendly HR interviewer for an international company. Ask about experience, strengths, teamwork, and why they want the job. One question per turn.',
        starter:
          'Thanks for coming in today. Could you start by telling me a little about yourself?',
      },
      {
        id: 'custom',
        label: 'Your own situation (custom)',
        icon: '✨',
        prompt: null,
        starter:
          'Tell me what situation you want to practise (e.g. "I am travelling to Canada and need help at the airport"), and I will play the other role.',
      },
    ],
  },
  writing: {
    title: 'Writing · Real formats',
    description:
      'Practise WhatsApp, work emails, articles and other formats with feedback from Dralo.',
    scenarios: [
      {
        id: 'sms-whatsapp',
        label: 'SMS / WhatsApp',
        icon: '💬',
        ui: 'whatsapp',
        hint: 'Short messages with natural acronyms (OMG, BTW, FYI…).',
      },
      {
        id: 'work-email',
        label: 'Work email',
        icon: '📧',
        hint: 'Formal or semi-formal: requests, apologies, meetings.',
      },
      {
        id: 'article',
        label: 'Article / blog',
        icon: '📰',
        hint: 'Opinion piece or review for a website or school magazine.',
      },
      {
        id: 'social-post',
        label: 'Social media',
        icon: '📱',
        hint: 'Short post or thread (LinkedIn, Instagram caption…).',
      },
      {
        id: 'formal-letter',
        label: 'Formal letter',
        icon: '✉️',
        hint: 'Complaint, request or cover letter.',
      },
    ],
  },
  listening: {
    title: 'Listening · Real-world situations',
    description: 'Authentic audio: announcements, podcasts, phone calls and short news.',
    scenarios: [
      { id: 'airport-announcement', label: 'Airport announcements', icon: '📢' },
      { id: 'podcast-snippet', label: 'Podcast clip', icon: '🎙️' },
      { id: 'customer-service', label: 'Customer service call', icon: '☎️' },
      { id: 'news-bulletin', label: 'Short news bulletin', icon: '📻' },
      { id: 'work-meeting', label: 'Work meeting (extract)', icon: '👥' },
    ],
  },
  reading: {
    title: 'Reading · Authentic texts',
    description: 'Blogs, adverts, reviews and threads — read like in real life.',
    scenarios: [
      { id: 'travel-blog', label: 'Travel blog', icon: '🧳' },
      { id: 'job-adverts', label: 'Job adverts', icon: '💼' },
      { id: 'product-reviews', label: 'Product reviews', icon: '⭐' },
      { id: 'social-thread', label: 'Social media thread', icon: '💬' },
      { id: 'how-to-guide', label: 'How-to guide', icon: '📋' },
    ],
  },
  'use-of-english': {
    title: 'Use of English · Everyday language',
    description: 'Emails, signs, chats and workplace notes — grammar in real context.',
    scenarios: [
      { id: 'work-email-uoe', label: 'Emails (tone & linkers)', icon: '📧' },
      { id: 'signs-notices', label: 'Signs & public notices', icon: '🪧' },
      { id: 'chat-messages', label: 'Chat messages', icon: '💬' },
      { id: 'workplace-memo', label: 'Internal workplace notes', icon: '📝' },
      { id: 'form-filling', label: 'Forms & application sheets', icon: '📄' },
    ],
  },
};

export function getSkillConfig(modeId) {
  return DRALO_AI_SITUATIONAL[modeId] || null;
}
