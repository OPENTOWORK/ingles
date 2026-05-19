/** Configuración de temas de Vocabulary (teoría + ejercicios). */
export const VOCABULARY_TOPICS = {
  'synonyms-and-antonyms': {
    title: 'Synonyms and Antonyms',
    description: 'Expand your range of expression by choosing the right word with similar or opposite meaning.',
    level: 'B1',
    sections: [
      {
        title: 'What Are Synonyms and Antonyms?',
        icon: '🔄',
        intro:
          'Synonyms are words with similar meanings; antonyms are words with opposite meanings. Using them well makes your English more precise and natural.',
        bullets: [
          'Synonyms are never 100% identical — register and collocations matter',
          'Antonyms can be gradable (hot ↔ cold) or complementary (alive ↔ dead)',
          'Exams often test subtle differences between close synonyms',
        ],
        table: {
          caption: 'Common synonym pairs',
          headers: ['Word', 'Synonym', 'Nuance'],
          rows: [
            ['big', 'large', 'neutral / formal'],
            ['happy', 'glad', 'glad = slightly informal'],
            ['important', 'crucial', 'crucial = stronger'],
            ['start', 'commence', 'commence = formal'],
          ],
        },
        examples: [
          { es: 'Es un problema importante', en: 'It is a crucial issue' },
          { es: 'Estoy muy contento', en: 'I am absolutely delighted' },
        ],
      },
      {
        title: 'Choosing the Best Word in Context',
        icon: '🎯',
        intro:
          'In Use of English and writing tasks, the correct option depends on collocation, tone, and grammar — not only meaning.',
        bullets: [
          'Check what words typically go together (make a decision, not do a decision)',
          'Formal writing prefers Latinate synonyms (obtain vs get)',
          'Read the whole sentence before choosing a synonym',
        ],
      },
    ],
    exercises: {
      multipleChoice: [
        {
          question: 'Choose the best synonym for "essential":',
          options: ['optional', 'vital', 'minor', 'rare'],
          correctAnswer: 'vital',
          explanation: '"Vital" means extremely important, like essential.',
        },
        {
          question: 'What is the antonym of "generous"?',
          options: ['kind', 'selfish', 'polite', 'brave'],
          correctAnswer: 'selfish',
          explanation: 'Generous ↔ selfish are opposites in character.',
        },
        {
          question: 'Which word is closest in meaning to "purchase"?',
          options: ['sell', 'buy', 'borrow', 'lend'],
          correctAnswer: 'buy',
          explanation: 'Purchase = buy (more formal).',
        },
        {
          question: 'Antonym of "ancient":',
          options: ['old', 'modern', 'historic', 'aged'],
          correctAnswer: 'modern',
          explanation: 'Ancient ↔ modern.',
        },
        {
          question: 'Best synonym for "difficult" in formal writing:',
          options: ['easy', 'challenging', 'tiny', 'quick'],
          correctAnswer: 'challenging',
          explanation: 'Challenging is a common formal alternative.',
        },
      ],
      fillBlanks: [
        { text: 'The weather was ___ (hot) so we stayed inside.', blanks: [{ answer: 'freezing', alternatives: ['freezing', 'cold'] }] },
        { text: 'She gave a ___ (short) summary of the report.', blanks: [{ answer: 'brief', alternatives: ['brief', 'concise'] }] },
        { text: 'His answer was completely ___ (wrong).', blanks: [{ answer: 'incorrect', alternatives: ['incorrect', 'wrong'] }] },
      ],
      trueFalse: [
        {
          statements: [
            { text: 'Synonyms always share exactly the same meaning.', correct: false },
            { text: 'Antonyms can help you understand a word by contrast.', correct: true },
          ],
        },
      ],
    },
  },
  'word-families-and-prefixes': {
    title: 'Word Families and Prefixes',
    description: 'Build new words from roots, prefixes, and suffixes — key for Word Formation tasks.',
    level: 'B1',
    sections: [
      {
        title: 'Word Families',
        icon: '🌳',
        intro:
          'A word family shares the same root (e.g. create → creative → creativity → recreate).',
        bullets: [
          'Noun, verb, adjective, and adverb forms often share a root',
          'Learn the stress shift: PHOtograph vs phoTOgraphy',
          'Word Formation exams test the correct part of speech',
        ],
        table: {
          caption: 'Example family: act',
          headers: ['Form', 'Word'],
          rows: [
            ['Verb', 'act'],
            ['Noun', 'action / actor'],
            ['Adjective', 'active'],
            ['Adverb', 'actively'],
          ],
        },
      },
      {
        title: 'Common Prefixes',
        icon: '➕',
        intro: 'Prefixes change meaning; they help you guess unknown words in reading.',
        bullets: ['un- / in- / im- = not (unhappy, invisible)', 're- = again (rewrite)', 'pre- = before (preview)', 'over- = too much (overwork)'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'The noun form of "develop" is:', options: ['developed', 'development', 'developing', 'developer only'], correctAnswer: 'development', explanation: 'development is the standard noun.' },
        { question: 'Which prefix means "not"?', options: ['re-', 'pre-', 'un-', 'over-'], correctAnswer: 'un-', explanation: 'un- often negates adjectives.' },
        { question: '"Rewrite" means:', options: ['write before', 'write again', 'write too much', 'not write'], correctAnswer: 'write again', explanation: 're- = again.' },
        { question: 'Adjective from "success":', options: ['successly', 'successful', 'successing', 'successment'], correctAnswer: 'successful', explanation: 'successful + successfully (adv).' },
        { question: 'Opposite of "legal" with a prefix:', options: ['unlegal', 'illegal', 'nonlegal', 'dislegal'], correctAnswer: 'illegal', explanation: 'il- before l (illegal).' },
      ],
      fillBlanks: [
        { text: 'She showed great ___ (create) in the project.', blanks: [{ answer: 'creativity', alternatives: ['creativity'] }] },
        { text: 'The document is completely ___ (visible).', blanks: [{ answer: 'invisible', alternatives: ['invisible'] }] },
      ],
      trueFalse: [{ statements: [{ text: 'Word families help in Word Formation exercises.', correct: true }] }],
    },
  },
  'phrasal-verbs-essentials': {
    title: 'Phrasal Verbs Essentials',
    description: 'Master high-frequency phrasal verbs for exams and everyday English.',
    level: 'B1',
    sections: [
      {
        title: 'What Is a Phrasal Verb?',
        icon: '🔀',
        intro: 'A phrasal verb = verb + particle (up, out, on). The meaning is often idiomatic.',
        bullets: ['Particles can change the meaning completely (give up ≠ give)', 'Some phrasal verbs are separable (turn the light on)', 'Learn them in context, not as isolated lists'],
        table: {
          caption: 'High-frequency phrasal verbs',
          headers: ['Phrasal verb', 'Meaning', 'Example'],
          rows: [
            ['look after', 'take care of', 'She looks after her brother'],
            ['give up', 'stop trying', 'Do not give up'],
            ['find out', 'discover', 'We found out the truth'],
            ['put off', 'postpone', 'They put off the meeting'],
          ],
        },
      },
    ],
    exercises: {
      multipleChoice: [
        { question: '"Give up" means:', options: ['donate', 'stop trying', 'stand up', 'return'], correctAnswer: 'stop trying', explanation: 'give up = surrender / quit.' },
        { question: 'Choose the correct particle: look ___ the children', options: ['after', 'before', 'under', 'through'], correctAnswer: 'after', explanation: 'look after = take care of.' },
        { question: '"Put off" means:', options: ['postpone', 'wear', 'remove', 'switch on'], correctAnswer: 'postpone', explanation: 'put off = delay.' },
        { question: '"Find out" means:', options: ['discover', 'lose', 'search', 'hide'], correctAnswer: 'discover', explanation: 'find out = learn information.' },
        { question: 'Separable phrasal verb example:', options: ['depend on', 'look after', 'turn on', 'look like'], correctAnswer: 'turn on', explanation: 'turn the TV on / turn on the TV.' },
      ],
      fillBlanks: [
        { text: 'I need to ___ (find out) what time the train leaves.', blanks: [{ answer: 'find out', alternatives: ['find out'] }] },
      ],
      trueFalse: [{ statements: [{ text: 'All phrasal verbs are separable.', correct: false }] }],
    },
  },
  'academic-vocabulary': {
    title: 'Academic Vocabulary',
    description: 'Core academic words for essays, reports, and advanced exams.',
    level: 'B2',
    sections: [
      {
        title: 'Academic Word List Basics',
        icon: '🎓',
        intro: 'Academic vocabulary appears across subjects: analyse, concept, establish, indicate, significant.',
        bullets: ['Prefer precise verbs instead of "get", "do", "make"', 'Use linking words to structure arguments', 'Avoid repetition by using synonyms carefully'],
        table: {
          caption: 'Useful academic verbs',
          headers: ['Instead of', 'Use'],
          rows: [
            ['show', 'demonstrate / indicate'],
            ['think', 'argue / maintain'],
            ['use', 'employ / utilise'],
            ['help', 'facilitate / enable'],
          ],
        },
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Best academic alternative for "big":', options: ['tiny', 'substantial', 'funny', 'quick'], correctAnswer: 'substantial', explanation: 'substantial = considerable.' },
        { question: '"Analyse" means:', options: ['ignore', 'examine in detail', 'copy', 'forget'], correctAnswer: 'examine in detail', explanation: 'analyse = study carefully.' },
        { question: 'Formal word for "also":', options: ['plus', 'furthermore', 'yeah', 'so'], correctAnswer: 'furthermore', explanation: 'furthermore / moreover in essays.' },
        { question: '"Significant" means:', options: ['unimportant', 'meaningful / important', 'small', 'random'], correctAnswer: 'meaningful / important', explanation: 'significant = important.' },
        { question: 'Best collocation: ___ a conclusion', options: ['do', 'make', 'reach', 'take'], correctAnswer: 'reach', explanation: 'reach/draw a conclusion.' },
      ],
      fillBlanks: [{ text: 'The results ___ (show) a clear trend.', blanks: [{ answer: 'indicate', alternatives: ['indicate', 'demonstrate'] }] }],
      trueFalse: [{ statements: [{ text: 'Academic English avoids contractions in formal essays.', correct: true }] }],
    },
  },
  'topic-lexis-education-work': {
    title: 'Topic Lexis: Education and Work',
    description: 'Vocabulary for school, university, jobs, and careers.',
    level: 'B1',
    sections: [
      {
        title: 'Education',
        icon: '🏫',
        intro: 'Key words: curriculum, assignment, degree, tuition, scholarship, graduate.',
        bullets: ['Verbs: enrol, attend, revise, pass/fail an exam', 'People: pupil (school), student, lecturer, employer'],
      },
      {
        title: 'Work and Careers',
        icon: '💼',
        intro: 'Key words: vacancy, application, interview, promotion, colleague, salary.',
        bullets: ['apply for a job, get promoted, work overtime', 'skills: teamwork, leadership, time management'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Money paid for university study:', options: ['salary', 'tuition', 'rent', 'fine'], correctAnswer: 'tuition', explanation: 'tuition fees.' },
        { question: 'To officially join a course:', options: ['enrol', 'fire', 'resign', 'retire'], correctAnswer: 'enrol', explanation: 'enrol = register.' },
        { question: 'A person you work with:', options: ['colleague', 'customer', 'patient', 'audience'], correctAnswer: 'colleague', explanation: 'colleague = coworker.' },
        { question: 'Moving to a higher position:', options: ['promotion', 'dismissal', 'holiday', 'break'], correctAnswer: 'promotion', explanation: 'get promoted.' },
        { question: 'Document sent when applying for a job:', options: ['CV / résumé', 'invoice', 'recipe', 'map'], correctAnswer: 'CV / résumé', explanation: 'CV = curriculum vitae.' },
      ],
      fillBlanks: [{ text: 'She got a ___ (grant) to study abroad.', blanks: [{ answer: 'scholarship', alternatives: ['scholarship'] }] }],
      trueFalse: [{ statements: [{ text: '"Lecturer" and "teacher" always mean the same.', correct: false }] }],
    },
  },
  'topic-lexis-health-lifestyle': {
    title: 'Topic Lexis: Health and Lifestyle',
    description: 'Words for health, fitness, habits, and wellbeing.',
    level: 'B1',
    sections: [
      {
        title: 'Health',
        icon: '🏥',
        intro: 'Symptoms, treatment, prevention: ache, infection, recover, prescription, surgery.',
        bullets: ['have a headache / catch a cold', 'see a doctor, take medicine', 'healthy diet, regular exercise'],
      },
      {
        title: 'Lifestyle',
        icon: '🥗',
        intro: 'Habits and routines: balanced diet, sedentary lifestyle, wellbeing, stress.',
        bullets: ['give up smoking, cut down on sugar', 'mental health matters in modern exams'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Paper from the doctor for medicine:', options: ['prescription', 'subscription', 'description', 'preparation'], correctAnswer: 'prescription', explanation: 'prescription.' },
        { question: 'To get better after illness:', options: ['recover', 'infect', 'injure', 'cough'], correctAnswer: 'recover', explanation: 'recover from an illness.' },
        { question: 'Not moving enough — ___ lifestyle:', options: ['active', 'sedentary', 'wild', 'rural'], correctAnswer: 'sedentary', explanation: 'sedentary = sitting too much.' },
        { question: 'Pain in your head:', options: ['headache', 'stomachache', 'toothache', 'backache'], correctAnswer: 'headache', explanation: 'headache.' },
        { question: 'Eating a variety of foods in moderation:', options: ['balanced diet', 'fast food only', 'starvation', 'poison'], correctAnswer: 'balanced diet', explanation: 'balanced diet.' },
      ],
      fillBlanks: [{ text: 'He needs to ___ (reduce) stress at work.', blanks: [{ answer: 'reduce', alternatives: ['reduce', 'lower'] }] }],
      trueFalse: [{ statements: [{ text: '"Symptom" means a sign of illness.', correct: true }] }],
    },
  },
  'topic-lexis-technology-media': {
    title: 'Topic Lexis: Technology and Media',
    description: 'Digital life, social media, and modern communication vocabulary.',
    level: 'B2',
    sections: [
      {
        title: 'Technology',
        icon: '💻',
        intro: 'device, software, download, cybersecurity, artificial intelligence, innovation.',
        bullets: ['go viral, stream content, scroll through feeds', 'privacy settings, data breach'],
      },
      {
        title: 'Media',
        icon: '📰',
        intro: 'headline, broadcast, journalist, biased, reliable source, fake news.',
        bullets: ['traditional vs social media', 'critical thinking about sources'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Programs on a computer:', options: ['software', 'hardware', 'furniture', 'clothing'], correctAnswer: 'software', explanation: 'software vs hardware.' },
        { question: 'To copy data from the internet to your device:', options: ['download', 'upload', 'delete', 'print'], correctAnswer: 'download', explanation: 'download.' },
        { question: 'News that spreads very fast online:', options: ['go viral', 'go silent', 'go offline', 'go manual'], correctAnswer: 'go viral', explanation: 'go viral.' },
        { question: 'Not fair or neutral — ___ reporting:', options: ['biased', 'balanced', 'silent', 'empty'], correctAnswer: 'biased', explanation: 'biased = prejudiced.' },
        { question: 'Person who writes for a newspaper:', options: ['journalist', 'engineer', 'chef', 'pilot'], correctAnswer: 'journalist', explanation: 'journalist.' },
      ],
      fillBlanks: [{ text: 'Always check whether a source is ___ (trustworthy).', blanks: [{ answer: 'reliable', alternatives: ['reliable'] }] }],
      trueFalse: [{ statements: [{ text: 'Hardware refers to physical computer parts.', correct: true }] }],
    },
  },
  'topic-lexis-environment-society': {
    title: 'Topic Lexis: Environment and Society',
    description: 'Climate, sustainability, and social issues vocabulary.',
    level: 'B2',
    sections: [
      {
        title: 'Environment',
        icon: '🌍',
        intro: 'pollution, carbon footprint, renewable energy, drought, endangered species.',
        bullets: ['reduce emissions, recycle waste', 'climate change, global warming'],
      },
      {
        title: 'Society',
        icon: '👥',
        intro: 'inequality, community, volunteer, human rights, diversity.',
        bullets: ['social issues appear in writing and speaking exams', 'use cause–effect linking words'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Energy from sun/wind:', options: ['renewable', 'fossil', 'nuclear waste only', 'plastic'], correctAnswer: 'renewable', explanation: 'renewable energy.' },
        { question: 'Animals at risk of disappearing:', options: ['endangered', 'domestic', 'common', 'tame'], correctAnswer: 'endangered', explanation: 'endangered species.' },
        { question: 'The total greenhouse gases you produce:', options: ['carbon footprint', 'handprint', 'footstep', 'signature'], correctAnswer: 'carbon footprint', explanation: 'carbon footprint.' },
        { question: 'Helping others without pay:', options: ['volunteer', 'employ', 'charge', 'fine'], correctAnswer: 'volunteer', explanation: 'volunteer work.' },
        { question: 'Long period without rain:', options: ['drought', 'flood', 'storm', 'snow'], correctAnswer: 'drought', explanation: 'drought.' },
      ],
      fillBlanks: [{ text: 'We should ___ (reuse) materials instead of throwing them away.', blanks: [{ answer: 'recycle', alternatives: ['recycle', 'reuse'] }] }],
      trueFalse: [{ statements: [{ text: 'Sustainability means meeting needs without harming the future.', correct: true }] }],
    },
  },
  'idioms-and-expressions': {
    title: 'Idioms and Expressions',
    description: 'Fixed expressions and idioms for natural, exam-ready English.',
    level: 'B2',
    sections: [
      {
        title: 'Understanding Idioms',
        icon: '💬',
        intro: 'Idioms cannot be understood word by word: it is raining cats and dogs = raining heavily.',
        bullets: ['Learn idioms by topic and context', 'Do not translate literally from Spanish', 'Use idioms sparingly in formal writing'],
        table: {
          caption: 'Useful idioms',
          headers: ['Idiom', 'Meaning'],
          rows: [
            ['break the ice', 'start a conversation'],
            ['once in a blue moon', 'very rarely'],
            ['hit the books', 'study hard'],
            ['under the weather', 'feel ill'],
          ],
        },
      },
    ],
    exercises: {
      multipleChoice: [
        { question: '"Break the ice" means:', options: ['freeze water', 'start talking', 'break something', 'feel cold'], correctAnswer: 'start talking', explanation: 'break the ice.' },
        { question: '"Once in a blue moon" means:', options: ['every day', 'very rarely', 'at night', 'always'], correctAnswer: 'very rarely', explanation: 'rarely.' },
        { question: '"Under the weather" means:', options: ['outside', 'feeling ill', 'happy', 'hot'], correctAnswer: 'feeling ill', explanation: 'feel unwell.' },
        { question: '"Hit the books" means:', options: ['study hard', 'fight', 'travel', 'sleep'], correctAnswer: 'study hard', explanation: 'study.' },
        { question: '"Piece of cake" means:', options: ['dessert only', 'very easy', 'expensive', 'difficult'], correctAnswer: 'very easy', explanation: 'easy.' },
      ],
      fillBlanks: [{ text: 'The exam was a ___ (easy).', blanks: [{ answer: 'piece of cake', alternatives: ['piece of cake'] }] }],
      trueFalse: [{ statements: [{ text: 'Idioms should be overused in academic essays.', correct: false }] }],
    },
  },
  'confusing-word-pairs': {
    title: 'Confusing Word Pairs',
    description: 'Similar words that Spanish speakers often confuse in English.',
    level: 'B1',
    sections: [
      {
        title: 'Commonly Confused Pairs',
        icon: '⚠️',
        intro: 'Besides false friends, many English pairs are tricky: affect/effect, lend/borrow, say/tell.',
        table: {
          caption: 'Tricky pairs',
          headers: ['Word A', 'Word B', 'Difference'],
          rows: [
            ['affect (verb)', 'effect (noun)', 'affect = influence; effect = result'],
            ['borrow', 'lend', 'borrow = take; lend = give'],
            ['say', 'tell', 'say + words; tell + person'],
            ['job', 'work', 'job = position; work = activity (uncountable)'],
          ],
        },
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Stress ___ (affect) his performance.', options: ['affected', 'effected', 'effective', 'efficient'], correctAnswer: 'affected', explanation: 'affect = verb.' },
        { question: 'Can you ___ me your pen? (I will return it)', options: ['lend', 'borrow', 'rent', 'steal'], correctAnswer: 'lend', explanation: 'you lend TO me / I borrow FROM you.' },
        { question: 'She ___ me the truth.', options: ['told', 'said', 'spoke', 'talked'], correctAnswer: 'told', explanation: 'tell someone something.' },
        { question: 'The ___ of the new law was immediate.', options: ['effect', 'affect', 'affective', 'affection'], correctAnswer: 'effect', explanation: 'effect = noun (result).' },
        { question: 'I have a lot of ___ to do tonight.', options: ['work', 'job', 'works', 'working'], correctAnswer: 'work', explanation: 'work (uncountable).' },
      ],
      fillBlanks: [{ text: 'What did he ___ (decir) to you?', blanks: [{ answer: 'say', alternatives: ['say'] }] }],
      trueFalse: [{ statements: [{ text: '"Borrow" and "lend" mean the same.', correct: false }] }],
    },
  },
  'stress-rhythm-and-intonation': {
    title: 'Stress, Rhythm and Intonation',
    description: 'Word stress, sentence stress, and intonation patterns for clear, natural English.',
    level: 'B1',
    sections: [
      {
        title: 'Word and Sentence Stress',
        icon: '🎵',
        intro:
          'English is a stress-timed language: stressed syllables are stronger and clearer; unstressed syllables are shorter and softer.',
        bullets: [
          'Noun + noun: stress usually on the first word (BOOKshop)',
          'Two-syllable nouns often stress the first syllable; verbs the second (REcord vs reCORD)',
          'Content words (nouns, main verbs) are usually stressed in sentences',
        ],
        table: {
          caption: 'Intonation patterns',
          headers: ['Pattern', 'Use', 'Example'],
          rows: [
            ['Rising ↗', 'Yes/no questions', 'Are you coming?'],
            ['Falling ↘', 'Statements', 'I live in Madrid.'],
            ['Fall-rise ↘↗', 'Contrast / politeness', 'I like it (but…).'],
          ],
        },
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'In "photograph", typical stress is on:', options: ['PHO-to-graph', 'pho-TO-graph', 'pho-to-GRAPH', 'equal'], correctAnswer: 'PHO-to-graph', explanation: 'First syllable stress.' },
        { question: 'Rising intonation is common in:', options: ['statements', 'yes/no questions', 'commands', 'lists only'], correctAnswer: 'yes/no questions', explanation: 'Yes/no questions often rise.' },
        { question: 'Content words in a sentence are usually:', options: ['stressed', 'whispered', 'deleted', 'unstressed always'], correctAnswer: 'stressed', explanation: 'Nouns and main verbs carry stress.' },
        { question: '"I didn\'t say he stole the money" shows:', options: ['spelling rules', 'how stress changes meaning', 'past tenses only', 'passive voice'], correctAnswer: 'how stress changes meaning', explanation: 'Stress highlights different words.' },
        { question: 'Falling tone at the end often signals:', options: ['uncertainty', 'completion / certainty', 'a question', 'anger only'], correctAnswer: 'completion / certainty', explanation: 'Falling tone on statements.' },
      ],
      fillBlanks: [{ text: 'Where is the STRESS in "comfortable"? comFORtable or COMfortable — learners stress the ___ syllable correctly.', blanks: [{ answer: 'first', alternatives: ['first', 'second'] }] }],
      trueFalse: [{ statements: [{ text: 'Sentence stress helps listeners follow your message.', correct: true }] }],
    },
  },
  'minimal-pairs-and-problem-sounds': {
    title: 'Minimal Pairs and Problem Sounds',
    description: 'Practice sounds that Spanish speakers often confuse: /ɪ/ vs /iː/, /v/ vs /b/, and more.',
    level: 'A2',
    sections: [
      {
        title: 'Minimal Pairs',
        icon: '👂',
        intro:
          'Minimal pairs are two words that differ by only one sound (ship / sheep, live / leave). Training them improves listening and speaking accuracy.',
        table: {
          caption: 'Common problem pairs',
          headers: ['Sound 1', 'Sound 2', 'Example A', 'Example B'],
          rows: [
            ['/ɪ/', '/iː/', 'ship', 'sheep'],
            ['/e/', '/æ/', 'bed', 'bad'],
            ['/v/', '/b/', 'very', 'berry'],
            ['/θ/', '/s/', 'think', 'sink'],
          ],
        },
        bullets: [
          'Listen–repeat–record yourself',
          'Exaggerate the difference at first, then naturalise',
          'Use IPA in dictionaries to check vowel length',
        ],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Which word has the long /iː/ sound?', options: ['ship', 'sheep', 'shop', 'shape'], correctAnswer: 'sheep', explanation: 'sheep = /iː/.' },
        { question: 'Minimal pairs differ in:', options: ['one sound', 'spelling only', 'grammar', 'topic'], correctAnswer: 'one sound', explanation: 'One phoneme difference.' },
        { question: '/θ/ as in "think" is often confused with:', options: ['/s/', '/f/', '/k/', '/tʃ/'], correctAnswer: '/s/', explanation: 'think vs sink.' },
        { question: '"Very" starts with:', options: ['/v/', '/b/', '/w/', '/f/'], correctAnswer: '/v/', explanation: 'voiced /v/.' },
        { question: 'Best practice for problem sounds:', options: ['avoid them', 'listen and repeat with feedback', 'speak faster', 'only read silently'], correctAnswer: 'listen and repeat with feedback', explanation: 'Active practice with feedback.' },
      ],
      fillBlanks: [{ text: 'I want to ___ (vivir) in London.', blanks: [{ answer: 'live', alternatives: ['live'] }] }],
      trueFalse: [{ statements: [{ text: 'Minimal pair practice helps both listening and speaking.', correct: true }] }],
    },
  },
  'emotions-and-personality': {
    title: 'Emotions and Personality',
    description: 'Adjectives and phrases to describe feelings and character.',
    level: 'A2',
    sections: [
      {
        title: 'Emotions',
        icon: '😊',
        intro: 'Go beyond happy/sad: delighted, furious, anxious, relieved, embarrassed.',
        bullets: ['be + adjective (She is anxious)', 'feel + adjective (I feel relieved)', 'extreme emotions often use very or absolutely'],
      },
      {
        title: 'Personality',
        icon: '🧠',
        intro: 'Describing people: reliable, ambitious, shy, outgoing, stubborn, generous.',
        bullets: ['positive vs negative traits in character descriptions', 'useful for speaking Part 2 and writing portraits'],
      },
    ],
    exercises: {
      multipleChoice: [
        { question: 'Very happy:', options: ['delighted', 'furious', 'gloomy', 'anxious'], correctAnswer: 'delighted', explanation: 'delighted = very pleased.' },
        { question: 'Worried about the future:', options: ['anxious', 'relieved', 'proud', 'calm'], correctAnswer: 'anxious', explanation: 'anxious.' },
        { question: 'Someone you can trust:', options: ['reliable', 'lazy', 'rude', 'noisy'], correctAnswer: 'reliable', explanation: 'reliable.' },
        { question: 'Likes meeting people — ___:', options: ['outgoing', 'shy', 'silent', 'alone'], correctAnswer: 'outgoing', explanation: 'outgoing = sociable.' },
        { question: 'Angry:', options: ['furious', 'thrilled', 'sleepy', 'bored'], correctAnswer: 'furious', explanation: 'furious = very angry.' },
      ],
      fillBlanks: [{ text: 'After the exam I felt ___ (aliviado).', blanks: [{ answer: 'relieved', alternatives: ['relieved'] }] }],
      trueFalse: [{ statements: [{ text: '"Embarrassed" and "pregnant" are false friends in Spanish.', correct: true }] }],
    },
  },
};
