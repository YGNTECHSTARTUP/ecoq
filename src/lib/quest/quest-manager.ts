/**
 * Quest Manager
 * 
 * Orchestrates the quest system with smart meter data integration,
 * manages quest lifecycle, and handles real-time progress updates.
 */

import { questService } from './quest-service';
import { smartMeterService } from '../smart-meter/smart-meter-service';
import { authService } from '../auth/auth-service';
import { firestoreService } from '../firebase/firestore-service';
import { EnergyReading, UserQuest, Quest } from '../firebase/schema';

interface QuestManagerConfig {
  enableAutoGeneration: boolean;
  progressUpdateInterval: number; // milliseconds
  enableRealTimeTracking: boolean;
  maxConcurrentQuests: number;
}

export class QuestManager {
  private config: QuestManagerConfig;
  private activeListeners: Map<string, () => void> = new Map();
  private lastProgressUpdate: Map<string, number> = new Map();
  private energyDataBuffer: Map<string, EnergyReading[]> = new Map();

  constructor(config: Partial<QuestManagerConfig> = {}) {
    this.config = {
      enableAutoGeneration: true,
      progressUpdateInterval: 30000, // 30 seconds
      enableRealTimeTracking: true,
      maxConcurrentQuests: 3,
      ...config
    };

    this.initialize();
  }

  /**
   * Initialize quest manager
   */
  private async initialize(): Promise<void> {
    console.log('Initializing Quest Manager...');

    // Set up auth state listener
    authService.onAuthStateChanged(async (user) => {
      if (user) {
        await this.setupUserQuestTracking(user.uid);
      } else {
        this.cleanup();
      }
    });

    // Start quest generation if enabled
    if (this.config.enableAutoGeneration) {
      this.startAutoGeneration();
    }

    // Set up smart meter data integration
    if (this.config.enableRealTimeTracking) {
      this.setupSmartMeterIntegration();
    }
  }

  /**
   * Set up quest tracking for a user
   */
  private async setupUserQuestTracking(userId: string): Promise<void> {
    try {
      // Get user's active quests
      const activeQuests = await firestoreService.getUserQuests(userId, 'active');
      
      console.log(`Setting up tracking for ${activeQuests.length} active quests`);

      // Set up progress tracking for each active quest
      for (const userQuest of activeQuests) {
        this.setupQuestProgressTracking(userQuest);
      }

      // Generate initial quests if user has none
      if (activeQuests.length === 0 && this.config.enableAutoGeneration) {
        console.log('No active quests found, generating initial quests...');
        await this.generateInitialQuestsForUser(userId);
      }

      // Set up listener for new quest starts
      this.setupNewQuestListener(userId);

    } catch (error) {
      console.error('Error setting up user quest tracking:', error);
    }
  }

  /**
   * Set up progress tracking for a specific quest
   */
  private setupQuestProgressTracking(userQuest: UserQuest): void {
    const trackingKey = `quest:${userQuest.id}`;

    // Remove existing listener if any
    const existingListener = this.activeListeners.get(trackingKey);
    if (existingListener) {
      existingListener();
    }

    console.log(`Setting up progress tracking for quest: ${userQuest.id}`);

    // Set up smart meter data listener for this user
    const unsubscribe = smartMeterService.onMeterDataChanged(
      userQuest.userId, // This should ideally be meterId
      async (energyReading: EnergyReading) => {
        await this.handleEnergyDataUpdate(userQuest, energyReading);
      }
    );

    this.activeListeners.set(trackingKey, unsubscribe);

    // Set up periodic progress updates
    const progressTimer = setInterval(async () => {
      await this.processQuestProgress(userQuest);
    }, this.config.progressUpdateInterval);

    this.activeListeners.set(`${trackingKey}:timer`, () => {
      clearInterval(progressTimer);
    });
  }

  /**
   * Handle energy data update for quest progress
   */
  private async handleEnergyDataUpdate(
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Promise<void> {
    try {
      const userId = userQuest.userId;
      const now = Date.now();
      
      // Throttle updates to avoid excessive processing
      const lastUpdate = this.lastProgressUpdate.get(userQuest.id) || 0;
      if (now - lastUpdate < 10000) { // 10 second throttle
        return;
      }

      // Buffer energy data for batch processing
      if (!this.energyDataBuffer.has(userId)) {
        this.energyDataBuffer.set(userId, []);
      }
      
      this.energyDataBuffer.get(userId)!.push(energyReading);
      
      // Process quest progress with new data
      await questService.updateQuestProgress(userId, energyReading);
      
      this.lastProgressUpdate.set(userQuest.id, now);

      console.log(`Updated quest progress for quest ${userQuest.id}`);

    } catch (error) {
      console.error('Error handling energy data update:', error);
    }
  }

  /**
   * Process quest progress with buffered data
   */
  private async processQuestProgress(userQuest: UserQuest): Promise<void> {
    try {
      const userId = userQuest.userId;
      const bufferedData = this.energyDataBuffer.get(userId) || [];

      if (bufferedData.length === 0) return;

      // Get current quest data
      const currentUserQuest = await firestoreService.get(
        'user_quests', 
        userQuest.id
      ) as UserQuest | null;

      if (!currentUserQuest || currentUserQuest.progress.status !== 'active') {
        // Quest is no longer active, remove tracking
        this.removeQuestTracking(userQuest.id);
        return;
      }

      // Process buffered energy readings
      for (const energyReading of bufferedData.slice(-10)) { // Process last 10 readings
        await this.analyzeProgressForQuest(currentUserQuest, energyReading);
      }

      // Clear processed data
      this.energyDataBuffer.set(userId, []);

    } catch (error) {
      console.error('Error processing quest progress:', error);
    }
  }

  /**
   * Analyze quest progress with energy reading
   */
  private async analyzeProgressForQuest(
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Promise<void> {
    try {
      const quest = await firestoreService.get('quests', userQuest.questId) as Quest | null;
      if (!quest) return;

      // Determine progress based on quest type and conditions
      const progressData = this.calculateQuestProgress(quest, userQuest, energyReading);
      
      if (progressData) {
        // Update progress in Firestore
        await firestoreService.updateUserQuestProgress(userQuest.id, progressData);

        // Check for quest completion
        if (progressData.percentage && progressData.percentage >= 100) {
          console.log(`Quest ${userQuest.id} completed!`);
          await this.handleQuestCompletion(userQuest.id, userQuest.userId);
        }

        // Check for milestones
        await this.checkQuestMilestones(userQuest, progressData.percentage || 0);
      }

    } catch (error) {
      console.error('Error analyzing quest progress:', error);
    }
  }

  /**
   * Calculate quest progress based on quest type
   */
  private calculateQuestProgress(
    quest: Quest,
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Partial<UserQuest['progress']> | null {
    const questType = quest.definition.type;
    const currentProgress = userQuest.progress.percentage;

    switch (questType) {
      case 'energy_saving':
        return this.calculateEnergySavingProgress(quest, userQuest, energyReading);
      
      case 'device_management':
        return this.calculateDeviceManagementProgress(quest, userQuest, energyReading);
      
      case 'time_based':
        return this.calculateTimeBasedProgress(quest, userQuest, energyReading);
      
      case 'efficiency':
        return this.calculateEfficiencyProgress(quest, userQuest, energyReading);
      
      default:
        console.log(`Unknown quest type: ${questType}`);
        return null;
    }
  }

  /**
   * Calculate energy saving progress
   */
  private calculateEnergySavingProgress(
    quest: Quest,
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Partial<UserQuest['progress']> | null {
    // Simplified energy saving calculation
    // In production, this would compare with historical data
    const targetReduction = quest.definition.targetValue; // percentage
    const currentConsumption = energyReading.reading.consumption;
    
    // Mock calculation - in production this would compare with baseline
    const baselineConsumption = 1000; // kWh
    const actualReduction = ((baselineConsumption - currentConsumption) / baselineConsumption) * 100;
    
    const progress = Math.min(100, (actualReduction / targetReduction) * 100);
    
    return {
      currentValue: actualReduction,
      percentage: Math.max(progress, userQuest.progress.percentage), // Never go backwards
      lastActivity: new Date() as any
    };
  }

  /**
   * Calculate device management progress
   */
  private calculateDeviceManagementProgress(
    quest: Quest,
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Partial<UserQuest['progress']> | null {
    // Check if energy reading meets device management criteria
    const conditions = quest.definition.conditions;
    let progressIncrement = 0;

    for (const condition of conditions) {
      if (condition.type === 'device_usage') {
        const powerThreshold = (condition.value as number) * 1000; // Convert to watts
        const isWithinThreshold = energyReading.reading.power <= powerThreshold;
        
        // Check time window if specified
        if (condition.timeWindow) {
          const now = new Date();
          const currentHour = now.getHours();
          const startHour = parseInt(condition.timeWindow.start.split(':')[0]);
          const endHour = parseInt(condition.timeWindow.end.split(':')[0]);
          
          const isInTimeWindow = (startHour <= endHour) 
            ? (currentHour >= startHour && currentHour <= endHour)
            : (currentHour >= startHour || currentHour <= endHour);
          
          if (isInTimeWindow && isWithinThreshold) {
            progressIncrement = 5; // 5% progress per successful reading
          }
        } else if (isWithinThreshold) {
          progressIncrement = 2; // 2% progress for general compliance
        }
      }
    }

    if (progressIncrement > 0) {
      const newProgress = Math.min(100, userQuest.progress.percentage + progressIncrement);
      return {
        currentValue: energyReading.reading.power,
        percentage: newProgress,
        lastActivity: new Date() as any
      };
    }

    return null;
  }

  /**
   * Calculate time-based progress
   */
  private calculateTimeBasedProgress(
    quest: Quest,
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Partial<UserQuest['progress']> | null {
    const conditions = quest.definition.conditions;
    
    for (const condition of conditions) {
      if (condition.type === 'time_based' && condition.timeWindow) {
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(condition.timeWindow.start.split(':')[0]);
        const endHour = parseInt(condition.timeWindow.end.split(':')[0]);
        
        const isInTimeWindow = (startHour <= endHour) 
          ? (currentHour >= startHour && currentHour <= endHour)
          : (currentHour >= startHour || currentHour <= endHour);
        
        if (isInTimeWindow) {
          // Check if energy usage meets the condition
          const targetUsage = condition.value as number;
          const actualUsage = energyReading.reading.consumption / 1000; // Convert to kWh
          
          if (actualUsage <= targetUsage) {
            const progressIncrement = 100 / quest.definition.duration; // Distribute progress over duration
            const newProgress = Math.min(100, userQuest.progress.percentage + progressIncrement);
            
            return {
              currentValue: actualUsage,
              percentage: newProgress,
              lastActivity: new Date() as any
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Calculate efficiency progress
   */
  private calculateEfficiencyProgress(
    quest: Quest,
    userQuest: UserQuest,
    energyReading: EnergyReading
  ): Partial<UserQuest['progress']> | null {
    const targetEfficiency = quest.definition.targetValue / 100; // Convert percentage to decimal
    const currentEfficiency = energyReading.reading.powerFactor;
    
    if (currentEfficiency >= targetEfficiency) {
      const efficiencyPercentage = (currentEfficiency / targetEfficiency) * 100;
      const progress = Math.min(100, efficiencyPercentage);
      
      return {
        currentValue: currentEfficiency * 100,
        percentage: Math.max(progress, userQuest.progress.percentage),
        lastActivity: new Date() as any
      };
    }

    return null;
  }

  /**
   * Handle quest completion
   */
  private async handleQuestCompletion(userQuestId: string, userId: string): Promise<void> {
    try {
      await questService.completeQuest(userQuestId, userId);
      
      // Remove tracking for completed quest
      this.removeQuestTracking(userQuestId);
      
      // Generate new quest if auto-generation is enabled
      if (this.config.enableAutoGeneration) {
        await this.generateReplacementQuest(userId);
      }

      console.log(`Quest ${userQuestId} completed and tracking removed`);

    } catch (error) {
      console.error('Error handling quest completion:', error);
    }
  }

  /**
   * Check for quest milestones
   */
  private async checkQuestMilestones(
    userQuest: UserQuest,
    currentProgress: number
  ): Promise<void> {
    const milestones = [25, 50, 75]; // Milestone percentages
    const existingMilestones = userQuest.progress.milestones || [];

    for (const milestone of milestones) {
      if (currentProgress >= milestone && !existingMilestones.includes(milestone)) {
        // Award milestone bonus
        const bonusPoints = Math.floor(milestone / 25) * 10; // 10, 20, 30 points
        
        // Update user profile with bonus points
        await firestoreService.transaction(async (transaction) => {
          const userRef = firestoreService.get('users', userQuest.userId);
          const userDoc = await transaction.get(userRef as any);
          const userData = userDoc.data() as any;

          const currentPoints = userData.gamification?.points || 0;
          transaction.update(userRef as any, {
            'gamification.points': currentPoints + bonusPoints
          });
        });

        // Update quest milestones
        await firestoreService.updateUserQuestProgress(userQuest.id, {
          milestones: [...existingMilestones, milestone]
        });

        console.log(`Milestone reached: ${milestone}% for quest ${userQuest.id}, awarded ${bonusPoints} points`);
      }
    }
  }

  /**
   * Generate initial quests for a new user
   */
  private async generateInitialQuestsForUser(userId: string): Promise<void> {
    try {
      const quests = await questService.generateQuestsForUser(userId);
      console.log(`Generated ${quests.length} initial quests for user ${userId}`);
    } catch (error) {
      console.error('Error generating initial quests:', error);
    }
  }

  /**
   * Generate replacement quest when one is completed
   */
  private async generateReplacementQuest(userId: string): Promise<void> {
    try {
      const activeQuests = await firestoreService.getUserQuests(userId, 'active');
      
      if (activeQuests.length < this.config.maxConcurrentQuests) {
        const newQuests = await questService.generateQuestsForUser(userId);
        
        if (newQuests.length > 0) {
          console.log(`Generated replacement quest for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error generating replacement quest:', error);
    }
  }

  /**
   * Set up listener for new quest starts
   */
  private setupNewQuestListener(userId: string): void {
    const listenerKey = `newQuest:${userId}`;
    
    // Remove existing listener if any
    const existingListener = this.activeListeners.get(listenerKey);
    if (existingListener) {
      existingListener();
    }

    // Set up Firestore listener for new user quests
    const unsubscribe = firestoreService.onQuery(
      'user_quests',
      {
        where: [['userId', '==', userId], ['progress.status', '==', 'active']],
        orderBy: [['createdAt', 'desc']],
        limit: 10
      },
      (userQuests: UserQuest[]) => {
        // Check for new quests that don't have tracking set up
        for (const userQuest of userQuests) {
          const trackingKey = `quest:${userQuest.id}`;
          if (!this.activeListeners.has(trackingKey)) {
            console.log(`Setting up tracking for new quest: ${userQuest.id}`);
            this.setupQuestProgressTracking(userQuest);
          }
        }
      }
    );

    this.activeListeners.set(listenerKey, unsubscribe);
  }

  /**
   * Start automatic quest generation
   */
  private startAutoGeneration(): void {
    const timer = setInterval(async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const activeQuests = await firestoreService.getUserQuests(currentUser.uid, 'active');
        
        // Generate new quests if user has fewer than max
        if (activeQuests.length < this.config.maxConcurrentQuests) {
          await questService.generateQuestsForUser(currentUser.uid);
          console.log('Auto-generated new quests');
        }
      }
    }, 24 * 60 * 60 * 1000); // Daily generation

    this.activeListeners.set('autoGeneration', () => clearInterval(timer));
  }

  /**
   * Set up smart meter integration
   */
  private setupSmartMeterIntegration(): void {
    console.log('Setting up smart meter integration for quest tracking');
    
    // This would set up listeners for smart meter data changes
    // The actual integration is handled in setupUserQuestTracking
  }

  /**
   * Remove quest tracking
   */
  private removeQuestTracking(questId: string): void {
    const trackingKey = `quest:${questId}`;
    const timerKey = `${trackingKey}:timer`;

    // Remove listeners
    [trackingKey, timerKey].forEach(key => {
      const listener = this.activeListeners.get(key);
      if (listener) {
        listener();
        this.activeListeners.delete(key);
      }
    });

    // Clean up progress data
    this.lastProgressUpdate.delete(questId);
    
    console.log(`Removed tracking for quest: ${questId}`);
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    console.log('Cleaning up Quest Manager...');
    
    // Remove all listeners
    for (const [key, unsubscribe] of this.activeListeners) {
      unsubscribe();
    }
    this.activeListeners.clear();

    // Clear data buffers
    this.energyDataBuffer.clear();
    this.lastProgressUpdate.clear();
  }

  /**
   * Get quest manager status
   */
  getStatus() {
    return {
      activeListeners: this.activeListeners.size,
      trackedUsers: new Set(
        Array.from(this.activeListeners.keys())
          .filter(key => key.startsWith('newQuest:'))
          .map(key => key.split(':')[1])
      ).size,
      bufferedData: Array.from(this.energyDataBuffer.values())
        .reduce((total, buffer) => total + buffer.length, 0)
    };
  }
}

// Export singleton instance
export const questManager = new QuestManager({
  enableAutoGeneration: true,
  progressUpdateInterval: 30000, // 30 seconds
  enableRealTimeTracking: true,
  maxConcurrentQuests: 3
});

export default QuestManager;