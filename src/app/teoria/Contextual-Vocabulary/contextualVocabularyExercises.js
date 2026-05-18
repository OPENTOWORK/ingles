import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Meaning variation in contextual vocabulary is chiefly guided by:",
      "options": [
        "Accent alone",
        "Context",
        "Spelling quirks",
        "Word length"
      ],
      "correctAnswer": 1,
      "explanation": "Surrounding discourse—not isolated form—settles plausible readings."
    },
    {
      "question": "What single factor most powerfully unlocks contextual vocabulary?",
      "options": [
        "Exact phoneme match",
        "Context",
        "Dictionary order",
        "Letter count"
      ],
      "correctAnswer": 1,
      "explanation": "Context disambiguates polysemy, idioms, and jargon alike."
    },
    {
      "question": "Best stance toward the lemma bank?",
      "options": [
        "Assume finance always",
        "Let cotext adjudicate riverside versus treasury readings",
        "Assume geography always",
        "Ignore cotext outright"
      ],
      "correctAnswer": 1,
      "explanation": "Financial collocations oppose riverbank collocations; cotext settles the intended sense quickly."
    },
    {
      "question": "What does break the ice mean socially?",
      "options": [
        "Physically smash frozen water",
        "Begin conversation warmly",
        "Signal cold weather only",
        "Strike an object blindly"
      ],
      "correctAnswer": 1,
      "explanation": "Colloquially it initiates rapport not literal destruction."
    },
    {
      "question": "In 'The company will launch a new product', what does launch mean?",
      "options": [
        "To throw something",
        "To start or introduce",
        "To eat lunch",
        "To travel by boat"
      ],
      "correctAnswer": 1,
      "explanation": "In business English, launch means introducing or releasing a product to the market."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Contextual Vocabulary helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Contextual Vocabulary until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Contextual Vocabulary ___0___ week.",
      "blanks": [
        {
          "answer": "every"
        }
      ]
    }
  ],
  "trueFalse": [
    {
      "statements": [
        {
          "text": "Idioms can always be translated word for word faithfully.",
          "isTrue": true,
          "explanation": "Incorrect. Non-compositional figurative meanings resist literal mapping."
        },
        {
          "text": "Many English lemmas carry more than one major sense.",
          "isTrue": true,
          "explanation": "Correct. Words such as bank, bear, or light shift with frame."
        },
        {
          "text": "Inference improves with purposeful practice loops.",
          "isTrue": true,
          "explanation": "Correct. Predict verify revise cycles consolidate skill."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Technical vocabulary is interchangeable across specialties.",
          "isTrue": false,
          "explanation": "Incorrect. Technical words are anchored to specific fields (medicine, IT, sport, etc.)."
        },
        {
          "text": "Context clues scaffold unknown lexical items.",
          "isTrue": true,
          "explanation": "Correct. Nearby synonyms, opposites, and gloss clauses scaffold unknown words."
        },
        {
          "text": "All words exhibit exactly one invariant gloss.",
          "isTrue": true,
          "explanation": "Incorrect. Many words (bank, fair, spring, …) vary widely by frame."
        }
      ]
    }
  ],
  "matching": [
    {
      "title": "Match the concept to its role",
      "pairs": [
        {
          "left": "Rule",
          "right": "Explains the pattern"
        },
        {
          "left": "Example",
          "right": "Shows real usage"
        },
        {
          "left": "Practice",
          "right": "Builds automaticity"
        },
        {
          "left": "Feedback",
          "right": "Corrects mistakes"
        }
      ],
      "explanation": "Rules, examples, practice, and feedback work together."
    },
    {
      "title": "Match the term to Contextual Vocabulary",
      "pairs": [
        {
          "left": "Form",
          "right": "How it is built"
        },
        {
          "left": "Meaning",
          "right": "What it expresses"
        },
        {
          "left": "Use",
          "right": "When to choose it"
        },
        {
          "left": "Mistake",
          "right": "What learners often get wrong"
        }
      ],
      "explanation": "Form, meaning, use, and typical errors are the four pillars."
    }
  ],
  "findError": [
    {
      "title": "Find the mistake",
      "sentence": "She don't understand the rule.",
      "options": [
        "She",
        "don't",
        "understand",
        "the rule"
      ],
      "correctIndex": 1,
      "explanation": "With she/he/it use doesn't, not don't."
    },
    {
      "title": "Find the mistake",
      "sentence": "He have finished the exercise.",
      "options": [
        "He",
        "have",
        "finished",
        "the exercise"
      ],
      "correctIndex": 1,
      "explanation": "With he/she/it use has, not have."
    },
    {
      "title": "Find the mistake",
      "sentence": "They was studying all evening.",
      "options": [
        "They",
        "was",
        "studying",
        "all evening"
      ],
      "correctIndex": 1,
      "explanation": "With they/we/you use were, not was."
    }
  ],
  "sentenceOrder": [
    {
      "title": "Order the study steps",
      "words": [
        "Read",
        "the",
        "rule",
        "carefully",
        "first"
      ],
      "explanation": "Start with the rule before practising."
    },
    {
      "title": "Order the sentence",
      "words": [
        "Practice",
        "makes",
        "your",
        "English",
        "stronger"
      ],
      "explanation": "Regular practice improves performance."
    },
    {
      "title": "Order the question",
      "words": [
        "Do",
        "you",
        "understand",
        "this",
        "topic",
        "?"
      ],
      "explanation": "Yes/no questions: Do + subject + base verb."
    }
  ],
  "selectAll": [
    {
      "title": "Select all good strategies for Contextual Vocabulary",
      "prompt": "Tick every effective study habit.",
      "options": [
        {
          "text": "Use varied example sentences",
          "isCorrect": true
        },
        {
          "text": "Never check your answers",
          "isCorrect": false
        },
        {
          "text": "Review mistakes after practice",
          "isCorrect": true
        },
        {
          "text": "Skip explanation and only guess",
          "isCorrect": false
        }
      ],
      "explanation": "Examples and error review strengthen learning."
    },
    {
      "title": "Select all true statements",
      "prompt": "Which statements are correct?",
      "options": [
        {
          "text": "Context helps you choose the right form",
          "isCorrect": true
        },
        {
          "text": "One rule covers every situation in English",
          "isCorrect": false
        },
        {
          "text": "Time expressions often signal the tense",
          "isCorrect": true
        },
        {
          "text": "Listening and reading expose you to real usage",
          "isCorrect": true
        }
      ],
      "explanation": "English requires context; time words and input matter."
    }
  ]
};

export function buildContextualVocabularyExercises() {
  return buildTheoryExercises('contextual-vocabulary', config);
}
