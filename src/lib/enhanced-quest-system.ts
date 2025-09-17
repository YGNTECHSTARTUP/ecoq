'use client';

import { gamingPointsCalculator, type Achievement } from './gaming-points-system';

// Quest Types and Categories
export type QuestType = 'daily' | 'weekly' | 'monthly' | 'special' | 'challenge' | 'community';
export type QuestCategory = 'energy_saving' | 'efficiency' | 'behavioral' | 'community' | 'achievement';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'expired' | 'failed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  type: QuestType;
  difficulty: QuestDifficulty;
  
  // Objectives and Progress
  objectives: QuestObjective[];
  currentProgress: number;
  totalRequired: number;
  
  // Rewards
  baseReward: number;
  bonusRewards: QuestReward[];
  
  // Timing
  startDate: Date;
  endDate: Date;
  duration: number; // in hours
  
  // Status and Meta
  status: QuestStatus;
  isRepeatable: boolean;
  maxAttempts: number;
  currentAttempts: number;
  
  // Requirements
  levelRequirement: number;
  prerequisites: string[]; // Quest IDs that must be completed first
  
  // Visual
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // Tracking
  createdAt: Date;
  completedAt?: Date;
  playersCompleted: number;
  successRate: number; // percentage
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'reduce_consumption' | 'save_energy' | 'optimize_appliance' | 'community_action' | 'streak' | 'achievement';
  target: number;
  current: number;
  isCompleted: boolean;
  unit?: string; // kWh, W, days, etc.
}

export interface QuestReward {
  type: 'points' | 'badge' | 'title' | 'item' | 'unlock';
  value: number | string;
  description: string;
  icon?: string;
}

// Quest Templates for Generation
export interface QuestTemplate {
  id: string;
  titleTemplate: string;
  descriptionTemplate: string;
  category: QuestCategory;
  type: QuestType;
  difficulty: QuestDifficulty;
  baseReward: number;
  duration: number;
  objectives: Omit<QuestObjective, 'id' | 'current' | 'isCompleted'>[];
  requirements: {
    levelRequirement: number;
    prerequisites?: string[];
  };
  visual: {
    icon: string;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

// Predefined Quest Templates
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Daily Quests
  {
    id: 'daily_energy_saver',
    titleTemplate: 'Daily Energy Saver',
    descriptionTemplate: 'Reduce your energy consumption by {target}W for the day',
    category: 'energy_saving',
    type: 'daily',
    difficulty: 'easy',
    baseReward: 100,
    duration: 24,
    objectives: [
      {
        description: 'Reduce consumption by {target}W',
        type: 'reduce_consumption',
        target: 200,
        unit: 'W'
      }
    ],
    requirements: { levelRequirement: 1 },
    visual: { icon: '💡', color: '#22c55e', rarity: 'common' }
  },
  
  {
    id: 'daily_appliance_optimizer',
    titleTemplate: 'Appliance Optimizer',
    descriptionTemplate: 'Turn off {target} appliances during peak hours',
    category: 'behavioral',
    type: 'daily',
    difficulty: 'medium',
    baseReward: 150,
    duration: 24,
    objectives: [
      {
        description: 'Turn off appliances during peak hours',
        type: 'optimize_appliance',
        target: 3,
        unit: 'appliances'
      }
    ],
    requirements: { levelRequirement: 3 },
    visual: { icon: '🏠', color: '#3b82f6', rarity: 'common' }
  },

  // Weekly Quests
  {
    id: 'weekly_efficiency_master',
    titleTemplate: 'Efficiency Master',
    descriptionTemplate: 'Maintain 85% efficiency rating for the entire week',
    category: 'efficiency',
    type: 'weekly',
    difficulty: 'hard',
    baseReward: 800,
    duration: 168, // 7 days
    objectives: [
      {
        description: 'Maintain 85% efficiency rating',
        type: 'achievement',
        target: 85,
        unit: '%'
      }
    ],
    requirements: { levelRequirement: 10 },
    visual: { icon: '🎯', color: '#f59e0b', rarity: 'rare' }
  },

  {
    id: 'weekly_streak_warrior',
    titleTemplate: 'Streak Warrior',
    descriptionTemplate: 'Achieve a 7-day energy saving streak',
    category: 'behavioral',
    type: 'weekly',
    difficulty: 'medium',
    baseReward: 500,
    duration: 168,
    objectives: [
      {
        description: 'Maintain energy saving streak',
        type: 'streak',
        target: 7,
        unit: 'days'
      }
    ],
    requirements: { levelRequirement: 5 },
    visual: { icon: '⚔️', color: '#8b5cf6', rarity: 'rare' }
  },

  // Monthly Quests
  {
    id: 'monthly_sustainability_champion',
    titleTemplate: 'Sustainability Champion',
    descriptionTemplate: 'Save 100 kWh over the month through smart energy practices',
    category: 'energy_saving',
    type: 'monthly',
    difficulty: 'expert',
    baseReward: 2000,
    duration: 720, // 30 days
    objectives: [
      {
        description: 'Save energy through smart practices',
        type: 'save_energy',
        target: 100,
        unit: 'kWh'
      }
    ],
    requirements: { levelRequirement: 15 },
    visual: { icon: '🏆', color: '#ec4899', rarity: 'epic' }
  },

  // Community Quests
  {
    id: 'community_helper',
    titleTemplate: 'Community Helper',
    descriptionTemplate: 'Help {target} community members with their energy goals',
    category: 'community',
    type: 'weekly',
    difficulty: 'medium',
    baseReward: 300,
    duration: 168,
    objectives: [
      {
        description: 'Help community members',
        type: 'community_action',
        target: 5,
        unit: 'members'
      }
    ],
    requirements: { levelRequirement: 8 },
    visual: { icon: '🤝', color: '#06b6d4', rarity: 'rare' }
  },

  // Special Challenge Quests
  {
    id: 'challenge_peak_hour_master',
    titleTemplate: 'Peak Hour Master',
    descriptionTemplate: 'Achieve zero energy waste during all peak hours for 3 consecutive days',
    category: 'behavioral',
    type: 'challenge',
    difficulty: 'expert',
    baseReward: 1500,
    duration: 72,
    objectives: [
      {
        description: 'Zero waste during peak hours',
        type: 'optimize_appliance',
        target: 3,
        unit: 'days'
      }
    ],
    requirements: { 
      levelRequirement: 20,
      prerequisites: ['weekly_streak_warrior']
    },
    visual: { icon: '⚡', color: '#eab308', rarity: 'legendary' }
  }
];

// Leaderboard System
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  questsCompleted: number;
  currentStreak: number;
  achievements: Achievement[];
  lastActive: Date;
  rank: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface Leaderboard {
  type: 'global' | 'weekly' | 'monthly' | 'friends';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  totalPlayers: number;
  userRank: number;
}

// Quest Generation Engine
export class EnhancedQuestSystem {
  private activeQuests: Quest[] = [];
  private completedQuests: Quest[] = [];
  private availableQuests: Quest[] = [];
  private questTemplates: QuestTemplate[] = QUEST_TEMPLATES;
  private userLevel: number = 1;
  private userPoints: number = 0;

  constructor() {
    this.generateInitialQuests();
  }

  // Generate quests based on user level and progress
  generateQuestsForUser(userLevel: number, userPoints: number, completedQuestIds: string[] = []): Quest[] {
    this.userLevel = userLevel;
    this.userPoints = userPoints;

    const generatedQuests: Quest[] = [];
    const now = new Date();

    // Generate daily quests (2-3 per day)
    const dailyQuests = this.generateQuestsByType('daily', 2, completedQuestIds);
    generatedQuests.push(...dailyQuests);

    // Generate weekly quests (1-2 per week)
    const weeklyQuests = this.generateQuestsByType('weekly', 1, completedQuestIds);
    generatedQuests.push(...weeklyQuests);

    // Generate monthly quests (1 per month)
    const monthlyQuests = this.generateQuestsByType('monthly', 1, completedQuestIds);
    generatedQuests.push(...monthlyQuests);

    // Generate special challenges based on user progress
    if (userLevel >= 10) {
      const challengeQuests = this.generateQuestsByType('challenge', 1, completedQuestIds);
      generatedQuests.push(...challengeQuests);
    }

    // Generate community quests if user level is sufficient
    if (userLevel >= 8) {
      const communityQuests = this.generateQuestsByType('community', 1, completedQuestIds);
      generatedQuests.push(...communityQuests);
    }

    return generatedQuests;
  }

  private generateQuestsByType(type: QuestType, count: number, completedQuestIds: string[]): Quest[] {
    const templates = this.questTemplates.filter(t => 
      t.type === type && 
      t.requirements.levelRequirement <= this.userLevel
    );

    const quests: Quest[] = [];
    const now = new Date();

    for (let i = 0; i < count && i < templates.length; i++) {
      const template = templates[i];
      
      // Skip if quest was recently completed (for non-repeatable quests)
      if (completedQuestIds.includes(template.id) && !this.isQuestRepeatable(template)) {
        continue;
      }

      const quest = this.generateQuestFromTemplate(template, now);
      quests.push(quest);
    }

    return quests;
  }

  private generateQuestFromTemplate(template: QuestTemplate, startDate: Date): Quest {
    const endDate = new Date(startDate.getTime() + (template.duration * 60 * 60 * 1000));
    
    return {
      id: `${template.id}_${Date.now()}`,
      title: template.titleTemplate.replace(/{(\w+)}/g, (match, key) => {
        // Replace template variables with actual values
        switch (key) {
          case 'target': return template.objectives[0]?.target.toString() || '1';
          default: return match;
        }
      }),
      description: template.descriptionTemplate.replace(/{(\w+)}/g, (match, key) => {
        switch (key) {
          case 'target': return template.objectives[0]?.target.toString() || '1';
          default: return match;
        }
      }),
      category: template.category,
      type: template.type,
      difficulty: template.difficulty,
      objectives: template.objectives.map((obj, index) => ({
        id: `obj_${index}`,
        description: obj.description.replace(/{(\w+)}/g, (match, key) => {
          switch (key) {
            case 'target': return obj.target.toString();
            default: return match;
          }
        }),
        type: obj.type,
        target: obj.target,
        current: 0,
        isCompleted: false,
        unit: obj.unit
      })),
      currentProgress: 0,
      totalRequired: template.objectives[0]?.target || 1,
      baseReward: this.calculateQuestReward(template),
      bonusRewards: this.generateBonusRewards(template),
      startDate,
      endDate,
      duration: template.duration,
      status: 'available',
      isRepeatable: this.isQuestRepeatable(template),
      maxAttempts: template.type === 'daily' ? 1 : template.type === 'weekly' ? 4 : 1,
      currentAttempts: 0,
      levelRequirement: template.requirements.levelRequirement,
      prerequisites: template.requirements.prerequisites || [],
      icon: template.visual.icon,
      color: template.visual.color,
      rarity: template.visual.rarity,
      createdAt: startDate,
      playersCompleted: Math.floor(Math.random() * 1000), // Simulated data
      successRate: Math.random() * 50 + 30 // 30-80% success rate
    };
  }

  private calculateQuestReward(template: QuestTemplate): number {
    const baseReward = template.baseReward;
    const difficultyMultiplier = gamingPointsCalculator['config'].multipliers.difficulty[template.difficulty];
    const levelBonus = Math.floor(this.userLevel * 10);
    
    return Math.round((baseReward + levelBonus) * difficultyMultiplier);
  }

  private generateBonusRewards(template: QuestTemplate): QuestReward[] {
    const bonusRewards: QuestReward[] = [];
    
    // Add bonus points for high difficulty
    if (template.difficulty === 'hard' || template.difficulty === 'expert') {
      bonusRewards.push({
        type: 'points',
        value: Math.round(template.baseReward * 0.5),
        description: 'Difficulty bonus',
        icon: '⭐'
      });
    }

    // Add special rewards for certain quest types
    if (template.type === 'challenge') {
      bonusRewards.push({
        type: 'badge',
        value: `challenge_${template.id}`,
        description: 'Challenge Conqueror Badge',
        icon: '🏆'
      });
    }

    if (template.visual.rarity === 'legendary') {
      bonusRewards.push({
        type: 'title',
        value: `Legend of ${template.titleTemplate}`,
        description: 'Legendary achievement title',
        icon: '👑'
      });
    }

    return bonusRewards;
  }

  private isQuestRepeatable(template: QuestTemplate): boolean {
    return template.type === 'daily' || template.type === 'weekly';
  }

  private generateInitialQuests(): void {
    const now = new Date();
    // Generate some sample quests for immediate play
    this.availableQuests = this.generateQuestsForUser(1, 0, []);
  }

  // Quest Management Methods
  acceptQuest(questId: string): boolean {
    const questIndex = this.availableQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return false;

    const quest = this.availableQuests[questIndex];
    quest.status = 'active';
    quest.startDate = new Date();
    
    this.activeQuests.push(quest);
    this.availableQuests.splice(questIndex, 1);
    
    return true;
  }

  updateQuestProgress(questId: string, objectiveId: string, progress: number): void {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(objective.target, objective.current + progress);
    objective.isCompleted = objective.current >= objective.target;

    // Update overall quest progress
    const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length;
    quest.currentProgress = (completedObjectives / quest.objectives.length) * 100;

    // Check if quest is completed
    if (quest.currentProgress >= 100) {
      this.completeQuest(questId);
    }
  }

  completeQuest(questId: string): QuestReward[] {
    const questIndex = this.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return [];

    const quest = this.activeQuests[questIndex];
    quest.status = 'completed';
    quest.completedAt = new Date();

    // Calculate final rewards
    const rewards: QuestReward[] = [
      {
        type: 'points',
        value: quest.baseReward,
        description: 'Quest completion reward',
        icon: '🎯'
      },
      ...quest.bonusRewards
    ];

    this.completedQuests.push(quest);
    this.activeQuests.splice(questIndex, 1);

    return rewards;
  }

  getActiveQuests(): Quest[] {
    return this.activeQuests;
  }

  getAvailableQuests(): Quest[] {
    return this.availableQuests;
  }

  getCompletedQuests(): Quest[] {
    return this.completedQuests;
  }

  // Leaderboard functionality
  generateLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global'): Leaderboard {
    // This would typically fetch from a database
    // For now, we'll generate sample data
    const sampleEntries: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
      userId: `user_${i + 1}`,
      username: `EcoWarrior${i + 1}`,
      totalPoints: Math.floor(Math.random() * 50000) + 1000,
      level: Math.floor(Math.random() * 25) + 1,
      questsCompleted: Math.floor(Math.random() * 100) + 5,
      currentStreak: Math.floor(Math.random() * 30),
      achievements: [],
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      rank: i + 1,
      weeklyPoints: Math.floor(Math.random() * 2000),
      monthlyPoints: Math.floor(Math.random() * 8000)
    }));

    // Sort based on type
    const sortedEntries = sampleEntries.sort((a, b) => {
      switch (type) {
        case 'weekly': return b.weeklyPoints - a.weeklyPoints;
        case 'monthly': return b.monthlyPoints - a.monthlyPoints;
        default: return b.totalPoints - a.totalPoints;
      }
    });

    // Update ranks
    sortedEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return {
      type,
      entries: sortedEntries.slice(0, 20), // Top 20
      lastUpdated: new Date(),
      totalPlayers: sampleEntries.length,
      userRank: Math.floor(Math.random() * 20) + 1
    };
  }

  // Get quest statistics
  getQuestStats(): {
    totalCompleted: number;
    totalActive: number;
    totalAvailable: number;
    averageSuccessRate: number;
    favoriteCategory: QuestCategory;
  } {
    const totalCompleted = this.completedQuests.length;
    const totalActive = this.activeQuests.length;
    const totalAvailable = this.availableQuests.length;
    
    const successRates = [...this.activeQuests, ...this.completedQuests].map(q => q.successRate);
    const averageSuccessRate = successRates.length > 0 
      ? successRates.reduce((a, b) => a + b, 0) / successRates.length 
      : 0;

    // Find favorite category (most completed quests)
    const categoryCount: Record<QuestCategory, number> = {
      energy_saving: 0,
      efficiency: 0,
      behavioral: 0,
      community: 0,
      achievement: 0
    };

    this.completedQuests.forEach(quest => {
      categoryCount[quest.category]++;
    });

    const favoriteCategory = Object.entries(categoryCount).reduce((a, b) => 
      categoryCount[a[0] as QuestCategory] > categoryCount[b[0] as QuestCategory] ? a : b
    )[0] as QuestCategory;

    return {
      totalCompleted,
      totalActive,
      totalAvailable,
      averageSuccessRate,
      favoriteCategory
    };
  }
}

// Export singleton instance
export const enhancedQuestSystem = new EnhancedQuestSystem();
