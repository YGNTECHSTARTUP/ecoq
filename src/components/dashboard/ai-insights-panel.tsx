'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Leaf,
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  Award,
  ThermometerSun,
  Gauge
} from 'lucide-react';
import { 
  aiEnergyCoach, 
  type EnergyInsight, 
  type PersonalizedRecommendation, 
  type PredictiveAnalysis,
  type EnergyCoachingSession,
  type UserEnergyProfile,
  type WeatherContext
} from '@/lib/ai-energy-coach';
import { smartHomeController } from '@/lib/smart-home-controller';
import { toast } from 'sonner';

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const effortColors = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  significant: 'bg-red-100 text-red-800'
};

interface AIInsightsPanelProps {
  userId: string;
  className?: string;
}

export function AIInsightsPanel({ userId, className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<EnergyInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [predictions, setPredictions] = useState<PredictiveAnalysis[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<EnergyCoachingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  
  // Coaching interface state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTopic, setChatTopic] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock weather context
  const weatherContext: WeatherContext = {
    temperature: 32,
    humidity: 68,
    condition: 'Hot',
    forecast: [
      { date: '2024-09-18', temp: { min: 26, max: 35 }, condition: 'Sunny' },
      { date: '2024-09-19', temp: { min: 27, max: 34 }, condition: 'Partly Cloudy' },
      { date: '2024-09-20', temp: { min: 25, max: 32 }, condition: 'Cloudy' }
    ]
  };

  useEffect(() => {
    initializeUserProfile();
    loadAIInsights();
    const interval = setInterval(loadAIInsights, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [userId]);

  const initializeUserProfile = () => {
    // Create a sample user profile
    const userProfile: UserEnergyProfile = {
      userId,
      householdSize: 4,
      homeType: 'independent_house',
      homeSize: 1200,
      location: {
        city: 'Hyderabad',
        climate: 'hot'
      },
      energyGoals: {
        savingsTarget: 15,
        budgetLimit: 3000,
        comfortPreference: 7
      },
      appliances: [
        { type: 'AC', age: 3, efficiency: 'A+', usage: 'heavy' },
        { type: 'Refrigerator', age: 2, efficiency: 'A++', usage: 'moderate' },
        { type: 'Water Heater', age: 5, efficiency: 'A', usage: 'moderate' }
      ],
      consumptionHistory: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        consumption: 25 + Math.random() * 15,
        cost: (25 + Math.random() * 15) * 6.5
      })),
      preferences: {
        notificationFrequency: 'daily',
        focusAreas: ['cost', 'comfort', 'environment'],
        automationPreference: 'moderate'
      }
    };

    aiEnergyCoach.setUserProfile(userId, userProfile);
  };

  const loadAIInsights = async () => {
    setIsLoading(true);
    try {
      const devices = smartHomeController.getAllDevices();
      const userProfile = aiEnergyCoach.getUserProfile(userId);
      
      // Generate AI insights
      const [newInsights, newPredictions] = await Promise.all([
        aiEnergyCoach.generateEnergyInsights(
          userId,
          userProfile?.consumptionHistory || [],
          devices,
          weatherContext
        ),
        aiEnergyCoach.generatePredictiveAnalysis(
          userId,
          userProfile?.consumptionHistory || [],
          { season: 'summer', temperature: weatherContext.temperature }
        )
      ]);

      // Generate recommendations based on insights
      const newRecommendations = await aiEnergyCoach.generatePersonalizedRecommendations(
        userId,
        newInsights,
        devices
      );

      setInsights(newInsights);
      setRecommendations(newRecommendations);
      setPredictions(newPredictions);
      setCoachingSessions(aiEnergyCoach.getCoachingSessions(userId));

    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const applyRecommendation = async (recommendation: PersonalizedRecommendation) => {
    try {
      // Simulate applying recommendation
      toast.success(`Applied: ${recommendation.title}`);
      
      // You would implement actual device control here
      // For example, if it's an AC temperature recommendation:
      if (recommendation.title.includes('AC') && recommendation.title.includes('temperature')) {
        const acDevices = smartHomeController.getAllDevices().filter(d => d.type === 'ac');
        for (const device of acDevices) {
          await smartHomeController.setDeviceTemperature(device.id, 26);
        }
      }

      // Mark recommendation as applied (you'd persist this)
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === recommendation.id ? { ...rec, applied: true } : rec
      );
      setRecommendations(updatedRecommendations as any);
    } catch (error) {
      toast.error('Failed to apply recommendation');
    }
  };

  const startCoachingSession = async (topic: string) => {
    setChatTopic(topic);
    setChatMessages([{
      role: 'ai',
      content: `Hi! I'm your AI Energy Coach. I'm here to help you with ${topic}. What specific questions do you have?`
    }]);
    setChatOpen(true);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Generate AI response
      const session = await aiEnergyCoach.startCoachingSession(
        userId,
        chatTopic,
        [userMessage]
      );

      const aiResponse = session.responses[0]?.answer || 'I understand your question. Let me think about the best recommendation for your situation.';
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        setIsTyping(false);
      }, 1500); // Simulate typing delay

    } catch (error) {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'I apologize, but I encountered an error. Please try asking your question again.' 
      }]);
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'consumption': return <BarChart3 className="h-5 w-5" />;
      case 'efficiency': return <Gauge className="h-5 w-5" />;
      case 'cost': return <DollarSign className="h-5 w-5" />;
      case 'environmental': return <Leaf className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <Users className="h-4 w-4" />;
      case 'technical': return <Zap className="h-4 w-4" />;
      case 'seasonal': return <ThermometerSun className="h-4 w-4" />;
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with AI Coach */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Energy Coach</h2>
            <p className="text-muted-foreground">Personalized insights and recommendations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAIInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => startCoachingSession('general energy optimization')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Coach
          </Button>
        </div>
      </div>

      {/* AI Insights Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">🧠 Insights</TabsTrigger>
          <TabsTrigger value="recommendations">💡 Recommendations</TabsTrigger>
          <TabsTrigger value="predictions">📈 Predictions</TabsTrigger>
          <TabsTrigger value="coaching">🤖 Coaching</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-pulse" />
                  <p>AI is analyzing your energy data...</p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-purple-500">
                          {getInsightIcon(insight.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={severityColors[insight.severity]}>
                              {insight.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {insight.actionable && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{insight.insight}</p>
                    
                    {/* Potential Savings */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Energy</p>
                        <p className="font-bold text-green-600">{insight.potentialSavings.energy.toFixed(1)} kWh</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="font-bold text-blue-600">₹{insight.potentialSavings.cost.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Carbon</p>
                        <p className="font-bold text-purple-600">{insight.potentialSavings.carbon.toFixed(1)} kg</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {!isLoading && insights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500 opacity-50" />
                  <p className="font-medium">No AI insights available yet</p>
                  <p className="text-sm text-muted-foreground">
                    The AI coach is learning your energy patterns. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={priorityColors[rec.priority]}>
                            {rec.priority}
                          </Badge>
                          <Badge className={effortColors[rec.effort]}>
                            {rec.effort}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.timeframe}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applyRecommendation(rec)}
                      disabled={(rec as any).applied}
                    >
                      {(rec as any).applied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{rec.description}</p>
                  
                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Energy</p>
                      <p className="font-bold text-green-600">{rec.impact.energy} kWh/month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Cost</p>
                      <p className="font-bold text-blue-600">₹{rec.impact.cost}/month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Comfort</p>
                      <div className="flex items-center justify-center">
                        {rec.impact.comfort >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="ml-1 font-bold">{Math.abs(rec.impact.comfort)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <p className="font-medium mb-2">Steps to implement:</p>
                    <ol className="space-y-2">
                      {rec.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Prerequisites */}
                  {rec.prerequisites && rec.prerequisites.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Prerequisites:</p>
                      <ul className="space-y-1">
                        {rec.prerequisites.map((prereq, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-3 w-3" />
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {recommendations.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-50" />
                  <p className="font-medium">No personalized recommendations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate insights first to receive tailored recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    {prediction.metric.charAt(0).toUpperCase() + prediction.metric.slice(1)} Prediction
                  </CardTitle>
                  <CardDescription>{prediction.timeframe}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">{prediction.current.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      {prediction.predicted > prediction.current ? (
                        <TrendingUp className="h-8 w-8 text-red-500 mx-auto" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-green-500 mx-auto" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Predicted</p>
                      <p className="text-2xl font-bold">{prediction.predicted.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence Level</span>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.confidence} className="w-24" />
                      <span className="text-sm font-medium">{prediction.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Key Factors:</p>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-blue-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {prediction.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {prediction.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {predictions.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-orange-500 opacity-50" />
                  <p className="font-medium">No predictions available</p>
                  <p className="text-sm text-muted-foreground">
                    More data is needed to generate accurate predictions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-500" />
                  AI Energy Coach
                </CardTitle>
                <CardDescription>
                  Get personalized energy coaching and ask specific questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Reduce AC Costs',
                    'Peak Hour Optimization',
                    'Appliance Efficiency',
                    'Seasonal Adjustments',
                    'Smart Home Setup',
                    'Bill Analysis'
                  ].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      onClick={() => startCoachingSession(topic.toLowerCase())}
                      className="text-left justify-start"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>

                {coachingSessions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Recent Coaching Sessions</h4>
                    <div className="space-y-2">
                      {coachingSessions.slice(-3).map((session, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{session.topic}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.responses.length} responses
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Coaching Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-500" />
              AI Energy Coach - {chatTopic}
            </DialogTitle>
            <DialogDescription>
              Ask me anything about energy optimization and smart home management
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-96">
            <ScrollArea className="flex-1 p-4 border rounded-lg">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-4">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me about energy optimization..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isTyping}
              />
              <Button onClick={sendMessage} disabled={isTyping || !currentMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}