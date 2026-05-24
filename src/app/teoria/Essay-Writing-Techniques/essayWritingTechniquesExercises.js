import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which of the following is the strongest thesis statement?",
      "options": [
        "Social media is popular among young people.",
        "Social media has both positive and negative effects.",
        "Social media platforms exploit user data to maximise advertising revenue at the expense of user privacy.",
        "Many people use social media every day."
      ],
      "correctAnswer": 2,
      "explanation": "This option is specific, arguable, and can be defended with evidence."
    },
    {
      "question": "In the PEEL structure, what does the 'E' in 'Evidence' refer to?",
      "options": [
        "Examples only",
        "Emotional appeals",
        "Facts, data, examples, or quotes that support your point",
        "Explanations of your personal opinion"
      ],
      "correctAnswer": 2,
      "explanation": "Evidence includes any factual support: data, statistics, examples, expert views, etc."
    },
    {
      "question": "Which connector introduces a contrasting idea: '_____, some educators argue that traditional methods remain superior.'",
      "options": [
        "Furthermore",
        "However",
        "Therefore",
        "Moreover"
      ],
      "correctAnswer": 1,
      "explanation": "“However” signals contrast with the previous sentence."
    },
    {
      "question": "Which connector would be most appropriate to introduce a contrasting viewpoint?",
      "options": [
        "Furthermore",
        "Consequently",
        "Nevertheless",
        "In addition"
      ],
      "correctAnswer": 2,
      "explanation": "“Nevertheless” concedes a point but presents a contrasting view."
    },
    {
      "question": "What is the main purpose of a topic sentence?",
      "options": [
        "To conclude the paragraph",
        "To introduce the main idea of the paragraph",
        "To provide evidence",
        "To connect to the next paragraph"
      ],
      "correctAnswer": 1,
      "explanation": "The topic sentence introduces the paragraph's main idea."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Essay Writing Techniques, first ___0___ what you need to find.",
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
          "text": "Academic writing should avoid contractions like 'don't' and 'can't'.",
          "isTrue": true,
          "explanation": "Correct. Full forms such as “do not” and “cannot” suit academic style."
        },
        {
          "text": "It's acceptable to introduce completely new ideas in the conclusion.",
          "isTrue": true,
          "explanation": "Incorrect. The conclusion should close the argument, not start a new one."
        },
        {
          "text": "Each body paragraph should focus on one main point.",
          "isTrue": true,
          "explanation": "Correct. One clear topic sentence per paragraph."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Using first person (I, my, me) is always inappropriate in academic essays.",
          "isTrue": false,
          "explanation": "Incorrect. Some tasks allow a measured use of first person (e.g. reflective writing)."
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
      "title": "Select all effective Essay Writing Techniques techniques",
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

export function buildEssayWritingTechniquesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('essay-writing-techniques', config, level, primaryLevel);
}
