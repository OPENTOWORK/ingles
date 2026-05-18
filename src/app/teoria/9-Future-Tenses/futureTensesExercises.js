import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'Tomorrow I _____ my friend at 3 PM.' (arranged plan)",
      "options": [
        "will meet",
        "am going to meet",
        "am meeting",
        "meet"
      ],
      "correctAnswer": 2,
      "explanation": "For appointments and arranged plans we use Present Continuous: 'am meeting'."
    },
    {
      "question": "Which is the correct form to complete: 'I ___ help you with that' (spontaneous decision)?",
      "options": [
        "am going to",
        "will",
        "am helping",
        "help"
      ],
      "correctAnswer": 1,
      "explanation": "For spontaneous decisions we use 'will': 'I will help you with that'."
    },
    {
      "question": "Which is the correct form to complete: 'Look at those clouds! It ___ rain'?",
      "options": [
        "will",
        "is going to",
        "is raining",
        "rains"
      ],
      "correctAnswer": 1,
      "explanation": "For predictions based on present evidence we use 'going to': 'It's going to rain'."
    },
    {
      "question": "Which is the correct form to complete: 'At this time tomorrow, I ___ on the beach'?",
      "options": [
        "will lie",
        "will be lying",
        "am going to lie",
        "lie"
      ],
      "correctAnswer": 1,
      "explanation": "For actions in progress at a specific moment in the future we use Future Continuous: 'I will be lying'."
    },
    {
      "question": "Complete: 'The train ___ at 8:30 AM' (fixed schedule)?",
      "options": [
        "will leave",
        "is going to leave",
        "leaves",
        "is leaving"
      ],
      "correctAnswer": 2,
      "explanation": "For fixed schedules we use Present Simple: 'The train leaves at 8:30 AM'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Future Tenses helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Future Tenses until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Future Tenses ___0___ week.",
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
          "text": "'I'm going to study tomorrow' shows a plan or intention.",
          "isTrue": true,
          "explanation": "Correct. 'Going to' is used for plans and intentions."
        },
        {
          "text": "'The train will leave at 6 PM' is correct for a fixed schedule.",
          "isTrue": true,
          "explanation": "Incorrect. For fixed schedules we use Present Simple: 'The train leaves at 6 PM'."
        },
        {
          "text": "'I'll be working at 3 PM' means I will be in the middle of working at 3 PM.",
          "isTrue": true,
          "explanation": "Correct. Future Continuous shows actions in progress at a specific moment in the future."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'I am meeting him tomorrow' is correct for a fixed arrangement.",
          "isTrue": true,
          "explanation": "Correct. Present Continuous is used for fixed future arrangements."
        },
        {
          "text": "'I will call you later' shows a spontaneous decision.",
          "isTrue": true,
          "explanation": "Correct. 'Will' is used for spontaneous decisions made at the moment of speaking."
        },
        {
          "text": "'She is meeting her boss at 2 PM' refers to a scheduled appointment.",
          "isTrue": true,
          "explanation": "Correct. Present Continuous is used for appointments and arranged plans."
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
      "title": "Match the term to Future Tenses",
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
      "title": "Select all good strategies for Future Tenses",
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

export function build9FutureTensesExercises() {
  return buildTheoryExercises('future-tenses', config);
}
