import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'You ___ study harder if you want to pass the exam.'",
      "options": [
        "must",
        "should",
        "can",
        "might"
      ],
      "correctAnswer": 1,
      "explanation": "'Should' expresses advice or a recommendation, which fits best in this context."
    },
    {
      "question": "Which modal verb is used to express strong obligation?",
      "options": [
        "should",
        "could",
        "must",
        "might"
      ],
      "correctAnswer": 2,
      "explanation": "'Must' is used to express strong obligation or necessity. 'Should' is for advice, 'could' for possibility, and 'might' for weak possibility."
    },
    {
      "question": "What is the difference between 'must' and 'have to'?",
      "options": [
        "There is no difference",
        "'Must' is for external obligation, 'have to' for personal",
        "'Must' is for personal obligation, 'have to' for external",
        "'Must' is only for past tense"
      ],
      "correctAnswer": 2,
      "explanation": "'Must' expresses personal obligation (what you think is necessary), while 'have to' expresses external obligation (rules, laws, requirements)."
    },
    {
      "question": "Which modal verb is best for giving strong advice with a warning?",
      "options": [
        "should",
        "ought to",
        "had better",
        "could"
      ],
      "correctAnswer": 2,
      "explanation": "'Had better' is used for strong advice with an implied warning or consequence if the advice is not followed."
    },
    {
      "question": "Complete: 'You ___ smoke in the hospital.'",
      "options": [
        "mustn't",
        "don't have to",
        "shouldn't",
        "can't"
      ],
      "correctAnswer": 0,
      "explanation": "'Mustn't' expresses a strong prohibition. It is a rule that cannot be broken."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Modal Verbs helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Modal Verbs until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Modal Verbs ___0___ week.",
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
          "text": "Modal verbs are followed by infinitive without 'to'.",
          "isTrue": true,
          "explanation": "Correct. Modal verbs are always followed by the base form of the verb (infinitive without 'to')."
        },
        {
          "text": "Modal verbs change form according to the subject (I, you, he, she, etc.).",
          "isTrue": true,
          "explanation": "Incorrect. Modal verbs do not change form according to the subject. They remain the same for all persons."
        },
        {
          "text": "'May' is more formal than 'can' when asking for permission.",
          "isTrue": true,
          "explanation": "Correct. 'May' is more formal and polite than 'can' when asking for permission."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You can use 'do' or 'does' with modal verbs in questions and negatives.",
          "isTrue": false,
          "explanation": "Incorrect. Modal verbs do not use auxiliary verbs like 'do' or 'does'. The modal itself forms questions and negatives."
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
      "title": "Match the term to Modal Verbs",
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
      "title": "Select all good strategies for Modal Verbs",
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

export function buildModalVerbsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('modal-verbs', config, level, primaryLevel);
}
