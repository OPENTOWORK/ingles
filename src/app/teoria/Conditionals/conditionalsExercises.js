import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'If I _____ time tomorrow, I _____ you.'",
      "options": [
        "have, call",
        "have, will call",
        "will have, call",
        "had, would call"
      ],
      "correctAnswer": 1,
      "explanation": "In the first conditional we use: If + present simple, will + infinitive."
    },
    {
      "question": "Which conditional is used for real and possible situations in the future?",
      "options": [
        "Zero Conditional",
        "First Conditional",
        "Second Conditional",
        "Third Conditional"
      ],
      "correctAnswer": 1,
      "explanation": "First Conditional is used for real and possible situations in the future. It uses 'if + present simple, will + infinitive'."
    },
    {
      "question": "What is the correct structure for Second Conditional?",
      "options": [
        "If + present simple, will + infinitive",
        "If + past simple, would + infinitive",
        "If + past perfect, would have + past participle",
        "If + present simple, present simple"
      ],
      "correctAnswer": 1,
      "explanation": "Second Conditional uses 'If + past simple, would + infinitive' to express hypothetical or unreal situations."
    },
    {
      "question": "Which sentence is correct?",
      "options": [
        "If I was rich, I would buy a house.",
        "If I were rich, I would buy a house.",
        "If I am rich, I will buy a house.",
        "If I had been rich, I would buy a house."
      ],
      "correctAnswer": 1,
      "explanation": "The correct Second Conditional uses 'were' for all persons with 'be': 'If I were rich, I would buy a house.'"
    },
    {
      "question": "Complete: 'If I ___ you, I would apologize.'",
      "options": [
        "am",
        "was",
        "were",
        "will be"
      ],
      "correctAnswer": 2,
      "explanation": "With ‘be’ in Second Conditional we use ‘were’ for every person: ‘If I were you.’"
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Conditionals helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Conditionals until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Conditionals ___0___ week.",
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
          "text": "Zero Conditional is used for general truths and facts that are always true.",
          "isTrue": true,
          "explanation": "Correct. Zero Conditional expresses general truths, scientific facts, and situations that are always true."
        },
        {
          "text": "In Second Conditional, you can use 'was' instead of 'were' with all persons.",
          "isTrue": false,
          "explanation": "Incorrect. In Second Conditional, 'were' is used for all persons with the verb 'be': If I were, If you were, If he were."
        },
        {
          "text": "Third Conditional is used for hypothetical situations in the past that cannot be changed.",
          "isTrue": true,
          "explanation": "Correct. Third Conditional expresses regret or speculation about past situations that cannot be changed."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'Unless' means the same as 'if not' and already includes the negative.",
          "isTrue": true,
          "explanation": "Correct. 'Unless' means 'if not' and already contains the negative, so you don't add 'not' after it."
        },
        {
          "text": "Third Conditional is used for impossible past situations.",
          "isTrue": true,
          "explanation": "Correct. Third Conditional describes past situations that cannot be changed: 'If I had studied, I would have passed.'"
        },
        {
          "text": "'Unless' means the same as 'if'.",
          "isTrue": true,
          "explanation": "Incorrect. 'Unless' means 'if not': 'Unless you study' = 'If you don't study.'"
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
      "title": "Match the term to Conditionals",
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
      "title": "Select all good strategies for Conditionals",
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

export function buildConditionalsExercises() {
  return buildTheoryExercises('conditionals', config);
}
