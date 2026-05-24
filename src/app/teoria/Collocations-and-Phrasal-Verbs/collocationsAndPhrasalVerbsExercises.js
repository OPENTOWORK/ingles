import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'Please ___ the lights.'",
      "options": [
        "turn off",
        "turn on",
        "turn up",
        "turn down"
      ],
      "correctAnswer": 1,
      "explanation": "'Turn on' means to switch something on, such as lights, TV, or radio."
    },
    {
      "question": "Choose the correct collocation: I need to ___ a decision about my future.",
      "options": [
        "do",
        "make",
        "take",
        "give"
      ],
      "correctAnswer": 1,
      "explanation": "The correct collocation is 'make a decision' — we use 'make' when creating or producing something."
    },
    {
      "question": "What is the correct collocation for 'coffee' when describing its intensity?",
      "options": [
        "strong coffee",
        "heavy coffee",
        "powerful coffee",
        "big coffee"
      ],
      "correctAnswer": 0,
      "explanation": "The correct collocation is 'strong coffee' when describing intensity or flavor."
    },
    {
      "question": "Which sentence correctly uses a separable phrasal verb?",
      "options": [
        "Turn on it.",
        "Turn it on.",
        "Look after it.",
        "Get over it."
      ],
      "correctAnswer": 1,
      "explanation": "'Turn it on' is correct because 'turn on' is separable, so the pronoun goes between the verb and particle."
    },
    {
      "question": "Complete: 'She ___ her job last month.'",
      "options": [
        "gave up",
        "gave in",
        "gave out",
        "gave away"
      ],
      "correctAnswer": 0,
      "explanation": "'Give up' means to quit or stop doing something: 'She gave up her job'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Collocations and Phrasal Verbs helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Collocations and Phrasal Verbs until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Collocations and Phrasal Verbs ___0___ week.",
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
          "text": "With separable phrasal verbs, the object can always go between the verb and the particle.",
          "isTrue": false,
          "explanation": "False. The object can go between the verb and particle OR after it, but pronouns must go between the verb and particle."
        },
        {
          "text": "Collocations are natural word combinations that sound natural to native speakers.",
          "isTrue": true,
          "explanation": "Correct. Collocations are combinations native speakers use instinctively."
        },
        {
          "text": "Phrasal verbs always have the same meaning regardless of context.",
          "isTrue": false,
          "explanation": "False. Many phrasal verbs have multiple meanings depending on context."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "It's okay to translate collocations literally from your native language.",
          "isTrue": false,
          "explanation": "False. Learn collocations as complete units; they often do not translate directly."
        },
        {
          "text": "'Put off' means to postpone something.",
          "isTrue": true,
          "explanation": "Correct. 'Put off' means to postpone or delay something."
        },
        {
          "text": "'Look after' and 'look for' have the same meaning.",
          "isTrue": true,
          "explanation": "Incorrect. 'Look after' means take care of; 'look for' means search for."
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
      "title": "Match the term to Collocations and Phrasal Verbs",
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
      "title": "Select all good strategies for Collocations and Phrasal Verbs",
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

export function buildCollocationsAndPhrasalVerbsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('collocations-and-phrasal', config, level, primaryLevel);
}
