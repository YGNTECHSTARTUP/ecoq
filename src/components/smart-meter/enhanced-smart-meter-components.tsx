/**
 * Enhanced Smart Meter Components
 * 
 * Advanced device management, energy monitoring, real-time data visualization,
 * predictive analytics, and comprehensive control systems with modern UX.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ProgressCircle,
  DataState,
  LoadingOverlay,
  EnergyFlowLoader,
  CardSkeleton
} from '@/components/ui/enhanced-loading';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { 
  Zap,
  Plug,
  Power,
  Gauge,
  Activity,
  Settings,
  MoreVertical,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Home,
  Kitchen,
  Bed,
  Car,
  Lightbulb,
  Monitor,
  Tv,
  Smartphone,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Timer,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Maximize2,
  Minimize2,
  RefreshCw,
  Save,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Download,
  Upload,
  Share2,
  Bell,
  BellOff,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Building,
  Map,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useSmartMeter, 
  useSmartMeterStats, 
  useMeterReading,
  useDeviceData,
  useDeviceAutomation,
  useEnergyAnalytics
} from '@/hooks/useSmartMeter';
import { useAuth } from '@/hooks/useAuth';

// Device Card Component
interface DeviceCardProps {
  device: any;
  onToggle?: (deviceId: string, isActive: boolean) => void;
  onSettings?: (deviceId: string) => void;
  onViewDetails?: (deviceId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function DeviceCard({ 
  device, 
  onToggle, 
  onSettings, 
  onViewDetails, 
  variant = 'default' 
}: DeviceCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { energyData, loading } = useDeviceData(device?.id);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'lighting':
        return <Lightbulb className="h-5 w-5" />;
      case 'heating':
        return <Thermometer className="h-5 w-5" />;
      case 'cooling':
        return <Wind className="h-5 w-5" />;
      case 'appliance':
        return <Kitchen className="h-5 w-5" />;
      case 'entertainment':
        return <Tv className="h-5 w-5" />;
      case 'security':
        return <Eye className="h-5 w-5" />;
      case 'water_heater':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location.toLowerCase()) {
      case 'living room':
        return <Home className="h-4 w-4" />;
      case 'kitchen':
        return <Kitchen className="h-4 w-4" />;
      case 'bedroom':
        return <Bed className="h-4 w-4" />;
      case 'garage':
        return <Car className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getStatusColor = (isActive: boolean, isOnline: boolean) => {
    if (!isOnline) return 'text-red-500';
    if (isActive) return 'text-green-500';
    return 'text-gray-400';
  };

  const formatPowerUsage = (power: number) => {
    if (power < 1000) return `${power.toFixed(0)}W`;
    return `${(power / 1000).toFixed(1)}kW`;
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg transition-colors',
                device?.status?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              )}>
                {getDeviceIcon(device?.info?.type)}
              </div>
              <div>
                <h3 className="font-medium text-sm">{device?.info?.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getLocationIcon(device?.info?.location)}
                  <span>{device?.info?.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={device?.status?.isOnline ? 'default' : 'destructive'} className="text-xs">
                {formatPowerUsage(device?.statistics?.averagePowerUsage || 0)}
              </Badge>
              <Switch
                checked={device?.status?.isActive}
                onCheckedChange={(checked) => onToggle?.(device?.id, checked)}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-lg transition-colors',
                device?.status?.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {getDeviceIcon(device?.info?.type)}
              </div>
              <div>
                <CardTitle className="text-xl">{device?.info?.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {getLocationIcon(device?.info?.location)}
                    <span>{device?.info?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{device?.info?.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={device?.status?.isOnline ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {device?.status?.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {device?.status?.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Switch
                checked={device?.status?.isActive}
                onCheckedChange={(checked) => onToggle?.(device?.id, checked)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Real-time Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Current Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Power Usage</span>
                  <span className="font-medium">{formatPowerUsage(device?.statistics?.currentPowerUsage || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <div className="flex items-center gap-2">
                    <Progress value={device?.status?.healthScore || 0} className="w-16 h-1" />
                    <span className="text-sm">{device?.status?.healthScore || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Runtime</span>
                  <span className="text-sm">{Math.floor((device?.statistics?.operatingHours || 0) / 24)}d</span>
                </div>
              </div>
            </div>

            {/* Energy Consumption */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Energy Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <span className="text-sm font-medium">{(device?.statistics?.totalEnergyConsumed || 0).toFixed(1)} kWh</span>
                  </div>
                  <Progress value={75} className="h-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Peak Usage</span>
                    <span className="text-sm font-medium">{formatPowerUsage(device?.statistics?.peakPowerUsage || 0)}</span>
                  </div>
                  <Progress value={60} className="h-1" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly: {((device?.statistics?.totalEnergyConsumed || 0) * 30).toFixed(0)} kWh
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Automation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <Switch checked={device?.configuration?.enableSchedule} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Power Saving</span>
                  <Switch checked={device?.configuration?.powerSavingMode} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alerts</span>
                  <Switch checked={device?.configuration?.alertsEnabled} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Actions</h4>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewDetails?.(device?.id)}>
                  <Activity className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => onSettings?.(device?.id)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg cursor-pointer',
        isHovered && 'scale-[1.01]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-3 rounded-lg transition-colors',
              device?.status?.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {getDeviceIcon(device?.info?.type)}
            </div>
            <div>
              <CardTitle className="text-base">{device?.info?.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getLocationIcon(device?.info?.location)}
                <span>{device?.info?.location}</span>
                <span>•</span>
                <span className="capitalize">{device?.info?.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              getStatusColor(device?.status?.isActive, device?.status?.isOnline)
            )} />
            <Switch
              checked={device?.status?.isActive}
              onCheckedChange={(checked) => onToggle?.(device?.id, checked)}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Power Usage Display */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatPowerUsage(device?.statistics?.averagePowerUsage || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Current Usage</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium">
                {(device?.statistics?.totalEnergyConsumed || 0).toFixed(1)} kWh
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
          </div>

          {/* Health and Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Device Health</span>
              <span>{device?.status?.healthScore || 0}%</span>
            </div>
            <Progress value={device?.status?.healthScore || 0} className="h-2" />
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {device?.status?.isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {device?.status?.lastReading ? 'Live' : 'Stale'}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails?.(device?.id)}>
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSettings?.(device?.id)}>
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Smart Meter Overview Component
export function SmartMeterOverview({ meterId }: { meterId?: string }) {
  const { meters, loading, error } = useSmartMeter();
  const stats = useSmartMeterStats();
  const { reading, lastUpdate, isOnline } = useMeterReading(meterId || meters[0]?.id);

  return (
    <ComponentErrorBoundary componentName="SmartMeterOverview">
      <div className="space-y-6">
        {/* Meter Status Header */}
        <Card className={cn(
          'border-2 transition-all duration-300',
          isOnline ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-3 rounded-full',
                  isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                )}>
                  <Gauge className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Smart Meter Status</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={cn(
                      'h-2 w-2 rounded-full',
                      isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                    )} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                    {lastUpdate && (
                      <>
                        <span>•</span>
                        <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {reading ? formatPowerUsage(reading.currentPower) : '-- W'}
                </div>
                <div className="text-sm text-muted-foreground">Current Load</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Zap className="h-8 w-8 mx-auto text-primary" />
                <div className="text-2xl font-bold">
                  {reading ? (reading.totalConsumption / 1000).toFixed(1) : '--'}
                </div>
                <div className="text-xs text-muted-foreground">Total kWh Today</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Activity className="h-8 w-8 mx-auto text-blue-500" />
                <div className="text-2xl font-bold">{stats.totalDevices}</div>
                <div className="text-xs text-muted-foreground">Connected Devices</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500" />
                <div className="text-2xl font-bold">
                  {reading?.quality && reading.quality !== 'poor' ? '95%' : '--'}
                </div>
                <div className="text-xs text-muted-foreground">Power Quality</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                <div className="text-2xl font-bold">{stats.onlineDevices}</div>
                <div className="text-xs text-muted-foreground">Online Devices</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Flow Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-32 bg-muted/30 rounded-lg flex items-center justify-center">
              {isOnline ? (
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Power className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Grid</div>
                  </div>
                  
                  <div className="flex-1 h-1 bg-gradient-to-r from-primary to-blue-500 animate-pulse rounded" />
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Home className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">Home</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Meter offline - Unable to show energy flow</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
}

// Device Management Dashboard
export function DeviceManagementDashboard() {
  const { devices, loading, error, removeDevice } = useSmartMeter();
  const [selectedDevice, setSelectedDevice] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const handleDeviceToggle = async (deviceId: string, isActive: boolean) => {
    try {
      // This would call the smart meter service to toggle device
      console.log(`Toggle device ${deviceId} to ${isActive}`);
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  const handleDeviceSettings = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  const handleViewDetails = (deviceId: string) => {
    // Navigate to device details page
    window.location.href = `/dashboard/devices/${deviceId}`;
  };

  return (
    <ComponentErrorBoundary componentName="DeviceManagementDashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Device Management</h2>
            <p className="text-muted-foreground">Monitor and control your smart devices</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
            
            <Button>
              <Plug className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>

        {/* Devices Grid/List */}
        <DataState
          loading={loading}
          error={error}
          data={devices}
          loadingSkeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          }
          errorMessage="Failed to load devices"
          emptyMessage="No devices found"
        >
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          )}>
            {devices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={handleDeviceToggle}
                onSettings={handleDeviceSettings}
                onViewDetails={handleViewDetails}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        </DataState>

        {/* Selected Device Details Modal/Sidebar could go here */}
      </div>
    </ComponentErrorBoundary>
  );
}

// Enhanced Energy Usage Chart Component with Recharts Integration
interface EnergyDataPoint {
  timestamp: string;
  consumption: number;
  cost: number;
  efficiency: number;
  carbon: number;
  predicted?: number;
}

interface EnergyUsageChartProps {
  data?: EnergyDataPoint[];
  timeRange: '24h' | '7d' | '30d' | '1y';
  chartType: 'line' | 'bar' | 'area';
  showPrediction?: boolean;
  meterId?: string;
}

// Import Recharts components (add these to package.json if not installed)
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  Area,
  ReferenceLine
} from 'recharts';

export function EnergyUsageChart({ 
  data: propData, 
  timeRange, 
  chartType, 
  showPrediction = false,
  meterId
}: EnergyUsageChartProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedMetric, setSelectedMetric] = React.useState('consumption');
  const [isExporting, setIsExporting] = React.useState(false);
  
  // Fetch analytics data based on time range and meter ID
  const { data: analyticsData, loading, error } = useEnergyAnalytics({
    meterId,
    timeRange,
    includePredicton: showPrediction
  });
  
  // Use prop data or fetched data
  const data = propData || analyticsData || [];
  
  const getChartIcon = () => {
    switch (chartType) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'area': return <Activity className="h-4 w-4" />;
      default: return <LineChart className="h-4 w-4" />;
    }
  };
  
  // Calculate metrics from data
  const metrics = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const currentValue = data[data.length - 1]?.[selectedMetric] || 0;
    const previousValue = data[data.length - 2]?.[selectedMetric] || currentValue;
    const trend = previousValue !== 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;
    
    const total = data.reduce((sum, point) => sum + (point[selectedMetric] || 0), 0);
    const average = total / data.length;
    const max = Math.max(...data.map(point => point[selectedMetric] || 0));
    const min = Math.min(...data.map(point => point[selectedMetric] || 0));
    
    return {
      current: currentValue,
      trend,
      total,
      average,
      max,
      min
    };
  }, [data, selectedMetric]);
  
  // Format timestamp based on time range
  const formatXAxisLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return timestamp;
    }
  };
  
  // Format metric value
  const formatMetricValue = (value: number) => {
    switch (selectedMetric) {
      case 'consumption':
        return `${value.toFixed(1)} kWh`;
      case 'cost':
        return `$${value.toFixed(2)}`;
      case 'efficiency':
        return `${value.toFixed(1)}%`;
      case 'carbon':
        return `${value.toFixed(1)} kg CO₂`;
      default:
        return value.toFixed(1);
    }
  };
  
  // Export chart data
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = data.map(point => ({
        timestamp: point.timestamp,
        [selectedMetric]: point[selectedMetric],
        ...(showPrediction && point.predicted && { predicted: point.predicted })
      }));
      
      const csv = [
        ['Timestamp', selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1), ...(showPrediction ? ['Predicted'] : [])].join(','),
        ...exportData.map(row => [
          row.timestamp,
          row[selectedMetric],
          ...(showPrediction && row.predicted ? [row.predicted] : [])
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-${selectedMetric}-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
            <p className="text-sm text-red-600 mb-2">Failed to load analytics data</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      );
    }
    
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No data available for selected period</p>
          </div>
        </div>
      );
    }
    
    const ChartComponent = chartType === 'line' ? RechartsLineChart : 
                          chartType === 'bar' ? RechartsBarChart : RechartsAreaChart;
    
    return (
      <ResponsiveContainer width="100%" height={320}>
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxisLabel}
            stroke="#888"
            fontSize={12}
          />
          <YAxis 
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => {
              switch (selectedMetric) {
                case 'consumption': return `${value}kWh`;
                case 'cost': return `$${value}`;
                case 'efficiency': return `${value}%`;
                case 'carbon': return `${value}kg`;
                default: return value;
              }
            }}
          />
          <Tooltip 
            formatter={(value, name) => [
              formatMetricValue(Number(value)), 
              name === 'predicted' ? 'Predicted' : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
            ]}
            labelFormatter={(label) => `Time: ${formatXAxisLabel(label)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          
          {chartType === 'line' && (
            <>
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5, fill: '#1d4ed8' }}
              />
              {showPrediction && (
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#6366f1' }}
                />
              )}
            </>
          )}
          
          {chartType === 'bar' && (
            <Bar 
              dataKey={selectedMetric} 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          )}
          
          {chartType === 'area' && (
            <>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorGradient)"
              />
              {showPrediction && (
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#6366f1" 
                  strokeDasharray="5 5"
                  fillOpacity={0.2} 
                  fill="#6366f1"
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <ComponentErrorBoundary componentName="EnergyUsageChart">
      <Card className={cn('transition-all duration-300', isFullscreen && 'fixed inset-4 z-50 max-w-7xl mx-auto')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getChartIcon()}
              <CardTitle className="text-lg">Energy Usage Analysis</CardTitle>
              {showPrediction && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Prediction
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumption">Consumption</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="carbon">Carbon</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            {renderChart()}
            
            {/* Metrics Summary */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatMetricValue(metrics.current)}</div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
                <div className="text-center">
                  <div className={cn('text-lg font-semibold flex items-center justify-center gap-1',
                    metrics.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {metrics.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(metrics.trend).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Change</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatMetricValue(metrics.average)}</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatMetricValue(metrics.max)}</div>
                  <div className="text-xs text-muted-foreground">Peak</div>
                </div>
              </div>
            )}
            
            {/* Chart Controls */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Actual</span>
                </div>
                {showPrediction && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full opacity-60" />
                    <span>Predicted</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExport}
                  disabled={isExporting || !data || data.length === 0}
                >
                  {isExporting ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  Export CSV
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  );
}

// Device Automation Scheduler Component with API Integration
interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  action: 'on' | 'off' | 'auto';
  isActive: boolean;
  deviceId: string;
  repeatWeekly: boolean;
  priority: number;
}

export function DeviceScheduler({ deviceId, onSave }: { deviceId: string; onSave?: () => void }) {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Use automation hook for device schedules
  const { 
    schedules: deviceSchedules, 
    loading: schedulesLoading, 
    error: schedulesError,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleActive
  } = useDeviceAutomation(deviceId);
  
  // Load schedules on component mount
  React.useEffect(() => {
    const loadSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (deviceSchedules) {
          setSchedules(deviceSchedules);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchedules();
  }, [deviceSchedules]);
  
  const addSchedule = async () => {
    const newSchedule: Omit<Schedule, 'id'> = {
      name: 'New Schedule',
      startTime: '09:00',
      endTime: '17:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      action: 'on',
      isActive: true,
      deviceId,
      repeatWeekly: true,
      priority: 1
    };
    
    try {
      setIsCreating(true);
      const created = await createSchedule(newSchedule);
      setSchedules(prev => [...prev, created]);
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setIsCreating(false);
    }
  };

  const removeSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const toggleSchedule = async (scheduleId: string) => {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;
      
      await toggleScheduleActive(scheduleId, !schedule.isActive);
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
      ));
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle schedule');
    }
  };
  
  const updateScheduleDetails = async (scheduleId: string, updates: Partial<Schedule>) => {
    try {
      setIsSaving(true);
      const updated = await updateSchedule(scheduleId, updates);
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, ...updated } : s));
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleDay = async (scheduleId: string, day: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const updatedDays = schedule.days.includes(day) 
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day];
      
    await updateScheduleDetails(scheduleId, { days: updatedDays });
  };

  if (isLoading) {
    return (
      <ComponentErrorBoundary componentName="DeviceScheduler">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Automation Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading schedules...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="DeviceScheduler">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Automation Schedules
              {isSaving && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </CardTitle>
            <Button 
              onClick={addSchedule} 
              size="sm"
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No schedules configured</p>
                <p className="text-sm">Add a schedule to automate device control</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="p-4 border-l-4 border-l-primary/20 hover:border-l-primary/60 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={schedule.isActive} 
                        onCheckedChange={() => toggleSchedule(schedule.id)}
                        size="sm" 
                        disabled={isSaving}
                      />
                      <div className="flex-1">
                        <Input
                          value={schedule.name}
                          onChange={(e) => updateScheduleDetails(schedule.id, { name: e.target.value })}
                          className="font-medium border-none p-0 h-auto focus-visible:ring-0 text-sm"
                          placeholder="Schedule name"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateScheduleDetails(schedule.id, { startTime: e.target.value })}
                            className="text-xs border-none p-0 h-auto focus-visible:ring-0 w-auto"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateScheduleDetails(schedule.id, { endTime: e.target.value })}
                            className="text-xs border-none p-0 h-auto focus-visible:ring-0 w-auto"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={schedule.action} 
                        onValueChange={(value: 'on' | 'off' | 'auto') => 
                          updateScheduleDetails(schedule.id, { action: value })
                        }
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on">Turn On</SelectItem>
                          <SelectItem value="off">Turn Off</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSchedule(schedule.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Days of the week */}
                  <div className="flex gap-1 mb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                      const dayCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][index];
                      const isActive = schedule.days.includes(dayCode);
                      return (
                        <button 
                          key={day}
                          onClick={() => toggleDay(schedule.id, dayCode)}
                          disabled={isSaving}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                            'hover:scale-105 active:scale-95',
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                          )}
                        >
                          {day[0]}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Schedule Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        schedule.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      )} />
                      <span>{schedule.isActive ? 'Active' : 'Inactive'}</span>
                      {schedule.repeatWeekly && (
                        <>
                          <span>•</span>
                          <span>Weekly repeat</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {schedule.priority}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {schedules.length > 0 && (
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Schedules are automatically synchronized with your smart meter system.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  );
}

// Energy Insights & Recommendations Component
export function EnergyInsights() {
  const insights = [
    {
      type: 'saving',
      title: 'Potential Energy Saving',
      description: 'Water heater is consuming 15% more than similar homes',
      impact: 'Save up to $23/month',
      action: 'Adjust temperature to 120°F',
      icon: <Droplets className="h-5 w-5 text-blue-500" />
    },
    {
      type: 'peak',
      title: 'Peak Usage Alert',
      description: 'High energy usage detected between 6-8 PM',
      impact: 'Avoid $12 peak charges',
      action: 'Schedule devices for off-peak hours',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />
    },
    {
      type: 'efficiency',
      title: 'Device Efficiency',
      description: 'Old refrigerator is 40% less efficient',
      impact: 'Upgrade could save $180/year',
      action: 'Consider ENERGY STAR appliance',
      icon: <Target className="h-5 w-5 text-green-500" />
    }
  ];

  return (
    <ComponentErrorBoundary componentName="EnergyInsights">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Energy Insights
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  {insight.icon}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {insight.impact}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      {insight.action}
                    </Button>
                    <Button variant="ghost" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  );
}

// Real-time Power Monitor Component
export function RealTimePowerMonitor() {
  const [currentPower, setCurrentPower] = React.useState(2450);
  const [isRecording, setIsRecording] = React.useState(false);
  
  // Simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPower(prev => {
        const change = (Math.random() - 0.5) * 200;
        return Math.max(0, prev + change);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const powerLevel = currentPower > 3000 ? 'high' : currentPower > 1500 ? 'medium' : 'low';
  const powerColor = {
    low: 'text-green-500',
    medium: 'text-orange-500', 
    high: 'text-red-500'
  }[powerLevel];

  return (
    <ComponentErrorBoundary componentName="RealTimePowerMonitor">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <CardContent className="relative p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className={cn('h-3 w-3 rounded-full animate-pulse', 
                powerLevel === 'high' ? 'bg-red-500' :
                powerLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
              )} />
              <span className="text-sm text-muted-foreground">Live Reading</span>
            </div>
            
            <div className="space-y-2">
              <div className={cn('text-4xl font-bold tabular-nums', powerColor)}>
                {currentPower.toFixed(0)}
                <span className="text-xl font-normal ml-1">W</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Current Power Draw
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">24.5</div>
                <div className="text-xs text-muted-foreground">kWh Today</div>
              </div>
              <div>
                <div className="text-lg font-semibold">$3.42</div>
                <div className="text-xs text-muted-foreground">Cost Today</div>
              </div>
              <div>
                <div className="text-lg font-semibold">92%</div>
                <div className="text-xs text-muted-foreground">Efficiency</div>
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button 
                variant={isRecording ? "destructive" : "default"} 
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  );
}

// Carbon Footprint Tracker Component
export function CarbonFootprintTracker() {
  const carbonData = {
    today: 4.2,
    thisMonth: 126.8,
    lastMonth: 142.3,
    yearToDate: 1847.2,
    goal: 1800
  };
  
  const reduction = ((carbonData.lastMonth - carbonData.thisMonth) / carbonData.lastMonth * 100);
  const goalProgress = (carbonData.yearToDate / carbonData.goal) * 100;

  return (
    <ComponentErrorBoundary componentName="CarbonFootprintTracker">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-green-500" />
            Carbon Footprint
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Today's Impact */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {carbonData.today} kg CO₂
              </div>
              <div className="text-sm text-muted-foreground">Today's Emissions</div>
            </div>
            
            {/* Monthly Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">{carbonData.thisMonth}</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">{carbonData.lastMonth}</div>
                <div className="text-xs text-muted-foreground">Last Month</div>
              </div>
            </div>
            
            {/* Reduction Badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingDown className="h-3 w-3 mr-1" />
                {reduction.toFixed(1)}% Reduction
              </Badge>
            </div>
            
            {/* Annual Goal Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Annual Goal</span>
                <span className="font-medium">
                  {carbonData.yearToDate} / {carbonData.goal} kg CO₂
                </span>
              </div>
              <Progress 
                value={Math.min(goalProgress, 100)} 
                className={cn(
                  'h-2',
                  goalProgress > 100 ? 'bg-red-100' : 'bg-green-100'
                )}
              />
              <div className="text-xs text-center text-muted-foreground">
                {goalProgress > 100 
                  ? `${(goalProgress - 100).toFixed(1)}% over goal`
                  : `${(100 - goalProgress).toFixed(1)}% remaining`
                }
              </div>
            </div>
            
            {/* Tips */}
            <div className="text-center">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-1" />
                Get Reduction Tips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  );
}

export default {
  DeviceCard,
  SmartMeterOverview,
  DeviceManagementDashboard,
  EnergyUsageChart,
  DeviceScheduler,
  EnergyInsights,
  RealTimePowerMonitor,
  CarbonFootprintTracker
};
