import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What does 'vocabulary in context' mean?",
      "options": [
        "Memorising vocabulary lists",
        "Using context to understand unknown words",
        "Translating every word",
        "Looking up every word"
      ],
      "correctAnswer": 1,
      "explanation": "It means using clues in the text to work out unknown words."
    },
    {
      "question": "In 'A pediatrician, a doctor who treats children, was called', what type of clue is used?",
      "options": [
        "Contrast",
        "Example",
        "Direct definition",
        "Cause and effect"
      ],
      "correctAnswer": 2,
      "explanation": "The phrasing 'a doctor who treats children' is a direct definition of 'pediatrician'."
    },
    {
      "question": "In 'Unlike his gregarious brother, Tom was shy', what does 'gregarious' probably mean?",
      "options": [
        "Shy",
        "Sociable",
        "Intelligent",
        "Tall"
      ],
      "correctAnswer": 1,
      "explanation": "'Unlike' signals contrast. If Tom is shy, his brother is the opposite—sociable."
    },
    {
      "question": "What is the best approach when you cannot infer a word?",
      "options": [
        "Stop reading at once",
        "Keep reading—meaning may become clear",
        "Translate the whole sentence",
        "Skip the whole paragraph"
      ],
      "correctAnswer": 1,
      "explanation": "Keep going; meaning may clarify later or the word may not be essential."
    },
    {
      "question": "In 'The drought caused the crops to wither', what does 'wither' probably mean?",
      "options": [
        "Grow more",
        "Dry up and die",
        "Change colour",
        "Bear fruit"
      ],
      "correctAnswer": 1,
      "explanation": "Drought would make plants dry and die rather than grow or fruit."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Vocabulary in Context, first ___0___ what you need to find.",
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
          "text": "You always need a dictionary for new words.",
          "isTrue": true,
          "explanation": "Incorrect. Context often gives enough clues without a dictionary."
        },
        {
          "text": "Context clues may appear in sentences other than the one with the unknown word.",
          "isTrue": true,
          "explanation": "Correct. Sometimes you need earlier or later sentences for the clue."
        },
        {
          "text": "Grammar does not help you guess word meaning.",
          "isTrue": false,
          "explanation": "Incorrect. Knowing noun, verb, adjective, etc. gives useful hints."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Examples in the text can help you understand unknown words.",
          "isTrue": true,
          "explanation": "Correct. Lists such as 'citrus fruits such as oranges, lemons...' clarify the general term."
        },
        {
          "text": "You must know every word to understand a text.",
          "isTrue": true,
          "explanation": "Incorrect. You can grasp the main idea without every word."
        },
        {
          "text": "General knowledge can help you infer meanings.",
          "isTrue": true,
          "explanation": "Correct. Knowledge of jobs, situations, etc. supports educated guesses."
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
      "title": "Select all effective Vocabulary in Context techniques",
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

export function buildVocabularyInContextExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('vocabulary-in-context', config, level, primaryLevel);
}
