import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'I _____ a student. My name _____ María.'",
      "options": [
        "am, is",
        "is, am",
        "are, is",
        "am, are"
      ],
      "correctAnswer": 0,
      "explanation": "With 'I' we use 'am', and with proper names (third person singular) we use 'is'."
    },
    {
      "question": "Which is the correct form to complete: '___ you happy?'",
      "options": [
        "Is",
        "Are",
        "Am",
        "Do"
      ],
      "correctAnswer": 1,
      "explanation": "With 'you' we use 'are'. Also, with the verb to be we do not need 'do' to make questions."
    },
    {
      "question": "Which is the correct form to complete: 'Where ___ the books?'",
      "options": [
        "is",
        "are",
        "am",
        "be"
      ],
      "correctAnswer": 1,
      "explanation": "'Books' is plural, so we use 'are'. The question is 'Where are the books?'"
    },
    {
      "question": "Which is the correct negative form of 'She is tall'?",
      "options": [
        "She not is tall",
        "She is not tall",
        "She not tall",
        "She isn't tall"
      ],
      "correctAnswer": 1,
      "explanation": "The correct options are 'She is not tall' or 'She isn't tall'. Option 4 is also correct, but option 2 is the full form."
    },
    {
      "question": "Complete: 'My parents ___ doctors.'",
      "options": [
        "is",
        "are",
        "am",
        "be"
      ],
      "correctAnswer": 1,
      "explanation": "'Parents' is plural, so we use 'are'. 'My parents are doctors'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Verb to Be helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Verb to Be until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Verb to Be ___0___ week.",
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
          "text": "We can say 'I'm not' instead of 'I am not'.",
          "isTrue": true,
          "explanation": "Correct. 'I'm not' is the contraction of 'I am not' and is very common in English."
        },
        {
          "text": "The question 'Do you are happy?' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. With the verb to be we do not use 'do' for questions. The correct form is 'Are you happy?'"
        },
        {
          "text": "We use 'is' with he, she, and it.",
          "isTrue": true,
          "explanation": "Correct. He/She/It always go with 'is' in the present tense."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'They're not' and 'They aren't' are both correct.",
          "isTrue": true,
          "explanation": "Correct. Both forms are valid: 'They're not' and 'They aren't'."
        },
        {
          "text": "We can use 'am' with 'you'.",
          "isTrue": true,
          "explanation": "Incorrect. 'Am' is only used with 'I'. With 'you' we use 'are'."
        },
        {
          "text": "'It's' is the contraction of 'it is'.",
          "isTrue": true,
          "explanation": "Correct. 'It's' is the contraction of 'it is'."
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
      "title": "Match the term to Verb to Be",
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
      "title": "Select all good strategies for Verb to Be",
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

export function build2VerbToBeExercises() {
  return buildTheoryExercises('verb-to-be', config);
}
