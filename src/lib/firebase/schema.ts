/**
 * Firebase Firestore Schema and Types
 * 
 * Defines the complete data model for the production-grade EcoQuest system
 * with proper typing, validation, and indexing strategies.
 */

import { Timestamp } from 'firebase/firestore';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  SMART_METERS: 'smartMeters',
  DEVICES: 'devices',
  READINGS: 'readings',
  QUESTS: 'quests',
  USER_QUESTS: 'userQuests',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  BILLING: 'billing',
  ENERGY_TIPS: 'energyTips',
  LEADERBOARD: 'leaderboard'
} as const;

// Base Document Interface
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

// User Management
export interface UserProfile extends BaseDocument {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // Profile Information
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  
  // Home Information
  homeInfo: {
    homeType: 'apartment' | 'house' | 'condo' | 'townhouse' | 'other';
    homeSize: number; // sq ft
    occupants: number;
    yearBuilt?: number;
    energyProvider: string;
    averageMonthlyBill: number;
    features: {
      hasGarden: boolean;
      hasSolarPanels: boolean;
      hasEVCharging: boolean;
      hasSmartThermostat: boolean;
      hasSmartLights: boolean;
    };
  };
  
  // Preferences and Settings
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      inApp: boolean;
    };
    privacy: {
      shareUsageData: boolean;
      joinCommunity: boolean;
      showInLeaderboards: boolean;
      dataRetention: 'minimal' | 'standard' | 'extended';
    };
    goals: {
      primary: 'save_money' | 'reduce_carbon' | 'energy_independence' | 'smart_automation';
      targetSavings: number; // percentage
      targetReduction: number; // kWh per month
      carbonReductionGoal: number; // kg CO2 per month
    };
    ui: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      currency: string;
      units: 'metric' | 'imperial';
    };
  };
  
  // Gamification
  gamification: {
    level: number;
    totalPoints: number;
    badges: string[];
    achievements: string[];
    streakDays: number;
    lastActiveDate: Timestamp;
  };
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'suspended';
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd?: Timestamp;
    features: string[];
  };
  
  // Onboarding and Setup
  onboardingCompleted: boolean;
  onboardingStep?: string;
  setupCompleted: boolean;
  lastLoginAt?: Timestamp;
}

// Smart Meter Management
export interface SmartMeter extends BaseDocument {
  userId: string;
  meterId: string; // Physical meter ID
  providerId: string; // Energy provider
  
  // Installation Details
  installation: {
    installDate: Timestamp;
    location: string;
    meterType: string;
    voltage: number;
    phases: 1 | 3;
    maxCapacity: number; // Amps
  };
  
  // Configuration
  config: {
    tariffRate: number;
    currency: string;
    timezone: string;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    readingInterval: number; // minutes
    alertThresholds: {
      highUsage: number; // kW
      lowVoltage: number; // V
      highVoltage: number; // V
      powerFactor: number;
    };
  };
  
  // Current Status
  status: {
    isOnline: boolean;
    lastReading: Timestamp;
    lastMaintenanceDate?: Timestamp;
    nextMaintenanceDate?: Timestamp;
    firmwareVersion?: string;
    signalStrength?: number;
    batteryLevel?: number;
  };
  
  // Aggregated Data (for performance)
  aggregated: {
    totalDevices: number;
    activeDevices: number;
    todayUsage: number; // kWh
    monthlyUsage: number; // kWh
    averageUsage: number; // kWh per day
    peakDemand: number; // kW
    efficiencyScore: number; // 0-10
  };
}

// Device Management
export interface Device extends BaseDocument {
  userId: string;
  smartMeterId: string;
  deviceId: string; // Unique device identifier
  
  // Device Information
  info: {
    name: string;
    brand: string;
    model?: string;
    category: 'essential' | 'comfort' | 'entertainment' | 'productivity';
    type: 'ac_meter' | 'light' | 'appliance_meter' | 'plug_meter' | 'outlet' | 'main_meter';
    room: string;
    installDate?: Timestamp;
  };
  
  // Specifications
  specs: {
    ratedPower: number; // Watts
    voltage: number; // Volts
    energyRating?: string; // A+, A, B, etc.
    estimatedLifespan?: number; // years
    warrantyExpiry?: Timestamp;
  };
  
  // Current State
  state: {
    isOnline: boolean;
    isOn: boolean;
    currentPower: number; // Watts
    temperature?: number; // Celsius
    brightness?: number; // 0-100
    speed?: number; // 1-5 for fans
    mode?: string; // Device-specific mode
    lastStateChange: Timestamp;
  };
  
  // Usage Statistics
  usage: {
    dailyUsage: number; // kWh
    weeklyUsage: number; // kWh
    monthlyUsage: number; // kWh
    yearlyUsage: number; // kWh
    totalUsage: number; // kWh lifetime
    operatingHours: number; // lifetime hours
    cycleCount?: number; // for appliances
  };
  
  // Smart Features
  smart: {
    isSmartEnabled: boolean;
    hasScheduling: boolean;
    hasRemoteControl: boolean;
    hasEnergyMonitoring: boolean;
    supportedFeatures: string[];
    firmwareVersion?: string;
  };
  
  // Maintenance and Health
  health: {
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    lastMaintenance?: Timestamp;
    nextMaintenance?: Timestamp;
    maintenanceHistory: {
      date: Timestamp;
      type: string;
      notes: string;
      cost?: number;
    }[];
    alerts: string[];
  };
  
  // Goals and Automation
  automation: {
    energyGoal?: number; // kWh per month
    schedules: {
      id: string;
      name: string;
      enabled: boolean;
      schedule: string; // Cron expression
      action: string;
      parameters: Record<string, any>;
    }[];
    rules: {
      id: string;
      name: string;
      enabled: boolean;
      trigger: string;
      condition: string;
      action: string;
      parameters: Record<string, any>;
    }[];
  };
}

// Energy Readings
export interface EnergyReading extends BaseDocument {
  userId: string;
  smartMeterId: string;
  deviceId?: string; // Optional - for device-specific readings
  
  // Reading Data
  reading: {
    timestamp: Timestamp;
    instantPower: number; // kW
    energy: number; // kWh
    voltage: {
      r?: number;
      y?: number;
      b?: number;
      average: number;
    };
    current: {
      r?: number;
      y?: number;
      b?: number;
      average: number;
    };
    frequency: number; // Hz
    powerFactor: number;
  };
  
  // Calculated Metrics
  metrics: {
    cost: number; // Currency units
    co2Emissions: number; // kg CO2
    efficiency: number; // 0-10 scale
    demand: number; // kW peak
  };
  
  // Quality Indicators
  quality: {
    reliability: number; // 0-1
    accuracy: number; // 0-1
    source: 'meter' | 'estimated' | 'interpolated';
    confidence: number; // 0-1
  };
  
  // Context
  context: {
    weather?: {
      temperature: number;
      humidity: number;
      condition: string;
    };
    occupancy?: boolean;
    timeOfUse: 'peak' | 'off_peak' | 'standard';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
  };
}

// Quest System
export interface Quest extends BaseDocument {
  // Quest Definition
  definition: {
    title: string;
    description: string;
    category: 'efficiency' | 'consumption' | 'timing' | 'automation' | 'maintenance' | 'education';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    icon: string;
    tags: string[];
  };
  
  // Quest Mechanics
  mechanics: {
    target: number;
    unit: string;
    metric: string; // What to measure
    condition: string; // Success condition
    duration: number; // Days
    maxAttempts?: number;
  };
  
  // Rewards
  rewards: {
    points: number;
    badge?: string;
    discount?: {
      amount: number;
      type: 'percentage' | 'fixed';
      validUntil: Timestamp;
    };
    unlocks?: string[]; // Features or content unlocked
  };
  
  // Availability
  availability: {
    startDate: Timestamp;
    endDate: Timestamp;
    userLevelMin?: number;
    userLevelMax?: number;
    prerequisites?: string[];
    maxCompletions?: number; // Per user
  };
  
  // Metadata
  metadata: {
    isActive: boolean;
    totalCompletions: number;
    averageCompletionTime: number; // Hours
    successRate: number; // 0-1
    createdBy: string;
    approvedBy?: string;
  };
}

// User Quest Progress
export interface UserQuest extends BaseDocument {
  userId: string;
  questId: string;
  
  // Progress Tracking
  progress: {
    status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
    currentValue: number;
    targetValue: number;
    percentage: number; // 0-100
    startedAt: Timestamp;
    completedAt?: Timestamp;
    lastUpdated: Timestamp;
  };
  
  // Tracking Data
  tracking: {
    attempts: number;
    hints: string[];
    milestones: {
      timestamp: Timestamp;
      value: number;
      message: string;
    }[];
    deviceIds: string[]; // Devices involved
  };
  
  // Results
  results?: {
    energySaved: number; // kWh
    costSaved: number; // Currency
    co2Reduced: number; // kg CO2
    pointsEarned: number;
    badgeEarned?: string;
    achievements: string[];
  };
}

// Analytics and Insights
export interface AnalyticsData extends BaseDocument {
  userId: string;
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Timestamp;
    endDate: Timestamp;
  };
  
  // Energy Analytics
  energy: {
    totalUsage: number; // kWh
    averageUsage: number; // kWh per day
    peakUsage: number; // kW
    peakTime: string; // HH:mm
    baseLoad: number; // kW
    efficiency: number; // 0-10
    
    // Breakdown by category
    byCategory: {
      heating: number;
      cooling: number;
      lighting: number;
      appliances: number;
      electronics: number;
      other: number;
    };
    
    // Breakdown by time
    byHour: number[]; // 24 elements
    byDayOfWeek: number[]; // 7 elements
    byMonth?: number[]; // 12 elements for yearly
  };
  
  // Cost Analytics
  cost: {
    totalCost: number;
    averageDailyCost: number;
    projectedMonthlyCost: number;
    savings: number;
    savingsPercentage: number;
    tariffBreakdown: {
      energy: number;
      demand: number;
      fixed: number;
      taxes: number;
    };
  };
  
  // Environmental Impact
  environmental: {
    co2Emissions: number; // kg CO2
    co2Saved: number; // kg CO2
    treesEquivalent: number;
    carbonFootprint: number; // kg CO2 per month
    renewablePercentage: number;
  };
  
  // Performance Metrics
  performance: {
    efficiencyScore: number; // 0-10
    consistencyScore: number; // 0-10
    improvementTrend: 'improving' | 'stable' | 'declining';
    benchmarkComparison: {
      similar_homes: number; // Percentage better/worse
      regional_average: number;
      national_average: number;
    };
  };
  
  // Recommendations
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    potentialSavings: {
      energy: number; // kWh
      cost: number; // Currency
      co2: number; // kg CO2
    };
    implementationCost?: number;
    paybackPeriod?: number; // months
  }[];
}

// Notification System
export interface Notification extends BaseDocument {
  userId: string;
  
  // Notification Content
  content: {
    type: 'alert' | 'info' | 'success' | 'warning' | 'achievement';
    title: string;
    message: string;
    icon?: string;
    imageUrl?: string;
    actionUrl?: string;
    actionText?: string;
  };
  
  // Delivery Channels
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  
  // Status
  status: {
    isRead: boolean;
    readAt?: Timestamp;
    deliveryStatus: 'pending' | 'delivered' | 'failed';
    deliveredAt?: Timestamp;
  };
  
  // Classification
  classification: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'energy' | 'billing' | 'maintenance' | 'achievement' | 'system' | 'marketing';
    tags: string[];
    expiry?: Timestamp;
  };
  
  // Context
  context: {
    triggeredBy?: string; // Event that triggered this notification
    relatedEntity?: {
      type: string;
      id: string;
    };
    metadata?: Record<string, any>;
  };
}

// Billing Information
export interface BillingInfo extends BaseDocument {
  userId: string;
  smartMeterId: string;
  
  // Bill Details
  bill: {
    billNumber: string;
    billDate: Timestamp;
    dueDate: Timestamp;
    periodStart: Timestamp;
    periodEnd: Timestamp;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'disputed';
  };
  
  // Usage Details
  usage: {
    totalUnits: number; // kWh
    peakUnits: number; // kWh
    offPeakUnits: number; // kWh
    maxDemand: number; // kW
    averageDemand: number; // kW
    powerFactor: number;
  };
  
  // Cost Breakdown
  costs: {
    energyCharges: number;
    demandCharges: number;
    fixedCharges: number;
    taxes: number;
    adjustments: number;
    totalAmount: number;
    currency: string;
  };
  
  // Payment Information
  payment?: {
    paidAt: Timestamp;
    amount: number;
    method: string;
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
  };
  
  // Comparison
  comparison: {
    previousBill: {
      amount: number;
      usage: number;
      change: number; // Percentage
    };
    samePeriodLastYear: {
      amount: number;
      usage: number;
      change: number; // Percentage
    };
    averageBill: {
      amount: number;
      usage: number;
      change: number; // Percentage
    };
  };
}

// Type Guards
export const isUserProfile = (doc: any): doc is UserProfile => {
  return doc && typeof doc.uid === 'string' && typeof doc.email === 'string';
};

export const isSmartMeter = (doc: any): doc is SmartMeter => {
  return doc && typeof doc.meterId === 'string' && typeof doc.userId === 'string';
};

export const isDevice = (doc: any): doc is Device => {
  return doc && typeof doc.deviceId === 'string' && typeof doc.smartMeterId === 'string';
};

export const isEnergyReading = (doc: any): doc is EnergyReading => {
  return doc && doc.reading && typeof doc.reading.instantPower === 'number';
};

// Helper Types
export type DocumentReference<T> = {
  id: string;
  ref: any; // Firebase DocumentReference
  data: T;
};

export type CollectionQuery<T> = {
  where?: [string, any, any][];
  orderBy?: [string, 'asc' | 'desc'][];
  limit?: number;
  startAfter?: any;
  endBefore?: any;
};

// Export all types
export type {
  BaseDocument,
  UserProfile,
  SmartMeter,
  Device,
  EnergyReading,
  Quest,
  UserQuest,
  AnalyticsData,
  Notification,
  BillingInfo
};