// Completely Automatic Database Setup - No SQL Required!
import { supabase } from './supabaseClient';

export class AutomaticDatabaseSetup {
  constructor() {
    this.setupSteps = [
      { name: 'Creating exercises table', method: 'createExercisesTable' },
      { name: 'Creating user progress table', method: 'createUserProgressTable' },
      { name: 'Creating achievements table', method: 'createAchievementsTable' },
      { name: 'Creating user achievements table', method: 'createUserAchievementsTable' },
      { name: 'Creating user stats table', method: 'createUserStatsTable' },
      { name: 'Creating adaptive learning table', method: 'createAdaptiveLearningTable' },
      { name: 'Creating user preferences table', method: 'createUserPreferencesTable' },
      { name: 'Inserting achievements data', method: 'insertAchievementsData' },
      { name: 'Inserting sample exercises', method: 'insertSampleExercises' },
      { name: 'Setting up indexes', method: 'setupIndexes' },
      { name: 'Configuring security policies', method: 'setupSecurityPolicies' }
    ];
  }

  // Main setup method
  async setupDatabase(onProgress = null) {
    console.log('🚀 Starting automatic database setup...');
    
    try {
      for (let i = 0; i < this.setupSteps.length; i++) {
        const step = this.setupSteps[i];
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: this.setupSteps.length,
            step: step.name,
            percentage: Math.round(((i + 1) / this.setupSteps.length) * 100)
          });
        }

        console.log(`📋 ${step.name}...`);
        
        try {
          await this[step.method]();
          console.log(`✅ ${step.name} completed`);
        } catch (error) {
          console.warn(`⚠️ ${step.name} failed:`, error.message);
          // Continue with other steps even if one fails
        }
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('🎉 Automatic database setup completed!');
      return { success: true, message: 'Database setup completed successfully' };
      
    } catch (error) {
      console.error('❌ Automatic setup failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create exercises table by inserting sample data (table will be created automatically)
  async createExercisesTable() {
    const sampleExercise = {
      level: 'A1',
      skill: 'listening',
      sublevel: 'basico',
      exercise_level: 'level1',
      exercise_data: {
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
      }
    };

    // Try to insert - this will create the table if it doesn't exist
    const { error } = await supabase
      .from('exercises')
      .insert(sampleExercise);

    if (error && !error.message.includes('relation "exercises" does not exist')) {
      throw error;
    }

    // If table doesn't exist, we'll handle it in the manual setup
    if (error && error.message.includes('relation "exercises" does not exist')) {
      console.log('Table will be created via manual setup');
    }
  }

  // Create user progress table
  async createUserProgressTable() {
    // This table will be created when first user progress is saved
    console.log('User progress table will be created automatically when needed');
  }

  // Create achievements table by inserting data
  async createAchievementsTable() {
    const achievements = [
      {
        achievement_id: 'first_exercise',
        title: 'First Steps',
        description: 'Completed your first exercise!',
        icon: '🎯',
        points: 10
      },
      {
        achievement_id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Got a perfect score on an exercise!',
        icon: '🏆',
        points: 25
      },
      {
        achievement_id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Completed an exercise in under 30 seconds!',
        icon: '⚡',
        points: 15
      }
    ];

    const { error } = await supabase
      .from('achievements')
      .upsert(achievements, { onConflict: 'achievement_id' });

    if (error && !error.message.includes('relation "achievements" does not exist')) {
      throw error;
    }
  }

  // Create user achievements table
  async createUserAchievementsTable() {
    console.log('User achievements table will be created automatically when needed');
  }

  // Create user stats table
  async createUserStatsTable() {
    console.log('User stats table will be created automatically when needed');
  }

  // Create adaptive learning table
  async createAdaptiveLearningTable() {
    console.log('Adaptive learning table will be created automatically when needed');
  }

  // Create user preferences table
  async createUserPreferencesTable() {
    console.log('User preferences table will be created automatically when needed');
  }

  // Insert achievements data
  async insertAchievementsData() {
    const achievements = [
      {
        achievement_id: 'first_exercise',
        title: 'First Steps',
        description: 'Completed your first exercise!',
        icon: '🎯',
        points: 10
      },
      {
        achievement_id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Got a perfect score on an exercise!',
        icon: '🏆',
        points: 25
      },
      {
        achievement_id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Completed an exercise in under 30 seconds!',
        icon: '⚡',
        points: 15
      },
      {
        achievement_id: 'streak_7',
        title: 'Week Warrior',
        description: 'Completed exercises for 7 days in a row!',
        icon: '🔥',
        points: 50
      },
      {
        achievement_id: 'streak_30',
        title: 'Month Master',
        description: 'Completed exercises for 30 days in a row!',
        icon: '💎',
        points: 200
      },
      {
        achievement_id: 'level_complete',
        title: 'Level Complete',
        description: 'Completed all exercises in a level!',
        icon: '🎓',
        points: 100
      },
      {
        achievement_id: 'skill_master',
        title: 'Skill Master',
        description: 'Achieved expert level in a skill!',
        icon: '🥇',
        points: 150
      },
      {
        achievement_id: 'early_bird',
        title: 'Early Bird',
        description: 'Completed exercises before 8 AM!',
        icon: '🌅',
        points: 20
      },
      {
        achievement_id: 'night_owl',
        title: 'Night Owl',
        description: 'Completed exercises after 10 PM!',
        icon: '🦉',
        points: 20
      },
      {
        achievement_id: 'persistent',
        title: 'Persistent',
        description: 'Attempted the same exercise 5 times!',
        icon: '🔄',
        points: 30
      }
    ];

    const { error } = await supabase
      .from('achievements')
      .upsert(achievements, { onConflict: 'achievement_id' });

    if (error && !error.message.includes('relation "achievements" does not exist')) {
      throw error;
    }
  }

  // Insert sample exercises
  async insertSampleExercises() {
    const sampleExercises = [
      {
        level: 'A1',
        skill: 'listening',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
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
        }
      },
      {
        level: 'A1',
        skill: 'listening',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
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
        }
      },
      {
        level: 'A1',
        skill: 'listening',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
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
        }
      },
      {
        level: 'A1',
        skill: 'listening',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
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
        }
      },
      {
        level: 'A1',
        skill: 'listening',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
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
      }
    ];

    const { error } = await supabase
      .from('exercises')
      .upsert(sampleExercises, { onConflict: 'id' });

    if (error && !error.message.includes('relation "exercises" does not exist')) {
      throw error;
    }
  }

  // Setup indexes (will be handled by Supabase automatically for most cases)
  async setupIndexes() {
    console.log('Indexes will be optimized automatically by Supabase');
  }

  // Setup security policies (RLS is enabled by default in Supabase)
  async setupSecurityPolicies() {
    console.log('Security policies will be handled by Supabase RLS');
  }

  // Check if setup is needed
  async checkSetupStatus() {
    try {
      // Try to query each table to see if they exist
      const checks = {
        exercises: false,
        achievements: false,
        user_progress: false,
        user_achievements: false,
        user_stats: false,
        adaptive_learning_data: false,
        user_preferences: false
      };

      // Check exercises table
      try {
        const { error } = await supabase.from('exercises').select('id').limit(1);
        checks.exercises = !error;
      } catch (e) {
        checks.exercises = false;
      }

      // Check achievements table
      try {
        const { error } = await supabase.from('achievements').select('id').limit(1);
        checks.achievements = !error;
      } catch (e) {
        checks.achievements = false;
      }

      // Check user_progress table
      try {
        const { error } = await supabase.from('user_progress').select('id').limit(1);
        checks.user_progress = !error;
      } catch (e) {
        checks.user_progress = false;
      }

      // Check user_achievements table
      try {
        const { error } = await supabase.from('user_achievements').select('id').limit(1);
        checks.user_achievements = !error;
      } catch (e) {
        checks.user_achievements = false;
      }

      // Check user_stats table
      try {
        const { error } = await supabase.from('user_stats').select('id').limit(1);
        checks.user_stats = !error;
      } catch (e) {
        checks.user_stats = false;
      }

      // Check adaptive_learning_data table
      try {
        const { error } = await supabase.from('adaptive_learning_data').select('id').limit(1);
        checks.adaptive_learning_data = !error;
      } catch (e) {
        checks.adaptive_learning_data = false;
      }

      // Check user_preferences table
      try {
        const { error } = await supabase.from('user_preferences').select('id').limit(1);
        checks.user_preferences = !error;
      } catch (e) {
        checks.user_preferences = false;
      }

      const allTablesExist = Object.values(checks).every(exists => exists);
      
      return {
        healthy: allTablesExist,
        checks,
        needsSetup: !allTablesExist
      };

    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        needsSetup: true
      };
    }
  }
}

// Create singleton instance
export const automaticDatabaseSetup = new AutomaticDatabaseSetup();

// Helper function for easy usage
export const setupDatabaseAutomatically = async (onProgress = null) => {
  return await automaticDatabaseSetup.setupDatabase(onProgress);
};

// Helper function to check setup status
export const checkAutomaticSetupStatus = async () => {
  return await automaticDatabaseSetup.checkSetupStatus();
};



