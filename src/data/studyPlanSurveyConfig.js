/** Study plan survey config (student flow after placement test). */

export const STUDY_PLAN_GOALS = [
  { id: 'travel', name: 'Travel and communicate' },
  { id: 'work', name: 'Professional English' },
  { id: 'study', name: 'Academic studies' },
  { id: 'exam', name: 'Pass a Cambridge exam' },
  { id: 'conversation', name: 'Fluent conversation' },
  { id: 'hobby', name: 'Personal learning' },
];

export const STUDY_PLAN_SKILLS = [
  { id: 'listening', name: 'Listening' },
  { id: 'reading', name: 'Reading' },
  { id: 'writing', name: 'Writing' },
  { id: 'speaking', name: 'Speaking' },
  { id: 'use_of_english', name: 'Use of English / Grammar' },
  { id: 'vocabulary', name: 'Vocabulary' },
];

export const STUDY_PLAN_HOUR_OPTIONS = [
  { value: 3, label: '3 h', hint: 'Light pace' },
  { value: 5, label: '5 h', hint: 'Recommended minimum' },
  { value: 7, label: '7 h', hint: '1 h per day' },
  { value: 10, label: '10 h', hint: 'Intensive' },
  { value: 15, label: '15 h', hint: 'Very intensive' },
  { value: 20, label: '20+ h', hint: 'Full preparation' },
];

export const STUDY_PLAN_SURVEY_STEPS = [
  {
    id: 'goals',
    title: 'What do you want to achieve?',
    desc: 'Choose one or more goals for your English.',
  },
  {
    id: 'hours',
    title: 'Real study time',
    desc: 'How many hours can you realistically dedicate each week?',
  },
  {
    id: 'exam',
    title: 'Exam date',
    desc: 'When would you like to take the exam? (approximate)',
  },
  {
    id: 'strengths',
    title: 'Your strengths',
    desc: 'Which skills do you feel most comfortable with?',
  },
  {
    id: 'weaknesses',
    title: 'Areas to improve',
    desc: 'Which skills do you want to prioritise in your plan?',
  },
  {
    id: 'notes',
    title: 'Anything else',
    desc: 'Schedules, constraints or comments (optional).',
  },
];
