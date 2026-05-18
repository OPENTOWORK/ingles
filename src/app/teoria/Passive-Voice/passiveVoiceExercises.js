import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'The house ___ last year.'",
      "options": [
        "built",
        "was built",
        "was building",
        "has built"
      ],
      "correctAnswer": 1,
      "explanation": "'Was built' is the correct past simple passive form of 'build'."
    },
    {
      "question": "What is the passive voice structure?",
      "options": [
        "Subject + verb + object",
        "Subject + be + past participle",
        "Object + verb + subject",
        "Be + past participle + subject"
      ],
      "correctAnswer": 1,
      "explanation": "The passive voice structure is: Subject + be (in appropriate tense) + past participle + (by + agent)."
    },
    {
      "question": "Which sentence is in passive voice?",
      "options": [
        "The teacher gave the students homework.",
        "The students were given homework by the teacher.",
        "The students gave homework to the teacher.",
        "The teacher is giving homework to students."
      ],
      "correctAnswer": 1,
      "explanation": "'The students were given homework by the teacher' is passive voice because the object (students) becomes the subject, and it uses 'were given' (be + past participle)."
    },
    {
      "question": "What is the correct passive form of 'They will finish the project tomorrow'?",
      "options": [
        "The project will be finish tomorrow.",
        "The project will be finished tomorrow.",
        "The project will finish tomorrow.",
        "The project will have been finished tomorrow."
      ],
      "correctAnswer": 1,
      "explanation": "The correct passive form is 'The project will be finished tomorrow' using 'will be' + past participle 'finished'."
    },
    {
      "question": "Complete: 'The house ___ by a famous architect.'",
      "options": [
        "designed",
        "was designed",
        "is designed",
        "has designed"
      ],
      "correctAnswer": 1,
      "explanation": "For a completed action in the past we use past simple passive: 'was designed'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Passive Voice helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Passive Voice until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Passive Voice ___0___ week.",
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
          "text": "The passive voice is used when the agent (who does the action) is unknown or unimportant.",
          "isTrue": true,
          "explanation": "Correct. Passive voice is commonly used when we don't know who performed the action or when it's not important."
        },
        {
          "text": "In passive voice, the verb 'be' must agree with the subject in number and tense.",
          "isTrue": true,
          "explanation": "Correct. The verb 'be' must agree with the subject (singular/plural) and be in the appropriate tense."
        },
        {
          "text": "You can only use the direct object as the subject in passive voice.",
          "isTrue": false,
          "explanation": "Incorrect. With verbs that have two objects (direct and indirect), either can become the subject of the passive sentence."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "The agent is always required in passive voice sentences.",
          "isTrue": false,
          "explanation": "Incorrect. The agent (with 'by') is optional in passive voice. It's only included when it's relevant or known."
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
      "title": "Match the term to Passive Voice",
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
      "title": "Select all good strategies for Passive Voice",
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

export function buildPassiveVoiceExercises() {
  return buildTheoryExercises('passive-voice', config);
}
