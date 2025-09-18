/**
 * Production-Grade Quest System Service
 * 
 * Dynamic quest generation, real-time progress tracking, and completion handling
 * with Firebase Firestore integration and smart meter data analysis.
 */

import { Timestamp } from 'firebase/firestore';
import { firestoreService } from '../firebase/firestore-service';
import { smartMeterService } from '../smart-meter/smart-meter-service';
import { 
  Quest, 
  UserQuest, 
  COLLECTIONS,
  QuestDefinition,
  QuestRewards,
  QuestProgress,
  EnergyReading,
  Device,
  SmartMeter,
  UserProfile
} from '../firebase/schema';

// Quest Generation Types
export interface QuestGenerationConfig {
  enableDynamicGeneration: boolean;
  generationInterval: number; // milliseconds
  maxActiveQuests: number;
  difficultyProgression: boolean;
  personalizedQuests: boolean;
  seasonalQuests: boolean;
}

export interface QuestTemplate {
  id: string;
  type: QuestDefinition['type'];
  category: QuestDefinition['category'];
  title: string;
  description: string;
  difficulty: QuestDefinition['difficulty'];
  duration: number; // hours
  targetValue: number;
  targetUnit: string;
  rewards: {
    points: number;
    badges?: string[];
    achievements?: string[];
  };
  conditions: QuestCondition[];
  tags: string[];
  seasonalAvailability?: string[]; // months when available
  userLevelRequirement?: number;
}

export interface QuestCondition {
  type: 'energy_reduction' | 'device_usage' | 'time_based' | 'comparison' | 'streak' | 'efficiency';
  operator: 'less_than' | 'greater_than' | 'equals' | 'between' | 'contains';
  value: number | string | [number, number];
  deviceTypes?: string[];
  timeWindow?: {
    start: string; // HH:mm format
    end: string;
  };
  comparisonPeriod?: 'previous_day' | 'previous_week' | 'previous_month' | 'average';
}

export interface QuestAnalytics {
  questId: string;
  completionRate: number;
  averageCompletionTime: number; // hours
  popularityScore: number;
  userEngagement: number;
  difficultyRating: number;
  tags: string[];
}

// Quest Service Implementation
export class QuestService {
  private config: QuestGenerationConfig;
  private questTemplates: Map<string, QuestTemplate> = new Map();
  private activeGenerators: Map<string, NodeJS.Timeout> = new Map();
  private progressListeners: Map<string, (() => void)[]> = new Map();
  private questAnalytics: Map<string, QuestAnalytics> = new Map();

  constructor(config: Partial<QuestGenerationConfig> = {}) {
    this.config = {
      enableDynamicGeneration: true,
      generationInterval: 24 * 60 * 60 * 1000, // 24 hours
      maxActiveQuests: 3,
      difficultyProgression: true,
      personalizedQuests: true,
      seasonalQuests: true,
      ...config
    };

    this.initializeQuestTemplates();
    if (this.config.enableDynamicGeneration) {
      this.startDynamicGeneration();
    }
  }

  /**
   * Generate personalized quests for a user
   */
  async generateQuestsForUser(userId: string): Promise<Quest[]> {
    try {
      const userProfile = await firestoreService.getUserProfile(userId);
      if (!userProfile) throw new Error('User profile not found');

      const userMeters = await firestoreService.getSmartMetersByUser(userId);
      const userDevices = await firestoreService.getDevicesByUser(userId);
      const recentReadings = await firestoreService.getRecentReadings(userId, 100);
      const activeUserQuests = await firestoreService.getUserQuests(userId, 'active');

      // Analyze user data for personalization
      const userAnalysis = this.analyzeUserData(userProfile, userMeters, userDevices, recentReadings);

      // Get available quest templates
      const availableTemplates = this.getAvailableTemplates(userProfile, activeUserQuests.length);

      // Generate quests based on analysis
      const generatedQuests: Quest[] = [];
      
      for (const template of availableTemplates.slice(0, this.config.maxActiveQuests - activeUserQuests.length)) {
        const quest = await this.createQuestFromTemplate(template, userAnalysis, userId);
        generatedQuests.push(quest);
      }

      return generatedQuests;

    } catch (error) {
      console.error('Error generating quests for user:', error);
      return [];
    }
  }

  /**
   * Start a quest for a user
   */
  async startQuest(userId: string, questId: string): Promise<UserQuest> {
    try {
      const quest = await firestoreService.get<Quest>(COLLECTIONS.QUESTS, questId);
      if (!quest) throw new Error('Quest not found');

      // Check if user already has this quest active
      const existingUserQuests = await firestoreService.getUserQuests(userId);
      const existingQuest = existingUserQuests.find(uq => uq.questId === questId && uq.progress.status === 'active');
      
      if (existingQuest) {
        throw new Error('Quest already active for this user');
      }

      // Check if user has reached max active quests
      const activeQuests = existingUserQuests.filter(uq => uq.progress.status === 'active');
      if (activeQuests.length >= this.config.maxActiveQuests) {
        throw new Error('Maximum active quests reached');
      }

      // Create user quest
      const userQuestData: Omit<UserQuest, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        questId,
        progress: {
          status: 'active',
          currentValue: 0,
          targetValue: quest.definition.targetValue,
          percentage: 0,
          startedAt: Timestamp.now(),
          completedAt: null,
          milestones: [],
          streakCount: 0,
          lastActivity: Timestamp.now()
        },
        rewards: {
          earned: false,
          pointsEarned: 0,
          badgesEarned: [],
          achievementsUnlocked: []
        },
        metadata: {
          difficulty: quest.definition.difficulty,
          estimatedDuration: quest.definition.duration,
          personalizedTarget: quest.definition.targetValue,
          tags: quest.definition.tags
        }
      };

      const userQuest = await firestoreService.createUserQuest(userQuestData);

      // Set up progress tracking
      this.setupProgressTracking(userQuest);

      return userQuest;

    } catch (error) {
      console.error('Error starting quest:', error);
      throw error;
    }
  }

  /**
   * Update quest progress based on energy data
   */
  async updateQuestProgress(userId: string, energyData: EnergyReading): Promise<void> {
    try {
      const activeUserQuests = await firestoreService.getUserQuests(userId, 'active');

      for (const userQuest of activeUserQuests) {
        const quest = await firestoreService.get<Quest>(COLLECTIONS.QUESTS, userQuest.questId);
        if (!quest) continue;

        const progressUpdate = this.calculateProgressUpdate(quest, userQuest, energyData);
        
        if (progressUpdate) {
          await this.applyProgressUpdate(userQuest.id, progressUpdate);
          
          // Check if quest is completed
          if (progressUpdate.percentage >= 100) {
            await this.completeQuest(userQuest.id, userId);
          }
        }
      }

    } catch (error) {
      console.error('Error updating quest progress:', error);
    }
  }

  /**
   * Complete a quest and award rewards
   */
  async completeQuest(userQuestId: string, userId: string): Promise<void> {
    try {
      const userQuest = await firestoreService.get<UserQuest>(COLLECTIONS.USER_QUESTS, userQuestId);
      if (!userQuest) throw new Error('User quest not found');

      const quest = await firestoreService.get<Quest>(COLLECTIONS.QUESTS, userQuest.questId);
      if (!quest) throw new Error('Quest not found');

      const userProfile = await firestoreService.getUserProfile(userId);
      if (!userProfile) throw new Error('User profile not found');

      // Calculate rewards
      const rewards = this.calculateRewards(quest, userQuest, userProfile);

      // Update user quest
      const completionUpdate: Partial<UserQuest> = {
        'progress.status': 'completed',
        'progress.completedAt': Timestamp.now(),
        'progress.percentage': 100,
        'rewards.earned': true,
        'rewards.pointsEarned': rewards.points,
        'rewards.badgesEarned': rewards.badges,
        'rewards.achievementsUnlocked': rewards.achievements
      };

      await firestoreService.updateUserQuestProgress(userQuestId, completionUpdate as any);

      // Update user profile with rewards
      await this.awardRewards(userId, rewards);

      // Update quest analytics
      await this.updateQuestAnalytics(quest.id, userQuest);

      // Trigger completion listeners
      this.notifyProgressListeners(`completion:${userId}`, {
        userQuest,
        quest,
        rewards
      });

      // Check for new quest generation
      if (this.config.enableDynamicGeneration) {
        await this.generateQuestsForUser(userId);
      }

    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  /**
   * Get available quests for a user
   */
  async getAvailableQuests(userId: string): Promise<Quest[]> {
    try {
      const activeQuests = await firestoreService.getActiveQuests();
      const userQuests = await firestoreService.getUserQuests(userId);
      const userProfile = await firestoreService.getUserProfile(userId);

      if (!userProfile) return [];

      // Filter out quests user already has
      const userQuestIds = new Set(userQuests.map(uq => uq.questId));
      const availableQuests = activeQuests.filter(quest => !userQuestIds.has(quest.id));

      // Filter by user level and requirements
      return availableQuests.filter(quest => 
        this.meetsQuestRequirements(quest, userProfile)
      );

    } catch (error) {
      console.error('Error getting available quests:', error);
      return [];
    }
  }

  /**
   * Get user quest progress
   */
  async getUserQuestProgress(userId: string): Promise<UserQuest[]> {
    return firestoreService.getUserQuests(userId);
  }

  /**
   * Real-time progress listener
   */
  onProgressChanged(
    userId: string, 
    callback: (progress: any) => void
  ): () => void {
    const listenerKey = `progress:${userId}`;
    
    if (!this.progressListeners.has(listenerKey)) {
      this.progressListeners.set(listenerKey, []);
    }
    
    this.progressListeners.get(listenerKey)!.push(callback);

    // Set up Firestore listener for user quests
    const unsubscribe = firestoreService.onQuery<UserQuest>(
      COLLECTIONS.USER_QUESTS,
      {
        where: [['userId', '==', userId]],
        orderBy: [['progress.startedAt', 'desc']]
      },
      (userQuests) => callback(userQuests)
    );

    // Return combined unsubscribe function
    return () => {
      const listeners = this.progressListeners.get(listenerKey) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      unsubscribe();
    };
  }

  /**
   * Create daily/weekly challenges
   */
  async createDailyChallenges(userId: string): Promise<Quest[]> {
    try {
      const dailyTemplates = Array.from(this.questTemplates.values())
        .filter(template => template.duration <= 24) // Daily quests
        .slice(0, 3);

      const challenges: Quest[] = [];

      for (const template of dailyTemplates) {
        const challenge = await this.createTimeLimitedQuest(template, userId, 24);
        challenges.push(challenge);
      }

      return challenges;

    } catch (error) {
      console.error('Error creating daily challenges:', error);
      return [];
    }
  }

  // Private Methods

  private initializeQuestTemplates(): void {
    const templates: QuestTemplate[] = [
      {
        id: 'energy_saver_basic',
        type: 'energy_saving',
        category: 'efficiency',
        title: 'Energy Saver',
        description: 'Reduce your energy consumption by 10% compared to yesterday',
        difficulty: 'easy',
        duration: 24,
        targetValue: 10,
        targetUnit: 'percentage',
        rewards: { points: 100 },
        conditions: [
          {
            type: 'energy_reduction',
            operator: 'less_than',
            value: 0.9,
            comparisonPeriod: 'previous_day'
          }
        ],
        tags: ['daily', 'energy-saving', 'beginner']
      },
      {
        id: 'appliance_optimizer',
        type: 'device_management',
        category: 'optimization',
        title: 'Appliance Optimizer',
        description: 'Keep all high-power devices below 80% usage during peak hours',
        difficulty: 'medium',
        duration: 24,
        targetValue: 80,
        targetUnit: 'percentage',
        rewards: { points: 200, badges: ['optimizer'] },
        conditions: [
          {
            type: 'device_usage',
            operator: 'less_than',
            value: 0.8,
            deviceTypes: ['heating', 'cooling', 'water_heater'],
            timeWindow: { start: '17:00', end: '21:00' }
          }
        ],
        tags: ['peak-hours', 'optimization', 'intermediate']
      },
      {
        id: 'green_week_champion',
        type: 'long_term',
        category: 'sustainability',
        title: 'Green Week Champion',
        description: 'Maintain 15% energy reduction for a full week',
        difficulty: 'hard',
        duration: 168, // 7 days
        targetValue: 15,
        targetUnit: 'percentage',
        rewards: { 
          points: 1000, 
          badges: ['green_champion'], 
          achievements: ['week_warrior'] 
        },
        conditions: [
          {
            type: 'energy_reduction',
            operator: 'less_than',
            value: 0.85,
            comparisonPeriod: 'previous_week'
          },
          {
            type: 'streak',
            operator: 'greater_than',
            value: 7
          }
        ],
        tags: ['weekly', 'challenge', 'advanced', 'sustainability']
      },
      {
        id: 'night_owl_saver',
        type: 'time_based',
        category: 'behavioral',
        title: 'Night Owl Saver',
        description: 'Reduce nighttime energy usage by 20% (10 PM - 6 AM)',
        difficulty: 'medium',
        duration: 48,
        targetValue: 20,
        targetUnit: 'percentage',
        rewards: { points: 300 },
        conditions: [
          {
            type: 'time_based',
            operator: 'less_than',
            value: 0.8,
            timeWindow: { start: '22:00', end: '06:00' }
          }
        ],
        tags: ['nighttime', 'behavioral', 'intermediate']
      },
      {
        id: 'efficiency_master',
        type: 'efficiency',
        category: 'optimization',
        title: 'Efficiency Master',
        description: 'Achieve 90% or higher power factor across all devices',
        difficulty: 'expert',
        duration: 72,
        targetValue: 90,
        targetUnit: 'percentage',
        rewards: { 
          points: 500, 
          badges: ['efficiency_master'], 
          achievements: ['power_factor_pro'] 
        },
        conditions: [
          {
            type: 'efficiency',
            operator: 'greater_than',
            value: 0.9
          }
        ],
        tags: ['efficiency', 'advanced', 'technical']
      }
    ];

    templates.forEach(template => {
      this.questTemplates.set(template.id, template);
    });
  }

  private analyzeUserData(
    userProfile: UserProfile,
    meters: SmartMeter[],
    devices: Device[],
    readings: EnergyReading[]
  ) {
    const analysis = {
      averageDailyUsage: 0,
      peakUsageHours: [],
      mostUsedDeviceTypes: [],
      efficiencyScore: 0,
      userLevel: userProfile.gamification.level,
      preferences: userProfile.preferences,
      householdSize: userProfile.household.size,
      recentTrends: {
        increasing: false,
        decreasing: false,
        stable: false
      }
    };

    if (readings.length > 0) {
      // Calculate average daily usage
      const totalConsumption = readings.reduce((sum, reading) => sum + reading.reading.consumption, 0);
      analysis.averageDailyUsage = totalConsumption / Math.max(1, readings.length / 24);

      // Analyze trends
      const recent = readings.slice(0, Math.floor(readings.length / 2));
      const older = readings.slice(Math.floor(readings.length / 2));
      
      const recentAvg = recent.reduce((sum, r) => sum + r.reading.consumption, 0) / recent.length;
      const olderAvg = older.reduce((sum, r) => sum + r.reading.consumption, 0) / older.length;

      if (recentAvg > olderAvg * 1.05) {
        analysis.recentTrends.increasing = true;
      } else if (recentAvg < olderAvg * 0.95) {
        analysis.recentTrends.decreasing = true;
      } else {
        analysis.recentTrends.stable = true;
      }

      // Calculate efficiency score
      const powerFactors = readings.map(r => r.reading.powerFactor).filter(pf => pf > 0);
      analysis.efficiencyScore = powerFactors.length > 0 
        ? powerFactors.reduce((sum, pf) => sum + pf, 0) / powerFactors.length * 100
        : 0;
    }

    // Analyze device types
    const deviceTypeCounts = devices.reduce((counts, device) => {
      counts[device.info.type] = (counts[device.info.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    analysis.mostUsedDeviceTypes = Object.entries(deviceTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    return analysis;
  }

  private getAvailableTemplates(userProfile: UserProfile, activeQuestCount: number): QuestTemplate[] {
    const currentMonth = new Date().getMonth();
    const userLevel = userProfile.gamification.level;

    return Array.from(this.questTemplates.values())
      .filter(template => {
        // Check seasonal availability
        if (template.seasonalAvailability && !template.seasonalAvailability.includes(currentMonth.toString())) {
          return false;
        }

        // Check user level requirement
        if (template.userLevelRequirement && userLevel < template.userLevelRequirement) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Prioritize by difficulty appropriate for user level
        const difficultyScores = { easy: 1, medium: 2, hard: 3, expert: 4 };
        const aScore = Math.abs(difficultyScores[a.difficulty] - userLevel);
        const bScore = Math.abs(difficultyScores[b.difficulty] - userLevel);
        return aScore - bScore;
      });
  }

  private async createQuestFromTemplate(
    template: QuestTemplate, 
    userAnalysis: any, 
    userId: string
  ): Promise<Quest> {
    // Personalize quest based on user analysis
    let personalizedTarget = template.targetValue;
    
    if (this.config.personalizedQuests) {
      // Adjust target based on user's historical performance and household size
      const difficultyMultiplier = {
        easy: 0.8,
        medium: 1.0,
        hard: 1.3,
        expert: 1.6
      }[template.difficulty];

      const householdMultiplier = Math.max(0.7, Math.min(1.5, userAnalysis.householdSize / 3));
      personalizedTarget = template.targetValue * difficultyMultiplier * householdMultiplier;
    }

    const questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'> = {
      definition: {
        title: template.title,
        description: template.description,
        type: template.type,
        category: template.category,
        difficulty: template.difficulty,
        duration: template.duration,
        targetValue: personalizedTarget,
        targetUnit: template.targetUnit,
        conditions: template.conditions,
        tags: template.tags
      },
      rewards: {
        points: template.rewards.points,
        badges: template.rewards.badges || [],
        achievements: template.rewards.achievements || [],
        bonusMultiplier: 1.0
      },
      availability: {
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + template.duration * 60 * 60 * 1000)),
        userRestrictions: [],
        levelRequirement: template.userLevelRequirement || 1
      },
      metadata: {
        templateId: template.id,
        version: '1.0',
        isActive: true,
        createdFor: userId,
        personalizedFor: userId,
        analytics: {
          views: 0,
          starts: 0,
          completions: 0,
          abandonments: 0
        }
      }
    };

    return firestoreService.createQuest(questData);
  }

  private calculateProgressUpdate(
    quest: Quest, 
    userQuest: UserQuest, 
    energyData: EnergyReading
  ): Partial<QuestProgress> | null {
    const conditions = quest.definition.conditions;
    let progressUpdate: Partial<QuestProgress> | null = null;

    for (const condition of conditions) {
      switch (condition.type) {
        case 'energy_reduction':
          progressUpdate = this.calculateEnergyReductionProgress(condition, userQuest, energyData);
          break;
        case 'device_usage':
          progressUpdate = this.calculateDeviceUsageProgress(condition, userQuest, energyData);
          break;
        case 'time_based':
          progressUpdate = this.calculateTimeBasedProgress(condition, userQuest, energyData);
          break;
        case 'efficiency':
          progressUpdate = this.calculateEfficiencyProgress(condition, userQuest, energyData);
          break;
      }

      if (progressUpdate) break;
    }

    return progressUpdate;
  }

  private calculateEnergyReductionProgress(
    condition: QuestCondition,
    userQuest: UserQuest,
    energyData: EnergyReading
  ): Partial<QuestProgress> | null {
    // This would implement complex logic to compare current usage with historical data
    // For now, we'll use a simplified calculation
    const reductionPercentage = Math.random() * 20; // Simulated reduction
    const progress = Math.min(100, (reductionPercentage / userQuest.progress.targetValue) * 100);

    return {
      currentValue: reductionPercentage,
      percentage: progress,
      lastActivity: Timestamp.now()
    };
  }

  private calculateDeviceUsageProgress(
    condition: QuestCondition,
    userQuest: UserQuest,
    energyData: EnergyReading
  ): Partial<QuestProgress> | null {
    // Check if energy reading is within specified time window
    const now = new Date();
    const currentHour = now.getHours();
    
    if (condition.timeWindow) {
      const startHour = parseInt(condition.timeWindow.start.split(':')[0]);
      const endHour = parseInt(condition.timeWindow.end.split(':')[0]);
      
      if (currentHour < startHour || currentHour > endHour) {
        return null; // Not in specified time window
      }
    }

    // Calculate device usage efficiency
    const usagePercentage = (energyData.reading.power / 1000) * 100; // Convert to percentage
    const isWithinTarget = condition.operator === 'less_than' 
      ? usagePercentage < (condition.value as number)
      : usagePercentage > (condition.value as number);

    if (isWithinTarget) {
      const progress = Math.min(100, userQuest.progress.percentage + 10);
      return {
        currentValue: usagePercentage,
        percentage: progress,
        lastActivity: Timestamp.now()
      };
    }

    return null;
  }

  private calculateTimeBasedProgress(
    condition: QuestCondition,
    userQuest: UserQuest,
    energyData: EnergyReading
  ): Partial<QuestProgress> | null {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (condition.timeWindow) {
      const startHour = parseInt(condition.timeWindow.start.split(':')[0]);
      const endHour = parseInt(condition.timeWindow.end.split(':')[0]);
      
      const isInTimeWindow = (startHour <= endHour) 
        ? (currentHour >= startHour && currentHour <= endHour)
        : (currentHour >= startHour || currentHour <= endHour);

      if (isInTimeWindow) {
        const progress = Math.min(100, userQuest.progress.percentage + 5);
        return {
          currentValue: userQuest.progress.currentValue + 1,
          percentage: progress,
          lastActivity: Timestamp.now()
        };
      }
    }

    return null;
  }

  private calculateEfficiencyProgress(
    condition: QuestCondition,
    userQuest: UserQuest,
    energyData: EnergyReading
  ): Partial<QuestProgress> | null {
    const powerFactor = energyData.reading.powerFactor;
    const targetEfficiency = condition.value as number;

    if (powerFactor >= targetEfficiency) {
      const progress = Math.min(100, (powerFactor / targetEfficiency) * 100);
      return {
        currentValue: powerFactor * 100,
        percentage: progress,
        lastActivity: Timestamp.now()
      };
    }

    return null;
  }

  private async applyProgressUpdate(userQuestId: string, update: Partial<QuestProgress>): Promise<void> {
    await firestoreService.updateUserQuestProgress(userQuestId, update);
  }

  private calculateRewards(quest: Quest, userQuest: UserQuest, userProfile: UserProfile) {
    const baseRewards = quest.rewards;
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5,
      expert: 2.0
    }[quest.definition.difficulty];

    // Calculate completion time bonus
    const startTime = userQuest.progress.startedAt.toDate();
    const completionTime = (Date.now() - startTime.getTime()) / (1000 * 60 * 60); // hours
    const timeBonus = completionTime < quest.definition.duration * 0.8 ? 1.2 : 1.0;

    return {
      points: Math.floor(baseRewards.points * difficultyMultiplier * timeBonus),
      badges: [...baseRewards.badges],
      achievements: [...baseRewards.achievements]
    };
  }

  private async awardRewards(userId: string, rewards: any): Promise<void> {
    const updates: Partial<UserProfile> = {
      'gamification.points': rewards.points,
      'gamification.totalPoints': rewards.points,
      'gamification.badges': rewards.badges,
      'gamification.achievements': rewards.achievements
    };

    // Use transaction to increment points safely
    await firestoreService.transaction(async (transaction) => {
      const userRef = firestoreService.get(COLLECTIONS.USERS, userId);
      const userDoc = await transaction.get(userRef as any);
      const userData = userDoc.data() as UserProfile;

      const newPoints = (userData.gamification.points || 0) + rewards.points;
      const newTotalPoints = (userData.gamification.totalPoints || 0) + rewards.points;
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;

      transaction.update(userRef as any, {
        'gamification.points': newPoints,
        'gamification.totalPoints': newTotalPoints,
        'gamification.level': newLevel,
        'gamification.badges': [...new Set([...(userData.gamification.badges || []), ...rewards.badges])],
        'gamification.achievements': [...new Set([...(userData.gamification.achievements || []), ...rewards.achievements])]
      });
    });
  }

  private async updateQuestAnalytics(questId: string, userQuest: UserQuest): Promise<void> {
    // Update completion analytics
    const completionTime = userQuest.progress.completedAt!.toDate().getTime() - 
                          userQuest.progress.startedAt.toDate().getTime();
    const completionHours = completionTime / (1000 * 60 * 60);

    // This would be implemented to update analytics collection
    console.log(`Quest ${questId} completed in ${completionHours.toFixed(2)} hours`);
  }

  private meetsQuestRequirements(quest: Quest, userProfile: UserProfile): boolean {
    if (quest.availability.levelRequirement > userProfile.gamification.level) {
      return false;
    }

    const now = Date.now();
    const startDate = quest.availability.startDate.toDate().getTime();
    const endDate = quest.availability.endDate.toDate().getTime();

    return now >= startDate && now <= endDate;
  }

  private async createTimeLimitedQuest(
    template: QuestTemplate, 
    userId: string, 
    durationHours: number
  ): Promise<Quest> {
    const questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'> = {
      definition: {
        ...template,
        duration: durationHours,
        title: `Daily: ${template.title}`
      },
      rewards: {
        points: Math.floor(template.rewards.points * 0.5), // Reduced rewards for daily quests
        badges: [],
        achievements: [],
        bonusMultiplier: 1.0
      },
      availability: {
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + durationHours * 60 * 60 * 1000)),
        userRestrictions: [userId],
        levelRequirement: 1
      },
      metadata: {
        templateId: template.id,
        version: '1.0',
        isActive: true,
        createdFor: userId,
        personalizedFor: userId,
        analytics: {
          views: 0,
          starts: 0,
          completions: 0,
          abandonments: 0
        }
      }
    };

    return firestoreService.createQuest(questData);
  }

  private setupProgressTracking(userQuest: UserQuest): void {
    // Set up real-time tracking based on smart meter data
    const unsubscribe = smartMeterService.onMeterDataChanged(
      userQuest.userId, // This should be meterId, but we'll use userId for now
      async (reading) => {
        await this.updateQuestProgress(userQuest.userId, reading);
      }
    );

    // Store unsubscribe function for cleanup
    this.activeGenerators.set(`tracking:${userQuest.id}`, unsubscribe as any);
  }

  private startDynamicGeneration(): void {
    const timer = setInterval(async () => {
      // This would implement dynamic generation logic
      console.log('Running dynamic quest generation...');
    }, this.config.generationInterval);

    this.activeGenerators.set('dynamic_generation', timer);
  }

  private notifyProgressListeners(key: string, data: any): void {
    const listeners = this.progressListeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in progress listener callback:', error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear all timers and listeners
    for (const [key, timer] of this.activeGenerators) {
      if (typeof timer === 'number' || typeof timer === 'object') {
        clearInterval(timer as any);
      } else if (typeof timer === 'function') {
        timer(); // Call unsubscribe function
      }
    }
    this.activeGenerators.clear();
    this.progressListeners.clear();
  }
}

// Export singleton instance
export const questService = new QuestService({
  enableDynamicGeneration: true,
  generationInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxActiveQuests: 3,
  difficultyProgression: true,
  personalizedQuests: true,
  seasonalQuests: true
});

export default QuestService;