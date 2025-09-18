/**
 * Smart Meter Components Index
 * 
 * Central export file for all smart meter components including basic,
 * enhanced, advanced features, and enterprise dashboards.
 */

// Enhanced Smart Meter Components
export {
  DeviceCard,
  SmartMeterOverview,
  DeviceManagementDashboard,
  EnergyUsageChart,
  DeviceScheduler,
  EnergyInsights,
  RealTimePowerMonitor,
  CarbonFootprintTracker,
  default as EnhancedSmartMeterComponents
} from './enhanced-smart-meter-components';

// Advanced Smart Meter Features
export {
  AIEnergyPredictor,
  SmartEnergyOptimizer,
  DeviceLearningPatterns,
  EnterpriseEnergyAnalytics,
  default as AdvancedSmartMeterFeatures
} from './advanced-smart-meter-features';

// Smart Meter Dashboards
export {
  default as SmartMeterDashboard
} from './smart-meter-dashboard';

export {
  default as AdvancedSmartMeterDashboard
} from './advanced-smart-meter-dashboard';

// Re-export types and interfaces
export type {
  DeviceCardProps,
  EnergyUsageChartProps
} from './enhanced-smart-meter-components';

// Utility functions and constants
export const SMART_METER_CONFIG = {
  REFRESH_INTERVALS: [10, 30, 60, 300],
  CHART_TYPES: ['line', 'bar', 'area'] as const,
  TIME_RANGES: ['1h', '24h', '7d', '30d', '1y'] as const,
  OPTIMIZATION_MODES: ['cost', 'green', 'comfort'] as const,
  DASHBOARD_LAYOUTS: ['executive', 'technical', 'operational', 'custom'] as const
} as const;

export const DEVICE_TYPES = {
  LIGHTING: 'lighting',
  HEATING: 'heating',
  COOLING: 'cooling',
  APPLIANCE: 'appliance',
  ENTERTAINMENT: 'entertainment',
  SECURITY: 'security',
  WATER_HEATER: 'water_heater'
} as const;

export const DEVICE_LOCATIONS = {
  LIVING_ROOM: 'living room',
  KITCHEN: 'kitchen',
  BEDROOM: 'bedroom',
  BATHROOM: 'bathroom',
  GARAGE: 'garage',
  BASEMENT: 'basement',
  ATTIC: 'attic',
  OUTDOOR: 'outdoor'
} as const;