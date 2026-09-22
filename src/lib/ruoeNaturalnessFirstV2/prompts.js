import { NATURALNESS_CONTRACT, PART1_KNOWLEDGE_TYPES } from './contract.js';

export const PART1_STAGES = ['passage', 'positions', 'keys', 'distractors', 'independent-substitution'];
export const PART2_STAGES = ['prose', 'gap-discovery', 'select-eight', 'uniqueness'];
export const PART3_STAGES = ['prose', 'family-discovery', 'base-assignment', 'derivation-check'];
export const PART4_STAGES = ['family-candidate', 'sentence-pair', 'mechanical', 'semantic', 'naturalness'];

function withContract(body) {
  return `${NATURALNESS_CONTRACT}\n\n${body}`;
}

export function part1StagePrompt(stage, brief) {
  const direction = brief?.direction || 'a concrete B2 magazine subject';
  if (stage === 'passage') {
    return withContract(`Write one natural B2 First Part 1 article of 150–180 words about: ${direction}.
British spelling and vocabulary. No gaps. No options. No answer key.
The article must already sound publishable. Do not plant unnatural phrases for a future gap.
Return JSON with keys title and passage. Do not use a placeholder passage.`);
  }
  if (stage === 'positions') {
    return withContract(`The passage is finished. Find up to twelve single words that could be tested as B2 lexical items.
A position is usable only if one British English word is clearly the right one there.
Skip any place where two natural words would both be acceptable, including pairs such as effect/impact or cope with/deal with.
Return JSON with key candidates: sentence, word, and knowledgeType. knowledgeType must be one of ${PART1_KNOWLEDGE_TYPES.join(', ')}.`);
  }
  if (stage === 'keys') {
    return withContract(`Choose eight candidates from the list. Keep the sentences exactly as written.
Spread knowledge types across collocation, phrasal verb, fixed expression, lexical meaning, dependent preposition, semantic distinction, and lexical precision.
Do not let one type exceed three items. Avoid obvious textbook chunks.
Return JSON with key items: number, sentence, key, knowledgeType, obviousChunk.`);
  }
  if (stage === 'distractors') {
    return withContract(`The sentences and keys are fixed. Add three one-word distractors to each item.
Each distractor must be the same word class, but it must fail when substituted alone into the complete sentence.
If you cannot find three failures without offering a second natural word, drop that item and say so.
Return JSON with key items: number and options (letter, word, isKey).`);
  }
  return withContract(`Do not choose the best answer.
For each option, write the complete sentence with only that option in the gap, then judge it alone:
grammatical, natural British English, semantically defensible, acceptable collocation, contextually defensible.
Repeat independently for A, then B, then C, then D.
Do not pass an item because the key is more idiomatic.
If two words such as effect and impact both work in the real sentence from PREVIOUS STAGES, both survive.
The sentence you judge must be the candidate sentence, not a new example about policy or productivity.
Return exactly four options labelled A, B, C and D, with no duplicates.
Each option needs option, sentence, grammatical, naturalBritishEnglish, semanticallyDefensible, collocationallyValid, and reason. All four judgements are required even when an option fails.`);
}

export function part2StagePrompt(stage, brief) {
  const direction = brief?.direction || 'a concrete B2 magazine subject';
  if (stage === 'prose') {
    return withContract(`Write a natural continuous B2 article of 150–180 words about: ${direction}.
No gaps. British English. Every function word must be one a British writer would choose.
Return JSON with keys title and passage.`);
  }
  if (stage === 'gap-discovery') {
    return withContract(`The article is finished. List grammatical words that could be removed to leave exactly one Cambridge B2 answer.
Allowed families: prepositions, auxiliaries, articles and determiners, pronouns, relative words, linkers and conjunctions, particles, comparison structures, verb-pattern function words, fixed grammatical frames.
Reject any site where a second word also fits, including who/that in a defining relative clause.
The word must occur in the finished article. Return JSON with key sites: sentence, word, family.`);
  }
  if (stage === 'select-eight') {
    return withContract(`Select exactly eight unique sites from the finished article. Do not change the prose to create a site.
If a family cannot be hosted naturally, omit that family.
Return JSON with key gaps: number, word, family, sentence. The word must be copied from the article.`);
  }
  return withContract(`For each gap, list every other one-word completion a competent British speaker could defend.
Do not pick a favourite. An empty list means the keyed word is the only answer.
keyedWord must be the word removed from the article, never a placeholder.
An empty alternative list is not enough. For every gap set alternativeSearchPerformed true only after you have tried other function words, list any that still fit in plausibleAlternatives, write a non-empty uniquenessJustification, and set confidence from 0 to 1.
Return JSON with key gaps. Each gap needs number, intendedAnswer, intendedAnswerValid, alternativeSearchPerformed, plausibleAlternatives, uniquenessJustification, and confidence.`);
}

export function part3StagePrompt(stage, brief) {
  const direction = brief?.direction || 'a concrete B2 magazine subject';
  if (stage === 'prose') {
    return withContract(`Write a natural B2 article of 150–180 words about: ${direction}. No gaps. No base words.
Return JSON with keys title and passage.`);
  }
  if (stage === 'family-discovery') {
    return withContract(`In the finished article, list words that already belong to a useful word family and sit naturally in the sentence.
Do not invent a new phrase to host a derivation.
Return JSON with key words: word and sentence, copied from the article.`);
  }
  if (stage === 'base-assignment') {
    return withContract(`For each chosen word, give one base that derives it directly, the word class, and whether another family member would also fit.
DECIDE → decision-making is illegal because "making" is a second lexeme.
If the sentence cannot support a clean transformation, discard that word.
stem must be one base word, not a sentence, and not the example DECIDE unless that family is really in the article.
For every pair also return lexicalFamilyValidation with sameLexicalFamily, extraLexicalRootIntroduced, directDerivation, legitimateBase, and a non-empty reason.
Return JSON with key items: stem, answer, wordClass, natural, forcedContext, alternativeFamilyMembers, lexicalFamilyValidation.`);
  }
  return withContract(`Check each item: direct derivation, word class, naturalness, uniqueness, morphology, B2 level.
Do not infer a family from shared letters. For each pair return lexicalFamilyValidation with sameLexicalFamily, extraLexicalRootIntroduced, directDerivation, legitimateBase, and a non-empty reason.
Return JSON with key items: stem, answer, natural, forcedContext, alternativeFamilyMembers, lexicalFamilyValidation.`);
}

export function part4StagePrompt(stage, brief) {
  const direction = brief?.direction || 'an everyday B2 situation';
  const family = brief?.preferredFamily || 'a B2 transformation family from the approved bank';
  if (stage === 'family-candidate') {
    return withContract(`Choose a Transformation Family as a plan only. It is not sacred.
Preferred family if it can be done naturally: ${family}.
Topic: ${direction}.
If this family cannot yield a natural exact paraphrase in 2–5 words, name a different family.
Return JSON with keys familyId, keyword, and kept. keyword must be the real task word, not WORD.`);
  }
  if (stage === 'sentence-pair') {
    return withContract(`Write sentence 1 and the completed sentence 2 so that they mean the same thing in natural British English.
Use this exact situation: ${direction}.
Then give the 2–5 word answer containing the keyword unchanged.
If the family cannot do this without bending the English, set "abandonFamily": true and do not force the pair.
Return JSON with keys sentence1, sentence2, keyword, answer, abandonFamily.`);
  }
  if (stage === 'semantic') {
    return withContract(`Compare sentence 1 with the completed sentence 2. Ignore the word count.
Answer whether propositions, agency, objects and referents, tense and aspect, modality, and comparison scope are preserved, and whether any fact was added or lost.
Set each boolean from the two sentences in PREVIOUS STAGES. Do not mark them true by default.
Return JSON with keys propositionsPreserved, agencyPreserved, referencePreserved, tenseAspectPreserved, modalityPreserved, comparisonScopePreserved, informationLost, informationAdded, natural.`);
  }
  return withContract(`Would a competent British English speaker produce both sentences if there were no exam?
Return JSON with key natural, set from the sentences in PREVIOUS STAGES.`);
}

export function repairPrompt(action) {
  return withContract(`Local repair only. Action: ${action.action}. ${action.instruction}
Do not rewrite items that were not named.
For a Part 4 replacement return one flat object with s1, keyword, s2WithGap, answer, completedS2, transformationFamily, and acceptedVariants.
You may also include sentence1 and sentence2, but the answer must be a top-level string or inside pair.answer. Do not omit the answer.
Return JSON for the repaired item only.`);
}

export function blindSolvePrompt(partNumber, view) {
  const task = {
    1: 'Judge every option on its own. Return every letter that is grammatical, natural British English, semantically defensible, and collocationally valid. Do not pick a single best answer. Return {"defensibleOptions":["A"]}.',
    2: 'For each gap, search for every other one-word function word a British speaker could defend. Return {"alternativeSearchPerformed":true,"answer":"...","plausibleAlternatives":[],"uniquenessJustification":"...","confidence":0.9}.',
    3: 'Supply the completed word a British speaker would write from the stem and the sentence. Return {"answer":"..."}.',
    4: 'Complete the transformation in 2–5 words. Return {"answer":"..."}.',
  }[partNumber];
  return withContract(`You are a blind solver. You do not know the intended answer, the target type, or the generator's notes.
${task}
ITEM:
${JSON.stringify(view)}`);
}

export function adversaryPrompt(partNumber, view) {
  return withContract(`You are an independent linguistic adversary. Try to invalidate this item. Ignore any hint about which answer was intended.
Part ${partNumber}. For Part 1, test A, B, C and D separately. For Part 2, search for another function word. For Part 3, test other family members and extra roots. For Part 4, compare sentence 1 with the completed sentence 2.
Return {"verdict":"PASS|PIPELINE_FAIL|QUALITY_FAIL|HARD_FAIL","reason":"...","candidateAlternative":null}.
ITEM:
${JSON.stringify(view)}`);
}
