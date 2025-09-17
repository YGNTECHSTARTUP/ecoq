
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { GamingDashboard } from '@/components/gaming/gaming-dashboard';

interface DashboardState {
  lastUpdate: Date;
  isRefreshing: boolean;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>({
    lastUpdate: new Date(),
    isRefreshing: false,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set the initial time/date string on client-side to avoid hydration mismatch
    setLastUpdateTime(new Date().toLocaleTimeString());
    setCurrentDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}));

    const updateInterval = setInterval(() => {
      handleRefresh(true);
    }, 300000); // Check every 5 minutes

    toast({
      title: "Welcome to EcoQuest! 🚀",
      description: "Your gaming dashboard is ready. Let the energy-saving adventure begin!",
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
          description: "Gaming data has been updated.",
        });
      }
      
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  return (
    <MainLayout>
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">EcoQuest Dashboard</h2>
            <p className="text-muted-foreground">
              Your energy-saving adventure • Last updated {lastUpdateTime}
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

        <GamingDashboard />

      </main>
    </MainLayout>
  );
}
