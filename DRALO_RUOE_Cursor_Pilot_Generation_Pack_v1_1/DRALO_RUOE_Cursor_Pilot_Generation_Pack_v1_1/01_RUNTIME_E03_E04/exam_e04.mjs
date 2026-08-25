// RUOE-PILOT-E04 — authored from the E03/E04 proposed briefs and Part 4 blueprint.
// Parts 1, 2, 3, 5, 6, 7 follow their Content Brief; Part 4 follows TBP-PILOT-EX04 only.

export const EXAM_E04 = {
  examId: 'RUOE-PILOT-E04',
  examFolder: 'EXAM-04',
  outputRoot: '05_OUTPUTS_PILOT_E04_v1_0',
  batchId: 'RUOE-PILOT-02',
  parts: [
    // ───────────────────────────── PART 1 ─────────────────────────────
    {
      partNumber: 1,
      briefId: 'CB-PILOT-019',
      blueprintId: null,
      styleCardId: 'SC-03',
      styleCardName: 'Personal Reflective Experience',
      topic: 'Health',
      subtopics: ['Mental Health', 'Daily Life'],
      briefWorkingTitle: 'The decisions I stopped making before nine',
      titleCandidates: ['Eleven before I left the flat', 'The tiring part came first', 'Choices, not tasks'],
      title: 'Eleven before I left the flat',
      titlePatternFamily: 'counted_detail_title',
      directions:
        'Part 1: Multiple-choice cloze\nFor questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap. There is an example at the beginning (0).',
      passage:
        'One ordinary Tuesday I counted every choice I (0) ___ before eight o’clock. Which shirt. Whether to wash up then or later. Whether to walk or take the bus. The total came (1) ___ eleven, and not one of them mattered.\n\nFor a year I had tried to (2) ___ down on work, assuming volume was the problem. I said no to things and left the office earlier. I still reached Friday feeling completely wrung (3) ___. It (4) ___ me an embarrassingly long time to notice that the tiring part of the day was over before the work began.\n\nSo I removed the choices instead: the same breakfast on weekdays, clothes settled on Sunday, one route to the station in all weathers. It sounds joyless. In (5) ___ it has been a relief.\n\nI will not (6) ___ that it solved anything larger. The afternoons are as long as ever, and at three o’clock I worry about the same things. I simply have a little more (7) ___ left for it, and rather less of the morning is (8) ___ up with deciding what to wear.',
      example: {
        number: 0,
        options: ['A) took', 'B) made', 'C) did', 'D) held'],
        answer: 'B',
        explanation: '“Make a choice” is the standard collocation.',
      },
      items: [
        {
          n: 1,
          options: ['A) at', 'B) up', 'C) to', 'D) on'],
          answer: 'C',
          category: 'dependent preposition',
          rationale: '“The total came to eleven” — “come to” is the fixed verb-plus-preposition for arriving at a sum.',
        },
        {
          n: 2,
          options: ['A) turn', 'B) cut', 'C) bring', 'D) put'],
          answer: 'B',
          category: 'phrasal / verb combination',
          rationale: '“Cut down on something” is the three-part verb for reducing. None of the others takes “down on” in this sense.',
        },
        {
          n: 3,
          options: ['A) up', 'B) off', 'C) down', 'D) out'],
          answer: 'D',
          category: 'fixed expression',
          rationale: '“Wrung out” is the fixed idiom for exhaustion. The image only combines with “out”.',
        },
        {
          n: 4,
          options: ['A) took', 'B) made', 'C) spent', 'D) gave'],
          answer: 'A',
          category: 'fixed expression',
          rationale: '“It took me a long time to …” is the fixed impersonal frame for elapsed effort.',
        },
        {
          n: 5,
          options: ['A) action', 'B) practice', 'C) progress', 'D) demand'],
          answer: 'B',
          category: 'fixed expression',
          rationale: '“In practice” is the standard contrast with how something sounds in principle.',
        },
        {
          n: 6,
          options: ['A) tell', 'B) inform', 'C) convince', 'D) pretend'],
          answer: 'D',
          category: 'semantic distinction / verb complementation',
          rationale:
            '“Pretend that …” takes a bare that-clause. “Tell”, “inform” and “convince” all require an object before the clause.',
        },
        {
          n: 7,
          options: ['A) power', 'B) energy', 'C) force', 'D) nerve'],
          answer: 'B',
          category: 'collocation',
          rationale: '“Have energy left” is the natural collocation for a personal reserve.',
        },
        {
          n: 8,
          options: ['A) held', 'B) filled', 'C) taken', 'D) used'],
          answer: 'C',
          category: 'phrasal / verb combination',
          rationale: '“Taken up with something” is the fixed expression for time being occupied.',
        },
      ],
      quality: {
        warnings: [
          'Q4 and Q5 both test fixed expressions and sit close together; a reviewer may prefer more separation.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve agreed with the key on 8/8. Letter sequence C, B, D, A, B, D, B, C: four letters used, no consecutive repetition.',
        repairs: [
          'Q2 regenerated during drafting: the first version gapped the particle in “cut down/back on work”, where both are natural. The verb is now gapped instead.',
          'Q3 regenerated during drafting: “worn out / worn down” were both defensible, so the adjective was changed to “wrung”, which takes only “out”.',
        ],
      },
    },

    // ───────────────────────────── PART 2 ─────────────────────────────
    {
      partNumber: 2,
      briefId: 'CB-PILOT-020',
      blueprintId: null,
      styleCardId: 'SC-02',
      styleCardName: 'Trend & Social Report',
      topic: 'Technology',
      subtopics: ['Transport', 'Travel'],
      briefWorkingTitle: 'Buses that only run when asked',
      titleCandidates: ['Nothing leaves until somebody asks', 'The frame with no timetable in it', 'A route assembled overnight'],
      title: 'Nothing leaves until somebody asks',
      titlePatternFamily: 'statement_title',
      directions:
        'Part 2: Open cloze\nFor questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap. There is an example at the beginning (0).',
      passage:
        'The aluminium frame that once held the timetable is still screwed to the post at the top of the lane, and there is (0) ___ inside it. That is not neglect. On this route the printed timetable has been done (9) ___ with altogether.\n\nPassengers book a seat online or by telephone the evening before, and the driver follows whatever route the bookings (10) ___ produced. The route was changed because the old bus had spent most of its day running empty. Anyone (11) ___ journeys are irregular now gets a vehicle that stops within a few minutes (12) ___ their own door.\n\nThere is a condition. A seat must be booked by nine the night before. (13) ___ the depot has no reason to send anything out. That assumes a telephone, a plan and a day’s notice, (14) ___ of which is any help when a lift falls through at eight in the morning.\n\nSo the service suits people who can arrange their week far better (15) ___ people who cannot, and (16) ___ is the second group who used to depend on the bus most.',
      example: { number: 0, answer: 'nothing' },
      items: [
        { n: 9, answer: 'away', category: 'phrasal-verb particle', rationale: '“Do away with” is the only three-part verb that fits.' },
        { n: 10, answer: 'have', category: 'auxiliary — present perfect', rationale: 'Required by “whatever route the bookings ___ produced”.' },
        { n: 11, answer: 'whose', category: 'relative pronoun (possessive)', rationale: '“Anyone whose journeys are irregular” — the relative modifies a following noun.' },
        { n: 12, answer: 'of', category: 'preposition in a fixed frame', rationale: '“Within a few minutes of somewhere” is the fixed frame for proximity.' },
        { n: 13, answer: 'Otherwise', category: 'linking adverb', rationale: 'Signals the negative consequence of not meeting the condition just stated.' },
        { n: 14, answer: 'none', category: 'quantifying pronoun', rationale: 'Three items have been listed, so “neither” is excluded and “none of which” is required.' },
        { n: 15, answer: 'than', category: 'comparative', rationale: 'Required by “far better”.' },
        { n: 16, answer: 'it', category: 'cleft pronoun', rationale: '“… and it is the second group who …” — the cleft structure needs the anticipatory subject.' },
      ],
      quality: {
        warnings: [],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve produced one answer for each gap and matched the key on 8/8. Gap 13 was checked specifically against “Then”, which does not carry the conditional consequence and reads oddly after a full stop.',
        repairs: [
          'Gap 9 regenerated during drafting: the first version gapped the preposition in “runs to/on a fixed schedule”, where both are defensible.',
          'Gap 12 regenerated during drafting: the first version gapped a duration preposition where “for” and “during” were equally natural.',
        ],
      },
    },

    // ───────────────────────────── PART 3 ─────────────────────────────
    {
      partNumber: 3,
      briefId: 'CB-PILOT-021',
      blueprintId: null,
      styleCardId: 'SC-05',
      styleCardName: 'Culture, Travel & Community Feature',
      topic: 'Entertainment',
      subtopics: ['Books', 'Lifestyle'],
      briefWorkingTitle: 'The shop that lends more than it sells',
      titleCandidates: ['The counter on a Saturday morning', 'Three of the first five', 'Not everything here is for sale'],
      title: 'The counter on a Saturday morning',
      titlePatternFamily: 'descriptive_title',
      directions:
        'Part 3: Word formation\nFor questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line. There is an example at the beginning (0).',
      passage:
        'Nothing on the counter is for sale. There is a tray of parcels waiting to be picked up, a jar of pens and a clipboard with a rota on it. The (0) ___ (OWN) took the shop on eleven years ago and has never questioned the (17) ___ (ARRANGE), which began as a favour and now runs itself.\n\nBy half past ten, three people have come in without buying anything. One leaves a parcel; another borrows a chair; a third asks (18) ___ (RELUCTANT) whether the book she bought last month can be exchanged, having found it (19) ___ (SUIT) for the course she is taking.\n\nNone of this reaches the (20) ___ (COLLECT) of figures the accountant wants each spring. The shop is barely (21) ___ (PROFIT), and the (22) ___ (WEEK) order from the wholesaler now carries a minimum it can only just meet. Asked why he tolerates the rest, he says that turning people away would hardly (23) ___ (WIDE) its appeal.\n\nIf it went, the (24) ___ (NEIGHBOUR) would lose its noticeboard, its parcel point and the only chair on the street that nobody pays to sit on.',
      example: { number: 0, stem: 'OWN', answer: 'owner', transformation: 'verb → agent noun' },
      items: [
        { n: 17, stem: 'ARRANGE', answer: 'arrangement', transformation: 'verb → noun' },
        { n: 18, stem: 'RELUCTANT', answer: 'reluctantly', transformation: 'adjective → adverb (-ly)' },
        { n: 19, stem: 'SUIT', answer: 'unsuitable', transformation: 'verb → adjective (negative prefix)' },
        { n: 20, stem: 'COLLECT', answer: 'collection', transformation: 'verb → noun' },
        { n: 21, stem: 'PROFIT', answer: 'profitable', transformation: 'noun → adjective' },
        { n: 22, stem: 'WEEK', answer: 'weekly', transformation: 'noun → adjective' },
        { n: 23, stem: 'WIDE', answer: 'widen', transformation: 'adjective → verb' },
        { n: 24, stem: 'NEIGHBOUR', answer: 'neighbourhood', transformation: 'noun → noun (British spelling)' },
      ],
      quality: {
        warnings: [
          'Q19 depends on the reader seeing that the customer wants to exchange the book, which is what forces the negative prefix.',
        ],
        qualityFails: [],
        blindSolveNotes: 'Blind-solve produced the keyed derivation on 8/8.',
        repairs: [
          'Item 19 was originally USE → unusable, which admitted “useless” as a second valid derivation of the same stem. The stem was changed to SUIT.',
          '“waiting to be collected” in paragraph one was rewritten as “waiting to be picked up” so that no form of the COLLECT family appears alongside item 20.',
        ],
      },
    },

    // ───────────────────────────── PART 4 ─────────────────────────────
    {
      partNumber: 4,
      briefId: null,
      blueprintId: 'TBP-PILOT-EX04',
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
        sentence1: 'Only Sam remembered to bring a map.',
        keyword: 'ONLY',
        sentence2Start: 'Sam was __________________ remembered to bring a map.',
        answer: 'the only one who',
        familyId: 'TF-13',
        familyName: 'Quantifiers, determiners & exclusivity',
      },
      items: [
        {
          n: 25,
          familyId: 'TF-10',
          familyName: 'Phrasal & multi-word verbs',
          targetStructure: 'get rid of',
          sentence1: 'Nobody has removed the old notices from the board yet.',
          keyword: 'RID',
          sentence2Start: 'Nobody __________________ the old notices from the board yet.',
          answer: 'has got rid of',
          fullAnswers: ['has got rid of'],
          markingPoints: [
            { id: 1, label: 'correctly tensed GET + RID', accepted: ['has got rid'] },
            { id: 2, label: 'preposition OF introducing the object', accepted: ['of'] },
          ],
          difficulty: 'B2-Core',
          distance: 'lexical_substitution_with_tense_recovery',
          notes:
            'The present-perfect frame blocks the stative “be rid of”, which cannot follow “Nobody has …”. British “got”, not “gotten”.',
        },
        {
          n: 26,
          familyId: 'TF-06',
          familyName: 'Modality & modal-perfect meaning',
          targetStructure: 'must have + past participle for deduction about the past',
          sentence1: 'I am quite sure that Daniel left his keys at the office.',
          keyword: 'MUST',
          sentence2Start: 'Daniel __________________ his keys at the office.',
          answer: 'must have left',
          fullAnswers: ['must have left'],
          markingPoints: [
            { id: 1, label: 'MUST HAVE', accepted: ['must have'] },
            { id: 2, label: 'past participle carrying the deduced event', accepted: ['left'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'grammatical_reformulation',
          notes:
            '“Quite sure” makes the certainty explicit, which excludes “might have” and “could have”. The statement is affirmative, so “can’t have” is excluded.',
        },
        {
          n: 27,
          familyId: 'TF-07',
          familyName: 'Tense, aspect & duration',
          targetStructure: 'this is the first time + present perfect',
          sentence1: 'I have never eaten oysters before.',
          keyword: 'TIME',
          sentence2Start: 'This is the __________________ oysters.',
          answer: 'first time I have eaten',
          fullAnswers: ['first time I have eaten', 'first time I’ve eaten'],
          markingPoints: [
            { id: 1, label: 'FIRST TIME as the fixed frame', accepted: ['first time'] },
            { id: 2, label: 'subject + present-perfect verb form', accepted: ['I have eaten', 'I’ve eaten'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'syntactic_restructuring',
          notes:
            'The contracted form is accepted as a controlled variant and maps to the same marking points. A past-simple continuation is the commonest wrong route and is not accepted.',
        },
        {
          n: 28,
          familyId: 'TF-03',
          familyName: 'Preference, wish & regret',
          targetStructure: 'would rather + subject + past simple',
          sentence1: 'Please do not tell anyone about this yet.',
          keyword: 'RATHER',
          sentence2Start: 'I __________________ anyone about this yet.',
          answer: 'would rather you didn’t tell',
          fullAnswers: ['would rather you didn’t tell', 'would rather you did not tell', '’d rather you didn’t tell'],
          markingPoints: [
            { id: 1, label: 'WOULD RATHER + second subject', accepted: ['would rather you', '’d rather you'] },
            { id: 2, label: 'negative past-simple verb required by the second-subject pattern', accepted: ['didn’t tell', 'did not tell'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'syntactic_restructuring',
          notes:
            'The preference concerns another person, so the to-infinitive route is unavailable. “Would prefer you not to” does not use the keyword.',
        },
        {
          n: 29,
          familyId: 'TF-14',
          familyName: 'Clause & phrase restructuring',
          targetStructure: 'wh-clause recast as a definite noun phrase',
          sentence1: 'Nobody knows exactly how deep the lake is.',
          keyword: 'DEPTH',
          sentence2Start: 'Nobody knows exactly __________________ the lake.',
          answer: 'the depth of',
          fullAnswers: ['the depth of'],
          markingPoints: [
            { id: 1, label: 'definite article + DEPTH as the nominalised head', accepted: ['the depth'] },
            { id: 2, label: 'preposition OF linking the noun phrase to its complement', accepted: ['of'] },
          ],
          difficulty: 'B2-Standard',
          distance: 'syntactic_restructuring',
          notes:
            'The trailing noun phrase “the lake” blocks both the wh-clause and the possessive “its depth”, so the nominalisation is the only route.',
        },
        {
          n: 30,
          familyId: 'TF-04',
          familyName: 'Passive & reporting structures',
          targetStructure: 'impersonal reporting with be thought to have + past participle',
          sentence1: 'People think that the fire started in the kitchen.',
          keyword: 'THOUGHT',
          sentence2Start: 'The fire __________________ in the kitchen.',
          answer: 'is thought to have started',
          fullAnswers: ['is thought to have started'],
          markingPoints: [
            { id: 1, label: 'passive BE + THOUGHT', accepted: ['is thought'] },
            { id: 2, label: 'TO HAVE + past participle carrying the completed event', accepted: ['to have started'] },
          ],
          difficulty: 'B2-Strong',
          distance: 'syntactic_restructuring',
          notes:
            'The subject is already raised, so the anticipatory “it is thought that” route does not fit. The past reference in sentence 1 requires the perfect infinitive.',
        },
      ],
      quality: {
        warnings: [
          'Q30 and E02 Q26 are both raised-subject passives with a reporting verb; the blueprint already flagged this for reviewer attention. The perfect infinitive is what separates them.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Adversarial alternate-route check found no second defensible answer. Answer lengths 3, 3, 4, 5, 5, 5 give a wider spread than E01.',
        repairs: [
          'Q25 regenerated during drafting: earlier frames (“We finally ___ the old sofa”) left “were rid of” grammatically available. The present-perfect frame with “Nobody has …” closes that route.',
        ],
      },
    },

    // ───────────────────────────── PART 5 ─────────────────────────────
    {
      partNumber: 5,
      briefId: 'CB-PILOT-022',
      blueprintId: null,
      styleCardId: 'SC-04',
      styleCardName: 'Narrative Story',
      topic: 'Education',
      subtopics: ['Skills', 'Work'],
      briefWorkingTitle: 'Learning to read a roof',
      titleCandidates: ['Knowing what to leave alone', 'The difficulty she had trained for', 'Eight or nine things wrong'],
      title: 'Knowing what to leave alone',
      titlePatternFamily: 'gerund_title',
      directions:
        'Part 5: Multiple choice\nYou are going to read an article. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      passage:
        'The first roof she went up alone was a small terrace in the older part of town, and the problem, she had been told, was a leak above the back bedroom. She found the slipped slate within a minute. What she could not work out, kneeling on the boards with the wind coming off the hill, was whether the slate had slipped because of the nail or because the batten underneath it had gone soft. Nobody had covered that in six months of training, because it was not a thing anybody could cover.\n\nShe was forty-three. For nineteen years she had run a scheduling office for a haulage firm, and when it closed she had spent most of the redundancy money on a course, boots and a van. What she had prepared for was the physical part. She had expected to be cold, to ache, to fear the height and to be slower than men fifteen years younger. All of that turned out to be true and none of it turned out to matter much. She was cold and she got used to it. She was slower and she got faster.\n\nThe thing she had not accounted for was judgement. A roof does not present a single fault. It presents eight or nine things that are wrong, of which one is causing the damage, three will cause damage within five years, and the rest have been wrong since 1962 and will outlast everybody. Deciding which is which, from a ladder, in November, with a customer standing in the garden asking what it will come to, is the job. Nobody had said so.\n\nShe got it wrong in her third week. On a bungalow with a flat extension she found a soft patch, decided it was the source of the water inside, and cut it out. It was not the source. The water had been running along a joist from a cracked outlet fifteen feet away, and she had opened two square metres of roof in the last week of October for nothing. Terry, who owned the firm and had said almost nothing to her since she started, went back next morning, made it watertight and did not charge. He mentioned it once, six weeks later, only to say he had done the same thing on a school in 1998.\n\nHer old job was no use at all in the moments that mattered and unexpectedly useful in the ones that did not. She could not read a roof, but she could read a diary. Within a month she had rebuilt the way the firm booked its work, and Terry, who had been quoting jobs on the backs of delivery notes, let her. On site, though, the office habit was a liability. She wanted to establish the facts before acting, and there are days in December when the facts arrive at the same speed as the rain.\n\nWhat taught her was watching. Terry would go up a ladder, stand for a while, and come down without touching anything. The first few times she assumed he had found nothing. Then she began to notice what he looked at, and in what order, and she started asking why he left things alone rather than why he did them.\n\nIn February she was sent to a farmhouse with three separate problems and a budget for one. She was on the roof for twenty minutes. She came down, told the owner that two of them could wait until the spring after next, and explained which one could not and why. The owner argued. She did not move, because she had looked at the same thing Terry would have looked at, and she had seen it.',
      items: [
        {
          n: 31,
          questionType: 'detail',
          prompt: 'What was the difficulty on the first roof she worked on alone?',
          options: [
            'A) She could not find where the water was getting in.',
            'B) She could not decide what had caused the slate to move.',
            'C) The weather made it impossible to finish the repair.',
            'D) She had never been shown how to replace a slate.',
          ],
          answer: 'B',
          evidence:
            '‘whether the slate had slipped because of the nail or because the batten underneath it had gone soft.’',
          rationale: 'She located the fault “within a minute”, which rules out A; C and D are not in the text.',
        },
        {
          n: 32,
          questionType: 'attitude',
          prompt: 'How are her expectations before starting presented?',
          options: [
            'A) As unrealistic about how much she could physically manage.',
            'B) As shaped by advice other roofers had given her.',
            'C) As accurate but concerned with the wrong part of the job.',
            'D) As something she abandoned as soon as the work began.',
          ],
          answer: 'C',
          evidence: '‘All of that turned out to be true and none of it turned out to matter much.’',
          rationale:
            'The sentence confirms the expectations were correct and simultaneously beside the point, which is exactly C and rules out A and D.',
        },
        {
          n: 33,
          questionType: 'purpose',
          prompt: 'The description of the eight or nine things wrong with a roof is included in order to show',
          options: [
            'A) that most houses in the town were in poor repair.',
            'B) why customers are often unwilling to pay for the work.',
            'C) how much technical knowledge the trade really demands.',
            'D) that the real skill lies in choosing what to act on.',
          ],
          answer: 'D',
          evidence: '‘Deciding which is which … is the job.’',
          rationale:
            'The list exists to make the case for judgement over technique, which C misreads as knowledge.',
        },
        {
          n: 34,
          questionType: 'inference',
          prompt: 'What does Terry’s response to her mistake suggest?',
          options: [
            'A) He regarded it as a normal part of learning the trade.',
            'B) He was worried about the effect on the firm’s reputation.',
            'C) He had decided she should not work unsupervised again.',
            'D) He had not understood how much the error had cost.',
          ],
          answer: 'A',
          evidence:
            '‘He mentioned it once, six weeks later, and only to say that he had done the same thing on a school in 1998.’',
          rationale:
            'He repairs it, does not charge, and refers to his own identical error. Nothing supports B, C or D.',
        },
        {
          n: 35,
          questionType: 'detail',
          prompt: 'In what way was her previous job a disadvantage on site?',
          options: [
            'A) It had left her unfit for sustained physical work.',
            'B) It made her want to be certain before she acted.',
            'C) It had given her habits her colleagues objected to.',
            'D) It meant she spent too long on the firm’s paperwork.',
          ],
          answer: 'B',
          evidence:
            '‘She wanted to establish the facts before acting, and there are days in December when the facts arrive at the same speed as the rain.’',
          rationale:
            'The paragraph separates where the old job helped, the diary and the booking, from where it hindered, which is the wish for certainty.',
        },
        {
          n: 36,
          questionType: 'global inference',
          prompt: 'What does the closing scene show about what she has learned?',
          options: [
            'A) That she is now prepared to disagree with a customer.',
            'B) That she has become as quick on a roof as her employer.',
            'C) That she can now judge what does not need attention.',
            'D) That she would rather work on her own than with Terry.',
          ],
          answer: 'C',
          evidence:
            '‘told the owner that two of them could wait until the spring after next, and explained which one could not and why.’',
          rationale:
            'A describes the surface of the scene rather than the skill; the point is the decision about what to leave, which the title also carries.',
        },
      ],
      quality: {
        warnings: [
          'Q36 option A is defensible as a description of what happens in the scene; the stem asks what it shows about what she has learned, which selects C.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Blind-solve agreed with the key on 6/6. Answer letters B, C, D, A, B, C: four letters used, no consecutive repetition.',
        repairs: [],
      },
    },

    // ───────────────────────────── PART 6 ─────────────────────────────
    {
      partNumber: 6,
      briefId: 'CB-PILOT-023',
      blueprintId: null,
      styleCardId: 'SC-01',
      styleCardName: 'Curiosity & Explanatory Article',
      topic: 'Environment',
      subtopics: ['Conservation', 'Wildlife'],
      briefWorkingTitle: 'Bringing back a river’s summer',
      titleCandidates: ['The cheapest thing they did', 'Last on the list', 'What the trees were actually for'],
      title: 'The cheapest thing they did',
      titlePatternFamily: 'superlative_title',
      directions:
        'Part 6: Gapped text\nYou are going to read an article. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.',
      passage:
        'Most of the money went into the riverbed. Two winters of work, a great deal of heavy machinery and a budget that had taken four years to assemble were spent on reshaping two miles of a small river in a valley in the west of England. The measure that made the difference cost less than a tenth of that, took a single winter to carry out and had been ranked last on the list of options. It was planting trees along the bank, an item that had been costed in a single afternoon and very nearly left out.\n\nThe problem was easy enough to describe. The river had been straightened and deepened a century earlier to drain the fields beside it, and the fish that had once spawned along that stretch no longer did. (37) ___ The team therefore proposed two measures: restoring some of the bends the river had lost, and putting gravel back into a bed that had been scoured down to bare clay.\n\nThe bends came first, and they worked, up to a point. Within two seasons the water had slowed where it was meant to slow, silt had begun to collect on the inside of each curve, and a stretch that had been uniformly grey was visibly varied. Insect life increased. (38) ___ The fish, however, did not come back in any number that anybody was willing to report.\n\n(39) ___ Sixty lorry-loads of graded gravel were laid over eleven months, at a cost that consumed most of what remained. For one summer the bed looked exactly as the drawings had promised. Then, in the second August, its surface turned the same dull green as the old one, and by September a good deal of it had silted over again.\n\nNeither measure had touched the thing that was actually limiting the river, and it took an unusually hot summer to make that obvious. (40) ___ Warm water holds less oxygen than cold water, and below a certain point it holds too little for the eggs of the species the scheme was meant to bring back, whatever the gravel beneath them looks like. The straightening had done more than alter the shape of the channel. It had removed almost every tree that used to stand over it.\n\nPlanting was the last item on the list because it was the cheapest and the slowest. Two thousand young trees went in along both banks over a single winter, mostly alder and willow, protected from deer by tubes that the volunteers still complain about. Nothing visible happened for three years, which is roughly how long it takes a willow to cast a useful shadow. (41) ___ The difference showed up first in the insects and then, the following year, in the fish.\n\nThe team now begins with temperature. Before anything is dug or delivered, somebody spends a summer measuring the water at the warmest hour of the warmest weeks, and the results decide the order of everything else. (42) ___ On a shaded upland stream, or on a river whose difficulty really is the absence of gravel, planting more trees would achieve very little. What this valley demonstrated was not that shade always matters, but that the cheapest item on a list is not the same as the least important one.',
      sentencePool: [
        'A) By the fifth summer the shaded sections were running two or three degrees cooler than the open ones at the same hour of the day.',
        'B) Both of the obvious explanations concerned the shape of the channel: the water ran too fast, and there was nowhere for eggs to settle.',
        'C) Rivers of this kind were once common across the whole of lowland Britain, and only a handful now run as they used to.',
        'D) The stretch had no shade at all, and in July the water in it reached temperatures that would have been unremarkable in a pond.',
        'E) The second measure was more expensive than the first and, at the outset, a good deal more convincing.',
        'F) That is a rule about sequence rather than about trees, and it does not transfer everywhere.',
        'G) Even so, the change was easier to see than to measure, and the counts taken that autumn were much the same as before.',
      ],
      items: [
        {
          n: 37,
          answer: 'B',
          rationale:
            'Backward: the two explanations follow directly from the straightening and deepening. Forward: “The team therefore proposed two measures” needs a diagnosis to reason from, and the two measures answer the two explanations in order.',
        },
        {
          n: 38,
          answer: 'G',
          rationale:
            '“Even so” concedes the visible improvements just listed, and the following “however” about the fish depends on the counts already having been described as unchanged.',
        },
        {
          n: 39,
          answer: 'E',
          rationale:
            'Opens the paragraph by contrasting the second measure with the first, which is what allows the next sentence to start straight in with the lorry-loads.',
        },
        {
          n: 40,
          answer: 'D',
          rationale:
            'Backward: it explains what the hot summer made obvious. Forward: the oxygen sentence only makes sense once high water temperature has been introduced.',
        },
        {
          n: 41,
          answer: 'A',
          rationale:
            'Supplies the observable change after the three-year delay and gives “The difference” in the following sentence something to refer to.',
        },
        {
          n: 42,
          answer: 'F',
          rationale:
            '“That is a rule about sequence” refers back to the new measuring procedure, and “it does not transfer everywhere” sets up the two counter-examples that follow.',
        },
      ],
      unusedOption: 'C',
      unusedRationale:
        'Plausible in register and subject, but it resolves no reference and advances no step in the causal chain. At 37 it fails to supply the diagnosis that “therefore” needs; at 42 it offers a general observation where a limiting condition is required.',
      quality: {
        warnings: [
          'Gap 39 is a paragraph-initial gap; the brief prefers gaps inside paragraphs, and five of the six are.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'Each gap was re-solved with the pool shuffled. Every gap resolved to one option and the extra fitted nowhere.',
        repairs: [
          'The observable-change sentence was moved out of the three-year-delay sentence during drafting so that gap 41 carries the outcome rather than the delay.',
        ],
      },
    },

    // ───────────────────────────── PART 7 ─────────────────────────────
    {
      partNumber: 7,
      briefId: 'CB-PILOT-024',
      blueprintId: null,
      styleCardId: 'SC-06',
      styleCardName: 'Multiple Profiles & Testimonies',
      topic: 'Travel',
      subtopics: ['Accommodation', 'Technology'],
      briefWorkingTitle: 'Four people who let out a room',
      titleCandidates: ['Where each of them draws the line', 'Four hosts, four sets of rules', 'What they will not hand over'],
      title: 'Where each of them draws the line',
      titlePatternFamily: 'descriptive_title',
      directions:
        'Part 7: Multiple matching\nYou are going to read an article in which four people talk about letting out accommodation. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.',
      matchingIntro:
        'Four people let out accommodation and take their bookings online. Each has decided differently what to hand over to the system and what to keep doing themselves.',
      sections: [
        {
          letter: 'A',
          name: 'Priya',
          text:
            'The rent went up by two hundred a month and I had a spare room. That is the whole story, and I am not going to dress it up as anything else. What nobody warns you about is that there is no version of this where you finish for the day. My flat is the business. So I have made rules and I keep to them. I take bookings from Monday to Thursday and the weekend is mine, whatever anybody offers me for it. I used to do breakfast and I stopped, because breakfast means talking to a stranger at seven in the morning before I have decided who I am that day. I answer messages twice, once at eight and once at six, and anyone who needs a faster reply can book elsewhere.',
        },
        {
          letter: 'B',
          name: 'Marged',
          text:
            'The building had stood empty for eleven years and the roof was going. I did the conversion because I would rather it was used than sold, and letting it was the only way to justify what that cost. Guests ask for things I am not going to provide. They want a hot tub, they want the yard lit at night, they want the cattle to be quieter than cattle are. I say no, my rating has come down for it, and I have decided I can live with that. What I do instead is write to people properly before they arrive and set out exactly what the place is: a working farm, with the hours and the mud that go with one. The ones who take it for a full week have understood by the third day.',
        },
        {
          letter: 'C',
          name: 'Owen',
          text:
            'It started as a favour for a neighbour who had bought a flat and never lived in it. There are three now, and I treat it as what it is, which is a job with a defined scope. The locks are automatic, the messages are automatic, the cleaners work to a schedule I set in January, and the pricing adjusts itself. All of that took a year to build and it runs without me. The one thing I have never handed over is the arrival. I meet every guest, I give them ten minutes, and after that they do not see me. People occasionally complain that the whole thing feels impersonal. What they are objecting to is work they cannot see. The three flats are deliberately identical, and that is not laziness, it is the point.',
        },
        {
          letter: 'D',
          name: 'Josephine',
          text:
            'I have been letting rooms since long before any of this happened on a screen. The walkers came past the gate, they needed a bed, and the house has nine of them and one of me. What changed was not the guests, who are much as they always were, but the speed everyone now expects. Somebody messages at half past ten at night and is put out that I have not replied by eleven; in August I am not going to reply by eleven, and I gave up apologising for that some years ago. I still keep the diary, the paper one, and where the diary and the system disagree the diary is right. It has been wrong twice, in fairness, and on both occasions I found the second party a bed here anyway.',
        },
      ],
      items: [
        { n: 43, answer: 'B', prompt: 'Who began letting because a building would otherwise have been lost?', evidence: '‘The building had stood empty for eleven years and the roof was going … I would rather it was used than sold’' },
        { n: 44, answer: 'A', prompt: 'Who withdrew something they used to provide because of the conversation it forced?', evidence: '‘I used to do breakfast and I stopped, because breakfast means talking to a stranger at seven in the morning’' },
        { n: 45, answer: 'D', prompt: 'Who absorbed the consequences of an error made by the booking system?', evidence: '‘It has been wrong twice … on both occasions I found the second party a bed here anyway’' },
        { n: 46, answer: 'C', prompt: 'Who believes that complaints are really about effort the guest never sees?', evidence: '‘What they are objecting to is work they cannot see’' },
        { n: 47, answer: 'A', prompt: 'Who restricts the days on which guests may stay in order to keep part of the week private?', evidence: '‘I take bookings from Monday to Thursday and the weekend is mine’' },
        { n: 48, answer: 'B', prompt: 'Who has accepted a lower score rather than supply what visitors ask for?', evidence: '‘I say no, my rating has come down for it, and I have decided I can live with that’' },
        { n: 49, answer: 'C', prompt: 'Who keeps the places they look after indistinguishable from one another on purpose?', evidence: '‘The three flats are deliberately identical, and that is not laziness, it is the point’' },
        { n: 50, answer: 'D', prompt: 'Who used to excuse themselves for replying slowly and has given that up?', evidence: '‘I gave up apologising for that some years ago’' },
        { n: 51, answer: 'A', prompt: 'Who is direct about having started purely for the money?', evidence: '‘The rent went up by two hundred a month … I am not going to dress it up as anything else’' },
        { n: 52, answer: 'B', prompt: 'Who tells visitors in advance what the surroundings will actually be like?', evidence: '‘write to people properly before they arrive and set out exactly what the place is: a working farm’' },
      ],
      quality: {
        warnings: [
          'Q47 and Q50 both concern a boundary the host has set. Q47 is about days of the week (A) and Q50 about response time (D); the two are separated by the wording, but a reviewer should confirm it.',
        ],
        qualityFails: [],
        blindSolveNotes:
          'All ten questions resolved to a single profile. Distribution A×3, B×3, C×2, D×2; letter sequence B, A, D, C, A, B, C, D, A, B shows no repeating cycle.',
        repairs: [
          'Profile A’s message rule was left as a rule rather than an apology, so that Q50 selects D alone.',
          'Profile D’s winter single-night refusal was removed during drafting because it duplicated the “restricted availability” dimension already carried by profile A at Q47.',
        ],
      },
    },
  ],
};
