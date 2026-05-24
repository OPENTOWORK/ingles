import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'Yesterday I ___ to the store.'",
      "options": [
        "go",
        "went",
        "was going",
        "have gone"
      ],
      "correctAnswer": 1,
      "explanation": "'Went' is the correct Past Simple form of 'go' for completed actions in the past."
    },
    {
      "question": "Which is the correct form to complete: 'I ___ my homework when you called'?",
      "options": [
        "did",
        "was doing",
        "had done",
        "have done"
      ],
      "correctAnswer": 1,
      "explanation": "For actions in progress in the past we use Past Continuous: 'I was doing my homework when you called'."
    },
    {
      "question": "Which is the correct form to complete: 'She ___ never ___ to Japan before last year'?",
      "options": [
        "was, gone",
        "had, been",
        "did, go",
        "has, been"
      ],
      "correctAnswer": 1,
      "explanation": "For experiences that happened before another past action we use Past Perfect: 'She had never been to Japan before last year'."
    },
    {
      "question": "Which is the correct form to complete: 'By the time we arrived, the movie ___'?",
      "options": [
        "started",
        "was starting",
        "had started",
        "has started"
      ],
      "correctAnswer": 2,
      "explanation": "'By the time' indicates that one action happened before another in the past, so we use Past Perfect: 'had started'."
    },
    {
      "question": "Complete: 'While I ___ TV, the phone ___'",
      "options": [
        "watched, rang",
        "was watching, rang",
        "was watching, was ringing",
        "watched, was ringing"
      ],
      "correctAnswer": 1,
      "explanation": "An action in progress (was watching) was interrupted by another action (rang)."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Past Tenses helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Past Tenses until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Past Tenses ___0___ week.",
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
          "text": "'I did went to school' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. With 'did' we use the base form: 'I went to school' or 'I did go to school' (for emphasis)."
        },
        {
          "text": "'I had already eaten when she arrived' shows the correct order of events.",
          "isTrue": true,
          "explanation": "Correct. Past Perfect shows the earlier action (had eaten), Past Simple the more recent one (arrived)."
        },
        {
          "text": "'I was working yesterday' is correct for a completed action.",
          "isTrue": true,
          "explanation": "Incorrect. For completed actions we use Past Simple: 'I worked yesterday'. Past Continuous is for actions in progress."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'While I was cooking, the phone rang' is correct.",
          "isTrue": true,
          "explanation": "Correct. 'While' introduces an action in progress (Past Continuous); the other action is punctual (Past Simple)."
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
      "title": "Match the term to Past Tenses",
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
      "title": "Select all good strategies for Past Tenses",
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

export function build8PastTensesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('pasttenses', config, level, primaryLevel);
}
