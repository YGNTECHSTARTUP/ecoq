'use client';

import { gamingPointsCalculator, GAMING_LEVELS, type GamingLevel } from './gaming-points-system';
import { enhancedQuestSystem } from './enhanced-quest-system';
import { communityGamingSystem } from './community-gaming-system';

// Analytics Types
export interface GamingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  actionsPerformed: GamingAction[];
  pointsEarned: number;
  questsCompleted: number;
  achievementsUnlocked: string[];
  energySaved: number; // kWh
  efficiencyImprovement: number; // percentage
}

export interface GamingAction {
  id: string;
  type: 'quest_accepted' | 'quest_completed' | 'appliance_toggled' | 'challenge_joined' | 'achievement_unlocked' | 'level_up' | 'community_interaction';
  timestamp: Date;
  details: { [key: string]: any };
  pointsEarned: number;
  energyImpact: number; // kWh saved/consumed
}

export interface UserStreak {
  type: 'daily_login' | 'energy_saving' | 'quest_completion' | 'efficiency_target';
  current: number;
  longest: number;
  lastUpdated: Date;
  isActive: boolean;
  multiplier: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'energy' | 'social' | 'achievement' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockedAt?: Date;
  progress: number; // 0-100
  requirements: BadgeRequirement[];
}

export interface BadgeRequirement {
  type: 'points' | 'quests' | 'streak' | 'energy_saved' | 'efficiency' | 'social' | 'special';
  value: number;
  description: string;
  currentProgress: number;
  isCompleted: boolean;
}

export interface UserProgressionData {
  userId: string;
  currentLevel: GamingLevel;
  totalPoints: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
  
  // Statistics
  stats: UserGameStats;
  
  // Streaks
  streaks: { [key: string]: UserStreak };
  
  // Badges and Achievements
  badges: Badge[];
  unlockedBadges: Badge[];
  
  // Gaming Sessions
  sessions: GamingSession[];
  totalPlayTime: number; // minutes
  
  // Performance Metrics
  performance: PerformanceMetrics;
  
  // Milestones
  milestones: Milestone[];
  
  // Predictions and Insights
  insights: GameInsight[];
}

export interface UserGameStats {
  // Energy & Efficiency
  totalEnergyySaved: number; // kWh
  averageEfficiency: number; // percentage
  co2Reduced: number; // kg
  moneySaved: number; // currency
  
  // Gaming Activity
  questsCompleted: number;
  questsActive: number;
  questSuccessRate: number; // percentage
  averageQuestTime: number; // hours
  
  // Social Activity
  communityInteractions: number;
  teamsJoined: number;
  challengesParticipated: number;
  challengeWins: number;
  helpedOthers: number;
  
  // Consistency
  daysActive: number;
  longestStreak: number;
  currentStreak: number;
  
  // Achievements
  achievementsUnlocked: number;
  badgesEarned: number;
  levelsProgressed: number;
}

export interface PerformanceMetrics {
  // Efficiency Trends
  efficiencyTrend: 'improving' | 'declining' | 'stable';
  efficiencyChange: number; // percentage change
  
  // Energy Saving Trends
  energySavingTrend: 'improving' | 'declining' | 'stable';
  energySavingRate: number; // kWh per day
  
  // Gaming Engagement
  engagementScore: number; // 0-100
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high';
  
  // Quest Performance
  questCompletionRate: number; // percentage
  averageQuestDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Social Performance
  communityRank: number;
  socialScore: number; // 0-100
  leadershipScore: number; // 0-100
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  category: 'energy' | 'gaming' | 'social' | 'achievement';
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward: {
    type: 'points' | 'badge' | 'title' | 'unlock';
    value: number | string;
    description: string;
  };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameInsight {
  id: string;
  type: 'tip' | 'achievement_opportunity' | 'efficiency_suggestion' | 'social_opportunity' | 'milestone_progress';
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'energy' | 'gaming' | 'social';
  createdAt: Date;
  expiresAt?: Date;
  icon: string;
  data?: { [key: string]: any };
}

// Predefined Badges
export const GAMING_BADGES: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  // Energy Badges
  {
    id: 'energy_saver_bronze',
    name: 'Energy Saver',
    description: 'Save 50 kWh of energy',
    icon: '🌱',
    category: 'energy',
    rarity: 'common',
    requirements: [
      { type: 'energy_saved', value: 50, description: 'Save 50 kWh', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'energy_saver_silver',
    name: 'Energy Guardian',
    description: 'Save 200 kWh of energy',
    icon: '⚡',
    category: 'energy',
    rarity: 'rare',
    requirements: [
      { type: 'energy_saved', value: 200, description: 'Save 200 kWh', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'energy_saver_gold',
    name: 'Energy Master',
    description: 'Save 500 kWh of energy',
    icon: '💚',
    category: 'energy',
    rarity: 'epic',
    requirements: [
      { type: 'energy_saved', value: 500, description: 'Save 500 kWh', currentProgress: 0, isCompleted: false }
    ]
  },
  
  // Achievement Badges
  {
    id: 'achiever_bronze',
    name: 'Achievement Hunter',
    description: 'Complete 10 quests',
    icon: '🏹',
    category: 'achievement',
    rarity: 'common',
    requirements: [
      { type: 'quests', value: 10, description: 'Complete 10 quests', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'achiever_silver',
    name: 'Quest Champion',
    description: 'Complete 50 quests',
    icon: '🏆',
    category: 'achievement',
    rarity: 'rare',
    requirements: [
      { type: 'quests', value: 50, description: 'Complete 50 quests', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'achiever_gold',
    name: 'Quest Legend',
    description: 'Complete 100 quests',
    icon: '👑',
    category: 'achievement',
    rarity: 'epic',
    requirements: [
      { type: 'quests', value: 100, description: 'Complete 100 quests', currentProgress: 0, isCompleted: false }
    ]
  },
  
  // Streak Badges
  {
    id: 'streak_7_days',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirements: [
      { type: 'streak', value: 7, description: '7-day streak', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'streak_30_days',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    category: 'streak',
    rarity: 'rare',
    requirements: [
      { type: 'streak', value: 30, description: '30-day streak', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'streak_100_days',
    name: 'Consistency King',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirements: [
      { type: 'streak', value: 100, description: '100-day streak', currentProgress: 0, isCompleted: false }
    ]
  },
  
  // Social Badges
  {
    id: 'social_helper',
    name: 'Community Helper',
    description: 'Help 10 community members',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    requirements: [
      { type: 'social', value: 10, description: 'Help 10 members', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'social_leader',
    name: 'Team Leader',
    description: 'Lead a successful team challenge',
    icon: '🎖️',
    category: 'social',
    rarity: 'rare',
    requirements: [
      { type: 'special', value: 1, description: 'Lead a team to victory', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'social_mentor',
    name: 'Community Mentor',
    description: 'Help 50 community members achieve their goals',
    icon: '🌟',
    category: 'social',
    rarity: 'epic',
    requirements: [
      { type: 'social', value: 50, description: 'Help 50 members', currentProgress: 0, isCompleted: false }
    ]
  },
  
  // Special Badges
  {
    id: 'first_quest',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '👶',
    category: 'special',
    rarity: 'common',
    requirements: [
      { type: 'special', value: 1, description: 'Complete first quest', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Achieve 95% efficiency rating',
    icon: '🎯',
    category: 'special',
    rarity: 'legendary',
    requirements: [
      { type: 'efficiency', value: 95, description: '95% efficiency', currentProgress: 0, isCompleted: false }
    ]
  },
  {
    id: 'carbon_neutral',
    name: 'Carbon Hero',
    description: 'Reduce 1000kg of CO2',
    icon: '🌍',
    category: 'special',
    rarity: 'mythic',
    requirements: [
      { type: 'special', value: 1000, description: 'Reduce 1000kg CO2', currentProgress: 0, isCompleted: false }
    ]
  }
];

// Predefined Milestones
export const GAMING_MILESTONES: Omit<Milestone, 'currentValue' | 'isCompleted' | 'completedAt'>[] = [
  {
    id: 'points_1000',
    name: 'First Thousand',
    description: 'Earn your first 1,000 points',
    category: 'gaming',
    targetValue: 1000,
    reward: { type: 'badge', value: 'first_thousand_badge', description: 'First Thousand Badge' },
    icon: '🎯',
    rarity: 'common'
  },
  {
    id: 'points_10000',
    name: 'Ten Thousand Club',
    description: 'Earn 10,000 points',
    category: 'gaming',
    targetValue: 10000,
    reward: { type: 'points', value: 1000, description: 'Bonus 1000 points' },
    icon: '💎',
    rarity: 'rare'
  },
  {
    id: 'energy_100_kwh',
    name: 'Century Saver',
    description: 'Save 100 kWh of energy',
    category: 'energy',
    targetValue: 100,
    reward: { type: 'title', value: 'Energy Century', description: 'Energy Century title' },
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'community_50_helps',
    name: 'Community Champion',
    description: 'Help 50 community members',
    category: 'social',
    targetValue: 50,
    reward: { type: 'unlock', value: 'mentor_privileges', description: 'Unlock mentor privileges' },
    icon: '🏆',
    rarity: 'epic'
  }
];

// Gaming Analytics System Class
export class GamingAnalyticsSystem {
  private userSessions: { [userId: string]: GamingSession[] } = {};
  private userProgressions: { [userId: string]: UserProgressionData } = {};
  private dailyStats: { [date: string]: { [userId: string]: any } } = {};

  constructor() {
    this.initializeSystem();
  }

  private initializeSystem() {
    // Initialize with sample data for demonstration
    this.generateSampleProgressionData('demo-user');
  }

  private generateSampleProgressionData(userId: string) {
    const totalPoints = 12750;
    const currentLevel = gamingPointsCalculator.getUserLevel(totalPoints);
    
    // Initialize user progression
    this.userProgressions[userId] = {
      userId,
      currentLevel,
      totalPoints,
      pointsThisWeek: 2150,
      pointsThisMonth: 8900,
      
      stats: {
        totalEnergyySaved: 145.6,
        averageEfficiency: 87.3,
        co2Reduced: 89.2,
        moneySaved: 3240,
        
        questsCompleted: 34,
        questsActive: 3,
        questSuccessRate: 89.5,
        averageQuestTime: 18.5,
        
        communityInteractions: 67,
        teamsJoined: 2,
        challengesParticipated: 5,
        challengeWins: 2,
        helpedOthers: 12,
        
        daysActive: 45,
        longestStreak: 23,
        currentStreak: 12,
        
        achievementsUnlocked: 8,
        badgesEarned: 12,
        levelsProgressed: 9
      },
      
      streaks: {
        daily_login: {
          type: 'daily_login',
          current: 12,
          longest: 23,
          lastUpdated: new Date(),
          isActive: true,
          multiplier: 1.2
        },
        energy_saving: {
          type: 'energy_saving',
          current: 8,
          longest: 15,
          lastUpdated: new Date(),
          isActive: true,
          multiplier: 1.1
        },
        quest_completion: {
          type: 'quest_completion',
          current: 5,
          longest: 11,
          lastUpdated: new Date(),
          isActive: true,
          multiplier: 1.05
        }
      },
      
      badges: GAMING_BADGES.map(badge => ({
        ...badge,
        progress: Math.random() * 100,
        requirements: badge.requirements.map(req => ({
          ...req,
          currentProgress: Math.random() * req.value
        }))
      })),
      
      unlockedBadges: GAMING_BADGES.slice(0, 8).map(badge => ({
        ...badge,
        unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        progress: 100,
        requirements: badge.requirements.map(req => ({
          ...req,
          currentProgress: req.value,
          isCompleted: true
        }))
      })),
      
      sessions: this.generateSampleSessions(userId),
      totalPlayTime: 1247, // minutes
      
      performance: {
        efficiencyTrend: 'improving',
        efficiencyChange: 12.5,
        energySavingTrend: 'improving',
        energySavingRate: 3.2,
        engagementScore: 87,
        activityLevel: 'high',
        questCompletionRate: 89.5,
        averageQuestDifficulty: 'medium',
        communityRank: 23,
        socialScore: 78,
        leadershipScore: 65
      },
      
      milestones: GAMING_MILESTONES.map(milestone => ({
        ...milestone,
        currentValue: Math.random() * milestone.targetValue,
        isCompleted: Math.random() > 0.7,
        completedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined
      })),
      
      insights: this.generateInsights(userId)
    };
  }

  private generateSampleSessions(userId: string): GamingSession[] {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `session_${userId}_${i}`,
      userId,
      startTime: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000),
      duration: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
      actionsPerformed: [],
      pointsEarned: Math.floor(Math.random() * 500) + 50,
      questsCompleted: Math.floor(Math.random() * 3),
      achievementsUnlocked: [],
      energySaved: Math.random() * 5 + 1,
      efficiencyImprovement: Math.random() * 10 - 5
    }));
  }

  private generateInsights(userId: string): GameInsight[] {
    const insights: GameInsight[] = [
      {
        id: 'insight_efficiency_tip',
        type: 'tip',
        title: 'Peak Hour Optimization',
        description: 'You could save an additional 15% by shifting usage away from peak hours (6-10 AM, 5-9 PM).',
        actionable: true,
        actionText: 'View Peak Hour Guide',
        priority: 'high',
        category: 'energy',
        createdAt: new Date(),
        icon: '⚡'
      },
      {
        id: 'insight_achievement_opp',
        type: 'achievement_opportunity',
        title: 'Close to Week Warrior!',
        description: 'You\'re only 2 days away from earning the Week Warrior badge. Keep up your streak!',
        actionable: true,
        actionText: 'View Streak Progress',
        priority: 'medium',
        category: 'gaming',
        createdAt: new Date(),
        icon: '🔥'
      },
      {
        id: 'insight_social_opp',
        type: 'social_opportunity',
        title: 'Join a Team Challenge',
        description: 'The City Energy Championship is starting soon. Team up with other players for bigger rewards!',
        actionable: true,
        actionText: 'Browse Teams',
        priority: 'medium',
        category: 'social',
        createdAt: new Date(),
        icon: '🏆'
      },
      {
        id: 'insight_milestone_progress',
        type: 'milestone_progress',
        title: 'Almost at 10K Points!',
        description: 'You\'re 85% of the way to the Ten Thousand Club milestone. Only 1,250 points to go!',
        actionable: false,
        priority: 'low',
        category: 'gaming',
        createdAt: new Date(),
        icon: '💎'
      }
    ];

    return insights;
  }

  // Analytics Methods
  getUserProgression(userId: string): UserProgressionData | null {
    return this.userProgressions[userId] || null;
  }

  updateUserProgress(userId: string, action: GamingAction): void {
    if (!this.userProgressions[userId]) {
      this.generateSampleProgressionData(userId);
    }

    const progression = this.userProgressions[userId];
    
    // Update points
    progression.totalPoints += action.pointsEarned;
    progression.currentLevel = gamingPointsCalculator.getUserLevel(progression.totalPoints);
    
    // Update stats based on action
    switch (action.type) {
      case 'quest_completed':
        progression.stats.questsCompleted++;
        break;
      case 'achievement_unlocked':
        progression.stats.achievementsUnlocked++;
        break;
      case 'community_interaction':
        progression.stats.communityInteractions++;
        break;
    }

    // Update energy stats
    if (action.energyImpact > 0) {
      progression.stats.totalEnergyySaved += action.energyImpact;
      progression.stats.co2Reduced += action.energyImpact * 0.6; // Rough conversion
    }

    // Check for badge unlocks
    this.checkBadgeProgress(userId, action);
    
    // Update insights
    this.updateInsights(userId);
  }

  private checkBadgeProgress(userId: string, action: GamingAction): void {
    const progression = this.userProgressions[userId];
    
    progression.badges.forEach(badge => {
      badge.requirements.forEach(req => {
        switch (req.type) {
          case 'points':
            req.currentProgress = progression.totalPoints;
            break;
          case 'quests':
            req.currentProgress = progression.stats.questsCompleted;
            break;
          case 'energy_saved':
            req.currentProgress = progression.stats.totalEnergyySaved;
            break;
          case 'social':
            req.currentProgress = progression.stats.helpedOthers;
            break;
          case 'streak':
            req.currentProgress = Math.max(...Object.values(progression.streaks).map(s => s.current));
            break;
        }
        
        req.isCompleted = req.currentProgress >= req.value;
      });

      // Calculate overall badge progress
      const completedReqs = badge.requirements.filter(req => req.isCompleted).length;
      badge.progress = (completedReqs / badge.requirements.length) * 100;

      // Unlock badge if all requirements met and not already unlocked
      if (badge.progress === 100 && !progression.unlockedBadges.find(b => b.id === badge.id)) {
        badge.unlockedAt = new Date();
        progression.unlockedBadges.push({ ...badge });
        progression.stats.badgesEarned++;
      }
    });
  }

  private updateInsights(userId: string): void {
    const progression = this.userProgressions[userId];
    
    // Remove expired insights
    progression.insights = progression.insights.filter(insight => 
      !insight.expiresAt || insight.expiresAt > new Date()
    );

    // Add new insights based on current state
    const newInsights: GameInsight[] = [];

    // Streak insights
    Object.values(progression.streaks).forEach(streak => {
      if (streak.current >= 5 && streak.current < 7) {
        newInsights.push({
          id: `streak_insight_${streak.type}`,
          type: 'achievement_opportunity',
          title: 'Week Warrior in Sight!',
          description: `You're ${7 - streak.current} days away from the Week Warrior badge!`,
          actionable: false,
          priority: 'medium',
          category: 'gaming',
          createdAt: new Date(),
          icon: '🔥'
        });
      }
    });

    // Efficiency insights
    if (progression.stats.averageEfficiency < 80) {
      newInsights.push({
        id: 'efficiency_improvement',
        type: 'efficiency_suggestion',
        title: 'Efficiency Boost Opportunity',
        description: 'Your efficiency is below 80%. Focus on peak hour optimization for quick wins.',
        actionable: true,
        actionText: 'View Efficiency Tips',
        priority: 'high',
        category: 'energy',
        createdAt: new Date(),
        icon: '📈'
      });
    }

    // Add new insights (avoid duplicates)
    newInsights.forEach(newInsight => {
      if (!progression.insights.find(existing => existing.id === newInsight.id)) {
        progression.insights.push(newInsight);
      }
    });

    // Keep only the most recent 10 insights
    progression.insights = progression.insights
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }

  startSession(userId: string): string {
    const sessionId = `session_${userId}_${Date.now()}`;
    
    if (!this.userSessions[userId]) {
      this.userSessions[userId] = [];
    }

    const session: GamingSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      duration: 0,
      actionsPerformed: [],
      pointsEarned: 0,
      questsCompleted: 0,
      achievementsUnlocked: [],
      energySaved: 0,
      efficiencyImprovement: 0
    };

    this.userSessions[userId].push(session);
    return sessionId;
  }

  endSession(sessionId: string): GamingSession | null {
    for (const userId in this.userSessions) {
      const session = this.userSessions[userId].find(s => s.id === sessionId);
      if (session && !session.endTime) {
        session.endTime = new Date();
        session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000);
        return session;
      }
    }
    return null;
  }

  addActionToSession(sessionId: string, action: GamingAction): void {
    for (const userId in this.userSessions) {
      const session = this.userSessions[userId].find(s => s.id === sessionId);
      if (session) {
        session.actionsPerformed.push(action);
        session.pointsEarned += action.pointsEarned;
        session.energySaved += Math.max(0, action.energyImpact);
        
        if (action.type === 'quest_completed') {
          session.questsCompleted++;
        }
        
        // Update user progression
        this.updateUserProgress(userId, action);
        break;
      }
    }
  }

  // Analytics Queries
  getEngagementTrends(userId: string, days: number = 30): {
    dates: string[];
    sessions: number[];
    points: number[];
    quests: number[];
  } {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const dates: string[] = [];
    const sessions: number[] = [];
    const points: number[] = [];
    const quests: number[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
      
      // Simulate data - in real app, this would query actual data
      sessions.push(Math.floor(Math.random() * 5) + 1);
      points.push(Math.floor(Math.random() * 500) + 100);
      quests.push(Math.floor(Math.random() * 3));
    }

    return { dates, sessions, points, quests };
  }

  getPerformanceComparison(userId: string): {
    userStats: UserGameStats;
    averageStats: UserGameStats;
    percentile: number;
  } {
    const userProgression = this.getUserProgression(userId);
    if (!userProgression) {
      throw new Error('User not found');
    }

    // Simulate average stats - in real app, this would be calculated from all users
    const averageStats: UserGameStats = {
      totalEnergyySaved: 89.3,
      averageEfficiency: 76.2,
      co2Reduced: 54.7,
      moneySaved: 1980,
      questsCompleted: 23,
      questsActive: 2,
      questSuccessRate: 74.5,
      averageQuestTime: 22.1,
      communityInteractions: 34,
      teamsJoined: 1,
      challengesParticipated: 2,
      challengeWins: 0,
      helpedOthers: 5,
      daysActive: 28,
      longestStreak: 14,
      currentStreak: 6,
      achievementsUnlocked: 5,
      badgesEarned: 7,
      levelsProgressed: 5
    };

    // Calculate percentile based on total points (simplified)
    const percentile = Math.min(95, Math.max(5, 
      50 + (userProgression.totalPoints - 8000) / 1000 * 10
    ));

    return {
      userStats: userProgression.stats,
      averageStats,
      percentile
    };
  }

  // Leaderboards with analytics
  getDetailedLeaderboard(type: 'points' | 'energy' | 'efficiency' | 'social' = 'points', period: 'week' | 'month' | 'all' = 'all') {
    // This would typically query a database
    // For now, return sample data with the requesting user included
    
    const entries = Array.from({ length: 20 }, (_, i) => ({
      userId: i === 10 ? 'demo-user' : `user_${i}`,
      username: i === 10 ? 'You' : `Player${i + 1}`,
      rank: i + 1,
      value: Math.floor(Math.random() * 10000) + 5000,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.floor(Math.random() * 500) + 100,
      level: Math.floor(Math.random() * 20) + 5,
      badges: Math.floor(Math.random() * 15) + 3,
      isCurrentUser: i === 10
    }));

    return {
      type,
      period,
      entries,
      userRank: 11,
      totalParticipants: 1247
    };
  }
}

// Export singleton instance
export const gamingAnalyticsSystem = new GamingAnalyticsSystem();
