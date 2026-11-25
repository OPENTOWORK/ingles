import { B1_PART4_COHESION_DEVICES, B1_PART5_PASSAGE_LIMITS } from './limits.js';

const PART4_DEVICE_PLACEHOLDER = '<a device this sentence actually uses>';

export function b1Part4PlanExample() {
  return {
    title: 'short natural title',
    chunks: [
      'text before gap 16',
      'text between gaps 16 and 17',
      'text between gaps 17 and 18',
      'text between gaps 18 and 19',
      'text between gaps 19 and 20',
      'text after gap 20',
    ],
    removedSentences: [16, 17, 18, 19, 20].map((number) => ({
      number,
      sentence: 'complete sentence',
      cohesion: PART4_DEVICE_PLACEHOLDER,
      cohesionNote: 'why this sentence fits only this gap',
    })),
    extras: [1, 2, 3].map(() => ({
      sentence: 'topic-plausible extra sentence',
      rejectionReason: 'why it fits none of the five gaps',
    })),
  };
}

export function b1Part5PlanExample(lexicalPlan = []) {
  const rows = Array.isArray(lexicalPlan) ? lexicalPlan : [];
  return {
    title: 'short natural title',
    markedPassage: `one multi-sentence passage of ${B1_PART5_PASSAGE_LIMITS.targetMin}-${B1_PART5_PASSAGE_LIMITS.targetMax} completed words about a single situation, containing [[21:word]] ... [[26:word]] in reading order`,
    items: rows.map((item) => ({
      number: item.number,
      answer: '<one word>',
      targetType: item.type,
      distractors: ['<one word>', '<one word>', '<one word>'],
      rejectionReasons: [
        'why distractor 1 fails in this exact sentence',
        'why distractor 2 fails in this exact sentence',
        'why distractor 3 fails in this exact sentence',
      ],
    })),
  };
}

export function b1Part6PlanExample(targets = []) {
  const rows = Array.isArray(targets) ? targets : [];
  return {
    title: 'short natural title',
    markedPassage: 'a short everyday text containing [[27:word]] ... [[32:word]] in reading order',
    items: rows.map((target) => ({
      number: target.number,
      answer: '<one allowed word>',
      targetType: target.type,
    })),
  };
}

export function b1Part4DevicePlaceholder() {
  return PART4_DEVICE_PLACEHOLDER;
}

export function b1Part4DeviceNames() {
  return [...B1_PART4_COHESION_DEVICES];
}
