import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified in-memory simulation.
// In a real app, you'd use a database like Firestore.
const db = {
    api_logs: [],
    unified_api_logs: []
};

// Utility Functions
const generateRealisticData = (meterId: string, brand: string, hour = new Date().getUTCHours() + 5.5) => { // IST approximation
  let baseLoad = 2.5; // kW
  let multiplier = 1.0;

  if (hour >= 6 && hour <= 9) multiplier = 1.4;
  if (hour >= 12 && hour <= 14) multiplier = 1.2;
  if (hour >= 19 && hour <= 22) multiplier = 1.7;
  if (hour >= 23 || hour <= 5) multiplier = 0.3;

  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) multiplier *= 0.85;

  const activePower = (baseLoad * multiplier) + (Math.random() - 0.5) * 0.8;
  const voltage = 230 + (Math.random() - 0.5) * 20;
  const current = activePower > 0 ? (activePower * 1000) / voltage : 0;
  const powerFactor = 0.85 + Math.random() * 0.12;
  
  return {
    activePower: Math.max(0.1, activePower),
    voltage: Math.max(210, Math.min(250, voltage)),
    current: Math.max(0.5, current),
    powerFactor: Math.min(0.99, powerFactor),
    frequency: 49.8 + Math.random() * 0.4,
    apparentPower: activePower / powerFactor,
    reactivePower: Math.sqrt(Math.pow(activePower / powerFactor, 2) - Math.pow(activePower, 2))
  };
};

const calculateCost = (energyKwh: number, tariffRate = 5.5, isPeakHour = false) => {
  const rate = isPeakHour ? tariffRate * 1.3 : tariffRate;
  return energyKwh * rate;
};

const validateApiKey = (apiKey: string | null, expectedFormat: string) => {
  if (!apiKey) return false;
  return apiKey.includes(expectedFormat);
};

const isPeakHour = () => {
  const hour = new Date().getUTCHours() + 5.5;
  return hour >= 19 && hour <= 22;
};


async function handler(req: NextRequest, { params }: { params: { slug: string[] }}) {
    const slug = params.slug.join('/');

    if (slug === 'qubeRealTimeData') {
        return qubeRealTimeData(req);
    }
    if (slug === 'secureMetersData') {
        return secureMetersData(req);
    }
    if (slug === 'lntMeterApi') {
        return lntMeterApi(req);
    }
    if (slug === 'unifiedMeterGateway') {
        return unifiedMeterGateway(req);
    }
    
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

// QUBE API
async function qubeRealTimeData(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const meterId = searchParams.get('meterId');
    const apiKey = searchParams.get('apiKey');

    if (!meterId) {
        return NextResponse.json({ status: 'error', error: 'Meter ID required', code: 'MISSING_METER_ID' }, { status: 400 });
    }
    if (!validateApiKey(apiKey, 'qube_demo')) {
        return NextResponse.json({ status: 'error', error: 'Invalid API key', code: 'INVALID_API_KEY' }, { status: 401 });
    }

    const data = generateRealisticData(meterId, 'QUBE');
    const currentHour = new Date().getUTCHours() + 5.5;
    const energyToday = 2.5 + (currentHour * 0.8) + Math.random() * 2;
    const costToday = calculateCost(energyToday, 5.2, isPeakHour());

    const response = {
        status: 'success',
        timestamp: new Date().toISOString(),
        meter_id: meterId,
        brand: 'Qube',
        model: 'Q-Smart-Pro-2024',
        data: {
          instantaneous: { active_power: Math.round(data.activePower * 100) / 100 },
          energy: { active_energy_today: Math.round(energyToday * 100) / 100, },
          billing: { cost_today: Math.round(costToday * 100) / 100, tariff_rate: 5.2, is_peak_hour: isPeakHour(), },
          status: { connection_quality: 'excellent', tamper_status: 'normal',},
        },
        metadata: { api_version: 'qube_v2.1', response_time_ms: 50, data_freshness: 'real_time'}
    };
    return NextResponse.json(response);
}

// SECURE METERS API
async function secureMetersData(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');
    const dataType = searchParams.get('dataType');
    const token = req.headers.get('x-secure-token');

    if (!token || !token.includes('secure_demo_token')) {
        return NextResponse.json({ success: false, error: 'Unauthorized access', message: 'X-Secure-Token header required' }, { status: 401 });
    }
    if (!deviceId) {
        return NextResponse.json({ success: false, error: 'Device ID required', code: 'MISSING_DEVICE_ID' }, { status: 400 });
    }

    if (dataType === 'current' || !dataType) {
        const data = generateRealisticData(deviceId, 'SECURE');
        const response = {
          success: true,
          timestamp: new Date().toISOString(),
          device_id: deviceId,
          readings: {
            active_power_kw: Math.round(data.activePower * 100) / 100,
            voltage_v: Math.round(data.voltage * 10) / 10,
          },
          status: { device_status: 'online', connection_quality: 'stable' },
        };
        return NextResponse.json(response);

    } else if (dataType === 'historical') {
        const readings = [];
        let totalEnergy = 0;
        let peakDemand = 0;
        for (let hour = 0; hour < 24; hour++) {
          const hourData = generateRealisticData(deviceId, 'SECURE', hour);
          const energy = hourData.activePower * 1;
          totalEnergy += energy;
          peakDemand = Math.max(peakDemand, hourData.activePower);
          const timestamp = new Date();
          timestamp.setHours(timestamp.getHours() - (23 - hour), 0, 0, 0);
          readings.push({
            timestamp: timestamp.toISOString(),
            energy_kwh: Math.round(energy * 100) / 100,
            power_kw: Math.round(hourData.activePower * 100) / 100,
            cost_inr: Math.round(calculateCost(energy, 5.8, hour >= 19 && hour <= 22) * 100) / 100,
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
            total_cost_inr: Math.round(readings.reduce((sum, r) => sum + r.cost_inr, 0) * 100) / 100
          },
        };
        return NextResponse.json(response);
    }
    return NextResponse.json({ success: false, error: 'Invalid dataType' }, { status: 400 });
}

// L&T API
async function lntMeterApi(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const meterId = searchParams.get('meterId');
    const apiFunction = searchParams.get('function');
    const apiKey = req.headers.get('l-t-api-key');

    if (!apiKey || !apiKey.includes('LT_demo_key')) {
        return NextResponse.json({ status: 'error', error: 'Invalid or missing API key', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (!meterId) {
        return NextResponse.json({ status: 'error', error: 'Meter ID is required', code: 'MISSING_METER_ID' }, { status: 400 });
    }
    if (apiFunction === 'read') {
        const data = generateRealisticData(meterId, 'LNT');
        const response = {
            status: 'success',
            meter_id: meterId,
            data: {
                electrical_parameters: {
                    power: { active_kw: Math.round(data.activePower * 100) / 100 }
                }
            }
        };
        return NextResponse.json(response);
    }
     return NextResponse.json({ status: 'error', error: 'Invalid function' }, { status: 400 });
}

// UNIFIED GATEWAY API
async function unifiedMeterGateway(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const meterId = searchParams.get('meterId');
    const brand = searchParams.get('brand');
    const userId = searchParams.get('userId');

    // In a real app, you'd validate the auth token
    // const authHeader = req.headers.get('authorization');
    
    if (!meterId || !brand) {
        return NextResponse.json({ success: false, error: 'Meter ID and brand are required' }, { status: 400 });
    }

    const supportedBrands = ['QUBE', 'SECURE', 'LNT'];
    if (!supportedBrands.includes(brand.toUpperCase())) {
        return NextResponse.json({ success: false, error: `Unsupported meter brand: ${brand}` }, { status: 400 });
    }

    const data = generateRealisticData(meterId, brand.toUpperCase());
    const normalizedData = {
        power: { active_kw: Math.round(data.activePower * 100) / 100, },
        electrical: { voltage_v: Math.round(data.voltage * 10) / 10, current_a: Math.round(data.current * 100) / 100, },
        energy: { daily_kwh: Math.round((2.5 + Math.random() * 3) * 100) / 100, },
        status: { connection: 'online', quality: 'excellent', last_reading: new Date().toISOString() }
    };

    const response = {
        success: true,
        timestamp: new Date().toISOString(),
        meter_info: { id: meterId, brand: brand.toUpperCase(), user_id: userId || 'anonymous' },
        data: normalizedData,
        metadata: { api_version: 'unified_v1.0', processing_time_ms: 25, source_api: brand.toLowerCase() }
    };
    return NextResponse.json(response);
}

export { handler as GET, handler as POST };
