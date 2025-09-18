'use client';

import { toast } from 'sonner';

// Enhanced Smart Home Device Types
export interface SmartDevice {
  id: string;
  name: string;
  type: 'ac' | 'light' | 'fan' | 'tv' | 'refrigerator' | 'washing_machine' | 'water_heater' | 'dishwasher' | 'microwave' | 'router';
  brand: string;
  model: string;
  room: string;
  
  // Status
  isOnline: boolean;
  isOn: boolean;
  lastUpdated: Date;
  
  // Power & Energy
  powerRating: number; // Watts
  currentPowerUsage: number;
  dailyEnergyUsage: number; // kWh
  monthlyEnergyUsage: number;
  
  // Device-specific properties
  temperature?: number; // For AC, water heater
  targetTemperature?: number;
  brightness?: number; // For lights (0-100)
  speed?: number; // For fans (1-5)
  volume?: number; // For TV
  mode?: string; // cool/heat/auto for AC, eco/normal/turbo for washing machine
  
  // Scheduling
  schedule?: DeviceSchedule[];
  automationRules?: AutomationRule[];
  
  // Efficiency
  efficiencyRating: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  energySavingMode: boolean;
  
  // IoT Properties
  firmware: string;
  connectivity: 'wifi' | 'zigbee' | 'bluetooth' | 'cellular';
  signalStrength: number; // 0-100
}

export interface DeviceSchedule {
  id: string;
  deviceId: string;
  name: string;
  days: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string;
  action: 'turn_on' | 'turn_off' | 'set_temperature' | 'set_brightness' | 'set_mode';
  parameters?: Record<string, any>;
  isActive: boolean;
  repeatWeekly: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  deviceId: string;
  trigger: {
    type: 'time' | 'temperature' | 'occupancy' | 'energy_price' | 'weather' | 'device_state';
    condition: string; // e.g., "temperature > 28", "time = 18:00", "occupancy = false"
    value: any;
  };
  action: {
    type: 'turn_on' | 'turn_off' | 'adjust_temperature' | 'adjust_brightness' | 'change_mode' | 'notify';
    parameters: Record<string, any>;
  };
  isActive: boolean;
  priority: number; // 1-10
}

export interface EnergyOptimization {
  deviceId: string;
  recommendation: string;
  potentialSavings: number; // kWh per day
  costSavings: number; // INR per month
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'scheduling' | 'settings' | 'automation' | 'replacement';
}

export interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'balcony' | 'study' | 'dining';
  area: number; // square feet
  occupancy: boolean;
  temperature?: number;
  humidity?: number;
  lightLevel?: number; // 0-100
  devices: string[]; // device IDs
}

class SmartHomeController {
  private devices: Map<string, SmartDevice> = new Map();
  private rooms: Map<string, Room> = new Map();
  private schedules: Map<string, DeviceSchedule> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private optimizations: EnergyOptimization[] = [];

  constructor() {
    this.initializeDevices();
    this.initializeRooms();
    this.startAutomationEngine();
  }

  // Device Management
  private initializeDevices(): void {
    const defaultDevices: Partial<SmartDevice>[] = [
      {
        id: 'ac_bedroom',
        name: 'Bedroom AC',
        type: 'ac',
        brand: 'Daikin',
        model: 'FTKM50TV16U',
        room: 'bedroom',
        powerRating: 1500,
        currentPowerUsage: 0,
        temperature: 24,
        targetTemperature: 26,
        mode: 'cool',
        efficiencyRating: 'A+',
        connectivity: 'wifi'
      },
      {
        id: 'light_living',
        name: 'Living Room Lights',
        type: 'light',
        brand: 'Philips',
        model: 'Hue White',
        room: 'living_room',
        powerRating: 60,
        currentPowerUsage: 0,
        brightness: 80,
        efficiencyRating: 'A++',
        connectivity: 'zigbee'
      },
      {
        id: 'fan_bedroom',
        name: 'Bedroom Fan',
        type: 'fan',
        brand: 'Bajaj',
        model: 'Ceiling Fan Pro',
        room: 'bedroom',
        powerRating: 75,
        currentPowerUsage: 0,
        speed: 3,
        efficiencyRating: 'A',
        connectivity: 'wifi'
      },
      {
        id: 'refrigerator_kitchen',
        name: 'Kitchen Refrigerator',
        type: 'refrigerator',
        brand: 'Samsung',
        model: 'RT28M3424S8',
        room: 'kitchen',
        powerRating: 150,
        currentPowerUsage: 120,
        temperature: 4,
        mode: 'eco',
        efficiencyRating: 'A++',
        connectivity: 'wifi'
      },
      {
        id: 'tv_living',
        name: 'Living Room TV',
        type: 'tv',
        brand: 'LG',
        model: 'OLED55C1PTZ',
        room: 'living_room',
        powerRating: 120,
        currentPowerUsage: 0,
        volume: 15,
        efficiencyRating: 'A',
        connectivity: 'wifi'
      },
      {
        id: 'water_heater',
        name: 'Water Heater',
        type: 'water_heater',
        brand: 'Racold',
        model: 'Omnis WiFi',
        room: 'bathroom',
        powerRating: 2000,
        currentPowerUsage: 0,
        temperature: 45,
        targetTemperature: 50,
        mode: 'auto',
        efficiencyRating: 'A+',
        connectivity: 'wifi'
      }
    ];

    defaultDevices.forEach(deviceData => {
      const device: SmartDevice = {
        ...deviceData,
        isOnline: Math.random() > 0.1, // 90% online
        isOn: Math.random() > 0.6, // 40% on
        lastUpdated: new Date(),
        dailyEnergyUsage: Math.random() * 5 + 1,
        monthlyEnergyUsage: Math.random() * 150 + 30,
        schedule: [],
        automationRules: [],
        energySavingMode: Math.random() > 0.7,
        firmware: '1.2.3',
        signalStrength: Math.floor(Math.random() * 30) + 70
      } as SmartDevice;

      // Calculate current power usage based on status
      if (device.isOn) {
        switch (device.type) {
          case 'ac':
            device.currentPowerUsage = device.powerRating * (device.energySavingMode ? 0.7 : 1);
            break;
          case 'light':
            device.currentPowerUsage = device.powerRating * (device.brightness! / 100);
            break;
          case 'fan':
            device.currentPowerUsage = device.powerRating * (device.speed! / 5);
            break;
          case 'refrigerator':
            device.currentPowerUsage = device.powerRating * 0.8; // Always on, cycling
            break;
          default:
            device.currentPowerUsage = device.powerRating * (device.energySavingMode ? 0.8 : 1);
        }
      } else {
        device.currentPowerUsage = device.type === 'refrigerator' ? device.powerRating * 0.3 : 0;
      }

      this.devices.set(device.id, device);
    });
  }

  private initializeRooms(): void {
    const defaultRooms: Room[] = [
      {
        id: 'bedroom',
        name: 'Bedroom',
        type: 'bedroom',
        area: 150,
        occupancy: Math.random() > 0.5,
        temperature: 26 + Math.random() * 4,
        humidity: 45 + Math.random() * 20,
        lightLevel: Math.random() * 100,
        devices: ['ac_bedroom', 'fan_bedroom']
      },
      {
        id: 'living_room',
        name: 'Living Room',
        type: 'living_room',
        area: 200,
        occupancy: Math.random() > 0.3,
        temperature: 28 + Math.random() * 3,
        humidity: 50 + Math.random() * 15,
        lightLevel: Math.random() * 100,
        devices: ['light_living', 'tv_living']
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        type: 'kitchen',
        area: 80,
        occupancy: Math.random() > 0.7,
        temperature: 30 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        lightLevel: Math.random() * 100,
        devices: ['refrigerator_kitchen']
      },
      {
        id: 'bathroom',
        name: 'Bathroom',
        type: 'bathroom',
        area: 40,
        occupancy: Math.random() > 0.9,
        temperature: 25 + Math.random() * 3,
        humidity: 70 + Math.random() * 20,
        lightLevel: Math.random() * 100,
        devices: ['water_heater']
      }
    ];

    defaultRooms.forEach(room => {
      this.rooms.set(room.id, room);
    });
  }

  // Device Control Methods
  async toggleDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isOnline) {
      toast.error('Device is offline or not found');
      return false;
    }

    device.isOn = !device.isOn;
    device.lastUpdated = new Date();
    
    // Update power usage
    if (device.isOn) {
      switch (device.type) {
        case 'ac':
          device.currentPowerUsage = device.powerRating * (device.energySavingMode ? 0.7 : 1);
          break;
        case 'light':
          device.currentPowerUsage = device.powerRating * (device.brightness! / 100);
          break;
        case 'fan':
          device.currentPowerUsage = device.powerRating * (device.speed! / 5);
          break;
        default:
          device.currentPowerUsage = device.powerRating * (device.energySavingMode ? 0.8 : 1);
      }
    } else {
      device.currentPowerUsage = device.type === 'refrigerator' ? device.powerRating * 0.3 : 0;
    }

    toast.success(`${device.name} ${device.isOn ? 'turned on' : 'turned off'}`);
    return true;
  }

  async setDeviceTemperature(deviceId: string, temperature: number): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isOnline || !['ac', 'water_heater'].includes(device.type)) {
      toast.error('Device not found or doesn\'t support temperature control');
      return false;
    }

    device.targetTemperature = Math.max(16, Math.min(30, temperature));
    device.lastUpdated = new Date();
    
    // Adjust power usage based on temperature difference
    if (device.type === 'ac') {
      const tempDiff = Math.abs((device.temperature || 25) - device.targetTemperature);
      device.currentPowerUsage = device.powerRating * (0.6 + tempDiff * 0.1) * (device.energySavingMode ? 0.8 : 1);
    }

    toast.success(`${device.name} temperature set to ${temperature}°C`);
    return true;
  }

  async setDeviceBrightness(deviceId: string, brightness: number): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isOnline || device.type !== 'light') {
      toast.error('Device not found or doesn\'t support brightness control');
      return false;
    }

    device.brightness = Math.max(0, Math.min(100, brightness));
    device.currentPowerUsage = device.powerRating * (device.brightness / 100);
    device.lastUpdated = new Date();

    toast.success(`${device.name} brightness set to ${brightness}%`);
    return true;
  }

  async enableEnergySavingMode(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isOnline) {
      toast.error('Device not found or offline');
      return false;
    }

    device.energySavingMode = true;
    device.lastUpdated = new Date();

    // Reduce power consumption
    if (device.isOn) {
      device.currentPowerUsage = device.currentPowerUsage * 0.8;
      
      // Adjust device-specific settings for energy saving
      if (device.type === 'ac' && device.targetTemperature) {
        device.targetTemperature = Math.min(28, device.targetTemperature + 2);
      } else if (device.type === 'light' && device.brightness) {
        device.brightness = Math.max(20, device.brightness - 20);
      }
    }

    toast.success(`Energy saving mode enabled for ${device.name}`);
    return true;
  }

  // Scheduling Methods
  async createSchedule(schedule: Omit<DeviceSchedule, 'id'>): Promise<string> {
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSchedule: DeviceSchedule = {
      ...schedule,
      id: scheduleId
    };

    this.schedules.set(scheduleId, newSchedule);
    
    // Add to device
    const device = this.devices.get(schedule.deviceId);
    if (device) {
      device.schedule = device.schedule || [];
      device.schedule.push(newSchedule);
    }

    toast.success(`Schedule created for ${device?.name || 'device'}`);
    return scheduleId;
  }

  async createAutomationRule(rule: Omit<AutomationRule, 'id'>): Promise<string> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AutomationRule = {
      ...rule,
      id: ruleId
    };

    this.automationRules.set(ruleId, newRule);
    
    // Add to device
    const device = this.devices.get(rule.deviceId);
    if (device) {
      device.automationRules = device.automationRules || [];
      device.automationRules.push(newRule);
    }

    toast.success(`Automation rule "${rule.name}" created`);
    return ruleId;
  }

  // Energy Optimization
  generateOptimizations(): EnergyOptimization[] {
    this.optimizations = [];

    this.devices.forEach(device => {
      // High power devices without energy saving mode
      if (device.currentPowerUsage > 1000 && !device.energySavingMode) {
        this.optimizations.push({
          deviceId: device.id,
          recommendation: `Enable energy saving mode on ${device.name}`,
          potentialSavings: device.currentPowerUsage * 0.2 / 1000, // 20% savings
          costSavings: (device.currentPowerUsage * 0.2 / 1000) * 24 * 30 * 6.5, // INR per month
          difficulty: 'easy',
          category: 'settings'
        });
      }

      // AC temperature optimization
      if (device.type === 'ac' && device.targetTemperature && device.targetTemperature < 26) {
        this.optimizations.push({
          deviceId: device.id,
          recommendation: `Set AC temperature to 26°C for optimal efficiency`,
          potentialSavings: (device.targetTemperature < 26 ? (26 - device.targetTemperature) * 0.2 : 0),
          costSavings: (26 - device.targetTemperature) * 0.2 * 24 * 30 * 6.5,
          difficulty: 'easy',
          category: 'settings'
        });
      }

      // Scheduling recommendations
      if (device.schedule?.length === 0 && ['ac', 'water_heater', 'light'].includes(device.type)) {
        this.optimizations.push({
          deviceId: device.id,
          recommendation: `Create automatic schedule for ${device.name}`,
          potentialSavings: device.powerRating * 0.15 / 1000, // 15% savings through scheduling
          costSavings: (device.powerRating * 0.15 / 1000) * 8 * 30 * 6.5, // 8 hours saved per day
          difficulty: 'medium',
          category: 'scheduling'
        });
      }

      // Old efficiency ratings
      if (['C', 'D', 'E'].includes(device.efficiencyRating)) {
        this.optimizations.push({
          deviceId: device.id,
          recommendation: `Consider upgrading ${device.name} to a more energy-efficient model`,
          potentialSavings: device.currentPowerUsage * 0.4 / 1000, // 40% savings with new appliance
          costSavings: (device.currentPowerUsage * 0.4 / 1000) * 24 * 30 * 6.5,
          difficulty: 'hard',
          category: 'replacement'
        });
      }
    });

    return this.optimizations;
  }

  // Automation Engine
  private startAutomationEngine(): void {
    setInterval(() => {
      this.processAutomationRules();
      this.updateDeviceStates();
    }, 60000); // Check every minute
  }

  private processAutomationRules(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    this.automationRules.forEach(rule => {
      if (!rule.isActive) return;

      const device = this.devices.get(rule.deviceId);
      if (!device || !device.isOnline) return;

      let shouldTrigger = false;

      switch (rule.trigger.type) {
        case 'time':
          shouldTrigger = rule.trigger.value === currentTime;
          break;
        case 'temperature':
          const room = this.rooms.get(device.room);
          if (room && room.temperature) {
            const condition = rule.trigger.condition.replace('temperature', room.temperature.toString());
            shouldTrigger = eval(condition);
          }
          break;
        case 'occupancy':
          const deviceRoom = this.rooms.get(device.room);
          shouldTrigger = deviceRoom ? deviceRoom.occupancy === rule.trigger.value : false;
          break;
      }

      if (shouldTrigger) {
        this.executeAutomationAction(rule, device);
      }
    });
  }

  private executeAutomationAction(rule: AutomationRule, device: SmartDevice): void {
    switch (rule.action.type) {
      case 'turn_on':
        if (!device.isOn) {
          this.toggleDevice(device.id);
        }
        break;
      case 'turn_off':
        if (device.isOn) {
          this.toggleDevice(device.id);
        }
        break;
      case 'adjust_temperature':
        if (rule.action.parameters.temperature) {
          this.setDeviceTemperature(device.id, rule.action.parameters.temperature);
        }
        break;
      case 'adjust_brightness':
        if (rule.action.parameters.brightness) {
          this.setDeviceBrightness(device.id, rule.action.parameters.brightness);
        }
        break;
    }
  }

  private updateDeviceStates(): void {
    // Simulate device state changes and energy consumption
    this.devices.forEach(device => {
      // Update daily energy usage
      if (device.isOn) {
        device.dailyEnergyUsage += (device.currentPowerUsage / 1000) / (24 * 60); // kWh per minute
      }

      // Simulate temperature changes for rooms
      const room = this.rooms.get(device.room);
      if (room && device.type === 'ac' && device.isOn) {
        const targetTemp = device.targetTemperature || 24;
        if (room.temperature! > targetTemp) {
          room.temperature = Math.max(targetTemp, room.temperature! - 0.1);
        }
      }

      // Random occupancy changes
      if (room && Math.random() < 0.05) { // 5% chance per minute
        room.occupancy = Math.random() > 0.5;
      }
    });
  }

  // Getters
  getAllDevices(): SmartDevice[] {
    return Array.from(this.devices.values());
  }

  getDevice(deviceId: string): SmartDevice | undefined {
    return this.devices.get(deviceId);
  }

  getDevicesByRoom(roomId: string): SmartDevice[] {
    return Array.from(this.devices.values()).filter(device => device.room === roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getTotalPowerConsumption(): number {
    return Array.from(this.devices.values()).reduce((total, device) => total + device.currentPowerUsage, 0);
  }

  getDailyEnergyConsumption(): number {
    return Array.from(this.devices.values()).reduce((total, device) => total + device.dailyEnergyUsage, 0);
  }

  getMonthlyEnergyConsumption(): number {
    return Array.from(this.devices.values()).reduce((total, device) => total + device.monthlyEnergyUsage, 0);
  }

  getOptimizations(): EnergyOptimization[] {
    return this.optimizations;
  }
}

// Export singleton instance
export const smartHomeController = new SmartHomeController();
export default SmartHomeController;