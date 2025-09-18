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
import { smartHomeController } from '@/lib/smart-home-controller';
import { toast } from 'sonner';

// Mock types for AI features
interface EnergyInsight {
  id: string;
  title: string;
  description: string;
  category: 'consumption' | 'efficiency' | 'cost' | 'comfort';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
  recommendations: string[];
  metrics: Record<string, number>;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedSavings: number;
  effort: 'easy' | 'moderate' | 'significant';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  steps: string[];
  applied: boolean;
}

interface PredictiveAnalysis {
  id: string;
  type: 'consumption' | 'cost' | 'efficiency';
  prediction: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  
  // Coaching interface state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; timestamp: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadMockInsights();
    const interval = setInterval(loadMockInsights, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [userId]);

  const loadMockInsights = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Generate mock insights
      const mockInsights: EnergyInsight[] = [
        {
          id: 'insight-1',
          title: 'High AC Usage Detected',
          description: 'Your air conditioning usage has increased by 25% this week compared to last week.',
          category: 'consumption',
          severity: 'medium',
          confidence: 87,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Consider raising AC temperature by 1-2°C',
            'Use ceiling fans to improve air circulation',
            'Close curtains during peak sun hours'
          ],
          metrics: { increased_usage: 25, potential_savings: 400 }
        },
        {
          id: 'insight-2',
          title: 'Peak Hour Usage Optimization',
          description: 'You could save ₹200/month by shifting 30% of usage to off-peak hours.',
          category: 'cost',
          severity: 'high',
          confidence: 92,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recommendations: [
            'Run washing machine and dishwasher after 10 PM',
            'Pre-cool home before 6 PM peak hours',
            'Use timer settings for water heater'
          ],
          metrics: { potential_monthly_savings: 200, usage_shift_required: 30 }
        },
        {
          id: 'insight-3',
          title: 'Refrigerator Efficiency Alert',
          description: 'Your refrigerator is consuming 15% more energy than expected for its age and model.',
          category: 'efficiency',
          severity: 'medium',
          confidence: 78,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          recommendations: [
            'Check door seals for air leaks',
            'Clean condenser coils',
            'Maintain optimal temperature settings (3-4°C)'
          ],
          metrics: { excess_consumption: 15, monthly_waste: 50 }
        }
      ];

      const mockRecommendations: PersonalizedRecommendation[] = [
        {
          id: 'rec-1',
          title: 'Smart AC Temperature Schedule',
          description: 'Automatically adjust AC temperature based on occupancy and outdoor conditions',
          category: 'automation',
          estimatedSavings: 350,
          effort: 'easy',
          priority: 'high',
          timeframe: '1 week',
          steps: [
            'Set AC to 26°C during day hours (9 AM - 6 PM)',
            'Increase to 28°C during sleep hours (10 PM - 6 AM)',
            'Turn off AC when room is unoccupied for >30 minutes'
          ],
          applied: false
        },
        {
          id: 'rec-2',
          title: 'Water Heater Timer Optimization',
          description: 'Use timer to heat water only when needed, reducing standby losses',
          category: 'scheduling',
          estimatedSavings: 150,
          effort: 'moderate',
          priority: 'medium',
          timeframe: '3 days',
          steps: [
            'Install programmable timer switch',
            'Set heating schedule for morning (6-8 AM) and evening (6-9 PM)',
            'Monitor usage patterns for 1 week and adjust'
          ],
          applied: false
        },
        {
          id: 'rec-3',
          title: 'LED Lighting Upgrade',
          description: 'Replace remaining incandescent bulbs with smart LED bulbs',
          category: 'upgrade',
          estimatedSavings: 80,
          effort: 'easy',
          priority: 'low',
          timeframe: '2 days',
          steps: [
            'Identify remaining non-LED bulbs',
            'Purchase smart LED bulbs with dimming capability',
            'Install and configure with smart home system'
          ],
          applied: true
        }
      ];

      const mockPredictions: PredictiveAnalysis[] = [
        {
          id: 'pred-1',
          type: 'consumption',
          prediction: 850,
          confidence: 85,
          timeframe: 'Next Month',
          factors: ['Hot weather forecast', 'Working from home increase', 'New AC installation'],
          trend: 'increasing'
        },
        {
          id: 'pred-2',
          type: 'cost',
          prediction: 5200,
          confidence: 78,
          timeframe: 'Next Month',
          factors: ['Electricity tariff increase', 'Higher consumption', 'Peak hour usage'],
          trend: 'increasing'
        },
        {
          id: 'pred-3',
          type: 'efficiency',
          prediction: 82,
          confidence: 90,
          timeframe: 'Next Week',
          factors: ['Applied recommendations', 'Better scheduling', 'Weather conditions'],
          trend: 'stable'
        }
      ];

      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setPredictions(mockPredictions);

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
      
      // Update recommendation status
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === recommendation.id ? { ...rec, applied: true } : rec
      );
      setRecommendations(updatedRecommendations);

    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast.error('Failed to apply recommendation');
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: currentMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your recent usage patterns, I recommend adjusting your AC temperature to 26°C during the day. This could save you approximately ₹300 per month.",
        "Your peak hour usage has increased by 15%. Try running high-consumption appliances like washing machines after 10 PM to save on electricity costs.",
        "I notice your refrigerator efficiency has dropped. Check the door seals and clean the condenser coils - this simple maintenance can reduce energy consumption by 10-15%.",
        "Great question! Your current energy efficiency score is 78%. With the recommendations I've suggested, you could improve this to 85% within 2 weeks.",
        "The weather forecast shows temperatures rising next week. I'll automatically adjust your cooling schedule to maintain comfort while optimizing energy usage."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        role: 'ai' as const,
        content: randomResponse,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Energy Coach</h2>
            <p className="text-muted-foreground">Personalized insights and recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bot className="h-4 w-4 mr-2" />
                Chat with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>AI Energy Coach</DialogTitle>
                <DialogDescription>
                  Ask me anything about your energy usage, get personalized recommendations, or discuss optimization strategies.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your energy usage..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    disabled={isTyping}
                  />
                  <Button onClick={sendChatMessage} disabled={isTyping || !currentMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            onClick={loadMockInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Target className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(insight.severity)}
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={severityColors[insight.severity]}>
                      {insight.severity}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {Object.keys(insight.metrics).length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold text-primary">{value}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[rec.priority]}>
                      {rec.priority} priority
                    </Badge>
                    <Badge className={effortColors[rec.effort]}>
                      {rec.effort}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">₹{rec.estimatedSavings}</p>
                    <p className="text-xs text-muted-foreground">Monthly Savings</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{rec.timeframe}</p>
                    <p className="text-xs text-muted-foreground">Implementation</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{rec.steps.length}</p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Implementation Steps:</h4>
                  <ol className="space-y-2">
                    {rec.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={() => applyRecommendation(rec)}
                    disabled={rec.applied}
                    className="flex-1"
                  >
                    {rec.applied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {predictions.map((pred) => (
            <Card key={pred.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(pred.trend)}
                    <div>
                      <CardTitle className="text-lg capitalize">{pred.type} Prediction</CardTitle>
                      <CardDescription>{pred.timeframe}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {pred.confidence}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {pred.type === 'cost' ? '₹' : ''}
                    {pred.prediction}
                    {pred.type === 'consumption' ? ' kWh' : ''}
                    {pred.type === 'efficiency' ? '%' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Predicted {pred.type} - {pred.trend} trend
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Factors:</h4>
                  <ul className="space-y-1">
                    {pred.factors.map((factor, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-3 w-3 text-blue-500" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Progress value={pred.confidence} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Prediction confidence: {pred.confidence}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}