import { supabase } from './supabaseClient';
import { progressTracker } from './progressTracker';

// Adaptive Learning System
export class AdaptiveLearningSystem {
  constructor() {
    this.difficultyThresholds = {
      tooEasy: 95,    // Score above this = increase difficulty
      justRight: 70,  // Target range: 70-95
      tooHard: 50     // Score below this = decrease difficulty
    };
    
    this.masteryThresholds = {
      beginner: 0,
      intermediate: 60,
      advanced: 80,
      expert: 95
    };
  }

  // Analyze user's learning patterns and performance
  async analyzeUserPerformance(userId, skill = null) {
    try {
      const overallProgress = await progressTracker.getUserOverallProgress(userId);
      
      if (!overallProgress || overallProgress.total === 0) {
        return this.getInitialRecommendations();
      }

      const analysis = {
        userId,
        overallStats: this.calculateOverallStats(overallProgress),
        skillAnalysis: {},
        weakAreas: [],
        strongAreas: [],
        recommendations: [],
        nextLevel: null,
        difficultyAdjustments: {}
      };

      // Analyze each skill
      for (const [skillName, skillData] of Object.entries(overallProgress.bySkill)) {
        if (skill && skillName !== skill) continue;
        
        const skillStats = progressTracker.calculateSkillStats(skillData);
        analysis.skillAnalysis[skillName] = {
          ...skillStats,
          trend: this.calculateTrend(skillData),
          consistency: this.calculateConsistency(skillData),
          timeEfficiency: this.calculateTimeEfficiency(skillData)
        };

        // Identify weak and strong areas
        if (skillStats.averageScore < 60) {
          analysis.weakAreas.push({
            skill: skillName,
            score: skillStats.averageScore,
            priority: 'high'
          });
        } else if (skillStats.averageScore > 85) {
          analysis.strongAreas.push({
            skill: skillName,
            score: skillStats.averageScore,
            priority: 'maintain'
          });
        }

        // Generate difficulty adjustments
        analysis.difficultyAdjustments[skillName] = this.calculateDifficultyAdjustment(skillStats);
      }

      // Generate personalized recommendations
      analysis.recommendations = await this.generateRecommendations(analysis);
      
      // Determine next level
      analysis.nextLevel = this.determineNextLevel(analysis);

      return analysis;
    } catch (error) {
      console.error('Error analyzing user performance:', error);
      return this.getInitialRecommendations();
    }
  }

  // Calculate overall user statistics
  calculateOverallStats(progressData) {
    const allExercises = Object.values(progressData.bySkill).flat();
    
    return {
      totalExercises: allExercises.length,
      averageScore: allExercises.reduce((sum, ex) => sum + (ex.score || 0), 0) / allExercises.length,
      totalTimeSpent: allExercises.reduce((sum, ex) => sum + (ex.time_spent || 0), 0),
      completionRate: (allExercises.filter(ex => ex.score > 0).length / allExercises.length) * 100,
      learningVelocity: this.calculateLearningVelocity(allExercises),
      retentionRate: this.calculateRetentionRate(allExercises)
    };
  }

  // Calculate learning trend over time
  calculateTrend(exercises) {
    if (exercises.length < 3) return 'insufficient_data';
    
    const recentExercises = exercises.slice(-10); // Last 10 exercises
    const scores = recentExercises.map(ex => ex.score || 0);
    
    // Simple linear regression to determine trend
    const n = scores.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = scores.reduce((sum, score) => sum + score, 0);
    const sumXY = scores.reduce((sum, score, index) => sum + (score * index), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (slope > 2) return 'improving';
    if (slope < -2) return 'declining';
    return 'stable';
  }

  // Calculate consistency in performance
  calculateConsistency(exercises) {
    if (exercises.length < 3) return 0;
    
    const scores = exercises.map(ex => ex.score || 0);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistency = Math.max(0, 100 - standardDeviation);
    return Math.round(consistency);
  }

  // Calculate time efficiency
  calculateTimeEfficiency(exercises) {
    if (exercises.length === 0) return 0;
    
    const totalTime = exercises.reduce((sum, ex) => sum + (ex.time_spent || 0), 0);
    const averageScore = exercises.reduce((sum, ex) => sum + (ex.score || 0), 0) / exercises.length;
    
    // Efficiency = score per minute
    const efficiency = averageScore / (totalTime / 60);
    return Math.round(efficiency * 100) / 100;
  }

  // Calculate learning velocity (exercises per session)
  calculateLearningVelocity(exercises) {
    if (exercises.length === 0) return 0;
    
    // Group by date to find sessions
    const sessions = {};
    exercises.forEach(ex => {
      const date = new Date(ex.completed_at).toDateString();
      if (!sessions[date]) sessions[date] = [];
      sessions[date].push(ex);
    });
    
    const sessionCount = Object.keys(sessions).length;
    return sessionCount > 0 ? Math.round(exercises.length / sessionCount) : 0;
  }

  // Calculate retention rate (repeated exercises)
  calculateRetentionRate(exercises) {
    const repeatedExercises = exercises.filter(ex => ex.attempts > 1);
    return exercises.length > 0 ? Math.round((repeatedExercises.length / exercises.length) * 100) : 0;
  }

  // Calculate difficulty adjustment needed
  calculateDifficultyAdjustment(skillStats) {
    const { averageScore, completionRate } = skillStats;
    
    if (averageScore > this.difficultyThresholds.tooEasy && completionRate > 90) {
      return { action: 'increase', reason: 'too_easy' };
    } else if (averageScore < this.difficultyThresholds.tooHard && completionRate < 60) {
      return { action: 'decrease', reason: 'too_hard' };
    } else {
      return { action: 'maintain', reason: 'appropriate' };
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(analysis) {
    const recommendations = [];

    // Weak areas recommendations
    analysis.weakAreas.forEach(weakArea => {
      recommendations.push({
        type: 'focus_area',
        priority: 'high',
        skill: weakArea.skill,
        message: `Focus on ${weakArea.skill} - your current score is ${weakArea.score}%`,
        action: `Practice more ${weakArea.skill} exercises`,
        exercises: this.getRecommendedExercises(weakArea.skill, 'remedial')
      });
    });

    // Strong areas recommendations
    analysis.strongAreas.forEach(strongArea => {
      recommendations.push({
        type: 'maintain_strength',
        priority: 'medium',
        skill: strongArea.skill,
        message: `Great job in ${strongArea.skill}! Keep practicing to maintain your ${strongArea.score}% average`,
        action: `Continue practicing ${strongArea.skill} with advanced exercises`,
        exercises: this.getRecommendedExercises(strongArea.skill, 'advanced')
      });
    });

    // Learning velocity recommendations
    if (analysis.overallStats.learningVelocity < 3) {
      recommendations.push({
        type: 'study_frequency',
        priority: 'medium',
        message: 'Consider practicing more frequently for better retention',
        action: 'Try to complete at least 3-5 exercises per session'
      });
    }

    // Consistency recommendations
    Object.entries(analysis.skillAnalysis).forEach(([skill, stats]) => {
      if (stats.consistency < 60) {
        recommendations.push({
          type: 'consistency',
          priority: 'medium',
          skill: skill,
          message: `Your performance in ${skill} varies a lot. Focus on consistent practice`,
          action: `Practice ${skill} exercises daily for better consistency`
        });
      }
    });

    // Time efficiency recommendations
    Object.entries(analysis.skillAnalysis).forEach(([skill, stats]) => {
      if (stats.timeEfficiency < 1.5) {
        recommendations.push({
          type: 'time_efficiency',
          priority: 'low',
          skill: skill,
          message: `You're taking longer than average on ${skill} exercises`,
          action: 'Practice time management and focus techniques'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Get recommended exercises based on skill and level
  getRecommendedExercises(skill, level) {
    // This would typically query the database for appropriate exercises
    // For now, return mock recommendations
    const exerciseTypes = {
      listening: ['basic_phrases', 'numbers', 'directions', 'conversations'],
      reading: ['short_texts', 'comprehension', 'vocabulary_in_context'],
      writing: ['sentences', 'paragraphs', 'essays'],
      speaking: ['pronunciation', 'conversation', 'presentations'],
      vocabulary: ['word_meanings', 'synonyms', 'context_usage'],
      use_of_english: ['grammar', 'tenses', 'prepositions']
    };

    const levels = {
      remedial: ['basic', 'foundational'],
      intermediate: ['intermediate'],
      advanced: ['advanced', 'challenging']
    };

    return {
      skill: skill,
      level: level,
      exerciseTypes: exerciseTypes[skill] || [],
      suggestedLevels: levels[level] || []
    };
  }

  // Determine next level for user
  determineNextLevel(analysis) {
    const { overallStats, skillAnalysis } = analysis;
    
    // Check if user is ready for next level
    const currentLevel = this.getCurrentLevel(analysis);
    const readinessScore = this.calculateReadinessScore(skillAnalysis);
    
    if (readinessScore > 80 && overallStats.averageScore > 75) {
      return {
        ready: true,
        currentLevel: currentLevel,
        nextLevel: this.getNextLevel(currentLevel),
        readinessScore: readinessScore,
        requirements: this.getLevelRequirements(this.getNextLevel(currentLevel))
      };
    }
    
    return {
      ready: false,
      currentLevel: currentLevel,
      nextLevel: null,
      readinessScore: readinessScore,
      requirements: this.getLevelRequirements(currentLevel)
    };
  }

  // Get current user level
  getCurrentLevel(analysis) {
    const { overallStats } = analysis;
    if (overallStats.averageScore >= 90) return 'C2';
    if (overallStats.averageScore >= 80) return 'C1';
    if (overallStats.averageScore >= 70) return 'B2';
    if (overallStats.averageScore >= 60) return 'B1';
    if (overallStats.averageScore >= 50) return 'A2';
    return 'A1';
  }

  // Get next level
  getNextLevel(currentLevel) {
    const levelProgression = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levelProgression.indexOf(currentLevel);
    return currentIndex < levelProgression.length - 1 ? levelProgression[currentIndex + 1] : null;
  }

  // Calculate readiness score for next level
  calculateReadinessScore(skillAnalysis) {
    if (Object.keys(skillAnalysis).length === 0) return 0;
    
    const scores = Object.values(skillAnalysis).map(skill => skill.averageScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return Math.round(averageScore);
  }

  // Get level requirements
  getLevelRequirements(level) {
    const requirements = {
      'A1': { minScore: 0, minExercises: 0, skills: ['basic_vocabulary', 'simple_phrases'] },
      'A2': { minScore: 50, minExercises: 20, skills: ['basic_grammar', 'simple_conversations'] },
      'B1': { minScore: 60, minExercises: 50, skills: ['intermediate_grammar', 'reading_comprehension'] },
      'B2': { minScore: 70, minExercises: 100, skills: ['advanced_grammar', 'complex_texts'] },
      'C1': { minScore: 80, minExercises: 200, skills: ['advanced_vocabulary', 'complex_structures'] },
      'C2': { minScore: 90, minExercises: 300, skills: ['native_level', 'all_skills'] }
    };
    
    return requirements[level] || requirements['A1'];
  }

  // Get initial recommendations for new users
  getInitialRecommendations() {
    return {
      userId: null,
      overallStats: {
        totalExercises: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        completionRate: 0,
        learningVelocity: 0,
        retentionRate: 0
      },
      skillAnalysis: {},
      weakAreas: [],
      strongAreas: [],
      recommendations: [
        {
          type: 'welcome',
          priority: 'high',
          message: 'Welcome! Start with basic exercises to establish your level',
          action: 'Begin with A1 level exercises',
          exercises: { skill: 'all', level: 'basic' }
        }
      ],
      nextLevel: {
        ready: false,
        currentLevel: 'A1',
        nextLevel: null,
        readinessScore: 0,
        requirements: this.getLevelRequirements('A1')
      },
      difficultyAdjustments: {}
    };
  }

  // Generate personalized study plan
  async generateStudyPlan(userId, duration = 7) { // 7 days default
    const analysis = await this.analyzeUserPerformance(userId);
    const studyPlan = {
      userId,
      duration,
      dailyGoals: [],
      weeklyGoals: [],
      focusAreas: analysis.weakAreas.map(area => area.skill),
      recommendedExercises: [],
      milestones: []
    };

    // Generate daily goals
    for (let day = 1; day <= duration; day++) {
      const dailyGoal = {
        day,
        exercises: Math.min(5, Math.max(2, Math.round(analysis.overallStats.learningVelocity))),
        focusSkill: analysis.weakAreas.length > 0 ? analysis.weakAreas[0].skill : 'balanced',
        estimatedTime: 30, // minutes
        priority: day <= 3 ? 'high' : 'medium'
      };
      studyPlan.dailyGoals.push(dailyGoal);
    }

    // Generate weekly goals
    studyPlan.weeklyGoals = [
      {
        week: 1,
        target: `Complete ${duration * 3} exercises`,
        focus: 'Building consistency'
      }
    ];

    // Generate milestones
    studyPlan.milestones = [
      {
        day: 3,
        target: 'Complete 15 exercises',
        reward: 'Consistency badge'
      },
      {
        day: 7,
        target: 'Improve weakest skill by 10%',
        reward: 'Improvement badge'
      }
    ];

    return studyPlan;
  }

  // Save adaptive learning data
  async saveAdaptiveData(userId, analysis) {
    try {
      const { data, error } = await supabase
        .from('adaptive_learning_data')
        .upsert({
          user_id: userId,
          analysis_data: analysis,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving adaptive learning data:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const adaptiveLearning = new AdaptiveLearningSystem();

// Helper functions
export const analyzeUserPerformance = async (userId, skill = null) => {
  return await adaptiveLearning.analyzeUserPerformance(userId, skill);
};

export const generateStudyPlan = async (userId, duration = 7) => {
  return await adaptiveLearning.generateStudyPlan(userId, duration);
};

export const getPersonalizedRecommendations = async (userId) => {
  const analysis = await adaptiveLearning.analyzeUserPerformance(userId);
  return analysis.recommendations;
};



