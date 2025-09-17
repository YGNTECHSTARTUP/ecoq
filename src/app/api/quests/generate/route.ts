import { NextRequest, NextResponse } from 'next/server';

interface QuestObjective {
  action: string;
  completed: boolean;
  points: number;
  tip?: string;
  energySaving?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'temperature' | 'air_quality' | 'humidity' | 'weather_condition' | 'extreme_weather' | 'combo';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  totalPoints: number;
  progress: number;
  objectives: QuestObjective[];
  validUntil?: string;
  weatherTrigger?: {
    condition: string;
    value: number;
  };
  airQualityTrigger?: {
    aqi: number;
    pm2_5: number;
  };
  personalizedTips?: string[];
  status: 'ACTIVE' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export async function POST(request: NextRequest) {
  try {
    const { userId, location } = await request.json();

    if (!userId || !location) {
      return NextResponse.json(
        { error: 'Missing userId or location' },
        { status: 400 }
      );
    }

    // Fetch current weather conditions to generate appropriate quests
    const weatherData = await fetchWeatherData(location);
    const quests = generateQuestsBasedOnConditions(weatherData, userId);

    return NextResponse.json(quests);

  } catch (error) {
    console.error('Quest generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quests' },
      { status: 500 }
    );
  }
}

async function fetchWeatherData(location: { lat: number; lng: number }) {
  try {
    // Try to fetch from our weather API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/weather?lat=${location.lat}&lon=${location.lng}`,
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Weather fetch failed, using mock data');
  }

  // Return mock weather data
  return {
    main: {
      temp: Math.round(25 + Math.random() * 10),
      humidity: Math.round(60 + Math.random() * 20)
    },
    weather: [
      {
        main: ['Clear', 'Clouds', 'Haze'][Math.floor(Math.random() * 3)]
      }
    ]
  };
}

function generateQuestsBasedOnConditions(weatherData: any, userId: string): Quest[] {
  const quests: Quest[] = [];
  const now = new Date();
  const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours

  const temperature = weatherData.main?.temp || 30;
  const humidity = weatherData.main?.humidity || 70;
  const weatherCondition = weatherData.weather?.[0]?.main || 'Clear';

  // Temperature-based quests
  if (temperature > 30) {
    quests.push({
      id: `quest_heat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Beat the Heat Challenge',
      description: `Temperature is ${temperature}°C! Optimize your cooling strategy to save energy.`,
      type: 'temperature',
      urgency: temperature > 35 ? 'EXTREME' : 'HIGH',
      totalPoints: 150,
      progress: 0,
      objectives: [
        {
          action: 'Set AC to 26°C (optimal energy efficiency)',
          completed: false,
          points: 50,
          tip: 'Every degree higher saves 6-8% energy',
          energySaving: '0.8 kWh/hour'
        },
        {
          action: 'Use ceiling fan to increase comfort',
          completed: false,
          points: 30,
          tip: 'Fans use 90% less energy than AC',
          energySaving: '0.05 kWh/hour'
        },
        {
          action: 'Close curtains/blinds during peak sun hours',
          completed: false,
          points: 70,
          tip: 'Can reduce cooling load by up to 30%',
          energySaving: '1.2 kWh/day'
        }
      ],
      validUntil: validUntil.toISOString(),
      weatherTrigger: {
        condition: `Temperature > 30°C`,
        value: temperature
      },
      personalizedTips: [
        `Your area typically sees ${temperature > 35 ? 'extreme' : 'high'} temperatures during this time`,
        'Optimal AC temperature for energy efficiency is 26-27°C'
      ],
      status: 'ACTIVE'
    });
  }

  // Humidity-based quests
  if (humidity > 70) {
    quests.push({
      id: `quest_humidity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Humidity Balance Master',
      description: `High humidity (${humidity}%) detected. Manage moisture efficiently.`,
      type: 'humidity',
      urgency: humidity > 85 ? 'HIGH' : 'MEDIUM',
      totalPoints: 120,
      progress: 0,
      objectives: [
        {
          action: 'Use dehumidifier in bathroom after showers',
          completed: false,
          points: 40,
          tip: 'Reduces AC load by removing excess moisture',
          energySaving: '0.3 kWh/day'
        },
        {
          action: 'Ensure proper ventilation in kitchen while cooking',
          completed: false,
          points: 35,
          tip: 'Use exhaust fan to remove steam and heat'
        },
        {
          action: 'Check and clean AC filters',
          completed: false,
          points: 45,
          tip: 'Clean filters improve efficiency by 15%',
          energySaving: '0.5 kWh/day'
        }
      ],
      weatherTrigger: {
        condition: `High humidity > 70%`,
        value: humidity
      },
      status: 'ACTIVE'
    });
  }

  // Weather condition-based quests
  if (weatherCondition === 'Clear' || weatherCondition === 'Sunny') {
    quests.push({
      id: `quest_solar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Solar Energy Optimizer',
      description: 'Perfect sunny conditions! Maximize solar energy benefits.',
      type: 'weather_condition',
      urgency: 'MEDIUM',
      totalPoints: 100,
      progress: 0,
      objectives: [
        {
          action: 'Use solar water heater if available',
          completed: false,
          points: 40,
          tip: 'Solar heating can save 60-80% water heating costs',
          energySaving: '2.5 kWh/day'
        },
        {
          action: 'Charge devices using solar power during peak sun',
          completed: false,
          points: 25,
          tip: 'Peak solar hours are 10 AM to 4 PM'
        },
        {
          action: 'Dry clothes outside instead of using dryer',
          completed: false,
          points: 35,
          tip: 'Avoid using electric dryer during sunny weather',
          energySaving: '2.0 kWh/load'
        }
      ],
      weatherTrigger: {
        condition: 'Sunny/Clear conditions',
        value: 1
      },
      personalizedTips: [
        'Take advantage of free solar energy for heating and drying',
        'This is the perfect time to use solar-powered devices'
      ],
      status: 'ACTIVE'
    });
  }

  // Air quality quest (mock AQI)
  const mockAQI = Math.round(2 + Math.random() * 2); // AQI 2-4
  if (mockAQI >= 3) {
    quests.push({
      id: `quest_air_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Indoor Air Quality Guardian',
      description: `Air quality is moderate (AQI: ${mockAQI}). Keep indoor air clean while saving energy.`,
      type: 'air_quality',
      urgency: mockAQI >= 4 ? 'HIGH' : 'MEDIUM',
      totalPoints: 130,
      progress: 0,
      objectives: [
        {
          action: 'Use air purifier on eco mode',
          completed: false,
          points: 45,
          tip: 'Eco mode reduces energy use by 40%',
          energySaving: '0.3 kWh/day'
        },
        {
          action: 'Keep windows closed during high pollution hours',
          completed: false,
          points: 50,
          tip: 'Peak pollution is usually 6-10 AM and 7-10 PM'
        },
        {
          action: 'Use indoor plants for natural air cleaning',
          completed: false,
          points: 35,
          tip: 'Snake plants and pothos are excellent air purifiers'
        }
      ],
      airQualityTrigger: {
        aqi: mockAQI,
        pm2_5: 35 + Math.random() * 20
      },
      personalizedTips: [
        'Indoor air quality is crucial when outdoor air is polluted',
        'Energy-efficient air purification helps maintain good indoor air'
      ],
      status: 'ACTIVE'
    });
  }

  // General energy efficiency quest
  quests.push({
    id: `quest_general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Daily Energy Efficiency Champion',
    description: 'Complete daily energy-saving actions for consistent impact.',
    type: 'combo',
    urgency: 'LOW',
    totalPoints: 80,
    progress: 0,
    objectives: [
      {
        action: 'Switch to LED bulbs in frequently used areas',
        completed: false,
        points: 30,
        tip: 'LEDs use 75% less energy than incandescent bulbs',
        energySaving: '0.2 kWh/day per bulb'
      },
      {
        action: 'Unplug devices when not in use',
        completed: false,
        points: 25,
        tip: 'Phantom loads can account for 5-10% of energy use'
      },
      {
        action: 'Use natural light during daytime',
        completed: false,
        points: 25,
        tip: 'Reduce artificial lighting during daylight hours'
      }
    ],
    personalizedTips: [
      'Small daily actions compound into significant energy savings',
      'Consistency in energy efficiency creates lasting impact'
    ],
    status: 'ACTIVE'
  });

  return quests;
}

// Handle quest actions
export async function PUT(request: NextRequest) {
  try {
    const { questId, action, userId } = await request.json();

    // In a real implementation, you would update the quest status in your database
    // For now, return success response
    return NextResponse.json({ 
      success: true, 
      questId,
      action,
      message: `Quest ${action} successful`
    });

  } catch (error) {
    console.error('Quest action error:', error);
    return NextResponse.json(
      { error: 'Failed to process quest action' },
      { status: 500 }
    );
  }
}