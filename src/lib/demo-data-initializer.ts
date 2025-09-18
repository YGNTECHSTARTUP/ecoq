/**
 * Demo Data Initializer
 * 
 * Adds sample appliances to the smart meter system for demonstration purposes.
 * This creates a realistic e2e flow where users can see their smart meter
 * controlling multiple connected devices with real-time energy monitoring.
 */

import { smartMeterSystem } from './smart-meter-system';
import { deviceRegistry } from './device-registry';
import { SmartMeterDevice } from './types';

export interface DemoApplianceConfig {
  name: string;
  brand: string;
  type: SmartMeterDevice['type'];
  room: string;
  category: 'essential' | 'comfort' | 'entertainment' | 'productivity';
  energyGoal?: number;
}

// Sample appliances for demo purposes
const DEMO_APPLIANCES: DemoApplianceConfig[] = [
  {
    name: 'Living Room AC',
    brand: 'LG',
    type: 'ac_meter',
    room: 'Living Room',
    category: 'comfort',
    energyGoal: 300 // kWh per month
  },
  {
    name: 'Bedroom Lights',
    brand: 'Philips',
    type: 'light',
    room: 'Bedroom',
    category: 'essential',
    energyGoal: 15
  },
  {
    name: 'Kitchen Refrigerator',
    brand: 'Samsung',
    type: 'appliance_meter',
    room: 'Kitchen',
    category: 'essential',
    energyGoal: 120
  },
  {
    name: 'Home Office Setup',
    brand: 'Dell',
    type: 'plug_meter',
    room: 'Office',
    category: 'productivity',
    energyGoal: 80
  },
  {
    name: 'Living Room TV',
    brand: 'Sony',
    type: 'outlet',
    room: 'Living Room',
    category: 'entertainment',
    energyGoal: 45
  },
  {
    name: 'Main Smart Meter',
    brand: 'Qube',
    type: 'main_meter',
    room: 'Utility Room',
    category: 'essential',
    energyGoal: 800 // Total home goal
  },
  {
    name: 'Water Heater',
    brand: 'Havells',
    type: 'appliance_meter',
    room: 'Bathroom',
    category: 'essential',
    energyGoal: 200
  },
  {
    name: 'Dining Room Lights',
    brand: 'Syska',
    type: 'light',
    room: 'Dining Room',
    category: 'essential',
    energyGoal: 12
  }
];

class DemoDataInitializer {
  private initialized = false;
  private registeredDeviceIds: string[] = [];

  /**
   * Initialize demo data by adding sample appliances
   */
  async initializeDemoData(): Promise<void> {
    if (this.initialized) {
      console.log('Demo data already initialized');
      return;
    }

    try {
      console.log('Initializing demo data...');
      
      // Wait for smart meter system to be ready
      await this.waitForSmartMeterSystem();

      // Register all demo appliances
      for (const appliance of DEMO_APPLIANCES) {
        try {
          const deviceId = await deviceRegistry.registerDevice({
            name: appliance.name,
            brand: appliance.brand,
            type: appliance.type,
            location: 'Demo Home',
            room: appliance.room,
            category: appliance.category,
            energyGoal: appliance.energyGoal
          });

          this.registeredDeviceIds.push(deviceId);
          console.log(`Registered demo device: ${appliance.name} (${deviceId})`);
        } catch (error) {
          console.error(`Failed to register demo device ${appliance.name}:`, error);
        }
      }

      this.initialized = true;
      console.log(`Demo data initialized with ${this.registeredDeviceIds.length} devices`);

      // Give some time for data to stabilize
      setTimeout(() => {
        this.logDemoStatus();
      }, 2000);

    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }

  /**
   * Check if demo data is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get registered device IDs
   */
  getRegisteredDeviceIds(): string[] {
    return [...this.registeredDeviceIds];
  }

  /**
   * Clear all demo data
   */
  async clearDemoData(): Promise<void> {
    if (!this.initialized) return;

    try {
      console.log('Clearing demo data...');
      
      // Unregister all demo devices
      for (const deviceId of this.registeredDeviceIds) {
        try {
          await deviceRegistry.unregisterDevice(deviceId);
          console.log(`Unregistered demo device: ${deviceId}`);
        } catch (error) {
          console.error(`Failed to unregister demo device ${deviceId}:`, error);
        }
      }

      this.registeredDeviceIds = [];
      this.initialized = false;
      console.log('Demo data cleared');
    } catch (error) {
      console.error('Failed to clear demo data:', error);
    }
  }

  /**
   * Reset demo data (clear and reinitialize)
   */
  async resetDemoData(): Promise<void> {
    await this.clearDemoData();
    await this.initializeDemoData();
  }

  /**
   * Add a specific demo appliance
   */
  async addDemoAppliance(appliance: DemoApplianceConfig): Promise<string | null> {
    try {
      const deviceId = await deviceRegistry.registerDevice({
        name: appliance.name,
        brand: appliance.brand,
        type: appliance.type,
        location: 'Demo Home',
        room: appliance.room,
        category: appliance.category,
        energyGoal: appliance.energyGoal
      });

      this.registeredDeviceIds.push(deviceId);
      console.log(`Added demo appliance: ${appliance.name} (${deviceId})`);
      return deviceId;
    } catch (error) {
      console.error(`Failed to add demo appliance ${appliance.name}:`, error);
      return null;
    }
  }

  /**
   * Get demo usage statistics
   */
  getDemoStats(): {
    totalDevices: number;
    devicesByType: Record<string, number>;
    devicesByRoom: Record<string, number>;
    devicesByCategory: Record<string, number>;
  } {
    const devices = deviceRegistry.getAllDevices();
    const demoDevices = devices.filter(d => this.registeredDeviceIds.includes(d.id));

    return {
      totalDevices: demoDevices.length,
      devicesByType: demoDevices.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByRoom: demoDevices.reduce((acc, device) => {
        acc[device.room] = (acc[device.room] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByCategory: demoDevices.reduce((acc, device) => {
        acc[device.category] = (acc[device.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Wait for smart meter system to be ready
   */
  private async waitForSmartMeterSystem(maxWaitTime = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = smartMeterSystem.getSystemStatus();
      if (status.isOnline) {
        return;
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Smart meter system not ready after waiting');
  }

  /**
   * Log current demo status for debugging
   */
  private logDemoStatus(): void {
    const stats = this.getDemoStats();
    const systemStatus = smartMeterSystem.getSystemStatus();
    const questData = smartMeterSystem.getQuestGenerationData();

    console.log('=== Demo Status ===');
    console.log('Initialized:', this.initialized);
    console.log('Registered devices:', this.registeredDeviceIds.length);
    console.log('System online:', systemStatus.isOnline);
    console.log('Connected devices:', systemStatus.connectedDevices);
    console.log('Total energy today:', systemStatus.totalEnergyToday.toFixed(2), 'kWh');
    console.log('Estimated monthly bill:', '₹' + systemStatus.estimatedBillThisMonth.toFixed(0));
    
    if (questData) {
      console.log('Quest generation data available:', questData.deviceUsagePatterns.length, 'patterns');
      console.log('Total consumption:', questData.totalConsumption.toFixed(2), 'kWh');
      console.log('Efficiency score:', questData.efficiencyScore.toFixed(1));
      console.log('Potential savings:', '₹' + questData.potentialSavings.toFixed(0));
    }
    
    console.log('Device breakdown:');
    console.log('- By type:', stats.devicesByType);
    console.log('- By room:', stats.devicesByRoom);
    console.log('- By category:', stats.devicesByCategory);
    console.log('==================');
  }
}

// Export singleton instance
export const demoDataInitializer = new DemoDataInitializer();

// Auto-initialize demo data when this module is loaded
// This ensures the demo environment is ready immediately
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  setTimeout(() => {
    demoDataInitializer.initializeDemoData();
  }, 1000); // Wait 1 second for other systems to initialize
}

export default DemoDataInitializer;