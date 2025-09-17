'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Power,
  Gauge,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import SmartMeterAPI, { 
  SMART_METER_PROVIDERS, 
  detectProvider, 
  SmartMeterReading,
  SmartMeterProvider 
} from '@/lib/smart-meter-apis';

interface SmartMeterState {
  isConnected: boolean;
  provider: SmartMeterProvider | null;
  consumerId: string;
  currentReading: SmartMeterReading | null;
  historicalData: SmartMeterReading[];
  realTimeData: any;
  billingInfo: any;
  isLoading: boolean;
  error: string | null;
  credentials: any;
}

interface RealTimeMetrics {
  instantPower: number;
  voltage: number;
  current: number;
  frequency: number;
  powerFactor: number;
  timestamp: string;
}

const SmartMeterIntegration: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState<SmartMeterState>({
    isConnected: false,
    provider: null,
    consumerId: '',
    currentReading: null,
    historicalData: [],
    realTimeData: null,
    billingInfo: null,
    isLoading: false,
    error: null,
    credentials: {}
  });

  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [connectionForm, setConnectionForm] = useState({
    consumerId: '',
    apiKey: '',
    username: '',
    password: '',
    clientId: '',
    clientSecret: ''
  });

  useEffect(() => {
    // Auto-connect if credentials are available
    const savedConnection = localStorage.getItem('smartmeter_connection');
    if (savedConnection) {
      const connection = JSON.parse(savedConnection);
      connectToMeter(connection.providerId, connection.credentials, connection.consumerId);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isConnected && state.provider?.supportedFeatures.includes('realtime')) {
      // Fetch real-time data every 30 seconds
      interval = setInterval(() => {
        fetchRealTimeData();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isConnected, state.provider]);

  const connectToMeter = async (providerId?: string, credentials?: any, consumerId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const providerToUse = providerId || selectedProvider;
      const credentialsToUse = credentials || connectionForm;
      const consumerIdToUse = consumerId || connectionForm.consumerId;

      if (!providerToUse || !consumerIdToUse) {
        throw new Error('Please select a provider and enter your consumer ID');
      }

      // Auto-detect provider if not specified
      const detectedProvider = providerToUse || detectProvider(consumerIdToUse, 'Hyderabad');
      const provider = SMART_METER_PROVIDERS.find(p => p.id === detectedProvider);

      if (!provider) {
        throw new Error('Provider not supported');
      }

      const api = new SmartMeterAPI(detectedProvider, credentialsToUse);

      // Test connection by fetching current reading
      const currentReading = await api.getCurrentReading(consumerIdToUse);
      
      // Fetch additional data
      const [historicalData, billingInfo] = await Promise.all([
        api.getHistoricalReadings(
          consumerIdToUse,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
          new Date().toISOString().split('T')[0]
        ),
        api.getBillingInfo(consumerIdToUse)
      ]);

      let realTimeData = null;
      if (provider.supportedFeatures.includes('realtime')) {
        realTimeData = await api.getRealTimeConsumption(consumerIdToUse);
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        provider,
        consumerId: consumerIdToUse,
        currentReading,
        historicalData,
        billingInfo,
        realTimeData,
        isLoading: false,
        credentials: credentialsToUse
      }));

      // Save connection for auto-reconnect
      localStorage.setItem('smartmeter_connection', JSON.stringify({
        providerId: detectedProvider,
        credentials: credentialsToUse,
        consumerId: consumerIdToUse
      }));

      toast({
        title: 'Connected Successfully! ⚡',
        description: `Connected to ${provider.name} smart meter.`,
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect to smart meter'
      }));

      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message || 'Could not connect to smart meter. Using demo data.',
      });
    }
  };

  const fetchRealTimeData = async () => {
    if (!state.isConnected || !state.provider || !state.consumerId) return;

    try {
      const api = new SmartMeterAPI(state.provider.id, state.credentials);
      const realTimeData = await api.getRealTimeConsumption(state.consumerId);
      
      setState(prev => ({
        ...prev,
        realTimeData
      }));

    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  const refreshData = async () => {
    if (!state.isConnected) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const api = new SmartMeterAPI(state.provider!.id, state.credentials);
      
      const [currentReading, billingInfo] = await Promise.all([
        api.getCurrentReading(state.consumerId),
        api.getBillingInfo(state.consumerId)
      ]);

      setState(prev => ({
        ...prev,
        currentReading,
        billingInfo,
        isLoading: false
      }));

      toast({
        title: 'Data Refreshed! 🔄',
        description: 'Smart meter data has been updated.',
      });

    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: error.message || 'Could not refresh data.'
      });
    }
  };

  const disconnect = () => {
    setState({
      isConnected: false,
      provider: null,
      consumerId: '',
      currentReading: null,
      historicalData: [],
      realTimeData: null,
      billingInfo: null,
      isLoading: false,
      error: null,
      credentials: {}
    });
    
    localStorage.removeItem('smartmeter_connection');
    
    toast({
      title: 'Disconnected',
      description: 'Smart meter connection has been closed.',
    });
  };

  const formatPower = (watts: number) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(2)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  const getConnectionStatus = () => {
    if (state.isLoading) return { icon: RefreshCw, color: 'text-blue-500', text: 'Connecting...' };
    if (state.isConnected) return { icon: Wifi, color: 'text-green-500', text: 'Connected' };
    return { icon: WifiOff, color: 'text-gray-500', text: 'Disconnected' };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  if (!state.isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Smart Meter Connection
            </CardTitle>
            <CardDescription>
              Connect to your electricity provider's smart meter API to get real-time energy data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {SMART_METER_PROVIDERS.map((provider) => (
                <Card 
                  key={provider.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedProvider === provider.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold text-sm">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {provider.regions[0]}
                      {provider.regions.length > 1 && ` +${provider.regions.length - 1}`}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {provider.authType}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="consumerId">Consumer ID</Label>
                <Input
                  id="consumerId"
                  placeholder="e.g., TP123456789"
                  value={connectionForm.consumerId}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, consumerId: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find this on your electricity bill
                </p>
              </div>

              {selectedProvider && (
                <div className="space-y-4">
                  {SMART_METER_PROVIDERS.find(p => p.id === selectedProvider)?.authType === 'apiKey' && (
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Your API key"
                        value={connectionForm.apiKey}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                  )}

                  {['basic', 'jwt'].includes(SMART_METER_PROVIDERS.find(p => p.id === selectedProvider)?.authType || '') && (
                    <>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Username"
                          value={connectionForm.username}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password"
                          value={connectionForm.password}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  {SMART_METER_PROVIDERS.find(p => p.id === selectedProvider)?.authType === 'oauth' && (
                    <>
                      <div>
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          placeholder="OAuth Client ID"
                          value={connectionForm.clientId}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, clientId: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          placeholder="OAuth Client Secret"
                          value={connectionForm.clientSecret}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <Button 
                onClick={() => connectToMeter()} 
                disabled={state.isLoading || !connectionForm.consumerId}
                className="w-full"
              >
                {state.isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {state.isLoading ? 'Connecting...' : 'Connect to Smart Meter'}
              </Button>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => connectToMeter('genus', {}, 'DEMO123456')}
                  className="text-sm"
                >
                  Try Demo Connection
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Use demo data to explore features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-5 w-5 ${status.color} ${state.isLoading ? 'animate-spin' : ''}`} />
              <div>
                <CardTitle className="text-lg">{state.provider?.name}</CardTitle>
                <CardDescription>
                  Consumer ID: {state.consumerId} • {status.text}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={state.isLoading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={disconnect}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      {state.realTimeData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div className="text-sm text-muted-foreground">Instant Power</div>
              </div>
              <div className="text-2xl font-bold">
                {formatPower(state.realTimeData.instantPower)}
              </div>
              <div className="text-xs text-muted-foreground">Live</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-green-500" />
                <div className="text-sm text-muted-foreground">Voltage</div>
              </div>
              <div className="text-2xl font-bold">
                {state.realTimeData.voltage.toFixed(1)}V
              </div>
              <div className="text-xs text-muted-foreground">RMS</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <div className="text-2xl font-bold">
                {state.realTimeData.current.toFixed(1)}A
              </div>
              <div className="text-xs text-muted-foreground">RMS</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 text-purple-500" />
                <div className="text-sm text-muted-foreground">Power Factor</div>
              </div>
              <div className="text-2xl font-bold">
                {state.realTimeData.powerFactor.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Cos φ</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <div className="text-sm text-muted-foreground">Frequency</div>
              </div>
              <div className="text-2xl font-bold">
                {state.realTimeData.frequency.toFixed(1)}Hz
              </div>
              <div className="text-xs text-muted-foreground">Grid</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Reading</CardTitle>
                <CardDescription>Latest meter reading</CardDescription>
              </CardHeader>
              <CardContent>
                {state.currentReading && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Current Reading</span>
                      <span className="font-bold">{state.currentReading.currentReading.toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Units Consumed</span>
                      <span className="font-bold text-blue-600">{state.currentReading.unitsConsumed} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tariff Rate</span>
                      <span>₹{state.currentReading.tariffRate}/unit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estimated Bill</span>
                      <span className="font-bold text-green-600">₹{state.currentReading.billAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Power quality parameters</CardDescription>
              </CardHeader>
              <CardContent>
                {state.currentReading && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Power Factor</span>
                        <span className="text-sm font-medium">{((state.currentReading.powerFactor || 0.85) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(state.currentReading.powerFactor || 0.85) * 100} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold">{state.currentReading.voltage?.r.toFixed(0) || '230'}V</div>
                        <div className="text-muted-foreground">R Phase</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{state.currentReading.voltage?.y.toFixed(0) || '235'}V</div>
                        <div className="text-muted-foreground">Y Phase</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{state.currentReading.voltage?.b.toFixed(0) || '228'}V</div>
                        <div className="text-muted-foreground">B Phase</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Consumption Trend</CardTitle>
              <CardDescription>Energy consumption over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {state.historicalData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={state.historicalData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [`${value} units`, 'Consumption']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="unitsConsumed" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Bill</CardTitle>
              <CardDescription>Latest billing information</CardDescription>
            </CardHeader>
            <CardContent>
              {state.billingInfo && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Bill Amount</div>
                      <div className="text-sm text-muted-foreground">Due: {new Date(state.billingInfo.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{state.billingInfo.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Units Consumed</div>
                      <div className="font-semibold">{state.billingInfo.unitsConsumed} units</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bill Status</div>
                      <Badge variant={state.billingInfo.status === 'paid' ? 'default' : 'destructive'}>
                        {state.billingInfo.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Energy Charges</span>
                      <span>₹{(state.billingInfo.unitsConsumed * state.billingInfo.tariffDetails.rate).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Charges</span>
                      <span>₹{state.billingInfo.tariffDetails.fixedCharge}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Amount</span>
                      <span>₹{state.billingInfo.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Pattern</CardTitle>
                <CardDescription>Average daily consumption by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { day: 'Mon', consumption: 35 },
                    { day: 'Tue', consumption: 42 },
                    { day: 'Wed', consumption: 38 },
                    { day: 'Thu', consumption: 45 },
                    { day: 'Fri', consumption: 40 },
                    { day: 'Sat', consumption: 55 },
                    { day: 'Sun', consumption: 50 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value} units`, 'Avg. Consumption']} />
                    <Bar dataKey="consumption" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Your energy usage insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Monthly Average</span>
                  <span className="font-semibold">1,250 units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cost per Unit</span>
                  <span className="font-semibold">₹6.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Peak Demand</span>
                  <span className="font-semibold">{(state.currentReading?.maxDemand || 8).toFixed(1)} kW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Load Factor</span>
                  <span className="font-semibold">0.75</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartMeterIntegration;