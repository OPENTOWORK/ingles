/**
 * Real-life roleplay missions for the Dralo AI Speaking Coach.
 * Each mission drives the scenario, objectives and visual theme of the panel.
 */
export const SPEAKING_MISSIONS = [
  {
    id: 'airport',
    title: 'Airport',
    icon: '✈️',
    description: 'Solve travel problems and ask for help.',
    recommendedLevel: 'A2-B2',
    estimatedXp: 120,
    backgroundStyle: 'airport',
    character: 'Airport Agent',
    scenario:
      'Your flight has been cancelled. You need to ask what happened, request another flight and confirm the new departure time.',
    objectives: [
      'Ask what happened',
      'Request another flight',
      'Ask about compensation or alternatives',
      'Confirm the new departure time',
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    icon: '🍽️',
    description: 'Order food, ask questions and solve problems.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'restaurant',
    character: 'Restaurant Waiter',
    scenario:
      'You are having dinner at a busy restaurant. Order your food, ask about the menu and politely solve a small problem with your order.',
    objectives: [
      'Ask for a table and the menu',
      'Order food and drinks politely',
      'Ask a question about a dish',
      'Ask for the bill at the end',
    ],
  },
  {
    id: 'hotel',
    title: 'Hotel',
    icon: '🏨',
    description: 'Check in and sort out your stay.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'hotel',
    character: 'Hotel Receptionist',
    scenario:
      'You arrive at a hotel for a two-night stay. Check in, ask about the facilities and report a small problem with your room.',
    objectives: [
      'Check in with your booking',
      'Ask about breakfast and facilities',
      'Report a problem with your room',
      'Ask about check-out time',
    ],
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    icon: '💼',
    description: 'Answer interview questions with confidence.',
    recommendedLevel: 'B1-C1',
    estimatedXp: 150,
    backgroundStyle: 'job-interview',
    character: 'Emma - HR Interviewer',
    scenario:
      'You are in a job interview for a role you really want. Introduce yourself, talk about your experience and explain why you are a good fit.',
    objectives: [
      'Introduce yourself clearly',
      'Talk about your experience',
      'Explain your strengths with an example',
      'Ask a smart question at the end',
    ],
  },
  {
    id: 'work-meeting',
    title: 'Work Meeting',
    icon: '🧑‍💼',
    description: 'Share ideas and agree on next steps.',
    recommendedLevel: 'B2-C1',
    estimatedXp: 140,
    backgroundStyle: 'work-meeting',
    character: 'Mike - Work Colleague',
    scenario:
      'You are in a team meeting discussing a project that is running late. Share your opinion, respond to a colleague and agree on a clear next step.',
    objectives: [
      'Give your opinion on the project',
      'Agree or disagree politely',
      'Suggest a concrete next action',
      'Confirm who does what',
    ],
  },
  {
    id: 'making-friends',
    title: 'Making Friends',
    icon: '🤝',
    description: 'Start a chat and build a connection.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'making-friends',
    character: 'Sarah - British Friend',
    scenario:
      'You meet someone new at a friend\u2019s party. Start a friendly conversation, find something in common and suggest meeting again.',
    objectives: [
      'Start a friendly conversation',
      'Talk about your interests',
      'Find something in common',
      'Suggest meeting again',
    ],
  },
  {
    id: 'travel-problem',
    title: 'Travel Problem',
    icon: '🧳',
    description: 'Stay calm and find a solution.',
    recommendedLevel: 'A2-B2',
    estimatedXp: 120,
    backgroundStyle: 'travel-problem',
    character: 'Travel Assistant',
    scenario:
      'You are abroad and your luggage has not arrived. Explain the problem, give your details and ask what happens next.',
    objectives: [
      'Explain what went wrong',
      'Give your booking details',
      'Ask for a solution',
      'Confirm the next steps',
    ],
  },
  {
    id: 'doctor',
    title: 'Doctor',
    icon: '🩺',
    description: 'Describe symptoms and understand advice.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 110,
    backgroundStyle: 'doctor',
    character: 'Doctor',
    scenario:
      'You feel unwell and visit the doctor. Describe your symptoms, answer the doctor\u2019s questions and understand the advice you are given.',
    objectives: [
      'Describe your symptoms clearly',
      'Answer the doctor\u2019s questions',
      'Ask about treatment',
      'Understand the next steps',
    ],
  },
];

export const SPEAKING_MISSION_BACKGROUNDS = {
  airport: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  restaurant: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)',
  hotel: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'job-interview': 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)',
  'work-meeting': 'linear-gradient(135deg, #0d9488 0%, #4f46e5 100%)',
  'making-friends': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'travel-problem': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  doctor: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
};

export function getMissionBackground(backgroundStyle) {
  return (
    SPEAKING_MISSION_BACKGROUNDS[backgroundStyle] ||
    'linear-gradient(135deg, #6366f1 0%, #db2777 100%)'
  );
}

export function getMissionById(id) {
  return SPEAKING_MISSIONS.find((m) => m.id === id) || null;
}
