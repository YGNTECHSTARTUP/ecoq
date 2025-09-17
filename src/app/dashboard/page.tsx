
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { EnergyUsageChart } from '@/components/dashboard/energy-usage-chart';
import { QuestsList } from '@/components/dashboard/quests-list';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { BadgesGallery } from '@/components/dashboard/badges-gallery';
import { SmartHomeControls } from '@/components/dashboard/smart-home-controls';
import { AiTipGenerator } from '@/components/dashboard/ai-tip-generator';
import { SimulationControls } from '@/components/dashboard/simulation-controls';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Leaf,
  RefreshCw
} from 'lucide-react';
import EnhancedRealTimeQuests from '@/components/dashboard/enhanced-real-time-quests';

interface DashboardState {
  activeTab: string;
  lastUpdate: Date;
  isRefreshing: boolean;
  notifications: Array<{
    id: string;
    type: 'quest' | 'achievement' | 'weather' | 'community';
    title: string;
    message: string;
    urgent: boolean;
  }>;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    lastUpdate: new Date(),
    isRefreshing: false,
    notifications: []
  });
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  const userLocation = { lat: 17.385, lng: 78.4867 }; // Hyderabad
  const userId = 'demo-user-id';

  useEffect(() => {
    // Set the initial time string on client-side to avoid hydration mismatch
    setLastUpdateTime(state.lastUpdate.toLocaleTimeString());

    const updateInterval = setInterval(() => {
      handleRefresh(true);
    }, 300000); // Check every 5 minutes

    toast({
      title: "Dashboard Ready! 🚀",
      description: "Real-time environmental quests are now active.",
    });

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    setLastUpdateTime(state.lastUpdate.toLocaleTimeString());
  }, [state.lastUpdate]);


  const handleRefresh = async (silent = false) => {
    if (state.isRefreshing) return;
    
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ 
        ...prev, 
        lastUpdate: new Date(),
        isRefreshing: false
      }));

      if (!silent) {
        toast({
          title: "Refreshed! ✨",
          description: "Dashboard data has been updated.",
        });
      }
      
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  const handleQuestNotification = (quest: any) => {
    const newNotification = {
      id: quest.id,
      type: 'quest' as const,
      title: 'New Urgent Quest!',
      message: quest.title,
      urgent: quest.urgency === 'EXTREME' || quest.urgency === 'HIGH'
    };
    
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));
    
    toast({
      variant: newNotification.urgent ? 'destructive' : 'default',
      title: newNotification.title,
      description: newNotification.message,
    });
  };

  const clearNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  return (
    <MainLayout>
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">EcoQuest Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time environmental missions • Last updated {lastUpdateTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Hyderabad, IN
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString()}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleRefresh()}
              disabled={state.isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${state.isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {state.notifications.length > 0 && (
          <div className="space-y-2">
            {state.notifications.slice(0, 2).map((notification) => (
              <Alert key={notification.id} className={notification.urgent ? 'border-red-500 bg-red-50' : ''}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <strong>{notification.title}</strong> {notification.message}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearNotification(notification.id)}
                  >
                    ×
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Quests
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <OverviewCards />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <EnergyUsageChart />
              </div>
              <div className="col-span-4 lg:col-span-3 space-y-4">
                <WeatherWidget />
                <QuestsList />
                <AiTipGenerator />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Live Environmental Quests
                </CardTitle>
                <CardDescription>
                  Dynamic quests based on real-time weather and air quality conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedRealTimeQuests 
                  userId={userId}
                  userLocation={userLocation}
                  onQuestNotification={handleQuestNotification}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Carbon Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Energy Saved Today</span>
                      <span className="font-bold text-green-600">12.5 kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CO₂ Avoided</span>
                      <span className="font-bold text-green-600">8.3 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Kada Impact</span>
                      <span className="font-bold text-blue-600">+92.5 kg CO₂</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Equivalent to planting 4.2 trees this month
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="col-span-2">
                <EnergyUsageChart />
              </div>
            </div>
            <BadgesGallery />
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <Leaderboard />
            <Card>
              <CardHeader>
                <CardTitle>Community Impact</CardTitle>
                <CardDescription>Collective environmental achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">15.6k</div>
                    <div className="text-sm text-muted-foreground">kWh Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">8.9k</div>
                    <div className="text-sm text-muted-foreground">Quests Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SmartHomeControls />
              <SimulationControls />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </MainLayout>
  );
}
