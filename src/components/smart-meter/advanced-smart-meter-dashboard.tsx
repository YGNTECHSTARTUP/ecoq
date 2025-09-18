/**
 * Advanced Smart Meter Dashboard
 * 
 * Enterprise-grade dashboard integrating all advanced smart meter features
 * including AI predictions, optimization engine, learning patterns, and analytics.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  SmartMeterOverview,
  DeviceManagementDashboard,
  EnergyUsageChart,
  DeviceScheduler,
  EnergyInsights,
  RealTimePowerMonitor,
  CarbonFootprintTracker
} from './enhanced-smart-meter-components';
import {
  AIEnergyPredictor,
  SmartEnergyOptimizer,
  DeviceLearningPatterns,
  EnterpriseEnergyAnalytics
} from './advanced-smart-meter-features';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { 
  DataState,
  LoadingOverlay,
  CardSkeleton 
} from '@/components/ui/enhanced-loading';
import {
  Brain,
  Rocket,
  Building,
  TrendingUp,
  BarChart3,
  Cpu,
  Zap,
  Target,
  Sparkles,
  Activity,
  Settings,
  Bell,
  User,
  Shield,
  Database,
  Cloud,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Home,
  Factory,
  TreePine,
  Lightbulb,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Calendar,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Play,
  Pause,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Info,
  Award,
  Trophy,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartMeter, useSmartMeterStats } from '@/hooks/useSmartMeter';

// Advanced Dashboard Types
interface DashboardConfig {
  layout: 'executive' | 'technical' | 'operational' | 'custom';
  widgets: string[];
  refreshInterval: number;
  alertsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface AlertConfig {
  id: string;
  type: 'performance' | 'cost' | 'environmental' | 'maintenance';
  threshold: number;
  enabled: boolean;
  notifications: ('email' | 'sms' | 'push')[];
}

// Executive Summary Widget
function ExecutiveSummary() {
  const stats = useSmartMeterStats();
  
  const summaryMetrics = [
    {
      label: 'Energy Efficiency Score',
      value: 94.2,
      target: 95.0,
      trend: '+2.1%',
      color: 'text-green-600',
      icon: <Target className="h-5 w-5" />
    },
    {
      label: 'Monthly Cost Savings',
      value: '$247.80',
      target: '$200.00',
      trend: '+23.9%',
      color: 'text-blue-600',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      label: 'Carbon Reduction',
      value: '2.4 tons CO₂',
      target: '2.0 tons',
      trend: '+20.0%',
      color: 'text-green-600',
      icon: <TreePine className="h-5 w-5" />
    },
    {
      label: 'System Reliability',
      value: '99.8%',
      target: '99.5%',
      trend: '+0.3%',
      color: 'text-blue-600',
      icon: <Shield className="h-5 w-5" />
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6 text-blue-600" />
          Executive Summary
          <Badge variant="secondary" className="ml-auto">
            Updated 2 min ago
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryMetrics.map((metric, index) => (
            <div key={index} className="bg-white/70 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white rounded-full">
                  {metric.icon}
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {metric.trend}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                <div className={cn('text-xl font-bold', metric.color)}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  Target: {metric.target}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Key Insights */}
        <div className="mt-6 p-4 bg-white/70 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Key Insights
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p>Energy efficiency improved by 12% this quarter through AI optimization</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Peak demand reduced by 18% with smart scheduling implementation</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p>ROI on smart meter investment: 147% over 24 months</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// System Health Monitor
function SystemHealthMonitor() {
  const [healthData, setHealthData] = React.useState({
    overall: 98.5,
    connectivity: 99.2,
    dataQuality: 97.8,
    deviceHealth: 98.9,
    predictions: 94.1
  });

  const healthItems = [
    { name: 'Overall System', value: healthData.overall, status: 'excellent' },
    { name: 'Network Connectivity', value: healthData.connectivity, status: 'excellent' },
    { name: 'Data Quality', value: healthData.dataQuality, status: 'good' },
    { name: 'Device Health', value: healthData.deviceHealth, status: 'excellent' },
    { name: 'AI Predictions', value: healthData.predictions, status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-600" />
          System Health Monitor
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {healthItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{item.value}%</span>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          </div>
        ))}
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">47</div>
            <div className="text-xs text-muted-foreground">Active Devices</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">1.2s</div>
            <div className="text-xs text-muted-foreground">Response Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">99.8%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Smart Alerts Center
function SmartAlertsCenter() {
  const [alerts, setAlerts] = React.useState([
    {
      id: '1',
      type: 'performance',
      title: 'Peak Demand Alert',
      message: 'Current usage 23% above normal for this time',
      severity: 'warning',
      timestamp: new Date(),
      acknowledged: false
    },
    {
      id: '2',
      type: 'cost',
      title: 'Cost Optimization Available',
      message: 'AI suggests shifting water heater schedule - save $12.40',
      severity: 'info',
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false
    },
    {
      id: '3',
      type: 'environmental',
      title: 'Carbon Footprint Goal Met',
      message: 'Monthly carbon reduction target achieved 3 days early',
      severity: 'success',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: true
    }
  ]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-orange-500" />
            Smart Alerts
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </CardTitle>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All systems running smoothly</p>
                <p className="text-sm">No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    'p-3 border rounded-lg transition-opacity',
                    alert.acknowledged && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="font-medium text-sm">{alert.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main Advanced Dashboard
export function AdvancedSmartMeterDashboard() {
  const [dashboardConfig, setDashboardConfig] = React.useState<DashboardConfig>({
    layout: 'executive',
    widgets: ['summary', 'ai-predictor', 'optimizer', 'health', 'alerts'],
    refreshInterval: 30,
    alertsEnabled: true,
    theme: 'light'
  });

  const [activeTab, setActiveTab] = React.useState('overview');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const { devices, meters, loading, error, refreshData } = useSmartMeter();
  const stats = useSmartMeterStats();

  // Auto-refresh functionality
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, dashboardConfig.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [dashboardConfig.refreshInterval, refreshData]);

  // Layout configurations
  const layouts = {
    executive: {
      name: 'Executive View',
      description: 'High-level metrics and KPIs',
      components: ['summary', 'ai-predictor', 'health', 'alerts']
    },
    technical: {
      name: 'Technical View',
      description: 'Detailed system analytics and performance',
      components: ['ai-predictor', 'optimizer', 'learning', 'enterprise']
    },
    operational: {
      name: 'Operational View',
      description: 'Day-to-day monitoring and controls',
      components: ['realtime', 'devices', 'scheduler', 'insights']
    },
    custom: {
      name: 'Custom View',
      description: 'User-defined layout',
      components: dashboardConfig.widgets
    }
  };

  const currentLayout = layouts[dashboardConfig.layout];

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'summary':
        return <ExecutiveSummary key="summary" />;
      case 'ai-predictor':
        return <AIEnergyPredictor key="ai-predictor" />;
      case 'optimizer':
        return <SmartEnergyOptimizer key="optimizer" />;
      case 'learning':
        return <DeviceLearningPatterns key="learning" />;
      case 'enterprise':
        return <EnterpriseEnergyAnalytics key="enterprise" />;
      case 'health':
        return <SystemHealthMonitor key="health" />;
      case 'alerts':
        return <SmartAlertsCenter key="alerts" />;
      case 'realtime':
        return <RealTimePowerMonitor key="realtime" />;
      case 'devices':
        return <DeviceManagementDashboard key="devices" />;
      case 'scheduler':
        return <DeviceScheduler key="scheduler" deviceId="default" />;
      case 'insights':
        return <EnergyInsights key="insights" />;
      default:
        return null;
    }
  };

  return (
    <ComponentErrorBoundary componentName="AdvancedSmartMeterDashboard">
      <div className={cn(
        'min-h-screen bg-gradient-to-br from-gray-50 to-blue-50',
        isFullscreen && 'fixed inset-0 z-50 overflow-auto'
      )}>
        {/* Advanced Header */}
        <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Advanced Smart Meter Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    AI-powered energy management and optimization platform
                  </p>
                </div>

                {/* Quick Stats Bar */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">2.4 kW Live</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">94.2% Efficiency</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-violet-50 rounded-full border border-purple-200">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">AI Active</span>
                  </div>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-2">
                <Select 
                  value={dashboardConfig.layout} 
                  onValueChange={(value: DashboardConfig['layout']) => 
                    setDashboardConfig(prev => ({ ...prev, layout: value }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(layouts).map(([key, layout]) => (
                      <SelectItem key={key} value={key}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Dashboard Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Refresh Interval</label>
                        <Select 
                          value={dashboardConfig.refreshInterval.toString()} 
                          onValueChange={(value) => 
                            setDashboardConfig(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Enable Alerts</label>
                        <Switch 
                          checked={dashboardConfig.alertsEnabled} 
                          onCheckedChange={(checked) => 
                            setDashboardConfig(prev => ({ ...prev, alertsEnabled: checked }))
                          }
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Layout Description */}
            <div className="mt-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="font-medium text-blue-800">{currentLayout.name}:</span>
                <span className="text-blue-700">{currentLayout.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="container mx-auto px-4 py-6">
          <DataState
            loading={loading}
            error={error}
            data={meters}
            loadingSkeleton={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            }
            errorMessage="Failed to load dashboard data"
            emptyMessage="No meters found"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentLayout.components.map((widgetId) => (
                <div 
                  key={widgetId} 
                  className={cn(
                    widgetId === 'summary' && 'lg:col-span-2 xl:col-span-3',
                    widgetId === 'enterprise' && 'lg:col-span-2 xl:col-span-3',
                    widgetId === 'devices' && 'lg:col-span-2 xl:col-span-3'
                  )}
                >
                  {renderWidget(widgetId)}
                </div>
              ))}
            </div>
          </DataState>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}

export default AdvancedSmartMeterDashboard;