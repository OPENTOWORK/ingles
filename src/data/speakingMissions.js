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
  {
    id: 'clothes-shop',
    title: 'Clothes shop',
    icon: '👕',
    description: 'Find the right size and change an item.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'clothes-shop',
    character: 'Shop Assistant',
    scenario:
      'You bought a shirt that is the wrong size. Ask to try another size, exchange it and check the returns policy.',
    objectives: [
      'Explain the problem with the item',
      'Ask for another size',
      'Ask about the returns policy',
      'Confirm the exchange',
    ],
  },
  {
    id: 'train-station',
    title: 'Train station',
    icon: '🚆',
    description: 'Catch the next train after a delay.',
    recommendedLevel: 'A2-B2',
    estimatedXp: 110,
    backgroundStyle: 'train-station',
    character: 'Station Staff',
    scenario:
      'You have missed your train. Ask which train leaves next, whether your ticket is still valid and where to wait.',
    objectives: [
      'Explain that you missed the train',
      'Ask for the next departure',
      'Check if your ticket is still valid',
      'Confirm the platform and time',
    ],
  },
  {
    id: 'flat-viewing',
    title: 'Flat viewing',
    icon: '🏠',
    description: 'Ask about a room and the rent.',
    recommendedLevel: 'B1-B2',
    estimatedXp: 120,
    backgroundStyle: 'flat-viewing',
    character: 'Landlord',
    scenario:
      'You are viewing a flat you might rent. Ask about the rent, the bills, the neighbours and when you could move in.',
    objectives: [
      'Ask about the rent and the deposit',
      'Ask what the bills include',
      'Ask about the area and the neighbours',
      'Say whether you are interested',
    ],
  },
  {
    id: 'phone-complaint',
    title: 'Phone complaint',
    icon: '📞',
    description: 'Explain a problem and ask for a fix.',
    recommendedLevel: 'B1-C1',
    estimatedXp: 130,
    backgroundStyle: 'phone-complaint',
    character: 'Customer Service Agent',
    scenario:
      'You are calling a company because you were charged twice. Explain the problem, give your details and ask them to correct it.',
    objectives: [
      'Say why you are calling',
      'Give your account details',
      'Ask them to correct the charge',
      'Confirm what happens next',
    ],
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    icon: '💊',
    description: 'Ask for something for a minor illness.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'pharmacy',
    character: 'Pharmacist',
    scenario:
      'You have a sore throat and a headache. Ask the pharmacist what you can take, how often, and whether you need to see a doctor.',
    objectives: [
      'Describe how you feel',
      'Ask what you can take',
      'Ask how often to take it',
      'Ask if you should see a doctor',
    ],
  },
  {
    id: 'tourist-info',
    title: 'Tourist information',
    icon: '🗺️',
    description: 'Plan a day out and ask for advice.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 100,
    backgroundStyle: 'tourist-info',
    character: 'Tourist Information Officer',
    scenario:
      'You have one free day in a city you do not know. Ask what to visit, how to get there and what it costs.',
    objectives: [
      'Say how much time you have',
      'Ask what is worth visiting',
      'Ask how to get there',
      'Ask about prices and opening times',
    ],
  },
  {
    id: 'neighbour',
    title: 'Neighbour',
    icon: '🚪',
    description: 'Talk about a problem next door.',
    recommendedLevel: 'B1-B2',
    estimatedXp: 110,
    backgroundStyle: 'neighbour',
    character: 'Neighbour',
    scenario:
      'The neighbour upstairs plays loud music at night. Knock on the door, explain the problem politely and agree on a solution.',
    objectives: [
      'Explain the problem politely',
      'Say how it affects you',
      'Suggest a solution',
      'Agree on what you will both do',
    ],
  },
  {
    id: 'taxi',
    title: 'Taxi',
    icon: '🚕',
    description: 'Give directions and sort out the fare.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 90,
    backgroundStyle: 'taxi',
    character: 'Taxi Driver',
    scenario:
      'You need a taxi to the station. Say where you are going, ask how long it takes and check the fare when you arrive.',
    objectives: [
      'Say where you want to go',
      'Ask how long it will take',
      'Ask the driver to stop in the right place',
      'Check the fare and pay',
    ],
  },
  {
    id: 'university',
    title: 'University',
    icon: '🎓',
    description: 'Ask about a course and how to join.',
    recommendedLevel: 'B1-C1',
    estimatedXp: 130,
    backgroundStyle: 'university',
    character: 'Course Adviser',
    scenario:
      'You want to join an evening course. Ask what the course covers, when it starts and what you need to enrol.',
    objectives: [
      'Say which course you are interested in',
      'Ask what the course includes',
      'Ask about the timetable',
      'Ask how to enrol',
    ],
  },
  {
    id: 'supermarket',
    title: 'Supermarket',
    icon: '🛒',
    description: 'Find an item and solve a checkout problem.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 90,
    backgroundStyle: 'supermarket',
    character: 'Shop Assistant',
    scenario:
      'You cannot find an item, and at the checkout the price is wrong. Ask for help and get the price corrected.',
    objectives: [
      'Ask where something is',
      'Ask if it is in stock',
      'Point out the wrong price',
      'Confirm the final amount',
    ],
  },
  {
    id: 'cinema',
    title: 'Cinema',
    icon: '🎬',
    description: 'Book tickets and choose seats.',
    recommendedLevel: 'A2-B1',
    estimatedXp: 90,
    backgroundStyle: 'cinema',
    character: 'Box Office Clerk',
    scenario:
      'You want tickets for a film tonight. Ask what is on, choose a time and seats, and pay.',
    objectives: [
      'Ask what is showing',
      'Choose a time',
      'Ask for seats together',
      'Confirm the price and pay',
    ],
  },
  {
    id: 'bank',
    title: 'Bank',
    icon: '🏦',
    description: 'Ask about an account and a card.',
    recommendedLevel: 'B1-B2',
    estimatedXp: 120,
    backgroundStyle: 'bank',
    character: 'Bank Adviser',
    scenario:
      'Your card has been blocked. Explain what happened, prove who you are and ask how to use your account again.',
    objectives: [
      'Explain that your card is blocked',
      'Confirm your identity',
      'Ask why it was blocked',
      'Ask how to get a new card',
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
  'clothes-shop': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
  'train-station': 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
  'flat-viewing': 'linear-gradient(135deg, #65a30d 0%, #0d9488 100%)',
  'phone-complaint': 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  pharmacy: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)',
  'tourist-info': 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
  neighbour: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
  taxi: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
  university: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
  supermarket: 'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)',
  cinema: 'linear-gradient(135deg, #6d28d9 0%, #be185d 100%)',
  bank: 'linear-gradient(135deg, #0f766e 0%, #1e3a8a 100%)',
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
