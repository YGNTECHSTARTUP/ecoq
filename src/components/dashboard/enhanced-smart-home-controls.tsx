'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Power, 
  Thermometer, 
  Lightbulb, 
  Fan, 
  Tv,
  Refrigerator,
  Wifi,
  WifiOff,
  Settings,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Home,
  Activity,
  Signal,
  Battery,
  Gauge
} from 'lucide-react';
import { smartHomeController, type SmartDevice, type Room, type DeviceSchedule, type AutomationRule, type EnergyOptimization } from '@/lib/smart-home-controller';
import { toast } from 'sonner';

const deviceIcons: Record<string, React.ElementType> = {
  ac: Thermometer,
  light: Lightbulb,
  fan: Fan,
  tv: Tv,
  refrigerator: Refrigerator,
  water_heater: Thermometer,
  washing_machine: Activity,
  dishwasher: Activity,
  microwave: Zap,
  router: Wifi
};

const getDeviceIcon = (type: string) => {
  const Icon = deviceIcons[type] || Power;
  return Icon;
};

const getEfficiencyColor = (rating: string) => {
  switch (rating) {
    case 'A++': return 'bg-green-500';
    case 'A+': return 'bg-green-400';
    case 'A': return 'bg-lime-400';
    case 'B': return 'bg-yellow-400';
    case 'C': return 'bg-orange-400';
    case 'D': return 'bg-red-400';
    case 'E': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

interface SmartHomeDashboardProps {
  userId: string;
  className?: string;
}

export function SmartHomeDashboard({ userId, className }: SmartHomeDashboardProps) {
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [optimizations, setOptimizations] = useState<EnergyOptimization[]>([]);
  const [activeTab, setActiveTab] = useState('devices');
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [automationDialog, setAutomationDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<SmartDevice | null>(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    deviceId: '',
    name: '',
    days: [] as number[],
    startTime: '',
    endTime: '',
    action: 'turn_on' as const,
    parameters: {}
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    deviceId: '',
    triggerType: 'time' as const,
    condition: '',
    value: '',
    actionType: 'turn_on' as const,
    actionParameters: {}
  });

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setDevices(smartHomeController.getAllDevices());
    setRooms(smartHomeController.getAllRooms());
    setOptimizations(smartHomeController.generateOptimizations());
  };

  const handleDeviceToggle = async (deviceId: string) => {
    await smartHomeController.toggleDevice(deviceId);
    refreshData();
  };

  const handleTemperatureChange = async (deviceId: string, temperature: number) => {
    await smartHomeController.setDeviceTemperature(deviceId, temperature);
    refreshData();
  };

  const handleBrightnessChange = async (deviceId: string, brightness: number) => {
    await smartHomeController.setDeviceBrightness(deviceId, brightness);
    refreshData();
  };

  const handleEnergySavingToggle = async (deviceId: string) => {
    await smartHomeController.enableEnergySavingMode(deviceId);
    refreshData();
  };

  const createSchedule = async () => {
    if (!scheduleForm.deviceId || !scheduleForm.name || !scheduleForm.startTime || !scheduleForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    await smartHomeController.createSchedule({
      deviceId: scheduleForm.deviceId,
      name: scheduleForm.name,
      days: scheduleForm.days,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      action: scheduleForm.action,
      parameters: scheduleForm.parameters,
      isActive: true,
      repeatWeekly: true
    });

    setScheduleDialog(false);
    setScheduleForm({
      deviceId: '',
      name: '',
      days: [],
      startTime: '',
      endTime: '',
      action: 'turn_on',
      parameters: {}
    });
    refreshData();
  };

  const createAutomation = async () => {
    if (!automationForm.name || !automationForm.deviceId || !automationForm.condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    await smartHomeController.createAutomationRule({
      name: automationForm.name,
      deviceId: automationForm.deviceId,
      trigger: {
        type: automationForm.triggerType,
        condition: automationForm.condition,
        value: automationForm.value
      },
      action: {
        type: automationForm.actionType,
        parameters: automationForm.actionParameters
      },
      isActive: true,
      priority: 5
    });

    setAutomationDialog(false);
    setAutomationForm({
      name: '',
      deviceId: '',
      triggerType: 'time',
      condition: '',
      value: '',
      actionType: 'turn_on',
      actionParameters: {}
    });
    refreshData();
  };

  const filteredDevices = selectedRoom === 'all' 
    ? devices 
    : devices.filter(device => device.room === selectedRoom);

  const totalPowerConsumption = smartHomeController.getTotalPowerConsumption();
  const dailyEnergyConsumption = smartHomeController.getDailyEnergyConsumption();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Power</p>
                <p className="text-2xl font-bold">{(totalPowerConsumption / 1000).toFixed(1)} kW</p>
              </div>
              <Gauge className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Energy</p>
                <p className="text-2xl font-bold">{dailyEnergyConsumption.toFixed(1)} kWh</p>
              </div>
              <Battery className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">{devices.filter(d => d.isOn).length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Devices</p>
                <p className="text-2xl font-bold">{devices.filter(d => d.isOnline).length}/{devices.length}</p>
              </div>
              <Signal className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Controls */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map(device => {
              const Icon = getDeviceIcon(device.type);
              return (
                <Card key={device.id} className={`transition-all hover:shadow-md ${device.isOn ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${device.isOn ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div>
                          <CardTitle className="text-sm">{device.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {device.room.replace('_', ' ')} • {device.brand}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {device.isOnline ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <Badge className={getEfficiencyColor(device.efficiencyRating)} variant="secondary">
                          {device.efficiencyRating}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Power Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Power Usage</p>
                        <p className="font-medium">{device.currentPowerUsage.toFixed(0)}W</p>
                      </div>
                      <Switch
                        checked={device.isOn}
                        onCheckedChange={() => handleDeviceToggle(device.id)}
                        disabled={!device.isOnline}
                      />
                    </div>

                    {/* Device-specific Controls */}
                    {device.type === 'ac' && device.targetTemperature && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Temperature</Label>
                          <span className="text-xs">{device.targetTemperature}°C</span>
                        </div>
                        <Slider
                          value={[device.targetTemperature]}
                          onValueChange={([temp]) => handleTemperatureChange(device.id, temp)}
                          min={16}
                          max={30}
                          step={1}
                          disabled={!device.isOn || !device.isOnline}
                        />
                      </div>
                    )}

                    {device.type === 'light' && device.brightness !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Brightness</Label>
                          <span className="text-xs">{device.brightness}%</span>
                        </div>
                        <Slider
                          value={[device.brightness]}
                          onValueChange={([brightness]) => handleBrightnessChange(device.id, brightness)}
                          min={0}
                          max={100}
                          step={1}
                          disabled={!device.isOn || !device.isOnline}
                        />
                      </div>
                    )}

                    {device.type === 'fan' && device.speed && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Speed Level</Label>
                          <span className="text-xs">{device.speed}/5</span>
                        </div>
                        <Slider
                          value={[device.speed]}
                          onValueChange={([speed]) => {
                            // You would implement this method
                            toast.success(`Fan speed set to ${speed}`);
                          }}
                          min={1}
                          max={5}
                          step={1}
                          disabled={!device.isOn || !device.isOnline}
                        />
                      </div>
                    )}

                    {/* Energy Saving Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-green-500" />
                        <Label className="text-xs">Energy Saving</Label>
                      </div>
                      <Switch
                        checked={device.energySavingMode}
                        onCheckedChange={() => handleEnergySavingToggle(device.id)}
                        disabled={!device.isOnline}
                      />
                    </div>

                    {/* Daily Energy Usage */}
                    <div className="text-xs text-muted-foreground">
                      Today: {device.dailyEnergyUsage.toFixed(1)} kWh • 
                      Signal: {device.signalStrength}%
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <Card key={room.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <CardDescription>{room.area} sq ft</CardDescription>
                      </div>
                    </div>
                    <Badge variant={room.occupancy ? "default" : "secondary"}>
                      {room.occupancy ? "Occupied" : "Empty"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Conditions */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Temp</p>
                      <p className="font-medium">{room.temperature?.toFixed(1)}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="font-medium">{room.humidity?.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Light</p>
                      <p className="font-medium">{room.lightLevel?.toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Room Devices */}
                  <div>
                    <p className="text-sm font-medium mb-2">Devices ({room.devices.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {room.devices.map(deviceId => {
                        const device = devices.find(d => d.id === deviceId);
                        if (!device) return null;
                        const Icon = getDeviceIcon(device.type);
                        return (
                          <Badge 
                            key={deviceId} 
                            variant={device.isOn ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            <Icon className="h-3 w-3" />
                            {device.name.split(' ')[0]}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Power Consumption */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Power Usage:</span>
                      <span className="text-sm font-medium">
                        {room.devices.reduce((total, deviceId) => {
                          const device = devices.find(d => d.id === deviceId);
                          return total + (device?.currentPowerUsage || 0);
                        }, 0).toFixed(0)}W
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Smart Automation</h3>
            <div className="flex gap-2">
              <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Schedule</DialogTitle>
                    <DialogDescription>
                      Set up automatic device control based on time
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Device</Label>
                      <Select value={scheduleForm.deviceId} onValueChange={(value) => 
                        setScheduleForm(prev => ({ ...prev, deviceId: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {devices.map(device => (
                            <SelectItem key={device.id} value={device.id}>
                              {device.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Schedule Name</Label>
                      <Input
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Morning AC Schedule"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Action</Label>
                      <Select value={scheduleForm.action} onValueChange={(value: any) => 
                        setScheduleForm(prev => ({ ...prev, action: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="turn_on">Turn On</SelectItem>
                          <SelectItem value="turn_off">Turn Off</SelectItem>
                          <SelectItem value="set_temperature">Set Temperature</SelectItem>
                          <SelectItem value="set_brightness">Set Brightness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setScheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createSchedule}>Create Schedule</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={automationDialog} onOpenChange={setAutomationDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Automation Rule</DialogTitle>
                    <DialogDescription>
                      Automate devices based on conditions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rule Name</Label>
                      <Input
                        value={automationForm.name}
                        onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Turn off AC when empty"
                      />
                    </div>
                    <div>
                      <Label>Device</Label>
                      <Select value={automationForm.deviceId} onValueChange={(value) => 
                        setAutomationForm(prev => ({ ...prev, deviceId: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {devices.map(device => (
                            <SelectItem key={device.id} value={device.id}>
                              {device.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Input
                        value={automationForm.condition}
                        onChange={(e) => setAutomationForm(prev => ({ ...prev, condition: e.target.value }))}
                        placeholder="occupancy = false"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAutomationDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createAutomation}>Create Rule</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No automation rules created yet</p>
            <p className="text-sm">Create schedules and automation rules to optimize energy usage</p>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimize" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Energy Optimization Recommendations</h3>
            {optimizations.map((opt, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          opt.difficulty === 'easy' ? 'default' : 
                          opt.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {opt.difficulty}
                        </Badge>
                        <Badge variant="outline">{opt.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{opt.recommendation}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex gap-4">
                          <span>💡 Save: {opt.potentialSavings.toFixed(1)} kWh/day</span>
                          <span>💰 Save: ₹{opt.costSavings.toFixed(0)}/month</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {optimizations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                <p className="font-medium">Great job! No optimization recommendations</p>
                <p className="text-sm">Your devices are running efficiently</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}