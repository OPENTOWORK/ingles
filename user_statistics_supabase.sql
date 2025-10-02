-- =====================================================
-- TABLA DE ESTADÍSTICAS Y LOGROS PARA USUARIOS
-- =====================================================
-- Esta tabla captura TODOS los datos de progreso, estadísticas y logros
-- para cada usuario en el sistema de práctica de inglés

-- Tabla principal de estadísticas de usuario
CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ===== DATOS DE IDENTIFICACIÓN =====
  activity_type VARCHAR(50) NOT NULL, -- 'exam', 'part', 'exercise', 'training'
  level VARCHAR(2) NOT NULL, -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  skill VARCHAR(50), -- 'listening', 'reading-and-use-of-english', 'speaking', 'writing'
  section VARCHAR(50), -- 'exam-1', 'exam-listening', 'part-1', etc.
  exercise_id VARCHAR(100), -- ID específico del ejercicio
  
  -- ===== DATOS DE RENDIMIENTO =====
  score INTEGER DEFAULT 0, -- Puntuación obtenida (0-100)
  max_score INTEGER DEFAULT 100, -- Puntuación máxima posible
  time_spent INTEGER DEFAULT 0, -- Tiempo en segundos
  attempts INTEGER DEFAULT 1, -- Número de intentos
  
  -- ===== DATOS DE PROGRESO =====
  completed BOOLEAN DEFAULT FALSE, -- Si completó la actividad
  passed BOOLEAN DEFAULT FALSE, -- Si pasó (score >= 70%)
  mastery_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert'
  
  -- ===== DATOS DE CONTEXTO =====
  difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  exercise_type VARCHAR(50), -- 'multiple_choice', 'fill_blank', 'writing', etc.
  topic_tags JSONB, -- Tags del tema ['greetings', 'family', 'numbers']
  
  -- ===== DATOS DE ANÁLISIS =====
  weak_areas JSONB, -- Áreas débiles identificadas
  strong_areas JSONB, -- Áreas fuertes identificadas
  improvement_suggestions JSONB, -- Sugerencias de mejora
  
  -- ===== DATOS DE LOGROS =====
  achievements_earned JSONB, -- Logros obtenidos en esta sesión
  streak_count INTEGER DEFAULT 0, -- Racha actual
  total_streak INTEGER DEFAULT 0, -- Racha máxima
  
  -- ===== METADATOS =====
  session_id VARCHAR(100), -- ID de la sesión de estudio
  device_info JSONB, -- Información del dispositivo
  browser_info JSONB, -- Información del navegador
  
  -- ===== TIMESTAMPS =====
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ===== ÍNDICES ÚNICOS =====
  UNIQUE(user_id, activity_type, level, skill, section, exercise_id)
);

-- =====================================================
-- TABLA DE RESUMEN DE ESTADÍSTICAS POR NIVEL
-- =====================================================
CREATE TABLE IF NOT EXISTS user_level_summary (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level VARCHAR(2) NOT NULL,
  
  -- ===== ESTADÍSTICAS GENERALES =====
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  
  -- ===== ESTADÍSTICAS POR HABILIDAD =====
  listening_stats JSONB DEFAULT '{}',
  reading_stats JSONB DEFAULT '{}',
  speaking_stats JSONB DEFAULT '{}',
  writing_stats JSONB DEFAULT '{}',
  
  -- ===== PROGRESO Y MAESTRÍA =====
  overall_mastery_level VARCHAR(20) DEFAULT 'beginner',
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- ===== FECHAS =====
  first_activity TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  level_completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, level)
);

-- =====================================================
-- TABLA DE LOGROS ESPECÍFICOS DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_achievements (
  id SERIAL PRIMARY KEY,
  achievement_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  points INTEGER DEFAULT 0,
  category VARCHAR(50), -- 'exam', 'training', 'streak', 'mastery'
  requirements JSONB, -- Requisitos para obtener el logro
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE LOGROS DE USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements_detailed (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(100) REFERENCES system_achievements(achievement_key),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_data JSONB, -- Datos del contexto cuando se obtuvo
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_key)
);

-- =====================================================
-- INSERTAR LOGROS DEL SISTEMA
-- =====================================================
INSERT INTO system_achievements (achievement_key, title, description, icon, points, category, requirements) VALUES
-- Logros de Exámenes
('exam_first_complete', 'First Exam Complete', 'Completed your first Cambridge exam!', '🎯', 50, 'exam', '{"type": "exam_completion", "count": 1}'),
('exam_perfect_score', 'Perfect Exam Score', 'Got 100% on a Cambridge exam!', '🏆', 100, 'exam', '{"type": "perfect_score", "score": 100}'),
('exam_all_levels', 'All Levels Master', 'Completed exams in all 6 levels!', '👑', 500, 'exam', '{"type": "all_levels", "levels": ["A1","A2","B1","B2","C1","C2"]}'),

-- Logros de Partes
('part_master', 'Part Master', 'Completed all parts in a skill!', '🎓', 75, 'exam', '{"type": "all_parts", "skill": "any"}'),
('part_perfect_series', 'Perfect Series', 'Got perfect scores on 5 consecutive parts!', '⭐', 150, 'exam', '{"type": "perfect_series", "count": 5}'),

-- Logros de Training
('training_beginner', 'Training Beginner', 'Completed 10 training exercises!', '🌱', 25, 'training', '{"type": "training_count", "count": 10}'),
('training_expert', 'Training Expert', 'Completed 100 training exercises!', '🔥', 200, 'training', '{"type": "training_count", "count": 100}'),
('training_speed_demon', 'Speed Demon', 'Completed an exercise in under 30 seconds!', '⚡', 30, 'training', '{"type": "speed", "time": 30}'),

-- Logros de Racha
('streak_3', 'Three Day Streak', 'Completed activities for 3 days in a row!', '🔥', 50, 'streak', '{"type": "streak", "days": 3}'),
('streak_7', 'Week Warrior', 'Completed activities for 7 days in a row!', '💪', 100, 'streak', '{"type": "streak", "days": 7}'),
('streak_30', 'Month Master', 'Completed activities for 30 days in a row!', '💎', 500, 'streak', '{"type": "streak", "days": 30}'),

-- Logros de Maestría
('mastery_intermediate', 'Intermediate Master', 'Achieved intermediate level in any skill!', '🥉', 75, 'mastery', '{"type": "mastery_level", "level": "intermediate"}'),
('mastery_advanced', 'Advanced Master', 'Achieved advanced level in any skill!', '🥈', 150, 'mastery', '{"type": "mastery_level", "level": "advanced"}'),
('mastery_expert', 'Expert Master', 'Achieved expert level in any skill!', '🥇', 300, 'mastery', '{"type": "mastery_level", "level": "expert"}'),

-- Logros de Tiempo
('early_bird', 'Early Bird', 'Completed activities before 8 AM!', '🌅', 25, 'time', '{"type": "time_of_day", "hour": "<8"}'),
('night_owl', 'Night Owl', 'Completed activities after 10 PM!', '🦉', 25, 'time', '{"type": "time_of_day", "hour": ">22"}'),

-- Logros de Persistencia
('persistent_learner', 'Persistent Learner', 'Attempted the same exercise 5 times!', '🔄', 40, 'persistence', '{"type": "attempts", "count": 5}'),
('dedicated_student', 'Dedicated Student', 'Spent over 10 hours studying!', '📚', 100, 'persistence', '{"type": "total_time", "hours": 10}')

ON CONFLICT (achievement_key) DO NOTHING;

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_level ON user_statistics(level);
CREATE INDEX IF NOT EXISTS idx_user_statistics_skill ON user_statistics(skill);
CREATE INDEX IF NOT EXISTS idx_user_statistics_activity_type ON user_statistics(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_statistics_completed_at ON user_statistics(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_statistics_score ON user_statistics(score);

CREATE INDEX IF NOT EXISTS idx_user_level_summary_user_id ON user_level_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_level_summary_level ON user_level_summary(level);

CREATE INDEX IF NOT EXISTS idx_user_achievements_detailed_user_id ON user_achievements_detailed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_detailed_earned_at ON user_achievements_detailed(earned_at);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para user_statistics
CREATE POLICY "Users can view their own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_level_summary
CREATE POLICY "Users can view their own level summary" ON user_level_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level summary" ON user_level_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own level summary" ON user_level_summary
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_achievements_detailed
CREATE POLICY "Users can view their own achievements" ON user_achievements_detailed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements_detailed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para system_achievements (lectura para todos)
CREATE POLICY "System achievements are viewable by all authenticated users" ON system_achievements
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para timestamps automáticos
CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_level_summary_updated_at BEFORE UPDATE ON user_level_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar resumen de nivel automáticamente
CREATE OR REPLACE FUNCTION update_user_level_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar o actualizar el resumen del nivel
    INSERT INTO user_level_summary (
        user_id, 
        level, 
        total_activities, 
        completed_activities, 
        total_score, 
        average_score, 
        total_time_spent,
        last_activity
    )
    SELECT 
        NEW.user_id,
        NEW.level,
        COUNT(*),
        COUNT(*) FILTER (WHERE completed = TRUE),
        SUM(score),
        AVG(score),
        SUM(time_spent),
        MAX(completed_at)
    FROM user_statistics 
    WHERE user_id = NEW.user_id AND level = NEW.level
    ON CONFLICT (user_id, level) DO UPDATE SET
        total_activities = EXCLUDED.total_activities,
        completed_activities = EXCLUDED.completed_activities,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        total_time_spent = EXCLUDED.total_time_spent,
        last_activity = EXCLUDED.last_activity,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar resumen automáticamente
CREATE TRIGGER update_user_level_summary_trigger 
    AFTER INSERT OR UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_user_level_summary();

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE user_statistics IS 'Registra todas las actividades, ejercicios, exámenes y partes completadas por cada usuario';
COMMENT ON TABLE user_level_summary IS 'Resumen estadístico por nivel para cada usuario';
COMMENT ON TABLE system_achievements IS 'Catálogo de logros disponibles en el sistema';
COMMENT ON TABLE user_achievements_detailed IS 'Logros obtenidos por cada usuario';

COMMENT ON COLUMN user_statistics.activity_type IS 'Tipo de actividad: exam, part, exercise, training';
COMMENT ON COLUMN user_statistics.level IS 'Nivel de Cambridge: A1, A2, B1, B2, C1, C2';
COMMENT ON COLUMN user_statistics.skill IS 'Habilidad: listening, reading-and-use-of-english, speaking, writing';
COMMENT ON COLUMN user_statistics.section IS 'Sección específica: exam-1, part-1, etc.';
COMMENT ON COLUMN user_statistics.mastery_level IS 'Nivel de maestría: beginner, intermediate, advanced, expert';




