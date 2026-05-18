import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: '_____ that technology improves life.'",
      "options": [
        "It seems to me",
        "It is widely believed",
        "I think",
        "Maybe"
      ],
      "correctAnswer": 1,
      "explanation": "“It is widely believed” is a formal structure for a widely shared or accepted view."
    },
    {
      "question": "Which structure best expresses a firm opinion?",
      "options": [
        "It seems to me that...",
        "I firmly believe that...",
        "There is reason to believe that...",
        "It should be noted that..."
      ],
      "correctAnswer": 1,
      "explanation": "“I firmly believe that...” shows strong conviction; the others signal weaker or different stances."
    },
    {
      "question": "Which structure is most appropriate for a conclusion?",
      "options": [
        "To begin with...",
        "In conclusion, it can be said that...",
        "Furthermore, it is essential...",
        "This is due to the fact that..."
      ],
      "correctAnswer": 1,
      "explanation": "“In conclusion, it can be said that...” is a typical way to open a concluding section."
    },
    {
      "question": "Which structure would you use to show contrast formally?",
      "options": [
        "Unlike the previous example...",
        "And also...",
        "What is more important is...",
        "It is widely believed that..."
      ],
      "correctAnswer": 0,
      "explanation": "“Unlike the previous example...” signals contrast between two examples."
    },
    {
      "question": "Complete: '_____ the benefits, there are also disadvantages.'",
      "options": [
        "Despite",
        "Because of",
        "Due to",
        "Thanks to"
      ],
      "correctAnswer": 0,
      "explanation": "“Despite” introduces concession: even with the benefits, there are downsides."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Useful Grammar and Structures, first ___0___ what you need to find.",
      "blanks": [
        {
          "answer": "identify"
        }
      ]
    },
    {
      "text": "Skim the text to get the ___0___ idea quickly.",
      "blanks": [
        {
          "answer": "main"
        }
      ]
    },
    {
      "text": "Then read ___0___ for the specific details you need.",
      "blanks": [
        {
          "answer": "carefully"
        }
      ]
    }
  ],
  "trueFalse": [
    {
      "statements": [
        {
          "text": "'Former' refers to the first item mentioned and 'latter' to the second.",
          "isTrue": true,
          "explanation": "Correct. Former = first; latter = second of two items already introduced."
        },
        {
          "text": "Formal structures are appropriate in every context.",
          "isTrue": true,
          "explanation": "Incorrect. Use formal patterns in suitable contexts such as academic essays."
        },
        {
          "text": "'Were it not for...' is an advanced conditional structure.",
          "isTrue": true,
          "explanation": "Correct. It is a formal, inverted way to express a hypothetical condition."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should always use the same structures for consistency.",
          "isTrue": false,
          "explanation": "Incorrect. Vary structures to reduce repetition and keep the reader engaged."
        },
        {
          "text": "Passive voice is more formal than active voice.",
          "isTrue": true,
          "explanation": "Correct. Passive voice is common in academic and professional writing."
        },
        {
          "text": "'It is important to note that' is a useful academic phrase.",
          "isTrue": true,
          "explanation": "Correct. It helps introduce important points in academic texts."
        }
      ]
    }
  ],
  "matching": [
    {
      "title": "Match the strategy to its purpose",
      "pairs": [
        {
          "left": "Skimming",
          "right": "Get the gist fast"
        },
        {
          "left": "Scanning",
          "right": "Find specific information"
        },
        {
          "left": "Close reading",
          "right": "Analyse detail and nuance"
        },
        {
          "left": "Checking",
          "right": "Verify your answer"
        }
      ],
      "explanation": "Each reading/listening strategy has a distinct goal."
    },
    {
      "title": "Match the signal to what it shows",
      "pairs": [
        {
          "left": "However",
          "right": "Contrast"
        },
        {
          "left": "Therefore",
          "right": "Result"
        },
        {
          "left": "For example",
          "right": "Illustration"
        },
        {
          "left": "In contrast",
          "right": "Opposition"
        }
      ],
      "explanation": "Discourse markers guide interpretation."
    }
  ],
  "findError": [
    {
      "title": "Find the weak advice",
      "sentence": "You should read every word at the same slow speed.",
      "options": [
        "You",
        "should",
        "every word",
        "slow speed"
      ],
      "correctIndex": 2,
      "explanation": "Adjust speed: skim/scan first, then read carefully where needed."
    },
    {
      "title": "Find the weak advice",
      "sentence": "Never read the question before the text.",
      "options": [
        "Never",
        "read",
        "the question",
        "before the text"
      ],
      "correctIndex": 0,
      "explanation": "Always read the task/question first to know what to look for."
    },
    {
      "title": "Find the weak advice",
      "sentence": "If you are unsure, always choose the longest option.",
      "options": [
        "If you are unsure",
        "always",
        "choose",
        "the longest option"
      ],
      "correctIndex": 3,
      "explanation": "Length is not a reliable clue; use evidence from the text."
    }
  ],
  "sentenceOrder": [
    {
      "title": "Order the exam steps",
      "words": [
        "Read",
        "the",
        "instructions",
        "carefully",
        "first"
      ],
      "explanation": "Instructions tell you exactly what to do."
    },
    {
      "title": "Order the process",
      "words": [
        "Locate",
        "the",
        "relevant",
        "section",
        "of",
        "the",
        "text"
      ],
      "explanation": "Find where the answer likely appears before answering."
    },
    {
      "title": "Order the checking steps",
      "words": [
        "Check",
        "your",
        "answer",
        "against",
        "the",
        "text"
      ],
      "explanation": "Always verify with evidence."
    }
  ],
  "selectAll": [
    {
      "title": "Select all effective Useful Grammar and Structures techniques",
      "prompt": "Tick every good technique.",
      "options": [
        {
          "text": "Underline key words in the question",
          "isCorrect": true
        },
        {
          "text": "Ignore the time limit completely",
          "isCorrect": false
        },
        {
          "text": "Use context to infer meaning",
          "isCorrect": true
        },
        {
          "text": "Guess without returning to the text",
          "isCorrect": false
        }
      ],
      "explanation": "Keywords, context, and evidence-based answers are essential."
    },
    {
      "title": "Select all true statements",
      "prompt": "Which are correct?",
      "options": [
        {
          "text": "Paraphrasing is common in exam texts",
          "isCorrect": true
        },
        {
          "text": "The exact same words always appear in the answer",
          "isCorrect": false
        },
        {
          "text": "Tone and attitude can be tested",
          "isCorrect": true
        },
        {
          "text": "Practice improves speed and accuracy",
          "isCorrect": true
        }
      ],
      "explanation": "Exams use paraphrase; tone matters; practice helps."
    }
  ]
};

export function buildUsefulGrammarAndStructuresExercises() {
  return buildTheoryExercises('useful-grammar-and-struc', config);
}
