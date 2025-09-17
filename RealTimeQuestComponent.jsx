// RealTimeQuestComponent.jsx
// React component for displaying weather and air quality based quests

import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertDescription, 
  Card, 
  CardContent, 
  CardHeader, 
  Progress, 
  Badge,
  Button
} from '@/components/ui';
import { 
  Thermometer, 
  Wind, 
  Eye, 
  Droplets, 
  Sun, 
  Cloud, 
  Zap, 
  Award,
  Clock,
  MapPin
} from 'lucide-react';

const RealTimeQuestComponent = ({ userId, userLocation }) => {
  const [quests, setQuests] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuest, setActiveQuest] = useState(null);

  useEffect(() => {
    // Fetch initial quests and start real-time updates
    initializeQuestSystem();
    
    // Set up real-time weather monitoring
    const weatherInterval = setInterval(checkWeatherUpdates, 300000); // 5 minutes
    
    // Set up quest refresh
    const questInterval = setInterval(refreshQuests, 3600000); // 1 hour

    return () => {
      clearInterval(weatherInterval);
      clearInterval(questInterval);
    };
  }, [userId, userLocation]);

  const initializeQuestSystem = async () => {
    try {
      setLoading(true);
      
      // Fetch current weather and air quality
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(userLocation),
        fetchAirQualityData(userLocation)
      ]);
      
      setWeatherData(weather);
      setAirQualityData(airQuality);
      
      // Generate initial quests
      const initialQuests = await generateQuests(userId, userLocation);
      setQuests(initialQuests);
      
      // Check for urgent quests
      checkForUrgentQuests(initialQuests);
      
    } catch (error) {
      console.error('Error initializing quest system:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWeatherUpdates = async () => {
    try {
      const [newWeather, newAirQuality] = await Promise.all([
        fetchWeatherData(userLocation),
        fetchAirQualityData(userLocation)
      ]);

      // Check for significant changes
      const weatherChanged = hasSignificantWeatherChange(weatherData, newWeather);
      const airQualityChanged = hasSignificantAirQualityChange(airQualityData, newAirQuality);

      if (weatherChanged || airQualityChanged) {
        setWeatherData(newWeather);
        setAirQualityData(newAirQuality);
        
        // Generate new quests based on updated conditions
        const newQuests = await generateQuests(userId, userLocation);
        setQuests(prevQuests => [...prevQuests, ...newQuests]);
        
        // Notify user of new urgent quests
        checkForUrgentQuests(newQuests);
      }
    } catch (error) {
      console.error('Error checking weather updates:', error);
    }
  };

  const hasSignificantWeatherChange = (oldWeather, newWeather) => {
    if (!oldWeather || !newWeather) return true;
    
    return (
      Math.abs(oldWeather.temperature - newWeather.temperature) > 3 ||
      oldWeather.weatherCondition !== newWeather.weatherCondition ||
      Math.abs(oldWeather.humidity - newWeather.humidity) > 15
    );
  };

  const hasSignificantAirQualityChange = (oldAir, newAir) => {
    if (!oldAir || !newAir) return true;
    return Math.abs(oldAir.aqi - newAir.aqi) >= 1;
  };

  const checkForUrgentQuests = (questList) => {
    const urgentQuests = questList.filter(q => 
      q.urgency === 'EXTREME' || q.urgency === 'HIGH'
    );
    
    urgentQuests.forEach(quest => {
      showUrgentNotification(quest);
    });
  };

  const showUrgentNotification = (quest) => {
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(quest.title, {
        body: quest.description,
        icon: '/icons/quest-urgent.png',
        badge: '/icons/badge.png'
      });
    }
    
    // Show in-app notification
    setActiveQuest(quest);
  };

  const fetchWeatherData = async (location) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
    );
    return await response.json();
  };

  const fetchAirQualityData = async (location) => {
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lng}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
    );
    return await response.json();
  };

  const generateQuests = async (userId, location) => {
    // Call your Firebase Cloud Function
    const response = await fetch('/api/generateRealTimeQuests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, location })
    });
    return await response.json();
  };

  const refreshQuests = async () => {
    const newQuests = await generateQuests(userId, userLocation);
    setQuests(newQuests);
  };

  const acceptQuest = (questId) => {
    setQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, status: 'ACCEPTED', acceptedAt: new Date() } : q
    ));
    setActiveQuest(null);
  };

  const completeObjective = (questId, objectiveIndex) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const updatedObjectives = [...q.objectives];
        updatedObjectives[objectiveIndex] = { 
          ...updatedObjectives[objectiveIndex], 
          completed: true,
          completedAt: new Date()
        };
        
        const completedCount = updatedObjectives.filter(obj => obj.completed).length;
        const progress = (completedCount / updatedObjectives.length) * 100;
        
        return { 
          ...q, 
          objectives: updatedObjectives, 
          progress,
          status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
        };
      }
      return q;
    }));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'EXTREME': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getQuestIcon = (type) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'air_quality': return <Wind className="h-5 w-5" />;
      case 'humidity': return <Droplets className="h-5 w-5" />;
      case 'weather_condition': return <Sun className="h-5 w-5" />;
      case 'extreme_weather': return <Zap className="h-5 w-5" />;
      case 'combo': return <Award className="h-5 w-5" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">🌍 Analyzing current conditions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Weather & Air Quality Summary */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Conditions
            </h2>
            <div className="text-sm opacity-90">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Thermometer className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{weatherData?.main?.temp?.toFixed(1)}°C</div>
              <div className="text-sm opacity-90">Temperature</div>
            </div>
            <div className="text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{weatherData?.main?.humidity}%</div>
              <div className="text-sm opacity-90">Humidity</div>
            </div>
            <div className="text-center">
              <Wind className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{airQualityData?.list?.[0]?.main?.aqi}/5</div>
              <div className="text-sm opacity-90">Air Quality</div>
            </div>
            <div className="text-center">
              <Sun className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold capitalize">{weatherData?.weather?.[0]?.main}</div>
              <div className="text-sm opacity-90">Condition</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Quest Alert */}
      {activeQuest && (
        <Alert className="border-red-500 bg-red-50">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-red-800">{activeQuest.title}</h3>
                <p className="text-red-700">{activeQuest.description}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => acceptQuest(activeQuest.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Accept Quest
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setActiveQuest(null)}
                >
                  Later
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Active Quests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">🎯 Live Environmental Quests</h2>
        
        {quests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Sun className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Perfect conditions! No urgent energy actions needed right now.</p>
              <p className="text-sm text-gray-500 mt-2">New quests will appear when conditions change.</p>
            </CardContent>
          </Card>
        ) : (
          quests.map((quest) => (
            <Card key={quest.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${getUrgencyColor(quest.urgency).replace('text-white', '').replace('text-black', '')}`} />
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getQuestIcon(quest.type)}
                    <div>
                      <h3 className="text-lg font-bold">{quest.title}</h3>
                      <p className="text-gray-600">{quest.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(quest.urgency)}>
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
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{quest.progress?.toFixed(0) || 0}%</span>
                    </div>
                    <Progress value={quest.progress || 0} className="h-2" />
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Objectives:</h4>
                    {quest.objectives?.map((objective, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border ${objective.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
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
                            {!objective.completed && quest.status === 'ACCEPTED' && (
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

                  {/* Weather Trigger Info */}
                  {quest.weatherTrigger && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Triggered by:</strong> {quest.weatherTrigger.condition}
                    </div>
                  )}

                  {/* Air Quality Trigger Info */}
                  {quest.airQualityTrigger && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      <strong>Air Quality Alert:</strong> AQI {quest.airQualityTrigger.aqi}/5, 
                      PM2.5: {quest.airQualityTrigger.pm2_5?.toFixed(1)}μg/m³
                    </div>
                  )}

                  {/* Personalized Tips */}
                  {quest.personalizedTips && quest.personalizedTips.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-semibold text-purple-800 mb-2">Personalized for You:</h5>
                      {quest.personalizedTips.map((tip, index) => (
                        <p key={index} className="text-sm text-purple-700">{tip}</p>
                      ))}
                    </div>
                  )}

                  {/* Quest Actions */}
                  <div className="flex gap-2 pt-2">
                    {quest.status === 'ACTIVE' && (
                      <Button 
                        onClick={() => acceptQuest(quest.id)}
                        className="flex-1"
                      >
                        Accept Quest ({quest.totalPoints} pts)
                      </Button>
                    )}
                    {quest.status === 'COMPLETED' && (
                      <div className="flex-1 text-center py-2 bg-green-100 text-green-800 rounded font-semibold">
                        🎉 Quest Completed! +{quest.totalPoints} points earned
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">📊 Today's Impact</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {quests.filter(q => q.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Quests Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {quests.reduce((sum, q) => q.status === 'COMPLETED' ? sum + q.totalPoints : sum, 0)}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {quests.filter(q => q.status === 'ACTIVE' || q.status === 'ACCEPTED').length}
              </div>
              <div className="text-sm text-gray-600">Active Quests</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeQuestComponent;