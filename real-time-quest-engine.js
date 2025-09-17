// Real-Time Weather & Air Quality Quest Engine
// Generates dynamic quests based on live environmental data

const axios = require('axios');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// API Keys (store in environment variables)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const AIRQUALITY_API_KEY = process.env.AIRQUALITY_API_KEY;

class RealTimeQuestEngine {
  constructor() {
    this.questTypes = {
      TEMPERATURE: 'temperature',
      AIR_QUALITY: 'air_quality',
      HUMIDITY: 'humidity',
      WEATHER_CONDITION: 'weather_condition',
      EXTREME_WEATHER: 'extreme_weather',
      COMBO: 'combo'
    };

    this.difficultyLevels = {
      EASY: { multiplier: 1.0, points: 50 },
      MEDIUM: { multiplier: 1.5, points: 100 },
      HARD: { multiplier: 2.0, points: 200 },
      EXTREME: { multiplier: 3.0, points: 400 }
    };
  }

  // Main quest generation function
  async generateRealTimeQuests(userId, userLocation) {
    try {
      // Get current environmental data
      const [weatherData, airQualityData] = await Promise.all([
        this.getCurrentWeatherData(userLocation),
        this.getAirQualityData(userLocation)
      ]);

      // Get user preferences and history
      const userProfile = await this.getUserProfile(userId);
      
      // Generate context-aware quests
      const quests = await this.createContextualQuests(
        weatherData, 
        airQualityData, 
        userProfile,
        userLocation
      );

      // Send real-time notifications for urgent quests
      const urgentQuests = quests.filter(q => q.urgency === 'HIGH');
      if (urgentQuests.length > 0) {
        await this.sendUrgentQuestNotifications(userId, urgentQuests);
      }

      return quests;
    } catch (error) {
      console.error('Error generating real-time quests:', error);
      return [];
    }
  }

  // Fetch current weather data
  async getCurrentWeatherData(location) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      const data = response.data;
      return {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        weatherCondition: data.weather[0].main,
        weatherDescription: data.weather[0].description,
        visibility: data.visibility / 1000, // Convert to km
        cloudiness: data.clouds.all,
        timestamp: new Date(),
        location: {
          city: data.name,
          country: data.sys.country
        }
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Fetch air quality data
  async getAirQualityData(location) {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}`
      );

      const data = response.data;
      const components = data.list[0].components;
      
      return {
        aqi: data.list[0].main.aqi, // Air Quality Index (1-5)
        pm2_5: components.pm2_5,
        pm10: components.pm10,
        co: components.co,
        no2: components.no2,
        so2: components.so2,
        o3: components.o3,
        nh3: components.nh3,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      return null;
    }
  }

  // Generate contextual quests based on environmental conditions
  async createContextualQuests(weatherData, airQualityData, userProfile, location) {
    const quests = [];
    const currentHour = new Date().getHours();

    // Temperature-based quests
    if (weatherData.temperature) {
      quests.push(...this.generateTemperatureQuests(weatherData, userProfile, currentHour));
    }

    // Air quality-based quests
    if (airQualityData) {
      quests.push(...this.generateAirQualityQuests(airQualityData, weatherData, userProfile));
    }

    // Weather condition-based quests
    quests.push(...this.generateWeatherConditionQuests(weatherData, userProfile, currentHour));

    // Combo quests (multiple conditions)
    quests.push(...this.generateComboQuests(weatherData, airQualityData, userProfile));

    // Add quest metadata and filter duplicates
    return this.processAndPrioritizeQuests(quests, userProfile);
  }

  // Temperature-based quest generation
  generateTemperatureQuests(weatherData, userProfile, currentHour) {
    const quests = [];
    const { temperature, feelsLike, humidity } = weatherData;

    // Extreme heat quests
    if (temperature > 35 || feelsLike > 38) {
      quests.push({
        type: this.questTypes.TEMPERATURE,
        category: 'extreme_heat',
        title: '🔥 Beat the Extreme Heat!',
        description: `Temperature is ${temperature.toFixed(1)}°C! Optimize your cooling strategy to save energy.`,
        objectives: [
          {
            action: 'Set AC temperature to 26°C or higher',
            target: 26,
            duration: 240, // 4 hours
            points: 200,
            energySaving: '15-20% cooling energy'
          },
          {
            action: 'Use ceiling fans with AC (raise AC temp by 2°C)',
            target: 1,
            points: 150,
            energySaving: '30-40% cooling cost'
          },
          {
            action: 'Close curtains/blinds during peak sun hours',
            target: 1,
            points: 100,
            energySaving: 'Reduce indoor heat by 3-5°C'
          }
        ],
        urgency: temperature > 40 ? 'EXTREME' : 'HIGH',
        difficulty: this.difficultyLevels.HARD,
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        weatherTrigger: {
          condition: `Temperature: ${temperature}°C, Feels like: ${feelsLike}°C`,
          severity: temperature > 40 ? 'EXTREME' : 'HIGH'
        }
      });

      // Additional quest for very extreme conditions
      if (temperature > 42) {
        quests.push({
          type: this.questTypes.EXTREME_WEATHER,
          category: 'heatwave_emergency',
          title: '🚨 Heatwave Emergency Protocol',
          description: `EXTREME HEAT: ${temperature.toFixed(1)}°C! Emergency energy conservation needed.`,
          objectives: [
            {
              action: 'Switch to "Emergency Cool" mode - AC at 28°C with fans',
              target: 28,
              duration: 120,
              points: 400,
              bonus: 'Heatwave Hero Badge'
            },
            {
              action: 'Unplug non-essential appliances',
              target: 3,
              points: 200
            }
          ],
          urgency: 'EXTREME',
          difficulty: this.difficultyLevels.EXTREME,
          specialReward: 'Climate Champion Badge',
          validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        });
      }
    }

    // High temperature quests (30-35°C)
    else if (temperature > 30) {
      quests.push({
        type: this.questTypes.TEMPERATURE,
        category: 'high_heat',
        title: '☀️ Smart Cooling Challenge',
        description: `Hot day ahead: ${temperature.toFixed(1)}°C. Time for smart energy choices!`,
        objectives: [
          {
            action: 'Set AC to 24-25°C instead of lower',
            target: 24,
            duration: 180,
            points: 120,
            tip: 'Each degree higher saves 6-8% energy'
          },
          {
            action: 'Pre-cool rooms before peak hours (11 AM - 4 PM)',
            target: 1,
            points: 100,
            tip: 'Cool early when grid load is lower'
          }
        ],
        urgency: 'MEDIUM',
        difficulty: this.difficultyLevels.MEDIUM
      });
    }

    // Pleasant temperature optimization
    else if (temperature >= 22 && temperature <= 28) {
      quests.push({
        type: this.questTypes.TEMPERATURE,
        category: 'optimal_temp',
        title: '🌤️ Natural Comfort Zone',
        description: `Perfect weather: ${temperature.toFixed(1)}°C! Maximize natural comfort.`,
        objectives: [
          {
            action: 'Turn off AC and use natural ventilation',
            target: 1,
            duration: 300, // 5 hours
            points: 180,
            tip: 'Open windows for cross-ventilation'
          },
          {
            action: 'Use fans instead of AC if needed',
            target: 1,
            points: 100
          }
        ],
        urgency: 'LOW',
        difficulty: this.difficultyLevels.EASY,
        bonus: 'Natural Living Bonus: +50 points'
      });
    }

    // Cold weather quests
    else if (temperature < 18) {
      quests.push({
        type: this.questTypes.TEMPERATURE,
        category: 'cold_weather',
        title: '🧥 Cozy & Efficient',
        description: `Cool day: ${temperature.toFixed(1)}°C. Smart warming strategies!`,
        objectives: [
          {
            action: 'Layer up before using heaters',
            target: 1,
            points: 100,
            tip: 'Warm clothes can feel like +3-4°C'
          },
          {
            action: 'Use room heaters only in occupied rooms',
            target: 1,
            points: 120
          }
        ],
        urgency: 'MEDIUM',
        difficulty: this.difficultyLevels.EASY
      });
    }

    return quests;
  }

  // Air quality-based quest generation
  generateAirQualityQuests(airQualityData, weatherData, userProfile) {
    const quests = [];
    const { aqi, pm2_5, pm10 } = airQualityData;

    // Poor air quality quests
    if (aqi >= 4 || pm2_5 > 55) { // Unhealthy air quality
      quests.push({
        type: this.questTypes.AIR_QUALITY,
        category: 'poor_air_quality',
        title: '😷 Air Quality Alert - Energy Action Needed',
        description: `Poor air quality detected! AQI: ${aqi}/5, PM2.5: ${pm2_5.toFixed(1)}μg/m³`,
        objectives: [
          {
            action: 'Keep windows closed, rely on AC with filters',
            target: 1,
            duration: 360, // 6 hours
            points: 150,
            tip: 'AC filters help clean indoor air'
          },
          {
            action: 'Run air purifiers in bedrooms only (not whole house)',
            target: 1,
            points: 120,
            tip: 'Focus purification where you spend most time'
          },
          {
            action: 'Avoid outdoor drying - use efficient dryer settings',
            target: 1,
            points: 100
          }
        ],
        urgency: aqi === 5 ? 'HIGH' : 'MEDIUM',
        difficulty: this.difficultyLevels.MEDIUM,
        airQualityTrigger: {
          aqi: aqi,
          pm2_5: pm2_5,
          pm10: pm10,
          severity: aqi >= 5 ? 'HAZARDOUS' : 'UNHEALTHY'
        }
      });

      // Extreme air pollution quest
      if (aqi === 5 || pm2_5 > 150) {
        quests.push({
          type: this.questTypes.EXTREME_WEATHER,
          category: 'air_pollution_emergency',
          title: '🚨 Air Pollution Emergency',
          description: `HAZARDOUS air quality! AQI: ${aqi}/5. Protect health while saving energy.`,
          objectives: [
            {
              action: 'Seal house - AC recirculation mode only',
              target: 1,
              duration: 480, // 8 hours
              points: 300,
              health: 'Prevents outdoor pollutants entering'
            },
            {
              action: 'Cancel outdoor activities - avoid additional ventilation load',
              target: 1,
              points: 200
            }
          ],
          urgency: 'EXTREME',
          difficulty: this.difficultyLevels.EXTREME,
          specialReward: 'Air Guardian Badge'
        });
      }
    }

    // Good air quality quests
    else if (aqi <= 2) {
      quests.push({
        type: this.questTypes.AIR_QUALITY,
        category: 'good_air_quality',
        title: '🌬️ Fresh Air Opportunity',
        description: `Great air quality! AQI: ${aqi}/5. Perfect for natural ventilation.`,
        objectives: [
          {
            action: 'Open windows for natural ventilation (turn off AC)',
            target: 1,
            duration: 240,
            points: 200,
            tip: 'Fresh air is free cooling!'
          },
          {
            action: 'Air-dry clothes outside instead of using dryer',
            target: 1,
            points: 150,
            tip: 'Sun and fresh air = zero energy drying'
          }
        ],
        urgency: 'MEDIUM',
        difficulty: this.difficultyLevels.EASY,
        bonus: 'Fresh Air Bonus: Clean energy choices!'
      });
    }

    return quests;
  }

  // Weather condition-based quests
  generateWeatherConditionQuests(weatherData, userProfile, currentHour) {
    const quests = [];
    const { weatherCondition, windSpeed, cloudiness, humidity } = weatherData;

    switch (weatherCondition.toLowerCase()) {
      case 'rain':
      case 'thunderstorm':
        quests.push({
          type: this.questTypes.WEATHER_CONDITION,
          category: 'rainy_day',
          title: '🌧️ Rainy Day Energy Smart',
          description: 'Rain detected! Perfect opportunity for energy conservation.',
          objectives: [
            {
              action: 'Use natural light from windows (delay artificial lighting)',
              target: 1,
              duration: 300,
              points: 120,
              tip: 'Rainy day light is often sufficient'
            },
            {
              action: 'Unplug outdoor equipment to prevent surge damage',
              target: 1,
              points: 100,
              safety: 'Protects appliances from power surges'
            },
            {
              action: 'Skip the dryer - hang clothes indoors near fan',
              target: 1,
              points: 150
            }
          ],
          urgency: weatherCondition.toLowerCase() === 'thunderstorm' ? 'HIGH' : 'MEDIUM',
          difficulty: this.difficultyLevels.EASY
        });
        break;

      case 'clear':
        if (currentHour >= 6 && currentHour <= 18) { // Daytime
          quests.push({
            type: this.questTypes.WEATHER_CONDITION,
            category: 'sunny_day',
            title: '☀️ Solar Power Day',
            description: 'Bright sunny day! Harness natural energy and light.',
            objectives: [
              {
                action: 'Turn off all artificial lights - use natural sunlight',
                target: 1,
                duration: 600, // 10 hours
                points: 200,
                tip: 'Sunlight is 100% free and bright!'
              },
              {
                action: 'Solar dry your clothes instead of machine drying',
                target: 1,
                points: 180,
                tip: 'Sun drying is free and kills bacteria'
              },
              {
                action: 'Heat water using solar exposure (dark containers outside)',
                target: 1,
                points: 150,
                advanced: true
              }
            ],
            urgency: 'MEDIUM',
            difficulty: this.difficultyLevels.EASY,
            bonus: 'Solar Warrior Bonus: Living off the grid!'
          });
        }
        break;

      case 'clouds':
        quests.push({
          type: this.questTypes.WEATHER_CONDITION,
          category: 'cloudy_day',
          title: '☁️ Cloud Cover Advantage',
          description: 'Cloudy skies mean cooler temperatures. Smart energy choices!',
          objectives: [
            {
              action: 'Reduce AC usage - clouds provide natural cooling',
              target: 2, // 2 degrees higher than usual
              duration: 240,
              points: 140,
              tip: 'Clouds can reduce heat by 3-5°C'
            },
            {
              action: 'Open windows for cross-ventilation',
              target: 1,
              points: 100
            }
          ],
          urgency: 'LOW',
          difficulty: this.difficultyLevels.EASY
        });
        break;
    }

    // High humidity quests
    if (humidity > 70) {
      quests.push({
        type: this.questTypes.HUMIDITY,
        category: 'high_humidity',
        title: '💧 Humidity Challenge',
        description: `High humidity: ${humidity}%! Smart dehumidification strategies.`,
        objectives: [
          {
            action: 'Use AC "Dry" mode instead of "Cool" mode',
            target: 1,
            duration: 180,
            points: 150,
            tip: 'Dry mode uses 30% less energy than cooling'
          },
          {
            action: 'Run exhaust fans in bathroom/kitchen after use',
            target: 1,
            points: 80,
            tip: 'Remove humidity at source'
          }
        ],
        urgency: 'MEDIUM',
        difficulty: this.difficultyLevels.MEDIUM
      });
    }

    // Windy day quests
    if (windSpeed > 5) {
      quests.push({
        type: this.questTypes.WEATHER_CONDITION,
        category: 'windy_day',
        title: '💨 Windy Day Cooling',
        description: `Great wind: ${windSpeed.toFixed(1)} m/s! Natural ventilation opportunity.`,
        objectives: [
          {
            action: 'Turn off AC - use cross-ventilation with open windows',
            target: 1,
            duration: 300,
            points: 200,
            tip: 'Wind creates natural air conditioning'
          },
          {
            action: 'Position fans to work with wind direction',
            target: 1,
            points: 120
          }
        ],
        urgency: 'MEDIUM',
        difficulty: this.difficultyLevels.EASY,
        bonus: 'Wind Power Bonus: Nature\'s free cooling!'
      });
    }

    return quests;
  }

  // Generate combo quests (multiple conditions)
  generateComboQuests(weatherData, airQualityData, userProfile) {
    const quests = [];
    const { temperature, humidity, weatherCondition } = weatherData;
    const aqi = airQualityData?.aqi || 3;

    // Hot + Humid + Poor Air Quality = Triple Challenge
    if (temperature > 32 && humidity > 65 && aqi >= 3) {
      quests.push({
        type: this.questTypes.COMBO,
        category: 'triple_challenge',
        title: '🔥💧😷 Triple Environmental Challenge',
        description: `Triple threat: Hot (${temperature.toFixed(1)}°C), Humid (${humidity}%), Poor Air (AQI: ${aqi})`,
        objectives: [
          {
            action: 'AC on "Dry" mode at 26°C with air recirculation',
            target: 26,
            duration: 240,
            points: 300,
            explanation: 'Handles heat, humidity, and air quality efficiently'
          },
          {
            action: 'Seal home and run minimal air purification',
            target: 1,
            points: 200,
            tip: 'One air purifier in main living area only'
          },
          {
            action: 'Avoid heat-generating appliances (oven, dryer)',
            target: 3,
            points: 150
          }
        ],
        urgency: 'EXTREME',
        difficulty: this.difficultyLevels.EXTREME,
        specialReward: 'Environmental Warrior Badge',
        combo: {
          conditions: ['high_temp', 'high_humidity', 'poor_air'],
          rarity: 'RARE',
          bonusPoints: 200
        }
      });
    }

    // Perfect conditions combo
    else if (temperature >= 22 && temperature <= 26 && humidity < 60 && aqi <= 2) {
      quests.push({
        type: this.questTypes.COMBO,
        category: 'perfect_conditions',
        title: '🌟 Perfect Weather Combo',
        description: 'Ideal conditions! Maximize natural comfort and minimize energy use.',
        objectives: [
          {
            action: 'Turn off all climate control - open windows',
            target: 1,
            duration: 480, // 8 hours
            points: 400,
            achievement: 'Zero Climate Control Day'
          },
          {
            action: 'Use only natural light during daytime',
            target: 1,
            points: 200
          },
          {
            action: 'Air-dry all laundry outside',
            target: 1,
            points: 150
          }
        ],
        urgency: 'HIGH', // High urgency to take advantage
        difficulty: this.difficultyLevels.EASY,
        specialReward: 'Nature Harmony Master Badge',
        combo: {
          conditions: ['perfect_temp', 'low_humidity', 'clean_air'],
          rarity: 'LEGENDARY',
          bonusPoints: 500
        }
      });
    }

    return quests;
  }

  // Process and prioritize quests
  processAndPrioritizeQuests(quests, userProfile) {
    // Add metadata to each quest
    const processedQuests = quests.map(quest => ({
      ...quest,
      id: this.generateQuestId(),
      createdAt: new Date(),
      userId: userProfile.id,
      status: 'ACTIVE',
      progress: 0,
      estimatedDuration: quest.objectives.reduce((total, obj) => 
        Math.max(total, obj.duration || 60), 0),
      totalPoints: quest.objectives.reduce((total, obj) => 
        total + (obj.points || 0), 0),
      difficultyScore: this.calculateDifficultyScore(quest),
      personalizedTips: this.generatePersonalizedTips(quest, userProfile)
    }));

    // Remove duplicate quest types
    const uniqueQuests = this.removeDuplicateQuests(processedQuests);

    // Sort by urgency and potential impact
    return uniqueQuests.sort((a, b) => {
      const urgencyOrder = { 'EXTREME': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      
      if (urgencyDiff !== 0) return urgencyDiff;
      
      // If same urgency, sort by total points
      return b.totalPoints - a.totalPoints;
    });
  }

  // Generate personalized tips based on user profile
  generatePersonalizedTips(quest, userProfile) {
    const tips = [];
    
    if (userProfile.hasAC && quest.category.includes('heat')) {
      tips.push('💡 Your AC usage history shows you prefer 22°C. Try 25°C today for extra savings!');
    }
    
    if (userProfile.hasSolarPanels && quest.category === 'sunny_day') {
      tips.push('☀️ Perfect day to maximize your solar generation! Run heavy appliances now.');
    }
    
    if (userProfile.difficulty === 'beginner') {
      tips.push('🔰 New to energy saving? Start with the easiest objective and work your way up!');
    }

    return tips;
  }

  // Send urgent quest notifications
  async sendUrgentQuestNotifications(userId, urgentQuests) {
    for (const quest of urgentQuests) {
      const notification = {
        userId,
        type: 'URGENT_QUEST',
        title: `⚡ ${quest.title}`,
        body: quest.description,
        data: {
          questId: quest.id,
          urgency: quest.urgency,
          points: quest.totalPoints,
          expires: quest.validUntil?.toISOString()
        },
        priority: 'high',
        sound: 'urgent_quest.mp3'
      };

      // Send push notification via Firebase Cloud Messaging
      await this.sendPushNotification(notification);
      
      // Also create in-app notification
      await this.createInAppNotification(notification);
    }
  }

  // Utility functions
  generateQuestId() {
    return `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateDifficultyScore(quest) {
    let score = 0;
    score += quest.objectives.length * 10;
    score += (quest.totalPoints || 0) / 10;
    score += quest.urgency === 'EXTREME' ? 50 : 
             quest.urgency === 'HIGH' ? 30 : 
             quest.urgency === 'MEDIUM' ? 15 : 5;
    return Math.min(score, 100);
  }

  removeDuplicateQuests(quests) {
    const seen = new Set();
    return quests.filter(quest => {
      const key = `${quest.type}_${quest.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async getUserProfile(userId) {
    // Fetch user profile from database
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('id', '==', userId))
      );
      
      if (!userDoc.empty) {
        return userDoc.docs[0].data();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    // Return default profile if not found
    return {
      id: userId,
      hasAC: true,
      hasSolarPanels: false,
      difficulty: 'medium',
      preferences: {
        notifications: true,
        questTypes: ['temperature', 'air_quality', 'weather_condition']
      }
    };
  }

  async sendPushNotification(notification) {
    // Implementation for push notifications
    console.log('Sending push notification:', notification);
  }

  async createInAppNotification(notification) {
    // Store notification in database
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date(),
        read: false
      });
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  }
}

// Usage example
const questEngine = new RealTimeQuestEngine();

// Example: Generate quests for a user
async function generateQuestsExample() {
  const userId = 'user123';
  const userLocation = { lat: 17.6868, lng: 83.2185 }; // Visakhapatnam

  try {
    const quests = await questEngine.generateRealTimeQuests(userId, userLocation);
    console.log(`Generated ${quests.length} quests:`, quests);
    
    return quests;
  } catch (error) {
    console.error('Error in quest generation example:', error);
  }
}

// Export for use in Firebase Cloud Functions
module.exports = {
  RealTimeQuestEngine,
  generateQuestsExample
};

// Firebase Cloud Function implementation
exports.generateRealTimeQuests = functions.https.onCall(async (data, context) => {
  const { userId, location } = data;
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const engine = new RealTimeQuestEngine();
  return await engine.generateRealTimeQuests(userId, location);
});

// Scheduled function to check weather and generate quests every hour
exports.scheduledQuestGeneration = functions.pubsub
  .schedule('0 * * * *') // Every hour
  .onRun(async (context) => {
    const engine = new RealTimeQuestEngine();
    
    // Get all active users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      if (user.location && user.preferences?.notifications) {
        try {
          await engine.generateRealTimeQuests(user.id, user.location);
        } catch (error) {
          console.error(`Error generating quests for user ${user.id}:`, error);
        }
      }
    }
  });