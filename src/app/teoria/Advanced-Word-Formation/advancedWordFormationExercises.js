import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the correct noun form of 'manage'?",
      "options": [
        "manageness",
        "management",
        "managation",
        "manageity"
      ],
      "correctAnswer": 1,
      "explanation": "'Management' is the correct noun from 'manage' using the '-ment' suffix."
    },
    {
      "question": "Which prefix makes 'possible' mean the opposite?",
      "options": [
        "un-",
        "dis-",
        "im-",
        "non-"
      ],
      "correctAnswer": 2,
      "explanation": "'Impossible' uses the prefix 'im-' (a form of 'in-') before words beginning with 'p'."
    },
    {
      "question": "What is the correct adjective form of 'access'?",
      "options": [
        "accessful",
        "accessible",
        "accessable",
        "accessitive"
      ],
      "correctAnswer": 1,
      "explanation": "'Accessible' is correct with the '-ible' suffix (not '-able' here)."
    },
    {
      "question": "What does the prefix 'over-' mean in 'overconfident'?",
      "options": [
        "Lack of confidence",
        "Normal confidence",
        "Too much confidence",
        "Past confidence"
      ],
      "correctAnswer": 2,
      "explanation": "'Over-' indicates excess, so 'overconfident' means excessively confident."
    },
    {
      "question": "What is the correct negative form of 'legal'?",
      "options": [
        "unlegal",
        "dislegal",
        "illegal",
        "nonlegal"
      ],
      "correctAnswer": 2,
      "explanation": "'Illegal' uses 'il-' (a form of 'in-') before words beginning with 'l'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Advanced Word Formation helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Advanced Word Formation until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Advanced Word Formation ___0___ week.",
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
          "text": "The suffix '-ful' generally creates adjectives with a positive meaning.",
          "isTrue": true,
          "explanation": "Correct. '-ful' means 'full of' and often creates positive adjectives like 'helpful', 'useful'."
        },
        {
          "text": "You can add any prefix to any word.",
          "isTrue": true,
          "explanation": "Incorrect. Prefixes follow specific rules and cannot all combine with every word."
        },
        {
          "text": "Some words change their spelling when suffixes are added.",
          "isTrue": true,
          "explanation": "Correct. For example, 'happy' → 'happiness' (y to i), 'create' → 'creation' (drop e)."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "The suffix '-less' always creates words with a negative meaning.",
          "isTrue": true,
          "explanation": "Correct. '-less' means 'without' or 'lacking', producing negative meanings like 'careless', 'helpless'."
        },
        {
          "text": "Formed words always keep exactly the same spelling of the root.",
          "isTrue": true,
          "explanation": "Incorrect. Spelling often changes—for example doubling consonants or y → i."
        },
        {
          "text": "'-ize' and '-ise' are suffixes that turn words into verbs.",
          "isTrue": true,
          "explanation": "Correct. Both suffixes (US and UK variants) turn nouns/adjectives into verbs."
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
      "title": "Match the term to Advanced Word Formation",
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
      "title": "Select all good strategies for Advanced Word Formation",
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

export function buildAdvancedWordFormationExercises() {
  return buildTheoryExercises('advanced-word-formation', config);
}
