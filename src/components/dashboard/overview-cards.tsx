'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, Zap, CheckCircle, Wallet, Activity, Leaf, Plug } from 'lucide-react';
import { useSmartMeterDashboard } from '@/hooks/use-smart-meter-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewCards() {
  const { state } = useSmartMeterDashboard();
  const { overview, loading, deviceStats, isOnline } = state;

  const cards = [
    {
      title: 'Watts Points',
      value: overview.wattsPoints.toLocaleString(),
      icon: Gem,
      description: 'Based on smart meter data',
      extra: (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Activity className="h-3 w-3" />
          <span>Real-time tracking</span>
        </div>
      )
    },
    {
      title: 'kWh Saved',
      value: overview.kwhSaved.toLocaleString(),
      icon: Zap,
      description: 'Energy efficiency gains',
      extra: (
        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
          <Leaf className="h-3 w-3" />
          <span>{(overview.kwhSaved * 0.82).toFixed(1)} kg CO₂ saved</span>
        </div>
      )
    },
    {
      title: 'Money Saved',
      value: `₹${overview.moneySaved.toLocaleString()}`,
      icon: Wallet,
      description: 'Potential monthly savings',
      extra: (
        <div className="text-xs text-muted-foreground mt-1">
          From optimized usage patterns
        </div>
      )
    },
    {
      title: 'Connected Devices',
      value: deviceStats.totalDevices.toLocaleString(),
      icon: Plug,
      description: `${deviceStats.activeDevices} active devices`,
      extra: (
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="h-4 text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Efficiency: {deviceStats.averageEfficiencyRating.toFixed(1)}/10
          </span>
        </div>
      )
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">{card.value}</div>
            )}
            <p className="text-xs text-muted-foreground">{card.description}</p>
            {card.extra}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
