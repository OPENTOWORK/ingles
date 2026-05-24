import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "How long do long conversations typically last?",
      "options": [
        "1–3 minutes",
        "3–8 minutes",
        "30 seconds–2 minutes",
        "More than 10 minutes"
      ],
      "correctAnswer": 1,
      "explanation": "Long conversations usually run 3–8 minutes—longer than short dialogues but often shorter than full lectures."
    },
    {
      "question": "What is the most important strategy for long conversations?",
      "options": [
        "Avoid taking notes",
        "Identify speakers from the beginning",
        "Only listen at the end",
        "Ignore transitions"
      ],
      "correctAnswer": 1,
      "explanation": "Identifying speakers early lets you follow who says what for the whole recording."
    },
    {
      "question": "What does a transition usually signal?",
      "options": [
        "A change of speaker",
        "A change of topic",
        "A silence",
        "A pronunciation error"
      ],
      "correctAnswer": 1,
      "explanation": "A transition usually marks a topic shift—not necessarily a different speaker—and helps you follow structure."
    },
    {
      "question": "What is the most effective note-taking approach for long conversations?",
      "options": [
        "Write down everything",
        "Organize notes by speaker and topic",
        "Take no notes",
        "Write only at the end"
      ],
      "correctAnswer": 1,
      "explanation": "Notes by speaker and topic handle multiple voices and several subjects efficiently."
    },
    {
      "question": "What should you do if you lose the thread in a long conversation?",
      "options": [
        "Stop listening altogether",
        "Use context to get back on track",
        "Worry about what you missed",
        "Switch to a different note system mid-way"
      ],
      "correctAnswer": 1,
      "explanation": "Using context is the best way to recover without losing the rest of the recording."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Long Conversations helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Long Conversations until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Long Conversations ___0___ week.",
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
          "text": "Long conversations require speaker identification.",
          "isTrue": true,
          "explanation": "Correct. You must distinguish speakers to know who contributes what."
        },
        {
          "text": "It is better not to take notes in long conversations to avoid distraction.",
          "isTrue": true,
          "explanation": "Incorrect. Structured notes help you manage the amount and complexity of information."
        },
        {
          "text": "Following transitions helps you stay oriented in the conversation.",
          "isTrue": true,
          "explanation": "Correct. Transitions signal topic shifts and support orientation."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Long conversations are easier than monologues because there are more voices.",
          "isTrue": false,
          "explanation": "Incorrect. They can be harder because you must track several speakers and threads at once."
        },
        {
          "text": "Long conversations typically involve multiple topic changes.",
          "isTrue": true,
          "explanation": "Correct. Longer talks often move through several topics with natural transitions."
        },
        {
          "text": "You should try to understand every single word in long conversations.",
          "isTrue": true,
          "explanation": "Incorrect. Focus on main ideas and task-relevant detail instead of every word."
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
      "title": "Match the term to Long Conversations",
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
      "title": "Select all good strategies for Long Conversations",
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

export function buildLongConversationsExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('long-conversations', config, level, primaryLevel);
}
