/**
 * Real-time Quest Generation System
 * 
 * Analyzes actual smart meter readings and device usage patterns 
 * to create personalized energy-saving challenges and quests.
 */

import { smartMeterSystem, QuestGenerationData, ApplianceUsagePattern } from './smart-meter-system';
import { deviceRegistry } from './device-registry';
import type { Quest } from './types';

export interface QuestTemplate {
  id: string;
  category: 'efficiency' | 'consumption' | 'timing' | 'automation' | 'maintenance';
  title: string;
  description: string;
  conditions: QuestCondition[];
  baseReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: 'daily' | 'weekly' | 'monthly';
  icon: string;
  priority: number; // 1-10, higher is better
}

export interface QuestCondition {
  type: 'device_usage' | 'total_consumption' | 'peak_hours' | 'efficiency_score' | 'cost_savings' | 'time_based';
  operator: '>' | '<' | '=' | '>=' | '<=' | 'between';
  value: number | number[] | string;
  deviceType?: string;
  timeRange?: { start: string; end: string };
}

export interface GeneratedQuest extends Quest {
  questId: string;
  category: QuestTemplate['category'];
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  generatedAt: Date;
  validUntil: Date;
  deviceIds?: string[];
  savings?: {
    energy: number; // kWh
    cost: number; // ₹
    carbon: number; // kg CO2
  };
}

export interface QuestGenerationConfig {
  maxActiveQuests: number;
  refreshIntervalMinutes: number;
  adaptiveDifficulty: boolean;
  userPreferences: {
    preferredCategories: QuestTemplate['category'][];
    targetSavings: number; // ₹ per month
    difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  };
}

class QuestGenerationEngine {
  private questTemplates: QuestTemplate[] = [];
  private activeQuests: Map<string, GeneratedQuest> = new Map();
  private completedQuests: Map<string, GeneratedQuest> = new Map();
  private config: QuestGenerationConfig;
  private subscribers: Set<(quests: GeneratedQuest[]) => void> = new Set();
  private generationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      maxActiveQuests: 6,
      refreshIntervalMinutes: 30,
      adaptiveDifficulty: true,
      userPreferences: {
        preferredCategories: ['efficiency', 'consumption', 'timing'],
        targetSavings: 500,
        difficultyPreference: 'adaptive'
      }
    };

    this.initializeQuestTemplates();
    this.startQuestGeneration();
  }

  /**
   * Generate quests based on current smart meter data
   */
  async generateQuests(): Promise<GeneratedQuest[]> {
    try {
      const questData = smartMeterSystem.getQuestGenerationData();
      if (!questData) return [];

      const newQuests: GeneratedQuest[] = [];
      const usedTemplates = new Set<string>();

      // Analyze data to determine best quest opportunities
      const opportunities = this.analyzeQuestOpportunities(questData);

      for (const opportunity of opportunities) {
        if (newQuests.length >= this.config.maxActiveQuests) break;
        if (usedTemplates.has(opportunity.templateId)) continue;

        const template = this.questTemplates.find(t => t.id === opportunity.templateId);
        if (!template) continue;

        const quest = await this.generateQuestFromTemplate(template, opportunity, questData);
        if (quest) {
          newQuests.push(quest);
          usedTemplates.add(opportunity.templateId);
        }
      }

      // Update active quests
      this.activeQuests.clear();
      newQuests.forEach(quest => {
        this.activeQuests.set(quest.questId, quest);
      });

      // Notify subscribers
      this.notifySubscribers();

      console.log(`Generated ${newQuests.length} new quests`);
      return newQuests;
    } catch (error) {
      console.error('Failed to generate quests:', error);
      return [];
    }
  }

  /**
   * Get currently active quests
   */
  getActiveQuests(): GeneratedQuest[] {
    return Array.from(this.activeQuests.values());
  }

  /**
   * Complete a quest
   */
  async completeQuest(questId: string, actualValue: number): Promise<boolean> {
    const quest = this.activeQuests.get(questId);
    if (!quest) return false;

    try {
      // Calculate completion percentage and bonus
      const completionPercentage = Math.min(100, (actualValue / quest.targetValue) * 100);
      const bonusMultiplier = completionPercentage >= 100 ? 1.2 : completionPercentage / 100;
      
      const completedQuest: GeneratedQuest = {
        ...quest,
        progress: completionPercentage,
        reward: Math.round(quest.reward * bonusMultiplier)
      };

      // Move to completed quests
      this.completedQuests.set(questId, completedQuest);
      this.activeQuests.delete(questId);

      // Notify subscribers
      this.notifySubscribers();

      console.log(`Quest completed: ${quest.title} (${completionPercentage.toFixed(1)}%)`);
      return true;
    } catch (error) {
      console.error('Failed to complete quest:', error);
      return false;
    }
  }

  /**
   * Update quest progress based on current data
   */
  updateQuestProgress(): void {
    const questData = smartMeterSystem.getQuestGenerationData();
    if (!questData) return;

    let hasUpdates = false;

    for (const [questId, quest] of this.activeQuests) {
      const newProgress = this.calculateQuestProgress(quest, questData);
      
      if (newProgress !== quest.progress) {
        quest.progress = Math.min(100, Math.max(0, newProgress));
        quest.currentValue = this.getCurrentValueForQuest(quest, questData);
        hasUpdates = true;

        // Auto-complete quest if target reached
        if (quest.progress >= 100) {
          this.completeQuest(questId, quest.currentValue);
        }
      }
    }

    if (hasUpdates) {
      this.notifySubscribers();
    }
  }

  /**
   * Subscribe to quest updates
   */
  subscribe(callback: (quests: GeneratedQuest[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately provide current quests
    callback(this.getActiveQuests());
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<QuestGenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart generation with new config
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
      this.startQuestGeneration();
    }
  }

  /**
   * Initialize quest templates
   */
  private initializeQuestTemplates(): void {
    this.questTemplates = [
      // Efficiency Quests
      {
        id: 'ac-temperature-optimization',
        category: 'efficiency',
        title: 'AC Temperature Champion',
        description: 'Keep your AC temperature at 24°C or higher for {duration} to optimize efficiency',
        conditions: [
          { type: 'device_usage', operator: '>=', value: 24, deviceType: 'ac_meter' }
        ],
        baseReward: 400,
        difficulty: 'easy',
        duration: 'daily',
        icon: '❄️',
        priority: 8
      },
      {
        id: 'lighting-efficiency',
        category: 'efficiency',
        title: 'Bright Ideas',
        description: 'Reduce lighting usage by {percentage}% during daylight hours',
        conditions: [
          { type: 'device_usage', operator: '<', value: 50, deviceType: 'light', timeRange: { start: '09:00', end: '17:00' } }
        ],
        baseReward: 250,
        difficulty: 'easy',
        duration: 'daily',
        icon: '💡',
        priority: 6
      },

      // Consumption Reduction Quests
      {
        id: 'high-consumption-device',
        category: 'consumption',
        title: 'Energy Beast Tamer',
        description: 'Reduce usage of your highest consuming device by {percentage}%',
        conditions: [
          { type: 'device_usage', operator: '<', value: 80, deviceType: 'any' }
        ],
        baseReward: 500,
        difficulty: 'medium',
        duration: 'weekly',
        icon: '⚡',
        priority: 9
      },
      {
        id: 'total-consumption-reduction',
        category: 'consumption',
        title: 'Conservation Master',
        description: 'Reduce your total daily consumption by {amount}kWh',
        conditions: [
          { type: 'total_consumption', operator: '<', value: 90 }
        ],
        baseReward: 600,
        difficulty: 'medium',
        duration: 'daily',
        icon: '🌱',
        priority: 8
      },

      // Timing Optimization Quests
      {
        id: 'peak-hour-avoidance',
        category: 'timing',
        title: 'Peak Hour Ninja',
        description: 'Shift {amount}kWh of usage away from peak hours ({peakTime})',
        conditions: [
          { type: 'peak_hours', operator: '<', value: 70, timeRange: { start: '18:00', end: '22:00' } }
        ],
        baseReward: 750,
        difficulty: 'hard',
        duration: 'weekly',
        icon: '🥷',
        priority: 7
      },
      {
        id: 'off-peak-usage',
        category: 'timing',
        title: 'Night Owl Saver',
        description: 'Move {percentage}% of your appliance usage to off-peak hours',
        conditions: [
          { type: 'time_based', operator: '>', value: 30, timeRange: { start: '23:00', end: '06:00' } }
        ],
        baseReward: 350,
        difficulty: 'medium',
        duration: 'weekly',
        icon: '🦉',
        priority: 5
      },

      // Automation Quests
      {
        id: 'smart-scheduling',
        category: 'automation',
        title: 'Automation Pro',
        description: 'Set up smart schedules for {count} devices to optimize usage',
        conditions: [
          { type: 'device_usage', operator: '=', value: 3, deviceType: 'any' }
        ],
        baseReward: 800,
        difficulty: 'hard',
        duration: 'weekly',
        icon: '🤖',
        priority: 6
      },

      // Maintenance Quests
      {
        id: 'efficiency-improvement',
        category: 'maintenance',
        title: 'Efficiency Guru',
        description: 'Improve your home efficiency score to {target}',
        conditions: [
          { type: 'efficiency_score', operator: '>=', value: 8.0 }
        ],
        baseReward: 1000,
        difficulty: 'hard',
        duration: 'monthly',
        icon: '📈',
        priority: 9
      }
    ];
  }

  /**
   * Analyze quest opportunities from current data
   */
  private analyzeQuestOpportunities(questData: QuestGenerationData): Array<{
    templateId: string;
    priority: number;
    potential: number;
    context: any;
  }> {
    const opportunities: Array<{
      templateId: string;
      priority: number;
      potential: number;
      context: any;
    }> = [];

    // Analyze high consumption devices
    const highConsumptionDevices = questData.deviceUsagePatterns.filter(d => d.averageUsage > 5);
    if (highConsumptionDevices.length > 0) {
      opportunities.push({
        templateId: 'high-consumption-device',
        priority: 9,
        potential: highConsumptionDevices[0].averageUsage,
        context: { device: highConsumptionDevices[0] }
      });
    }

    // Analyze AC usage
    const acDevices = questData.deviceUsagePatterns.filter(d => d.deviceName.toLowerCase().includes('ac'));
    if (acDevices.length > 0 && acDevices[0].averageUsage > 8) {
      opportunities.push({
        templateId: 'ac-temperature-optimization',
        priority: 8,
        potential: acDevices[0].averageUsage,
        context: { device: acDevices[0] }
      });
    }

    // Analyze lighting usage
    const lightDevices = questData.deviceUsagePatterns.filter(d => d.deviceName.toLowerCase().includes('light'));
    if (lightDevices.length > 2) {
      opportunities.push({
        templateId: 'lighting-efficiency',
        priority: 6,
        potential: lightDevices.reduce((sum, d) => sum + d.averageUsage, 0),
        context: { devices: lightDevices }
      });
    }

    // Analyze peak usage patterns
    const peakHour = parseInt(questData.peakUsageTime.split(':')[0]);
    if (peakHour >= 18 && peakHour <= 22 && questData.totalConsumption > 15) {
      opportunities.push({
        templateId: 'peak-hour-avoidance',
        priority: 7,
        potential: questData.totalConsumption * 0.3,
        context: { peakTime: questData.peakUsageTime, consumption: questData.totalConsumption }
      });
    }

    // Analyze overall efficiency
    if (questData.efficiencyScore < 8.0) {
      opportunities.push({
        templateId: 'efficiency-improvement',
        priority: 9,
        potential: (8.0 - questData.efficiencyScore) * 2,
        context: { currentScore: questData.efficiencyScore, targetScore: 8.0 }
      });
    }

    // Analyze total consumption
    if (questData.totalConsumption > 20) {
      opportunities.push({
        templateId: 'total-consumption-reduction',
        priority: 8,
        potential: questData.totalConsumption * 0.1,
        context: { currentConsumption: questData.totalConsumption }
      });
    }

    // Sort by priority and potential savings
    return opportunities.sort((a, b) => {
      const scoreA = a.priority * 10 + a.potential;
      const scoreB = b.priority * 10 + b.potential;
      return scoreB - scoreA;
    });
  }

  /**
   * Generate quest from template and opportunity
   */
  private async generateQuestFromTemplate(
    template: QuestTemplate,
    opportunity: any,
    questData: QuestGenerationData
  ): Promise<GeneratedQuest | null> {
    try {
      const questId = `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date();
      const validUntil = new Date(now);
      
      // Set quest duration
      switch (template.duration) {
        case 'daily':
          validUntil.setDate(validUntil.getDate() + 1);
          break;
        case 'weekly':
          validUntil.setDate(validUntil.getDate() + 7);
          break;
        case 'monthly':
          validUntil.setMonth(validUntil.getMonth() + 1);
          break;
      }

      // Calculate quest parameters based on template and current data
      const questParams = this.calculateQuestParameters(template, opportunity, questData);
      
      // Calculate savings potential
      const savings = this.calculateSavingsPotential(template, questParams, questData);

      const generatedQuest: GeneratedQuest = {
        questId,
        id: questId,
        category: template.category,
        title: this.populateTemplate(template.title, questParams),
        description: this.populateTemplate(template.description, questParams),
        progress: 0,
        target: questParams.target,
        unit: questParams.unit,
        reward: this.calculateDynamicReward(template, opportunity.potential),
        type: template.duration === 'daily' ? 'daily' : template.duration === 'weekly' ? 'weekly' : 'event',
        icon: () => template.icon,
        baselineValue: questParams.baseline,
        targetValue: questParams.target,
        currentValue: questParams.current,
        generatedAt: now,
        validUntil,
        deviceIds: questParams.deviceIds,
        savings,
        isNew: true
      };

      return generatedQuest;
    } catch (error) {
      console.error('Failed to generate quest from template:', error);
      return null;
    }
  }

  /**
   * Calculate quest parameters based on template and data
   */
  private calculateQuestParameters(template: QuestTemplate, opportunity: any, questData: QuestGenerationData): any {
    const params: any = {
      baseline: 0,
      current: 0,
      target: 100,
      unit: '%',
      deviceIds: []
    };

    switch (template.id) {
      case 'ac-temperature-optimization':
        params.baseline = 22;
        params.current = 22;
        params.target = 3; // 3 days
        params.unit = 'days';
        if (opportunity.context?.device) {
          params.deviceIds = [opportunity.context.device.deviceId];
        }
        break;

      case 'lighting-efficiency':
        params.baseline = opportunity.potential || 5;
        params.current = params.baseline;
        params.target = Math.round(params.baseline * 0.5); // 50% reduction
        params.unit = 'kWh';
        if (opportunity.context?.devices) {
          params.deviceIds = opportunity.context.devices.map((d: any) => d.deviceId);
        }
        break;

      case 'high-consumption-device':
        params.baseline = opportunity.potential || 10;
        params.current = params.baseline;
        params.target = Math.round(params.baseline * 0.8); // 20% reduction
        params.unit = 'kWh';
        if (opportunity.context?.device) {
          params.deviceIds = [opportunity.context.device.deviceId];
        }
        break;

      case 'total-consumption-reduction':
        params.baseline = questData.totalConsumption;
        params.current = questData.totalConsumption;
        params.target = Math.round(questData.totalConsumption * 0.9); // 10% reduction
        params.unit = 'kWh';
        break;

      case 'peak-hour-avoidance':
        params.baseline = questData.totalConsumption * 0.4; // Assume 40% during peak
        params.current = params.baseline;
        params.target = Math.round(params.baseline * 0.7); // 30% reduction
        params.unit = 'kWh';
        break;

      case 'efficiency-improvement':
        params.baseline = questData.efficiencyScore;
        params.current = questData.efficiencyScore;
        params.target = Math.min(10, questData.efficiencyScore + 1);
        params.unit = 'score';
        break;

      default:
        params.target = 100;
        params.unit = '%';
    }

    return params;
  }

  /**
   * Calculate savings potential for a quest
   */
  private calculateSavingsPotential(template: QuestTemplate, params: any, questData: QuestGenerationData): {
    energy: number;
    cost: number;
    carbon: number;
  } {
    let energySavings = 0;

    switch (template.category) {
      case 'efficiency':
        energySavings = (params.baseline - params.target) * (template.duration === 'daily' ? 1 : template.duration === 'weekly' ? 7 : 30);
        break;
      case 'consumption':
        energySavings = params.baseline - params.target;
        break;
      case 'timing':
        energySavings = (params.baseline - params.target) * 0.5; // Timing saves less energy but reduces costs
        break;
      default:
        energySavings = questData.potentialSavings * 0.1;
    }

    const costSavings = energySavings * 6.5; // ₹6.5 per kWh
    const carbonSavings = energySavings * 0.82; // 0.82 kg CO2 per kWh

    return {
      energy: Math.max(0, energySavings),
      cost: Math.max(0, costSavings),
      carbon: Math.max(0, carbonSavings)
    };
  }

  /**
   * Calculate dynamic reward based on potential impact
   */
  private calculateDynamicReward(template: QuestTemplate, potential: number): number {
    const baseReward = template.baseReward;
    const potentialMultiplier = Math.min(2.0, 1 + (potential / 20)); // Up to 2x multiplier
    const difficultyMultiplier = template.difficulty === 'easy' ? 0.8 : template.difficulty === 'medium' ? 1.0 : 1.2;
    
    return Math.round(baseReward * potentialMultiplier * difficultyMultiplier);
  }

  /**
   * Populate template strings with parameters
   */
  private populateTemplate(template: string, params: any): string {
    let populated = template;
    
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      populated = populated.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Handle common placeholders
    populated = populated.replace(/\{duration\}/g, 'today');
    populated = populated.replace(/\{percentage\}/g, '20');
    populated = populated.replace(/\{amount\}/g, String(Math.round(params.baseline * 0.2 || 5)));
    populated = populated.replace(/\{count\}/g, '3');
    populated = populated.replace(/\{target\}/g, String(params.target));
    populated = populated.replace(/\{peakTime\}/g, '18:00-22:00');

    return populated;
  }

  /**
   * Calculate current progress for a quest
   */
  private calculateQuestProgress(quest: GeneratedQuest, questData: QuestGenerationData): number {
    // This is a simplified implementation - in a real system, 
    // you'd track actual user actions and device states over time
    const timePassed = (Date.now() - quest.generatedAt.getTime()) / (1000 * 60 * 60); // hours
    const questDurationHours = quest.type === 'daily' ? 24 : quest.type === 'weekly' ? 168 : 720;
    
    // Simulate some progress based on time and random factors
    const timeProgress = Math.min(100, (timePassed / questDurationHours) * 100);
    const randomFactor = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    
    return Math.min(100, timeProgress * randomFactor);
  }

  /**
   * Get current value for quest tracking
   */
  private getCurrentValueForQuest(quest: GeneratedQuest, questData: QuestGenerationData): number {
    // Simplified implementation - would use actual measurements in production
    const progress = quest.progress / 100;
    return quest.baselineValue + (quest.targetValue - quest.baselineValue) * progress;
  }

  /**
   * Start automated quest generation
   */
  private startQuestGeneration(): void {
    // Generate initial quests
    this.generateQuests();

    // Set up periodic generation
    this.generationInterval = setInterval(() => {
      this.updateQuestProgress();
      
      // Generate new quests if needed
      if (this.activeQuests.size < this.config.maxActiveQuests) {
        this.generateQuests();
      }
    }, this.config.refreshIntervalMinutes * 60 * 1000);

    // Set up more frequent progress updates
    setInterval(() => {
      this.updateQuestProgress();
    }, 60000); // Update progress every minute
  }

  /**
   * Notify subscribers of quest updates
   */
  private notifySubscribers(): void {
    const activeQuests = this.getActiveQuests();
    this.subscribers.forEach(callback => {
      try {
        callback(activeQuests);
      } catch (error) {
        console.error('Quest subscriber callback error:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
      this.generationInterval = null;
    }
    this.subscribers.clear();
  }
}

// Export singleton instance
export const questGenerator = new QuestGenerationEngine();
export default QuestGenerationEngine;