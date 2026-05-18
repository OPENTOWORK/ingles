import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'I like coffee _____ I don't like tea.'",
      "options": [
        "and",
        "but",
        "because",
        "so"
      ],
      "correctAnswer": 1,
      "explanation": "'But' expresses contrast between two opposing ideas: I like coffee but I don't like tea."
    },
    {
      "question": "Which is the correct form to complete: 'I like coffee, ___ I don't like tea'?",
      "options": [
        "and",
        "but",
        "or",
        "so"
      ],
      "correctAnswer": 1,
      "explanation": "To show contrast between two ideas we use 'but': 'I like coffee, but I don't like tea'."
    },
    {
      "question": "Which is the correct form to complete: '___ it's raining, I stay home'?",
      "options": [
        "Because",
        "So",
        "But",
        "And"
      ],
      "correctAnswer": 0,
      "explanation": "To show cause we use 'Because': 'Because it's raining, I stay home'."
    },
    {
      "question": "Which is the correct form to complete: 'I study hard, ___ I want to pass'?",
      "options": [
        "because",
        "so",
        "but",
        "and"
      ],
      "correctAnswer": 0,
      "explanation": "To show reason we use 'because': 'I study hard, because I want to pass'."
    },
    {
      "question": "Complete: '___ I was tired, I finished my homework.'",
      "options": [
        "Because",
        "Although",
        "So",
        "And"
      ],
      "correctAnswer": 1,
      "explanation": "'Although' shows contrast: 'Although I was tired, I finished my homework'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Sentence Structures helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Sentence Structures until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Sentence Structures ___0___ week.",
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
          "text": "'I like coffee, I like tea' is a correct compound sentence.",
          "isTrue": true,
          "explanation": "Incorrect. You need a connector to join the sentences: 'I like coffee and tea' or 'I like coffee, and I like tea'."
        },
        {
          "text": "'Because I'm tired, I'll sleep' is a correct complex sentence.",
          "isTrue": true,
          "explanation": "Correct. It is a complex sentence with a subordinate clause at the beginning."
        },
        {
          "text": "'I study hard, so I want to pass' is correct.",
          "isTrue": true,
          "explanation": "Correct. It is a compound sentence with 'so' showing result."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'If I have time, I will go' needs a comma.",
          "isTrue": true,
          "explanation": "Correct. When the subordinate clause comes first, use a comma after it."
        },
        {
          "text": "'Although it's raining, I will go out' is a complex sentence.",
          "isTrue": true,
          "explanation": "Correct. It is a complex sentence with a concessive subordinate clause."
        },
        {
          "text": "'I like pizza and pasta' is a compound sentence.",
          "isTrue": true,
          "explanation": "Incorrect. It is a simple sentence with a compound subject. A compound sentence has two independent clauses."
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
      "title": "Match the term to Sentence Structures",
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
      "title": "Select all good strategies for Sentence Structures",
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

export function build11SentenceStructuresExercises() {
  return buildTheoryExercises('sentence-structures', config);
}
