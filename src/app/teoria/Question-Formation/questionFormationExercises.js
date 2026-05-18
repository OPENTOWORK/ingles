import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: '_____ you speak French?'",
      "options": [
        "Do",
        "Does",
        "Are",
        "Is"
      ],
      "correctAnswer": 0,
      "explanation": "With 'you' and the main verb 'speak' we use the auxiliary 'Do' to form questions."
    },
    {
      "question": "Which question is grammatically correct?",
      "options": [
        "Who does live in that house?",
        "Who lives in that house?",
        "Who do live in that house?",
        "Who is live in that house?"
      ],
      "correctAnswer": 1,
      "explanation": "In subject questions with 'who', we do not use an auxiliary. 'Who lives...' is correct."
    },
    {
      "question": "What's the correct question tag for: 'She doesn't like coffee'?",
      "options": [
        "doesn't she?",
        "does she?",
        "isn't she?",
        "is she?"
      ],
      "correctAnswer": 1,
      "explanation": "A negative sentence needs a positive question tag: 'does she?'"
    },
    {
      "question": "Which is the most polite way to ask for directions?",
      "options": [
        "Where is the station?",
        "Tell me where the station is.",
        "Could you tell me where the station is?",
        "Where's the station at?"
      ],
      "correctAnswer": 2,
      "explanation": "'Could you tell me...' is the most polite way to ask an indirect question."
    },
    {
      "question": "Complete: '_____ old are you?'",
      "options": [
        "What",
        "How",
        "Where",
        "When"
      ],
      "correctAnswer": 1,
      "explanation": "To ask about age we use 'How old are you?'"
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Question Formation helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Question Formation until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Question Formation ___0___ week.",
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
          "text": "In indirect questions, we use the same word order as in statements.",
          "isTrue": true,
          "explanation": "Correct. Indirect questions use affirmative sentence word order."
        },
        {
          "text": "Question tags always use the same auxiliary as the main sentence.",
          "isTrue": true,
          "explanation": "Correct. The question tag must use the same auxiliary as the main sentence."
        },
        {
          "text": "We always need an auxiliary verb in wh-questions.",
          "isTrue": false,
          "explanation": "False. Subject questions do not need an auxiliary: 'Who called?'"
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'Do you are tired?' is correct English.",
          "isTrue": false,
          "explanation": "False. With 'to be' we do not use the auxiliary 'do': 'Are you tired?'"
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
      "title": "Match the term to Question Formation",
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
      "title": "Select all good strategies for Question Formation",
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

export function buildQuestionFormationExercises() {
  return buildTheoryExercises('question-formation', config);
}
