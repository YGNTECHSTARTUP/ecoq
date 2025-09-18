/**
 * Smart Meter Device Registry
 * 
 * Manages the registration, tracking, and integration of all appliances
 * and devices with the single smart meter system.
 */

import { SmartMeterDevice } from './types';
import { smartMeterSystem, ApplianceUsagePattern } from './smart-meter-system';
import type { DeviceInfo } from './onboarding-manager';

export interface RegisteredDevice extends SmartMeterDevice {
  // Additional registry-specific fields
  registrationDate: Date;
  category: 'essential' | 'comfort' | 'entertainment' | 'productivity';
  room: string;
  nickname?: string;
  customSettings?: Record<string, any>;
  energyGoal?: number; // Target usage per month in kWh
  automationRules?: AutomationRule[];
  maintenanceSchedule?: MaintenanceSchedule;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'time' | 'usage' | 'weather' | 'occupancy';
  condition: Record<string, any>;
  action: 'turn_on' | 'turn_off' | 'adjust_setting' | 'send_alert';
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface MaintenanceSchedule {
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceType: 'cleaning' | 'filter_change' | 'inspection' | 'calibration';
  reminderEnabled: boolean;
}

export interface DeviceRegistrationRequest {
  name: string;
  brand: string;
  type: SmartMeterDevice['type'];
  location: string;
  room: string;
  category: RegisteredDevice['category'];
  nickname?: string;
  energyGoal?: number;
}

export interface DeviceStats {
  totalDevices: number;
  activeDevices: number;
  totalEnergyConsumption: number;
  averageEfficiencyRating: number;
  devicesByCategory: Record<RegisteredDevice['category'], number>;
  devicesByType: Record<SmartMeterDevice['type'], number>;
  devicesByRoom: Record<string, number>;
}

class DeviceRegistryManager {
  private devices: Map<string, RegisteredDevice> = new Map();
  private deviceCategories: Map<string, RegisteredDevice['category']> = new Map();
  private subscribers: Set<(devices: RegisteredDevice[]) => void> = new Set();

  constructor() {
    this.initializeDefaultCategories();
    this.subscribeToSmartMeter();
  }

  /**
   * Register a new device with the smart meter system
   */
  async registerDevice(request: DeviceRegistrationRequest): Promise<string> {
    try {
      // Create the device for the smart meter system
      const smartMeterDevice: Omit<SmartMeterDevice, 'id' | 'lastReading'> = {
        brand: request.brand as SmartMeterDevice['brand'],
        type: request.type,
        location: request.location,
        currentUsage: 0,
        dailyUsage: 0,
        monthlyUsage: 0,
        isOnline: true,
        temperature: request.type === 'ac_meter' ? 24 : undefined,
        status: request.type === 'light' ? 'off' : 'on'
      };

      // Add device to smart meter system
      const deviceId = await smartMeterSystem.addAppliance(smartMeterDevice);

      // Create registry entry
      const registeredDevice: RegisteredDevice = {
        ...smartMeterDevice,
        id: deviceId,
        lastReading: new Date(),
        registrationDate: new Date(),
        category: request.category,
        room: request.room,
        nickname: request.nickname,
        energyGoal: request.energyGoal,
        automationRules: [],
        maintenanceSchedule: this.createMaintenanceSchedule(request.type)
      };

      // Store in registry
      this.devices.set(deviceId, registeredDevice);
      this.deviceCategories.set(deviceId, request.category);

      // Notify subscribers
      this.notifySubscribers();

      console.log(`Device registered: ${request.name} (${deviceId})`);
      return deviceId;
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  /**
   * Register devices from onboarding flow
   */
  async registerDevicesFromOnboarding(devices: DeviceInfo[]): Promise<string[]> {
    const registeredIds: string[] = [];

    for (const device of devices) {
      try {
        const category = this.inferCategory(device.type);
        const room = this.inferRoom(device.name);

        const request: DeviceRegistrationRequest = {
          name: device.name,
          brand: device.brand || 'Generic',
          type: this.mapDeviceType(device.type),
          location: 'Home',
          room,
          category,
          nickname: device.name,
          energyGoal: device.estimatedUsage
        };

        const deviceId = await this.registerDevice(request);
        registeredIds.push(deviceId);
      } catch (error) {
        console.error(`Failed to register device from onboarding: ${device.name}`, error);
      }
    }

    return registeredIds;
  }

  /**
   * Unregister a device
   */
  async unregisterDevice(deviceId: string): Promise<boolean> {
    try {
      // Remove from smart meter system
      const removed = await smartMeterSystem.removeAppliance(deviceId);
      
      if (removed) {
        // Remove from registry
        this.devices.delete(deviceId);
        this.deviceCategories.delete(deviceId);
        
        // Notify subscribers
        this.notifySubscribers();
        
        console.log(`Device unregistered: ${deviceId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unregister device:', error);
      return false;
    }
  }

  /**
   * Get all registered devices
   */
  getAllDevices(): RegisteredDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): RegisteredDevice | null {
    return this.devices.get(deviceId) || null;
  }

  /**
   * Get devices by category
   */
  getDevicesByCategory(category: RegisteredDevice['category']): RegisteredDevice[] {
    return this.getAllDevices().filter(device => device.category === category);
  }

  /**
   * Get devices by room
   */
  getDevicesByRoom(room: string): RegisteredDevice[] {
    return this.getAllDevices().filter(device => device.room === room);
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: SmartMeterDevice['type']): RegisteredDevice[] {
    return this.getAllDevices().filter(device => device.type === type);
  }

  /**
   * Update device settings
   */
  async updateDevice(deviceId: string, updates: Partial<RegisteredDevice>): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    try {
      // Update registry entry
      const updatedDevice = { ...device, ...updates };
      this.devices.set(deviceId, updatedDevice);

      // Update category mapping if changed
      if (updates.category) {
        this.deviceCategories.set(deviceId, updates.category);
      }

      // Notify subscribers
      this.notifySubscribers();

      console.log(`Device updated: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('Failed to update device:', error);
      return false;
    }
  }

  /**
   * Add automation rule to device
   */
  addAutomationRule(deviceId: string, rule: Omit<AutomationRule, 'id'>): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const automationRule: AutomationRule = {
      ...rule,
      id: ruleId
    };

    device.automationRules = device.automationRules || [];
    device.automationRules.push(automationRule);

    this.devices.set(deviceId, device);
    this.notifySubscribers();

    console.log(`Automation rule added to device ${deviceId}: ${rule.name}`);
    return ruleId;
  }

  /**
   * Remove automation rule from device
   */
  removeAutomationRule(deviceId: string, ruleId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device || !device.automationRules) return false;

    const initialLength = device.automationRules.length;
    device.automationRules = device.automationRules.filter(rule => rule.id !== ruleId);

    if (device.automationRules.length < initialLength) {
      this.devices.set(deviceId, device);
      this.notifySubscribers();
      console.log(`Automation rule removed from device ${deviceId}: ${ruleId}`);
      return true;
    }

    return false;
  }

  /**
   * Get device statistics
   */
  getDeviceStats(): DeviceStats {
    const devices = this.getAllDevices();
    const smartMeterDevices = smartMeterSystem.getConnectedDevices();

    const activeDevices = smartMeterDevices.filter(d => d.isOnline).length;
    const totalEnergyConsumption = smartMeterDevices.reduce((sum, d) => sum + (d.currentUsage || 0), 0);

    // Calculate efficiency from smart meter data
    const questData = smartMeterSystem.getQuestGenerationData();
    const averageEfficiencyRating = questData?.efficiencyScore || 7;

    // Count by category
    const devicesByCategory = devices.reduce((acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    }, {} as Record<RegisteredDevice['category'], number>);

    // Count by type
    const devicesByType = devices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {} as Record<SmartMeterDevice['type'], number>);

    // Count by room
    const devicesByRoom = devices.reduce((acc, device) => {
      acc[device.room] = (acc[device.room] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDevices: devices.length,
      activeDevices,
      totalEnergyConsumption,
      averageEfficiencyRating,
      devicesByCategory,
      devicesByType,
      devicesByRoom
    };
  }

  /**
   * Get devices needing maintenance
   */
  getDevicesNeedingMaintenance(): RegisteredDevice[] {
    const now = new Date();
    return this.getAllDevices().filter(device => {
      if (!device.maintenanceSchedule?.nextMaintenanceDate) return false;
      return device.maintenanceSchedule.nextMaintenanceDate <= now;
    });
  }

  /**
   * Get high energy consumption devices
   */
  getHighEnergyDevices(threshold: number = 2.0): RegisteredDevice[] {
    const smartMeterDevices = smartMeterSystem.getConnectedDevices();
    const highUsageDeviceIds = smartMeterDevices
      .filter(d => (d.currentUsage || 0) > threshold)
      .map(d => d.id);

    return this.getAllDevices().filter(device => 
      highUsageDeviceIds.includes(device.id)
    );
  }

  /**
   * Subscribe to device updates
   */
  subscribe(callback: (devices: RegisteredDevice[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately provide current state
    callback(this.getAllDevices());
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Initialize default device type to category mappings
   */
  private initializeDefaultCategories(): void {
    // Default mappings for device type to category
    this.deviceCategories = new Map();
  }

  /**
   * Subscribe to smart meter system updates to sync device data
   */
  private subscribeToSmartMeter(): void {
    smartMeterSystem.subscribe((meterData) => {
      // Sync device data from smart meter to registry
      this.syncWithSmartMeter();
    });
  }

  /**
   * Sync registry data with smart meter system
   */
  private syncWithSmartMeter(): void {
    const smartMeterDevices = smartMeterSystem.getConnectedDevices();
    let hasChanges = false;

    // Update existing devices with latest smart meter data
    for (const smDevice of smartMeterDevices) {
      const registryDevice = this.devices.get(smDevice.id);
      if (registryDevice) {
        // Update with latest readings
        registryDevice.currentUsage = smDevice.currentUsage;
        registryDevice.dailyUsage = smDevice.dailyUsage;
        registryDevice.monthlyUsage = smDevice.monthlyUsage;
        registryDevice.lastReading = smDevice.lastReading;
        registryDevice.isOnline = smDevice.isOnline;
        registryDevice.temperature = smDevice.temperature;
        registryDevice.status = smDevice.status;

        this.devices.set(smDevice.id, registryDevice);
        hasChanges = true;
      }
    }

    // Remove devices that no longer exist in smart meter
    const smartMeterDeviceIds = new Set(smartMeterDevices.map(d => d.id));
    for (const [deviceId] of this.devices) {
      if (!smartMeterDeviceIds.has(deviceId)) {
        this.devices.delete(deviceId);
        this.deviceCategories.delete(deviceId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.notifySubscribers();
    }
  }

  /**
   * Infer device category from type
   */
  private inferCategory(deviceType: string): RegisteredDevice['category'] {
    const categoryMap: Record<string, RegisteredDevice['category']> = {
      'heating': 'essential',
      'cooling': 'comfort',
      'lighting': 'essential',
      'appliance': 'essential',
      'electronics': 'entertainment',
      'water_heating': 'essential'
    };

    return categoryMap[deviceType] || 'comfort';
  }

  /**
   * Infer room from device name
   */
  private inferRoom(deviceName: string): string {
    const name = deviceName.toLowerCase();
    
    if (name.includes('living') || name.includes('hall')) return 'Living Room';
    if (name.includes('kitchen')) return 'Kitchen';
    if (name.includes('bedroom') || name.includes('bed')) return 'Bedroom';
    if (name.includes('bathroom') || name.includes('bath')) return 'Bathroom';
    if (name.includes('dining')) return 'Dining Room';
    if (name.includes('office') || name.includes('study')) return 'Office';
    if (name.includes('garage')) return 'Garage';
    if (name.includes('basement')) return 'Basement';
    
    return 'General';
  }

  /**
   * Map onboarding device type to smart meter device type
   */
  private mapDeviceType(onboardingType: string): SmartMeterDevice['type'] {
    const typeMap: Record<string, SmartMeterDevice['type']> = {
      'heating': 'ac_meter',
      'cooling': 'ac_meter',
      'lighting': 'light',
      'appliance': 'appliance_meter',
      'electronics': 'plug_meter',
      'water_heating': 'appliance_meter'
    };

    return typeMap[onboardingType] || 'appliance_meter';
  }

  /**
   * Create maintenance schedule based on device type
   */
  private createMaintenanceSchedule(deviceType: SmartMeterDevice['type']): MaintenanceSchedule {
    const now = new Date();
    const scheduleMap: Record<SmartMeterDevice['type'], { months: number; type: MaintenanceSchedule['maintenanceType'] }> = {
      'ac_meter': { months: 3, type: 'filter_change' },
      'light': { months: 12, type: 'inspection' },
      'appliance_meter': { months: 6, type: 'cleaning' },
      'plug_meter': { months: 12, type: 'inspection' },
      'outlet': { months: 12, type: 'inspection' },
      'main_meter': { months: 12, type: 'calibration' }
    };

    const schedule = scheduleMap[deviceType] || { months: 6, type: 'inspection' };
    const nextMaintenanceDate = new Date(now);
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + schedule.months);

    return {
      nextMaintenanceDate,
      maintenanceType: schedule.type,
      reminderEnabled: true
    };
  }

  /**
   * Notify all subscribers of device changes
   */
  private notifySubscribers(): void {
    const devices = this.getAllDevices();
    this.subscribers.forEach(callback => {
      try {
        callback(devices);
      } catch (error) {
        console.error('Device registry subscriber callback error:', error);
      }
    });
  }
}

// Export singleton instance
export const deviceRegistry = new DeviceRegistryManager();
export default DeviceRegistryManager;