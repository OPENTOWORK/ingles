/**
 * B1 Preliminary Reading generation specification.
 * Topic headings follow the Cambridge B1 Preliminary vocabulary list supplied for this project.
 * Grammar areas follow the Cambridge B1 Preliminary handbook language specification.
 */
export const B1_TOPIC_CATEGORIES = [
  'Clothes and Accessories','Colours','Communications and Technology','Education',
  'Entertainment and Media','Environment','Food and Drink','Health, Medicine and Exercise',
  'Hobbies and Leisure','House and Home','Language','Personal Feelings, Opinions and Experiences',
  'Places: Buildings','Places: Countryside','Places: Town and City','Services','Shopping','Sport',
  'The Natural World','Time','Travel and Transport','Weather','Work and Jobs',
];

export const B1_GRAMMAR_AREAS = [
  'present simple and present continuous',
  'present perfect simple',
  'past simple and past continuous',
  'future with going to, will and shall',
  'modals: ability, permission, requests, advice, possibility and obligation',
  'infinitives and gerunds',
  'present and past simple passive',
  'modal passive',
  'verb + object + infinitive and double-object patterns',
  'causative have/get',
  'phrasal verbs and verbs with prepositions',
  'zero, first and second conditionals',
  'simple reported speech',
  'indirect and embedded questions',
  'relative pronouns and relative clauses',
  'countable/uncountable nouns and quantifiers',
  'articles and determiners',
  'comparatives and superlatives',
  'adverbs and adjective order',
  'prepositions and prepositional phrases',
  'connectives and sequencing',
];

export const B1_PART_CONTEXT_FAMILIES = {
  1: ['notice','message','email','sign','advert','instruction'],
  2: ['websites','courses','events','services','places','products','activities','reviews'],
  3: ['profile','personal experience','magazine article','blog article','interview-style feature'],
  4: ['narrative article','personal experience','informative article','historical account','process/explanation'],
  5: ['informative article','short feature','everyday factual text','popular-interest article'],
  6: ['email','blog post','short article','personal message','review','informative text'],
};

export function buildB1TwentyExamAllocation() {
  return Array.from({ length: 20 }, (_, examIndex) => {
    const examNumber = examIndex + 1;
    const parts = Array.from({ length: 6 }, (_, partIndex) => {
      const partNumber = partIndex + 1;
      // Walk the 120 part slots through all 23 topics using a coprime stride.
      // This gives six distinct topics per exam and an overall 5–6 uses per topic.
      const flatSlot = examIndex * 6 + partIndex;
      const topicIndex = (flatSlot * 5) % B1_TOPIC_CATEGORIES.length;
      const contexts = B1_PART_CONTEXT_FAMILIES[partNumber];
      const contextIndex = (examIndex + partIndex * 2) % contexts.length;
      const grammarIndex = (examIndex * 3 + partIndex * 5) % B1_GRAMMAR_AREAS.length;
      return {
        examNumber,
        partNumber,
        topicId: `b1-topic-${String(topicIndex + 1).padStart(2, '0')}`,
        topic: B1_TOPIC_CATEGORIES[topicIndex],
        contextId: `b1-p${partNumber}-context-${contextIndex + 1}`,
        context: contexts[contextIndex],
        grammarFocus: partNumber === 6 ? B1_GRAMMAR_AREAS[grammarIndex] : null,
      };
    });
    return { examNumber, parts };
  });
}

export function validateB1TwentyExamAllocation(plan = buildB1TwentyExamAllocation()) {
  const errors = [];
  if (plan.length !== 20) errors.push(`Expected 20 exams, got ${plan.length}.`);
  const topicCounts = new Map(B1_TOPIC_CATEGORIES.map((t) => [t, 0]));
  plan.forEach((exam, ei) => {
    if (exam.parts?.length !== 6) errors.push(`Exam ${ei + 1} must contain six Reading parts.`);
    const topics = new Set();
    for (const part of exam.parts || []) {
      if (topics.has(part.topic)) errors.push(`Exam ${ei + 1} repeats topic "${part.topic}".`);
      topics.add(part.topic);
      topicCounts.set(part.topic, (topicCounts.get(part.topic) || 0) + 1);
    }
  });
  const counts = [...topicCounts.values()];
  if (counts.length) {
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max - min > 1) errors.push(`Topic allocation is imbalanced (min ${min}, max ${max}).`);
  }
  return { ok: errors.length === 0, errors, topicCounts: Object.fromEntries(topicCounts) };
}
