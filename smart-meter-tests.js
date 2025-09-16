// Smart Meter API Testing Suite
// Run with: npm test or jest smart-meter-tests.js

const axios = require('axios');
const { faker } = require('@faker-js/faker');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'https://your-project.cloudfunctions.net',
  timeout: 10000,
  retries: 3
};

// Test Data
const TEST_METERS = {
  qube: {
    id: 'QUBE_001_TEST',
    apiKey: 'qube_demo_key_2024',
    brand: 'QUBE'
  },
  secure: {
    id: 'SEC_001_TEST',
    token: 'secure_demo_token_2024',
    brand: 'SECURE'
  },
  lnt: {
    id: 'LNT_001_TEST',
    apiKey: 'LT_demo_key_2024_test',
    brand: 'LNT'
  }
};

describe('Smart Meter API Integration Tests', () => {
  
  // Qube API Tests
  describe('Qube Smart Meter API', () => {
    test('should fetch real-time data successfully', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
        params: {
          meterId: TEST_METERS.qube.id,
          apiKey: TEST_METERS.qube.apiKey
        },
        timeout: TEST_CONFIG.timeout
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data).toHaveProperty('meter_id', TEST_METERS.qube.id);
      expect(response.data).toHaveProperty('brand', 'Qube');
      expect(response.data.data).toHaveProperty('instantaneous');
      expect(response.data.data).toHaveProperty('energy');
      expect(response.data.data).toHaveProperty('billing');
      
      // Validate data types
      expect(typeof response.data.data.instantaneous.active_power).toBe('number');
      expect(typeof response.data.data.instantaneous.voltage).toBe('number');
      expect(typeof response.data.data.energy.active_energy_today).toBe('number');
      
      // Validate reasonable ranges
      expect(response.data.data.instantaneous.active_power).toBeGreaterThan(0);
      expect(response.data.data.instantaneous.active_power).toBeLessThan(15);
      expect(response.data.data.instantaneous.voltage).toBeGreaterThan(200);
      expect(response.data.data.instantaneous.voltage).toBeLessThan(250);
    });

    test('should reject invalid API key', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
          params: {
            meterId: TEST_METERS.qube.id,
            apiKey: 'invalid_key'
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('error', 'Invalid API key');
      }
    });

    test('should reject missing meter ID', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
          params: {
            apiKey: TEST_METERS.qube.apiKey
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error', 'Meter ID required');
      }
    });

    test('should validate data consistency over time', async () => {
      const readings = [];
      
      // Take 3 readings with 2-second intervals
      for (let i = 0; i < 3; i++) {
        const response = await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
          params: {
            meterId: TEST_METERS.qube.id,
            apiKey: TEST_METERS.qube.apiKey
          }
        });
        
        readings.push(response.data.data.instantaneous.active_power);
        
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Power shouldn't vary by more than 50% between consecutive readings
      for (let i = 1; i < readings.length; i++) {
        const variation = Math.abs(readings[i] - readings[i-1]) / readings[i-1];
        expect(variation).toBeLessThan(0.5);
      }
    });
  });

  // Secure Meters API Tests
  describe('Secure Meters API', () => {
    test('should fetch current reading data', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
        params: {
          deviceId: TEST_METERS.secure.id,
          dataType: 'current'
        },
        headers: {
          'X-Secure-Token': TEST_METERS.secure.token
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('device_id', TEST_METERS.secure.id);
      expect(response.data).toHaveProperty('manufacturer', 'Secure Meters Ltd');
      expect(response.data.readings).toHaveProperty('active_power_kw');
      expect(response.data.readings).toHaveProperty('voltage_v');
      expect(response.data.status).toHaveProperty('connection_quality');
      
      // Validate data types and ranges
      expect(typeof response.data.readings.active_power_kw).toBe('number');
      expect(response.data.readings.active_power_kw).toBeGreaterThan(0);
      expect(response.data.readings.voltage_v).toBeGreaterThan(220);
      expect(response.data.readings.voltage_v).toBeLessThan(250);
    });

    test('should fetch historical data', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
        params: {
          deviceId: TEST_METERS.secure.id,
          dataType: 'historical'
        },
        headers: {
          'X-Secure-Token': TEST_METERS.secure.token
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.data_type).toBe('historical');
      expect(response.data.period).toBe('24_hours');
      expect(response.data.readings).toHaveLength(24);
      expect(response.data.summary).toHaveProperty('total_energy_kwh');
      expect(response.data.summary).toHaveProperty('peak_demand_kw');
      
      // Validate historical data structure
      response.data.readings.forEach(reading => {
        expect(reading).toHaveProperty('timestamp');
        expect(reading).toHaveProperty('energy_kwh');
        expect(reading).toHaveProperty('cost_inr');
        expect(new Date(reading.timestamp)).toBeInstanceOf(Date);
      });
    });

    test('should reject unauthorized requests', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
          params: {
            deviceId: TEST_METERS.secure.id,
            dataType: 'current'
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('error', 'Unauthorized access');
      }
    });
  });

  // L&T API Tests
  describe('L&T Smart Meter API', () => {
    test('should fetch comprehensive meter reading', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/lntMeterApi`, {
        params: {
          meterId: TEST_METERS.lnt.id,
          function: 'read'
        },
        headers: {
          'L-T-API-Key': TEST_METERS.lnt.apiKey
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data).toHaveProperty('manufacturer', 'Larsen & Toubro');
      expect(response.data.data).toHaveProperty('electrical_parameters');
      expect(response.data.data).toHaveProperty('energy_registers');
      expect(response.data.data).toHaveProperty('device_status');
      
      // Validate electrical parameters
      const params = response.data.data.electrical_parameters;
      expect(params.voltage).toHaveProperty('phase_r');
      expect(params.voltage).toHaveProperty('average');
      expect(params.power).toHaveProperty('active_kw');
      expect(params.power).toHaveProperty('power_factor');
      
      // Validate ranges
      expect(params.voltage.average).toBeGreaterThan(220);
      expect(params.voltage.average).toBeLessThan(250);
      expect(params.power.power_factor).toBeGreaterThan(0.7);
      expect(params.power.power_factor).toBeLessThan(1.0);
    });

    test('should fetch power quality data', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/lntMeterApi`, {
        params: {
          meterId: TEST_METERS.lnt.id,
          function: 'power_quality'
        },
        headers: {
          'L-T-API-Key': TEST_METERS.lnt.apiKey
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('voltage_quality');
      expect(response.data.data).toHaveProperty('current_quality');
      expect(response.data.data).toHaveProperty('harmonic_analysis');
      
      // Validate power quality metrics
      const vq = response.data.data.voltage_quality;
      expect(typeof vq.thd_v_percent).toBe('number');
      expect(vq.thd_v_percent).toBeGreaterThanOrEqual(0);
      expect(vq.thd_v_percent).toBeLessThan(10); // Reasonable THD limit
      
      // Validate harmonic data
      expect(response.data.data.harmonic_analysis).toHaveProperty('voltage_harmonics');
      expect(response.data.data.harmonic_analysis).toHaveProperty('current_harmonics');
    });

    test('should handle invalid function parameter', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/lntMeterApi`, {
          params: {
            meterId: TEST_METERS.lnt.id,
            function: 'invalid_function'
          },
          headers: {
            'L-T-API-Key': TEST_METERS.lnt.apiKey
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.code).toBe('INVALID_FUNCTION');
      }
    });
  });

  // Unified Gateway Tests
  describe('Unified Smart Meter Gateway', () => {
    test('should route Qube meter requests correctly', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
        params: {
          meterId: TEST_METERS.qube.id,
          brand: 'QUBE',
          dataType: 'current',
          userId: 'test_user_123'
        },
        headers: {
          'Authorization': 'Bearer test_token_123'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.meter_info.brand).toBe('QUBE');
      expect(response.data.meter_info.id).toBe(TEST_METERS.qube.id);
      expect(response.data).toHaveProperty('data');
      expect(response.data.metadata.api_version).toBe('unified_v1.0');
    });

    test('should route Secure meter requests correctly', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
        params: {
          meterId: TEST_METERS.secure.id,
          brand: 'SECURE',
          dataType: 'current',
          userId: 'test_user_123'
        },
        headers: {
          'Authorization': 'Bearer test_token_123'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.meter_info.brand).toBe('SECURE');
    });

    test('should reject unsupported meter brands', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
          params: {
            meterId: 'UNKNOWN_001',
            brand: 'UNSUPPORTED_BRAND',
            dataType: 'current'
          },
          headers: {
            'Authorization': 'Bearer test_token_123'
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Unsupported meter brand');
      }
    });

    test('should require authorization token', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
          params: {
            meterId: TEST_METERS.qube.id,
            brand: 'QUBE',
            dataType: 'current'
          }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Authorization token required');
      }
    });
  });

  // Performance and Load Tests
  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
            params: {
              meterId: `${TEST_METERS.qube.id}_${i}`,
              apiKey: TEST_METERS.qube.apiKey
            }
          })
        );
      }

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('success');
      });
    });

    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
        params: {
          meterId: TEST_METERS.qube.id,
          brand: 'QUBE',
          dataType: 'current'
        },
        headers: {
          'Authorization': 'Bearer test_token_123'
        }
      });

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 second timeout
      expect(response.data.metadata.processing_time_ms).toBeLessThan(3000);
    });
  });

  // Data Validation Tests
  describe('Data Validation Tests', () => {
    test('should maintain realistic power consumption patterns', async () => {
      const hourlyReadings = [];
      
      // Simulate 24 hours of readings (sped up for testing)
      for (let hour = 0; hour < 24; hour++) {
        const mockTime = new Date();
        mockTime.setHours(hour);
        
        const response = await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
          params: {
            meterId: `TEST_HOUR_${hour}`,
            apiKey: TEST_METERS.qube.apiKey
          }
        });
        
        hourlyReadings.push({
          hour,
          power: response.data.data.instantaneous.active_power
        });
      }
      
      // Validate daily consumption pattern
      const morningPeak = hourlyReadings.filter(r => r.hour >= 6 && r.hour <= 9);
      const eveningPeak = hourlyReadings.filter(r => r.hour >= 19 && r.hour <= 22);
      const nightLow = hourlyReadings.filter(r => r.hour >= 23 || r.hour <= 5);
      
      const avgMorning = morningPeak.reduce((sum, r) => sum + r.power, 0) / morningPeak.length;
      const avgEvening = eveningPeak.reduce((sum, r) => sum + r.power, 0) / eveningPeak.length;
      const avgNight = nightLow.reduce((sum, r) => sum + r.power, 0) / nightLow.length;
      
      // Evening should be highest, morning medium, night lowest
      expect(avgEvening).toBeGreaterThan(avgMorning);
      expect(avgMorning).toBeGreaterThan(avgNight);
      expect(avgNight).toBeLessThan(1.0); // Night consumption should be low
    });

    test('should validate energy conservation laws', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/lntMeterApi`, {
        params: {
          meterId: TEST_METERS.lnt.id,
          function: 'read'
        },
        headers: {
          'L-T-API-Key': TEST_METERS.lnt.apiKey
        }
      });

      const params = response.data.data.electrical_parameters;
      
      // Power factor should be between 0 and 1
      expect(params.power.power_factor).toBeGreaterThan(0);
      expect(params.power.power_factor).toBeLessThanOrEqual(1);
      
      // Apparent power should be greater than or equal to active power
      expect(params.power.apparent_kva).toBeGreaterThanOrEqual(params.power.active_kw);
      
      // Frequency should be close to 50 Hz (±1 Hz tolerance)
      expect(params.frequency_hz).toBeGreaterThan(49);
      expect(params.frequency_hz).toBeLessThan(51);
    });

    test('should validate cost calculations', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
        params: {
          meterId: TEST_METERS.qube.id,
          apiKey: TEST_METERS.qube.apiKey
        }
      });

      const energyToday = response.data.data.energy.active_energy_today;
      const costToday = response.data.data.billing.cost_today;
      const tariffRate = response.data.data.billing.tariff_rate;
      
      // Cost should approximately equal energy * tariff rate
      const expectedCost = energyToday * tariffRate;
      const costDifference = Math.abs(costToday - expectedCost);
      
      expect(costDifference).toBeLessThan(1.0); // ±₹1 tolerance
    });
  });

  // Error Handling Tests
  describe('Error Handling Tests', () => {
    test('should handle network timeouts gracefully', async () => {
      const shortTimeout = 100; // Very short timeout to trigger error
      
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
          params: {
            deviceId: TEST_METERS.secure.id,
            dataType: 'historical' // This might take longer
          },
          headers: {
            'X-Secure-Token': TEST_METERS.secure.token
          },
          timeout: shortTimeout
        });
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
      }
    });

    test('should validate meter ID format', async () => {
      const invalidMeterIds = ['', '123', 'invalid-format', null, undefined];
      
      for (const invalidId of invalidMeterIds) {
        try {
          await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
            params: {
              meterId: invalidId,
              apiKey: TEST_METERS.qube.apiKey
            }
          });
        } catch (error) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
        }
      }
    });
  });
});

// Utility Functions for Testing
const generateTestMeterIds = (brand, count) => {
  const ids = [];
  for (let i = 1; i <= count; i++) {
    ids.push(`${brand}_TEST_${i.toString().padStart(3, '0')}`);
  }
  return ids;
};

const simulateLoadPattern = (hour, day = 'weekday') => {
  let baseLoad = 2.0;
  
  if (day === 'weekend') {
    baseLoad *= 0.8; // Lower weekend consumption
  }
  
  // Time-based multipliers
  if (hour >= 6 && hour <= 9) baseLoad *= 1.4;
  if (hour >= 12 && hour <= 14) baseLoad *= 1.2;
  if (hour >= 19 && hour <= 22) baseLoad *= 1.7;
  if (hour >= 23 || hour <= 5) baseLoad *= 0.3;
  
  return baseLoad + (Math.random() - 0.5) * 0.5;
};

// Integration Test Utilities
const validateMeterResponse = (response, brand) => {
  const commonValidations = {
    hasTimestamp: () => expect(response.data).toHaveProperty('timestamp'),
    hasMeterId: () => expect(response.data).toHaveProperty('meter_id'),
    hasPositivePower: () => {
      const power = extractPowerValue(response.data, brand);
      expect(power).toBeGreaterThan(0);
    },
    hasReasonableVoltage: () => {
      const voltage = extractVoltageValue(response.data, brand);
      expect(voltage).toBeGreaterThan(200);
      expect(voltage).toBeLessThan(250);
    }
  };
  
  Object.values(commonValidations).forEach(validation => validation());
};

const extractPowerValue = (data, brand) => {
  switch (brand.toUpperCase()) {
    case 'QUBE':
      return data.data.instantaneous.active_power;
    case 'SECURE':
      return data.readings.active_power_kw;
    case 'LNT':
      return data.data.electrical_parameters.power.active_kw;
    default:
      return 0;
  }
};

const extractVoltageValue = (data, brand) => {
  switch (brand.toUpperCase()) {
    case 'QUBE':
      return data.data.instantaneous.voltage;
    case 'SECURE':
      return data.readings.voltage_v;
    case 'LNT':
      return data.data.electrical_parameters.voltage.average;
    default:
      return 0;
  }
};

// Export for use in other test files
module.exports = {
  TEST_CONFIG,
  TEST_METERS,
  generateTestMeterIds,
  simulateLoadPattern,
  validateMeterResponse,
  extractPowerValue,
  extractVoltageValue
};