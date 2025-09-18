/**
 * Smart Meter React Hook
 * 
 * Provides smart meter state management and device operations
 * for React components with real-time updates and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  smartMeterService,
  SmartMeterConfig,
  DeviceInfo,
  EnergyData,
  MeterReading
} from '../lib/smart-meter/smart-meter-service';
import { SmartMeter, Device, EnergyReading } from '../lib/firebase/schema';
import { useAuth } from './useAuth';

// Hook Types
interface SmartMeterState {
  meters: SmartMeter[];
  devices: Device[];
  currentReading: MeterReading | null;
  recentReadings: EnergyReading[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface SmartMeterActions {
  initializeMeter: (meterInfo: {
    serialNumber: string;
    model: string;
    manufacturer: string;
    location: string;
    installationDate: Date;
  }) => Promise<SmartMeter>;
  addDevice: (smartMeterId: string, deviceInfo: DeviceInfo) => Promise<Device>;
  removeDevice: (deviceId: string) => Promise<void>;
  updateDeviceConfig: (deviceId: string, updates: Partial<Device['configuration']>) => Promise<void>;
  getDeviceEnergyData: (deviceId: string, startDate: Date, endDate: Date) => Promise<EnergyData[]>;
  startMonitoring: (meterId: string) => void;
  stopMonitoring: (meterId: string) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

type UseSmartMeterReturn = SmartMeterState & SmartMeterActions;

/**
 * Main smart meter hook
 */
export function useSmartMeter(): UseSmartMeterReturn {
  const { user } = useAuth();
  
  const [state, setState] = useState<SmartMeterState>({
    meters: [],
    devices: [],
    currentReading: null,
    recentReadings: [],
    loading: false,
    error: null,
    isInitialized: false
  });

  // Initialize smart meter data
  useEffect(() => {
    if (user) {
      loadSmartMeterData();
    } else {
      setState(prev => ({
        ...prev,
        meters: [],
        devices: [],
        currentReading: null,
        recentReadings: [],
        isInitialized: false
      }));
    }
  }, [user]);

  // Load smart meter data
  const loadSmartMeterData = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load user's smart meters
      const meters = await smartMeterService.getSmartMetersByUser(user.uid);
      let allDevices: Device[] = [];
      
      // Load devices for each meter
      for (const meter of meters) {
        const devices = await smartMeterService.getDevicesBySmartMeter(meter.id);
        allDevices = [...allDevices, ...devices];
      }

      // Load recent readings
      const recentReadings = await smartMeterService.getRecentReadings(user.uid, 50);

      // Get current reading for the first meter
      let currentReading: MeterReading | null = null;
      if (meters.length > 0) {
        currentReading = await smartMeterService.getMeterReading(meters[0].id);
      }

      setState(prev => ({
        ...prev,
        meters,
        devices: allDevices,
        currentReading,
        recentReadings,
        loading: false,
        isInitialized: true
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load smart meter data'
      }));
    }
  }, [user]);

  // Helper function for async actions
  const handleAsyncAction = useCallback(
    async (action: () => Promise<any>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await action();
        setState(prev => ({ ...prev, loading: false }));
        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'An unexpected error occurred'
        }));
        throw error;
      }
    },
    []
  );

  // Initialize smart meter
  const initializeMeter = useCallback(
    async (meterInfo: {
      serialNumber: string;
      model: string;
      manufacturer: string;
      location: string;
      installationDate: Date;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const meter = await handleAsyncAction(() => 
        smartMeterService.initializeSmartMeter(user.uid, meterInfo)
      );

      // Update state
      setState(prev => ({
        ...prev,
        meters: [...prev.meters, meter]
      }));

      return meter;
    },
    [user, handleAsyncAction]
  );

  // Add device
  const addDevice = useCallback(
    async (smartMeterId: string, deviceInfo: DeviceInfo) => {
      if (!user) throw new Error('User not authenticated');

      const device = await handleAsyncAction(() =>
        smartMeterService.addDevice(smartMeterId, user.uid, deviceInfo)
      );

      // Update state
      setState(prev => ({
        ...prev,
        devices: [...prev.devices, device]
      }));

      return device;
    },
    [user, handleAsyncAction]
  );

  // Remove device
  const removeDevice = useCallback(
    async (deviceId: string) => {
      await handleAsyncAction(() => smartMeterService.removeDevice(deviceId));

      // Update state
      setState(prev => ({
        ...prev,
        devices: prev.devices.filter(device => device.id !== deviceId)
      }));
    },
    [handleAsyncAction]
  );

  // Update device configuration
  const updateDeviceConfig = useCallback(
    async (deviceId: string, updates: Partial<Device['configuration']>) => {
      await handleAsyncAction(() =>
        smartMeterService.updateDeviceConfiguration(deviceId, updates)
      );

      // Update state
      setState(prev => ({
        ...prev,
        devices: prev.devices.map(device =>
          device.id === deviceId
            ? { ...device, configuration: { ...device.configuration, ...updates } }
            : device
        )
      }));
    },
    [handleAsyncAction]
  );

  // Get device energy data
  const getDeviceEnergyData = useCallback(
    async (deviceId: string, startDate: Date, endDate: Date) => {
      return handleAsyncAction(() =>
        smartMeterService.getDeviceEnergyData(deviceId, startDate, endDate)
      );
    },
    [handleAsyncAction]
  );

  // Start monitoring
  const startMonitoring = useCallback((meterId: string) => {
    smartMeterService.startMeterMonitoring(meterId);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback((meterId: string) => {
    smartMeterService.stopMeterMonitoring(meterId);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadSmartMeterData();
  }, [loadSmartMeterData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    meters: state.meters,
    devices: state.devices,
    currentReading: state.currentReading,
    recentReadings: state.recentReadings,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,

    // Actions
    initializeMeter,
    addDevice,
    removeDevice,
    updateDeviceConfig,
    getDeviceEnergyData,
    startMonitoring,
    stopMonitoring,
    refreshData,
    clearError
  };
}

/**
 * Hook for real-time meter readings
 */
export function useMeterReading(meterId: string | null) {
  const [reading, setReading] = useState<MeterReading | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!meterId) return;

    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        // Get initial reading
        const initialReading = await smartMeterService.getMeterReading(meterId);
        setReading(initialReading);
        setLastUpdate(new Date());

        // Set up real-time listener
        unsubscribe = smartMeterService.onMeterDataChanged(meterId, (energyReading) => {
          // Update reading based on new energy data
          smartMeterService.getMeterReading(meterId).then(newReading => {
            setReading(newReading);
            setLastUpdate(new Date());
          });
        });

      } catch (error) {
        console.error('Error setting up meter reading listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [meterId]);

  return {
    reading,
    lastUpdate,
    isOnline: reading?.quality !== 'poor'
  };
}

/**
 * Hook for device-specific data
 */
export function useDeviceData(deviceId: string | null) {
  const { devices } = useSmartMeter();
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(false);

  const device = devices.find(d => d.id === deviceId) || null;

  const loadEnergyData = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!deviceId) return;

      setLoading(true);
      try {
        const data = await smartMeterService.getDeviceEnergyData(
          deviceId, 
          startDate, 
          endDate
        );
        setEnergyData(data);
      } catch (error) {
        console.error('Error loading device energy data:', error);
      } finally {
        setLoading(false);
      }
    },
    [deviceId]
  );

  return {
    device,
    energyData,
    loading,
    loadEnergyData
  };
}

/**
 * Hook for smart meter statistics
 */
export function useSmartMeterStats() {
  const { meters, devices, recentReadings } = useSmartMeter();

  const stats = {
    totalMeters: meters.length,
    totalDevices: devices.length,
    activeDevices: devices.filter(d => d.status.isActive).length,
    onlineDevices: devices.filter(d => d.status.isOnline).length,
    totalConsumption: meters.reduce((sum, meter) => 
      sum + (meter.statistics.totalEnergyConsumed || 0), 0),
    currentPower: recentReadings.length > 0 ? 
      Math.max(...recentReadings.map(r => r.reading.power)) : 0,
    averageDailyUsage: meters.reduce((sum, meter) => 
      sum + (meter.statistics.averageDailyUsage || 0), 0) / Math.max(1, meters.length),
    totalCost: meters.reduce((sum, meter) => 
      sum + (meter.statistics.costToDate || 0), 0),
    co2Savings: meters.reduce((sum, meter) => 
      sum + (meter.statistics.co2Savings || 0), 0)
  };

  return stats;
}

/**
 * Hook for device automation
 */
export function useDeviceAutomation(deviceId: string | null) {
  const { updateDeviceConfig } = useSmartMeter();
  const { device } = useDeviceData(deviceId);

  const updateSchedule = useCallback(
    async (schedule: Device['configuration']['schedule']) => {
      if (!deviceId) return;
      
      await updateDeviceConfig(deviceId, {
        enableSchedule: !!schedule,
        schedule
      });
    },
    [deviceId, updateDeviceConfig]
  );

  const togglePowerSavingMode = useCallback(
    async (enabled: boolean) => {
      if (!deviceId) return;
      
      await updateDeviceConfig(deviceId, {
        powerSavingMode: enabled
      });
    },
    [deviceId, updateDeviceConfig]
  );

  const toggleAlerts = useCallback(
    async (enabled: boolean) => {
      if (!deviceId) return;
      
      await updateDeviceConfig(deviceId, {
        alertsEnabled: enabled
      });
    },
    [deviceId, updateDeviceConfig]
  );

  return {
    device,
    updateSchedule,
    togglePowerSavingMode,
    toggleAlerts,
    isScheduleEnabled: device?.configuration.enableSchedule || false,
    isPowerSavingEnabled: device?.configuration.powerSavingMode || false,
    areAlertsEnabled: device?.configuration.alertsEnabled || false
  };
}

export default useSmartMeter;