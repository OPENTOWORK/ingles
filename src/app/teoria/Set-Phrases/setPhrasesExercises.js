import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the most informal greeting?",
      "options": [
        "Good morning",
        "Hi there!",
        "How do you do?",
        "Good evening"
      ],
      "correctAnswer": 1,
      "explanation": "'Hi there!' is a very informal, friendly greeting, ideal for casual situations."
    },
    {
      "question": "What is the most appropriate response to 'Thanks a lot!'?",
      "options": [
        "You're welcome!",
        "Thank you!",
        "I'm sorry",
        "Excuse me"
      ],
      "correctAnswer": 0,
      "explanation": "'You're welcome!' is the most natural reply to 'Thanks a lot!' when you want to say helping was no trouble."
    },
    {
      "question": "What phrase best expresses soft disagreement?",
      "options": [
        "I completely disagree",
        "I'm not sure I agree",
        "I totally agree",
        "That's amazing!"
      ],
      "correctAnswer": 1,
      "explanation": "'I'm not sure I agree' softens disagreement. The others express strong disagreement, full agreement, or amazement."
    },
    {
      "question": "What phrase best changes the topic in a casual way?",
      "options": [
        "On a different note",
        "By the way",
        "Incidentally",
        "Speaking of which"
      ],
      "correctAnswer": 1,
      "explanation": "'By the way' is the most casual way to shift topic; the others tend to be more formal or tied to the previous subject."
    },
    {
      "question": "Complete: 'I'm sorry, I didn't _____ that.'",
      "options": [
        "listen",
        "catch",
        "hear",
        "understand"
      ],
      "correctAnswer": 1,
      "explanation": "'I didn't catch that' is a common polite way to ask someone to repeat what they said."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Set Phrases helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Set Phrases until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Set Phrases ___0___ week.",
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
          "text": "Set phrases are fixed expressions used as a single unit.",
          "isTrue": true,
          "explanation": "Correct. Set phrases are fixed word combinations with a specific meaning, used as one unit."
        },
        {
          "text": "It is appropriate to use very informal expressions in formal contexts.",
          "isTrue": true,
          "explanation": "Incorrect. Match formality to the context. Very informal expressions are not appropriate in formal settings."
        },
        {
          "text": "Showing genuine interest makes the conversation more pleasant.",
          "isTrue": true,
          "explanation": "Correct. Genuine interest with phrases like 'That's interesting!' or 'Really?' makes conversation nicer for everyone."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "It does not matter how you reply to courtesy phrases.",
          "isTrue": false,
          "explanation": "Incorrect. Responding well to courtesy phrases keeps the flow going and shows respect."
        },
        {
          "text": "Set phrases can be translated literally from Spanish to English.",
          "isTrue": true,
          "explanation": "Incorrect. Set phrases are language-specific and are rarely translated word for word."
        },
        {
          "text": "'How are you?' is a set phrase used for greeting.",
          "isTrue": true,
          "explanation": "Correct. 'How are you?' is a common fixed greeting in English."
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
      "title": "Match the term to Set Phrases",
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
      "title": "Select all good strategies for Set Phrases",
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

export function buildSetPhrasesExercises() {
  return buildTheoryExercises('set-phrases', config);
}
