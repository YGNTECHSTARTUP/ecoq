'use client';

// EcoQuest Gaming Points System - Comprehensive Pricing Strategy
export interface GamingPointsConfig {
  // Base Point Values
  basePoints: {
    // Energy Efficiency Actions
    turnOffAppliance: number;
    energySavingMode: number;
    peakHourOptimization: number;
    smartScheduling: number;
    
    // Equipment Upgrades
    ledBulbUpgrade: number;
    efficientApplianceUpgrade: number;
    solarPanelInstall: number;
    smartThermostatInstall: number;
    
    // Behavioral Actions
    consecutiveDaysSaving: number;
    weeklyTargetAchievement: number;
    monthlyTargetAchievement: number;
    perfectWeek: number;
    
    // Community Actions
    helpNeighbor: number;
    shareAchievement: number;
    communityChallenge: number;
  };
  
  // Multipliers
  multipliers: {
    streak: { [days: number]: number };
    level: { [level: number]: number };
    timeOfDay: {
      peak: number;
      offPeak: number;
      superOffPeak: number;
    };
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
      expert: number;
    };
  };
  
  // Penalties
  penalties: {
    highConsumption: number;
    missedTarget: number;
    inefficientUsage: number;
    breakingStreak: number;
  };
  
  // Rewards Shop
  rewardsShop: {
    [itemId: string]: {
      name: string;
      description: string;
      cost: number;
      category: 'virtual' | 'real' | 'upgrade' | 'cosmetic';
      icon: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
  };
}

export const GAMING_POINTS_CONFIG: GamingPointsConfig = {
  basePoints: {
    // Energy Efficiency Actions (10-100 points)
    turnOffAppliance: 15,
    energySavingMode: 25,
    peakHourOptimization: 50,
    smartScheduling: 40,
    
    // Equipment Upgrades (100-1000 points)
    ledBulbUpgrade: 150,
    efficientApplianceUpgrade: 300,
    solarPanelInstall: 1000,
    smartThermostatInstall: 500,
    
    // Behavioral Actions (50-500 points)
    consecutiveDaysSaving: 75,
    weeklyTargetAchievement: 200,
    monthlyTargetAchievement: 800,
    perfectWeek: 500,
    
    // Community Actions (20-200 points)
    helpNeighbor: 50,
    shareAchievement: 25,
    communityChallenge: 200,
  },
  
  multipliers: {
    streak: {
      3: 1.2,   // 3+ days streak: 20% bonus
      7: 1.5,   // 1+ week streak: 50% bonus
      14: 1.8,  // 2+ weeks streak: 80% bonus
      30: 2.0,  // 1+ month streak: 100% bonus
      90: 2.5,  // 3+ months streak: 150% bonus
      365: 3.0, // 1+ year streak: 200% bonus
    },
    
    level: {
      1: 1.0,   // Beginner
      5: 1.1,   // Novice
      10: 1.2,  // Intermediate
      15: 1.3,  // Advanced
      20: 1.5,  // Expert
      25: 1.7,  // Master
      30: 2.0,  // Grandmaster
    },
    
    timeOfDay: {
      peak: 2.0,        // Peak hours (6-10 AM, 5-9 PM)
      offPeak: 1.3,     // Off-peak hours
      superOffPeak: 1.0, // Super off-peak (11 PM - 5 AM)
    },
    
    difficulty: {
      easy: 1.0,
      medium: 1.3,
      hard: 1.7,
      expert: 2.5,
    }
  },
  
  penalties: {
    highConsumption: -30,      // Penalty for exceeding targets
    missedTarget: -50,         // Penalty for missing daily/weekly targets
    inefficientUsage: -20,     // Penalty for inefficient appliance usage
    breakingStreak: -100,      // Penalty for breaking long streaks
  },
  
  rewardsShop: {
    'virtual_badge_eco_warrior': {
      name: 'Eco Warrior Badge',
      description: 'Show off your environmental dedication!',
      cost: 500,
      category: 'virtual',
      icon: '🌱',
      rarity: 'common'
    },
    'virtual_theme_solar': {
      name: 'Solar Theme',
      description: 'Golden solar-powered dashboard theme',
      cost: 1200,
      category: 'cosmetic',
      icon: '☀️',
      rarity: 'rare'
    },
    'upgrade_smart_analytics': {
      name: 'Advanced Analytics',
      description: 'Unlock detailed energy consumption analytics',
      cost: 2000,
      category: 'upgrade',
      icon: '📊',
      rarity: 'epic'
    },
    'upgrade_ai_assistant': {
      name: 'AI Energy Coach',
      description: 'Personal AI assistant for energy optimization',
      cost: 3500,
      category: 'upgrade',
      icon: '🤖',
      rarity: 'legendary'
    },
    'real_discount_led': {
      name: '10% LED Bulb Discount',
      description: 'Real discount voucher for LED bulbs',
      cost: 800,
      category: 'real',
      icon: '💡',
      rarity: 'rare'
    },
    'real_solar_consultation': {
      name: 'Free Solar Consultation',
      description: 'Free consultation with solar energy experts',
      cost: 5000,
      category: 'real',
      icon: '🏠',
      rarity: 'legendary'
    },
    'virtual_pet_energy_dragon': {
      name: 'Energy Dragon Pet',
      description: 'Virtual pet that grows with your energy savings',
      cost: 2500,
      category: 'virtual',
      icon: '🐉',
      rarity: 'epic'
    },
    'cosmetic_dashboard_particles': {
      name: 'Energy Particle Effects',
      description: 'Cool particle effects for your dashboard',
      cost: 1500,
      category: 'cosmetic',
      icon: '✨',
      rarity: 'rare'
    }
  }
};

// Gaming Levels and Progression
export interface GamingLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  badge: string;
  color: string;
}

export const GAMING_LEVELS: GamingLevel[] = [
  {
    level: 1,
    name: 'Energy Newbie',
    minPoints: 0,
    maxPoints: 499,
    benefits: ['Basic quests access', 'Standard point multiplier'],
    badge: '🌱',
    color: '#22c55e'
  },
  {
    level: 5,
    name: 'Eco Apprentice',
    minPoints: 2500,
    maxPoints: 4999,
    benefits: ['10% bonus points', 'Weekly challenges unlocked'],
    badge: '🌿',
    color: '#16a34a'
  },
  {
    level: 10,
    name: 'Smart Saver',
    minPoints: 7500,
    maxPoints: 14999,
    benefits: ['20% bonus points', 'Community features unlocked'],
    badge: '⚡',
    color: '#3b82f6'
  },
  {
    level: 15,
    name: 'Efficiency Expert',
    minPoints: 20000,
    maxPoints: 39999,
    benefits: ['30% bonus points', 'Advanced analytics access'],
    badge: '🏆',
    color: '#f59e0b'
  },
  {
    level: 20,
    name: 'Green Guardian',
    minPoints: 50000,
    maxPoints: 99999,
    benefits: ['50% bonus points', 'Exclusive challenges'],
    badge: '🛡️',
    color: '#8b5cf6'
  },
  {
    level: 25,
    name: 'Eco Master',
    minPoints: 125000,
    maxPoints: 249999,
    benefits: ['70% bonus points', 'VIP community access'],
    badge: '👑',
    color: '#ec4899'
  },
  {
    level: 30,
    name: 'Sustainability Legend',
    minPoints: 300000,
    maxPoints: Infinity,
    benefits: ['100% bonus points', 'Legendary status', 'Beta feature access'],
    badge: '🌟',
    color: '#eab308'
  }
];

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'streak' | 'points' | 'savings' | 'community' | 'special';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  };
  unlocked: boolean;
  progress: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_save',
    name: 'First Steps',
    description: 'Complete your first energy-saving action',
    icon: '👶',
    points: 100,
    rarity: 'common',
    requirements: { type: 'special', value: 1 },
    unlocked: false,
    progress: 0
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain energy savings for 7 consecutive days',
    icon: '⚔️',
    points: 500,
    rarity: 'rare',
    requirements: { type: 'streak', value: 7, timeframe: 'daily' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'point_collector',
    name: 'Point Collector',
    description: 'Earn 10,000 total points',
    icon: '💰',
    points: 1000,
    rarity: 'rare',
    requirements: { type: 'points', value: 10000, timeframe: 'all-time' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'efficiency_master',
    name: 'Efficiency Master',
    description: 'Achieve 90% efficiency rating for a full month',
    icon: '🎯',
    points: 2500,
    rarity: 'epic',
    requirements: { type: 'special', value: 90 },
    unlocked: false,
    progress: 0
  },
  {
    id: 'community_hero',
    name: 'Community Hero',
    description: 'Help 50 community members with their energy goals',
    icon: '🦸',
    points: 3000,
    rarity: 'epic',
    requirements: { type: 'community', value: 50 },
    unlocked: false,
    progress: 0
  },
  {
    id: 'legendary_saver',
    name: 'Legendary Saver',
    description: 'Save 1000 kWh through efficient practices',
    icon: '🌟',
    points: 10000,
    rarity: 'legendary',
    requirements: { type: 'savings', value: 1000, timeframe: 'all-time' },
    unlocked: false,
    progress: 0
  }
];

// Points Calculation Engine
export class GamingPointsCalculator {
  private config: GamingPointsConfig;
  
  constructor() {
    this.config = GAMING_POINTS_CONFIG;
  }
  
  calculatePoints(
    action: keyof GamingPointsConfig['basePoints'],
    context: {
      level?: number;
      streak?: number;
      timeOfDay?: 'peak' | 'offPeak' | 'superOffPeak';
      difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    } = {}
  ): number {
    let basePoints = this.config.basePoints[action] || 0;
    let totalMultiplier = 1.0;
    
    // Apply level multiplier
    if (context.level) {
      const levelMultiplier = this.config.multipliers.level[context.level] || 1.0;
      totalMultiplier *= levelMultiplier;
    }
    
    // Apply streak multiplier
    if (context.streak) {
      const streakMultiplier = this.getStreakMultiplier(context.streak);
      totalMultiplier *= streakMultiplier;
    }
    
    // Apply time of day multiplier
    if (context.timeOfDay) {
      const timeMultiplier = this.config.multipliers.timeOfDay[context.timeOfDay];
      totalMultiplier *= timeMultiplier;
    }
    
    // Apply difficulty multiplier
    if (context.difficulty) {
      const difficultyMultiplier = this.config.multipliers.difficulty[context.difficulty];
      totalMultiplier *= difficultyMultiplier;
    }
    
    return Math.round(basePoints * totalMultiplier);
  }
  
  private getStreakMultiplier(streak: number): number {
    const streakMultipliers = this.config.multipliers.streak;
    
    // Find the highest applicable streak multiplier
    let applicableMultiplier = 1.0;
    for (const [days, multiplier] of Object.entries(streakMultipliers)) {
      const requiredDays = parseInt(days);
      if (streak >= requiredDays) {
        applicableMultiplier = multiplier;
      }
    }
    
    return applicableMultiplier;
  }
  
  applyPenalty(
    penaltyType: keyof GamingPointsConfig['penalties'],
    severity: number = 1
  ): number {
    return this.config.penalties[penaltyType] * severity;
  }
  
  getUserLevel(totalPoints: number): GamingLevel {
    for (let i = GAMING_LEVELS.length - 1; i >= 0; i--) {
      const level = GAMING_LEVELS[i];
      if (totalPoints >= level.minPoints) {
        return level;
      }
    }
    return GAMING_LEVELS[0]; // Default to first level
  }
  
  getProgressToNextLevel(totalPoints: number): {
    currentLevel: GamingLevel;
    nextLevel: GamingLevel | null;
    progress: number;
    pointsNeeded: number;
  } {
    const currentLevel = this.getUserLevel(totalPoints);
    const currentLevelIndex = GAMING_LEVELS.findIndex(l => l.level === currentLevel.level);
    const nextLevel = currentLevelIndex < GAMING_LEVELS.length - 1 
      ? GAMING_LEVELS[currentLevelIndex + 1] 
      : null;
    
    if (!nextLevel) {
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        pointsNeeded: 0
      };
    }
    
    const pointsInCurrentLevel = totalPoints - currentLevel.minPoints;
    const pointsNeededForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
    const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;
    const pointsNeeded = nextLevel.minPoints - totalPoints;
    
    return {
      currentLevel,
      nextLevel,
      progress: Math.min(100, Math.max(0, progress)),
      pointsNeeded: Math.max(0, pointsNeeded)
    };
  }
}

// Export singleton instance
export const gamingPointsCalculator = new GamingPointsCalculator();
