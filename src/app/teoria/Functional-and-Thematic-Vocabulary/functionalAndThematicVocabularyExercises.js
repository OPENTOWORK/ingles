import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "How is functional vocabulary organized?",
      "options": [
        "By topic",
        "By communicative function",
        "By level",
        "By frequency"
      ],
      "correctAnswer": 1,
      "explanation": "Functional vocabulary is organized by communicative function, grouping words according to their role in communication."
    },
    {
      "question": "What mainly determines which functional vocabulary to use?",
      "options": [
        "How long the conversation is",
        "Context and level of formality",
        "How fast people speak",
        "The other person's accent"
      ],
      "correctAnswer": 1,
      "explanation": "Context and formality determine which functional vocabulary to use. Different situations require different levels of formality."
    },
    {
      "question": "What is the best strategy for learning functional vocabulary?",
      "options": [
        "Memorize long word lists",
        "Practice in real contexts",
        "Only read about vocabulary",
        "Always use the same level of formality"
      ],
      "correctAnswer": 1,
      "explanation": "Practicing in real contexts is the best strategy because it builds natural fluency and helps you adapt to different situations."
    },
    {
      "question": "Which expression is most appropriate for an informal conversation with friends?",
      "options": [
        "Distinguished guests, thank you",
        "Please send me the report",
        "What's up? How's it going?",
        "I respectfully disagree"
      ],
      "correctAnswer": 2,
      "explanation": "'What's up? How's it going?' fits informal conversations with friends; the other options are much more formal."
    },
    {
      "question": "Complete: 'I _____ you to consider this option.' (suggesting)",
      "options": [
        "order",
        "recommend",
        "demand",
        "force"
      ],
      "correctAnswer": 1,
      "explanation": "'Recommend' is appropriate for suggesting. 'Order' and 'demand' are too forceful; 'force' is coercive."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Functional and Thematic Vocabulary helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Functional and Thematic Vocabulary until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Functional and Thematic Vocabulary ___0___ week.",
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
          "text": "Colloquial expressions are appropriate in formal contexts.",
          "isTrue": true,
          "explanation": "Incorrect. Colloquial expressions are not appropriate in formal contexts. Use them only in informal situations."
        },
        {
          "text": "Thematic vocabulary is organized by specific topics.",
          "isTrue": true,
          "explanation": "Correct. Thematic vocabulary is grouped by topics such as work, education, travel, health, and so on."
        },
        {
          "text": "Active practice in real contexts is important for building functional vocabulary.",
          "isTrue": true,
          "explanation": "Correct. Active practice in real contexts is the best way to build fluency with functional vocabulary."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should always use the same level of formality in every situation.",
          "isTrue": false,
          "explanation": "Incorrect. You should adapt your level of formality to the context and your relationship with the other person."
        },
        {
          "text": "Functional vocabulary focuses on what you can do with language.",
          "isTrue": true,
          "explanation": "Correct. Functional vocabulary focuses on communicative functions: asking, suggesting, agreeing, and so on."
        },
        {
          "text": "Thematic vocabulary is organized by topics or subjects.",
          "isTrue": true,
          "explanation": "Correct. Thematic vocabulary is organized by topics such as health, work, travel, and so on."
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
      "title": "Match the term to Functional and Thematic Vocabulary",
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
      "title": "Select all good strategies for Functional and Thematic Vocabulary",
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

export function buildFunctionalAndThematicVocabularyExercises() {
  return buildTheoryExercises('functional-and-thematic-', config);
}
