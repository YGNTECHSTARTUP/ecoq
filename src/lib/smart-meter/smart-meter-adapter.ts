/**
 * Smart Meter Service Adapter
 * 
 * Connects the smart meter service implementation with Firestore
 * and adds extension methods to the smart meter service.
 */

import { firestoreService } from '../firebase/firestore-service';
import { smartMeterService } from './smart-meter-service';
import { authService } from '../auth/auth-service';

/**
 * Get smart meters by user
 */
smartMeterService.getSmartMetersByUser = async (userId: string) => {
  return firestoreService.getSmartMetersByUser(userId);
};

/**
 * Get a specific smart meter
 */
smartMeterService.getSmartMeter = async (meterId: string) => {
  return firestoreService.getSmartMeter(meterId);
};

/**
 * Get devices by smart meter
 */
smartMeterService.getDevicesBySmartMeter = async (smartMeterId: string) => {
  return firestoreService.getDevicesBySmartMeter(smartMeterId);
};

/**
 * Get recent readings
 */
smartMeterService.getRecentReadings = async (userId: string, limit: number = 100) => {
  return firestoreService.getRecentReadings(userId, limit);
};

/**
 * Initialize the smart meter service with the current user
 * and update the configuration
 */
export function initializeSmartMeterService() {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    // Update service config with current user
    smartMeterService.updateConfig({
      userId: currentUser.uid,
      meterId: 'default', // This will be updated when a meter is selected
      updateInterval: 60000, // 1 minute
      enableAutoSync: true,
      enableOfflineStorage: true,
      batchSize: 50
    });
  }

  // Set up listener to update config when auth state changes
  authService.onAuthStateChanged(user => {
    if (user) {
      smartMeterService.updateConfig({
        userId: user.uid
      });
    } else {
      // Reset to default config when logged out
      smartMeterService.updateConfig({
        userId: 'default',
        meterId: 'default'
      });
    }
  });
}

/**
 * Start monitoring all meters for the current user
 */
export async function startAllMetersMonitoring() {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  try {
    const meters = await firestoreService.getSmartMetersByUser(currentUser.uid);
    
    for (const meter of meters) {
      smartMeterService.startMeterMonitoring(meter.id);
    }
  } catch (error) {
    console.error('Error starting meter monitoring:', error);
  }
}

/**
 * Stop all monitoring
 */
export function stopAllMetersMonitoring() {
  smartMeterService.cleanup();
}

/**
 * Add the updateConfig method to the smart meter service
 */
smartMeterService.updateConfig = function(config: Partial<Parameters<typeof smartMeterService.constructor>[0]>) {
  Object.assign(this.config, config);
};

// Export adapter initialization function
export default initializeSmartMeterService;