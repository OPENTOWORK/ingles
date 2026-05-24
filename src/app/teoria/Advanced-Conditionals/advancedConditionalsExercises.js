import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: '_____ I been born in a different era, I would be living differently now.'",
      "options": [
        "If",
        "Had",
        "Were",
        "Should"
      ],
      "correctAnswer": 1,
      "explanation": "'Had I been born' is the formal inversion of 'If I had been born' in mixed conditionals."
    },
    {
      "question": "Which sentence correctly expresses a mixed conditional (past cause, present effect)?",
      "options": [
        "If I studied harder, I would have passed the exam.",
        "If I had studied harder, I would pass all my exams now.",
        "If I had studied harder, I would have passed the exam.",
        "If I study harder, I will pass the exam."
      ],
      "correctAnswer": 1,
      "explanation": "This structure combines a past cause (had studied) with a present effect (would pass now)."
    },
    {
      "question": "What is the formal inversion equivalent of 'If you should have any questions'?",
      "options": [
        "Should you have any questions",
        "Would you have any questions",
        "Had you any questions",
        "Were you to have questions"
      ],
      "correctAnswer": 0,
      "explanation": "'Should you have' is the correct formal inversion of 'If you should have'."
    },
    {
      "question": "Complete: 'I'll lend you the money _____ you promise to pay me back next week.'",
      "options": [
        "unless",
        "provided that",
        "in case",
        "supposing"
      ],
      "correctAnswer": 1,
      "explanation": "'Provided that' expresses a specific condition that must be met."
    },
    {
      "question": "Complete: '_____ it not for the rain, we would go to the beach.'",
      "options": [
        "If",
        "Were",
        "Had",
        "Should"
      ],
      "correctAnswer": 1,
      "explanation": "'Were it not for' is the formal inversion of 'If it were not for'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Advanced Conditionals helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Advanced Conditionals until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Advanced Conditionals ___0___ week.",
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
          "text": "'Unless' means the same as 'if not'.",
          "isTrue": true,
          "explanation": "Correct. 'Unless' is equivalent to 'if not'."
        },
        {
          "text": "Mixed conditionals can combine different time periods.",
          "isTrue": true,
          "explanation": "Correct. Mixed conditionals relate different time frames."
        },
        {
          "text": "Inversion in conditionals is commonly used in informal speech.",
          "isTrue": true,
          "explanation": "False. Inversion is a formal structure, not informal."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'But for' can be used to express implicit conditions.",
          "isTrue": true,
          "explanation": "Correct. 'But for' expresses implicit conditions."
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
      "title": "Match the term to Advanced Conditionals",
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
      "title": "Select all good strategies for Advanced Conditionals",
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

export function buildAdvancedConditionalsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('advanced-conditionals', config, level, primaryLevel);
}
