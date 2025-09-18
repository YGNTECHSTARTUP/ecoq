
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar,
  RefreshCw,
  BarChart3,
  Home,
  Users,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';

// Import our comprehensive dashboard components
import { SmartHomeDashboard } from '@/components/dashboard/enhanced-smart-home-controls';
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel-simple';
import { AdvancedAnalyticsDashboard } from '@/components/dashboard/advanced-analytics-dashboard';
import { CommunityDashboard } from '@/components/community/community-dashboard';
import { GamingDashboard } from '@/components/gaming/gaming-dashboard';

// Quick overview cards
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { EnergyUsageChart } from '@/components/dashboard/energy-usage-chart';

// Initialize demo data
import '@/lib/demo-data-initializer';

interface DashboardState {
  lastUpdate: Date;
  isRefreshing: boolean;
  activeTab: string;
}

function DashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [state, setState] = useState<DashboardState>({
    lastUpdate: new Date(),
    isRefreshing: false,
    activeTab: tabParam || 'overview'
  });
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Mock user ID for demonstration
  const userId = 'demo-user-123';

  useEffect(() => {
    // Set the initial time/date string on client-side to avoid hydration mismatch
    setLastUpdateTime(new Date().toLocaleTimeString());
    setCurrentDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}));

    const updateInterval = setInterval(() => {
      handleRefresh(true);
    }, 300000); // Check every 5 minutes

    toast({
      title: "Welcome to EcoQ! 🌱",
      description: "Your comprehensive energy management dashboard is ready!",
    });

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    setLastUpdateTime(state.lastUpdate.toLocaleTimeString());
  }, [state.lastUpdate]);

  // Sync tab with URL parameters
  useEffect(() => {
    const newTab = tabParam || 'overview';
    if (newTab !== state.activeTab) {
      setState(prev => ({ ...prev, activeTab: newTab }));
    }
  }, [tabParam]);

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

  const handleTabChange = (value: string) => {
    setState(prev => ({ ...prev, activeTab: value }));
  };

  return (
    <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">EcoQ Dashboard</h2>
          <p className="text-muted-foreground">
            Your comprehensive energy management system • Last updated {lastUpdateTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Hyderabad, IN
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {currentDate}
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

      {/* Main Dashboard Tabs */}
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="smart-home" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Smart Home
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="gaming" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gaming
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            {/* Quick Overview Cards */}
            <OverviewCards />
            
            {/* Energy Usage Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyUsageChart />
              
              {/* Quick AI Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick AI Insights</h3>
                <AIInsightsPanel userId={userId} className="h-[400px]" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Smart Home Tab */}
        <TabsContent value="smart-home" className="space-y-6">
          <SmartHomeDashboard userId={userId} />
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsPanel userId={userId} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalyticsDashboard userId={userId} />
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <CommunityDashboard userId={userId} />
        </TabsContent>

        {/* Gaming Tab */}
        <TabsContent value="gaming" className="space-y-6">
          <GamingDashboard />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </MainLayout>
  );
}
