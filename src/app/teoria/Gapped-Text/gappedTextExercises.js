import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the main aim of a Gapped Text task?",
      "options": [
        "Fill in missing words",
        "Choose paragraphs that fit logically in the gaps",
        "Translate the whole text",
        "Find grammar mistakes"
      ],
      "correctAnswer": 1,
      "explanation": "In Gapped Text you choose whole paragraphs that fit logically into the gaps in the text."
    },
    {
      "question": "What should you do before you start filling the gaps?",
      "options": [
        "Read only the list of options",
        "Count how many gaps there are",
        "Read the whole text to understand the general topic",
        "Start immediately with the first gap"
      ],
      "correctAnswer": 2,
      "explanation": "Read the whole text first to understand topic, structure, and flow of ideas."
    },
    {
      "question": "If an optional paragraph starts with 'However', what does that suggest?",
      "options": [
        "It is the first paragraph of the text",
        "It contrasts with the previous idea",
        "It is a conclusion",
        "It introduces an example"
      ],
      "correctAnswer": 1,
      "explanation": "'However' signals contrast, so the paragraph should follow an idea it contrasts with or qualifies."
    },
    {
      "question": "Which words help you spot time order?",
      "options": [
        "Descriptive adjectives",
        "Then, later, previously, afterwards",
        "Proper nouns",
        "Ordinal numbers only"
      ],
      "correctAnswer": 1,
      "explanation": "Time connectors like 'then', 'later', and 'previously' show sequence and help you order events."
    },
    {
      "question": "What does 'the former' mean in a text?",
      "options": [
        "The first of two things mentioned earlier",
        "A famous person",
        "The previous paragraph",
        "The author"
      ],
      "correctAnswer": 0,
      "explanation": "'The former' refers to the first of two items mentioned earlier; 'the latter' refers to the second."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Gapped Text, first ___0___ what you need to find.",
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
          "text": "Pronouns like 'this', 'that', and 'it' are important clues for cohesion.",
          "isTrue": true,
          "explanation": "Correct. Pronouns must refer to something mentioned earlier, which helps you find links."
        },
        {
          "text": "You can use each optional paragraph more than once.",
          "isTrue": true,
          "explanation": "Incorrect. Each paragraph from the list is used only once, and some may not be used at all."
        },
        {
          "text": "The chosen paragraph should match the style and tone of the rest of the text.",
          "isTrue": true,
          "explanation": "Correct. Consistency of style, tone, and register is essential for textual cohesion."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should analyse both what comes before and what comes after each gap.",
          "isTrue": true,
          "explanation": "Correct. Full context (before and after) is crucial for choosing the right paragraph."
        },
        {
          "text": "Lexical repetition is not important in Gapped Text.",
          "isTrue": false,
          "explanation": "Incorrect. Lexical repetition and synonyms are important clues for cohesion."
        },
        {
          "text": "Every optional paragraph must be used in the task.",
          "isTrue": false,
          "explanation": "Incorrect. There are usually more options than gaps, so some paragraphs are not used."
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
      "title": "Select all effective Gapped Text techniques",
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

export function buildGappedTextExercises() {
  return buildTheoryExercises('gapped-text', config);
}
