-- Database setup for English Practice Training System
-- Run this in your Supabase SQL editor

-- 1. Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  level VARCHAR(2) NOT NULL,
  skill VARCHAR(50) NOT NULL,
  sublevel VARCHAR(50) NOT NULL,
  exercise_level VARCHAR(50) NOT NULL,
  exercise_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
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
);

-- 3. Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  achievement_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
  metadata JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 5. Create user_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS user_stats (
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
);

-- 6. Insert default achievements
INSERT INTO achievements (achievement_id, title, description, icon, points) VALUES
('first_exercise', 'First Steps', 'Completed your first exercise!', '🎯', 10),
('perfect_score', 'Perfect Score', 'Got a perfect score on an exercise!', '🏆', 25),
('speed_demon', 'Speed Demon', 'Completed an exercise in under 30 seconds!', '⚡', 15),
('streak_7', 'Week Warrior', 'Completed exercises for 7 days in a row!', '🔥', 50),
('streak_30', 'Month Master', 'Completed exercises for 30 days in a row!', '💎', 200),
('level_complete', 'Level Complete', 'Completed all exercises in a level!', '🎓', 100),
('skill_master', 'Skill Master', 'Achieved expert level in a skill!', '🥇', 150),
('early_bird', 'Early Bird', 'Completed exercises before 8 AM!', '🌅', 20),
('night_owl', 'Night Owl', 'Completed exercises after 10 PM!', '🦉', 20),
('persistent', 'Persistent', 'Attempted the same exercise 5 times!', '🔄', 30)
ON CONFLICT (achievement_id) DO NOTHING;

-- 7. Insert sample exercises data
INSERT INTO exercises (level, skill, sublevel, exercise_level, exercise_data) VALUES
('A1', 'listening', 'basico', 'level1', '{"id": 1, "type": "multiple_choice", "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", "transcript": "Hello, how are you today?", "question": "Listen carefully. What greeting do you hear?", "options": ["Hello, how are you?", "Goodbye, see you later", "Thank you very much", "Please help me"], "correct": "Hello, how are you?", "explanation": "You heard ''Hello, how are you today?'' - a common way to greet someone and ask about their well-being in English.", "difficulty": 1, "estimatedTime": 60, "tags": ["greetings", "basic_phrases"]}'),
('A1', 'listening', 'basico', 'level1', '{"id": 2, "type": "multiple_choice", "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", "transcript": "I have three apples and five oranges.", "question": "Listen and identify the numbers mentioned:", "options": ["3 and 5", "2 and 4", "6 and 8", "1 and 7"], "correct": "3 and 5", "explanation": "You heard ''three apples and five oranges'' - the numbers 3 and 5 are clearly mentioned.", "difficulty": 1, "estimatedTime": 45, "tags": ["numbers", "food"]}'),
('A1', 'listening', 'basico', 'level1', '{"id": 3, "type": "multiple_choice", "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", "transcript": "The sky is blue and the grass is green.", "question": "What colors are mentioned in the audio?", "options": ["Blue and green", "Red and yellow", "Black and white", "Purple and orange"], "correct": "Blue and green", "explanation": "You heard ''The sky is blue and the grass is green'' - blue and green are the colors mentioned.", "difficulty": 1, "estimatedTime": 45, "tags": ["colors", "nature"]}'),
('A1', 'listening', 'basico', 'level1', '{"id": 4, "type": "multiple_choice", "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", "transcript": "This is my mother and that is my father.", "question": "Listen to the family members mentioned:", "options": ["Mother and father", "Sister and brother", "Grandmother and grandfather", "Aunt and uncle"], "correct": "Mother and father", "explanation": "You heard ''This is my mother and that is my father'' - mother and father are the family members mentioned.", "difficulty": 1, "estimatedTime": 50, "tags": ["family", "pronouns"]}'),
('A1', 'listening', 'basico', 'level1', '{"id": 5, "type": "multiple_choice", "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", "transcript": "I like pizza and I don''t like vegetables.", "question": "What food preference is expressed?", "options": ["Likes pizza, dislikes vegetables", "Likes vegetables, dislikes pizza", "Likes both pizza and vegetables", "Dislikes both pizza and vegetables"], "correct": "Likes pizza, dislikes vegetables", "explanation": "You heard ''I like pizza and I don''t like vegetables'' - the speaker likes pizza but doesn''t like vegetables.", "difficulty": 1, "estimatedTime": 55, "tags": ["food", "likes_dislikes"]}')
ON CONFLICT DO NOTHING;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_exercise_id ON user_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_exercises_level_skill ON exercises(level, skill);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- 9. Create RLS (Row Level Security) policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies for exercises (read-only for all authenticated users)
CREATE POLICY "Exercises are viewable by all authenticated users" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for user_progress (users can only access their own progress)
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_achievements (users can only access their own achievements)
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_stats (users can only access their own stats)
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create function to update user stats when progress is saved
CREATE OR REPLACE FUNCTION update_user_stats()
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
$$ language 'plpgsql';

-- Create trigger to automatically update user stats
CREATE TRIGGER update_user_stats_trigger AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();






















