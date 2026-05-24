import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete the reported speech: He said: 'I am tired' → He said he _____ tired.",
      "options": [
        "is",
        "was",
        "will be",
        "has been"
      ],
      "correctAnswer": 1,
      "explanation": "In reported speech, 'am' becomes 'was' when we report in the past."
    },
    {
      "question": "What is the reported speech of 'I will come tomorrow'?",
      "options": [
        "He said he will come tomorrow.",
        "He said he would come the next day.",
        "He said he would come tomorrow.",
        "He said he comes tomorrow."
      ],
      "correctAnswer": 1,
      "explanation": "The correct reported speech changes 'will' to 'would' and 'tomorrow' to 'the next day': 'He said he would come the next day.'"
    },
    {
      "question": "What is the correct reported speech of 'Where do you live?'",
      "options": [
        "He asked where do I live?",
        "He asked where I lived.",
        "He asked where did I live?",
        "He asked where I live."
      ],
      "correctAnswer": 1,
      "explanation": "The correct reported speech is 'He asked where I lived' - it uses the word order of a statement and changes the tense to past."
    },
    {
      "question": "Which sentence correctly reports 'I can't come to the party'?",
      "options": [
        "He said he can't come to the party.",
        "He said he couldn't come to the party.",
        "He said he won't come to the party.",
        "He said he doesn't come to the party."
      ],
      "correctAnswer": 1,
      "explanation": "The correct reported speech changes 'can't' to 'couldn't': 'He said he couldn't come to the party.'"
    },
    {
      "question": "Complete: 'I will help you' → He said he _____ help me.",
      "options": [
        "will",
        "would",
        "can",
        "could"
      ],
      "correctAnswer": 1,
      "explanation": "'Will' becomes 'would' in reported speech: 'He said he would help me.'"
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Reported Speech helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Reported Speech until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Reported Speech ___0___ week.",
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
          "text": "In reported speech, you should use quotation marks to show the exact words.",
          "isTrue": false,
          "explanation": "Incorrect. Reported speech does not use quotation marks because you are not quoting the exact words, but reporting what was said."
        },
        {
          "text": "When reporting questions, you should keep the question mark.",
          "isTrue": true,
          "explanation": "Incorrect. Reported questions do not use question marks because they become statements in reported speech."
        },
        {
          "text": "The verb 'tell' requires an indirect object, but 'say' does not.",
          "isTrue": true,
          "explanation": "Correct. 'Tell' always needs an indirect object (tell me, tell him), while 'say' can be used without one."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "If the reporting verb is in present tense, you don't need to change the verb tenses in reported speech.",
          "isTrue": true,
          "explanation": "Correct. When the reporting verb is in present tense (says, tells), the verb tenses in reported speech usually remain the same."
        },
        {
          "text": "'Today' changes to 'that day' in reported speech.",
          "isTrue": true,
          "explanation": "Correct. Time adverbs change: today → that day, yesterday → the day before."
        },
        {
          "text": "We use 'if' or 'whether' for yes/no questions in reported speech.",
          "isTrue": true,
          "explanation": "Correct. 'Are you coming?' → 'He asked if/whether I was coming.'"
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
      "title": "Match the term to Reported Speech",
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
      "title": "Select all good strategies for Reported Speech",
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

export function buildReportedSpeechExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('reported-speech', config, level, primaryLevel);
}
