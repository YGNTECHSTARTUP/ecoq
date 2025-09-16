// This file is kept for reference but is not directly used by the Next.js app.
// The logic has been adapted into Next.js API Routes in src/app/api/smart-meter/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// admin.initializeApp(); // Initialization would be different in a standalone script
const db = {
    collection: () => ({ add: () => Promise.resolve() }) // Mock Firestore
};

// Utility Functions
const generateRealisticData = (meterId, brand, hour = new Date().getHours()) => {
  // Time-based load patterns
  let baseLoad = 2.5; // kW
  let multiplier = 1.0;

  // Daily pattern simulation
  if (hour >= 6 && hour <= 9) multiplier = 1.4;   // Morning peak
  if (hour >= 12 && hour <= 14) multiplier = 1.2; // Lunch peak  
  if (hour >= 19 && hour <= 22) multiplier = 1.7; // Evening peak
  if (hour >= 23 || hour <= 5) multiplier = 0.3;  // Night low

  // Weekend adjustment
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) multiplier *= 0.85;

  const activePower = (baseLoad * multiplier) + (Math.random() - 0.5) * 0.8;
  const voltage = 230 + (Math.random() - 0.5) * 20;
  const current = activePower / voltage * 1000; // Convert to amps
  const powerFactor = 0.85 + Math.random() * 0.12; // 0.85-0.97
  
  return {
    activePower: Math.max(0.1, activePower), // Minimum 0.1 kW
    voltage: Math.max(210, Math.min(250, voltage)),
    current: Math.max(0.5, current),
    powerFactor: Math.min(0.99, powerFactor),
    frequency: 49.8 + Math.random() * 0.4, // 49.8-50.2 Hz
    apparentPower: activePower / powerFactor,
    reactivePower: Math.sqrt(Math.pow(activePower / powerFactor, 2) - Math.pow(activePower, 2))
  };
};

const calculateCost = (energyKwh, tariffRate = 5.5, isPeakHour = false) => {
  const rate = isPeakHour ? tariffRate * 1.3 : tariffRate;
  return energyKwh * rate;
};

const validateApiKey = (apiKey, expectedFormat) => {
  if (!apiKey) return false;
  return apiKey.includes(expectedFormat) && apiKey.length >= 20;
};

const isPeakHour = () => {
  const hour = new Date().getHours();
  return hour >= 19 && hour <= 22;
};

// The following functions are for reference and are implemented as Next.js API routes.
// ========================================
// QUBE SMART METER API SIMULATION
// ========================================

exports.qubeRealTimeData = {};

// ========================================
// SECURE METERS API SIMULATION
// ========================================

exports.secureMetersData = {};

// ========================================
// L&T SMART METER API SIMULATION
// ========================================

exports.lntMeterApi = {};

// ========================================
// UNIFIED SMART METER GATEWAY
// ========================================

exports.unifiedMeterGateway = {};

// ========================================
// BATCH DATA COLLECTION FOR MULTIPLE METERS
// ========================================

exports.batchMeterData = {};

// ========================================
// API HEALTH CHECK
// ========================================

exports.meterApiHealth = {};

module.exports = {
  generateRealisticData,
  calculateCost,
  validateApiKey,
  isPeakHour
};
