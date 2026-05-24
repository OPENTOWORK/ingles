import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which is the correct form?",
      "options": [
        "I have a money",
        "I have some money",
        "I have many money",
        "I have much money"
      ],
      "correctAnswer": 1,
      "explanation": "'Money' is uncountable, so we use 'some' or no quantifier. 'Much' is also correct, but 'some' is more natural in this context."
    },
    {
      "question": "Complete: 'I need ___ book for school.'",
      "options": [
        "the",
        "a",
        "an",
        "some"
      ],
      "correctAnswer": 1,
      "explanation": "'A' is used with singular countable nouns when we talk about something for the first time or in general."
    },
    {
      "question": "Which is the correct form to complete this sentence: '___ students in my class are very intelligent'?",
      "options": [
        "The",
        "A",
        "An",
        "No article needed"
      ],
      "correctAnswer": 3,
      "explanation": "When we talk about students in general (plural), we don't need an article. If we said 'the students in my class', we would be referring to specific students."
    },
    {
      "question": "Which quantifier is correct for 'time'?",
      "options": [
        "many",
        "much",
        "few",
        "little (with 'a')"
      ],
      "correctAnswer": 1,
      "explanation": "'Time' is uncountable, so we use 'much'. We could also use 'a little' to mean 'a small amount of time'."
    },
    {
      "question": "Complete: 'There are ___ students in the classroom.'",
      "options": [
        "a",
        "an",
        "some",
        "much"
      ],
      "correctAnswer": 2,
      "explanation": "'Students' is a plural countable noun, so we use 'some' in affirmative sentences."
    }
  ],
  "fillBlanks": [
    {
      "text": "Good study of Articles, Determiners and Quantifiers helps you ___0___ fewer mistakes in exams.",
      "blanks": [
        {
          "answer": "make"
        }
      ]
    },
    {
      "text": "Practise Articles, Determiners and Quantifiers until the rules feel ___0___ and natural.",
      "blanks": [
        {
          "answer": "clear"
        }
      ]
    },
    {
      "text": "Review your notes on Articles, Determiners and Quantifiers ___0___ week.",
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
          "text": "We use 'a' before words that start with a vowel sound.",
          "isTrue": false,
          "explanation": "We use 'an' before words that start with a vowel sound, not 'a'."
        },
        {
          "text": "'Much' can be used with countable nouns.",
          "isTrue": true,
          "explanation": "'Much' is only used with uncountable nouns. For countables we use 'many'."
        },
        {
          "text": "'The' can be used with both singular and plural nouns.",
          "isTrue": true,
          "explanation": "Correct. 'The' can be used with singular and plural nouns."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "We don't use articles with plural nouns when speaking generally.",
          "isTrue": true,
          "explanation": "Correct. We don't use articles with plural nouns when speaking in a general way."
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
      "title": "Match the term to Articles, Determiners and Quantifiers",
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
      "title": "Select all good strategies for Articles, Determiners and Quantifiers",
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

export function build1ArticlesDeterminersAndQuantifiersExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('articles-determiners-and', config, level, primaryLevel);
}
