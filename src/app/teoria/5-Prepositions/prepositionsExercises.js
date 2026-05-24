import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'I live _____ Spain _____ 2020.'",
      "options": [
        "in, from",
        "in, since",
        "at, from",
        "on, since"
      ],
      "correctAnswer": 1,
      "explanation": "We use 'in' for countries and 'since' for a specific point in time."
    },
    {
      "question": "Which is the correct form to complete: 'I listen ___ music every day'?",
      "options": [
        "at",
        "to",
        "in",
        "on"
      ],
      "correctAnswer": 1,
      "explanation": "The verb 'listen' is always followed by 'to': 'I listen to music every day'."
    },
    {
      "question": "Which is the correct form to complete: 'I was born ___ 1990'?",
      "options": [
        "on",
        "at",
        "in",
        "for"
      ],
      "correctAnswer": 2,
      "explanation": "For years we use 'in': 'I was born in 1990'."
    },
    {
      "question": "Which is the correct form to complete: 'The book is ___ the table'?",
      "options": [
        "in",
        "on",
        "at",
        "under"
      ],
      "correctAnswer": 1,
      "explanation": "For surfaces we use 'on': 'The book is on the table'."
    },
    {
      "question": "Complete: 'I'll see you ___ Friday ___ 3 PM.'",
      "options": [
        "in / at",
        "on / at",
        "at / in",
        "on / in"
      ],
      "correctAnswer": 1,
      "explanation": "We use 'on' for days (on Friday) and 'at' for specific times (at 3 PM)."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Prepositions helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Prepositions until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Prepositions ___0___ week.",
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
          "text": "'I am at the bed' is correct.",
          "isTrue": false,
          "explanation": "Incorrect. To be in bed we use 'in': 'I am in bed'."
        },
        {
          "text": "'I go to home' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. With 'home' we do not use 'to': 'I go home'."
        },
        {
          "text": "'The meeting is on Monday' is correct.",
          "isTrue": true,
          "explanation": "Correct. For specific days we use 'on'."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'I wait for the bus' is correct.",
          "isTrue": true,
          "explanation": "Correct. The verb 'wait' goes with 'for'."
        },
        {
          "text": "We use 'in' for months and years.",
          "isTrue": true,
          "explanation": "Correct. We use 'in' for months (in January) and years (in 2023)."
        },
        {
          "text": "We say 'at night' but 'in the morning'.",
          "isTrue": true,
          "explanation": "Correct. We say 'at night' but 'in the morning/afternoon/evening'."
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
      "title": "Match the term to Prepositions",
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
      "title": "Select all good strategies for Prepositions",
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

export function build5PrepositionsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('prepositions', config, level, primaryLevel);
}
