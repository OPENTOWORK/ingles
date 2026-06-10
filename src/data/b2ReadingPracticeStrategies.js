/** Strategy & tips for B2 Reading and Use of English practice (Parts 1–7). */

const STRATEGIES = {
  1: {
    label: 'Use of English Part 1 — Multiple-choice cloze',
    strategy:
      'Read the whole sentence before choosing. The four options usually have similar meanings — the right one depends on collocation (which words go together), prepositions or fixed expressions, not just meaning.',
    commonTraps: [
      'Choosing a word with the right meaning but the wrong collocation (e.g. "make" vs "do").',
      'Ignoring the preposition or word that comes straight after the gap.',
      'Translating from Spanish instead of thinking in English word partnerships.',
    ],
    lookFor: [
      'Words immediately before and after the gap.',
      'Fixed expressions and phrasal verbs.',
      'Dependent prepositions (interested in, responsible for…).',
    ],
    studyTip:
      'Keep a collocations notebook: when you fail a question, write the full phrase, not just the word.',
  },
  2: {
    label: 'Use of English Part 2 — Open cloze',
    strategy:
      'The missing words are almost always grammar words: articles, prepositions, pronouns, auxiliaries, relatives, linkers. Decide what TYPE of word fits the gap first, then choose the exact word.',
    commonTraps: [
      'Writing content words (nouns, adjectives) when a grammar word is needed.',
      'Writing two words — only ONE word is allowed per gap.',
      'Forgetting that contractions count as two words (don’t = do not).',
    ],
    lookFor: [
      'Verb patterns around the gap (has _____ been / is _____ to).',
      'Linkers between ideas (although, despite, however).',
      'Relative pronouns after nouns (which, who, whose).',
    ],
    studyTip: 'Practise identifying the word class of each gap before answering — it halves your error rate.',
  },
  3: {
    label: 'Use of English Part 3 — Word formation',
    strategy:
      'Read the sentence and decide what word class the gap needs (noun, adjective, adverb, verb). Then transform the given word with prefixes and suffixes — and check whether the meaning needs a negative form.',
    commonTraps: [
      'Missing negative prefixes (un-, im-, dis-) when the sentence has a negative meaning.',
      'Writing the right family word but the wrong class (succeed/success/successful).',
      'Forgetting plural -s on nouns.',
    ],
    lookFor: [
      'Words before the gap: "a/the" → noun; "very" → adjective/adverb.',
      'The overall meaning: positive or negative?',
      'Whether the noun should be a person (-er, -ist) or a concept (-ment, -tion).',
    ],
    studyTip: 'Build word-family tables (verb–noun–adjective–adverb) for the most common B2 roots.',
  },
  4: {
    label: 'Use of English Part 4 — Key word transformations',
    strategy:
      'Keep the meaning identical and use the key word WITHOUT changing it. Count your words: between two and five, contractions count as two. Identify which grammar point is being tested (passive, reported speech, conditionals, comparatives…).',
    commonTraps: [
      'Changing the key word or its form.',
      'Writing more than five words.',
      'Keeping only part of the original meaning.',
    ],
    lookFor: [
      'The grammar structure hiding behind the transformation.',
      'Verb tense in the original sentence — keep it consistent.',
      'Both halves of the answer: each transformation usually scores 2 marks.',
    ],
    studyTip: 'Revise the classic transformation patterns: passive, unless/if, so/such, too/enough, wish, reported speech.',
  },
  5: {
    label: 'Reading Part 5 — Multiple choice',
    strategy:
      'Read the text first for general meaning, then tackle the questions in order — they follow the text. Find the exact part of the text each question refers to and check every option against it before choosing.',
    commonTraps: [
      'Options that use words from the text but change the meaning.',
      'Answering from your own opinion instead of what the writer says.',
      'Rushing the "What does X refer to?" and global-meaning questions.',
    ],
    lookFor: [
      'Paraphrase: the correct option says the same idea with different words.',
      'Attitude and opinion verbs (suggests, admits, doubts).',
      'Reference words (this, it, them) and what they point to.',
    ],
    studyTip: 'Always find evidence in the text before selecting: if you can’t underline it, don’t choose it.',
  },
  6: {
    label: 'Reading Part 6 — Gapped text',
    strategy:
      'Read the text around each gap carefully. The missing sentence must connect grammatically AND logically with what comes before and after. Use reference words and linkers as clues.',
    commonTraps: [
      'Choosing a sentence about the right topic that breaks the logical chain.',
      'Ignoring pronouns (this, they, such) that must point to something specific.',
      'Not re-reading the paragraph after placing a sentence.',
    ],
    lookFor: [
      'Pronouns and determiners at the start of each option (This, These, Such a…).',
      'Time markers and sequence (then, after that, at first).',
      'Contrast and result linkers (however, as a result).',
    ],
    studyTip: 'After completing all gaps, read the whole text once more — one wrong sentence usually makes another gap feel wrong too.',
  },
  7: {
    label: 'Reading Part 7 — Multiple matching',
    strategy:
      'Read the questions FIRST, underline key ideas, then scan each text for paraphrases. Don’t read every text in depth — this part tests fast location of specific information.',
    commonTraps: [
      'Matching by repeated words instead of meaning — the correct text paraphrases the question.',
      'Forgetting a person/text can be the answer to more than one question.',
      'Spending too long reading texts fully instead of scanning.',
    ],
    lookFor: [
      'Synonyms and paraphrases of the question keywords.',
      'Opinions vs facts — many questions ask who FELT or THOUGHT something.',
      'Distractors: two texts may mention the topic, only one matches exactly.',
    ],
    studyTip: 'Time yourself: aim for about one minute per question, leaving time to re-check doubtful matches.',
  },
};

/**
 * @param {number} partNumber Dralo/Cambridge part number 1–7
 */
export function getB2ReadingStrategyPack(partNumber) {
  return STRATEGIES[Number(partNumber)] || null;
}
