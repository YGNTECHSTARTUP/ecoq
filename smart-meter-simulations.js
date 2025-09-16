// Firebase Cloud Functions - Smart Meter API Simulations
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

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

// ========================================
// QUBE SMART METER API SIMULATION
// ========================================

exports.qubeRealTimeData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { meterId, apiKey } = req.query;
      
      // Validation
      if (!meterId) {
        return res.status(400).json({
          status: 'error',
          error: 'Meter ID required',
          code: 'MISSING_METER_ID'
        });
      }
      
      if (!validateApiKey(apiKey, 'qube_demo')) {
        return res.status(401).json({
          status: 'error',
          error: 'Invalid API key',
          code: 'INVALID_API_KEY'
        });
      }

      // Generate realistic data
      const data = generateRealisticData(meterId, 'QUBE');
      const currentHour = new Date().getHours();
      
      // Simulate accumulated energy (daily)
      const energyToday = 2.5 + (currentHour * 0.8) + Math.random() * 2;
      const costToday = calculateCost(energyToday, 5.2, isPeakHour());

      const response = {
        status: 'success',
        timestamp: new Date().toISOString(),
        meter_id: meterId,
        brand: 'Qube',
        model: 'Q-Smart-Pro-2024',
        location: 'Main Panel',
        data: {
          instantaneous: {
            active_power: Math.round(data.activePower * 100) / 100,
            reactive_power: Math.round(data.reactivePower * 100) / 100,
            apparent_power: Math.round(data.apparentPower * 100) / 100,
            voltage: Math.round(data.voltage * 10) / 10,
            current: Math.round(data.current * 100) / 100,
            power_factor: Math.round(data.powerFactor * 1000) / 1000,
            frequency: Math.round(data.frequency * 10) / 10
          },
          energy: {
            active_energy_today: Math.round(energyToday * 100) / 100,
            active_energy_month: Math.round((energyToday * 15 + Math.random() * 50) * 100) / 100,
            reactive_energy_today: Math.round(energyToday * 0.3 * 100) / 100
          },
          billing: {
            cost_today: Math.round(costToday * 100) / 100,
            tariff_rate: 5.2,
            is_peak_hour: isPeakHour(),
            next_billing_date: '2024-02-01',
            billing_cycle: 'monthly'
          },
          status: {
            connection_quality: Math.random() > 0.1 ? 'excellent' : 'good',
            last_communication: new Date().toISOString(),
            tamper_status: 'normal',
            battery_level: Math.floor(85 + Math.random() * 15), // 85-100%
            signal_strength: Math.floor(75 + Math.random() * 25) // 75-100%
          }
        },
        metadata: {
          api_version: 'qube_v2.1',
          response_time_ms: Math.floor(50 + Math.random() * 200),
          data_freshness: 'real_time'
        }
      };

      // Log the request for analytics
      await db.collection('api_logs').add({
        api: 'qube',
        meterId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        responseTime: response.metadata.response_time_ms,
        success: true
      });

      res.status(200).json(response);

    } catch (error) {
      console.error('Qube API Error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });
});

// ========================================
// SECURE METERS API SIMULATION
// ========================================

exports.secureMetersData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { deviceId, dataType } = req.query;
      const token = req.headers['x-secure-token'];
      
      // Validation
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized access',
          message: 'X-Secure-Token header required'
        });
      }

      if (!token.includes('secure_demo_token')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          error: 'Device ID required',
          code: 'MISSING_DEVICE_ID'
        });
      }

      if (dataType === 'current' || !dataType) {
        // Current/Real-time data
        const data = generateRealisticData(deviceId, 'SECURE');
        
        const response = {
          success: true,
          timestamp: new Date().toISOString(),
          device_id: deviceId,
          manufacturer: 'Secure Meters Ltd',
          model: 'SM-Advanced-v3',
          firmware_version: '2.4.1',
          readings: {
            active_power_kw: Math.round(data.activePower * 100) / 100,
            reactive_power_kvar: Math.round(data.reactivePower * 100) / 100,
            voltage_v: Math.round(data.voltage * 10) / 10,
            current_a: Math.round(data.current * 100) / 100,
            power_factor: Math.round(data.powerFactor * 1000) / 1000,
            frequency_hz: Math.round(data.frequency * 10) / 10,
            energy_today_kwh: Math.round((2.8 + Math.random() * 3) * 100) / 100
          },
          status: {
            device_status: 'online',
            connection_quality: 'stable',
            last_update: new Date().toISOString(),
            communication_protocol: 'MQTT',
            encryption_status: 'enabled'
          },
          tariff: {
            current_rate: 5.8,
            rate_category: isPeakHour() ? 'peak' : 'normal',
            monthly_charges: 45.0
          }
        };

        res.status(200).json(response);

      } else if (dataType === 'historical') {
        // Historical data (24 hours)
        const readings = [];
        let totalEnergy = 0;
        let peakDemand = 0;
        
        for (let hour = 0; hour < 24; hour++) {
          const hourData = generateRealisticData(deviceId, 'SECURE', hour);
          const energy = hourData.activePower * 1; // 1 hour
          totalEnergy += energy;
          peakDemand = Math.max(peakDemand, hourData.activePower);
          
          const timestamp = new Date();
          timestamp.setHours(timestamp.getHours() - (23 - hour), 0, 0, 0);
          
          readings.push({
            timestamp: timestamp.toISOString(),
            energy_kwh: Math.round(energy * 100) / 100,
            power_kw: Math.round(hourData.activePower * 100) / 100,
            cost_inr: Math.round(calculateCost(energy, 5.8, hour >= 19 && hour <= 22) * 100) / 100,
            quality_rating: Math.random() > 0.1 ? 'good' : 'fair'
          });
        }

        const response = {
          success: true,
          device_id: deviceId,
          data_type: 'historical',
          period: '24_hours',
          readings: readings,
          summary: {
            total_energy_kwh: Math.round(totalEnergy * 100) / 100,
            peak_demand_kw: Math.round(peakDemand * 100) / 100,
            average_power_kw: Math.round((totalEnergy / 24) * 100) / 100,
            total_cost_inr: Math.round(readings.reduce((sum, r) => sum + r.cost_inr, 0) * 100) / 100
          },
          metadata: {
            generated_at: new Date().toISOString(),
            data_quality: 'high',
            completeness: '100%'
          }
        };

        res.status(200).json(response);

      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid dataType. Use "current" or "historical"',
          code: 'INVALID_DATA_TYPE'
        });
      }

    } catch (error) {
      console.error('Secure Meters API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
});

// ========================================
// L&T SMART METER API SIMULATION
// ========================================

exports.lntMeterApi = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { meterId, function: apiFunction } = req.query;
      const apiKey = req.headers['l-t-api-key'];
      
      // Validation
      if (!apiKey || !apiKey.includes('LT_demo_key')) {
        return res.status(401).json({
          status: 'error',
          error: 'Invalid or missing API key',
          code: 'UNAUTHORIZED'
        });
      }

      if (!meterId) {
        return res.status(400).json({
          status: 'error',
          error: 'Meter ID is required',
          code: 'MISSING_METER_ID'
        });
      }

      const validFunctions = ['read', 'power_quality', 'events', 'control'];
      if (!apiFunction || !validFunctions.includes(apiFunction)) {
        return res.status(400).json({
          status: 'error',
          error: `Invalid function. Valid options: ${validFunctions.join(', ')}`,
          code: 'INVALID_FUNCTION'
        });
      }

      const data = generateRealisticData(meterId, 'LNT');

      if (apiFunction === 'read') {
        // Standard meter reading
        const response = {
          status: 'success',
          timestamp: new Date().toISOString(),
          meter_id: meterId,
          manufacturer: 'Larsen & Toubro',
          model: 'LT-Smart-Energy-Pro',
          serial_number: `LT${meterId.slice(-6)}`,
          data: {
            electrical_parameters: {
              voltage: {
                phase_r: Math.round((data.voltage + Math.random() * 4 - 2) * 10) / 10,
                phase_y: Math.round((data.voltage + Math.random() * 4 - 2) * 10) / 10,
                phase_b: Math.round((data.voltage + Math.random() * 4 - 2) * 10) / 10,
                average: Math.round(data.voltage * 10) / 10,
                neutral_voltage: Math.round(Math.random() * 2 * 10) / 10
              },
              current: {
                phase_r: Math.round((data.current + Math.random() * 2 - 1) * 100) / 100,
                phase_y: Math.round((data.current + Math.random() * 2 - 1) * 100) / 100,
                phase_b: Math.round((data.current + Math.random() * 2 - 1) * 100) / 100,
                neutral: Math.round(Math.random() * 0.5 * 100) / 100
              },
              power: {
                active_kw: Math.round(data.activePower * 100) / 100,
                reactive_kvar: Math.round(data.reactivePower * 100) / 100,
                apparent_kva: Math.round(data.apparentPower * 100) / 100,
                power_factor: Math.round(data.powerFactor * 1000) / 1000
              },
              frequency_hz: Math.round(data.frequency * 10) / 10
            },
            energy_registers: {
              active_energy_import: Math.round((150 + Math.random() * 50) * 100) / 100,
              active_energy_export: Math.round(Math.random() * 5 * 100) / 100, // Solar/DG
              reactive_energy_import: Math.round((25 + Math.random() * 10) * 100) / 100,
              reactive_energy_export: Math.round(Math.random() * 2 * 100) / 100,
              maximum_demand: {
                current_month: Math.round((data.activePower + Math.random()) * 100) / 100,
                timestamp: new Date().toISOString()
              }
            },
            device_status: {
              tamper_status: Math.random() > 0.02 ? 'normal' : 'detected',
              cover_open: false,
              magnetic_influence: false,
              power_failure_count: Math.floor(Math.random() * 3),
              last_power_failure: '2024-01-10T15:30:00Z',
              device_time: new Date().toISOString(),
              rtc_status: 'synchronized'
            }
          },
          communication: {
            signal_strength_dbm: Math.floor(-60 + Math.random() * 20),
            last_communication: new Date().toISOString(),
            protocol: 'DLMS/COSEM',
            encryption: 'AES-128'
          },
          billing: {
            tariff_category: 'Domestic',
            billing_period: 'monthly',
            next_billing_date: '2024-02-01',
            current_bill_amount: Math.round((data.activePower * 24 * 30 * 5.5) * 100) / 100
          }
        };

        res.status(200).json(response);

      } else if (apiFunction === 'power_quality') {
        // Power quality analysis
        const response = {
          status: 'success',
          meter_id: meterId,
          analysis_type: 'power_quality',
          timestamp: new Date().toISOString(),
          data: {
            voltage_quality: {
              thd_v_percent: Math.round((2 + Math.random() * 3) * 100) / 100, // 2-5%
              voltage_unbalance_percent: Math.round(Math.random() * 2 * 100) / 100, // 0-2%
              voltage_variations: {
                over_voltage_events: Math.floor(Math.random() * 3),
                under_voltage_events: Math.floor(Math.random() * 5),
                voltage_swells: Math.floor(Math.random() * 2),
                voltage_sags: Math.floor(Math.random() * 4)
              }
            },
            current_quality: {
              thd_i_percent: Math.round((3 + Math.random() * 5) * 100) / 100, // 3-8%
              current_unbalance_percent: Math.round(Math.random() * 3 * 100) / 100,
              neutral_current_percent: Math.round(Math.random() * 10 * 100) / 100
            },
            harmonic_analysis: {
              voltage_harmonics: Array.from({ length: 10 }, (_, i) => ({
                order: i + 2,
                magnitude_percent: Math.round(Math.random() * (5 - i * 0.5) * 100) / 100
              })),
              current_harmonics: Array.from({ length: 10 }, (_, i) => ({
                order: i + 2,
                magnitude_percent: Math.round(Math.random() * (8 - i * 0.7) * 100) / 100
              }))
            },
            power_factor_analysis: {
              displacement_power_factor: Math.round((0.85 + Math.random() * 0.12) * 1000) / 1000,
              distortion_power_factor: Math.round((0.95 + Math.random() * 0.04) * 1000) / 1000,
              total_power_factor: Math.round(data.powerFactor * 1000) / 1000
            },
            frequency_analysis: {
              average_frequency: Math.round(data.frequency * 100) / 100,
              frequency_variations: Math.floor(Math.random() * 2),
              frequency_stability: Math.random() > 0.1 ? 'stable' : 'unstable'
            }
          },
          quality_rating: {
            overall_grade: Math.random() > 0.2 ? 'A' : 'B',
            voltage_grade: Math.random() > 0.15 ? 'A' : 'B',
            current_grade: Math.random() > 0.25 ? 'A' : 'B',
            harmonic_grade: Math.random() > 0.3 ? 'A' : 'B'
          }
        };

        res.status(200).json(response);

      } else if (apiFunction === 'events') {
        // Event log
        const eventTypes = [
          'Power restored', 'Power failure', 'Tamper detected', 'Tamper cleared',
          'Cover opened', 'Cover closed', 'Billing date', 'Demand reset'
        ];
        
        const events = Array.from({ length: 5 + Math.floor(Math.random() * 10) }, (_, i) => {
          const timestamp = new Date();
          timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 720)); // Last 30 days
          
          return {
            event_id: `EVT_${Date.now()}_${i}`,
            timestamp: timestamp.toISOString(),
            event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
            description: 'System generated event',
            acknowledged: Math.random() > 0.3
          };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
          status: 'success',
          meter_id: meterId,
          data_type: 'events',
          events: events,
          summary: {
            total_events: events.length,
            unacknowledged: events.filter(e => !e.acknowledged).length,
            high_severity: events.filter(e => e.severity === 'high').length
          }
        });

      } else if (apiFunction === 'control') {
        // Control/configuration options (read-only for demo)
        res.status(200).json({
          status: 'success',
          meter_id: meterId,
          available_controls: [
            { name: 'demand_reset', enabled: true, description: 'Reset maximum demand' },
            { name: 'time_sync', enabled: true, description: 'Synchronize device time' },
            { name: 'event_clear', enabled: true, description: 'Clear acknowledged events' },
            { name: 'load_disconnect', enabled: false, description: 'Disconnect load (not available in demo)' }
          ],
          configuration: {
            demand_integration_period: 15, // minutes
            event_logging: true,
            automatic_billing: true,
            power_quality_monitoring: true
          },
          note: 'Control functions are read-only in demo mode'
        });
      }

    } catch (error) {
      console.error('L&T API Error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });
});

// ========================================
// UNIFIED SMART METER GATEWAY
// ========================================

exports.unifiedMeterGateway = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { meterId, brand, dataType, userId } = req.query;
      const authHeader = req.headers.authorization;
      
      // Authentication check
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required',
          code: 'UNAUTHORIZED'
        });
      }

      const token = authHeader.substring(7);
      if (!token.includes('test_token')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid authorization token',
          code: 'INVALID_TOKEN'
        });
      }

      if (!meterId || !brand) {
        return res.status(400).json({
          success: false,
          error: 'Meter ID and brand are required',
          code: 'MISSING_PARAMETERS'
        });
      }

      const supportedBrands = ['QUBE', 'SECURE', 'LNT'];
      if (!supportedBrands.includes(brand.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: `Unsupported meter brand: ${brand}. Supported: ${supportedBrands.join(', ')}`,
          code: 'UNSUPPORTED_BRAND'
        });
      }

      const processingStart = Date.now();
      const data = generateRealisticData(meterId, brand.toUpperCase());
      
      // Normalize data across different brands
      const normalizedData = {
        power: {
          active_kw: Math.round(data.activePower * 100) / 100,
          reactive_kvar: Math.round(data.reactivePower * 100) / 100,
          apparent_kva: Math.round(data.apparentPower * 100) / 100,
          power_factor: Math.round(data.powerFactor * 1000) / 1000
        },
        electrical: {
          voltage_v: Math.round(data.voltage * 10) / 10,
          current_a: Math.round(data.current * 100) / 100,
          frequency_hz: Math.round(data.frequency * 10) / 10
        },
        energy: {
          daily_kwh: Math.round((2.5 + Math.random() * 3) * 100) / 100,
          cost_inr: Math.round(calculateCost(2.5 + Math.random() * 3, 5.5, isPeakHour()) * 100) / 100
        },
        status: {
          connection: 'online',
          quality: Math.random() > 0.1 ? 'excellent' : 'good',
          last_reading: new Date().toISOString()
        }
      };

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        meter_info: {
          id: meterId,
          brand: brand.toUpperCase(),
          location: 'Main Panel',
          user_id: userId || 'anonymous'
        },
        data: normalizedData,
        metadata: {
          api_version: 'unified_v1.0',
          processing_time_ms: Date.now() - processingStart,
          data_freshness: 'real_time',
          source_api: brand.toLowerCase(),
          normalized: true
        }
      };

      // Log unified API usage
      if (userId) {
        await db.collection('unified_api_logs').add({
          userId,
          meterId,
          brand: brand.toUpperCase(),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          responseTime: response.metadata.processing_time_ms,
          success: true
        });
      }

      res.status(200).json(response);

    } catch (error) {
      console.error('Unified Gateway Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'GATEWAY_ERROR'
      });
    }
  });
});

// ========================================
// BATCH DATA COLLECTION FOR MULTIPLE METERS
// ========================================

exports.batchMeterData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { meterIds, userId } = req.body;
      const authHeader = req.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      if (!meterIds || !Array.isArray(meterIds)) {
        return res.status(400).json({ error: 'meterIds array required' });
      }

      if (meterIds.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 meters per batch request' });
      }

      const results = [];
      const processingStart = Date.now();

      for (const meterConfig of meterIds) {
        try {
          const { id, brand } = meterConfig;
          const data = generateRealisticData(id, brand);
          
          results.push({
            meter_id: id,
            brand: brand,
            success: true,
            data: {
              active_power: Math.round(data.activePower * 100) / 100,
              voltage: Math.round(data.voltage * 10) / 10,
              current: Math.round(data.current * 100) / 100,
              energy_today: Math.round((2.5 + Math.random() * 3) * 100) / 100
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            meter_id: meterConfig.id,
            brand: meterConfig.brand,
            success: false,
            error: 'Failed to fetch data',
            timestamp: new Date().toISOString()
          });
        }
      }

      const response = {
        success: true,
        batch_id: `batch_${Date.now()}`,
        total_meters: meterIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results,
        metadata: {
          processing_time_ms: Date.now() - processingStart,
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Batch API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
});

// ========================================
// API HEALTH CHECK
// ========================================

exports.meterApiHealth = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      apis: {
        qube: { status: 'operational', response_time: '~100ms' },
        secure: { status: 'operational', response_time: '~150ms' },
        lnt: { status: 'operational', response_time: '~120ms' },
        unified_gateway: { status: 'operational', response_time: '~80ms' }
      },
      system_info: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        node_version: process.version
      }
    };

    res.status(200).json(health);
  });
});

// Export configuration for local testing
module.exports = {
  generateRealisticData,
  calculateCost,
  validateApiKey,
  isPeakHour
};
