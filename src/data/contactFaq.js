/**
 * Static FAQ entries for the Contact page (English).
 * @typedef {{ id: string, question: string, answer: string, topic: string, quickLink?: { href: string, label: string } }} ContactFaqItem
 */

/** @type {ContactFaqItem[]} */
export const CONTACT_FAQ_ITEMS = [
  {
    id: 'account-create',
    topic: 'Account & login',
    question: 'How do I create an account?',
    answer:
      'Go to Sign up, enter your email and password, and confirm your address if prompted. Once logged in, complete your profile under My Profile so we can personalise your experience.',
    quickLink: { href: '/registro', label: 'Sign up' },
  },
  {
    id: 'account-password',
    topic: 'Account & login',
    question: 'I forgot my password — what should I do?',
    answer:
      'Use the “Forgot password?” link on the login page. You will receive an email with a secure link to set a new password. If the email does not arrive, check your spam folder or open a support ticket.',
    quickLink: { href: '/login', label: 'Login & recovery' },
  },
  {
    id: 'account-profile',
    topic: 'Account & login',
    question: 'Where can I update my personal details?',
    answer:
      'Open My Profile from the menu. You can change your name, avatar, preferred language, study goals, and account security settings from the different profile tabs.',
    quickLink: { href: '/perfil', label: 'My Profile' },
  },
  {
    id: 'payments-plans',
    topic: 'Payments & subscriptions',
    question: 'What subscription plans are available?',
    answer:
      'Visit the Pricing page to compare plans, included levels, and features. Online card payments will be enabled as soon as Stripe is connected; until then, contact support if you need help with access.',
    quickLink: { href: '/precios', label: 'View pricing' },
  },
  {
    id: 'payments-billing',
    topic: 'Billing & invoices',
    question: 'I have a billing or invoice question — who do I contact?',
    answer:
      'Open a support ticket and choose “Billing & invoices” or “Payments & subscriptions”. Include your account email and, if possible, the date and amount of the charge so we can help faster.',
  },
  {
    id: 'platform-exam-practice',
    topic: 'Platform usage',
    question: 'What is the difference between Exam practice and Exam theory?',
    answer:
      'Exam practice lets you train by skill (Reading, Writing, Listening, Speaking) or run full exam-style sessions. Exam theory covers the grammar and strategies you need for each exam part — find it under Exam theory in the main menu or on the levels hub.',
    quickLink: { href: '/niveles', label: 'Exam practice hub' },
  },
  {
    id: 'platform-placement',
    topic: 'Platform usage',
    question: 'How does the Placement Test work?',
    answer:
      'The Placement Test estimates your CEFR level (A1–C2) from a short adaptive session. Your result is saved to your profile and helps suggest suitable content. You can retake it from the Placement Test page.',
    quickLink: { href: '/prueba-nivel', label: 'Placement Test' },
  },
  {
    id: 'exams-exam-mode',
    topic: 'Exams & practice',
    question: 'What is Exam mode?',
    answer:
      'Exam mode simulates real exam conditions: timed sections, no instant feedback during the session, and a review step at the end. Use skill practice for everyday training; use Exam mode when you want a full mock run.',
    quickLink: { href: '/niveles', label: 'Start exam practice' },
  },
  {
    id: 'exams-skill-stars',
    topic: 'Exams & practice',
    question: 'What do the stars mean in skill practice?',
    answer:
      'In skill practice, each exercise variant shows up to three stars based on your saved score for that part. One star means you passed the threshold; three stars means a strong result. Scores are stored when you complete and submit an exercise.',
  },
  {
    id: 'levels-progress',
    topic: 'Levels & progress',
    question: 'Where is my progress saved?',
    answer:
      'Your answers, scores, and exam statistics are stored in your account when you are signed in. Check My Profile → General statistics and Exam statistics for an overview of completed activities and estimated level.',
    quickLink: { href: '/perfil', label: 'View progress' },
  },
  {
    id: 'levels-training',
    topic: 'Levels & progress',
    question: 'What is Training and how is it different from levels?',
    answer:
      'Training offers extra drills and topic-based practice outside the formal exam papers. Levels focus on Cambridge-style exam parts (B2, C1, etc.). Both contribute to your learning — use Training for quick revision and Levels for exam preparation.',
    quickLink: { href: '/training', label: 'Open Training' },
  },
  {
    id: 'theory-access',
    topic: 'Theory & exercises',
    question: 'Where can I find grammar and exam theory?',
    answer:
      'General theory topics live under Theory (admin access on the home page). Exam-specific theory for each level is available from Exam theory in the top menu or via the levels hub for the part you are studying.',
    quickLink: { href: '/niveles?tab=theory', label: 'Exam theory' },
  },
  {
    id: 'theory-report-error',
    topic: 'Bug report',
    question: 'I found a mistake in an exercise — how do I report it?',
    answer:
      'Many theory and practice screens include a “Report error” option. Use it to send the exercise details to support automatically. You can also open a ticket and choose “Bug report”, describing the level, part, and what looks wrong.',
  },
  {
    id: 'dralo-ai-access',
    topic: 'Dralo AI',
    question: 'Is Dralo AI available for all users?',
    answer:
      'Dralo AI tools (Writing, Listening, Speaking Coach, and more) are being rolled out gradually. Students currently see the menu with a “Coming soon” label; staff roles may have early access. Open a ticket under “Dralo AI” if you need clarification for your account.',
    quickLink: { href: '/dralo-ai', label: 'Dralo AI hub' },
  },
  {
    id: 'technical-issues',
    topic: 'Technical issue',
    question: 'A page will not load or audio will not play — what can I try?',
    answer:
      'Refresh the page, sign out and back in, and try another browser (Chrome or Edge recommended). For listening tasks, check your device volume and that the tab is not muted. If the problem continues, open a ticket under “Technical issue” with your browser and device.',
  },
  {
    id: 'support-ticket',
    topic: 'Platform usage',
    question: 'How do I contact support?',
    answer:
      'Use the Support form on this page: pick a topic, write a clear subject and description, and submit. You must be signed in. You can track open tickets in the “My tickets” table below the form.',
  },
  {
    id: 'support-response-time',
    topic: 'Platform usage',
    question: 'How long does support take to reply?',
    answer:
      'We aim to respond within 48 hours on business days. You will receive a confirmation email when your ticket is registered (for student accounts). Urgent access issues — mention them in the subject line.',
  },
  {
    id: 'privacy-data',
    topic: 'Privacy & data',
    question: 'Where can I read the privacy policy and terms?',
    answer:
      'Legal documents are linked from the site footer. They explain what data we collect, how long we keep it, and how to exercise your rights under GDPR.',
    quickLink: { href: '/politica-privacidad', label: 'Privacy policy' },
  },
  {
    id: 'teacher-access',
    topic: 'Teacher / class access',
    question: 'I am a teacher — how do I manage my students?',
    answer:
      'Teachers and coordinators have dedicated panels to view classes, assign content, and create student accounts. If your role should include teacher access but you do not see it, contact support with your centre name and email.',
    quickLink: { href: '/teacher', label: 'Teacher panel' },
  },
];

/** Unique topics present in the FAQ list, in display order. */
export const CONTACT_FAQ_TOPIC_ORDER = [
  'All',
  ...Array.from(new Set(CONTACT_FAQ_ITEMS.map((item) => item.topic))),
];
