import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "In connected speech, what happens to neighbouring sounds chiefly?",
      "options": [
        "They remain fully separated every time",
        "They knit together for rhythmic flow",
        "They disappear completely without trace",
        "They always lengthen dramatically"
      ],
      "correctAnswer": 1,
      "explanation": "Fluent delivery smears syllable margins so consonants vowels reorganise perceptually—not isolated beads."
    },
    {
      "question": "What best defines linking?",
      "options": [
        "Removing every unstressed vowel",
        "Joining syllable-final and syllable-initial gestures",
        "Inserting vowels arbitrarily",
        "Slowing consonants artificially"
      ],
      "correctAnswer": 1,
      "explanation": "Linking co-articulates word edges so consonants glide into vowels or twin consonants merge."
    },
    {
      "question": "Which blend best matches habitual treatment of frequent 'go out' sequences?",
      "options": [
        "go out untouched",
        "gow-out style glide bridging vowels",
        "go hyphen ut fully paused",
        "gout lexicalised anew"
      ],
      "correctAnswer": 1,
      "explanation": "Back vowel /əʊ/ into /aʊ/ frequently recruits intrusive /w/ smoothing the hiatus."
    },
    {
      "question": "Most effective overarching tactic when phones blur aggressively?",
      "options": [
        "Listen only hyper-enunciated materials forever",
        "Exploit pragmatic prediction plus chunk-level meaning",
        "Avoid rapid native speech entirely",
        "Memorise every assimilation tableau exhaustively beforehand"
      ],
      "correctAnswer": 1,
      "explanation": "Top-down scaffolding plus probabilistic lexical guessing sustains realtime comprehension."
    },
    {
      "question": "What approximate surface often emerges from rapid 'good day'?",
      "options": [
        "No temporal compression",
        "Consonant elision thinning final /d/",
        "Extra vowels inserted mechanically",
        "Uniform syllable stretching"
      ],
      "correctAnswer": 1,
      "explanation": "Many speakers drop or weaken terminal /d/ before another consonant yielding goo-day-like contours."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Pronunciation and Connected Speech, first ___0___ what you need to find.",
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
          "text": "Connected speech phenomena are normal rather than careless errors.",
          "isTrue": true,
          "explanation": "Correct. Native fluency universally compresses and reshapes neighbouring phones."
        },
        {
          "text": "Weak forms overwhelmingly target function vocabulary.",
          "isTrue": true,
          "explanation": "Correct. Grammatical satellites reduce while content lemmas stay relatively full."
        },
        {
          "text": "You must decode each dictionary word cleanly before catching gist.",
          "isTrue": true,
          "explanation": "Incorrect. Meaning windows often stabilize before lexical edges crystallise acoustically."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Steady authentic listening gradually eases blurred-boundary comprehension.",
          "isTrue": true,
          "explanation": "Correct. Statistical learning retunes perceptual expectations over months."
        },
        {
          "text": "Weak pronunciation variants cluster around auxiliary preposition article words.",
          "isTrue": true,
          "explanation": "Correct. These carry grammar glue not novel referential content hence shrink rhythmically."
        },
        {
          "text": "Assimilation adjusts consonants toward neighbouring place manner voicing cues.",
          "isTrue": true,
          "explanation": "Correct. Gestures economise muscular effort aligning adjacent targets."
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
      "title": "Select all effective Pronunciation and Connected Speech techniques",
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

export function buildConnectedSpeechExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('connected-speech', config, level, primaryLevel);
}
