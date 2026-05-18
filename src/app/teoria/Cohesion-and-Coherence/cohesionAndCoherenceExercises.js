import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the main difference between cohesion and coherence?",
      "options": [
        "None—they are synonyms",
        "Cohesion is grammatical linking; coherence is logical unity",
        "Cohesion is for long texts only",
        "Cohesion matters more than coherence"
      ],
      "correctAnswer": 1,
      "explanation": "Cohesion is surface linking; coherence is whether the whole text makes unified sense."
    },
    {
      "question": "In 'Mary bought a dress. It was beautiful.', what cohesive device is used?",
      "options": [
        "Explicit connector",
        "Lexical substitution",
        "Pronoun reference",
        "Repetition"
      ],
      "correctAnswer": 2,
      "explanation": "'It' refers to 'dress'—pronoun reference creates cohesion."
    },
    {
      "question": "What cohesion problem appears in: 'John told Peter he was wrong.'?",
      "options": [
        "Missing connectors",
        "Ambiguous pronoun reference",
        "Wrong tense",
        "Inappropriate vocabulary"
      ],
      "correctAnswer": 1,
      "explanation": "'He' could mean John or Peter, which confuses the reader."
    },
    {
      "question": "What strategy reduces clumsy repetition?",
      "options": [
        "Use only pronouns",
        "Remove all reference words",
        "Use synonyms and appropriate pro-forms",
        "Repeat the same word always"
      ],
      "correctAnswer": 2,
      "explanation": "Synonyms, hypernyms, and pro-forms like 'such' and 'one' vary wording while staying cohesive."
    },
    {
      "question": "Which best connects these ideas? 'It was raining. We decided to stay home.'",
      "options": [
        "It was raining. We decided to stay home.",
        "It was raining, so we decided to stay home.",
        "It was raining. However, we decided to stay home.",
        "It was raining. Furthermore, we decided to stay home."
      ],
      "correctAnswer": 1,
      "explanation": "'So' shows cause and effect: rain led to staying home."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Cohesion and Coherence, first ___0___ what you need to find.",
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
          "text": "A text can have strong cohesion but weak coherence.",
          "isTrue": true,
          "explanation": "Correct. Sentences may link grammatically while the overall argument stays disjointed."
        },
        {
          "text": "Connectors like 'however' and 'therefore' add cohesion.",
          "isTrue": true,
          "explanation": "Correct. Explicit connectors are major cohesive devices."
        },
        {
          "text": "Coherence depends only on correct pronouns.",
          "isTrue": false,
          "explanation": "Incorrect. Coherence needs topic unity, logical order, and consistent stance—not only pronouns."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Each paragraph should support the main topic for coherence.",
          "isTrue": true,
          "explanation": "Correct. Thematic unity needs every paragraph to serve the overall aim."
        },
        {
          "text": "Switching from first to third person for no reason is fine.",
          "isTrue": true,
          "explanation": "Incorrect. Random viewpoint shifts harm coherence."
        },
        {
          "text": "Demonstratives like 'this' and 'that' can create cohesion.",
          "isTrue": true,
          "explanation": "Correct. They point back to ideas mentioned earlier."
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
      "title": "Select all effective Cohesion and Coherence techniques",
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

export function buildCohesionAndCoherenceExercises() {
  return buildTheoryExercises('cohesion-and-coherence', config);
}
