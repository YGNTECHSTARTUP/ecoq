'use client';

/**
 * Unified Dashboard State Management Hook
 * 
 * This hook provides a single source of truth for all dashboard data,
 * replacing the dispersed data simulation approach with unified state
 * management from the central smart meter system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { smartMeterSystem, SmartMeterSystem, QuestGenerationData, ApplianceUsagePattern } from '@/lib/smart-meter-system';
import { deviceRegistry, RegisteredDevice, DeviceStats } from '@/lib/device-registry';
import { SmartMeterReading } from '@/lib/smart-meter-apis';
import type { Quest, Overview, SmartMeterDevice } from '@/lib/types';

export interface DashboardState {
  // Smart Meter Data
  meterSystem: SmartMeterSystem | null;
  currentReading: SmartMeterReading | null;
  isOnline: boolean;
  lastUpdate: Date;
  
  // Device Data
  registeredDevices: RegisteredDevice[];
  connectedDevices: SmartMeterDevice[];
  deviceStats: DeviceStats;
  
  // Analytics Data
  questGenerationData: QuestGenerationData | null;
  deviceUsagePatterns: ApplianceUsagePattern[];
  
  // Dashboard Aggregations
  overview: Overview;
  activeQuests: Quest[];
  
  // System Status
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface DashboardActions {
  refreshData: () => Promise<void>;
  addDevice: (deviceRequest: {
    name: string;
    brand: string;
    type: SmartMeterDevice['type'];
    location: string;
    room: string;
  }) => Promise<string>;
  removeDevice: (deviceId: string) => Promise<boolean>;
  generateQuests: () => Promise<Quest[]>;
  updateDeviceSettings: (deviceId: string, settings: any) => Promise<boolean>;
}

export interface SmartMeterDashboardHook {
  state: DashboardState;
  actions: DashboardActions;
}

// Mock quest data for demo purposes until AI generation is implemented
const generateMockQuests = (questData: QuestGenerationData | null): Quest[] => {
  if (!questData || questData.deviceUsagePatterns.length === 0) {
    return [];
  }

  const quests: Quest[] = [];
  const { deviceUsagePatterns, totalConsumption, peakUsageTime, efficiencyScore, potentialSavings } = questData;

  // High consumption devices quest
  const highConsumptionDevices = deviceUsagePatterns.filter(d => d.averageUsage > 5);
  if (highConsumptionDevices.length > 0) {
    quests.push({
      id: 'reduce-high-consumption',
      title: 'Tame the Energy Beasts',
      description: `Reduce usage of ${highConsumptionDevices[0].deviceName} by 20% to save ₹${Math.round(potentialSavings * 0.3)}/month`,
      progress: Math.floor(Math.random() * 30),
      target: 100,
      unit: '%',
      reward: 350,
      type: 'daily',
      icon: () => '⚡',
      isNew: true
    });
  }

  // Peak usage optimization quest
  if (peakUsageTime && totalConsumption > 10) {
    quests.push({
      id: 'optimize-peak-hours',
      title: 'Peak Hour Champion',
      description: `Shift ${Math.round(totalConsumption * 0.2)}kWh away from peak time (${peakUsageTime}) this week`,
      progress: Math.floor(Math.random() * 40),
      target: 100,
      unit: '%',
      reward: 500,
      type: 'weekly',
      icon: () => '🌟',
    });
  }

  // Efficiency improvement quest
  if (efficiencyScore < 8) {
    quests.push({
      id: 'efficiency-boost',
      title: 'Efficiency Master',
      description: `Improve your home's efficiency score from ${efficiencyScore.toFixed(1)} to ${(efficiencyScore + 1).toFixed(1)}`,
      progress: Math.floor((efficiencyScore - 5) * 20),
      target: 100,
      unit: 'score',
      reward: 750,
      type: 'weekly',
      icon: () => '📈',
    });
  }

  // Device-specific quests
  const acDevices = deviceUsagePatterns.filter(d => d.deviceName.toLowerCase().includes('ac'));
  if (acDevices.length > 0 && acDevices[0].averageUsage > 8) {
    quests.push({
      id: 'ac-optimization',
      title: 'Cool & Efficient',
      description: `Keep AC temperature at 24°C+ for 3 days to save ₹${Math.round(acDevices[0].estimatedCost * 0.15)}/month`,
      progress: Math.floor(Math.random() * 60),
      target: 3,
      unit: 'days',
      reward: 400,
      type: 'daily',
      icon: () => '❄️',
    });
  }

  // Lighting efficiency quest
  const lightDevices = deviceUsagePatterns.filter(d => d.deviceName.toLowerCase().includes('light'));
  if (lightDevices.length > 2) {
    quests.push({
      id: 'lighting-efficiency',
      title: 'Bright Ideas',
      description: `Turn off lights in unused rooms - save ${Math.round(lightDevices.length * 0.5)}kWh this week`,
      progress: Math.floor(Math.random() * 45),
      target: Math.round(lightDevices.length * 0.5),
      unit: 'kWh',
      reward: 250,
      type: 'daily',
      icon: () => '💡',
    });
  }

  return quests.slice(0, 4); // Return top 4 quests
};

export const useSmartMeterDashboard = (): SmartMeterDashboardHook => {
  const [state, setState] = useState<DashboardState>({
    meterSystem: null,
    currentReading: null,
    isOnline: false,
    lastUpdate: new Date(),
    registeredDevices: [],
    connectedDevices: [],
    deviceStats: {
      totalDevices: 0,
      activeDevices: 0,
      totalEnergyConsumption: 0,
      averageEfficiencyRating: 7,
      devicesByCategory: {
        essential: 0,
        comfort: 0,
        entertainment: 0,
        productivity: 0
      },
      devicesByType: {
        main_meter: 0,
        plug_meter: 0,
        ac_meter: 0,
        appliance_meter: 0,
        light: 0,
        outlet: 0
      },
      devicesByRoom: {}
    },
    questGenerationData: null,
    deviceUsagePatterns: [],
    overview: {
      wattsPoints: 0,
      kwhSaved: 0,
      moneySaved: 0,
      questsCompleted: 0
    },
    activeQuests: [],
    loading: true,
    error: null,
    initialized: false
  });

  // Initialize the smart meter system
  const initializeSystem = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Initialize smart meter system if not already done
      if (!state.initialized) {
        await smartMeterSystem.initializeSystem('demo-user-123', 'qube');
      }

      // Get initial data
      await refreshData();
      
      setState(prev => ({ ...prev, initialized: true, loading: false }));
    } catch (error) {
      console.error('Failed to initialize smart meter system:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize system',
        loading: false 
      }));
    }
  }, [state.initialized]);

  // Refresh all dashboard data
  const refreshData = useCallback(async () => {
    try {
      // Get smart meter system status
      const systemStatus = smartMeterSystem.getSystemStatus();
      
      // Get current reading with device breakdown
      const currentReading = await smartMeterSystem.getCurrentReading().catch(() => null);
      
      // Get connected devices from smart meter
      const connectedDevices = smartMeterSystem.getConnectedDevices();
      
      // Get registered devices from registry
      const registeredDevices = deviceRegistry.getAllDevices();
      
      // Get device statistics
      const deviceStats = deviceRegistry.getDeviceStats();
      
      // Get quest generation data
      const questGenerationData = smartMeterSystem.getQuestGenerationData();
      
      // Calculate overview metrics
      const totalEnergyToday = systemStatus.totalEnergyToday;
      const estimatedMonthlySavings = questGenerationData?.potentialSavings || 0;
      
      const overview: Overview = {
        wattsPoints: Math.round(totalEnergyToday * 10), // 10 points per kWh saved
        kwhSaved: Math.round(totalEnergyToday * 0.15), // Assume 15% savings
        moneySaved: Math.round(estimatedMonthlySavings),
        questsCompleted: Math.floor(Math.random() * 5) + 2 // Mock completed quests
      };
      
      // Generate active quests
      const activeQuests = generateMockQuests(questGenerationData);
      
      setState(prev => ({
        ...prev,
        meterSystem: null, // Will be set by subscription
        currentReading,
        isOnline: systemStatus.isOnline,
        lastUpdate: systemStatus.lastUpdate,
        registeredDevices,
        connectedDevices,
        deviceStats,
        questGenerationData,
        deviceUsagePatterns: questGenerationData?.deviceUsagePatterns || [],
        overview,
        activeQuests,
        loading: false,
        error: null
      }));
      
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        loading: false 
      }));
    }
  }, []);

  // Add a new device
  const addDevice = useCallback(async (deviceRequest: {
    name: string;
    brand: string;
    type: SmartMeterDevice['type'];
    location: string;
    room: string;
  }): Promise<string> => {
    try {
      const deviceId = await deviceRegistry.registerDevice({
        name: deviceRequest.name,
        brand: deviceRequest.brand,
        type: deviceRequest.type,
        location: deviceRequest.location,
        room: deviceRequest.room,
        category: 'comfort' // Default category
      });
      
      // Refresh data to get updated state
      await refreshData();
      
      return deviceId;
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  }, [refreshData]);

  // Remove a device
  const removeDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const removed = await deviceRegistry.unregisterDevice(deviceId);
      
      if (removed) {
        // Refresh data to get updated state
        await refreshData();
      }
      
      return removed;
    } catch (error) {
      console.error('Failed to remove device:', error);
      return false;
    }
  }, [refreshData]);

  // Generate new quests
  const generateQuests = useCallback(async (): Promise<Quest[]> => {
    const questData = smartMeterSystem.getQuestGenerationData();
    const newQuests = generateMockQuests(questData);
    
    setState(prev => ({ ...prev, activeQuests: newQuests }));
    return newQuests;
  }, []);

  // Update device settings
  const updateDeviceSettings = useCallback(async (deviceId: string, settings: any): Promise<boolean> => {
    try {
      const updated = await deviceRegistry.updateDevice(deviceId, settings);
      
      if (updated) {
        await refreshData();
      }
      
      return updated;
    } catch (error) {
      console.error('Failed to update device settings:', error);
      return false;
    }
  }, [refreshData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!state.initialized) {
      initializeSystem();
      return;
    }

    // Subscribe to smart meter system updates
    const unsubscribeSmartMeter = smartMeterSystem.subscribe((meterData) => {
      setState(prev => ({ ...prev, meterSystem: meterData }));
    });

    // Subscribe to device registry updates
    const unsubscribeRegistry = deviceRegistry.subscribe((devices) => {
      setState(prev => ({ ...prev, registeredDevices: devices }));
    });

    // Set up periodic data refresh
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 10000); // Refresh every 10 seconds

    return () => {
      unsubscribeSmartMeter();
      unsubscribeRegistry();
      clearInterval(refreshInterval);
    };
  }, [state.initialized, initializeSystem, refreshData]);

  // Actions object
  const actions: DashboardActions = {
    refreshData,
    addDevice,
    removeDevice,
    generateQuests,
    updateDeviceSettings
  };

  return {
    state,
    actions
  };
};

export default useSmartMeterDashboard;