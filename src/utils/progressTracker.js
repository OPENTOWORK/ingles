import { supabase } from './supabaseClient';
import { offlineFirstDatabase } from './offlineFirstDatabase';

// Progress tracking utilities
export class ProgressTracker {
  constructor() {
    this.progressCache = new Map();
  }

  // Save user progress for an exercise with offline-first approach
  async saveExerciseProgress(userId, exerciseId, score, timeSpent, attempts = 1) {
    try {
      // Use offline-first database system
      const result = await offlineFirstDatabase.saveUserProgress(userId, exerciseId, score, timeSpent, attempts);
      
      // Update cache
      this.progressCache.set(`${userId}-${exerciseId}`, {
        score,
        timeSpent,
        attempts,
        completedAt: new Date().toISOString()
      });

      return { success: true, offline: result.offline };
    } catch (error) {
      // Solo mostrar error si es crítico, no para problemas de conexión menores
      if (!error.message?.includes('Failed to fetch') && !error.message?.includes('Network')) {
        console.warn('Progress save warning:', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  // Get user progress for a specific exercise
  async getExerciseProgress(userId, exerciseId) {
    const cacheKey = `${userId}-${exerciseId}`;
    
    if (this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const progress = data || null;
      if (progress) {
        this.progressCache.set(cacheKey, progress);
      }

      return progress;
    } catch (error) {
      // Solo mostrar error si no es un error de "no encontrado" o problemas de conexión menores
      if (error.code !== 'PGRST116' && !error.message?.includes('Failed to fetch')) {
        console.warn('Progress fetch warning:', error.message);
      }
      return null;
    }
  }

  // Get user progress for a skill/level
  async getUserSkillProgress(userId, level, skill, sublevel) {
    try {
      // Use offline-first database system
      const progress = await offlineFirstDatabase.getUserProgress(userId);
      
      // Filter by skill/level if provided
      if (level && skill && sublevel) {
        return progress.filter(p => 
          p.level === level && 
          p.skill === skill && 
          p.sublevel === sublevel
        );
      }
      
      return progress || [];
    } catch (error) {
      console.error('Error fetching skill progress:', error);
      return [];
    }
  }

  // Calculate skill statistics
  calculateSkillStats(progressData) {
    if (!progressData || progressData.length === 0) {
      return {
        totalExercises: 0,
        completedExercises: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        completionRate: 0,
        masteryLevel: 'beginner'
      };
    }

    const totalExercises = progressData.length;
    const completedExercises = progressData.filter(p => p.score > 0).length;
    const averageScore = progressData.reduce((sum, p) => sum + (p.score || 0), 0) / totalExercises;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0);
    const completionRate = (completedExercises / totalExercises) * 100;

    let masteryLevel = 'beginner';
    if (averageScore >= 90) masteryLevel = 'expert';
    else if (averageScore >= 75) masteryLevel = 'advanced';
    else if (averageScore >= 60) masteryLevel = 'intermediate';
    else if (averageScore >= 40) masteryLevel = 'beginner';

    return {
      totalExercises,
      completedExercises,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      completionRate: Math.round(completionRate),
      masteryLevel
    };
  }

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      // Use offline-first database system
      const achievements = await offlineFirstDatabase.getUserAchievements(userId);
      return achievements || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // Award achievement
  async awardAchievement(userId, achievementId, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          tipo: achievementId,
          descripcion: JSON.stringify(metadata || {}),
          conseguido: true,
          fecha_conseguido: new Date().toISOString()
        });

      if (error) throw error;

      return data;
    } catch (error) {
      // Silenciar errores de achievements si la tabla no existe o hay problemas de conexión
      if (!error.message?.includes('Failed to fetch') && !error.message?.includes('relation') && error.code !== 'PGRST116') {
        console.warn('Achievement warning:', error.message);
      }
      return null;
    }
  }

  // Check for new achievements
  async checkAchievements(userId, exerciseData) {
    const achievements = [];

    // Check for first exercise completion
    const firstExercise = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (firstExercise.data && !firstExercise.error) {
      achievements.push({
        id: 'first_exercise',
        title: 'First Steps',
        description: 'Completed your first exercise!',
        icon: '🎯',
        points: 10
      });
    }

    // Check for perfect score
    if (exerciseData.score === 100) {
      achievements.push({
        id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Got a perfect score on an exercise!',
        icon: '🏆',
        points: 25
      });
    }

    // Check for speed completion (under 30 seconds)
    if (exerciseData.timeSpent < 30) {
      achievements.push({
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Completed an exercise in under 30 seconds!',
        icon: '⚡',
        points: 15
      });
    }

    // Award achievements
    for (const achievement of achievements) {
      try {
        await this.awardAchievement(userId, achievement.id, {
          exercise_id: exerciseData.exerciseId,
          score: exerciseData.score,
          time_spent: exerciseData.timeSpent
        });
      } catch (error) {
        // Silenciar errores de achievements - no críticos
      }
    }

    return achievements;
  }

  // Get user's overall progress
  async getUserOverallProgress(userId) {
    try {
      // Use offline-first database system
      const progress = await offlineFirstDatabase.getUserOverallProgress(userId);
      return progress;
    } catch (error) {
      console.error('Error fetching overall progress:', error);
      return { bySkill: {}, byLevel: {}, total: 0 };
    }
  }

  // Save theory progress
  async saveTheoryProgress(userId, topicId, progress) {
    // Always save to localStorage first for immediate persistence
    try {
      const localStorageKey = `theory_progress_${userId}_${topicId}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        topicId,
        progress,
        updatedAt: new Date().toISOString()
      }));
    } catch (localError) {
      console.error('Error saving to localStorage:', localError);
    }

    // Try to save to Supabase (optional, for sync)
    try {
      const { data, error } = await supabase
        .from('theory_progress')
        .upsert({
          user_id: userId,
          contenido_id: topicId
        });

      if (error) {
        console.warn('Database sync failed, but progress saved locally:', error.message);
        return { success: true, offline: true };
      }

      return { success: true, data, synced: true };
    } catch (error) {
      console.warn('Database sync failed, but progress saved locally:', error.message);
      return { success: true, offline: true };
    }
  }

  // Get theory progress
  async getTheoryProgress(userId, topicId) {
    // Always check localStorage first for immediate access
    try {
      const localStorageKey = `theory_progress_${userId}_${topicId}`;
      const localData = localStorage.getItem(localStorageKey);
      
      if (localData) {
        const parsed = JSON.parse(localData);
        return {
          topicId: parsed.topicId,
          progress: parsed.progress,
          updatedAt: parsed.updatedAt
        };
      }
    } catch (localError) {
      console.error('Error reading from localStorage:', localError);
    }

    // Try to get from Supabase for sync (optional)
    try {
      const { data, error } = await supabase
        .from('theory_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('contenido_id', topicId)
        .single();

      if (!error && data) {
        // Sync to localStorage if we got data from database
        try {
          const localStorageKey = `theory_progress_${userId}_${topicId}`;
          localStorage.setItem(localStorageKey, JSON.stringify({
            topicId: data.topic_id,
            progress: data.progress,
            updatedAt: data.updated_at
          }));
        } catch (syncError) {
          console.warn('Could not sync database data to localStorage:', syncError);
        }

        return {
          topicId: data.contenido_id,
          progress: 100,
          updatedAt: data.creado_en
        };
      }
    } catch (error) {
      console.warn('Database fetch failed, using localStorage data:', error.message);
    }

    return null;
  }

  // Read-only schema mode: never create tables from the app.
  async ensureTheoryProgressTable() {
    return true;
  }

  // Clear cache
  clearCache() {
    this.progressCache.clear();
  }
}

// Create a singleton instance
export const progressTracker = new ProgressTracker();

// Helper functions for common operations
export const saveExerciseResult = async (userId, exerciseId, score, timeSpent, attempts = 1) => {
  return await progressTracker.saveExerciseProgress(userId, exerciseId, score, timeSpent, attempts);
};

export const getUserProgress = async (userId, exerciseId) => {
  return await progressTracker.getExerciseProgress(userId, exerciseId);
};

export const getSkillProgress = async (userId, level, skill, sublevel) => {
  return await progressTracker.getUserSkillProgress(userId, level, skill, sublevel);
};

export const calculateProgressPercentage = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#10b981'; // green
  if (percentage >= 70) return '#3b82f6'; // blue
  if (percentage >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

// Theory progress helper functions
export const saveTheoryProgress = async (userId, topicId, progress) => {
  return await progressTracker.saveTheoryProgress(userId, topicId, progress);
};

export const getTheoryProgress = async (userId, topicId) => {
  return await progressTracker.getTheoryProgress(userId, topicId);
};
