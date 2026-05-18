import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'I like coffee. _____, I prefer tea in the morning.'",
      "options": [
        "Therefore",
        "However",
        "Because",
        "So"
      ],
      "correctAnswer": 1,
      "explanation": "'However' introduces a contrast: you like coffee, but you prefer tea in the morning."
    },
    {
      "question": "What is the main benefit of using linking words?",
      "options": [
        "Improving pronunciation",
        "Creating coherent, fluent texts",
        "Increasing writing speed",
        "Reducing the vocabulary you need"
      ],
      "correctAnswer": 1,
      "explanation": "Linking words connect ideas and produce coherent, fluent texts, which makes them easier for the reader to understand."
    },
    {
      "question": "Which option best adds information in a formal way?",
      "options": [
        "and",
        "also",
        "furthermore",
        "too"
      ],
      "correctAnswer": 2,
      "explanation": "'Furthermore' is the most formal choice for adding information. 'And' is very basic, 'also' is less formal, and 'too' goes at the end."
    },
    {
      "question": "Which linking word is best for showing contrast in academic writing?",
      "options": [
        "but",
        "however",
        "though",
        "and"
      ],
      "correctAnswer": 1,
      "explanation": "'However' is the best fit for academic and formal contexts. 'But' is more informal, 'though' is casual, and 'and' does not signal contrast."
    },
    {
      "question": "Complete: '_____ studying hard, he failed the exam.'",
      "options": [
        "Although",
        "Despite",
        "Because",
        "Therefore"
      ],
      "correctAnswer": 1,
      "explanation": "'Despite' + gerund is correct: 'Despite studying hard'. 'Although' would need something like 'Although he studied hard'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Linking Words helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Linking Words until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Linking Words ___0___ week.",
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
          "text": "It is acceptable to use 'but' at the beginning of a sentence in formal English.",
          "isTrue": true,
          "explanation": "In formal English, it is better to use 'however' at the beginning of the second sentence to show contrast."
        },
        {
          "text": "Linking words help organize ideas logically.",
          "isTrue": true,
          "explanation": "Correct. Linking words connect ideas and help create a logical structure in a text."
        },
        {
          "text": "It is important to vary linking words to avoid repetition.",
          "isTrue": true,
          "explanation": "Correct. Using a variety of linking words makes writing more engaging and professional."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'Because' and 'so' can be used together in the same clause.",
          "isTrue": false,
          "explanation": "Incorrect. Do not use 'because' and 'so' together. Use one or the other: 'Because I was tired, I went to bed' or 'I was tired, so I went to bed'."
        },
        {
          "text": "'Although' and 'despite' can be used interchangeably in all contexts.",
          "isTrue": true,
          "explanation": "Incorrect. 'Although' is followed by a full clause, while 'despite' is followed by a noun or gerund."
        },
        {
          "text": "Linking words help create logical flow in writing.",
          "isTrue": true,
          "explanation": "Correct. Linking words connect ideas and create a logical flow that supports comprehension."
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
      "title": "Match the term to Linking Words",
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
      "title": "Select all good strategies for Linking Words",
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

export function buildLinkingWordsExercises() {
  return buildTheoryExercises('linking-words', config);
}
