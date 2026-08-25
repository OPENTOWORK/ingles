// RUOE-PILOT-E03 — authored from the E03/E04 proposed briefs and Part 4 blueprint.
// Parts 1, 2, 3, 5, 6, 7 follow their Content Brief; Part 4 follows TBP-PILOT-EX03 only.

export const EXAM_E03 = {
  examId: 'RUOE-PILOT-E03',
  examFolder: 'EXAM-03',
  outputRoot: '05_OUTPUTS_PILOT_E03_v1_0',
  batchId: 'RUOE-PILOT-02',
  parts: [
    // ───────────────────────────── PART 1 ─────────────────────────────
    {
      partNumber: 1,
      briefId: 'CB-PILOT-013',
      blueprintId: null,
      styleCardId: 'SC-02',
      styleCardName: 'Trend & Social Report',
      topic: 'Technology',
      subtopics: ['Social Media', 'Health'],
      briefWorkingTitle: 'Fewer people, more often',
      titleCandidates: [
        'Smaller rooms, same conversations',
        'The audience gets shorter',
        'Keeping the app, losing the crowd',
      ],
      title: 'Smaller rooms, same conversations',
      titlePatternFamily: 'juxtaposition_title',
      directions:
        'Part 1: Multiple-choice cloze\nFor questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap. There is an example at the beginning (0).',
      passage:
        'Somebody turns off notifications for a group chat they have belonged (0) ___ for years. It sounds like nothing, and it is happening everywhere. Instead of deleting their accounts, a good many users are quietly (1) ___ back the audience for everything they post, keeping the apps and shrinking the room.\n\nThe reasons they offer (2) ___ into two broad categories. Some resent being interrupted during the working day. Others are simply wary (3) ___ an audience they can no longer picture. Few of them describe it (4) ___ terms of health; the word they use is attention.\n\nWhat they notice afterwards is mainly a difference of pace. They look less often, they write at greater (5) ___ when they do, and the (6) ___ to check every few minutes has faded.\n\nThey are honest about the cost. Now and again an invitation is (7) ___ entirely, and news from the edge of their circle arrives late. None of it, they concede, has made much (8) ___ to the hours they spend on a screen.',
      example: {
        number: 0,
        options: ['A) in', 'B) to', 'C) with', 'D) at'],
        answer: 'B',
        explanation: '“Belong to” is the fixed dependent preposition.',
      },
      items: [
        {
          n: 1,
          options: ['A) scaling', 'B) holding', 'C) drawing', 'D) rolling'],
          answer: 'A',
          category: 'phrasal / verb combination',
          rationale:
            '“Scale back” means reduce in size or extent. “Hold back” = restrain, “draw back” = retreat, “roll back” = reverse a policy; none takes “the audience” in this sense.',
        },
        {
          n: 2,
          options: ['A) come', 'B) fall', 'C) turn', 'D) break'],
          answer: 'B',
          category: 'collocation',
          rationale:
            '“Fall into two broad categories” is the standard collocation. The other verbs do not combine with “into … categories” in this meaning.',
        },
        {
          n: 3,
          options: ['A) of', 'B) about', 'C) with', 'D) from'],
          answer: 'A',
          category: 'dependent preposition',
          rationale: '“Wary of” is the only correct dependent preposition for this adjective.',
        },
        {
          n: 4,
          options: ['A) by', 'B) on', 'C) in', 'D) at'],
          answer: 'C',
          category: 'fixed expression',
          rationale: '“Describe something in terms of X” is fixed.',
        },
        {
          n: 5,
          options: ['A) size', 'B) length', 'C) depth', 'D) width'],
          answer: 'B',
          category: 'fixed expression',
          rationale:
            '“At greater length” is fixed. “Depth” would require “in”, which the preceding preposition blocks.',
        },
        {
          n: 6,
          options: ['A) urge', 'B) hurry', 'C) demand', 'D) request'],
          answer: 'A',
          category: 'lexical meaning',
          rationale:
            '“The urge to do something” is the natural noun for an internal impulse; the other three take different complements or refer to external pressure.',
        },
        {
          n: 7,
          options: ['A) lost', 'B) skipped', 'C) missed', 'D) dropped'],
          answer: 'C',
          category: 'semantic distinction',
          rationale:
            '“An invitation is missed” = not seen in time. “Skipped” and “dropped” imply a deliberate choice; “lost” implies a physical object.',
        },
        {
          n: 8,
          options: ['A) change', 'B) effect', 'C) result', 'D) difference'],
          answer: 'D',
          category: 'collocation',
          rationale:
            '“Make a difference to something” is the fixed collocation. One has an effect, not makes one, in this frame.',
        },
      ],
      quality: {
        warnings: [
          'Q2: a strong candidate might consider “divide into”, which is not offered; the four given options leave only “fall” defensible.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve agreed with the key on 8/8. Q6 was the slowest item: “urge” was reached by elimination rather than immediately.',
        repairs: [
          'Q6 regenerated during drafting: the first version used “bothering/troubling to look”, where both were defensible in British English. Replaced with a noun-based item.',
          'Q8 regenerated during drafting: the earlier ending gapped “reaches them”, which duplicated a semantic-distinction item already at Q7.',
        ],
      },
    },

    // ───────────────────────────── PART 2 ─────────────────────────────
    {
      partNumber: 2,
      briefId: 'CB-PILOT-014',
      blueprintId: null,
      styleCardId: 'SC-04',
      styleCardName: 'Narrative Story',
      topic: 'Work',
      subtopics: ['Business', 'Entrepreneurship'],
      briefWorkingTitle: 'The notebook with too many names in it',
      titleCandidates: [
        'Two walks in the same hour',
        'Eleven names, one afternoon',
        'The Thursday she ran out of hours',
      ],
      title: 'Two walks in the same hour',
      titlePatternFamily: 'descriptive_title',
      directions:
        'Part 2: Open cloze\nFor questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap. There is an example at the beginning (0).',
      passage:
        'The notebook had been a joke (0) ___ begin with, a birthday present from her brother. Now it held eleven names, and on Thursday two of them had been written into the same hour.\n\nShe noticed at half past twelve, by (9) ___ time it was too late to ring anybody. The collie and the spaniel from the end of the road both had to be out by one. She took the two of them together, something she (10) ___ promised herself she would never do, and the collie pulled so hard (11) ___ her shoulder ached all evening.\n\nShe was still rubbing it when Mrs Ellery telephoned. Her two terriers had been on the round (12) ___ four years, and now she wanted Saturdays as well. There was (13) ___ version of Saturday in which she could take two more dogs and still do the job properly.\n\nShe did not say no. What she did (14) ___ was pin (15) ___ a card in the newsagent’s window, asking for somebody who could walk four dogs at the weekend. The round had grown faster (16) ___ she had.',
      example: { number: 0, answer: 'to' },
      items: [
        { n: 9, answer: 'which', category: 'relative pronoun in a prepositional frame', rationale: '“by which time” is the only natural completion after a comma; “that” would produce a comma splice.' },
        { n: 10, answer: 'had', category: 'auxiliary — past perfect', rationale: 'The promise precedes the action being narrated.' },
        { n: 11, answer: 'that', category: 'result clause', rationale: '“so hard that …” is the fixed result structure.' },
        { n: 12, answer: 'for', category: 'preposition of duration', rationale: 'Duration with the present perfect requires “for”.' },
        { n: 13, answer: 'no', category: 'determiner', rationale: 'The following clause states what she could not do, so a negative determiner is required.' },
        { n: 14, answer: 'instead', category: 'linking adverb', rationale: 'Contrast with the previous sentence, “She did not say no”.' },
        { n: 15, answer: 'up', category: 'phrasal-verb particle', rationale: '“pin up a card” — the particle is obligatory here.' },
        { n: 16, answer: 'than', category: 'comparative', rationale: 'Required by the comparative “faster”.' },
      ],
      quality: {
        warnings: [
          'Q9: a weaker candidate may try “that”. Only “which” is grammatical after the comma; the mark scheme accepts “which” alone.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve produced a single answer for all eight gaps and matched the key on 8/8. No gap admitted a second natural one-word solution.',
        repairs: [
          'Gap 10 regenerated during drafting: the first version gapped “until/before six”, where both were defensible. Replaced with a past-perfect auxiliary.',
          'Gap 12 regenerated during drafting: the first version gapped “ask whether/if Saturdays were possible”, an ambiguity of exactly the kind flagged in the E01 Part 2 teacher patch.',
          'Gap 11 regenerated during drafting: the first version gapped the preposition in “pulled so hard on/at the lead”, where both are natural British English.',
        ],
      },
    },

    // ───────────────────────────── PART 3 ─────────────────────────────
    {
      partNumber: 3,
      briefId: 'CB-PILOT-015',
      blueprintId: null,
      styleCardId: 'SC-03',
      styleCardName: 'Personal Reflective Experience',
      topic: 'Lifestyle',
      subtopics: ['Hobbies', 'Daily Life'],
      briefWorkingTitle: 'Twenty minutes was the whole point',
      titleCandidates: ['Ink before eight', 'The box under the table', 'What counted as a session'],
      title: 'Ink before eight',
      titlePatternFamily: 'time_marker_title',
      directions:
        'Part 3: Word formation\nFor questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line. There is an example at the beginning (0).',
      passage:
        'For most of a year the printing kit stayed in its box under the kitchen table, the paper still sealed. (0) ___ (ORIGIN) I had pictured long sessions: two clear hours and a tidy surface. My idea of what the hobby demanded had been (17) ___ (REAL) from the start, and anything briefer felt like (18) ___ (PREPARE) rather than the real thing.\n\nThen one Tuesday I had twenty minutes before I had to leave, and I used them. The first print was poor. I did it again the following morning, and (19) ___ (GRADUAL) those twenty minutes stopped being a compromise and became the practice. A small daily (20) ___ (ACHIEVE) turned out to fit inside a working week in a way the perfect session never had.\n\nThe mornings are genuinely (21) ___ (ENJOY), which the two-hour version never was; the prints are cruder, and half the equipment I bought is now (22) ___ (USE) to me. What changed was not my interest but my willingness to (23) ___ (SHORT) the session. If there is any (24) ___ (HONEST) in this, it is that I no longer measure a session by its length.',
      example: { number: 0, stem: 'ORIGIN', answer: 'Originally', transformation: 'noun → adverb' },
      items: [
        { n: 17, stem: 'REAL', answer: 'unrealistic', transformation: 'adjective → adjective (negative prefix + suffix)' },
        { n: 18, stem: 'PREPARE', answer: 'preparation', transformation: 'verb → noun' },
        { n: 19, stem: 'GRADUAL', answer: 'gradually', transformation: 'adjective → adverb (-ly)' },
        { n: 20, stem: 'ACHIEVE', answer: 'achievement', transformation: 'verb → noun' },
        { n: 21, stem: 'ENJOY', answer: 'enjoyable', transformation: 'verb → adjective' },
        { n: 22, stem: 'USE', answer: 'useless', transformation: 'verb/noun → adjective (negative suffix)' },
        { n: 23, stem: 'SHORT', answer: 'shorten', transformation: 'adjective → verb' },
        { n: 24, stem: 'HONEST', answer: 'honesty', transformation: 'adjective → noun' },
      ],
      quality: {
        warnings: [
          'Q22 (USE → useless): “unusable” is a real derivation of the same stem. It is blocked here by “to me”, which selects “useless”; a teacher may still wish to confirm.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve produced the keyed derivation on 8/8. Only Q22 required the collocation “useless to me” to discriminate.',
        repairs: [
          '“Anything shorter” in paragraph 1 was rewritten as “anything briefer” so that no form of the SHORT family appears in the passage alongside item 23.',
          'The example stem was changed from EQUIP to ORIGIN because “equipment” occurs in the passage.',
        ],
      },
    },

    // ───────────────────────────── PART 4 ─────────────────────────────
    {
      partNumber: 4,
      briefId: null,
      blueprintId: 'TBP-PILOT-EX03',
      styleCardId: null,
      styleCardName: null,
      topic: null,
      subtopics: [],
      briefWorkingTitle: null,
      titleCandidates: [],
      title: null,
      titlePatternFamily: null,
      directions:
        'Part 4: Key word transformations\nFor questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).',
      example: {
        number: 0,
        sentence1: 'A builder is repairing our roof next week.',
        keyword: 'HAVING',
        sentence2Start: 'We are __________________ next week.',
        answer: 'having our roof repaired',
        familyId: 'TF-08',
        familyName: 'Causative & service structures',
      },
      items: [
        {
          n: 25,
          familyId: 'TF-01',
          familyName: 'Comparison & degree',
          targetStructure: 'negative equivalence with not as … as',
          sentence1: 'Their second album was better than their first.',
          keyword: 'AS',
          sentence2Start: 'Their first album __________________ their second.',
          answer: 'was not as good as',
          fullAnswers: ['was not as good as', 'wasn’t as good as'],
          markingPoints: [
            { id: 1, label: 'negative BE + AS + gradable adjective', accepted: ['was not as good', 'wasn’t as good'] },
            { id: 2, label: 'second AS introducing the standard of comparison', accepted: ['as'] },
          ],
          difficulty: 'B2-Core',
          distance: 'syntactic_restructuring',
          notes: 'Requires the subjects to be reversed. “Less good than” is not natural English, so the equative is the only route.',
        },
        {
          n: 26,
          familyId: 'TF-02',
          familyName: 'Conditionals & hypothetical meaning',
          targetStructure: 'negative condition expressed with UNLESS',
          sentence1: 'If the weather does not improve, the match will have to be called off.',
          keyword: 'UNLESS',
          sentence2Start: 'The match will have to be called off __________________.',
          answer: 'unless the weather improves',
          fullAnswers: ['unless the weather improves'],
          markingPoints: [
            { id: 1, label: 'UNLESS + subject', accepted: ['unless the weather'] },
            { id: 2, label: 'affirmative present-simple verb required by the polarity change', accepted: ['improves'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'grammatical_reformulation',
          notes: 'The commonest wrong route, leaving the verb negative after UNLESS, is explicitly what the item tests.',
        },
        {
          n: 27,
          familyId: 'TF-05',
          familyName: 'Reported speech, requests & advice',
          targetStructure: 'reported advice with ADVISED + object + to-infinitive',
          sentence1: '‘You should book the tickets early,’ the guide said to us.',
          keyword: 'ADVISED',
          sentence2Start: 'The guide __________________ the tickets early.',
          answer: 'advised us to book',
          fullAnswers: ['advised us to book'],
          markingPoints: [
            { id: 1, label: 'ADVISED + object', accepted: ['advised us'] },
            { id: 2, label: 'TO-infinitive carrying the advised action', accepted: ['to book'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'syntactic_restructuring',
          notes:
            'The direct speech is advice, not an instruction, so “told” is excluded; “suggested”/“recommended” take a different pattern and are excluded by the fixed keyword.',
        },
        {
          n: 28,
          familyId: 'TF-09',
          familyName: 'Verb patterns & complementation',
          targetStructure: 'have difficulty (in) + gerund',
          sentence1: 'It was hard for me to follow what the lecturer was saying.',
          keyword: 'DIFFICULTY',
          sentence2Start: 'I __________________ what the lecturer was saying.',
          answer: 'had difficulty following',
          fullAnswers: ['had difficulty following', 'had difficulty in following'],
          markingPoints: [
            { id: 1, label: 'correctly tensed HAVE + DIFFICULTY', accepted: ['had difficulty'] },
            { id: 2, label: 'gerund carrying the action', accepted: ['following', 'in following'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'lexico_grammatical_restructuring',
          notes:
            '“Difficulty in + gerund” is accepted as a controlled variant and maps to the same two marking points, as the blueprint requires. Past tense is recovered from “It was hard”.',
        },
        {
          n: 29,
          familyId: 'TF-12',
          familyName: 'Dependent prepositions & lexical grammar',
          targetStructure: 'be responsible for + noun phrase',
          sentence1: 'A faulty heater caused the fire in the warehouse.',
          keyword: 'RESPONSIBLE',
          sentence2Start: 'A faulty heater __________________ the fire in the warehouse.',
          answer: 'was responsible for',
          fullAnswers: ['was responsible for'],
          markingPoints: [
            { id: 1, label: 'correctly tensed BE + RESPONSIBLE', accepted: ['was responsible'] },
            { id: 2, label: 'dependent preposition FOR introducing the complement', accepted: ['for'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'lexico_grammatical_restructuring',
          notes: 'Cause, not duty, so “in charge of” is excluded. The past tense of BE is fixed by “caused”.',
        },
        {
          n: 30,
          familyId: 'TF-11',
          familyName: 'Fixed expressions & collocations',
          targetStructure: 'do somebody a favour',
          sentence1: 'I would be grateful if you could take this parcel to the post office for me.',
          keyword: 'FAVOUR',
          sentence2Start: 'Could you __________________ and take this parcel to the post office for me?',
          answer: 'do me a favour',
          fullAnswers: ['do me a favour'],
          markingPoints: [
            { id: 1, label: 'DO + indirect object', accepted: ['do me'] },
            { id: 2, label: 'determiner A + FAVOUR as a fixed chunk', accepted: ['a favour'] },
          ],
          difficulty: 'B2-Strong',
          distance: 'idiomatic_restructuring',
          notes:
            'The trailing “for me” in sentence 2 blocks the competing “do a favour for me”, which would repeat the prepositional phrase. British spelling FAVOUR only; FAVOR is not accepted.',
        },
      ],
      quality: {
        warnings: [
          'Answer-length spread is 3/3/4/4/4/5, which meets the distribution check but leans on four-word answers.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Adversarial alternate-route check found no second defensible answer for any of the six items. Q30 was the item most at risk and was restructured to close the “do a favour for me” route.',
        repairs: [
          'Q30 regenerated during drafting: the first version allowed “do a favour for me” as a five-word alternative. Sentence 2 now ends in “for me”, which makes that route repeat itself and leaves the ditransitive as the only natural answer.',
        ],
      },
    },

    // ───────────────────────────── PART 5 ─────────────────────────────
    {
      partNumber: 5,
      briefId: 'CB-PILOT-016',
      blueprintId: null,
      styleCardId: 'SC-01',
      styleCardName: 'Curiosity & Explanatory Article',
      topic: 'Science',
      subtopics: ['Inventions', 'Technology'],
      briefWorkingTitle: 'The tool nobody was asked to design',
      titleCandidates: [
        'Designed for one job, kept for another',
        'Cheap enough to waste',
        'The strip of plastic in every drawer',
      ],
      title: 'Designed for one job, kept for another',
      titlePatternFamily: 'juxtaposition_title',
      directions:
        'Part 5: Multiple choice\nYou are going to read an article. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      passage:
        'There is an object in most kitchen drawers that almost nobody buys on purpose. It is a narrow strip of toothed plastic, perhaps twenty centimetres long, with a small square head at one end. Thread the tail through the head and it will slide one way and lock the other, tightening around whatever it has been wrapped about. It costs almost nothing, it cannot be undone without scissors, and it is used every day by people who could not say where they got it.\n\nIt was not made for kitchens. It was made for factories, and specifically for the problem of holding several dozen wires together inside a machine while somebody else worked around them. The bundles had to be tidy, they had to be quick to fasten, and they had to be cheap, because a single machine might need hundreds of them. Everything about the design answers that one narrow question. Nothing about it anticipates a greenhouse.\n\nYet greenhouses are where a great many of them now end up. Gardeners use them to tie a young stem to a cane, because the tail can be pulled just far enough and no further. Cyclists use them to hold a lamp to a frame that was never drilled for one. In workshops they close bags, label cables, hold a broken hinge together until a proper repair can be made, and hang tools on the wall of a shed. None of these uses was suggested by anybody. They were arrived at separately, by people who happened to have a handful of the things and a problem in front of them.\n\nWhat made that possible has less to do with cleverness than with cost. Three ordinary properties recur in objects that spread this way. The first is that they are cheap enough to waste: nobody agonises over a decision that can be reversed for a few pence. The second is that they can be understood at a glance. Someone picking one up for the first time can see, without being told, what it will do and roughly how hard it will pull. The third, and the one most often overlooked, is that they fail harmlessly. When the plastic snaps, nothing else breaks; the experiment simply ends, and the person tries something else.\n\nTogether, those three properties lower the cost of trying, and lowering the cost of trying is what allows strangers to do the inventing. The designer’s imagination stops at the factory door. Everybody else’s begins there.\n\nIt is worth looking at an object that did not travel. A reusable metal version of the same fastening was made and sold in the same period: better engineered, adjustable, capable of being opened and closed for years. By almost any measure it was the superior product, and it never left the industries it was built for. It cost roughly forty times as much, it needed a small tool to release it, and losing one mattered. Nobody was going to keep a box of them in a kitchen drawer for the sake of an occasional bag of frozen peas. The very qualities that made it good — durability, precision, reusability — made it something to be looked after rather than something to be tried.\n\nThat comparison suggests a different question to ask of any new design. Not what it was intended for, and not even how well it performs the job it was made to do, but what it makes cheap and safe for other people to attempt. Judged that way, some objects turn out to have been badly designed and enormously useful, which is an uncomfortable thing for a designer to hear.',
      items: [
        {
          n: 31,
          questionType: 'purpose',
          prompt: 'Why does the writer describe the object rather than name it in the first paragraph?',
          options: [
            'A) To suggest that the object is more complicated than it appears.',
            'B) To imply that the object is difficult to describe accurately.',
            'C) To make something entirely familiar worth looking at again.',
            'D) To show that most people use the object incorrectly.',
          ],
          answer: 'C',
          evidence:
            '‘almost nobody buys on purpose … used every day by people who could not say where they got it.’',
          rationale:
            'The paragraph withholds the name and describes the mechanism instead, so that a reader who owns dozens of them has to look at one properly.',
        },
        {
          n: 32,
          questionType: 'detail',
          prompt: 'According to the second paragraph, the object’s original design was shaped by',
          options: [
            'A) the need to hold many wires at once as cheaply as possible.',
            'B) requests from the people who later found other uses for it.',
            'C) a wish to make it as easy as possible to undo.',
            'D) the difficulty of finding a material that would last.',
          ],
          answer: 'A',
          evidence:
            '‘holding several dozen wires together … they had to be cheap, because a single machine might need hundreds of them.’',
          rationale:
            'B reverses the chronology, C contradicts “cannot be undone without scissors”, and D is never mentioned.',
        },
        {
          n: 33,
          questionType: 'inference',
          prompt: 'What point is the writer making about the later uses listed in the third paragraph?',
          options: [
            'A) They show that the object works better outside factories than inside them.',
            'B) They were encouraged by the people who originally manufactured it.',
            'C) They became common only after the object was sold in ordinary shops.',
            'D) They were arrived at separately by people with their own problems to solve.',
          ],
          answer: 'D',
          evidence: '‘None of these uses was suggested by anybody. They were arrived at separately …’',
          rationale:
            'The list exists to establish independent discovery, which the fourth paragraph then explains. A overstates, B contradicts, C is unsupported.',
        },
        {
          n: 34,
          questionType: 'detail',
          prompt: 'The writer suggests that failing harmlessly matters because',
          options: [
            'A) it prevents the object from being used in dangerous situations.',
            'B) an unsuccessful attempt leaves the user no worse off.',
            'C) it makes the object last longer than costlier alternatives.',
            'D) it allows the object to be repaired rather than replaced.',
          ],
          answer: 'B',
          evidence: '‘When the plastic snaps, nothing else breaks; the experiment simply ends …’',
          rationale:
            'The property is presented as removing the penalty for a failed experiment, not as a safety feature (A) or a durability claim (C, D).',
        },
        {
          n: 35,
          questionType: 'inference',
          prompt: 'What does the writer imply about the reusable metal version?',
          options: [
            'A) It was less well made than the plastic strip.',
            'B) It was withdrawn once industries stopped ordering it.',
            'C) Its very strengths made people unwilling to experiment with it.',
            'D) It would have spread if more people had known about it.',
          ],
          answer: 'C',
          evidence:
            '‘The very qualities that made it good … made it something to be looked after rather than something to be tried.’',
          rationale:
            'A contradicts “better engineered”, B is not stated, and D is the opposite of the argument: awareness was never the obstacle.',
        },
        {
          n: 36,
          questionType: 'global purpose',
          prompt: 'In the final paragraph, the writer’s main purpose is to',
          options: [
            'A) recommend a different test for judging a design.',
            'B) criticise designers for ignoring how people really behave.',
            'C) predict which sorts of object will spread in future.',
            'D) explain why cheap products usually outsell expensive ones.',
          ],
          answer: 'A',
          evidence: '‘That comparison suggests a different question to ask of any new design.’',
          rationale:
            'The paragraph proposes a criterion. B is too hostile for the tone, C makes no prediction, and D generalises about sales, which the article never discusses.',
        },
      ],
      quality: {
        warnings: [
          'Q33 sits close to the explicit wording of the paragraph and may read as detail rather than inference for a strong candidate.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve agreed with the key on 6/6. Answer letters are C, A, D, B, C, A: four letters used, no consecutive repetition.',
        repairs: [
          'Q31 option D regenerated during drafting: the earlier distractor (“to avoid drawing attention to a particular manufacturer”) was defensible, since the article does avoid brand names.',
          'Q33 option A regenerated during drafting: the earlier version (“variations on the original job”) was arguably true of tying a stem to a cane.',
        ],
      },
    },

    // ───────────────────────────── PART 6 ─────────────────────────────
    {
      partNumber: 6,
      briefId: 'CB-PILOT-017',
      blueprintId: null,
      styleCardId: 'SC-05',
      styleCardName: 'Culture, Travel & Community Feature',
      topic: 'Culture',
      subtopics: ['Festivals', 'Travel'],
      briefWorkingTitle: 'The week the streets change shape',
      titleCandidates: ['February is the busiest month', 'Forty-one barriers and a generator', 'Three days, eleven months'],
      title: 'February is the busiest month',
      titlePatternFamily: 'counter_intuitive_title',
      directions:
        'Part 6: Gapped text\nYou are going to read an article. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.',
      passage:
        'In February the festival is a shed on the edge of a farmyard, three miles outside the town it belongs to. Inside there are forty-one steel barriers, a generator under a tarpaulin, eleven trestle tables and a box of cable covers that somebody counts each winter and nobody ever repairs. The woman who does the counting has held the key for nine years. It is not a position anyone voted for, and she has twice tried to hand it on.\n\nThe date cannot move. The town’s other large event takes the last weekend in July, the school hall is booked a year ahead for the exhibition, and the two brass bands that play on the Saturday are committed elsewhere for the rest of the summer. (37) ___ Everything else in the calendar is arranged backwards from those three days, which is why the committee meets in the last week of January and not, as visitors assume, in June.\n\nThe constraint that shapes everything else is a road. The lane that runs through the middle of the town is the only route an ambulance can take to the villages north of it, and it cannot be closed for three days, or for one. (38) ___ The result is a festival that runs along two sides of a square and stops at a junction, with stewards at the crossing and a gap in the middle where the crowd thins out and has to be encouraged along.\n\nNot everyone accepts the square. A group on the committee, mostly the people who run the stalls, argue every year for a longer route through the residential streets to the east, which would double the frontage and let twice as many traders take part. (39) ___ The argument is settled the same way each time, by a show of hands that has never once gone to the longer route, and by the observation that the people who would live inside it are the ones who lend the trestle tables.\n\n(40) ___ By eleven on the Saturday the square is full, and the stewards at the northern crossing are doing the job that the shape of the route created: holding a line of people back for ninety seconds at a time while a car, and once an ambulance, goes through. Visitors take it for a piece of theatre. The stewards are volunteers who have been briefed twice, and their briefing is longer than any other on the list.\n\nSomething always goes. Two years ago the generator failed at four on the Sunday afternoon, twenty minutes before the last band, and there was no second one within thirty miles. (41) ___ The bands played the final half-hour unamplified, which several people afterwards said was the best part of the weekend, and the committee has since written a hired generator into a budget that does not really have room for it.\n\nBy the Tuesday the square is a square again. The barriers go back on the trailer on the Monday evening, in the rain, by whoever is still standing, and the count in the shed is always short by two or three, which nobody can explain and everybody has stopped investigating. (42) ___ What the town keeps is a resurfaced corner by the church, paid for out of the surplus three years ago, and a list of forty-one names that gets shorter every year and has never yet run out.',
      sentencePool: [
        'A) Against this, the residents’ representatives point out that a longer route means eleven more households cut off from their own driveways for a weekend.',
        'B) Visitors who come for the Saturday rarely notice any of this, and the committee has decided that this is the point.',
        'C) It was the farmer whose yard holds the shed who drove twenty miles that afternoon and came back with nothing.',
        'D) That leaves a single weekend in the middle of August, and it has left the same one for as long as anyone can remember.',
        'E) They will be counted again in February, along with the cable covers that still have not been repaired.',
        'F) It also removes the obvious circuit, the one every new committee member proposes in their first year.',
        'G) In August the argument stops mattering, because the barriers come out of the shed on the Thursday and the shape of the weekend is fixed.',
      ],
      items: [
        {
          n: 37,
          answer: 'D',
          rationale:
            'Backward: “That leaves” sums up the three commitments just listed. Forward: “those three days” in the next sentence needs the weekend to have been identified.',
        },
        {
          n: 38,
          answer: 'F',
          rationale:
            'Backward: “It also removes” refers to the road that cannot be closed. Forward: “The result is a festival that runs along two sides of a square” presupposes that the circuit has been ruled out.',
        },
        {
          n: 39,
          answer: 'A',
          rationale:
            'Backward: “Against this” answers the stallholders’ case. Forward: “The argument is settled the same way each time” requires two positions to exist.',
        },
        {
          n: 40,
          answer: 'G',
          rationale:
            'Opens the event section with a time shift to August and refers back to the settlement reached in the previous paragraph; “the barriers come out of the shed” also picks up paragraph one.',
        },
        {
          n: 41,
          answer: 'C',
          rationale:
            'Names who absorbed the failure, linking back to the farmyard of paragraph one, and explains why the next sentence has the bands playing unamplified.',
        },
        {
          n: 42,
          answer: 'E',
          rationale:
            '“They” refers to the barriers just loaded onto the trailer, and “counted again in February, along with the cable covers” closes the loop opened in paragraph one.',
        },
      ],
      unusedOption: 'B',
      unusedRationale:
        'Thematically plausible and written in the same register, but it resolves no reference and advances no step in the causal chain. At 40 it would repeat “Saturday” and drop the link to the settlement; at 42 it leaves “What the town keeps” without an antecedent.',
      quality: {
        warnings: [
          'Option B is the most temptable at gap 40; a reviewer should confirm that the loss of the backward link to the settlement is clear enough.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Each gap was re-solved with the six removed sentences shuffled and the extra included. Every gap resolved to one option; the extra fitted nowhere.',
        repairs: [
          'Sentence F was reopened during drafting because its first version also began with “That”, duplicating the cohesive mechanism of sentence D.',
          'Sentence C was rewritten so that the farmer returns with nothing, which keeps it consistent with the bands playing unamplified in the following sentence.',
        ],
      },
    },

    // ───────────────────────────── PART 7 ─────────────────────────────
    {
      partNumber: 7,
      briefId: 'CB-PILOT-018',
      blueprintId: null,
      styleCardId: 'SC-06',
      styleCardName: 'Multiple Profiles & Testimonies',
      topic: 'Education',
      subtopics: ['Languages', 'Learning'],
      briefWorkingTitle: 'Four ways of learning to speak',
      titleCandidates: ['Nobody is marking this', 'Four learners, four finishing lines', 'How do you know it is working?'],
      title: 'Nobody is marking this',
      titlePatternFamily: 'statement_title',
      directions:
        'Part 7: Multiple matching\nYou are going to read an article in which four people talk about learning a language without attending a class. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.',
      matchingIntro:
        'Four adults are learning the same language without going to a class. Each of them has arrived at a different way of deciding whether it is working.',
      sections: [
        {
          letter: 'A',
          name: 'Ruth',
          text:
            'I have eight months. That is not a boast, it is a deadline: the job moves in June and the family goes with it. So I meet the same person every Thursday in a café and we talk for an hour, half in each language. I prepare three subjects beforehand. I no longer write anything down during the hour, because the notebook was how I used to escape. My weakness is embarrassing. I can discuss my own work for twenty minutes and then fail completely to arrange a delivery or explain a leak to a plumber. If he corrects me in the middle of a sentence I lose the thread, and for the rest of the hour I avoid whatever caused it. A good Thursday is one where I said what I meant once and was understood.',
        },
        {
          letter: 'B',
          name: 'Nadia',
          text:
            'It began with my husband’s mother, who has never had a conversation with me that somebody else was not translating. I listen on the train, forty minutes each way, and I have got into the habit of playing the same recordings over and over until there is nothing left in them that surprises me. That has made me a strange sort of learner. Sitting at their table I can follow two people perfectly well, and the moment a third and a fourth join in I lose all of it and go back to smiling. In two years I have not said more than a sentence to anyone outside the family, so I have no idea what I sound like to a stranger. What I count now is how much of an evening I can follow without anyone stopping to explain it to me afterwards.',
        },
        {
          letter: 'C',
          name: 'Deniz',
          text:
            'I took the job because it paid better. Nobody mentioned that the kitchen ran in another language and that I would be the only one who did not have it. For the first fortnight I learned the instructions and nothing else: the words for pass me that, behind you, two minutes, start again. Grammar came a long way afterwards and some of it has still not arrived. I get corrected twenty times a shift and it does not trouble me in the slightest; on a Friday night nobody has time to be polite about it. Outside the building I am useless. I have never held a conversation in it that lasted five minutes. What I go by is whether I can be handed a job now and start it without checking that I have understood.',
        },
        {
          letter: 'D',
          name: 'Gerald',
          text:
            'I set myself the challenge the week after I retired, and I have completed something every single day since — seven hundred and forty-one days, which I mention only because the number is the whole difficulty. I have a large vocabulary that has never once left my head. I can recognise a word instantly and produce nothing. Twice I arranged to meet a speaker for coffee, and twice, I am sorry to say, I cancelled the day before with a reason that was not entirely true. What I have done instead is start on a newspaper column, which at least resists me. I am beginning to suspect, though I have not yet acted on it, that what I have been measuring for two years is my consistency rather than my language.',
        },
      ],
      items: [
        { n: 43, answer: 'A', prompt: 'Who was pushed into learning by a date that cannot be moved?', evidence: '‘the job moves in June and the family goes with it’' },
        { n: 44, answer: 'C', prompt: 'Who had no choice in the matter, because the people around them at work spoke nothing else?', evidence: '‘Nobody mentioned that the kitchen ran in another language’' },
        { n: 45, answer: 'D', prompt: 'Who admits to giving a dishonest reason for avoiding an arrangement?', evidence: '‘I cancelled the day before with a reason that was not entirely true’' },
        { n: 46, answer: 'B', prompt: 'Who has no sense of the impression they make on a listener?', evidence: '‘I have no idea what I sound like to a stranger’' },
        { n: 47, answer: 'A', prompt: 'Who gave up a study habit after realising it had been a way of avoiding difficulty?', evidence: '‘I no longer write anything down … the notebook was how I used to escape’' },
        { n: 48, answer: 'C', prompt: 'Who learned how to carry out tasks before understanding how the language works?', evidence: '‘For the first fortnight I learned the instructions and nothing else … Grammar came a long way afterwards’' },
        { n: 49, answer: 'B', prompt: 'Who copes with a conversation only while the number of speakers stays low?', evidence: '‘I can follow two people perfectly well, and the moment a third and a fourth join in I lose all of it’' },
        { n: 50, answer: 'A', prompt: 'Who can talk at length about their own field but not about practical everyday arrangements?', evidence: '‘I can discuss my own work for twenty minutes and then fail completely to arrange a delivery’' },
        { n: 51, answer: 'D', prompt: 'Who has come to doubt that what they have been counting reflects real ability?', evidence: '‘what I have been measuring for two years is my consistency rather than my language’' },
        { n: 52, answer: 'C', prompt: 'Who judges progress by being able to begin work without confirming they have understood?', evidence: '‘whether I can be handed a job now and start it without checking that I have understood’' },
      ],
      quality: {
        warnings: [
          'Q50 and Q44 both touch on a gap between one setting and another. Q50 is topic-based (own field versus domestic arrangements, A) and Q44 is about the trigger (C); a reviewer should confirm the two remain clearly separate.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'All ten questions resolved to a single profile. Distribution A×3, B×2, C×3, D×2; letter sequence A, C, D, B, A, C, B, A, D, C shows no repeating cycle.',
        repairs: [
          'Profile C was given the line “I have never held a conversation in it that lasted five minutes” so that Q50 cannot be answered from C as well as A.',
          'Profile C’s measure of progress was changed from the brief’s “how little he has to ask someone to repeat” to starting a task without checking, because the brief’s wording collided with profile B’s measure.',
        ],
      },
    },
  ],
};
