import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'I want _____ English.'",
      "options": [
        "learn",
        "to learn",
        "learning",
        "learned"
      ],
      "correctAnswer": 1,
      "explanation": "After 'want' we use the infinitive with 'to': 'want to learn'."
    },
    {
      "question": "Which is the correct form to complete: 'I enjoy ___ books'?",
      "options": [
        "to read",
        "reading",
        "read",
        "reads"
      ],
      "correctAnswer": 1,
      "explanation": "'Enjoy' is followed by a gerund: 'I enjoy reading books'."
    },
    {
      "question": "Which is the correct form to complete: 'I remember ___ the door' (I remember that I closed it)?",
      "options": [
        "to close",
        "closing",
        "close",
        "closed"
      ],
      "correctAnswer": 1,
      "explanation": "To remember having done something we use the gerund: 'I remember closing the door'."
    },
    {
      "question": "Which is the correct form to complete: 'It's easy ___ English'?",
      "options": [
        "learn",
        "learning",
        "to learn",
        "learns"
      ],
      "correctAnswer": 2,
      "explanation": "After 'It's + adjective' we use the infinitive: 'It's easy to learn English'."
    },
    {
      "question": "Complete: 'I can't stand ___ in long queues.'",
      "options": [
        "to wait",
        "waiting",
        "wait",
        "waited"
      ],
      "correctAnswer": 1,
      "explanation": "'Can't stand' requires a gerund: 'I can't stand waiting'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Infinitive vs Gerund helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Infinitive vs Gerund until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Infinitive vs Gerund ___0___ week.",
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
          "text": "'I want to go home' is correct.",
          "isTrue": true,
          "explanation": "Correct. 'Want' is followed by an infinitive."
        },
        {
          "text": "'I enjoy to swim' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. 'Enjoy' is followed by a gerund: 'I enjoy swimming'."
        },
        {
          "text": "'I'm looking forward to seeing you' is correct.",
          "isTrue": true,
          "explanation": "Correct. 'Look forward to' is followed by a gerund."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'I stopped to smoke' means I quit smoking.",
          "isTrue": false,
          "explanation": "Incorrect. 'I stopped to smoke' means I stopped in order to smoke. 'I stopped smoking' means I quit smoking."
        },
        {
          "text": "'I enjoy to read books' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. 'Enjoy' requires a gerund: 'I enjoy reading books'."
        },
        {
          "text": "'She decided to study medicine' is correct.",
          "isTrue": true,
          "explanation": "Correct. 'Decide' requires an infinitive: 'decided to study'."
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
      "title": "Match the term to Infinitive vs Gerund",
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
      "title": "Select all good strategies for Infinitive vs Gerund",
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

export function build10InfinitiveVsGerundExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('infinitive-vs-gerund', config, level, primaryLevel);
}
