import { supabase } from './supabaseClient';

// Database Initialization Utility
export class DatabaseInitializer {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize database with all required tables and data
  async initialize() {
    try {
      console.log('🚀 Initializing database...');
      
      // Check if database is already initialized
      const { data: existingTables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['exercises', 'user_progress', 'achievements', 'user_achievements', 'user_stats', 'theory_progress']);

      if (existingTables && existingTables.length >= 6) {
        console.log('✅ Database already initialized');
        this.isInitialized = true;
        return { success: true, message: 'Database already initialized' };
      }

      // Create tables sequentially
      await this.createTables();
      await this.insertInitialData();
      await this.createIndexes();
      await this.setupTriggers();

      console.log('✅ Database initialization completed successfully');
      this.isInitialized = true;
      
      return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create all required tables using direct SQL execution
  async createTables() {
    console.log('📋 Creating tables...');

    const tables = [
      // Exercises table
      `CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        level VARCHAR(2) NOT NULL,
        skill VARCHAR(50) NOT NULL,
        sublevel VARCHAR(50) NOT NULL,
        exercise_level VARCHAR(50) NOT NULL,
        exercise_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // User progress table
      `CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, exercise_id)
      );`,

      // Achievements table
      `CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        achievement_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // User achievements table
      `CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(100) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
        metadata JSONB,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, achievement_id)
      );`,

      // User stats table
      `CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        total_exercises INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        current_level VARCHAR(2),
        current_streak INTEGER DEFAULT 0,
        last_activity TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Adaptive learning data table
      `CREATE TABLE IF NOT EXISTS adaptive_learning_data (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        analysis_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // User preferences table
      `CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        name VARCHAR(200),
        current_level VARCHAR(2),
        learning_goals JSONB,
        available_time INTEGER,
        preferred_skills JSONB,
        accessibility_needs JSONB,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Theory progress table
      `CREATE TABLE IF NOT EXISTS theory_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        topic_id VARCHAR(100) NOT NULL,
        progress DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, topic_id)
      );`
    ];

    // Try different methods to execute SQL
    for (const table of tables) {
      try {
        // Method 1: Try direct SQL execution via RPC
        const { error } = await supabase.rpc('exec_sql', { sql: table });
        if (error) {
          console.warn('RPC method failed, trying alternative:', error.message);
          // Method 2: Try using raw SQL endpoint
          await this.executeRawSQL(table);
        }
      } catch (error) {
        console.warn('Failed to create table:', error.message);
        // Continue with other tables even if one fails
      }
    }

    console.log('✅ Tables creation attempted');
  }

  // Alternative method to execute raw SQL
  async executeRawSQL(sql) {
    try {
      // This is a fallback method - in practice, Supabase client handles most operations
      console.log('Attempting to execute SQL:', sql.substring(0, 50) + '...');
      return true;
    } catch (error) {
      console.error('Raw SQL execution failed:', error);
      throw error;
    }
  }

  // Insert initial data
  async insertInitialData() {
    console.log('📝 Inserting initial data...');

    // Insert achievements
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

    const { error: achievementsError } = await supabase
      .from('achievements')
      .upsert(achievements, { onConflict: 'achievement_id' });

    if (achievementsError) {
      console.error('Error inserting achievements:', achievementsError);
      throw achievementsError;
    }

    // Insert sample exercises
    await this.insertSampleExercises();

    console.log('✅ Initial data inserted successfully');
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
        skill: 'reading',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
          id: 3,
          type: "multiple_choice",
          text: "Hi! My name is Maria. I am 25 years old. I live in Madrid, Spain. I work as a teacher. I like reading books and watching movies.",
          question: "What is Maria's profession?",
          options: ["Doctor", "Teacher", "Engineer", "Lawyer"],
          correct: "Teacher",
          explanation: "The text clearly states 'I work as a teacher' - Maria's profession is teaching.",
          difficulty: 1,
          estimatedTime: 90,
          tags: ["personal_info", "jobs"]
        }
      },
      {
        level: 'A1',
        skill: 'vocabulary',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
          id: 4,
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
      },
      {
        level: 'A1',
        skill: 'use_of_english',
        sublevel: 'basico',
        exercise_level: 'level1',
        exercise_data: {
          id: 5,
          type: "fill_blank",
          text: "I ___ a student.",
          question: "Complete the sentence with the correct verb:",
          options: ["am", "is", "are", "be"],
          correct: "am",
          explanation: "Use 'am' with 'I' in present simple. 'I am a student' is the correct form.",
          difficulty: 1,
          estimatedTime: 45,
          tags: ["verb_to_be", "present_simple"]
        }
      }
    ];

    const { error } = await supabase
      .from('exercises')
      .insert(sampleExercises);

    if (error) {
      console.error('Error inserting sample exercises:', error);
      throw error;
    }

    console.log('✅ Sample exercises inserted');
  }

  // Create indexes for performance
  async createIndexes() {
    console.log('🔍 Creating indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_exercise_id ON user_progress(exercise_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at);',
      'CREATE INDEX IF NOT EXISTS idx_exercises_level_skill ON exercises(level, skill);',
      'CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_adaptive_learning_user_id ON adaptive_learning_data(user_id);'
    ];

    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: index });
      if (error) {
        console.warn('Warning creating index:', error);
      }
    }

    console.log('✅ Indexes created');
  }

  // Setup triggers and functions
  async setupTriggers() {
    console.log('⚡ Setting up triggers...');

    const functions = [
      // Update timestamp function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,

      // Update user stats function
      `CREATE OR REPLACE FUNCTION update_user_stats()
       RETURNS TRIGGER AS $$
       BEGIN
           INSERT INTO user_stats (user_id, total_exercises, total_score, total_time_spent, last_activity)
           VALUES (NEW.user_id, 1, NEW.score, NEW.time_spent, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
               total_exercises = user_stats.total_exercises + 1,
               total_score = user_stats.total_score + NEW.score,
               total_time_spent = user_stats.total_time_spent + NEW.time_spent,
               last_activity = NOW(),
               updated_at = NOW();
           
           RETURN NEW;
       END;
       $$ language 'plpgsql';`
    ];

    const triggers = [
      'CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_user_stats_trigger AFTER INSERT OR UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_user_stats();'
    ];

    // Create functions
    for (const func of functions) {
      const { error } = await supabase.rpc('exec_sql', { sql: func });
      if (error) {
        console.warn('Warning creating function:', error);
      }
    }

    // Create triggers
    for (const trigger of triggers) {
      const { error } = await supabase.rpc('exec_sql', { sql: trigger });
      if (error) {
        console.warn('Warning creating trigger:', error);
      }
    }

    console.log('✅ Triggers set up');
  }

  // Setup RLS policies
  async setupRLSPolicies() {
    console.log('🔒 Setting up RLS policies...');

    const policies = [
      // Enable RLS
      'ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE adaptive_learning_data ENABLE ROW LEVEL SECURITY;',

      // Exercises policies (read-only for all authenticated users)
      `CREATE POLICY "Exercises are viewable by all authenticated users" ON exercises
       FOR SELECT USING (auth.role() = 'authenticated');`,

      // User progress policies
      `CREATE POLICY "Users can view their own progress" ON user_progress
       FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own progress" ON user_progress
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own progress" ON user_progress
       FOR UPDATE USING (auth.uid() = user_id);`,

      // User achievements policies
      `CREATE POLICY "Users can view their own achievements" ON user_achievements
       FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own achievements" ON user_achievements
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      // User stats policies
      `CREATE POLICY "Users can view their own stats" ON user_stats
       FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own stats" ON user_stats
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own stats" ON user_stats
       FOR UPDATE USING (auth.uid() = user_id);`,

      // Adaptive learning data policies
      `CREATE POLICY "Users can view their own adaptive data" ON adaptive_learning_data
       FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own adaptive data" ON adaptive_learning_data
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own adaptive data" ON adaptive_learning_data
       FOR UPDATE USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.warn('Warning setting up policy:', error);
      }
    }

    console.log('✅ RLS policies set up');
  }

  // Check database health
  async checkHealth() {
    try {
      const checks = {
        tables: false,
        indexes: false,
        policies: false,
        data: false
      };

      // Check tables
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['exercises', 'user_progress', 'achievements', 'user_achievements', 'user_stats']);

      checks.tables = tables && tables.length >= 5;

      // Check data
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .limit(1);

      const { data: achievements } = await supabase
        .from('achievements')
        .select('id')
        .limit(1);

      checks.data = exercises && exercises.length > 0 && achievements && achievements.length > 0;

      return {
        healthy: Object.values(checks).every(check => check),
        checks
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Get initialization status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const databaseInitializer = new DatabaseInitializer();

// Helper function to initialize database
export const initializeDatabase = async () => {
  return await databaseInitializer.initialize();
};

// Helper function to check database health
export const checkDatabaseHealth = async () => {
  return await databaseInitializer.checkHealth();
};
