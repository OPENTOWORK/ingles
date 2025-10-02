-- =====================================================
-- TABLA DE PERFIL DE USUARIO - DATOS COMPLETOS
-- =====================================================
-- Esta tabla captura TODOS los datos del perfil del usuario
-- y los integra con las estadísticas principales

-- Tabla principal de perfil de usuario
CREATE TABLE IF NOT EXISTS user_profile (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- ===== DATOS PERSONALES =====
  full_name VARCHAR(255),
  birth_date DATE,
  profile_picture_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  native_language VARCHAR(50),
  learning_goals TEXT,
  
  -- ===== CONFIGURACIÓN DE ESTUDIO =====
  study_goals JSONB DEFAULT '{"weekly": 5, "monthly": 20}', -- Objetivos semanales/mensuales
  notifications JSONB DEFAULT '{"email": true, "push": true}', -- Configuración de notificaciones
  theme VARCHAR(20) DEFAULT 'light', -- Tema de la aplicación
  study_preferences JSONB DEFAULT '{}', -- Preferencias de estudio
  
  -- ===== ESTADÍSTICAS DE ESTUDIO =====
  study_streak INTEGER DEFAULT 0, -- Racha actual de días
  longest_streak INTEGER DEFAULT 0, -- Racha más larga
  total_study_time INTEGER DEFAULT 0, -- Tiempo total en minutos
  total_sessions INTEGER DEFAULT 0, -- Sesiones totales
  average_session_time INTEGER DEFAULT 0, -- Tiempo promedio por sesión
  
  -- ===== DATOS DE ACTIVIDAD =====
  last_activity_date DATE,
  activity_heatmap JSONB DEFAULT '[]', -- Datos del heatmap de actividad
  study_calendar JSONB DEFAULT '[]', -- Calendario de estudio
  
  -- ===== ANÁLISIS DE HABILIDADES =====
  skill_analysis JSONB DEFAULT '{}', -- Análisis por habilidades
  weak_areas JSONB DEFAULT '[]', -- Áreas débiles identificadas
  strong_areas JSONB DEFAULT '[]', -- Áreas fuertes identificadas
  improvement_suggestions JSONB DEFAULT '[]', -- Sugerencias de mejora
  
  -- ===== LOGROS Y RECOMPENSAS =====
  badges JSONB DEFAULT '[]', -- Insignias obtenidas
  achievement_progress JSONB DEFAULT '{}', -- Progreso hacia logros
  study_rewards JSONB DEFAULT '[]', -- Recompensas obtenidas
  points_total INTEGER DEFAULT 0, -- Puntos totales acumulados
  
  -- ===== CONTENIDO DE ESTUDIO =====
  difficult_words JSONB DEFAULT '[]', -- Palabras difíciles
  flashcards JSONB DEFAULT '[]', -- Tarjetas de memoria
  study_notes JSONB DEFAULT '[]', -- Notas de estudio
  favorite_exercises JSONB DEFAULT '[]', -- Ejercicios favoritos
  
  -- ===== HISTORIAL Y PROGRESO =====
  study_history JSONB DEFAULT '[]', -- Historial de sesiones
  progress_comparison JSONB DEFAULT '{}', -- Comparación con otros usuarios
  study_recommendations JSONB DEFAULT '[]', -- Recomendaciones de estudio
  
  -- ===== FUNCIONALIDADES AVANZADAS =====
  study_timer JSONB DEFAULT '{"isRunning": false, "time": 0, "sessionTime": 0}', -- Timer de estudio
  study_breaks JSONB DEFAULT '{"enabled": true, "interval": 25, "breakTime": 5}', -- Configuración de descansos
  study_music JSONB DEFAULT '{"isPlaying": false, "currentTrack": null}', -- Música de estudio
  
  -- ===== SOCIAL Y GRUPOS =====
  study_groups JSONB DEFAULT '[]', -- Grupos de estudio
  group_chat JSONB DEFAULT '[]', -- Chat de grupos
  study_buddies JSONB DEFAULT '[]', -- Compañeros de estudio
  
  -- ===== DESAFÍOS Y MOTIVACIÓN =====
  weekly_challenges JSONB DEFAULT '[]', -- Desafíos semanales
  study_challenges JSONB DEFAULT '[]', -- Desafíos de estudio
  study_motivation JSONB DEFAULT '{}', -- Datos de motivación
  study_habits JSONB DEFAULT '[]', -- Hábitos de estudio
  
  -- ===== INTELIGENCIA ARTIFICIAL =====
  ai_insights JSONB DEFAULT '[]', -- Insights de IA
  personalized_recommendations JSONB DEFAULT '[]', -- Recomendaciones personalizadas
  learning_patterns JSONB DEFAULT '{}', -- Patrones de aprendizaje
  
  -- ===== CONFIGURACIÓN AVANZADA =====
  study_themes JSONB DEFAULT '{"current": "default", "available": []}', -- Temas de estudio
  export_settings JSONB DEFAULT '{}', -- Configuración de exportación
  privacy_settings JSONB DEFAULT '{}', -- Configuración de privacidad
  
  -- ===== METADATOS =====
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_completion_percentage INTEGER DEFAULT 0 -- Porcentaje de completitud del perfil
);

-- =====================================================
-- TABLA DE SESIONES DE ESTUDIO DETALLADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- ===== DATOS DE LA SESIÓN =====
  session_type VARCHAR(50) NOT NULL, -- 'exam', 'part', 'exercise', 'training'
  level VARCHAR(2) NOT NULL,
  skill VARCHAR(50),
  section VARCHAR(50),
  exercise_id VARCHAR(100),
  
  -- ===== DATOS DE RENDIMIENTO =====
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  time_spent INTEGER DEFAULT 0, -- En segundos
  attempts INTEGER DEFAULT 1,
  
  -- ===== DATOS DE CONTEXTO =====
  difficulty VARCHAR(20),
  exercise_type VARCHAR(50),
  topic_tags JSONB DEFAULT '[]',
  
  -- ===== DATOS DE ANÁLISIS =====
  weak_areas_identified JSONB DEFAULT '[]',
  strong_areas_identified JSONB DEFAULT '[]',
  mistakes_made JSONB DEFAULT '[]',
  improvements_needed JSONB DEFAULT '[]',
  
  -- ===== DATOS DE SESIÓN =====
  session_duration INTEGER DEFAULT 0, -- Duración total de la sesión
  exercises_completed INTEGER DEFAULT 0,
  breaks_taken INTEGER DEFAULT 0,
  music_played BOOLEAN DEFAULT FALSE,
  
  -- ===== METADATOS =====
  device_info JSONB DEFAULT '{}',
  browser_info JSONB DEFAULT '{}',
  study_environment JSONB DEFAULT '{}', -- Ambiente de estudio
  
  -- ===== TIMESTAMPS =====
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE PALABRAS DIFÍCILES Y VOCABULARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ===== DATOS DE LA PALABRA =====
  word VARCHAR(255) NOT NULL,
  definition TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  category VARCHAR(50), -- 'vocabulary', 'grammar', 'phrasal-verbs', etc.
  
  -- ===== DATOS DE PROGRESO =====
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE,
  mastery_level VARCHAR(20) DEFAULT 'learning', -- 'learning', 'familiar', 'mastered'
  
  -- ===== DATOS DE CONTEXTO =====
  example_sentences JSONB DEFAULT '[]',
  synonyms JSONB DEFAULT '[]',
  antonyms JSONB DEFAULT '[]',
  related_words JSONB DEFAULT '[]',
  
  -- ===== METADATOS =====
  source_exercise VARCHAR(100), -- De qué ejercicio viene
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, word)
);

-- =====================================================
-- TABLA DE NOTAS DE ESTUDIO
-- =====================================================
CREATE TABLE IF NOT EXISTS study_notes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ===== DATOS DE LA NOTA =====
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 'grammar', 'vocabulary', 'writing', etc.
  tags JSONB DEFAULT '[]',
  
  -- ===== DATOS DE CONTEXTO =====
  related_exercise VARCHAR(100),
  related_level VARCHAR(2),
  related_skill VARCHAR(50),
  
  -- ===== METADATOS =====
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  -- ===== TIMESTAMPS =====
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE FLASHCARDS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_flashcards (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ===== DATOS DE LA FLASHCARD =====
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  category VARCHAR(50), -- 'vocabulary', 'grammar', 'phrasal-verbs', etc.
  difficulty VARCHAR(20) DEFAULT 'medium',
  
  -- ===== DATOS DE PROGRESO =====
  times_reviewed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  
  -- ===== DATOS DE CONTEXTO =====
  related_exercise VARCHAR(100),
  related_level VARCHAR(2),
  related_skill VARCHAR(50),
  
  -- ===== METADATOS =====
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE DESAFÍOS Y OBJETIVOS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ===== DATOS DEL DESAFÍO =====
  challenge_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'custom'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL, -- Valor objetivo
  current_value INTEGER DEFAULT 0, -- Valor actual
  
  -- ===== DATOS DE PROGRESO =====
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- ===== DATOS DE RECOMPENSA =====
  reward_description TEXT,
  reward_points INTEGER DEFAULT 0,
  reward_badge VARCHAR(100),
  
  -- ===== DATOS DE TIEMPO =====
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  
  -- ===== METADATOS =====
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_session_id ON study_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_word ON user_vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_difficulty ON user_vocabulary(difficulty);
CREATE INDEX IF NOT EXISTS idx_study_notes_user_id ON study_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_category ON study_notes(category);
CREATE INDEX IF NOT EXISTS idx_user_flashcards_user_id ON user_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcards_category ON user_flashcards(category);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_type ON user_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON user_challenges(is_active);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profile
CREATE POLICY "Users can view their own profile" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_vocabulary
CREATE POLICY "Users can view their own vocabulary" ON user_vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON user_vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON user_vocabulary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON user_vocabulary
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para study_notes
CREATE POLICY "Users can view their own study notes" ON study_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study notes" ON study_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study notes" ON study_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study notes" ON study_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_flashcards
CREATE POLICY "Users can view their own flashcards" ON user_flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" ON user_flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON user_flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON user_flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_challenges
CREATE POLICY "Users can view their own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" ON user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" ON user_challenges
  FOR DELETE USING (auth.uid() = user_id);

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
CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_updated_at BEFORE UPDATE ON user_vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON study_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_flashcards_updated_at BEFORE UPDATE ON user_flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar perfil automáticamente cuando se crean sesiones
CREATE OR REPLACE FUNCTION update_user_profile_from_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estadísticas del perfil
    UPDATE user_profile SET
        total_study_time = total_study_time + NEW.time_spent,
        total_sessions = total_sessions + 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar perfil automáticamente
CREATE TRIGGER update_user_profile_from_session_trigger 
    AFTER INSERT ON study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_profile_from_session();

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE user_profile IS 'Perfil completo del usuario con todas las configuraciones y datos personales';
COMMENT ON TABLE study_sessions IS 'Sesiones detalladas de estudio con análisis completo';
COMMENT ON TABLE user_vocabulary IS 'Vocabulario personal del usuario con progreso de aprendizaje';
COMMENT ON TABLE study_notes IS 'Notas de estudio personales del usuario';
COMMENT ON TABLE user_flashcards IS 'Tarjetas de memoria personalizadas del usuario';
COMMENT ON TABLE user_challenges IS 'Desafíos y objetivos personalizados del usuario';

COMMENT ON COLUMN user_profile.study_goals IS 'Objetivos de estudio en formato JSON';
COMMENT ON COLUMN user_profile.skill_analysis IS 'Análisis detallado por habilidades';
COMMENT ON COLUMN user_profile.activity_heatmap IS 'Datos del heatmap de actividad';
COMMENT ON COLUMN study_sessions.session_type IS 'Tipo de sesión: exam, part, exercise, training';
COMMENT ON COLUMN user_vocabulary.mastery_level IS 'Nivel de dominio: learning, familiar, mastered';
COMMENT ON COLUMN user_challenges.challenge_type IS 'Tipo de desafío: weekly, monthly, custom';




