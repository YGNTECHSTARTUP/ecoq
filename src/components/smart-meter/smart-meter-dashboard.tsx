/**
 * Comprehensive Smart Meter Dashboard
 * 
 * Main dashboard integrating all enhanced smart meter components with
 * advanced filtering, search, and layout customization capabilities.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SmartMeterOverview,
  DeviceManagementDashboard,
  EnergyUsageChart,
  DeviceScheduler,
  EnergyInsights,
  RealTimePowerMonitor,
  CarbonFootprintTracker,
  DeviceCard
} from './enhanced-smart-meter-components';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { 
  DataState,
  LoadingOverlay,
  CardSkeleton 
} from '@/components/ui/enhanced-loading';
import {
  Search,
  Filter,
  Settings,
  Download,
  Share2,
  RefreshCw,
  Grid3X3,
  List,
  MoreVertical,
  Calendar,
  Clock,
  Zap,
  Home,
  BarChart3,
  Target,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Maximize2,
  Bell,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartMeter, useSmartMeterStats } from '@/hooks/useSmartMeter';

// Enhanced Dashboard Layout Types
interface DashboardLayout {
  id: string;
  name: string;
  layout: 'grid' | 'masonry' | 'compact' | 'detailed';
  components: string[];
}

interface FilterOptions {
  timeRange: '1h' | '24h' | '7d' | '30d' | '1y';
  deviceTypes: string[];
  locations: string[];
  status: 'all' | 'online' | 'offline' | 'active';
  sortBy: 'name' | 'usage' | 'efficiency' | 'status';
  sortOrder: 'asc' | 'desc';
}

// Main Dashboard Component
export function SmartMeterDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedLayout, setSelectedLayout] = React.useState<DashboardLayout['id']>('default');
  const [filters, setFilters] = React.useState<FilterOptions>({
    timeRange: '24h',
    deviceTypes: [],
    locations: [],
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { devices, meters, loading, error, refreshData } = useSmartMeter();
  const stats = useSmartMeterStats();

  // Predefined dashboard layouts
  const dashboardLayouts: DashboardLayout[] = [
    {
      id: 'default',
      name: 'Default View',
      layout: 'grid',
      components: ['overview', 'realtime', 'devices', 'insights']
    },
    {
      id: 'monitoring',
      name: 'Monitoring Focus',
      layout: 'detailed',
      components: ['realtime', 'chart', 'overview', 'carbon']
    },
    {
      id: 'management',
      name: 'Device Management',
      layout: 'compact',
      components: ['devices', 'scheduler', 'insights', 'overview']
    },
    {
      id: 'analytics',
      name: 'Analytics View',
      layout: 'masonry',
      components: ['chart', 'insights', 'carbon', 'realtime', 'overview']
    }
  ];

  const currentLayout = dashboardLayouts.find(l => l.id === selectedLayout) || dashboardLayouts[0];

  // Filter devices based on search and filters
  const filteredDevices = React.useMemo(() => {
    let filtered = devices || [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(device => 
        device.info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.info?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.info?.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Device type filter
    if (filters.deviceTypes.length > 0) {
      filtered = filtered.filter(device => 
        filters.deviceTypes.includes(device.info?.type)
      );
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(device => 
        filters.locations.includes(device.info?.location)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(device => {
        switch (filters.status) {
          case 'online': return device.status?.isOnline;
          case 'offline': return !device.status?.isOnline;
          case 'active': return device.status?.isActive;
          default: return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'name':
          aValue = a.info?.name || '';
          bValue = b.info?.name || '';
          break;
        case 'usage':
          aValue = a.statistics?.averagePowerUsage || 0;
          bValue = b.statistics?.averagePowerUsage || 0;
          break;
        case 'efficiency':
          aValue = a.status?.healthScore || 0;
          bValue = b.status?.healthScore || 0;
          break;
        case 'status':
          aValue = a.status?.isOnline ? 1 : 0;
          bValue = b.status?.isOnline ? 1 : 0;
          break;
        default:
          return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [devices, searchQuery, filters]);

  // Component renderer based on layout
  const renderComponent = (componentId: string) => {
    switch (componentId) {
      case 'overview':
        return <SmartMeterOverview key="overview" />;
      case 'realtime':
        return <RealTimePowerMonitor key="realtime" />;
      case 'chart':
        return (
          <EnergyUsageChart 
            key="chart"
            data={[]} 
            timeRange={filters.timeRange} 
            chartType="line" 
            showPrediction={true}
          />
        );
      case 'devices':
        return <DeviceManagementDashboard key="devices" />;
      case 'scheduler':
        return <DeviceScheduler key="scheduler" deviceId="default" />;
      case 'insights':
        return <EnergyInsights key="insights" />;
      case 'carbon':
        return <CarbonFootprintTracker key="carbon" />;
      default:
        return null;
    }
  };

  // Layout renderer
  const renderLayout = () => {
    const components = currentLayout.components.map(renderComponent);
    
    switch (currentLayout.layout) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {components}
          </div>
        );
      case 'masonry':
        return (
          <div className="columns-1 lg:columns-2 xl:columns-3 gap-6">
            {components.map((component, index) => (
              <div key={index} className="break-inside-avoid mb-6">
                {component}
              </div>
            ))}
          </div>
        );
      case 'compact':
        return (
          <div className="space-y-4">
            {components}
          </div>
        );
      case 'detailed':
        return (
          <div className="space-y-6">
            {components}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-6">
            {components}
          </div>
        );
    }
  };

  return (
    <ComponentErrorBoundary componentName="SmartMeterDashboard">
      <div className={cn(
        'min-h-screen bg-background',
        isFullscreen && 'fixed inset-0 z-50 overflow-auto'
      )}>
        {/* Dashboard Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Smart Meter Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time energy monitoring and device management
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{stats.onlineDevices} Online</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">2.4 kW</span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {/* Layout Selector */}
                <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardLayouts.map(layout => (
                      <SelectItem key={layout.id} value={layout.id}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Range</label>
                    <Select 
                      value={filters.timeRange} 
                      onValueChange={(value: FilterOptions['timeRange']) => 
                        setFilters(prev => ({ ...prev, timeRange: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Device Status</label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value: FilterOptions['status']) => 
                        setFilters(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="online">Online Only</SelectItem>
                        <SelectItem value="offline">Offline Only</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value: FilterOptions['sortBy']) => 
                        setFilters(prev => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="usage">Power Usage</SelectItem>
                        <SelectItem value="efficiency">Efficiency</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value: FilterOptions['sortOrder']) => 
                        setFilters(prev => ({ ...prev, sortOrder: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DataState
                loading={loading}
                error={error}
                data={meters}
                loadingSkeleton={<CardSkeleton />}
                errorMessage="Failed to load dashboard data"
                emptyMessage="No meters found"
              >
                {renderLayout()}
              </DataState>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <EnergyUsageChart 
                    data={[]} 
                    timeRange={filters.timeRange} 
                    chartType="line" 
                    showPrediction={true}
                  />
                </div>
                <div className="space-y-6">
                  <RealTimePowerMonitor />
                  <CarbonFootprintTracker />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="devices" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevices.map(device => (
                  <DeviceCard 
                    key={device.id}
                    device={device}
                    variant="default"
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDevices.slice(0, 4).map(device => (
                  <DeviceScheduler 
                    key={device.id}
                    deviceId={device.id}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnergyInsights />
                <CarbonFootprintTracker />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}

export default SmartMeterDashboard;