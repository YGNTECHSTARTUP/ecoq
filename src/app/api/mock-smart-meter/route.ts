import { NextRequest, NextResponse } from 'next/server';
import { getDemoGameInstance } from '@/lib/demo-smart-meter-game';

/**
 * Mock Smart Meter API Endpoints for Development & Testing
 * Simulates real smart meter provider APIs with realistic data
 * Integrates with demo gaming system for interactive validation
 */

interface MockSmartMeterData {
  consumerId: string;
  provider: string;
  currentReading: number;
  previousReading: number;
  unitsConsumed: number;
  instantPower: number;
  voltage: { r: number; y: number; b: number };
  current: { r: number; y: number; b: number };
  frequency: number;
  powerFactor: number;
  tariffRate: number;
  billAmount: number;
  billStatus: 'paid' | 'unpaid' | 'overdue';
  lastUpdated: string;
}

// Mock data storage (in production, this would be a database)
const mockMeterData = new Map<string, MockSmartMeterData>();

// Initialize some sample data
const initializeMockData = () => {
  const sampleMeters = [
    {
      consumerId: 'TP123456789',
      provider: 'tata_power',
      baseReading: 52000,
      dailyConsumption: 35,
      tariffRate: 6.8
    },
    {
      consumerId: 'AD987654321', 
      provider: 'adani',
      baseReading: 48000,
      dailyConsumption: 42,
      tariffRate: 6.2
    },
    {
      consumerId: 'BS555444333',
      provider: 'bses',
      baseReading: 45000,
      dailyConsumption: 28,
      tariffRate: 7.1
    },
    {
      consumerId: 'HP777888999',
      provider: 'hpl',
      baseReading: 41000,
      dailyConsumption: 38,
      tariffRate: 5.9
    },
    {
      consumerId: 'DEMO123456',
      provider: 'genus',
      baseReading: 50000,
      dailyConsumption: 32,
      tariffRate: 6.5
    }
  ];

  sampleMeters.forEach(meter => {
    const currentReading = meter.baseReading + Math.floor(Math.random() * 1000);
    const unitsConsumed = Math.floor(Math.random() * 20) + meter.dailyConsumption - 10;
    
    mockMeterData.set(meter.consumerId, {
      consumerId: meter.consumerId,
      provider: meter.provider,
      currentReading,
      previousReading: currentReading - unitsConsumed,
      unitsConsumed,
      instantPower: Math.random() * 4000 + 1000, // 1-5 kW
      voltage: {
        r: 230 + Math.random() * 20 - 10,
        y: 235 + Math.random() * 20 - 10,
        b: 228 + Math.random() * 20 - 10
      },
      current: {
        r: Math.random() * 15 + 10,
        y: Math.random() * 15 + 12,
        b: Math.random() * 15 + 8
      },
      frequency: 50 + Math.random() * 1 - 0.5,
      powerFactor: 0.8 + Math.random() * 0.15,
      tariffRate: meter.tariffRate,
      billAmount: Math.floor(unitsConsumed * meter.tariffRate) + 150,
      billStatus: ['paid', 'unpaid', 'overdue'][Math.floor(Math.random() * 3)] as any,
      lastUpdated: new Date().toISOString()
    });
  });
};

// Initialize data on startup
initializeMockData();

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (request.method === 'GET') {
      const consumerId = searchParams.get('consumerId');
      const provider = searchParams.get('provider');

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Simulate occasional API failures (10% chance)
      if (Math.random() < 0.1) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable', code: 503 },
          { status: 503 }
        );
      }
      
      switch (endpoint) {
        case 'current':
          return handleCurrentReading(consumerId, provider);
        case 'realtime':
          return handleRealTimeData(consumerId, provider);
        case 'history':
          return handleHistoricalData(consumerId, provider, searchParams);
        case 'billing':
          return handleBillingInfo(consumerId, provider);
        case 'list-meters':
          return handleListMeters();
        case 'game-state':
          return handleGameState(consumerId);
        default:
          return NextResponse.json(
            { error: 'Invalid GET endpoint', availableEndpoints: ['current', 'realtime', 'history', 'billing', 'list-meters', 'game-state'] },
            { status: 400 }
          );
      }
  }

  if (request.method === 'POST') {
    switch (endpoint) {
      case 'auth':
        return handleAuth(request);
      case 'register-meter':
        return handleRegisterMeter(request);
      case 'game-action':
        return handleGameAction(request);
      default:
        return NextResponse.json(
          { error: 'Invalid POST endpoint' },
          { status: 400 }
        );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}


async function handleAuth(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { provider, username, password, apiKey, clientId, clientSecret } = body;

    // Simulate authentication based on provider
    let authResult;
    
    switch (provider) {
      case 'tata_power':
        if (username && password) {
          authResult = { 
            token: 'mock_jwt_token_tata_' + Date.now(), 
            expiresIn: 3600,
            provider: 'tata_power'
          };
        }
        break;
        
      case 'adani':
        if (clientId && clientSecret) {
          authResult = {
            access_token: 'mock_oauth_token_adani_' + Date.now(),
            token_type: 'Bearer',
            expires_in: 7200,
            provider: 'adani'
          };
        }
        break;
        
      case 'bses':
        if (apiKey) {
          authResult = {
            apiKey,
            status: 'valid',
            provider: 'bses'
          };
        }
        break;
        
      default:
        // Generic authentication
        authResult = {
          token: 'mock_token_' + provider + '_' + Date.now(),
          expiresIn: 3600,
          provider
        };
    }

    if (authResult) {
      return NextResponse.json({
        success: true,
        ...authResult,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 401 },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed', code: 500 },
      { status: 500 }
    );
  }
}

function handleCurrentReading(consumerId: string | null, provider: string | null) {
  if (!consumerId) {
    return NextResponse.json(
      { error: 'Consumer ID required', code: 400 },
      { status: 400 }
    );
  }

  // For demo consumer, use gaming system data
  if (consumerId.startsWith('DEMO')) {
    const gameInstance = getDemoGameInstance();
    const gameReading = gameInstance.getSmartMeterReading();
    const gameState = gameInstance.getState();
    
    return NextResponse.json({
      ...gameReading,
      // Game-specific data
      gameData: {
        score: gameState.gameScore,
        activeQuests: gameState.activeQuests.length,
        completedQuests: gameState.completedQuests.length,
        appliances: Array.from(gameState.appliances.values()).map(appliance => ({
          id: appliance.id,
          name: appliance.name,
          isOn: appliance.isOn,
          powerUsage: appliance.powerRating
        }))
      }
    });
  }

  let meterData = mockMeterData.get(consumerId);
  
  if (!meterData) {
    // Generate data for unknown consumer ID
    meterData = generateMockMeterData(consumerId, provider || 'genus');
    mockMeterData.set(consumerId, meterData);
  }

  // Update with slight variations for realism
  meterData.instantPower = Math.max(500, meterData.instantPower + (Math.random() - 0.5) * 200);
  meterData.voltage.r += (Math.random() - 0.5) * 2;
  meterData.voltage.y += (Math.random() - 0.5) * 2;
  meterData.voltage.b += (Math.random() - 0.5) * 2;
  meterData.lastUpdated = new Date().toISOString();

  return NextResponse.json({
    consumerId,
    timestamp: new Date().toISOString(),
    currentReading: meterData.currentReading,
    previousReading: meterData.previousReading,
    unitsConsumed: meterData.unitsConsumed,
    tariffRate: meterData.tariffRate,
    billAmount: meterData.billAmount,
    powerFactor: meterData.powerFactor,
    maxDemand: Math.max(3, meterData.instantPower / 1000),
    voltage: meterData.voltage,
    current: meterData.current,
    frequency: meterData.frequency,
    energyImported: meterData.currentReading,
    energyExported: Math.random() > 0.9 ? Math.random() * 50 : 0,
    reactivePower: Math.random() * 100 + 50
  });
}

function handleRealTimeData(consumerId: string | null, provider: string | null) {
  if (!consumerId) {
    return NextResponse.json(
      { error: 'Consumer ID required', code: 400 },
      { status: 400 }
    );
  }

  // For demo consumer, use gaming system data
  if (consumerId.startsWith('DEMO')) {
    const gameInstance = getDemoGameInstance();
    const realtimeData = gameInstance.getRealTimeData();
    const gameState = gameInstance.getState();
    
    return NextResponse.json({
      ...realtimeData,
      gameData: {
        activeAppliances: Array.from(gameState.appliances.values())
          .filter(appliance => appliance.isOn)
          .map(appliance => ({ name: appliance.name, powerUsage: appliance.powerRating })),
        totalScore: gameState.gameScore,
        questProgress: gameState.activeQuests.map(questId => {
          const quest = gameInstance.questValidations.get(questId);
          return {
            id: questId,
            title: quest ? `Quest: ${quest.type}` : 'Unknown Quest',
            progress: quest ? quest.currentProgress : 0,
            target: quest ? quest.target : 100
          };
        })
      }
    });
  }

  let meterData = mockMeterData.get(consumerId);
  
  if (!meterData) {
    meterData = generateMockMeterData(consumerId, provider || 'genus');
    mockMeterData.set(consumerId, meterData);
  }

  // Simulate real-time fluctuations
  const timeOfDay = new Date().getHours();
  let baseLoad = 2000; // Base load in watts
  
  // Simulate daily load pattern
  if (timeOfDay >= 6 && timeOfDay <= 9) baseLoad *= 1.5; // Morning peak
  if (timeOfDay >= 18 && timeOfDay <= 22) baseLoad *= 1.8; // Evening peak
  if (timeOfDay >= 23 || timeOfDay <= 5) baseLoad *= 0.6; // Night low

  const instantPower = baseLoad + (Math.random() - 0.5) * 500;
  const voltage = 230 + (Math.random() - 0.5) * 10;
  const current = instantPower / voltage;

  return NextResponse.json({
    instantPower: Math.round(instantPower),
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(current * 10) / 10,
    frequency: Math.round((50 + (Math.random() - 0.5) * 0.5) * 10) / 10,
    powerFactor: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
    timestamp: new Date().toISOString(),
    phaseData: {
      r: { voltage: voltage + Math.random() * 5, current: current * 0.35 },
      y: { voltage: voltage + Math.random() * 5, current: current * 0.33 },
      b: { voltage: voltage + Math.random() * 5, current: current * 0.32 }
    }
  });
}

function handleHistoricalData(consumerId: string | null, provider: string | null, searchParams: URLSearchParams) {
  if (!consumerId) {
    return NextResponse.json(
      { error: 'Consumer ID required', code: 400 },
      { status: 400 }
    );
  }

  const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0];

  const readings = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let runningTotal = 45000 + Math.random() * 10000;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    // Simulate weekend vs weekday patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseConsumption = isWeekend ? 45 : 35;
    const dailyConsumption = Math.floor(Math.random() * 20) + baseConsumption - 10;
    
    runningTotal += dailyConsumption;

    readings.push({
      timestamp: new Date(date).toISOString(),
      currentReading: Math.floor(runningTotal),
      previousReading: Math.floor(runningTotal - dailyConsumption),
      unitsConsumed: dailyConsumption,
      tariffRate: 6.5,
      billAmount: Math.floor(dailyConsumption * 6.5),
      powerFactor: 0.85 + Math.random() * 0.1,
      energyImported: Math.floor(runningTotal),
      energyExported: Math.random() > 0.9 ? Math.random() * 10 : 0
    });
  }

  return NextResponse.json({
    consumerId,
    startDate,
    endDate,
    totalReadings: readings.length,
    readings
  });
}

function handleBillingInfo(consumerId: string | null, provider: string | null) {
  if (!consumerId) {
    return NextResponse.json(
      { error: 'Consumer ID required', code: 400 },
      { status: 400 }
    );
  }

  const now = new Date();
  const billDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 25);
  const unitsConsumed = Math.floor(Math.random() * 200) + 300;
  const energyCharges = unitsConsumed * 6.5;
  const fixedCharges = 150;
  const taxes = Math.floor(energyCharges * 0.12); // 12% tax
  const totalAmount = energyCharges + fixedCharges + taxes;

  return NextResponse.json({
    billNumber: `BILL${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000)}`,
    billDate: billDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    billingPeriod: {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
      to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    },
    unitsConsumed,
    amount: totalAmount,
    status: ['paid', 'unpaid', 'overdue'][Math.floor(Math.random() * 3)],
    breakdown: {
      energyCharges,
      fixedCharges,
      taxes,
      total: totalAmount
    },
    tariffDetails: {
      rate: 6.5,
      fixedCharge: fixedCharges,
      taxRate: 12
    },
    paymentHistory: [
      {
        date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString().split('T')[0],
        amount: totalAmount - 50,
        status: 'paid'
      }
    ]
  });
}

function handleListMeters() {
  const meters = Array.from(mockMeterData.entries()).map(([id, data]) => ({
    consumerId: id,
    provider: data.provider,
    status: 'active',
    lastReading: data.currentReading,
    lastUpdated: data.lastUpdated
  }));

  return NextResponse.json({
    totalMeters: meters.length,
    meters
  });
}

async function handleRegisterMeter(request: NextRequest) {
  try {
    const { consumerId, provider } = await request.json();
    
    if (!consumerId || !provider) {
      return NextResponse.json(
        { error: 'Consumer ID and provider required', code: 400 },
        { status: 400 }
      );
    }

    const meterData = generateMockMeterData(consumerId, provider);
    mockMeterData.set(consumerId, meterData);

    return NextResponse.json({
      success: true,
      message: 'Meter registered successfully',
      consumerId,
      provider,
      initialReading: meterData.currentReading
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed', code: 500 },
      { status: 500 }
    );
  }
}

function generateMockMeterData(consumerId: string, provider: string): MockSmartMeterData {
  const baseReading = 40000 + Math.random() * 20000;
  const dailyConsumption = Math.floor(Math.random() * 30) + 25;
  
  return {
    consumerId,
    provider,
    currentReading: Math.floor(baseReading),
    previousReading: Math.floor(baseReading - dailyConsumption),
    unitsConsumed: dailyConsumption,
    instantPower: Math.random() * 3000 + 1000,
    voltage: {
      r: 230 + Math.random() * 15 - 7.5,
      y: 235 + Math.random() * 15 - 7.5,
      b: 228 + Math.random() * 15 - 7.5
    },
    current: {
      r: Math.random() * 12 + 8,
      y: Math.random() * 12 + 10,
      b: Math.random() * 12 + 7
    },
    frequency: 50 + Math.random() * 0.5 - 0.25,
    powerFactor: 0.8 + Math.random() * 0.15,
    tariffRate: 6.5 + Math.random() * 1.5 - 0.75,
    billAmount: Math.floor(dailyConsumption * 6.5) + 150,
    billStatus: ['paid', 'unpaid'][Math.floor(Math.random() * 2)] as any,
    lastUpdated: new Date().toISOString()
  };
}

function handleGameState(consumerId: string | null) {
  if (!consumerId || !consumerId.startsWith('DEMO')) {
    return NextResponse.json(
      { error: 'Game state only available for demo consumers' },
      { status: 400 }
    );
  }

  const gameInstance = getDemoGameInstance();
  const gameState = gameInstance.getState();
  const activeQuests = gameState.activeQuests.map(questId => {
    const quest = gameInstance.questValidations.get(questId);
    return {
      id: questId,
      title: `Quest: ${quest?.type || 'Unknown'}`,
      description: `Target: ${quest?.target || 'N/A'}. Actions: ${quest?.requiredActions.join(', ')}`,
      type: quest?.type || 'unknown',
      target: quest?.target || 100,
      progress: quest?.currentProgress || 0,
      reward: 100,
      isCompleted: false
    };
  });
  
  const completedQuests = gameState.completedQuests.map(questId => ({
    id: questId,
    title: `Completed: ${questId}`,
    reward: 100,
    completedAt: new Date().toISOString()
  }));

  return NextResponse.json({
    success: true,
    consumerId,
    timestamp: new Date().toISOString(),
    gameState: {
      score: gameState.gameScore,
      totalEnergyConsumed: gameState.monthlyConsumption,
      currentPowerConsumption: gameState.instantPower / 1000,
      appliances: Object.fromEntries(
        Array.from(gameState.appliances.values()).map(appliance => [
          appliance.id,
          {
            id: appliance.id,
            name: appliance.name,
            isOn: appliance.isOn,
            powerUsage: appliance.powerRating,
            category: appliance.category,
            efficiencyLevel: appliance.efficiency === 'high' ? 3 : appliance.efficiency === 'medium' ? 2 : 1
          }
        ])
      ),
      quests: {
        active: activeQuests,
        completed: completedQuests
      }
    }
  });
}

async function handleGameAction(request: NextRequest) {
  try {
    const body = await request.json();
    const { consumerId, action, targetId } = body;

    if (!consumerId || !consumerId.startsWith('DEMO')) {
      return NextResponse.json(
        { error: 'Game actions only available for demo consumers' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action required' },
        { status: 400 }
      );
    }

    const gameInstance = getDemoGameInstance();
    let result: { success: boolean; message: string; questsTriggered: string[]; pointsEarned: number; };

    switch (action) {
      case 'toggle-appliance':
        if (!targetId) {
          return NextResponse.json({ error: 'Target appliance ID required' }, { status: 400 });
        }
        gameInstance['toggleAppliance'](targetId);
        result = { success: true, message: `${targetId} toggled`, questsTriggered: [], pointsEarned: 5 };
        break;

      case 'upgrade-appliance':
         if (!targetId) {
          return NextResponse.json({ error: 'Target appliance ID required' }, { status: 400 });
        }
        // This is a simplified stand-in for a proper upgrade action.
        result = gameInstance.performAction('led_upgrade'); // Example action
        break;

      case 'execute-quick-action':
         if (!targetId) {
          return NextResponse.json({ error: 'Quick action type required' }, { status: 400 });
        }
        // This is a simplified stand-in.
        result = gameInstance.performAction(targetId === 'energy_saving_mode' ? 'optimize_ac' : 'turn_on_ac');
        break;

      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    const gameState = gameInstance.getState();
    
    return NextResponse.json({
      success: true,
      action,
      targetId,
      result,
      timestamp: new Date().toISOString(),
      updatedState: {
        score: gameState.gameScore,
        currentPowerConsumption: gameState.instantPower / 1000,
        activeQuestsCount: gameState.activeQuests.length,
        completedQuestsCount: gameState.completedQuests.length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Game action failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
