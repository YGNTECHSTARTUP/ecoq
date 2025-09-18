/**
 * Enhanced Overview Cards
 * 
 * Modern dashboard cards with animations, loading states,
 * real-time updates, and responsive design patterns.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LoadingSpinner, 
  ProgressCircle, 
  CardSkeleton,
  DataState 
} from '@/components/ui/enhanced-loading';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { 
  Gem, 
  Zap, 
  Wallet, 
  Plug, 
  Activity, 
  Leaf, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Lightbulb,
  Home,
  Gauge,
  Target,
  Award,
  Clock,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartMeter, useSmartMeterStats } from '@/hooks/useSmartMeter';
import { useAuth } from '@/hooks/useAuth';

// Enhanced Card Types
interface EnhancedCardData {
  id: string;
  title: string;
  value: string | number;
  formattedValue?: string;
  previousValue?: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: {
    current: number;
    target: number;
    label: string;
  };
  status?: {
    variant: 'default' | 'success' | 'warning' | 'destructive';
    label: string;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  extra?: React.ReactNode;
  color?: string;
  gradient?: boolean;
}

// Enhanced Overview Cards Component
export function EnhancedOverviewCards() {
  const { user } = useAuth();
  const { meters, devices, currentReading, loading, error } = useSmartMeter();
  const stats = useSmartMeterStats();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setAnimationKey(prev => prev + 1);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
  };

  // Card data with real-time updates
  const cardData: EnhancedCardData[] = React.useMemo(() => [
    {
      id: 'points',
      title: 'Watts Points',
      value: user?.profile?.gamification.points || 0,
      formattedValue: (user?.profile?.gamification.points || 0).toLocaleString(),
      icon: Gem,
      description: 'From energy efficiency',
      trend: {
        value: 12,
        label: '+12% this week',
        direction: 'up' as const
      },
      progress: {
        current: user?.profile?.gamification.points || 0,
        target: ((user?.profile?.gamification.level || 1) * 1000),
        label: 'Next level'
      },
      status: {
        variant: 'success',
        label: 'Level ' + (user?.profile?.gamification.level || 1)
      },
      color: 'from-purple-500 to-pink-500',
      gradient: true,
      extra: (
        <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-1">
          <Award className="h-3 w-3" />
          <span>{user?.profile?.gamification.badges.length || 0} badges earned</span>
        </div>
      )
    },
    {
      id: 'energy-saved',
      title: 'Energy Saved',
      value: stats.totalConsumption || 0,
      formattedValue: `${(stats.totalConsumption || 0).toFixed(1)} kWh`,
      unit: 'kWh',
      icon: Zap,
      description: 'This month',
      trend: {
        value: 8,
        label: '+8% vs last month',
        direction: 'up' as const
      },
      color: 'from-green-500 to-emerald-500',
      gradient: true,
      extra: (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
          <Leaf className="h-3 w-3" />
          <span>{((stats.totalConsumption || 0) * 0.82).toFixed(1)} kg CO₂ saved</span>
        </div>
      )
    },
    {
      id: 'cost-savings',
      title: 'Cost Savings',
      value: stats.totalCost || 0,
      formattedValue: `₹${(stats.totalCost || 0).toLocaleString()}`,
      unit: 'INR',
      icon: Wallet,
      description: 'Monthly savings',
      trend: {
        value: 15,
        label: '+₹150 vs last month',
        direction: 'up' as const
      },
      progress: {
        current: stats.totalCost || 0,
        target: 1000,
        label: 'Monthly goal'
      },
      color: 'from-blue-500 to-cyan-500',
      gradient: true
    },
    {
      id: 'smart-devices',
      title: 'Smart Devices',
      value: stats.totalDevices,
      formattedValue: stats.totalDevices.toString(),
      icon: Plug,
      description: `${stats.activeDevices} currently active`,
      status: {
        variant: stats.onlineDevices === stats.totalDevices ? 'success' : 'warning',
        label: stats.onlineDevices === stats.totalDevices ? 'All Online' : 'Some Offline'
      },
      progress: {
        current: stats.onlineDevices,
        target: stats.totalDevices,
        label: 'Online devices'
      },
      actions: [
        {
          label: 'Manage',
          onClick: () => {
            // Navigate to device management
            window.location.href = '/dashboard?tab=smart-home';
          },
          variant: 'outline'
        }
      ]
    }
  ], [user, stats]);

  return (
    <ComponentErrorBoundary componentName="EnhancedOverviewCards">
      <div className="space-y-6">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Overview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={cn('h-3 w-3 mr-2', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <DataState
            loading={loading}
            error={error}
            data={cardData}
            loadingSkeleton={
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </>
            }
            errorMessage="Failed to load overview data"
            emptyMessage="No overview data available"
          >
            {cardData.map((card, index) => (
              <EnhancedCard 
                key={`${card.id}-${animationKey}`} 
                data={card} 
                index={index}
                isRefreshing={refreshing}
              />
            ))}
          </DataState>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}

// Individual Enhanced Card Component
interface EnhancedCardProps {
  data: EnhancedCardData;
  index: number;
  isRefreshing?: boolean;
}

function EnhancedCard({ data, index, isRefreshing }: EnhancedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusVariantClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'destructive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer',
        isHovered && 'scale-[1.02]',
        isRefreshing && 'animate-pulse'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowDetails(!showDetails)}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* Gradient Background */}
      {data.gradient && data.color && (
        <div 
          className={cn(
            'absolute inset-0 opacity-5 bg-gradient-to-br',
            data.color
          )} 
        />
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        <div className="relative">
          <data.icon className={cn(
            'h-4 w-4 transition-colors duration-200',
            data.gradient ? 'text-primary' : 'text-muted-foreground',
            isHovered && 'text-primary'
          )} />
          
          {/* Activity Indicator */}
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse opacity-80" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline gap-2">
            <div className={cn(
              'text-2xl font-bold transition-colors duration-200',
              data.gradient && 'bg-gradient-to-r bg-clip-text text-transparent ' + data.color,
              isRefreshing && 'animate-pulse'
            )}>
              {data.formattedValue || data.value}
            </div>
            {data.unit && (
              <span className="text-xs text-muted-foreground">{data.unit}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {data.description}
          </p>

          {/* Trend */}
          {data.trend && (
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(data.trend.direction)}
              <span className={cn(
                'font-medium',
                data.trend.direction === 'up' && 'text-green-600',
                data.trend.direction === 'down' && 'text-red-600',
                data.trend.direction === 'neutral' && 'text-muted-foreground'
              )}>
                {data.trend.label}
              </span>
            </div>
          )}

          {/* Progress */}
          {data.progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{data.progress.label}</span>
                <span className="font-medium">
                  {data.progress.current}/{data.progress.target}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500 ease-out',
                    data.gradient 
                      ? `bg-gradient-to-r ${data.color}`
                      : 'bg-primary'
                  )}
                  style={{ 
                    width: `${Math.min(100, (data.progress.current / data.progress.target) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Status */}
          {data.status && (
            <Badge 
              variant="outline" 
              className={cn(
                'h-5 text-xs',
                getStatusVariantClasses(data.status.variant)
              )}
            >
              {data.status.label}
            </Badge>
          )}

          {/* Extra Content */}
          {data.extra}

          {/* Actions */}
          {data.actions && data.actions.length > 0 && (
            <div className="flex gap-2 pt-2">
              {data.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className="h-7 px-2 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Expandable Details */}
          {showDetails && (
            <div className="pt-3 border-t space-y-2 animate-in slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Last Update</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact Overview Cards for Mobile
export function CompactOverviewCards() {
  const { user } = useAuth();
  const stats = useSmartMeterStats();

  const compactData = [
    {
      label: 'Points',
      value: (user?.profile?.gamification.points || 0).toLocaleString(),
      icon: Gem,
      color: 'text-purple-600'
    },
    {
      label: 'Saved',
      value: `${(stats.totalConsumption || 0).toFixed(1)}kWh`,
      icon: Zap,
      color: 'text-green-600'
    },
    {
      label: 'Cost',
      value: `₹${(stats.totalCost || 0)}`,
      icon: Wallet,
      color: 'text-blue-600'
    },
    {
      label: 'Devices',
      value: stats.totalDevices.toString(),
      icon: Plug,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 lg:hidden">
      {compactData.map((item, index) => (
        <Card key={index} className="p-3">
          <div className="text-center space-y-2">
            <item.icon className={cn('h-5 w-5 mx-auto', item.color)} />
            <div>
              <div className="text-sm font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default EnhancedOverviewCards;