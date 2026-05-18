import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'She is a _____ girl who sings _____.' (beautiful)",
      "options": [
        "beautiful, beautiful",
        "beautifully, beautifully",
        "beautiful, beautifully",
        "beautifully, beautiful"
      ],
      "correctAnswer": 2,
      "explanation": "'Beautiful' (adjective) describes nouns; 'beautifully' (adverb) describes verbs."
    },
    {
      "question": "Which is the correct form to complete: 'She runs ___'?",
      "options": [
        "quick",
        "quickly",
        "quicklyly",
        "quicklyer"
      ],
      "correctAnswer": 1,
      "explanation": "To describe how she runs (verb), we use the adverb 'quickly'."
    },
    {
      "question": "Which is the correct form to complete: 'He is ___ student in the class'?",
      "options": [
        "the most intelligent",
        "the intelligentest",
        "the more intelligent",
        "the intelligenter"
      ],
      "correctAnswer": 0,
      "explanation": "For superlatives of long adjectives we use 'the most + adjective': 'the most intelligent'."
    },
    {
      "question": "Which is the correct form to complete: 'I am ___ at mathematics'?",
      "options": [
        "good",
        "well",
        "goodly",
        "goods"
      ],
      "correctAnswer": 0,
      "explanation": "After 'be' we use adjectives. 'Good' is the correct adjective here."
    },
    {
      "question": "Complete: 'She drives very _____.'",
      "options": [
        "careful",
        "carefully",
        "care",
        "caring"
      ],
      "correctAnswer": 1,
      "explanation": "To modify a verb we need an adverb: 'carefully'. 'She drives very carefully'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Adverbs and Adjectives helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Adverbs and Adjectives until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Adverbs and Adjectives ___0___ week.",
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
          "text": "'I am very tiredly' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. After 'be' we use adjectives: 'I am very tired'."
        },
        {
          "text": "'She sings beautifully' is correct.",
          "isTrue": true,
          "explanation": "Correct. To describe how she sings we use the adverb 'beautifully'."
        },
        {
          "text": "'This car is more expensive than that one' is correct.",
          "isTrue": true,
          "explanation": "Correct. For long adjectives we use 'more + adjective + than'."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'I always am happy' is correct.",
          "isTrue": false,
          "explanation": "Incorrect. With 'be', the adverb goes after: 'I am always happy'."
        },
        {
          "text": "Adverbs usually end in -ly.",
          "isTrue": true,
          "explanation": "Correct. Most adverbs end in -ly: quickly, slowly, carefully."
        },
        {
          "text": "We can say 'She sings beautiful'.",
          "isTrue": true,
          "explanation": "Incorrect. We need the adverb 'beautifully' to modify the verb: 'She sings beautifully'."
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
      "title": "Match the term to Adverbs and Adjectives",
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
      "title": "Select all good strategies for Adverbs and Adjectives",
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

export function build4AdverbsAndAdjectivesExercises() {
  return buildTheoryExercises('adverbs-and-adjectives', config);
}
