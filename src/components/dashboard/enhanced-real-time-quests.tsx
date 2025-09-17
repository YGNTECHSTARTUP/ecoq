'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  Zap, 
  Award,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Target,
  RefreshCw
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'temperature' | 'air_quality' | 'humidity' | 'weather_condition' | 'extreme_weather' | 'combo';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  totalPoints: number;
  progress: number;
  objectives: Array<{
    action: string;
    completed: boolean;
    points: number;
    tip?: string;
    energySaving?: string;
  }>;
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

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  aqi: number;
  weather: string;
  location: string;
}

interface Props {
  userId: string;
  userLocation: { lat: number; lng: number };
  onQuestNotification?: (quest: Quest) => void;
}

export default function EnhancedRealTimeQuests({ userId, userLocation, onQuestNotification }: Props) {
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('active');
  const [urgentQuest, setUrgentQuest] = useState<Quest | null>(null);

  useEffect(() => {
    initializeSystem();
    
    // Set up periodic updates
    const weatherInterval = setInterval(checkWeatherUpdates, 300000); // 5 minutes
    const questInterval = setInterval(refreshQuests, 1800000); // 30 minutes
    
    return () => {
      clearInterval(weatherInterval);
      clearInterval(questInterval);
    };
  }, [userId, userLocation]);

  const initializeSystem = async () => {
    setLoading(true);
    try {
      // Fetch environmental data and generate initial quests
      const [envData, initialQuests] = await Promise.all([
        fetchEnvironmentalData(),
        generateQuests()
      ]);

      setEnvironmentalData(envData);
      setQuests(initialQuests);
      setLastUpdate(new Date());

      // Check for urgent quests
      const urgentQuests = initialQuests.filter(q => 
        q.urgency === 'EXTREME' || q.urgency === 'HIGH'
      );
      
      if (urgentQuests.length > 0) {
        setUrgentQuest(urgentQuests[0]);
        if (onQuestNotification) {
          onQuestNotification(urgentQuests[0]);
        }
      }

    } catch (error) {
      console.error('Error initializing quest system:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load environmental quests. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironmentalData = async (): Promise<EnvironmentalData> => {
    try {
      // Try to fetch real weather data
      const weatherResponse = await fetch(
        `/api/weather?lat=${userLocation.lat}&lon=${userLocation.lng}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Weather API failed');
      }
      
      const weatherData = await weatherResponse.json();
      
      return {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        aqi: 3, // Mock AQI - would need separate air quality API
        weather: weatherData.weather[0].main,
        location: weatherData.name || 'Current Location'
      };
    } catch (error) {
      console.warn('Using mock environmental data:', error);
      // Return realistic mock data for Hyderabad
      return {
        temperature: Math.round(25 + Math.random() * 10), // 25-35°C
        humidity: Math.round(60 + Math.random() * 20), // 60-80%
        aqi: Math.round(2 + Math.random() * 2), // AQI 2-4
        weather: ['Clear', 'Clouds', 'Haze'][Math.floor(Math.random() * 3)],
        location: 'Hyderabad, IN'
      };
    }
  };

  const generateQuests = async (): Promise<Quest[]> => {
    try {
      const response = await fetch('/api/quests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, location: userLocation })
      });

      if (!response.ok) {
        throw new Error('Quest generation failed');
      }

      return await response.json();
    } catch (error) {
      console.warn('Using mock quest data:', error);
      // Return mock quests based on current environmental conditions
      return generateMockQuests();
    }
  };

  const generateMockQuests = (): Quest[] => {
    const now = new Date();
    const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

    const mockQuests: Quest[] = [
      {
        id: 'quest_temp_' + Date.now(),
        title: 'Beat the Heat Challenge',
        description: 'Temperature rising! Optimize your cooling strategy to save energy.',
        type: 'temperature',
        urgency: 'HIGH',
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
          condition: 'Temperature > 30°C',
          value: environmentalData?.temperature || 32
        },
        personalizedTips: [
          'Your historical data shows you use 15% more energy on hot days',
          'Optimal AC temperature for your area is 26-27°C'
        ],
        status: 'ACTIVE'
      },
      {
        id: 'quest_aqi_' + Date.now(),
        title: 'Indoor Air Quality Guardian',
        description: 'Air quality is moderate. Keep indoor air clean while saving energy.',
        type: 'air_quality',
        urgency: 'MEDIUM',
        totalPoints: 120,
        progress: 0,
        objectives: [
          {
            action: 'Use air purifier on eco mode',
            completed: false,
            points: 40,
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
            points: 30,
            tip: 'Snake plants and pothos are great air purifiers'
          }
        ],
        airQualityTrigger: {
          aqi: environmentalData?.aqi || 3,
          pm2_5: 45.2
        },
        status: 'ACTIVE'
      },
      {
        id: 'quest_humidity_' + Date.now(),
        title: 'Humidity Balance Master',
        description: 'High humidity detected. Manage moisture efficiently.',
        type: 'humidity',
        urgency: 'LOW',
        totalPoints: 90,
        progress: 0,
        objectives: [
          {
            action: 'Use dehumidifier in bathroom after showers',
            completed: false,
            points: 30,
            tip: 'Reduces AC load by removing excess moisture'
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
            points: 25,
            tip: 'Clean filters improve efficiency by 15%',
            energySaving: '0.5 kWh/day'
          }
        ],
        status: 'ACTIVE'
      }
    ];

    return mockQuests;
  };

  const checkWeatherUpdates = async () => {
    if (!environmentalData) return;
    
    try {
      const newEnvData = await fetchEnvironmentalData();
      
      // Check for significant changes
      const tempChange = Math.abs(newEnvData.temperature - environmentalData.temperature);
      const humidityChange = Math.abs(newEnvData.humidity - environmentalData.humidity);
      const weatherChange = newEnvData.weather !== environmentalData.weather;
      const aqiChange = Math.abs(newEnvData.aqi - environmentalData.aqi);
      
      if (tempChange >= 3 || humidityChange >= 15 || weatherChange || aqiChange >= 1) {
        setEnvironmentalData(newEnvData);
        setLastUpdate(new Date());
        
        // Generate new quests based on changed conditions
        const newQuests = await generateQuests();
        setQuests(prev => [...prev, ...newQuests.filter(newQuest => 
          !prev.some(existingQuest => existingQuest.type === newQuest.type)
        )]);
        
        toast({
          title: 'Conditions Changed!',
          description: 'New environmental quests available.',
        });
      }
    } catch (error) {
      console.error('Error checking weather updates:', error);
    }
  };

  const refreshQuests = async () => {
    try {
      const newQuests = await generateQuests();
      setQuests(newQuests);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing quests:', error);
    }
  };

  const handleQuestAction = (questId: string, action: 'accept' | 'complete' | 'skip') => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        switch (action) {
          case 'accept':
            return { ...quest, status: 'ACCEPTED' as const };
          case 'complete':
            return { ...quest, status: 'COMPLETED' as const, progress: 100 };
          case 'skip':
            return quest; // Will be filtered out in UI
          default:
            return quest;
        }
      }
      return quest;
    }));
    
    if (action === 'accept') {
      setUrgentQuest(null);
      toast({
        title: 'Quest Accepted! 🎯',
        description: 'Start completing objectives to earn points.'
      });
    } else if (action === 'complete') {
      const quest = quests.find(q => q.id === questId);
      toast({
        title: 'Quest Completed! 🎉',
        description: `Earned ${quest?.totalPoints} points and helped the environment!`
      });
    }
  };

  const completeObjective = (questId: string, objectiveIndex: number) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        const updatedObjectives = [...quest.objectives];
        updatedObjectives[objectiveIndex] = {
          ...updatedObjectives[objectiveIndex],
          completed: true
        };
        
        const completedCount = updatedObjectives.filter(obj => obj.completed).length;
        const progress = (completedCount / updatedObjectives.length) * 100;
        
        return {
          ...quest,
          objectives: updatedObjectives,
          progress,
          status: progress === 100 ? 'COMPLETED' as const : 'IN_PROGRESS' as const
        };
      }
      return quest;
    }));

    toast({
      title: 'Objective Complete! ✅',
      description: 'Great progress on your environmental quest!'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EXTREME': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'air_quality': return <Wind className="h-5 w-5" />;
      case 'humidity': return <Droplets className="h-5 w-5" />;
      case 'weather_condition': return <Sun className="h-5 w-5" />;
      case 'extreme_weather': return <Zap className="h-5 w-5" />;
      case 'combo': return <Award className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const activeQuests = quests.filter(q => ['ACTIVE', 'ACCEPTED', 'IN_PROGRESS'].includes(q.status));
  const completedQuests = quests.filter(q => q.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing environmental conditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Environmental Conditions Summary */}
      {environmentalData && (
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Conditions
              </span>
              <span className="text-sm opacity-90">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xl font-bold">{environmentalData.temperature}°C</div>
                <div className="text-sm opacity-90">Temperature</div>
              </div>
              <div className="text-center">
                <Droplets className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xl font-bold">{environmentalData.humidity}%</div>
                <div className="text-sm opacity-90">Humidity</div>
              </div>
              <div className="text-center">
                <Wind className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xl font-bold">{environmentalData.aqi}/5</div>
                <div className="text-sm opacity-90">Air Quality</div>
              </div>
              <div className="text-center">
                <Sun className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xl font-bold">{environmentalData.weather}</div>
                <div className="text-sm opacity-90">Condition</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent Quest Alert */}
      {urgentQuest && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-red-800">{urgentQuest.title}</h4>
                <p className="text-red-700">{urgentQuest.description}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleQuestAction(urgentQuest.id, 'accept')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Accept Quest
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setUrgentQuest(null)}
                >
                  Later
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Quests ({activeQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedQuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeQuests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Sun className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Perfect conditions! No urgent energy actions needed.</p>
                <p className="text-sm text-gray-500 mt-2">New quests will appear when conditions change.</p>
              </CardContent>
            </Card>
          ) : (
            activeQuests.map((quest) => (
              <Card key={quest.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${getUrgencyColor(quest.urgency)}`} />
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getQuestIcon(quest.type)}
                      <div>
                        <CardTitle className="text-lg">{quest.title}</CardTitle>
                        <CardDescription>{quest.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getUrgencyColor(quest.urgency)} text-white`}>
                        {quest.urgency}
                      </Badge>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {quest.totalPoints}
                      </div>
                    </div>
                  </div>
                  
                  {quest.validUntil && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Expires: {new Date(quest.validUntil).toLocaleString()}
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(quest.progress)}%</span>
                      </div>
                      <Progress value={quest.progress} className="h-2" />
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                      <h5 className="font-semibold">Objectives:</h5>
                      {quest.objectives.map((objective, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded border ${
                            objective.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`font-medium ${objective.completed ? 'line-through text-gray-500' : ''}`}>
                                {objective.action}
                              </p>
                              {objective.tip && (
                                <p className="text-sm text-blue-600 mt-1">💡 {objective.tip}</p>
                              )}
                              {objective.energySaving && (
                                <p className="text-sm text-green-600 mt-1">⚡ Saves: {objective.energySaving}</p>
                              )}
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-sm font-bold text-green-600">
                                +{objective.points} pts
                              </div>
                              {!objective.completed && quest.status !== 'ACTIVE' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => completeObjective(quest.id, index)}
                                  className="mt-2"
                                >
                                  Complete
                                </Button>
                              )}
                              {objective.completed && (
                                <div className="text-sm text-green-600 mt-2">✅ Done!</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trigger Info */}
                    {quest.weatherTrigger && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>Triggered by:</strong> {quest.weatherTrigger.condition}
                      </div>
                    )}

                    {quest.airQualityTrigger && (
                      <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        <strong>Air Quality:</strong> AQI {quest.airQualityTrigger.aqi}/5, 
                        PM2.5: {quest.airQualityTrigger.pm2_5?.toFixed(1)}μg/m³
                      </div>
                    )}

                    {/* Personalized Tips */}
                    {quest.personalizedTips && quest.personalizedTips.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded">
                        <h6 className="font-semibold text-purple-800 mb-2">Personalized Tips:</h6>
                        {quest.personalizedTips.map((tip, index) => (
                          <p key={index} className="text-sm text-purple-700">{tip}</p>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {quest.status === 'ACTIVE' && (
                        <Button 
                          onClick={() => handleQuestAction(quest.id, 'accept')}
                          className="flex-1"
                        >
                          Accept Quest ({quest.totalPoints} pts)
                        </Button>
                      )}
                      {quest.status === 'COMPLETED' && (
                        <div className="flex-1 text-center py-2 bg-green-100 text-green-800 rounded font-semibold">
                          🎉 Quest Completed! +{quest.totalPoints} points
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedQuests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No completed quests yet.</p>
                <p className="text-sm text-gray-500 mt-2">Start with active quests to see your achievements here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedQuests.map((quest) => (
                <Card key={quest.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <CardTitle className="text-lg">{quest.title}</CardTitle>
                          <CardDescription className="text-green-600">
                            Completed • +{quest.totalPoints} points earned
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}