// Simple theory progress utility that works offline-first
class TheoryProgressManager {
  constructor() {
    this.storageKey = 'theory_progress';
  }

  // Get all theory progress for a user
  getAllProgress(userId) {
    try {
      const key = `${this.storageKey}_${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading theory progress:', error);
      return {};
    }
  }

  // Save theory progress for a specific topic
  saveProgress(userId, topicId, progress) {
    try {
      const key = `${this.storageKey}_${userId}`;
      const allProgress = this.getAllProgress(userId);
      
      allProgress[topicId] = {
        topicId,
        progress,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(allProgress));
      return { success: true, offline: true };
    } catch (error) {
      console.error('Error saving theory progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Get progress for a specific topic
  getProgress(userId, topicId) {
    try {
      const allProgress = this.getAllProgress(userId);
      return allProgress[topicId] || null;
    } catch (error) {
      console.error('Error getting theory progress:', error);
      return null;
    }
  }

  // Clear all progress for a user
  clearProgress(userId) {
    try {
      const key = `${this.storageKey}_${userId}`;
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Error clearing theory progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Get progress statistics
  getProgressStats(userId) {
    try {
      const allProgress = this.getAllProgress(userId);
      const topics = Object.values(allProgress);
      
      const totalTopics = topics.length;
      const completedTopics = topics.filter(t => t.progress >= 100).length;
      const averageProgress = totalTopics > 0 
        ? topics.reduce((sum, t) => sum + t.progress, 0) / totalTopics 
        : 0;

      return {
        totalTopics,
        completedTopics,
        averageProgress: Math.round(averageProgress),
        topics
      };
    } catch (error) {
      console.error('Error getting progress stats:', error);
      return {
        totalTopics: 0,
        completedTopics: 0,
        averageProgress: 0,
        topics: []
      };
    }
  }
}

// Create singleton instance
export const theoryProgressManager = new TheoryProgressManager();

// Convenience functions
export const saveTheoryProgress = (userId, topicId, progress) => {
  return theoryProgressManager.saveProgress(userId, topicId, progress);
};

export const getTheoryProgress = (userId, topicId) => {
  return theoryProgressManager.getProgress(userId, topicId);
};

export const getAllTheoryProgress = (userId) => {
  return theoryProgressManager.getAllProgress(userId);
};

export const getTheoryProgressStats = (userId) => {
  return theoryProgressManager.getProgressStats(userId);
};



