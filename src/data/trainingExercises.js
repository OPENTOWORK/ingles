// Base de datos centralizada de ejercicios de training
export const trainingExercises = {
  // A1 Level Exercises
  A1: {
    listening: {
      basico: {
        level1: [
          {
            id: 1,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "Hello, how are you today?",
            question: "Listen carefully. What greeting do you hear?",
            options: ["Hello, how are you?", "Goodbye, see you later", "Thank you very much", "Please help me"],
            correct: "Hello, how are you?",
            explanation: "You heard 'Hello, how are you today?' - a common way to greet someone and ask about their well-being in English.",
            difficulty: 1,
            estimatedTime: 60,
            tags: ["greetings", "basic_phrases"]
          },
          {
            id: 2,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "I have three apples and five oranges.",
            question: "Listen and identify the numbers mentioned:",
            options: ["3 and 5", "2 and 4", "6 and 8", "1 and 7"],
            correct: "3 and 5",
            explanation: "You heard 'three apples and five oranges' - the numbers 3 and 5 are clearly mentioned.",
            difficulty: 1,
            estimatedTime: 45,
            tags: ["numbers", "food"]
          },
          {
            id: 3,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "The sky is blue and the grass is green.",
            question: "What colors are mentioned in the audio?",
            options: ["Blue and green", "Red and yellow", "Black and white", "Purple and orange"],
            correct: "Blue and green",
            explanation: "You heard 'The sky is blue and the grass is green' - blue and green are the colors mentioned.",
            difficulty: 1,
            estimatedTime: 45,
            tags: ["colors", "nature"]
          },
          {
            id: 4,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "This is my mother and that is my father.",
            question: "Listen to the family members mentioned:",
            options: ["Mother and father", "Sister and brother", "Grandmother and grandfather", "Aunt and uncle"],
            correct: "Mother and father",
            explanation: "You heard 'This is my mother and that is my father' - mother and father are the family members mentioned.",
            difficulty: 1,
            estimatedTime: 50,
            tags: ["family", "pronouns"]
          },
          {
            id: 5,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "I like pizza and I don't like vegetables.",
            question: "What food preference is expressed?",
            options: ["Likes pizza, dislikes vegetables", "Likes vegetables, dislikes pizza", "Likes both pizza and vegetables", "Dislikes both pizza and vegetables"],
            correct: "Likes pizza, dislikes vegetables",
            explanation: "You heard 'I like pizza and I don't like vegetables' - the speaker likes pizza but doesn't like vegetables.",
            difficulty: 1,
            estimatedTime: 55,
            tags: ["food", "likes_dislikes"]
          }
        ],
        level2: [
          {
            id: 6,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "It's three o'clock in the afternoon.",
            question: "What time is it?",
            options: ["3:00 PM", "3:00 AM", "2:00 PM", "4:00 PM"],
            correct: "3:00 PM",
            explanation: "You heard 'It's three o'clock in the afternoon' - that's 3:00 PM.",
            difficulty: 1,
            estimatedTime: 50,
            tags: ["time", "numbers"]
          },
          {
            id: 7,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "It's sunny today and very hot.",
            question: "What's the weather like?",
            options: ["Sunny and hot", "Rainy and cold", "Cloudy and warm", "Windy and cool"],
            correct: "Sunny and hot",
            explanation: "You heard 'It's sunny today and very hot' - the weather is sunny and hot.",
            difficulty: 1,
            estimatedTime: 45,
            tags: ["weather", "adjectives"]
          }
        ]
      },
      intermedio: {
        level1: [
          {
            id: 8,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "Go straight ahead and turn left at the traffic light.",
            question: "What directions are given?",
            options: ["Go straight and turn left", "Go straight and turn right", "Turn left immediately", "Stop at the traffic light"],
            correct: "Go straight and turn left",
            explanation: "You heard 'Go straight ahead and turn left at the traffic light' - the directions are to go straight and then turn left.",
            difficulty: 2,
            estimatedTime: 70,
            tags: ["directions", "imperatives"]
          }
        ]
      }
    },
    reading: {
      basico: {
        level1: [
          {
            id: 9,
            type: "multiple_choice",
            text: "Hi! My name is Maria. I am 25 years old. I live in Madrid, Spain. I work as a teacher. I like reading books and watching movies.",
            question: "What is Maria's profession?",
            options: ["Doctor", "Teacher", "Engineer", "Lawyer"],
            correct: "Teacher",
            explanation: "The text clearly states 'I work as a teacher' - Maria's profession is teaching.",
            difficulty: 1,
            estimatedTime: 90,
            tags: ["personal_info", "jobs"]
          },
          {
            id: 10,
            type: "multiple_choice",
            text: "I wake up at 7 AM every day. I have breakfast at 8 AM. I go to work at 9 AM. I have lunch at 1 PM. I come home at 6 PM.",
            question: "What time does the person have lunch?",
            options: ["8 AM", "9 AM", "1 PM", "6 PM"],
            correct: "1 PM",
            explanation: "The text states 'I have lunch at 1 PM' - lunch is at 1 PM.",
            difficulty: 1,
            estimatedTime: 75,
            tags: ["daily_routine", "time"]
          }
        ]
      }
    },
    vocabulary: {
      basico: {
        level1: [
          {
            id: 11,
            type: "multiple_choice",
            word: "cat",
            image: "/images/vocabulary/cat.jpg",
            question: "What is this animal called in English?",
            options: ["Dog", "Cat", "Bird", "Fish"],
            correct: "Cat",
            explanation: "This is a cat - a small domesticated carnivorous mammal with soft fur.",
            difficulty: 1,
            estimatedTime: 30,
            tags: ["animals", "pets"]
          },
          {
            id: 12,
            type: "translation",
            spanish: "casa",
            question: "What is the English translation for 'casa'?",
            options: ["House", "Car", "Book", "Tree"],
            correct: "House",
            explanation: "'Casa' in Spanish means 'house' in English - a building where people live.",
            difficulty: 1,
            estimatedTime: 25,
            tags: ["translation", "home"]
          }
        ]
      }
    },
    use_of_english: {
      basico: {
        level1: [
          {
            id: 13,
            type: "fill_blank",
            text: "I ___ a student.",
            question: "Complete the sentence with the correct verb:",
            options: ["am", "is", "are", "be"],
            correct: "am",
            explanation: "Use 'am' with 'I' in present simple. 'I am a student' is the correct form.",
            difficulty: 1,
            estimatedTime: 45,
            tags: ["verb_to_be", "present_simple"]
          },
          {
            id: 14,
            type: "fill_blank",
            text: "She ___ to school every day.",
            question: "Complete the sentence with the correct verb:",
            options: ["go", "goes", "going", "gone"],
            correct: "goes",
            explanation: "Use 'goes' with 'she' in present simple. 'She goes to school every day' is correct.",
            difficulty: 1,
            estimatedTime: 50,
            tags: ["present_simple", "third_person"]
          }
        ]
      }
    }
  },

  // B1 Level Exercises (more advanced)
  B1: {
    listening: {
      basico: {
        level1: [
          {
            id: 15,
            type: "multiple_choice",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            transcript: "A: Hi Sarah, how was your weekend? B: It was great! I went to the cinema with my friends. We watched a comedy movie. A: That sounds fun! What was it about? B: It was about a group of friends who go on a road trip. It was really funny!",
            question: "What did Sarah do last weekend?",
            options: ["Went to a restaurant", "Went to the cinema", "Went shopping", "Stayed home"],
            correct: "Went to the cinema",
            explanation: "Sarah said 'I went to the cinema with my friends' - she went to the cinema last weekend.",
            difficulty: 3,
            estimatedTime: 120,
            tags: ["conversation", "past_simple", "leisure"]
          }
        ]
      }
    },
    reading: {
      basico: {
        level1: [
          {
            id: 16,
            type: "multiple_choice",
            text: "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of this phenomenon. Immediate action is required to reduce greenhouse gas emissions and transition to renewable energy sources.",
            question: "According to the text, what is the main cause of climate change?",
            options: ["Natural weather cycles", "Human activities", "Solar radiation", "Ocean currents"],
            correct: "Human activities",
            explanation: "The text states 'Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of this phenomenon.'",
            difficulty: 3,
            estimatedTime: 180,
            tags: ["environment", "science", "passive_voice"]
          }
        ]
      }
    }
  }
};

// Helper functions
export const getExercisesByLevel = (level, skill, sublevel, exerciseLevel) => {
  return trainingExercises[level]?.[skill]?.[sublevel]?.[exerciseLevel] || [];
};

export const getExerciseById = (id) => {
  for (const level in trainingExercises) {
    for (const skill in trainingExercises[level]) {
      for (const sublevel in trainingExercises[level][skill]) {
        for (const exerciseLevel in trainingExercises[level][skill][sublevel]) {
          const exercises = trainingExercises[level][skill][sublevel][exerciseLevel];
          const exercise = exercises.find(ex => ex.id === id);
          if (exercise) return exercise;
        }
      }
    }
  }
  return null;
};

export const getRandomExercise = (level, skill, sublevel, exerciseLevel) => {
  const exercises = getExercisesByLevel(level, skill, sublevel, exerciseLevel);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
};

export const getExerciseStats = () => {
  let totalExercises = 0;
  let totalLevels = 0;
  
  for (const level in trainingExercises) {
    for (const skill in trainingExercises[level]) {
      for (const sublevel in trainingExercises[level][skill]) {
        for (const exerciseLevel in trainingExercises[level][skill][sublevel]) {
          totalExercises += trainingExercises[level][skill][sublevel][exerciseLevel].length;
          totalLevels++;
        }
      }
    }
  }
  
  return { totalExercises, totalLevels };
};
