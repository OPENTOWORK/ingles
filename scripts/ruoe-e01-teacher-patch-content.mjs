/**
 * RUOE-PILOT-E01 teacher-feedback patch content (v1.1.3).
 *
 * Hand-authored corrections derived from the second human review
 * ("Audit Pilot Test 1"). Each entry is a controlled patch: it replaces only
 * the passage sentences, options and keys named in the feedback.
 *
 * Scope lock: Parts 1, 2, 3, 5 are patched locally; Part 6 is rebuilt under
 * Architecture v2; Parts 4 and 7 are frozen and never touched here.
 */

/* ------------------------------------------------------------------ PART 1 */

export const PART1_PASSAGE = [
  'Imagine an animal trying to reach food but suddenly finds its usual way blocked (0) ___.',
  'The real challenge is not just repeated action but adapting to this new obstacle.',
  'This (1) ___ means the animal must notice the change and think about how to overcome it rather than just trying the same thing again.',
  'For example, a bird might try several ways of opening a container and, (2) ___ doing so, it gradually learns which movements are useless.',
  'The process involves memory, attention, and (3) ___ to new tactics until the goal is met.',
  'This flexible problem-solving contrasts with the automatic response that works immediately without change.',
  'Observers looking at animal behaviour (4) ___ this distinction carefully, because what seems like cleverness could be just a fixed routine.',
  'By watching how an animal’s actions develop, researchers see how sensory awareness (5) ___ with trial-and-error to produce new solutions.',
  'In short, the interesting part is not whether the animal solves the task but how its behaviour (6) ___ to meet the challenge.',
  'This shows that flexible problem-solving often depends on several abilities (7) ___, rather than a single instinct.',
  'Ultimately, such observations help us understand what counts as (8) ___ intelligence in the animal world.',
].join(' ');

/**
 * Only Q2, Q5 and Q8 are re-authored; Q1/Q3/Q4/Q6/Q7 keep their originals.
 * Letters here are provisional: `normalizeGeneratedExamPart` runs
 * `balanceB2Part1McqKeyDistribution`, which relabels A–D across the whole Part
 * so the key spread is even. Only the option words and the correct word matter.
 */
export const PART1_ITEM_PATCHES = {
  2: {
    options: ['A) in', 'B) at', 'C) to', 'D) on'],
    answer: 'A',
    correctWord: 'in',
  },
  5: {
    options: ['A) combines', 'B) connects', 'C) joins', 'D) relates'],
    answer: 'A',
    correctWord: 'combines',
  },
  8: {
    options: ['A) genuine', 'B) truthful', 'C) sincere', 'D) honest'],
    answer: 'A',
    correctWord: 'genuine',
  },
};

/* ------------------------------------------------------------------ PART 2 */

export const PART2_PASSAGE = [
  'At the heart of the town, a busy market bustles (0) ___ before sunrise, with vendors quickly arranging fresh fruit and vegetables on their stalls.',
  'I arrived expecting to find the town’s famous pie, but soon realised that the locals had very (9) ___ interest in such treats early in the morning.',
  'Instead, they carefully selected ordinary ingredients, like leafy greens and root vegetables that will (10) ___ into the day’s meals.',
  'One stallholder, noticing my curiosity, explained (11) ___ to prepare a sauce from the wild herbs displayed.',
  'Her advice was simple but revealing: (12) ___ you want the fullest flavour, it’s best to use these herbs fresh.',
  'As I watched regular customers chatting and exchanging tips with sellers, it became clear that the market (13) ___ not simply about buying food; it also helped to build community spirit.',
  'People shared advice about how (14) ___ to store food or combine flavours, often revisiting the same stalls for guidance.',
  'The market showed me that understanding a town’s eating habits means looking beyond tourist favourites (15) ___ order to observe local behaviour.',
  'By the time I left, my view of the place had changed; it wasn’t about finding something rare but about seeing how food brings people (16) ___.',
].join(' ');

export const PART2_ANSWERS = {
  9: 'little',
  10: 'go',
  11: 'how',
  12: 'if',
  13: 'was',
  14: 'best',
  15: 'in',
  16: 'together',
};

/* ------------------------------------------------------------------ PART 3 */

export const PART3_PASSAGE = [
  'In an informal learning club, a group gathers to take part in a cooperative activity designed to encourage everyone to (0) ___ (PRACTICE) specific skills.',
  'Instead of focusing on winning, participants must explain a strategy clearly to their teammates, which demands real (17) ___ (COMMUNICATE) and planning.',
  'When one learner suggests a flawed move, the group experiences the (18) ___ (FRUSTRATE) of failing quickly, leading them to adjust their approach immediately.',
  'This instant feedback creates a chance for rapid (19) ___ (LEARN), which keeps participants engaged.',
  'In fact, the teacher intervenes only (20) ___ (OCCASION), stepping back to let participants explore solutions.',
  'However, it is important to remember that the value of the exercise depends on matching the activity to the specific skill being practised.',
  'Without such careful (21) ___ (MATCH), the activity could be (22) ___ (HELP) or distracting.',
  'Rather than replacing traditional lessons, this method offers a (23) ___ (DIFFER) way to approach practical exercises, making repetition less monotonous and more appealing.',
  'Ultimately, enjoyment and purposeful skill development must be (24) ___ (BALANCE) to make the best use of such activities in learning.',
].join(' ');

export const PART3_EXAMPLE = { number: 0, stem: 'PRACTICE', answer: 'practise' };

/** Q20 and Q22 change stem to add a genuine -ly adverb and a genuine prefix. */
export const PART3_ITEMS = [
  { number: 17, stem: 'COMMUNICATE', answer: 'communication' },
  { number: 18, stem: 'FRUSTRATE', answer: 'frustration' },
  { number: 19, stem: 'LEARN', answer: 'learning' },
  { number: 20, stem: 'OCCASION', answer: 'occasionally' },
  { number: 21, stem: 'MATCH', answer: 'matching' },
  { number: 22, stem: 'HELP', answer: 'unhelpful' },
  { number: 23, stem: 'DIFFER', answer: 'different' },
  { number: 24, stem: 'BALANCE', answer: 'balanced' },
];

/* ------------------------------------------------------------------ PART 5 */

export const PART5_PASSAGE = [
  'I signed up to volunteer at the local community repair workshop for what I now admit was a distinctly selfish reason: I was certain that adding some volunteer work to my CV would impress future employers and help me stand out in job applications. At the time, I imagined spending my weekends fixing gadgets or tinkering with small machines — something hands-on that would demonstrate practical skills. I was convinced that volunteering was just another bullet point, a way to check a box rather than an experience that would change how I thought about work.',
  'On my first shift, however, I was surprised to find that my main task was not repairing anything but welcoming visitors and working out what help they needed. It quickly became clear that I was expected to be a friendly face, to listen to people’s requests, and then direct them to volunteers more skilled than myself. This was unexpected and initially rather frustrating. I had pictured myself elbow-deep in tools, not chatting with people or scribbling notes. But as the day went on, I realised that this role, though unglamorous, was essential for the workshop to function smoothly and for visitors to feel comfortable asking for help.',
  'One particular encounter has stayed with me. A visitor came in, clearly embarrassed, clutching a small radio that wouldn’t switch on. He was sheepish about not understanding even such a simple fix, and I could tell he worried that asking for help would make him seem silly. I learned then that the way I spoke to him mattered — explaining the problem without assuming any prior knowledge, avoiding jargon, and most importantly, not making him feel foolish for not knowing how to fix something so ordinary.',
  'As weeks turned into months, I took on more responsibility, gradually moving from greeting guests to coordinating the volunteers and the repair tasks depending on their skills and availability. I found myself enjoying this role far more than I expected. It gave me a sense of accomplishment and control, and I liked the social interaction. This was a side of volunteering I had not anticipated or considered when I first signed up. I discovered I was more interested in enabling others to do their work than in doing the hands-on repairs myself.',
  'When it came time to update my CV, I reflected on my experience and realised that the most valuable aspect was not the line about volunteering but what the experience taught me about myself. I now see that coordinating people and communicating effectively suit me better than the solitary, technical tasks I thought I wanted. The CV still includes a note about my volunteering, but the real benefit is a changed understanding of the kind of work I find fulfilling. Volunteering was not just about adding a badge to my applications but about discovering what I actually enjoy doing.',
  'Looking back, I can also laugh at some minor mistakes that day one, when I proudly tried to hand a screwdriver to someone who didn’t actually want it, highlighting how clueless I was about the workshop’s unofficial routines. My previous belief that "serious" career skills came only from formal jobs or internships now seems limited. Doing regular, sometimes mundane tasks with real people revealed strengths I hadn’t expected in myself.',
  'In essence, this volunteer role became a mirror rather than just a step on the career ladder. It reflected back to me not only what I could do but what kind of work energises me and feels worthwhile. This shift in perspective — from seeing volunteering as a strategic CV move to a personal discovery — has influenced how I think about future jobs and even how I define success. Sometimes, it’s the small, everyday interactions and responsibilities that open our eyes to new directions.',
].join('\n\n');

/**
 * Reordered to follow passage progression (¶1, ¶2, ¶3, ¶6, ¶7, whole text) and
 * reshuffled so the key spread covers A–D. Option content is unchanged except
 * for Q33, whose correct option had to follow the "seem silly" passage edit.
 */
export const PART5_QUESTIONS = [
  {
    id: 'q31',
    number: 31,
    fromNumber: 34,
    questionType: 'attitude',
    prompt:
      'Which statement best describes the narrator’s attitude towards their initial motive for volunteering?',
    options: [
      'A) They admitted their motive was somewhat selfish.',
      'B) They felt proud of making a strategic career decision.',
      'C) They believed the motive was entirely genuine.',
      'D) They considered the motive to be irrelevant to the experience.',
    ],
    answer: 'A',
    evidence:
      '‘…what I now admit was a distinctly selfish reason: I was certain that adding some volunteer work to my CV would impress future employers…’',
    rationale:
      'A is correct as the narrator openly admits a selfish motive. B contradicts the tone of admission; C is not suggested; D is not expressed.',
  },
  {
    id: 'q32',
    number: 32,
    fromNumber: 32,
    questionType: 'detail',
    prompt: 'What was the narrator’s main task on the first day of volunteering?',
    options: [
      'A) Repairing small machines brought in by visitors.',
      'B) Organising the volunteers and their tasks.',
      'C) Welcoming visitors and determining their needs.',
      'D) Teaching visitors how to fix items themselves.',
    ],
    answer: 'C',
    evidence:
      '‘…my main task was not repairing anything but welcoming visitors and working out what help they needed.’',
    rationale:
      'C is correct as per the explicit description of the first shift. A and B describe tasks the narrator expected or later took on. D is not mentioned as a main task.',
  },
  {
    id: 'q33',
    number: 33,
    fromNumber: 33,
    questionType: 'inference',
    prompt:
      'How did the visitor with the broken radio feel, and why was this significant for the narrator?',
    options: [
      'A) Confident because he understood the repair process.',
      'B) Frustrated at the workshop’s slow service.',
      'C) Unconcerned about the simplicity of the repair.',
      'D) Embarrassed, and afraid that needing help would reflect badly on him.',
    ],
    answer: 'D',
    evidence:
      '‘A visitor came in, clearly embarrassed … he worried that asking for help would make him seem silly.’',
    rationale:
      'D matches the passage’s description of the visitor’s embarrassment and the narrator’s realisation that his own tone mattered. A is the opposite; B and C are not supported by the text. The option paraphrases the text rather than lifting it, so the item cannot be solved by word matching.',
  },
  {
    id: 'q34',
    number: 34,
    fromNumber: 35,
    questionType: 'purpose',
    prompt: 'Why does the narrator mention the small mistake on their first day?',
    options: [
      'A) To highlight the importance of technical skills.',
      'B) To add light humour and show initial awkwardness.',
      'C) To criticise the workshop’s informal routines.',
      'D) To explain why they stopped volunteering.',
    ],
    answer: 'B',
    evidence:
      '‘…I can also laugh at some minor mistakes that day one, when I proudly tried to hand a screwdriver to someone who didn’t actually want it…’',
    rationale:
      'B is correct as the narrator uses the example humorously and self-deprecatingly. A and C are incorrect because the mistake is personal and light-hearted; D is incorrect as they continued volunteering.',
  },
  {
    id: 'q35',
    number: 35,
    fromNumber: 36,
    questionType: 'reference',
    prompt:
      'What does the phrase "a mirror rather than just a step on the career ladder" mean in the last paragraph?',
    options: [
      "A) The volunteering reflected the narrator's true interests and abilities.",
      'B) The volunteer work was only career-focused, not personal.',
      'C) The experience was disappointing and didn’t lead anywhere.',
      'D) The workshop offered a clear path to promotion and success.',
    ],
    answer: 'A',
    evidence:
      '‘This volunteer role became a mirror ... It reflected back to me not only what I could do but what kind of work energises me and feels worthwhile.’',
    rationale:
      'A matches the metaphor that volunteering gave self-awareness. B and C misinterpret the positive reflection; D is unrelated to the metaphor.',
  },
  {
    id: 'q36',
    number: 36,
    fromNumber: 31,
    questionType: 'global',
    prompt: 'What is the main theme of the article?',
    options: [
      'A) How volunteering can help develop practical repair skills.',
      'B) Strategies for improving job applications with volunteer experience.',
      'C) The unexpected personal insights gained through volunteering.',
      'D) The importance of technical knowledge in community workshops.',
    ],
    answer: 'C',
    evidence:
      'The writer explains starting with a motive to improve their CV but ends up discovering more about personal interests through the experience.',
    rationale:
      'C reflects the overall message that the volunteer experience led to unexpected self-discovery. A is incorrect because the focus is less on repair skills; B is too narrow, focusing on applications rather than insights; D is incorrect as technical skills were less emphasised.',
  },
];

/* ------------------------------------------------------------------ PART 6 */

/**
 * Architecture v2 rebuild: the article below was written first as a continuous
 * piece, six genuine cohesion points were identified, and the six sentences
 * occupying them were physically removed to create gaps (37)–(42).
 */
export const PART6_PASSAGE = [
  'Moving into a smaller flat was supposed to be a straightforward step: fewer rooms to clean, lower bills and, I hoped, a fresh start. Instead, I spent my first evening sitting on the bare floor, hemmed in by towers of cardboard that had already claimed every corner of the sitting room. (37) Opening them only made matters worse, because most held nothing more than odds and ends I had packed out of habit rather than need: three identical chargers, a bag of assorted keys, a folder of instruction manuals for appliances I no longer owned. Somewhere between the third and fourth box, I accepted that keeping everything was not merely impractical but physically impossible.',
  'One box defeated me completely. Inside, wrapped in a supermarket bag as though it were valuable, was a compact umbrella I had been given years earlier and never once opened. (38) Holding it in the middle of that half-empty room, I understood that a surprising number of my possessions were being stored for a future I had never actually described to myself. In a flat of this size, that vagueness turned out to be expensive, because every undecided object was occupying space I genuinely needed.',
  'A few days later, my downstairs neighbour, Ruth, mentioned a swap and repair event at the community centre. (39) That distinction mattered to me more than I expected. Throwing things away had always felt like an admission of waste, and I had been postponing decisions largely to avoid that feeling; passing something on, or watching it mended, sounded almost like the opposite.',
  'I arrived on the Saturday with a bag of things nobody could possibly want: a chipped mug, a scarf worn thin at the elbows and a desk lamp with an unfashionable shade. The lamp went first, claimed within minutes by a student who said it was exactly right for the corner of her room. (40) What I had been calling clutter, I realised, was simply a set of guesses about other people, and my guesses were poor. Value was not a property the objects carried around with them; it depended entirely on who was standing in front of them.',
  'Not everything was so easy to reason about. I had also brought a hand-knitted blanket of my grandmother’s, which is warm, takes up an absurd amount of shelf space and does nothing that I actually need doing. Twice I put it on the swap table, and twice I took it back before anyone could look at it properly. (41) Some things earn their place by meaning rather than use, provided you are willing to say honestly which of the two you are claiming.',
  'Walking home, I found myself drafting a rule. Anything I kept had to do a job or mean something specific, and I had to be able to say which of the two it was without hesitating. (42) It has not turned me into a minimalist, and the flat is certainly not empty; it is merely more honest about what it contains and why.',
  'There is still one shelf I avoid, holding a handful of objects whose value I cannot yet argue either way. I have decided that this is acceptable, at least for now. A home edited down to nothing but justifications would not be a home I would want to come back to.',
].join('\n\n');

/** A–G shuffled; B is the plausible unused sentence. */
export const PART6_SENTENCE_POOL = [
  'A) It went home with me again, and I have stopped pretending that this was an oversight.',
  'B) The community centre had put out tea and biscuits, which struck me as a generous touch for a Saturday morning.',
  'C) Each of these boxes was labelled ‘keep’, which told me nothing useful about what was actually inside.',
  'D) The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp.',
  'E) Put like that, the test sounds severe, but in practice it simply forced me to finish sentences I had been leaving unfinished for years.',
  'F) It was not a jumble sale, she explained, but a morning for mending what was broken and rehoming what was not.',
  'G) I had kept it ‘just in case’, although I could no longer remember what that case might be.',
];

export const PART6_ANSWERS = { 37: 'C', 38: 'G', 39: 'F', 40: 'D', 41: 'A', 42: 'E' };
export const PART6_UNUSED_OPTION = 'B';

/* ------------------------------------------------------- CHANGE LOG (DIFF) */

/** Single source of truth for E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md. */
export const CHANGE_LOG = [
  {
    part: 1,
    locus: 'Q2 — passage sentence',
    before:
      'For example, a bird might try different ways to open a container before finally succeeding (2) ___.',
    after:
      'For example, a bird might try several ways of opening a container and, (2) ___ doing so, it gradually learns which movements are useless.',
    feedback:
      'Q2: "la respuesta es finally, pero justo esa misma palabra ya aparece en la frase de dicho hueco… Habría que eliminar ese finally". Alternative direction: test a B2 fixed expression such as "in doing so".',
    reason:
      'The key was visible immediately before the gap, so the item was unsolvable as designed. The sentence was re-gapped around the fixed expression "in doing so", which removes the leak and tests a genuine word combination instead of an obvious adverb choice.',
  },
  {
    part: 1,
    locus: 'Q2 — options and key',
    before: 'accident / optionally / finally / slowly — key "finally"',
    after: 'in / at / to / on — key "in"',
    feedback:
      'Q2: options "parecen demasiado básicas"; proposal "in doing so / at doing so / to do so / on doing so".',
    reason:
      'Teacher intent preserved, but Part 1 options must be single words in this pipeline (multi-word options are a hard validation failure), so "doing so" stays in the text and the gap sits on the preposition. The option set is exactly the teacher\'s four variants reduced to their distinguishing word, which makes this the dependent-preposition / fixed-expression item the review found missing. "gradually" in the same clause rules out the temporal reading of "on doing so".',
  },
  {
    part: 1,
    locus: 'Q5 — options and key',
    before: 'replace / copy / separate / mix — key "mix" ("sensory awareness mixes with trial-and-error")',
    after: 'combines / connects / joins / relates — key "combines"',
    feedback:
      'Q5: "la respuesta debe ser mixes porque el sujeto sensory awareness aparece singular. Además, sensory awareness mixes with trial-and-error no es la colocación más natural". Direction: combines / connects / joins / relates.',
    reason:
      'Fixes both faults at once: every option is third-person singular, so it agrees with the singular subject, and "combines with … to produce" is the natural British English collocation. Option order was set so the Part 1 key spread covers A–D.',
  },
  {
    part: 1,
    locus: 'Q6 — passage sentence',
    before: 'In short, the interesting part is not if the animal solves the task but how its behaviour (6) ___ to meet the challenge.',
    after:
      'In short, the interesting part is not whether the animal solves the task but how its behaviour (6) ___ to meet the challenge.',
    feedback: 'Q6: "whether es más recomendable por naturalidad".',
    reason:
      '"not whether X but how Y" is the natural British English pairing. Q6 options and key were re-checked afterwards and still work: "changes to meet the challenge" remains the only natural completion, so the key stays A.',
  },
  {
    part: 1,
    locus: 'Q8 — options and key',
    before: 'natural / automatic / certain / intelligent — key "intelligent" ("intelligent intelligence")',
    after: 'genuine / truthful / sincere / honest — key "genuine"',
    feedback:
      'Q8: "los distractores son muy fáciles… al estudiante no le hace ni falta entender el texto"; "hay un fallo porque la respuesta dice ser D: intelligent, pero quedaría intelligent intelligence". SR: use options close in meaning.',
    reason:
      'Removes the impossible collocation and replaces an easy set with four near-synonymous adjectives about authenticity. All are plausible before reading the context, but only "genuine intelligence" is a natural collocation, so the item now tests semantic distinction — the category the review found missing.',
  },
  {
    part: 2,
    locus: 'Example (0) — passage',
    before: 'a busy market bustles (0) ___ just before sunrise',
    after: 'a busy market bustles (0) ___ before sunrise',
    feedback: 'Question 0: "la respuesta just ya aparece en el texto".',
    reason:
      'The leaked word after the gap was deleted so the example reads "bustles just before sunrise" only once the answer is supplied. The example answer itself is unchanged.',
  },
  {
    part: 2,
    locus: 'Q9 — passage and key',
    before: 'but soon realised the locals (9) ___ little interest in such treats early in the morning. → key "have"',
    after:
      'but soon realised that the locals had very (9) ___ interest in such treats early in the morning. → key "little"',
    feedback:
      'Q9: proposed rewrite "but soon realised that the locals had (9) ___ interest…", answer "little"; also the tense debate ("had" vs "showed"/"show").',
    reason:
      'Adopts the teacher rewrite, which settles the tense argument by fixing "had" in the text. "very" was added because the bare frame accepted both "little" and "no" as equally natural answers; "very little" leaves a single defensible key.',
  },
  {
    part: 2,
    locus: 'Q12 — passage and key',
    before: 'Her advice was simple but revealing: it’s best (12) ___ use these herbs fresh, to bring out their full flavour. → key "to"',
    after:
      'Her advice was simple but revealing: (12) ___ you want the fullest flavour, it’s best to use these herbs fresh. → key "if"',
    feedback:
      'Q12: proposed rewrite "Her advice was simple but revealing: (12) ___ you want the fullest flavour, it\'s best to use these herbs fresh", answer "if".',
    reason:
      'Adopts the teacher rewrite verbatim. Note for review: "when" also reads naturally in this frame, so it is recorded as an accepted alternative pending the teacher’s decision.',
  },
  {
    part: 2,
    locus: 'Q13 — passage and key',
    before:
      'it became clear that the market (13) ___ more than just buying food; it builds community connections. → key "is"',
    after:
      'it became clear that the market (13) ___ not simply about buying food; it also helped to build community spirit. → key "was"',
    feedback:
      'Q13: proposed rewrite "the market (13) ___ not simply about buying food; it also helped to build community connections", answer "was"; plus "community connections - this is not natural English. I would change it to community spirit".',
    reason:
      'Adopts the teacher rewrite and her preferred noun phrase. The surrounding past narrative ("it became clear", "it also helped") now forces "was", so the key is unique.',
  },
  {
    part: 2,
    locus: 'Q14 — passage',
    before: 'People shared advice about how (14) ___ best to store food or combine flavours → key "best"',
    after: 'People shared advice about how (14) ___ to store food or combine flavours → key "best"',
    feedback: 'Q14: "best appears exactly before the gap where the answer is meant to be (like a typo)".',
    reason:
      'Deleting the duplicated word leaves the fixed expression "how best to do something", which is a valid and non-trivial B2 open-cloze gap, so the key could stay unchanged.',
  },
  {
    part: 2,
    locus: 'Q15 — passage and key',
    before:
      'means looking beyond tourist favourites (15) ___ paying attention to everyday actions. → key "but"',
    after:
      'means looking beyond tourist favourites (15) ___ order to observe local behaviour. → key "in"',
    feedback:
      'Q15: "the expression looking beyond is usually paired with and or to - in this case I would perhaps change the ending of the sentence to tourist favourites to observe local behaviour".',
    reason:
      'The teacher ending removed the old gap, so a new gap was created in the same zone. "in order to" is a fixed expression with only one possible word, which keeps eight gaps (Q9–Q16) and adds a grammar category the validator reported as missing.',
  },
  {
    part: 2,
    locus: 'Q16 — passage',
    before: 'about seeing how food ties people (16) ___. → key "together"',
    after: 'about seeing how food brings people (16) ___. → key "together"',
    feedback: 'Q16: "I would suggest changing this to seeing how food brings people together".',
    reason:
      '"brings people together" is the natural collocation; "ties people together" is not idiomatic. The key is unchanged.',
  },
  {
    part: 3,
    locus: 'Opening sentence and example (0)',
    before:
      'In an informal learning club, a group gathers to play a cooperative game designed to encourage skill (0) ___ (PRACTICE)_ (PRACTICE). → example answer "practice" (no transformation)',
    after:
      'In an informal learning club, a group gathers to take part in a cooperative activity designed to encourage everyone to (0) ___ (PRACTICE) specific skills. → example answer "practise"',
    feedback:
      'Example: "I would change this to In an informal learning club, a group gathers to take part in a cooperative activity - I would avoid the use of the word game as this B2 is not for schools"; "I also question the structure of the answer… I would change this to something like designed to encourage specific skill practice or designed to encourage the practice of specific skills".',
    reason:
      'Removes the school-ish framing, deletes the duplicated (PRACTICE) marker, and makes the example a real transformation: PRACTICE → practise is a genuine noun-to-verb derivation and a British English spelling point, which the previous no-transform example lacked.',
  },
  {
    part: 3,
    locus: 'Terminology — "players"',
    before: 'players must explain a strategy … let players explore solutions',
    after: 'participants must explain a strategy … let participants explore solutions',
    feedback: 'L2/L6: "players - I would use the word participants".',
    reason: 'Applies the requested adult-register terminology at both occurrences.',
  },
  {
    part: 3,
    locus: 'Collocation — matching',
    before: 'depends on matching the activity with the specific skill being practised',
    after: 'depends on matching the activity to the specific skill being practised',
    feedback:
      '"matching the activity with the specific skill being practised - in the context I think matching the activity to is better suited".',
    reason: '"match A to B" is the natural collocation for pairing an activity with its purpose.',
  },
  {
    part: 3,
    locus: 'Practice wording',
    before: 'a (23) ___ (DIFFER) way to repeat practice exercises',
    after: 'a (23) ___ (DIFFER) way to approach practical exercises',
    feedback: '"way to repeat practice exercises - perhaps practical exercises".',
    reason:
      'Adopts the suggested wording; "approach" replaces "repeat" so the phrase reads naturally, and the following clause still carries the repetition idea.',
  },
  {
    part: 3,
    locus: 'Q20 — stem and answer (-ly adverb)',
    before: '(20) ___ (OBSERVE) → "observant" ("the teacher’s role is largely observant")',
    after: '(20) ___ (OCCASION) → "occasionally" ("the teacher intervenes only occasionally")',
    feedback: '"there is no answer with a prefix or -ly".',
    reason:
      'Supplies the missing -ly adverb transformation through a two-step derivation (occasion → occasional → occasionally) while keeping the original pedagogical point that the teacher steps back.',
  },
  {
    part: 3,
    locus: 'Q22 — stem and answer (prefix/negative)',
    before: '(22) ___ (USE) → "useless"',
    after: '(22) ___ (HELP) → "unhelpful"',
    feedback: '"there is no answer with a prefix or -ly".',
    reason:
      'Supplies the missing genuine prefix/negative formation. "the activity could be unhelpful or distracting" keeps the original meaning of the sentence.',
  },
  {
    part: 3,
    locus: 'Register consistency — "game"',
    before: 'the game’s value … the game could be … the best use of games in learning',
    after: 'the value of the exercise … the activity could be … the best use of such activities in learning',
    feedback: 'Consequence of "I would avoid the use of the word game as this B2 is not for schools".',
    reason:
      'Required for coherence once the opening was changed to "a cooperative activity"; leaving "game" elsewhere would have contradicted the reworked example and re-introduced the register problem.',
  },
  {
    part: 5,
    locus: 'Question order (Q31–Q36)',
    before: 'Q31 global · Q32 detail · Q33 inference · Q34 attitude (¶1) · Q35 purpose · Q36 reference',
    after: 'Q31 attitude (¶1) · Q32 detail (¶2) · Q33 inference (¶3) · Q34 purpose (¶6) · Q35 reference (¶7) · Q36 global',
    feedback:
      '"the order seems random - Q34 is out of order (the exact phrase appears at the start of the text)".',
    reason:
      'Questions now follow passage progression, with the whole-text question last as Cambridge normally places it. Prompts, evidence and rationales travelled with their items; only numbering changed.',
  },
  {
    part: 5,
    locus: 'Answer key distribution',
    before: 'B · C · B · B · C · B (only two letters used)',
    after: 'A · C · D · B · A · C (all four letters used)',
    feedback: '"The answers are all B or C - no A or D".',
    reason:
      'Options were reordered inside the affected items only; no correct answer was changed conceptually and no distractor content was altered, so difficulty is unaffected.',
  },
  {
    part: 5,
    locus: 'Passage ¶3 wording',
    before: 'he worried that asking for help would make him seem unintelligent or careless',
    after: 'he worried that asking for help would make him seem silly',
    feedback:
      '"unintelligent doesn’t sound natural here and careless is out of place here - I would change this to make him seem silly".',
    reason:
      'Adopts the suggested wording. The correct option and evidence for the item that depends on this sentence (now Q33) were updated to match, and the option is a paraphrase rather than a lift.',
  },
  {
    part: 5,
    locus: 'Passage ¶4 wording',
    before: 'I found myself not just managing logistics but enjoying this role more than I expected',
    after: 'I found myself enjoying this role far more than I expected',
    feedback: '"I would just reduce this to I found myself enjoying this role far more than I expected".',
    reason: 'Adopts the suggested wording; no item depends on the deleted clause.',
  },
  {
    part: 5,
    locus: 'questionType metadata',
    before: '"main-idea / global" and "attitude / opinion / tone"',
    after: '"global" and "attitude"',
    feedback: 'Consequence of reordering and re-tagging the affected items.',
    reason:
      'The previous free-text labels were not in the validator vocabulary and produced "unknown questionType" warnings. Metadata only — nothing the candidate sees changed.',
  },
  {
    part: 6,
    locus: 'Whole Part — Architecture v2 rebuild',
    before:
      'Article assembled around pre-written sentences; gap (37) appeared twice in the passage; option A fitted several gaps; gap (38) had weak cohesion clues.',
    after:
      'New continuous article written first, six genuine cohesion points identified, the six sentences occupying them physically removed to create gaps (37)–(42), one plausible unused sentence added, and A–G shuffled.',
    feedback:
      '"the sentences to be introduced read disjointed - is there a way to get the AI to create the text and then remove the sentences rather than create random sentences that could fit into the text?"',
    reason:
      'Rebuild authorised for Part 6 only. CB-PILOT-005, topic, Style Card SC-04 and the reflective first-person intent are preserved; the problematic sentences were not reused.',
  },
  {
    part: 6,
    locus: 'Q37 — antecedent mismatch',
    before:
      'Gap (37) followed by "Many weren’t even full", while the correct sentence referred to the objects rather than the boxes.',
    after:
      'Gap (37) followed by "Opening them only made matters worse, because most held nothing more than odds and ends…", with the correct sentence "Each of these boxes was labelled ‘keep’…" referring unambiguously to the boxes.',
    feedback:
      'Q37: "right after the gap we read Many weren’t even full - but the answer is referring to the objects not the boxes".',
    reason:
      'Both the sentence before the gap ("towers of cardboard") and the sentence after it ("them", "most") now point to the boxes, so the reference chain is consistent.',
  },
  {
    part: 6,
    locus: 'Q40 — lexical repetition',
    before:
      'Gap (40) surrounded by "That was different from my expectation" and option E "That was different from most other items I’d brought… think differently about…".',
    after:
      'Gap (40) filled by "The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp.", followed by "…my guesses were poor."',
    feedback: 'Q40: "How many times can we put different into two lines?"',
    reason:
      'The word "different" no longer appears anywhere in Part 6. The contrast is now carried by the lamp/mug-and-scarf comparison and the marker "by contrast" instead of repeated vocabulary.',
  },
];

/** Issues seen while patching that were deliberately left alone (scope lock). */
export const OBSERVATIONS_NOT_PATCHED = [
  {
    part: 1,
    locus: 'Example (0)',
    note:
      'The example has the same leak pattern the teachers flagged in Q2: "but suddenly finds its usual way blocked (0) ___" with key "suddenly". The example was not named in the feedback, so it was left untouched. Recommend fixing in the next authorised pass.',
  },
  {
    part: 1,
    locus: 'Q5 and Q7 keys',
    note:
      'Q5 now keys "combines" while the frozen Q7 keys "combining". The echo is mild (finite verb vs gerund, two sentences apart) but Q7 was not flagged, so it was not touched.',
  },
  {
    part: 2,
    locus: 'Q12 and Q16',
    note:
      'Both follow the teacher rewrites exactly. "when" is a natural alternative at Q12 and "closer" at Q16; recorded as accepted alternatives for the teacher to confirm rather than re-engineered.',
  },
  {
    part: 2,
    locus: 'Q13',
    note:
      'The teacher noted the gap is easy for B2 but prescribed "was" as the canonical answer. The prescription was followed; raising the difficulty would need a new brief-level decision.',
  },
  {
    part: 3,
    locus: 'Title',
    note:
      'The passage no longer frames the activity as a game, but the working title "Games that make practice feel different" is brief metadata and was not flagged, so it is unchanged. Worth a decision in the next pass.',
  },
];
