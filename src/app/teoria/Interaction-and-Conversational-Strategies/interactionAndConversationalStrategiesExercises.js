import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What do interaction strategies help you do?",
      "options": [
        "Avoid conversations",
        "Take part effectively",
        "Speak faster",
        "Interrupt constantly"
      ],
      "correctAnswer": 1,
      "explanation": "Interaction strategies help you take part effectively in conversations while keeping the flow natural and productive."
    },
    {
      "question": "What is the main benefit of interaction strategies?",
      "options": [
        "Improve pronunciation",
        "Take part effectively in conversations",
        "Increase speaking speed",
        "Reduce the vocabulary you need"
      ],
      "correctAnswer": 1,
      "explanation": "The main benefit is taking part effectively in conversations, because these strategies help you manage turns, show interest, and sustain successful interactions."
    },
    {
      "question": "What is the best approach to an inappropriate interruption?",
      "options": [
        "Interrupt back",
        "Hold your turn politely",
        "Ignore the interruption",
        "End the conversation"
      ],
      "correctAnswer": 1,
      "explanation": "Holding your turn politely is usually best: you can finish your point while staying courteous."
    },
    {
      "question": "Which strategy is most effective for showing interest in a conversation?",
      "options": [
        "Talking more than the other person",
        "Asking relevant follow-up questions",
        "Changing the topic often",
        "Interrupting with your own stories"
      ],
      "correctAnswer": 1,
      "explanation": "Relevant follow-up questions show you are listening and want to explore the topic further."
    },
    {
      "question": "Complete: 'I see what you mean, _____ I think there's another perspective.'",
      "options": [
        "and",
        "but",
        "so",
        "because"
      ],
      "correctAnswer": 1,
      "explanation": "'But' politely introduces a different angle after acknowledging the other person's view."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Interaction and Conversational Strategies, first ___0___ what you need to find.",
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
          "text": "Showing genuine interest is important for successful conversations.",
          "isTrue": true,
          "explanation": "Correct. Genuine interest—through backchannels, follow-up questions, and supportive comments—keeps the conversation lively and engaging."
        },
        {
          "text": "It is better to interrupt constantly to control the conversation.",
          "isTrue": true,
          "explanation": "Incorrect. Constant interruption backfires. It is better to manage turns in a balanced, respectful way."
        },
        {
          "text": "Smooth transitions are better than abrupt topic changes.",
          "isTrue": true,
          "explanation": "Correct. Smooth transitions preserve coherence and flow; abrupt shifts can confuse people."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Conflict should always be avoided in conversation.",
          "isTrue": false,
          "explanation": "Incorrect. Disagreement is normal and can be handled constructively. What matters is addressing it with respect and working toward solutions."
        },
        {
          "text": "Active listening involves only hearing the words someone says.",
          "isTrue": true,
          "explanation": "Incorrect. Active listening includes understanding the message and emotions and responding appropriately."
        },
        {
          "text": "Turn-taking is important for smooth conversations.",
          "isTrue": true,
          "explanation": "Correct. Turn-taking lets everyone contribute and keeps the conversation flowing naturally."
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
      "title": "Select all effective Interaction and Conversational Strategies techniques",
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

export function buildInteractionAndConversationalStrategiesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('interaction-and-conversa', config, level, primaryLevel);
}
