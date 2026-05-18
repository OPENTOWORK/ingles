import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What kinds of structures are used to speak fluently?",
      "options": [
        "Passive",
        "Active",
        "Complex",
        "Simple"
      ],
      "correctAnswer": 1,
      "explanation": "Active structures support fluent speech because they tend to sound more direct and natural in conversation."
    },
    {
      "question": "What is the main benefit of using active grammatical structures?",
      "options": [
        "Improving pronunciation",
        "Speaking fluently and naturally",
        "Speaking faster",
        "Needing less vocabulary"
      ],
      "correctAnswer": 1,
      "explanation": "The main benefit is speaking fluently and naturally: active structures help you express complex ideas effectively."
    },
    {
      "question": "Which structure best expresses an opinion with moderate certainty?",
      "options": [
        "I'm absolutely sure that...",
        "I think that...",
        "I have no idea...",
        "It might be..."
      ],
      "correctAnswer": 1,
      "explanation": "'I think that...' signals moderate certainty, while the others lean toward certainty, uncertainty, or possibility."
    },
    {
      "question": "Which structure fits a formal conclusion best?",
      "options": [
        "All in all...",
        "In conclusion...",
        "Finally...",
        "What if..."
      ],
      "correctAnswer": 1,
      "explanation": "'In conclusion...' is the best fit for a formal conclusion here; the other options suit informal wrapping-up or different purposes."
    },
    {
      "question": "Which statement about \"Active Grammar and Useful Structures\" is correct?",
      "options": [
        "It is only useful at C2 level",
        "It is an important topic for Cambridge exams",
        "It is never tested in Use of English",
        "It replaces all other grammar topics"
      ],
      "correctAnswer": 1,
      "explanation": "\"Active Grammar and Useful Structures\" is relevant across B1–C2 exam preparation."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Active Grammar and Useful Structures helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Active Grammar and Useful Structures until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Active Grammar and Useful Structures ___0___ week.",
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
          "text": "It is important to vary structures to avoid repetition.",
          "isTrue": true,
          "explanation": "Correct. Varying structures keeps your speech more interesting and natural, and avoids monotone repetition."
        },
        {
          "text": "Formal structures are appropriate in every context.",
          "isTrue": true,
          "explanation": "Incorrect. Structures should suit the context. Formal ones are often a poor fit in informal situations."
        },
        {
          "text": "Active practice builds fluency in using structures.",
          "isTrue": true,
          "explanation": "Correct. Active practice in real contexts is one of the best ways to gain fluency and naturalness."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Context does not influence which structures you choose.",
          "isTrue": false,
          "explanation": "Incorrect. Context shapes which structures fit. Different situations call for different levels of formality."
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
      "title": "Match the term to Active Grammar and Useful Structures",
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
      "title": "Select all good strategies for Active Grammar and Useful Structures",
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

export function buildActiveGrammarAndUsefulStructuresExercises() {
  return buildTheoryExercises('active-grammar-and-usefu', config);
}
