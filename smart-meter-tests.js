// Smart Meter API Testing Suite
// Run with: jest smart-meter-tests.js
// IMPORTANT: Make sure your Next.js dev server is running on localhost:9002

const axios = require('axios');

// Test Configuration
const TEST_CONFIG = {
  // baseUrl: 'https://your-project.cloudfunctions.net', // Original
  baseUrl: 'http://localhost:9002/api/smart-meter', // Updated for Next.js API Routes
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

describe('Smart Meter API Integration Tests (Next.js)', () => {
  
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
      
      expect(typeof response.data.data.instantaneous.active_power).toBe('number');
      expect(typeof response.data.data.energy.active_energy_today).toBe('number');
      
      expect(response.data.data.instantaneous.active_power).toBeGreaterThan(0);
    });

    test('should reject invalid API key', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/qubeRealTimeData`, {
          params: { meterId: TEST_METERS.qube.id, apiKey: 'invalid_key' }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('error', 'Invalid API key');
      }
    });
  });

  // Secure Meters API Tests
  describe('Secure Meters API', () => {
    test('should fetch current reading data', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
        params: { deviceId: TEST_METERS.secure.id, dataType: 'current' },
        headers: { 'X-Secure-Token': TEST_METERS.secure.token }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('device_id', TEST_METERS.secure.id);
      expect(response.data.readings).toHaveProperty('active_power_kw');
      expect(typeof response.data.readings.active_power_kw).toBe('number');
    });

    test('should fetch historical data', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
        params: { deviceId: TEST_METERS.secure.id, dataType: 'historical' },
        headers: { 'X-Secure-Token': TEST_METERS.secure.token }
      });

      expect(response.status).toBe(200);
      expect(response.data.data_type).toBe('historical');
      expect(response.data.period).toBe('24_hours');
      expect(response.data.readings).toHaveLength(24);
      expect(response.data.summary).toHaveProperty('total_energy_kwh');
      
      response.data.readings.forEach((reading:any) => {
        expect(reading).toHaveProperty('timestamp');
        expect(reading).toHaveProperty('energy_kwh');
      });
    });

    test('should reject unauthorized requests', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/secureMetersData`, {
          params: { deviceId: TEST_METERS.secure.id, dataType: 'current' }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // L&T API Tests
  describe('L&T Smart Meter API', () => {
    test('should fetch meter reading', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/lntMeterApi`, {
        params: { meterId: TEST_METERS.lnt.id, function: 'read' },
        headers: { 'L-T-API-Key': TEST_METERS.lnt.apiKey }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data.data).toHaveProperty('electrical_parameters');
      const params = response.data.data.electrical_parameters;
      expect(params.power).toHaveProperty('active_kw');
    });
  });

  // Unified Gateway Tests
  describe('Unified Smart Meter Gateway', () => {
    test('should route Qube meter requests correctly', async () => {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
        params: { meterId: TEST_METERS.qube.id, brand: 'QUBE', userId: 'test_user_123' },
        headers: { 'Authorization': 'Bearer test_token_123' }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.meter_info.brand).toBe('QUBE');
      expect(response.data.meter_info.id).toBe(TEST_METERS.qube.id);
      expect(response.data.metadata.api_version).toBe('unified_v1.0');
    });

    test('should reject unsupported meter brands', async () => {
      try {
        await axios.get(`${TEST_CONFIG.baseUrl}/unifiedMeterGateway`, {
          params: { meterId: 'UNKNOWN_001', brand: 'UNSUPPORTED_BRAND' },
          headers: { 'Authorization': 'Bearer test_token_123' }
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Unsupported meter brand');
      }
    });
  });
});
