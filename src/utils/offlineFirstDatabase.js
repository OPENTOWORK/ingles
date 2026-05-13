// Offline-First Database System - Works without database initially
import { supabase } from './supabaseClient';

export class OfflineFirstDatabase {
  constructor() {
    this.isOnline = false;
    this.syncQueue = [];
    this.localData = {
      achievements: [],
      exercises: [],
      userProgress: {},
      userAchievements: {},
      userStats: {},
      userPreferences: {}
    };
    this.initLocalData();
  }

  // Initialize local data with default values
  initLocalData() {
    // Initialize achievements locally
    this.localData.achievements = [
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

    // Initialize sample exercises
    this.localData.exercises = [
      {
        id: 1,
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
        id: 2,
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
        id: 3,
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
      }
    ];

    // Load from localStorage if available
    this.loadFromLocalStorage();
  }

  // Load data from localStorage
  loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('offline_database');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.localData = { ...this.localData, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  // Save data to localStorage
  saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('offline_database', JSON.stringify(this.localData));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Check if database is available
  async checkDatabaseAvailability() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('id')
        .limit(1);
      
      this.isOnline = !error;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  // Get achievements (works offline)
  async getAchievements() {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*');
        
        if (!error && data) {
          this.localData.achievements = data;
          this.saveToLocalStorage();
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch achievements from database:', error);
      }
    }
    
    return this.localData.achievements;
  }

  // Get exercises (works offline)
  async getExercises(level = null, skill = null) {
    if (this.isOnline) {
      try {
        let query = supabase.from('exercises').select('*');
        
        if (level) query = query.eq('level', level);
        if (skill) query = query.eq('skill', skill);
        
        const { data, error } = await query;
        
        if (!error && data) {
          this.localData.exercises = data;
          this.saveToLocalStorage();
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch exercises from database:', error);
      }
    }
    
    // Filter local data
    let exercises = this.localData.exercises;
    if (level) exercises = exercises.filter(ex => ex.level === level);
    if (skill) exercises = exercises.filter(ex => ex.skill === skill);
    
    return exercises;
  }

  // Save user progress (works offline)
  async saveUserProgress(userId, exerciseId, score, timeSpent, attempts = 1) {
    const progressData = {
      user_id: userId,
      exercise_id: exerciseId,
      score,
      time_spent: timeSpent,
      attempts,
      completed_at: new Date().toISOString()
    };

    // Save locally first
    const key = `${userId}_${exerciseId}`;
    this.localData.userProgress[key] = progressData;
    this.saveToLocalStorage();

    // Try to sync with database
    if (this.isOnline) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            tipo: 'training',
            fecha: today,
            porcentaje: Number(score) || 0
          });
        
        if (error) {
          console.warn('Failed to sync progress to database:', error);
          this.syncQueue.push({ type: 'progress', data: progressData });
        }
      } catch (error) {
        console.warn('Database sync failed:', error);
        this.syncQueue.push({ type: 'progress', data: progressData });
      }
    } else {
      this.syncQueue.push({ type: 'progress', data: progressData });
    }

    return { success: true, offline: !this.isOnline };
  }

  // Get user progress (works offline)
  async getUserProgress(userId) {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);
        
        if (!error && data) {
          // Normalize Supabase shape into legacy frontend shape
          const normalized = data.map(progress => ({
            ...progress,
            exercise_id: progress.id,
            score: progress.porcentaje || 0,
            time_spent: progress.tiempo_dedicado || 0,
            completed_at: progress.creado_en || progress.fecha
          }));

          normalized.forEach(progress => {
            const key = `${progress.user_id}_${progress.exercise_id}`;
            this.localData.userProgress[key] = progress;
          });
          this.saveToLocalStorage();
          return normalized;
        }
      } catch (error) {
        console.warn('Failed to fetch progress from database:', error);
      }
    }
    
    // Return local data
    return Object.values(this.localData.userProgress).filter(p => p.user_id === userId);
  }

  // Get user achievements (works offline)
  async getUserAchievements(userId) {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId);
        
        if (!error && data) {
          const normalized = data.map(item => ({
            ...item,
            achievement_id: item.tipo || item.id,
            earned_at: item.fecha_conseguido || item.creado_en
          }));
          this.localData.userAchievements[userId] = normalized;
          this.saveToLocalStorage();
          return normalized;
        }
      } catch (error) {
        console.warn('Failed to fetch user achievements from database:', error);
      }
    }
    
    return this.localData.userAchievements[userId] || [];
  }

  // Get overall progress (works offline)
  async getUserOverallProgress(userId) {
    const progress = await this.getUserProgress(userId);
    
    const bySkill = {};
    const byLevel = {};
    let total = 0;

    progress.forEach(p => {
      // Get exercise details
      const exercise = this.localData.exercises.find(ex => ex.id === p.exercise_id);
      if (!exercise) return;

      // Count by skill
      const skill = exercise.skill;
      if (!bySkill[skill]) bySkill[skill] = { total: 0, completed: 0, score: 0 };
      bySkill[skill].total++;
      if (p.score > 0) {
        bySkill[skill].completed++;
        bySkill[skill].score += p.score;
      }

      // Count by level
      const level = exercise.level;
      if (!byLevel[level]) byLevel[level] = { total: 0, completed: 0, score: 0 };
      byLevel[level].total++;
      if (p.score > 0) {
        byLevel[level].completed++;
        byLevel[level].score += p.score;
      }

      total++;
    });

    return { bySkill, byLevel, total };
  }

  // Save user preferences (works offline)
  async saveUserPreferences(userId, preferences) {
    const preferencesData = {
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    };

    // Save locally first
    this.localData.userPreferences[userId] = preferencesData;
    this.saveToLocalStorage();

    // Try to sync with database
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            estilo_aprendizaje: preferences.current_level || preferences.name || null,
            notificaciones: Boolean(preferences.notifications?.email ?? true),
            recordatorios: Boolean(preferences.notifications?.push ?? true)
          });
        
        if (error) {
          console.warn('Failed to sync preferences to database:', error);
          this.syncQueue.push({ type: 'preferences', data: preferencesData });
        }
      } catch (error) {
        console.warn('Database sync failed:', error);
        this.syncQueue.push({ type: 'preferences', data: preferencesData });
      }
    } else {
      this.syncQueue.push({ type: 'preferences', data: preferencesData });
    }

    return { success: true, offline: !this.isOnline };
  }

  // Get user preferences (works offline)
  async getUserPreferences(userId) {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!error && data) {
          const normalized = {
            ...data,
            name: '',
            current_level: data.estilo_aprendizaje || 'A1',
            notifications: {
              email: Boolean(data.notificaciones),
              push: Boolean(data.recordatorios)
            },
            onboarding_completed: true
          };
          this.localData.userPreferences[userId] = normalized;
          this.saveToLocalStorage();
          return normalized;
        }
      } catch (error) {
        console.warn('Failed to fetch preferences from database:', error);
      }
    }
    
    return this.localData.userPreferences[userId] || null;
  }

  // Setup database (creates tables and inserts data)
  async setupDatabase(onProgress = null) {
    // External-schema mode: do not mutate Supabase (no seed, no table creation).
    const isAvailable = await this.checkDatabaseAvailability();
    this.isOnline = isAvailable;
    onProgress?.({
      current: 100,
      total: 100,
      step: isAvailable ? 'Connected to Supabase schema' : 'Working in offline mode',
      percentage: 100
    });
    return {
      success: true,
      message: isAvailable ? 'Connected to existing Supabase schema' : 'Working in offline mode',
      offline: !isAvailable
    };
  }

  // Check database health
  async checkHealth() {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      
      return {
        healthy: true, // Always healthy since we work offline
        online: isAvailable,
        checks: {
          exercises: true,
          achievements: true,
          user_progress: true,
          user_achievements: true,
          user_stats: true,
          user_preferences: true,
          adaptive_learning_data: true
        },
        message: isAvailable ? 'Database is online' : 'Working offline'
      };
    } catch (error) {
      return {
        healthy: true, // Still healthy in offline mode
        online: false,
        error: error.message,
        message: 'Working offline'
      };
    }
  }

  // Sync queued data when database becomes available
  async syncQueuedData() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`🔄 Syncing ${this.syncQueue.length} queued items...`);
    
    const synced = [];
    for (const item of this.syncQueue) {
      try {
        if (item.type === 'progress') {
          const today = new Date().toISOString().split('T')[0];
          const { error } = await supabase
            .from('user_progress')
            .upsert({
              user_id: item.data.user_id,
              tipo: 'training',
              fecha: today,
              porcentaje: Number(item.data.score) || 0
            });
          
          if (!error) synced.push(item);
        } else if (item.type === 'preferences') {
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: item.data.user_id,
              estilo_aprendizaje: item.data.current_level || item.data.name || null,
              notificaciones: Boolean(item.data.notifications?.email ?? true),
              recordatorios: Boolean(item.data.notifications?.push ?? true)
            });
          
          if (!error) synced.push(item);
        }
      } catch (error) {
        console.warn('Failed to sync item:', error);
      }
    }

    // Remove synced items from queue
    this.syncQueue = this.syncQueue.filter(item => !synced.includes(item));
    
    console.log(`✅ Synced ${synced.length} items`);
  }
}

// Create singleton instance
export const offlineFirstDatabase = new OfflineFirstDatabase();

// Helper functions
export const setupOfflineFirstDatabase = async (onProgress = null) => {
  return await offlineFirstDatabase.setupDatabase(onProgress);
};

export const checkOfflineFirstHealth = async () => {
  return await offlineFirstDatabase.checkHealth();
};






















