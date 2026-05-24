import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'If I _____ you, I would take that job.'",
      "options": [
        "was",
        "were",
        "am",
        "will be"
      ],
      "correctAnswer": 1,
      "explanation": "In hypothetical situations we use 'were' for all persons: 'If I were you'."
    },
    {
      "question": "Which sentence is grammatically correct?",
      "options": [
        "I wish I would be taller.",
        "I wish I was taller.",
        "I wish I were taller.",
        "I wish I am taller."
      ],
      "correctAnswer": 2,
      "explanation": "'I wish I were taller' correctly uses unreal past 'were' to express a wish about the present."
    },
    {
      "question": "Complete: 'I'd rather you _____ smoking in the house.'",
      "options": [
        "don't",
        "didn't",
        "wouldn't",
        "not"
      ],
      "correctAnswer": 1,
      "explanation": "After 'would rather' for others' actions, we use past simple: 'didn't smoke'."
    },
    {
      "question": "Which expresses the strongest urgency?",
      "options": [
        "It's time to go.",
        "It's time we went.",
        "It's about time we went.",
        "It's high time we went."
      ],
      "correctAnswer": 3,
      "explanation": "'It's high time' expresses the strongest urgency, indicating something should have happened long ago."
    },
    {
      "question": "Complete: 'I wish I _____ studied harder when I was younger.'",
      "options": [
        "have",
        "had",
        "would have",
        "will have"
      ],
      "correctAnswer": 1,
      "explanation": "For regrets about the past we use 'wish + had + past participle'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Subjunctive and Unreal Past helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Subjunctive and Unreal Past until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Subjunctive and Unreal Past ___0___ week.",
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
          "text": "In formal English, we say 'I suggest that he goes' after suggestion verbs.",
          "isTrue": true,
          "explanation": "False. In formal English we use the base form: 'I suggest that he go'."
        },
        {
          "text": "'Were' is used for all persons in unreal situations.",
          "isTrue": true,
          "explanation": "Correct. 'Were' is used for all persons in unreal situations."
        },
        {
          "text": "'I wish you would listen' expresses a desire for future change.",
          "isTrue": true,
          "explanation": "Correct. 'Wish + would' expresses a desire for future change in others."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'It's time we left' means we should leave now or soon.",
          "isTrue": true,
          "explanation": "Correct. This structure indicates it's time to act."
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
      "title": "Match the term to Subjunctive and Unreal Past",
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
      "title": "Select all good strategies for Subjunctive and Unreal Past",
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

export function buildSubjunctiveAndUnrealPastExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('subjunctive-and-unreal-p', config, level, primaryLevel);
}
