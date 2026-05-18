import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the best way to approach multiple choice reading questions?",
      "options": [
        "Read all the options before the text",
        "Read the question first, then the text looking for the answer",
        "Read the whole text without looking at the questions",
        "Choose the longest option"
      ],
      "correctAnswer": 1,
      "explanation": "Reading the question first tells you what specific information to look for in the text."
    },
    {
      "question": "What should you do when you are unsure between two options?",
      "options": [
        "Guess at random",
        "Pick the first one you saw",
        "Look for specific evidence in the text for each option",
        "Pick the shortest one"
      ],
      "correctAnswer": 2,
      "explanation": "Search for textual evidence supporting each option and choose the one with the strongest support."
    },
    {
      "question": "What type of question is this? 'What can be inferred about the author's opinion?'",
      "options": [
        "Specific information",
        "Main idea",
        "Inference and attitude",
        "Vocabulary in context"
      ],
      "correctAnswer": 2,
      "explanation": "It asks about inference and attitude because you must infer the author's opinion from implicit clues."
    },
    {
      "question": "Which is a common trap in wrong options?",
      "options": [
        "Using synonyms from the text",
        "Being too specific",
        "Using words from the text in the wrong context",
        "Being very short"
      ],
      "correctAnswer": 2,
      "explanation": "A common trap is recycling words from the text in a context different from what the question asks."
    },
    {
      "question": "What should you do if an option is partly true but does not fully answer the question?",
      "options": [
        "Choose it because something in it is right",
        "Reject it and look for a more complete answer",
        "Mentally merge it with another option",
        "Ask the examiner"
      ],
      "correctAnswer": 1,
      "explanation": "Reject it. The correct answer must fully answer the question, not only partly."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Multiple Choice Questions, first ___0___ what you need to find.",
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
          "text": "Options with words like 'always' or 'never' are often incorrect.",
          "isTrue": true,
          "explanation": "Correct. Absolute wording is often wrong because reality usually allows exceptions."
        },
        {
          "text": "You can use general knowledge even if it is not in the text.",
          "isTrue": true,
          "explanation": "Incorrect. You should use only the information given in the text, not outside knowledge."
        },
        {
          "text": "Elimination is a useful strategy in multiple choice.",
          "isTrue": true,
          "explanation": "Correct. Ruling out clearly wrong options improves your chance of picking the right answer."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You must read the whole text before looking at any question.",
          "isTrue": true,
          "explanation": "Incorrect. It is usually more efficient to read the questions first so you know what to find."
        },
        {
          "text": "The correct answer should always have direct support in the text.",
          "isTrue": true,
          "explanation": "Correct. Each answer should be backed by specific evidence from the text."
        },
        {
          "text": "Longer options are usually correct.",
          "isTrue": false,
          "explanation": "Incorrect. Length does not show correctness; base your choice on content and evidence."
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
      "title": "Select all effective Multiple Choice Questions techniques",
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

export function buildMultipleChoiceQuestionsExercises() {
  return buildTheoryExercises('multiple-choice-question', config);
}
