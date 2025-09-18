/**
 * Quest System React Hooks
 * 
 * Provides quest state management and progress tracking
 * for React components with real-time updates and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  questService,
  QuestGenerationConfig,
  QuestTemplate,
  QuestAnalytics
} from '../lib/quest/quest-service';
import { Quest, UserQuest } from '../lib/firebase/schema';
import { useAuth } from './useAuth';

// Hook Types
interface QuestState {
  availableQuests: Quest[];
  userQuests: UserQuest[];
  activeQuests: UserQuest[];
  completedQuests: UserQuest[];
  dailyChallenges: Quest[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface QuestActions {
  startQuest: (questId: string) => Promise<UserQuest>;
  generateQuests: () => Promise<Quest[]>;
  createDailyChallenges: () => Promise<Quest[]>;
  refreshQuests: () => Promise<void>;
  clearError: () => void;
}

type UseQuestsReturn = QuestState & QuestActions;

/**
 * Main quests hook
 */
export function useQuests(): UseQuestsReturn {
  const { user } = useAuth();
  
  const [state, setState] = useState<QuestState>({
    availableQuests: [],
    userQuests: [],
    activeQuests: [],
    completedQuests: [],
    dailyChallenges: [],
    loading: false,
    error: null,
    isInitialized: false
  });

  // Initialize quest data
  useEffect(() => {
    if (user) {
      loadQuestData();
    } else {
      setState(prev => ({
        ...prev,
        availableQuests: [],
        userQuests: [],
        activeQuests: [],
        completedQuests: [],
        dailyChallenges: [],
        isInitialized: false
      }));
    }
  }, [user]);

  // Load quest data
  const loadQuestData = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load available quests and user quests in parallel
      const [availableQuests, userQuests] = await Promise.all([
        questService.getAvailableQuests(user.uid),
        questService.getUserQuestProgress(user.uid)
      ]);

      // Categorize user quests
      const activeQuests = userQuests.filter(uq => uq.progress.status === 'active');
      const completedQuests = userQuests.filter(uq => uq.progress.status === 'completed');

      setState(prev => ({
        ...prev,
        availableQuests,
        userQuests,
        activeQuests,
        completedQuests,
        loading: false,
        isInitialized: true
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load quest data'
      }));
    }
  }, [user]);

  // Helper function for async actions
  const handleAsyncAction = useCallback(
    async (action: () => Promise<any>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await action();
        setState(prev => ({ ...prev, loading: false }));
        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'An unexpected error occurred'
        }));
        throw error;
      }
    },
    []
  );

  // Start a quest
  const startQuest = useCallback(
    async (questId: string) => {
      if (!user) throw new Error('User not authenticated');

      const userQuest = await handleAsyncAction(() =>
        questService.startQuest(user.uid, questId)
      );

      // Update state
      setState(prev => ({
        ...prev,
        userQuests: [...prev.userQuests, userQuest],
        activeQuests: [...prev.activeQuests, userQuest],
        availableQuests: prev.availableQuests.filter(q => q.id !== questId)
      }));

      return userQuest;
    },
    [user, handleAsyncAction]
  );

  // Generate personalized quests
  const generateQuests = useCallback(
    async () => {
      if (!user) throw new Error('User not authenticated');

      const quests = await handleAsyncAction(() =>
        questService.generateQuestsForUser(user.uid)
      );

      // Update state
      setState(prev => ({
        ...prev,
        availableQuests: [...prev.availableQuests, ...quests]
      }));

      return quests;
    },
    [user, handleAsyncAction]
  );

  // Create daily challenges
  const createDailyChallenges = useCallback(
    async () => {
      if (!user) throw new Error('User not authenticated');

      const challenges = await handleAsyncAction(() =>
        questService.createDailyChallenges(user.uid)
      );

      // Update state
      setState(prev => ({
        ...prev,
        dailyChallenges: challenges
      }));

      return challenges;
    },
    [user, handleAsyncAction]
  );

  // Refresh quest data
  const refreshQuests = useCallback(async () => {
    await loadQuestData();
  }, [loadQuestData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    availableQuests: state.availableQuests,
    userQuests: state.userQuests,
    activeQuests: state.activeQuests,
    completedQuests: state.completedQuests,
    dailyChallenges: state.dailyChallenges,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,

    // Actions
    startQuest,
    generateQuests,
    createDailyChallenges,
    refreshQuests,
    clearError
  };
}

/**
 * Hook for real-time quest progress tracking
 */
export function useQuestProgress(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.uid;

  const [progress, setProgress] = useState<UserQuest[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;

    setLoading(true);

    // Set up real-time progress listener
    const unsubscribe = questService.onProgressChanged(targetUserId, (userQuests) => {
      setProgress(userQuests);
      setLastUpdate(new Date());
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [targetUserId]);

  // Calculate progress statistics
  const stats = {
    totalActive: progress.filter(uq => uq.progress.status === 'active').length,
    totalCompleted: progress.filter(uq => uq.progress.status === 'completed').length,
    totalPoints: progress.reduce((sum, uq) => sum + (uq.rewards.pointsEarned || 0), 0),
    averageProgress: progress.length > 0 
      ? progress.reduce((sum, uq) => sum + uq.progress.percentage, 0) / progress.length 
      : 0,
    completionRate: progress.length > 0 
      ? (progress.filter(uq => uq.progress.status === 'completed').length / progress.length) * 100 
      : 0
  };

  return {
    progress,
    stats,
    lastUpdate,
    loading
  };
}

/**
 * Hook for individual quest details and progress
 */
export function useQuestDetails(questId: string | null) {
  const { userQuests } = useQuests();
  const [questData, setQuestData] = useState<{ quest: Quest | null; userQuest: UserQuest | null }>({
    quest: null,
    userQuest: null
  });
  const [loading, setLoading] = useState(false);

  // Find user quest
  const userQuest = questId 
    ? userQuests.find(uq => uq.questId === questId || uq.id === questId) || null
    : null;

  useEffect(() => {
    if (!questId) return;

    const loadQuestDetails = async () => {
      setLoading(true);
      try {
        // This would fetch quest details from Firestore
        // For now, we'll use the user quest data
        setQuestData({
          quest: null, // Would be loaded from Firestore
          userQuest
        });
      } catch (error) {
        console.error('Error loading quest details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestDetails();
  }, [questId, userQuest]);

  // Calculate time remaining
  const timeRemaining = userQuest ? {
    days: 0,
    hours: 0,
    minutes: 0,
    isExpired: false
  } : null;

  if (userQuest && userQuest.progress.status === 'active') {
    const now = Date.now();
    const startTime = userQuest.progress.startedAt.toDate().getTime();
    const duration = userQuest.metadata.estimatedDuration * 60 * 60 * 1000; // Convert to milliseconds
    const endTime = startTime + duration;
    const remaining = endTime - now;

    if (remaining > 0) {
      timeRemaining!.days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      timeRemaining!.hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining!.minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    } else {
      timeRemaining!.isExpired = true;
    }
  }

  return {
    quest: questData.quest,
    userQuest,
    timeRemaining,
    loading,
    isActive: userQuest?.progress.status === 'active',
    isCompleted: userQuest?.progress.status === 'completed',
    progress: userQuest?.progress.percentage || 0
  };
}

/**
 * Hook for quest completion celebrations and rewards
 */
export function useQuestRewards() {
  const { user } = useAuth();
  const [recentRewards, setRecentRewards] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Set up listener for quest completions
    const unsubscribe = questService.onProgressChanged(user.uid, (data) => {
      // Check if there's a new completion
      if (data && typeof data === 'object' && 'userQuest' in data && 'rewards' in data) {
        setRecentRewards(prev => [data.rewards, ...prev.slice(0, 4)]); // Keep last 5
        setShowCelebration(true);
        
        // Auto-hide celebration after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      }
    });

    return unsubscribe;
  }, [user]);

  const hideCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return {
    recentRewards,
    showCelebration,
    hideCelebration
  };
}

/**
 * Hook for quest recommendations based on user behavior
 */
export function useQuestRecommendations() {
  const { user } = useAuth();
  const { availableQuests, userQuests } = useQuests();
  const [recommendations, setRecommendations] = useState<Quest[]>([]);

  useEffect(() => {
    if (!user || !availableQuests.length) return;

    // Simple recommendation logic
    const userLevel = user.profile?.gamification.level || 1;
    const completedQuests = userQuests.filter(uq => uq.progress.status === 'completed');
    const completedDifficulties = completedQuests.map(uq => uq.metadata.difficulty);

    // Recommend quests based on difficulty progression
    const recommended = availableQuests
      .filter(quest => {
        // Filter by appropriate difficulty
        const questDifficulty = quest.definition.difficulty;
        
        if (userLevel <= 2) return questDifficulty === 'easy';
        if (userLevel <= 5) return ['easy', 'medium'].includes(questDifficulty);
        if (userLevel <= 10) return ['medium', 'hard'].includes(questDifficulty);
        return true; // All difficulties for high-level users
      })
      .sort((a, b) => {
        // Prioritize by completion rate and user engagement (mock data)
        return Math.random() - 0.5; // Random for now
      })
      .slice(0, 3);

    setRecommendations(recommended);
  }, [user, availableQuests, userQuests]);

  return {
    recommendations
  };
}

/**
 * Hook for quest statistics and analytics
 */
export function useQuestStats() {
  const { userQuests, completedQuests, activeQuests } = useQuests();
  const { user } = useAuth();

  const stats = {
    // User statistics
    totalQuestsStarted: userQuests.length,
    totalQuestsCompleted: completedQuests.length,
    totalActiveQuests: activeQuests.length,
    completionRate: userQuests.length > 0 
      ? (completedQuests.length / userQuests.length) * 100 
      : 0,
    
    // Points and rewards
    totalPointsEarned: completedQuests.reduce((sum, uq) => sum + (uq.rewards.pointsEarned || 0), 0),
    totalBadgesEarned: completedQuests.reduce((badges, uq) => {
      return [...badges, ...uq.rewards.badgesEarned];
    }, [] as string[]),
    totalAchievementsUnlocked: completedQuests.reduce((achievements, uq) => {
      return [...achievements, ...uq.rewards.achievementsUnlocked];
    }, [] as string[]),

    // Progress statistics
    averageProgress: activeQuests.length > 0 
      ? activeQuests.reduce((sum, uq) => sum + uq.progress.percentage, 0) / activeQuests.length 
      : 0,
    
    // Difficulty breakdown
    difficultyBreakdown: {
      easy: userQuests.filter(uq => uq.metadata.difficulty === 'easy').length,
      medium: userQuests.filter(uq => uq.metadata.difficulty === 'medium').length,
      hard: userQuests.filter(uq => uq.metadata.difficulty === 'hard').length,
      expert: userQuests.filter(uq => uq.metadata.difficulty === 'expert').length
    },

    // Current streak
    currentStreak: user?.profile?.gamification.streak.current || 0,
    longestStreak: user?.profile?.gamification.streak.longest || 0,

    // Level and experience
    currentLevel: user?.profile?.gamification.level || 1,
    currentPoints: user?.profile?.gamification.points || 0,
    totalPoints: user?.profile?.gamification.totalPoints || 0
  };

  return stats;
}

/**
 * Hook for quest filtering and sorting
 */
export function useQuestFilters() {
  const { availableQuests } = useQuests();
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    duration: 'all',
    sortBy: 'difficulty'
  });

  const filteredQuests = availableQuests.filter(quest => {
    if (filters.difficulty !== 'all' && quest.definition.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.category !== 'all' && quest.definition.category !== filters.category) {
      return false;
    }
    if (filters.duration !== 'all') {
      const duration = quest.definition.duration;
      if (filters.duration === 'short' && duration > 24) return false;
      if (filters.duration === 'medium' && (duration <= 24 || duration > 168)) return false;
      if (filters.duration === 'long' && duration <= 168) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
        return difficultyOrder[a.definition.difficulty] - difficultyOrder[b.definition.difficulty];
      case 'duration':
        return a.definition.duration - b.definition.duration;
      case 'points':
        return b.rewards.points - a.rewards.points;
      default:
        return 0;
    }
  });

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    filteredQuests,
    filters,
    updateFilters
  };
}

export default useQuests;