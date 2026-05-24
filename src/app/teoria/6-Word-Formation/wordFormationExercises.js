import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'She is a very _____ person.' (beauty → adjective)",
      "options": [
        "beauty",
        "beautiful",
        "beautifully",
        "beautify"
      ],
      "correctAnswer": 1,
      "explanation": "To describe people we use the adjective 'beautiful' (beauty → beautiful)."
    },
    {
      "question": "Which is the correct form to complete: 'I need to ___ this letter'?",
      "options": [
        "rewrite",
        "re-write",
        "write again",
        "rewrite again"
      ],
      "correctAnswer": 0,
      "explanation": "Prefixes are written attached to the base word: 'rewrite'."
    },
    {
      "question": "Which is the correct form to complete: 'The ___ of this project is important'?",
      "options": [
        "develop",
        "development",
        "developing",
        "developed"
      ],
      "correctAnswer": 1,
      "explanation": "We need a noun. 'Development' is formed by adding '-ment' to the verb 'develop'."
    },
    {
      "question": "Which is the correct form to complete: 'I will ___ you the information'?",
      "options": [
        "email to",
        "email",
        "email for",
        "email with"
      ],
      "correctAnswer": 1,
      "explanation": "When 'email' is a verb, it does not need a preposition: 'I will email you'."
    },
    {
      "question": "Complete: 'The ___ of the building took two years.'",
      "options": [
        "construct",
        "construction",
        "constructive",
        "constructing"
      ],
      "correctAnswer": 1,
      "explanation": "We need a noun. 'Construction' is formed by adding '-tion' to the verb 'construct'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Word Formation helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Word Formation until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Word Formation ___0___ week.",
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
          "text": "'Un-happy' is the correct spelling.",
          "isTrue": true,
          "explanation": "Incorrect. Prefixes are written attached: 'unhappy'."
        },
        {
          "text": "'Toothbrush' is a compound word.",
          "isTrue": true,
          "explanation": "Correct. 'Toothbrush' is formed by 'tooth' + 'brush'."
        },
        {
          "text": "'Email' can be both a noun and a verb.",
          "isTrue": true,
          "explanation": "Correct. 'Email' is conversion: it can be a noun or a verb."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'Beautifully' is formed by adding a suffix to 'beautiful'.",
          "isTrue": false,
          "explanation": "Incorrect. 'Beautifully' is formed from 'beautiful' + '-ly', but 'beautiful' already has the suffix '-ful'."
        },
        {
          "text": "'Impossible' is formed with the prefix 'im-'.",
          "isTrue": true,
          "explanation": "Correct. 'Impossible' = 'im-' (not) + 'possible'."
        },
        {
          "text": "'Friendship' is formed with the suffix '-ship'.",
          "isTrue": true,
          "explanation": "Correct. 'Friendship' = 'friend' + '-ship' (state or condition)."
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
      "title": "Match the term to Word Formation",
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
      "title": "Select all good strategies for Word Formation",
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

export function build6WordFormationExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('word-formation', config, level, primaryLevel);
}
