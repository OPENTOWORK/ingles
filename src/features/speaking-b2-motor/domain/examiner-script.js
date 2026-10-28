/**
 * Approved SP-EX001 Part 1 examiner wording. Every line the examiner speaks is either
 * one of these pieces or a bank question / follow-up, optionally preceded by lead-ins.
 */
import { SPEAKING_B2_EXAMINERS, SPEAKING_B2_INTRODUCTION } from './question-bank/sp-ex001-part1.js';

export const SPEAKING_B2_GREETINGS = {
  morning: 'Good morning.',
  afternoon: 'Good afternoon.',
  evening: 'Good evening.',
  neutral: 'Hello.',
};

export const SPEAKING_B2_INTRO_TEMPLATES = [
  "{greeting} My name is {name}. What's your name?",
  "{greeting} I'm {name}, and I'll be your examiner today. Could you tell me your name, please?",
  "{greeting} My name's {name}. Can you tell me your name, please?",
  "{greeting} I'm {name}. And what's your name?",
  "{greeting} I'm {name}, and I'm going to ask you a few questions about yourself. What's your name?",
];

export const SPEAKING_B2_AFTER_NAME_LEADS = ['Thank you.', 'Nice to meet you.', 'Thanks.'];

export const SPEAKING_B2_ACKNOWLEDGEMENTS = [
  'Thank you.',
  'Thanks.',
  'Right.',
  'OK, thank you.',
  'All right.',
  'Thanks very much.',
];

export const SPEAKING_B2_TOPIC_TRANSITIONS = [
  "First of all, I'd like to know something about you.",
  "Now I'd like to ask you a few questions about yourself.",
  "Let's talk about you a little.",
];

export const SPEAKING_B2_CLOSINGS = [
  SPEAKING_B2_INTRODUCTION.closingText,
  "Thank you very much. That's the end of Part 1.",
  "Thanks. That's the end of Part 1 of the test.",
];

export const SPEAKING_B2_REASK_LEADS = ['Could you say that again?', 'Please answer in English.'];

/** Longest first so a longer lead-in is never cut short by a shorter one. */
export const SPEAKING_B2_LEAD_INS = [
  ...new Set([
    ...SPEAKING_B2_AFTER_NAME_LEADS,
    ...SPEAKING_B2_ACKNOWLEDGEMENTS,
    ...SPEAKING_B2_TOPIC_TRANSITIONS,
    ...SPEAKING_B2_REASK_LEADS,
  ]),
].sort((a, b) => b.length - a.length);

export const SPEAKING_B2_EXAMINER_VOICE_INSTRUCTIONS = [
  'Voice: a friendly, professional Cambridge English speaking examiner talking to one candidate across a table.',
  'Accent: natural Southern British English (standard RP). Never American.',
  'Tone: warm, calm and encouraging, but neutral. Never theatrical or overexcited.',
  'Pacing: relaxed conversational speed, with short natural pauses between sentences.',
  'Delivery: natural rhythm and intonation, like a real person speaking rather than reading aloud.',
].join(' ');

export function normaliseSpeakingB2Line(text) {
  return String(text || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function composeSpeakingB2Intro(template, greeting, name) {
  return template.replace('{greeting}', greeting).replace('{name}', name);
}

export function listSpeakingB2IntroLines() {
  const lines = [SPEAKING_B2_INTRODUCTION.spokenText];
  for (const greeting of Object.values(SPEAKING_B2_GREETINGS)) {
    for (const examiner of SPEAKING_B2_EXAMINERS) {
      for (const template of SPEAKING_B2_INTRO_TEMPLATES) {
        lines.push(composeSpeakingB2Intro(template, greeting, examiner.name));
      }
    }
  }
  return lines;
}
