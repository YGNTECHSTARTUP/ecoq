'use client';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// AI Analysis Schemas
const EnergyInsightSchema = z.object({
  category: z.enum(['consumption', 'efficiency', 'cost', 'environmental']),
  title: z.string(),
  insight: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  actionable: z.boolean(),
  recommendations: z.array(z.string()),
  potentialSavings: z.object({
    energy: z.number(), // kWh per month
    cost: z.number(), // INR per month
    carbon: z.number() // kg CO2 per month
  })
});

const PersonalizedRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['behavioral', 'technical', 'seasonal', 'urgent']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  effort: z.enum(['easy', 'moderate', 'significant']),
  impact: z.object({
    energy: z.number(),
    cost: z.number(),
    comfort: z.number() // -10 to 10 scale
  }),
  steps: z.array(z.string()),
  timeframe: z.string(),
  prerequisites: z.array(z.string()).optional()
});

const PredictiveAnalysisSchema = z.object({
  metric: z.enum(['consumption', 'cost', 'peak_demand', 'efficiency']),
  current: z.number(),
  predicted: z.number(),
  confidence: z.number(), // 0-100%
  timeframe: z.string(),
  factors: z.array(z.string()),
  recommendations: z.array(z.string())
});

const EnergyCoachingSessionSchema = z.object({
  sessionId: z.string(),
  topic: z.string(),
  responses: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    tips: z.array(z.string()).optional()
  })),
  summary: z.string(),
  nextSteps: z.array(z.string()),
  followUpDate: z.string()
});

// Types
export type EnergyInsight = z.infer<typeof EnergyInsightSchema>;
export type PersonalizedRecommendation = z.infer<typeof PersonalizedRecommendationSchema>;
export type PredictiveAnalysis = z.infer<typeof PredictiveAnalysisSchema>;
export type EnergyCoachingSession = z.infer<typeof EnergyCoachingSessionSchema>;

export interface UserEnergyProfile {
  userId: string;
  householdSize: number;
  homeType: 'apartment' | 'villa' | 'independent_house';
  homeSize: number; // sq ft
  location: {
    city: string;
    climate: 'hot' | 'moderate' | 'cold';
  };
  energyGoals: {
    savingsTarget: number; // percentage
    budgetLimit: number; // INR per month
    comfortPreference: number; // 1-10 scale
  };
  appliances: Array<{
    type: string;
    age: number; // years
    efficiency: string;
    usage: 'light' | 'moderate' | 'heavy';
  }>;
  consumptionHistory: Array<{
    date: string;
    consumption: number; // kWh
    cost: number; // INR
  }>;
  preferences: {
    notificationFrequency: 'daily' | 'weekly' | 'monthly';
    focusAreas: string[];
    automationPreference: 'minimal' | 'moderate' | 'aggressive';
  };
}

export interface WeatherContext {
  temperature: number;
  humidity: number;
  condition: string;
  forecast: Array<{
    date: string;
    temp: { min: number; max: number };
    condition: string;
  }>;
}

class AIEnergyCoach {
  private userProfiles: Map<string, UserEnergyProfile> = new Map();
  private insights: Map<string, EnergyInsight[]> = new Map();
  private recommendations: Map<string, PersonalizedRecommendation[]> = new Map();
  private coachingSessions: Map<string, EnergyCoachingSession[]> = new Map();

  // AI-Powered Energy Insights
  async generateEnergyInsights(
    userId: string, 
    consumptionData: any[], 
    deviceData: any[],
    weatherContext?: WeatherContext
  ): Promise<EnergyInsight[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      
      const prompt = `
        Analyze the following energy data and provide insights:
        
        User Profile: ${JSON.stringify(userProfile)}
        Consumption Data: ${JSON.stringify(consumptionData.slice(-30))} // Last 30 days
        Device Data: ${JSON.stringify(deviceData)}
        Weather Context: ${JSON.stringify(weatherContext)}
        
        Provide 3-5 key energy insights focusing on:
        1. Unusual consumption patterns
        2. Efficiency opportunities
        3. Cost optimization potential
        4. Environmental impact improvements
        5. Seasonal adjustments needed
        
        For each insight, include actionable recommendations and quantify potential savings.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: z.object({
            insights: z.array(EnergyInsightSchema)
          })
        }
      });

      const insights = result.output?.insights || [];
      this.insights.set(userId, insights);
      return insights;
    } catch (error) {
      console.error('Error generating energy insights:', error);
      return this.getFallbackInsights(userId, consumptionData, deviceData);
    }
  }

  // Personalized Recommendations Engine
  async generatePersonalizedRecommendations(
    userId: string,
    insights: EnergyInsight[],
    currentDeviceStates: any[]
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      
      const prompt = `
        Based on the energy insights and user profile, create personalized energy-saving recommendations:
        
        User Profile: ${JSON.stringify(userProfile)}
        Energy Insights: ${JSON.stringify(insights)}
        Current Device States: ${JSON.stringify(currentDeviceStates)}
        
        Generate 5-8 personalized recommendations that:
        1. Match the user's comfort preferences and budget constraints
        2. Are realistic given their home type and lifestyle
        3. Provide clear step-by-step instructions
        4. Consider the user's stated energy goals
        5. Balance energy savings with comfort impact
        
        Prioritize recommendations by impact vs effort ratio.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: z.object({
            recommendations: z.array(PersonalizedRecommendationSchema)
          })
        }
      });

      const recommendations = result.output?.recommendations || [];
      this.recommendations.set(userId, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(userId);
    }
  }

  // Predictive Analytics
  async generatePredictiveAnalysis(
    userId: string,
    historicalData: any[],
    seasonalFactors: any,
    plannedChanges?: any[]
  ): Promise<PredictiveAnalysis[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      
      const prompt = `
        Perform predictive analysis on energy consumption and costs:
        
        User Profile: ${JSON.stringify(userProfile)}
        Historical Data (last 12 months): ${JSON.stringify(historicalData)}
        Seasonal Factors: ${JSON.stringify(seasonalFactors)}
        Planned Changes: ${JSON.stringify(plannedChanges)}
        
        Predict for the next 3 months:
        1. Monthly energy consumption (kWh)
        2. Monthly energy costs (INR)
        3. Peak demand periods
        4. Overall efficiency trends
        
        Consider:
        - Seasonal weather patterns
        - Historical usage trends
        - Any planned appliance changes or behavioral modifications
        - Local electricity tariff changes
        
        Provide confidence levels and key factors influencing predictions.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: z.object({
            predictions: z.array(PredictiveAnalysisSchema)
          })
        }
      });

      return result.output?.predictions || [];
    } catch (error) {
      console.error('Error generating predictive analysis:', error);
      return this.getFallbackPredictions();
    }
  }

  // Interactive Energy Coaching
  async startCoachingSession(
    userId: string,
    topic: string,
    userQuestions: string[]
  ): Promise<EnergyCoachingSession> {
    try {
      const userProfile = this.userProfiles.get(userId);
      const userInsights = this.insights.get(userId) || [];
      
      const prompt = `
        Conduct an interactive energy coaching session:
        
        Topic: ${topic}
        User Profile: ${JSON.stringify(userProfile)}
        Recent Insights: ${JSON.stringify(userInsights.slice(-3))}
        User Questions: ${JSON.stringify(userQuestions)}
        
        Provide expert energy coaching by:
        1. Answering each user question with detailed, practical advice
        2. Relating answers to their specific situation and goals
        3. Providing actionable tips for each topic discussed
        4. Summarizing key takeaways
        5. Recommending specific next steps
        6. Suggesting when to follow up
        
        Be encouraging, practical, and focus on achievable wins.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: EnergyCoachingSessionSchema
        }
      });

      const session = result.output || this.getFallbackCoachingSession(userId, topic);
      
      // Store session
      const userSessions = this.coachingSessions.get(userId) || [];
      userSessions.push(session);
      this.coachingSessions.set(userId, userSessions);
      
      return session;
    } catch (error) {
      console.error('Error conducting coaching session:', error);
      return this.getFallbackCoachingSession(userId, topic);
    }
  }

  // Smart Notifications and Alerts
  async generateSmartNotifications(
    userId: string,
    currentContext: {
      weather: WeatherContext;
      deviceStates: any[];
      currentUsage: number;
      timeOfDay: number;
      dayOfWeek: number;
    }
  ): Promise<Array<{
    id: string;
    type: 'tip' | 'alert' | 'reminder' | 'achievement';
    priority: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    actionable: boolean;
    actions?: string[];
    expiresAt?: string;
  }>> {
    try {
      const userProfile = this.userProfiles.get(userId);
      
      const prompt = `
        Generate smart energy notifications based on current context:
        
        User Profile: ${JSON.stringify(userProfile)}
        Current Context: ${JSON.stringify(currentContext)}
        
        Generate 2-3 relevant notifications considering:
        1. Current weather conditions (suggest AC/heating adjustments)
        2. Time of day and energy rates (peak hour warnings)
        3. Unusual device behavior or usage patterns
        4. Opportunities for immediate energy savings
        5. Positive reinforcement for good energy habits
        
        Notifications should be timely, actionable, and personalized.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: z.object({
            notifications: z.array(z.object({
              id: z.string(),
              type: z.enum(['tip', 'alert', 'reminder', 'achievement']),
              priority: z.enum(['low', 'medium', 'high']),
              title: z.string(),
              message: z.string(),
              actionable: z.boolean(),
              actions: z.array(z.string()).optional(),
              expiresAt: z.string().optional()
            }))
          })
        }
      });

      return result.output?.notifications || [];
    } catch (error) {
      console.error('Error generating notifications:', error);
      return [];
    }
  }

  // Comparative Analysis
  async generateComparativeAnalysis(
    userId: string,
    userConsumption: number,
    userCost: number
  ): Promise<{
    comparisons: Array<{
      category: string;
      userValue: number;
      benchmarkValue: number;
      percentile: number;
      insight: string;
    }>;
    overallRanking: number; // 1-100 percentile
    improvementAreas: string[];
    strengths: string[];
  }> {
    try {
      const userProfile = this.userProfiles.get(userId);
      
      // Simulate benchmark data (in real implementation, this would come from a database)
      const benchmarks = this.generateBenchmarkData(userProfile);
      
      const prompt = `
        Compare user's energy performance against similar households:
        
        User Profile: ${JSON.stringify(userProfile)}
        User Consumption: ${userConsumption} kWh/month
        User Cost: ₹${userCost}/month
        Benchmark Data: ${JSON.stringify(benchmarks)}
        
        Provide comparative analysis including:
        1. How they compare to similar homes (same size, type, location)
        2. Percentile ranking for consumption and cost efficiency
        3. Specific areas where they excel or need improvement
        4. Context for differences (weather, lifestyle, appliances)
        5. Actionable insights for improvement
        
        Be encouraging while highlighting opportunities.
      `;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt,
        output: {
          schema: z.object({
            comparisons: z.array(z.object({
              category: z.string(),
              userValue: z.number(),
              benchmarkValue: z.number(),
              percentile: z.number(),
              insight: z.string()
            })),
            overallRanking: z.number(),
            improvementAreas: z.array(z.string()),
            strengths: z.array(z.string())
          })
        }
      });

      return result.output || this.getFallbackComparison();
    } catch (error) {
      console.error('Error generating comparative analysis:', error);
      return this.getFallbackComparison();
    }
  }

  // User Profile Management
  setUserProfile(userId: string, profile: UserEnergyProfile): void {
    this.userProfiles.set(userId, profile);
  }

  getUserProfile(userId: string): UserEnergyProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // Getters
  getInsights(userId: string): EnergyInsight[] {
    return this.insights.get(userId) || [];
  }

  getRecommendations(userId: string): PersonalizedRecommendation[] {
    return this.recommendations.get(userId) || [];
  }

  getCoachingSessions(userId: string): EnergyCoachingSession[] {
    return this.coachingSessions.get(userId) || [];
  }

  // Fallback methods (for when AI is not available)
  private getFallbackInsights(userId: string, consumptionData: any[], deviceData: any[]): EnergyInsight[] {
    const totalConsumption = consumptionData.reduce((sum, d) => sum + d.consumption, 0);
    const avgConsumption = totalConsumption / Math.max(consumptionData.length, 1);
    
    return [
      {
        category: 'consumption',
        title: 'Consumption Pattern Analysis',
        insight: `Your average daily consumption is ${avgConsumption.toFixed(1)} kWh. Consider optimizing high-usage periods.`,
        severity: avgConsumption > 30 ? 'high' : 'medium',
        actionable: true,
        recommendations: [
          'Monitor peak usage hours',
          'Consider time-based energy saving actions',
          'Review appliance efficiency'
        ],
        potentialSavings: {
          energy: Math.max(0, avgConsumption * 0.15),
          cost: Math.max(0, avgConsumption * 0.15 * 6.5),
          carbon: Math.max(0, avgConsumption * 0.15 * 0.82)
        }
      },
      {
        category: 'efficiency',
        title: 'Device Efficiency Review',
        insight: 'Several devices are running without energy-saving mode enabled.',
        severity: 'medium',
        actionable: true,
        recommendations: [
          'Enable energy-saving modes on all compatible devices',
          'Adjust thermostat settings for optimal efficiency',
          'Consider upgrading old appliances'
        ],
        potentialSavings: {
          energy: 50,
          cost: 325,
          carbon: 41
        }
      }
    ];
  }

  private getFallbackRecommendations(userId: string): PersonalizedRecommendation[] {
    return [
      {
        id: 'rec_1',
        title: 'Optimize AC Temperature Settings',
        description: 'Set your AC to 26°C for optimal energy efficiency without sacrificing comfort.',
        category: 'behavioral',
        priority: 'high',
        effort: 'easy',
        impact: {
          energy: 30,
          cost: 195,
          comfort: -1
        },
        steps: [
          'Locate your AC remote or thermostat',
          'Set temperature to 26°C',
          'Ensure all windows and doors are closed',
          'Monitor comfort level for 24 hours'
        ],
        timeframe: 'Immediate',
        prerequisites: []
      },
      {
        id: 'rec_2',
        title: 'Create Energy-Saving Schedule',
        description: 'Set up automatic schedules for your high-power devices to reduce consumption during peak hours.',
        category: 'technical',
        priority: 'medium',
        effort: 'moderate',
        impact: {
          energy: 45,
          cost: 292,
          comfort: 0
        },
        steps: [
          'Identify peak usage hours (typically 6-10 PM)',
          'Create schedules for AC, water heater, and washing machine',
          'Set devices to turn off automatically during peak tariff periods',
          'Monitor and adjust based on comfort and usage patterns'
        ],
        timeframe: 'This week',
        prerequisites: ['Smart home devices or programmable timers']
      }
    ];
  }

  private getFallbackPredictions(): PredictiveAnalysis[] {
    return [
      {
        metric: 'consumption',
        current: 450,
        predicted: 420,
        confidence: 75,
        timeframe: 'Next month',
        factors: ['Seasonal temperature decrease', 'Recent efficiency improvements'],
        recommendations: ['Continue current optimization efforts', 'Monitor for peak demand spikes']
      }
    ];
  }

  private getFallbackCoachingSession(userId: string, topic: string): EnergyCoachingSession {
    return {
      sessionId: `session_${Date.now()}`,
      topic,
      responses: [
        {
          question: 'How can I reduce my energy consumption?',
          answer: 'Focus on your highest consumption devices first - typically AC, water heater, and lighting. Small adjustments to these can yield significant savings.',
          tips: [
            'Set AC to 26°C',
            'Use LED bulbs everywhere',
            'Schedule water heater operation',
            'Unplug devices when not in use'
          ]
        }
      ],
      summary: 'Focus on optimizing your major appliances for immediate impact on energy consumption.',
      nextSteps: [
        'Implement AC temperature optimization',
        'Audit and upgrade lighting to LED',
        'Set up device scheduling',
        'Monitor progress for one week'
      ],
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private generateBenchmarkData(userProfile?: UserEnergyProfile) {
    // Simulate benchmark data based on user profile
    const baseConsumption = userProfile ? 
      (userProfile.homeSize / 100) * (userProfile.householdSize * 120) : 400;
    
    return {
      averageConsumption: baseConsumption,
      averageCost: baseConsumption * 6.5,
      efficiencyScore: 75,
      sampleSize: 1250
    };
  }

  private getFallbackComparison() {
    return {
      comparisons: [
        {
          category: 'Monthly Consumption',
          userValue: 450,
          benchmarkValue: 520,
          percentile: 68,
          insight: 'You consume 13% less energy than similar households'
        },
        {
          category: 'Monthly Cost',
          userValue: 2925,
          benchmarkValue: 3380,
          percentile: 65,
          insight: 'Your energy costs are 13% below average for similar homes'
        }
      ],
      overallRanking: 66,
      improvementAreas: ['Peak hour optimization', 'Appliance scheduling'],
      strengths: ['Efficient lighting', 'Good AC management']
    };
  }
}

// Export singleton instance
export const aiEnergyCoach = new AIEnergyCoach();
export default AIEnergyCoach;