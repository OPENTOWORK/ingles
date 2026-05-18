import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'The woman _____ lives next door is a teacher.'",
      "options": [
        "who",
        "which",
        "where",
        "whose"
      ],
      "correctAnswer": 0,
      "explanation": "For people as subject we use 'who': 'The woman who lives next door'."
    },
    {
      "question": "Which sentence is correct?",
      "options": [
        "The students, that study hard, pass exams.",
        "The students, who study hard, pass exams.",
        "The students who study hard pass exams.",
        "Both B and C are correct."
      ],
      "correctAnswer": 3,
      "explanation": "B is non-defining (extra information), C is defining (essential information). Both are correct but have different meanings."
    },
    {
      "question": "In which sentence can you omit the relative pronoun?",
      "options": [
        "The man who called you is here.",
        "The book that I bought is expensive.",
        "The woman whose car broke down needs help.",
        "The students who study hard succeed."
      ],
      "correctAnswer": 1,
      "explanation": "In 'The book that I bought', 'that' is the object and can be omitted: 'The book I bought'."
    },
    {
      "question": "What's the formal way to say: 'The person I was talking to'?",
      "options": [
        "The person to who I was talking",
        "The person to whom I was talking",
        "The person to which I was talking",
        "The person to that I was talking"
      ],
      "correctAnswer": 1,
      "explanation": "In formal style, the preposition goes before the pronoun: 'to whom' (for people)."
    },
    {
      "question": "Complete: 'The girl _____ mother is a doctor studies medicine.'",
      "options": [
        "who",
        "which",
        "whose",
        "where"
      ],
      "correctAnswer": 2,
      "explanation": "To express possession we use 'whose': 'The girl whose mother is a doctor'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Relative Clauses helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Relative Clauses until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Relative Clauses ___0___ week.",
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
          "text": "You can use 'that' in non-defining relative clauses.",
          "isTrue": false,
          "explanation": "False. In non-defining clauses you can only use who, which, whose, etc., but not 'that'."
        },
        {
          "text": "You can omit relative pronouns when they are the subject of the clause.",
          "isTrue": true,
          "explanation": "False. You can only omit relative pronouns when they are the object, not the subject."
        },
        {
          "text": "'Where' can replace 'in which', 'at which', or 'on which'.",
          "isTrue": true,
          "explanation": "Correct. 'Where' is a simpler way to express place."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Non-defining relative clauses are always separated by commas.",
          "isTrue": true,
          "explanation": "Correct. Non-defining clauses are always set off with commas."
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
      "title": "Match the term to Relative Clauses",
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
      "title": "Select all good strategies for Relative Clauses",
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

export function buildRelativeClausesExercises() {
  return buildTheoryExercises('relative-clauses', config);
}
