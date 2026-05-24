import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'The _____ situation is difficult.' (present/current)",
      "options": [
        "actual",
        "current",
        "real",
        "true"
      ],
      "correctAnswer": 1,
      "explanation": "'Current' means present. 'Actual' in English means real or true."
    },
    {
      "question": "What does 'actual' mean in English?",
      "options": [
        "current",
        "real, existing",
        "present",
        "modern"
      ],
      "correctAnswer": 1,
      "explanation": "'Actual' in English means 'real' or 'existing', not 'current'. For 'current' or 'present', use 'current'."
    },
    {
      "question": "Which word means 'to carry out' or 'to do' in English?",
      "options": [
        "realize",
        "carry out",
        "actual",
        "library"
      ],
      "correctAnswer": 1,
      "explanation": "'Carry out' means 'to do' or 'to execute'. 'Realize' means 'to become aware of', 'actual' means 'real', and 'library' means 'biblioteca'."
    },
    {
      "question": "What is the correct English word for 'éxito' (success)?",
      "options": [
        "exit",
        "success",
        "access",
        "excess"
      ],
      "correctAnswer": 1,
      "explanation": "The correct English word for 'éxito' (success) is 'success'. 'Exit' means 'salida' (way out)."
    },
    {
      "question": "Complete: 'She is very _____ about her appearance.' (sensitive)",
      "options": [
        "sensible",
        "sensitive",
        "sensual",
        "sense"
      ],
      "correctAnswer": 1,
      "explanation": "'Sensitive' means easily offended or emotionally responsive. 'Sensible' means practical or reasonable."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of False Friends helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise False Friends until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on False Friends ___0___ week.",
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
          "text": "'Library' in English means the same as 'librería' in Spanish.",
          "isTrue": true,
          "explanation": "Incorrect. 'Library' in English means 'biblioteca' (place with books to borrow), while 'librería' means 'bookstore' (place to buy books)."
        },
        {
          "text": "'Realize' means 'to become aware of something' in English.",
          "isTrue": true,
          "explanation": "Correct. 'Realize' means 'to become aware of' or 'to understand'. It does not mean 'to carry out' (realizar)."
        },
        {
          "text": "'Embarrassed' means 'pregnant' in English.",
          "isTrue": true,
          "explanation": "Incorrect. 'Embarrassed' means 'ashamed' or 'feeling shame'. 'Pregnant' means 'embarazada'."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "False friends are words that look similar but have different meanings.",
          "isTrue": true,
          "explanation": "Correct. False friends are words that appear similar in two languages but have different meanings."
        },
        {
          "text": "'Success' in English means the same as 'suceso' in Spanish.",
          "isTrue": true,
          "explanation": "Incorrect. 'Success' means success, while 'suceso' means event or occurrence."
        },
        {
          "text": "'Fabric' in English refers to cloth or textile material.",
          "isTrue": true,
          "explanation": "Correct. 'Fabric' means cloth or textile material, not factory (fábrica)."
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
      "title": "Match the term to False Friends",
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
      "title": "Select all good strategies for False Friends",
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

export function buildFalseFriendsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('false-friends', config, level, primaryLevel);
}
