import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "In British English, what does 'lift' mean?",
      "options": [
        "Truck",
        "Elevator",
        "Car",
        "Bus"
      ],
      "correctAnswer": 1,
      "explanation": "'Lift' parallels American 'elevator'—vertical transport inside buildings."
    },
    {
      "question": "Which contrast is MOST iconic between mainstream British and General American pronunciation?",
      "options": [
        "Treatment of unstressed vowel schwa",
        "Realisation or suppression of syllable-final /r/",
        "Aspiration strength of voiceless stops",
        "Whether /h/ is dropped"
      ],
      "correctAnswer": 1,
      "explanation": "Non-rhotic vs rotic environments form the quintessential classroom contrast."
    },
    {
      "question": "Which American item matches British 'biscuit' when meaning a sweet baked snack?",
      "options": [
        "cookie",
        "cracker",
        "bread roll",
        "layer cake"
      ],
      "correctAnswer": 0,
      "explanation": "American speakers usually say ‘cookie’ for the sweet biscuit sense of UK English."
    },
    {
      "question": "Which tactic most reliably widens receptive accuracy across dialects?",
      "options": [
        "Avoid non-native-accent media entirely",
        "Schedule recurring listening from multiple countries",
        "Restrict training to exactly one broadcaster",
        "Memorise every lexical replacement table once"
      ],
      "correctAnswer": 1,
      "explanation": "Distributed exposure trains flexible decoding faster than monoculture cramming."
    },
    {
      "question": "In American English, what is the compartment called that British speakers label the car 'boot'?",
      "options": [
        "Hood",
        "Trunk",
        "Bonnet",
        "Fender"
      ],
      "correctAnswer": 1,
      "explanation": "'Trunk' = AmE cargo hatch; bonnet vs hood distinguishes forward panels."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying English Varieties, first ___0___ what you need to find.",
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
          "text": "American English intrinsically outranks British English.",
          "isTrue": true,
          "explanation": "Incorrect. Established varieties coexist with equal legitimacy; register and audience—not geography—matter."
        },
        {
          "text": "Sticking deliberately to one variety across a text improves coherence.",
          "isTrue": true,
          "explanation": "Correct. Predictable orthography/vocabulary lowers cognitive strain for readers."
        },
        {
          "text": "Differences only operate at the phoneme level.",
          "isTrue": true,
          "explanation": "Incorrect. Spelling, lexis, and light grammar distinctions all matter communally."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Rotating dialect exposure sharpens listening stamina.",
          "isTrue": true,
          "explanation": "Correct. Diverse auditory diet familiarises vowel shifts and local coinages alike."
        },
        {
          "text": "Australian English has unique vocabulary items and idioms.",
          "isTrue": true,
          "explanation": "Correct—think arvo, barbie, mateship culture, etc."
        },
        {
          "text": "All major Englishes share identical spelling rules.",
          "isTrue": true,
          "explanation": "Incorrect—witness colour/color, traveller/traveler, etc."
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
      "title": "Select all effective English Varieties techniques",
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

export function buildEnglishVarietiesExercises() {
  return buildTheoryExercises('english-varieties', config);
}
