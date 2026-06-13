/** Strategy tips específicos por parte — Reading and Use of English practice. */

export const strategyTipsByPart = {
  1: {
    title: 'Part 1: Multiple-choice cloze strategy',
    strategyPoints: [
      'Read the whole sentence before choosing.',
      'Look before and after the gap.',
      'Check collocations: make / do / take / get.',
      'Think about grammar: prepositions, verb patterns, noun/adjective forms.',
      'Eliminate answers that sound possible but do not fit the exact phrase.',
      'Do not spend more than 1 minute on one gap.',
    ],
    commonTraps: [
      'Similar meanings but different usage.',
      'Fixed expressions.',
      'Phrasal verbs.',
      'Prepositions after verbs/adjectives.',
      'False friends.',
    ],
    timing: 'Aim: 8 questions in 8–10 minutes.',
    exampleExplanation:
      '"take a break" is a fixed expression. We do not usually say "make a break" or "do a break".',
    lookFor: [
      'Words immediately before and after the gap.',
      'Fixed expressions and phrasal verbs.',
      'Dependent prepositions (interested in, responsible for…).',
    ],
    studyTip:
      'Keep a collocations notebook: when you fail a question, write the full phrase, not just the word.',
  },
  2: {
    title: 'Part 2: Open cloze strategy',
    strategyPoints: [
      'Decide what type of word fits the gap first: article, preposition, pronoun, linker, auxiliary.',
      'Only one word is allowed per gap.',
      'Read the full sentence to check grammar, not just meaning.',
    ],
    commonTraps: [
      'Writing content words when a grammar word is needed.',
      'Using two words in one gap.',
      'Ignoring linkers between ideas.',
    ],
    timing: 'Aim: 8 questions in 8–10 minutes.',
    exampleExplanation:
      'After "has" you often need an auxiliary or pronoun — e.g. "has been" or "has it".',
    lookFor: ['Verb patterns', 'Relative pronouns', 'Linkers (although, despite, however).'],
    studyTip: 'Identify the word class of each gap before answering.',
  },
  3: {
    title: 'Part 3: Word formation strategy',
    strategyPoints: [
      'Decide the word class needed: noun, adjective, adverb, or verb.',
      'Transform the given word with prefixes and suffixes.',
      'Check whether the meaning needs a negative form.',
    ],
    commonTraps: [
      'Missing negative prefixes (un-, im-, dis-).',
      'Right family word, wrong class (succeed/success/successful).',
      'Forgetting plural -s on nouns.',
    ],
    timing: 'Aim: 8 questions in 8–10 minutes.',
    exampleExplanation:
      'If the sentence needs a person who does something, use -er/-ist (e.g. employ → employer).',
    lookFor: ['a/the → noun', 'very → adjective/adverb', 'Negative meaning in the sentence.'],
    studyTip: 'Build word-family tables for common B2 roots.',
  },
  4: {
    title: 'Part 4: Key word transformations strategy',
    strategyPoints: [
      'Keep the meaning identical and use the key word without changing it.',
      'Count your words: between two and five.',
      'Identify the grammar point: passive, reported speech, conditionals, comparatives.',
    ],
    commonTraps: [
      'Changing the key word or its form.',
      'Writing more than five words.',
      'Keeping only part of the original meaning.',
    ],
    timing: 'Aim: 6 transformations in 10–12 minutes.',
    exampleExplanation:
      'Passive transformations often need "be + past participle" with the same tense as the original.',
    lookFor: ['Verb tense consistency', 'Unless/if, so/such, too/enough patterns.'],
    studyTip: 'Revise classic transformation patterns before practice.',
  },
  5: {
    title: 'Part 5: Multiple choice reading strategy',
    strategyPoints: [
      'Read the text first for general meaning.',
      'Find the exact part of the text each question refers to.',
      'Check every option against the text before choosing.',
    ],
    commonTraps: [
      'Options that reuse words from the text but change the meaning.',
      'Answering from opinion instead of what the writer says.',
      'Rushing reference and global-meaning questions.',
    ],
    timing: 'Aim: 6 questions in 10–12 minutes.',
    exampleExplanation:
      'The correct option usually paraphrases the text — same idea, different words.',
    lookFor: ['Paraphrase', 'Attitude verbs', 'Reference words (this, it, them).'],
    studyTip: 'Underline evidence in the text before selecting.',
  },
  6: {
    title: 'Part 6: Gapped text strategy',
    strategyPoints: [
      'Read around each gap carefully.',
      'The missing sentence must connect grammatically and logically.',
      'Use pronouns and linkers as clues.',
    ],
    commonTraps: [
      'Right topic, wrong logical chain.',
      'Ignoring pronouns at the start of options.',
      'Not re-reading after placing a sentence.',
    ],
    timing: 'Aim: 6 gaps in 10–12 minutes.',
    exampleExplanation:
      'If an option starts with "This", the previous sentence must introduce what "This" refers to.',
    lookFor: ['Pronouns at option starts', 'Time markers', 'Contrast linkers.'],
    studyTip: 'Read the whole text once more after completing all gaps.',
  },
  7: {
    title: 'Part 7: Multiple matching strategy',
    strategyPoints: [
      'Read the questions first and underline key ideas.',
      'Scan each text for paraphrases — do not read every text in depth.',
      'Remember one text can match more than one question.',
    ],
    commonTraps: [
      'Matching by repeated words instead of meaning.',
      'Spending too long reading texts fully.',
      'Missing that two texts mention the topic but only one matches exactly.',
    ],
    timing: 'Aim: about 1 minute per question.',
    exampleExplanation:
      'A question about who "felt disappointed" needs an opinion, not just a mention of disappointment.',
    lookFor: ['Synonyms and paraphrases', 'Opinions vs facts', 'Distractor texts.'],
    studyTip: 'Time yourself and re-check doubtful matches at the end.',
  },
};

/**
 * @param {number} partNumber
 */
export function getReadingPracticeStrategyTips(partNumber) {
  return strategyTipsByPart[Number(partNumber)] || null;
}
