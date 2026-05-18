import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'This is the ___ movie I've ever seen.'",
      "options": [
        "gooder",
        "better",
        "best",
        "more good"
      ],
      "correctAnswer": 2,
      "explanation": "'Best' is the irregular superlative form of 'good'."
    },
    {
      "question": "Choose the correct comparative: This book is ___ than the other one.",
      "options": [
        "interesting",
        "more interesting",
        "most interesting",
        "interestinger"
      ],
      "correctAnswer": 1,
      "explanation": "'Interesting' has three or more syllables, so we use 'more' for the comparative."
    },
    {
      "question": "What is the superlative form of 'far'?",
      "options": [
        "farther",
        "farthest",
        "furthest",
        "both b and c"
      ],
      "correctAnswer": 3,
      "explanation": "'Far' has two superlative forms: 'farthest' (physical distance) and 'furthest' (abstract distance)."
    },
    {
      "question": "Which sentence is correct?",
      "options": [
        "This is the most tallest building.",
        "This is the tallest building.",
        "This is more tall building.",
        "This is tallest building."
      ],
      "correctAnswer": 1,
      "explanation": "'Tall' is a short adjective, so we use -est for the superlative and need 'the' before it."
    },
    {
      "question": "Complete: 'She is ___ person I know.'",
      "options": [
        "the kindest",
        "the most kind",
        "kinder",
        "more kind"
      ],
      "correctAnswer": 0,
      "explanation": "'Kind' is a short adjective; the superlative is 'the kindest'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Comparatives and Superlatives helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Comparatives and Superlatives until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Comparatives and Superlatives ___0___ week.",
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
          "text": "We always use 'the' before superlative adjectives.",
          "isTrue": true,
          "explanation": "We do not use 'the' when the superlative is predicative or means 'very' rather than 'most'."
        },
        {
          "text": "Short adjectives use -er and -est for comparatives and superlatives.",
          "isTrue": true,
          "explanation": "Correct. Short adjectives (1–2 syllables) generally use -er and -est."
        },
        {
          "text": "'Good' has regular comparative and superlative forms.",
          "isTrue": false,
          "explanation": "False. 'Good' is irregular: good → better → best."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "We use 'than' with superlatives to show comparison.",
          "isTrue": false,
          "explanation": "False. We use 'than' with comparatives. With superlatives we use 'of' or 'in'."
        },
        {
          "text": "'Less' is the opposite of 'more' in comparisons.",
          "isTrue": true,
          "explanation": "Correct. 'Less' is used in negative comparatives: 'less expensive'."
        },
        {
          "text": "We can use 'much' to emphasize comparatives.",
          "isTrue": true,
          "explanation": "Correct. 'Much better', 'much more expensive', and 'much taller' emphasize the difference."
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
      "title": "Match the term to Comparatives and Superlatives",
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
      "title": "Select all good strategies for Comparatives and Superlatives",
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

export function buildComparativesAndSuperlativesExercises() {
  return buildTheoryExercises('comparatives-and-superla', config);
}
