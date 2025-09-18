/**
 * Central Smart Meter Management System
 * 
 * This is the core service that manages a single smart meter instance
 * and all connected appliances, providing a unified interface for
 * energy monitoring, device control, and quest generation.
 */

import { SmartMeterDevice } from './types';
import { SmartMeterAPI, SmartMeterReading } from './smart-meter-apis';

export interface SmartMeterSystem {
  meterId: string;
  userId: string;
  provider: string;
  location: string;
  installationDate: Date;
  status: 'active' | 'inactive' | 'maintenance';
  tariffRate: number;
  
  // Real-time readings
  currentReading: SmartMeterReading | null;
  lastUpdated: Date;
  
  // Connected devices/appliances
  connectedDevices: Map<string, SmartMeterDevice>;
  
  // System health
  isOnline: boolean;
  lastHealthCheck: Date;
}

export interface ApplianceUsagePattern {
  deviceId: string;
  deviceName: string;
  averageUsage: number; // kWh per day
  peakUsageTime: string; // HH:mm format
  usagePattern: 'constant' | 'scheduled' | 'manual' | 'automatic';
  efficiencyRating: number; // 0-10 scale
  lastUsed: Date;
  totalUsageToday: number;
  totalUsageThisMonth: number;
  estimatedCost: number; // per month
}

export interface QuestGenerationData {
  deviceUsagePatterns: ApplianceUsagePattern[];
  totalConsumption: number;
  peakUsageTime: string;
  efficiencyScore: number;
  potentialSavings: number;
  carbonFootprint: number;
}

class SmartMeterSystemManager {
  private meterSystem: SmartMeterSystem | null = null;
  private api: SmartMeterAPI | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: SmartMeterSystem) => void> = new Set();

  constructor() {
    this.initializeSystem();
  }

  /**
   * Initialize the smart meter system for a user
   */
  async initializeSystem(userId: string = 'demo-user', providerId: string = 'qube'): Promise<void> {
    try {
      // Initialize API connection
      this.api = new SmartMeterAPI(providerId, {
        apiKey: process.env.NEXT_PUBLIC_SMART_METER_API_KEY || 'demo-key'
      });

      // Create meter system instance
      this.meterSystem = {
        meterId: `SM_${userId}_${Date.now()}`,
        userId,
        provider: providerId,
        location: 'Hyderabad, IN',
        installationDate: new Date(),
        status: 'active',
        tariffRate: 6.5, // ₹ per kWh
        currentReading: null,
        lastUpdated: new Date(),
        connectedDevices: new Map(),
        isOnline: true,
        lastHealthCheck: new Date()
      };

      // Start real-time monitoring
      this.startRealTimeMonitoring();

      console.log('Smart Meter System initialized:', this.meterSystem.meterId);
    } catch (error) {
      console.error('Failed to initialize Smart Meter System:', error);
      throw error;
    }
  }

  /**
   * Add a new appliance to the smart meter system
   */
  async addAppliance(device: Omit<SmartMeterDevice, 'id' | 'lastReading'>): Promise<string> {
    if (!this.meterSystem) throw new Error('Smart meter system not initialized');

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const smartDevice: SmartMeterDevice = {
      ...device,
      id: deviceId,
      lastReading: new Date(),
      currentUsage: this.generateRealisticUsage(device.type),
      dailyUsage: 0,
      monthlyUsage: 0
    };

    this.meterSystem.connectedDevices.set(deviceId, smartDevice);
    
    // Notify subscribers about the device addition
    this.notifySubscribers();
    
    console.log(`Appliance added: ${device.brand} ${device.type} (${deviceId})`);
    return deviceId;
  }

  /**
   * Remove an appliance from the smart meter system
   */
  async removeAppliance(deviceId: string): Promise<boolean> {
    if (!this.meterSystem) throw new Error('Smart meter system not initialized');

    const removed = this.meterSystem.connectedDevices.delete(deviceId);
    if (removed) {
      this.notifySubscribers();
      console.log(`Appliance removed: ${deviceId}`);
    }
    return removed;
  }

  /**
   * Get current smart meter reading with device breakdown
   */
  async getCurrentReading(): Promise<SmartMeterReading & { deviceBreakdown: ApplianceUsagePattern[] }> {
    if (!this.meterSystem || !this.api) throw new Error('Smart meter system not initialized');

    try {
      const reading = await this.api.getCurrentReading(this.meterSystem.meterId);
      
      // Calculate device-specific usage
      const deviceBreakdown = this.calculateDeviceBreakdown();
      
      // Update system state
      this.meterSystem.currentReading = reading;
      this.meterSystem.lastUpdated = new Date();
      
      return {
        ...reading,
        deviceBreakdown
      };
    } catch (error) {
      console.error('Failed to get current reading:', error);
      throw error;
    }
  }

  /**
   * Get all connected appliances
   */
  getConnectedDevices(): SmartMeterDevice[] {
    if (!this.meterSystem) return [];
    return Array.from(this.meterSystem.connectedDevices.values());
  }

  /**
   * Get appliance usage patterns for quest generation
   */
  getQuestGenerationData(): QuestGenerationData | null {
    if (!this.meterSystem) return null;

    const deviceUsagePatterns = this.calculateDeviceBreakdown();
    const totalConsumption = deviceUsagePatterns.reduce((sum, pattern) => sum + pattern.averageUsage, 0);
    
    return {
      deviceUsagePatterns,
      totalConsumption,
      peakUsageTime: this.calculatePeakUsageTime(deviceUsagePatterns),
      efficiencyScore: this.calculateEfficiencyScore(deviceUsagePatterns),
      potentialSavings: this.calculatePotentialSavings(deviceUsagePatterns),
      carbonFootprint: totalConsumption * 0.82 // kg CO2 per kWh
    };
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback: (data: SmartMeterSystem) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately provide current state
    if (this.meterSystem) {
      callback(this.meterSystem);
    }
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get system status and health information
   */
  getSystemStatus(): {
    isOnline: boolean;
    connectedDevices: number;
    lastUpdate: Date;
    totalEnergyToday: number;
    estimatedBillThisMonth: number;
  } {
    if (!this.meterSystem) {
      return {
        isOnline: false,
        connectedDevices: 0,
        lastUpdate: new Date(),
        totalEnergyToday: 0,
        estimatedBillThisMonth: 0
      };
    }

    const deviceBreakdown = this.calculateDeviceBreakdown();
    const totalEnergyToday = deviceBreakdown.reduce((sum, pattern) => sum + pattern.totalUsageToday, 0);
    const estimatedBillThisMonth = deviceBreakdown.reduce((sum, pattern) => sum + pattern.estimatedCost, 0);

    return {
      isOnline: this.meterSystem.isOnline,
      connectedDevices: this.meterSystem.connectedDevices.size,
      lastUpdate: this.meterSystem.lastUpdated,
      totalEnergyToday,
      estimatedBillThisMonth
    };
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.updateRealTimeData();
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update real-time data for all devices
   */
  private async updateRealTimeData(): Promise<void> {
    if (!this.meterSystem) return;

    // Update device readings
    for (const [deviceId, device] of this.meterSystem.connectedDevices) {
      const newUsage = this.generateRealisticUsage(device.type, device.currentUsage);
      device.currentUsage = newUsage;
      device.lastReading = new Date();
      
      // Update daily/monthly usage
      const hoursSinceLastUpdate = (Date.now() - device.lastReading.getTime()) / (1000 * 60 * 60);
      device.dailyUsage = (device.dailyUsage || 0) + (newUsage * hoursSinceLastUpdate);
      device.monthlyUsage = (device.monthlyUsage || 0) + (newUsage * hoursSinceLastUpdate);
    }

    this.meterSystem.lastUpdated = new Date();
    this.meterSystem.lastHealthCheck = new Date();
    this.notifySubscribers();
  }

  /**
   * Calculate device usage breakdown
   */
  private calculateDeviceBreakdown(): ApplianceUsagePattern[] {
    if (!this.meterSystem) return [];

    return Array.from(this.meterSystem.connectedDevices.values()).map(device => {
      const averageUsage = this.getAverageUsageForDevice(device);
      const peakUsageTime = this.getPeakUsageTimeForDevice(device);
      
      return {
        deviceId: device.id,
        deviceName: `${device.brand} ${device.type}`,
        averageUsage,
        peakUsageTime,
        usagePattern: this.getUsagePattern(device.type),
        efficiencyRating: this.getEfficiencyRating(device),
        lastUsed: device.lastReading,
        totalUsageToday: device.dailyUsage || 0,
        totalUsageThisMonth: device.monthlyUsage || 0,
        estimatedCost: (device.monthlyUsage || 0) * (this.meterSystem?.tariffRate || 6.5)
      };
    });
  }

  /**
   * Generate realistic usage patterns for different device types
   */
  private generateRealisticUsage(deviceType: string, currentUsage?: number): number {
    const baseUsage = currentUsage || 0;
    const now = new Date();
    const hour = now.getHours();
    
    // Define usage patterns based on device type and time of day
    const patterns: Record<string, { base: number; variation: number; peakHours: number[] }> = {
      'ac_meter': { base: 1.5, variation: 0.8, peakHours: [14, 15, 16, 21, 22, 23] },
      'light': { base: 0.06, variation: 0.02, peakHours: [6, 7, 18, 19, 20, 21, 22] },
      'appliance_meter': { base: 0.5, variation: 0.3, peakHours: [7, 8, 18, 19, 20] },
      'plug_meter': { base: 0.2, variation: 0.1, peakHours: [9, 10, 11, 14, 15, 16] },
      'outlet': { base: 0.1, variation: 0.05, peakHours: [19, 20, 21, 22] },
      'main_meter': { base: 2.0, variation: 1.0, peakHours: [7, 8, 18, 19, 20, 21] }
    };

    const pattern = patterns[deviceType] || patterns['appliance_meter'];
    const isPeakHour = pattern.peakHours.includes(hour);
    const multiplier = isPeakHour ? 1.5 : 0.7;
    
    // Add some randomness for realistic simulation
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return Math.max(0, pattern.base * multiplier * randomFactor + (Math.random() - 0.5) * pattern.variation);
  }

  /**
   * Calculate average usage for a device
   */
  private getAverageUsageForDevice(device: SmartMeterDevice): number {
    // Base on device type and current usage
    const typeMultipliers: Record<string, number> = {
      'ac_meter': 12.0, // kWh per day
      'light': 0.5,
      'appliance_meter': 3.0,
      'plug_meter': 2.0,
      'outlet': 1.0,
      'main_meter': 20.0
    };

    return typeMultipliers[device.type] || 2.0;
  }

  /**
   * Get peak usage time for device type
   */
  private getPeakUsageTimeForDevice(device: SmartMeterDevice): string {
    const peakTimes: Record<string, string> = {
      'ac_meter': '15:00',
      'light': '19:00',
      'appliance_meter': '08:00',
      'plug_meter': '14:00',
      'outlet': '20:00',
      'main_meter': '19:00'
    };

    return peakTimes[device.type] || '19:00';
  }

  /**
   * Determine usage pattern for device type
   */
  private getUsagePattern(deviceType: string): 'constant' | 'scheduled' | 'manual' | 'automatic' {
    const patterns: Record<string, 'constant' | 'scheduled' | 'manual' | 'automatic'> = {
      'ac_meter': 'automatic',
      'light': 'scheduled',
      'appliance_meter': 'manual',
      'plug_meter': 'manual',
      'outlet': 'manual',
      'main_meter': 'constant'
    };

    return patterns[deviceType] || 'manual';
  }

  /**
   * Calculate efficiency rating for device
   */
  private getEfficiencyRating(device: SmartMeterDevice): number {
    let rating = 7; // Base rating

    // Adjust based on device age (if available)
    if (device.temperature !== undefined) { // Assuming newer devices have temperature sensors
      rating += 1;
    }

    // Add randomness for demo purposes
    rating += (Math.random() - 0.5) * 2;
    
    return Math.max(1, Math.min(10, Math.round(rating * 10) / 10));
  }

  /**
   * Calculate peak usage time across all devices
   */
  private calculatePeakUsageTime(patterns: ApplianceUsagePattern[]): string {
    if (patterns.length === 0) return '19:00';
    
    // Find the most common peak time
    const peakTimes = patterns.map(p => p.peakUsageTime);
    const timeCount = peakTimes.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(timeCount).sort(([,a], [,b]) => b - a)[0][0] || '19:00';
  }

  /**
   * Calculate overall efficiency score
   */
  private calculateEfficiencyScore(patterns: ApplianceUsagePattern[]): number {
    if (patterns.length === 0) return 7;
    
    const avgEfficiency = patterns.reduce((sum, p) => sum + p.efficiencyRating, 0) / patterns.length;
    return Math.round(avgEfficiency * 10) / 10;
  }

  /**
   * Calculate potential savings
   */
  private calculatePotentialSavings(patterns: ApplianceUsagePattern[]): number {
    const totalCost = patterns.reduce((sum, p) => sum + p.estimatedCost, 0);
    const avgEfficiency = patterns.reduce((sum, p) => sum + p.efficiencyRating, 0) / patterns.length;
    
    // Lower efficiency means higher potential savings
    const savingsMultiplier = Math.max(0.1, (10 - avgEfficiency) / 10);
    return Math.round(totalCost * savingsMultiplier * 0.3); // Up to 30% savings
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    if (this.meterSystem) {
      this.subscribers.forEach(callback => {
        try {
          callback(this.meterSystem!);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers.clear();
    this.meterSystem = null;
    this.api = null;
  }
}

// Export singleton instance
export const smartMeterSystem = new SmartMeterSystemManager();
export default SmartMeterSystemManager;