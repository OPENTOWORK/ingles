import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: '_____ am a teacher. _____ name is Sarah.'",
      "options": [
        "I, My",
        "Me, My",
        "I, Mine",
        "Me, Mine"
      ],
      "correctAnswer": 0,
      "explanation": "As subject we use 'I' and as possessive determiner we use 'My'."
    },
    {
      "question": "Which is the correct form to complete: 'This book is ___'?",
      "options": [
        "my",
        "mine",
        "me",
        "myself"
      ],
      "correctAnswer": 1,
      "explanation": "After 'is' we need a possessive pronoun that replaces the noun. 'Mine' means 'belonging to me'."
    },
    {
      "question": "Which is the correct form to complete: 'She gave the book to ___'?",
      "options": [
        "I",
        "me",
        "myself",
        "mine"
      ],
      "correctAnswer": 1,
      "explanation": "After the preposition 'to' we use object pronouns. 'Me' is the object pronoun for 'I'."
    },
    {
      "question": "Which is the correct form to complete: '___ and ___ are going to the party'?",
      "options": [
        "Me, him",
        "I, he",
        "Myself, himself",
        "Mine, his"
      ],
      "correctAnswer": 1,
      "explanation": "As subject we use personal pronouns: 'I' and 'he'. We also follow the order of politeness by putting 'I' last."
    },
    {
      "question": "Complete: 'She hurt _____ while playing tennis.'",
      "options": [
        "her",
        "herself",
        "hers",
        "she"
      ],
      "correctAnswer": 1,
      "explanation": "For reflexive actions we use reflexive pronouns: 'herself'."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Pronouns helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Pronouns until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Pronouns ___0___ week.",
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
          "text": "'Me and him went to the store' is correct.",
          "isTrue": true,
          "explanation": "Incorrect. As subject we use personal pronouns: 'He and I went to the store'."
        },
        {
          "text": "'This is my book' and 'This book is mine' are both correct.",
          "isTrue": true,
          "explanation": "Correct. 'My' is a possessive determiner, 'mine' is a possessive pronoun."
        },
        {
          "text": "'Its' and 'it's' mean the same thing.",
          "isTrue": true,
          "explanation": "Incorrect. 'Its' is possessive, 'it's' is a contraction of 'it is'."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "'I hurt myself' is correct for reflexive actions.",
          "isTrue": true,
          "explanation": "Correct. For reflexive actions we use reflexive pronouns."
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
      "title": "Match the term to Pronouns",
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
      "title": "Select all good strategies for Pronouns",
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

export function build3PronounsExercises() {
  return buildTheoryExercises('pronouns', config);
}
