import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What best characterises Cross-text Multiple Matching?",
      "options": [
        "Analysing one text in great detail",
        "Relating information across several different texts",
        "Translating between languages",
        "Memorising content from several texts"
      ],
      "correctAnswer": 1,
      "explanation": "Cross-text Multiple Matching is about linking, comparing, and contrasting information across different texts."
    },
    {
      "question": "What is the best first step for this task type?",
      "options": [
        "Read all the texts without notes",
        "Create a mental map of each text's main ideas",
        "Memorise the first text completely",
        "Read only the first sentence of each text"
      ],
      "correctAnswer": 1,
      "explanation": "A mental map helps you organise and systematically compare each text's main ideas."
    },
    {
      "question": "When the question is 'Which texts express optimism about the future?', what kind of link are you looking for?",
      "options": [
        "Content similarities",
        "Contrasts and differences",
        "Attitudes and tone",
        "Specific factual information"
      ],
      "correctAnswer": 2,
      "explanation": "You are comparing attitudes and tone—specifically which texts show an optimistic stance."
    },
    {
      "question": "How should you treat similarities between texts?",
      "options": [
        "Assume related ideas are the same",
        "Check that ideas are truly similar, not just related",
        "Focus only on identical wording",
        "Ignore subtle differences"
      ],
      "correctAnswer": 1,
      "explanation": "Verify that ideas are genuinely similar, not merely related or superficially alike."
    },
    {
      "question": "What should you do when texts contradict each other?",
      "options": [
        "Ignore the contradictions",
        "Choose the text you prefer",
        "Note and analyse the differences as possible answers",
        "Aim for a compromise between them"
      ],
      "correctAnswer": 2,
      "explanation": "Contradictions matter and may be the answer to questions about contrast or differing views."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Cross-text Multiple Matching, first ___0___ what you need to find.",
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
          "text": "In Cross-text Multiple Matching, some texts may not answer any question.",
          "isTrue": true,
          "explanation": "Correct. Not every text has to be used for the questions given."
        },
        {
          "text": "You should only look for information that is explicitly stated.",
          "isTrue": true,
          "explanation": "Incorrect. You should also analyse implicit attitudes, tone, and underlying assumptions."
        },
        {
          "text": "One question may have several texts as correct answers.",
          "isTrue": true,
          "explanation": "Correct. Several texts may share the feature the question asks about."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should distinguish partial agreement from full agreement between texts.",
          "isTrue": true,
          "explanation": "Correct. Be precise about how far the texts really agree."
        },
        {
          "text": "Superficial similarities are enough to claim texts align.",
          "isTrue": false,
          "explanation": "Incorrect. Look for substantive links, not surface-level matches."
        },
        {
          "text": "You may assume logical connections that the texts never state.",
          "isTrue": false,
          "explanation": "Incorrect. Links must rest on clear evidence from the texts, not on guesswork."
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
      "title": "Select all effective Cross-text Multiple Matching techniques",
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

export function buildCrossTextMultipleMatchingExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('cross-text-multiple-matc', config, level, primaryLevel);
}
