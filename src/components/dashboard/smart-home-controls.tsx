'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSmartMeterDashboard } from '@/hooks/use-smart-meter-dashboard';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Zap, Thermometer, Lightbulb, Tv } from 'lucide-react';

export function SmartHomeControls() {
  const { state, actions } = useSmartMeterDashboard();
  const { connectedDevices, loading, error } = state;

  const ac = connectedDevices.find(d => d.type === 'ac_meter');
  const lights = connectedDevices.find(d => d.type === 'light');
  const tvOutlet = connectedDevices.find(d => d.type === 'outlet');

  if (loading) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Smart Home Controls</CardTitle>
                <CardDescription>Manage your connected devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <Separator/>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                </div>
                 <Separator/>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                </div>
            </CardContent>
        </Card>
      )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Home Controls
          </CardTitle>
          <CardDescription>Unable to connect to smart meter system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Home Controls
          <Badge variant="secondary" className="ml-auto">
            {connectedDevices.length} devices
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time control of your connected appliances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ac && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <Label htmlFor="ac-temperature" className="text-base">{ac.brand} AC</Label>
                <Badge variant={ac.isOnline ? 'default' : 'secondary'} className="text-xs">
                  {ac.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-accent">{ac.temperature?.toFixed(1)}°C</span>
                <p className="text-xs text-muted-foreground">{ac.currentUsage?.toFixed(2)} kW</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">18°C</span>
              <Slider
                id="ac-temperature"
                defaultValue={[ac.temperature || 24]}
                max={30}
                min={18}
                step={1}
                disabled={!ac.isOnline}
                onValueChange={(value) => {
                  // In a real app, this would update the device temperature
                  console.log('AC temperature changed to:', value[0]);
                }}
              />
              <span className="text-sm text-muted-foreground">30°C</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Daily: {ac.dailyUsage?.toFixed(1)} kWh</div>
              <div>Monthly: {ac.monthlyUsage?.toFixed(1)} kWh</div>
            </div>
          </div>
        )}
        
        <Separator />
        
        {lights && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="lights-switch" className="text-base">{lights.brand} Lights</Label>
                <Badge variant={lights.isOnline ? 'default' : 'secondary'} className="text-xs">
                  {lights.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Status: {lights.status?.replace('_', ' ')}</span>
                <span>{lights.currentUsage?.toFixed(3)} kW</span>
              </div>
            </div>
            <Switch 
              id="lights-switch" 
              defaultChecked={lights.status !== 'off'} 
              disabled={!lights.isOnline}
              onCheckedChange={(checked) => {
                console.log('Lights switched:', checked ? 'on' : 'off');
              }}
            />
          </div>
        )}

        <Separator />

        {tvOutlet && (
           <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-purple-500" />
                <Label htmlFor="tv-outlet-switch" className="text-base">{tvOutlet.brand} Outlet</Label>
                <Badge variant={tvOutlet.isOnline ? 'default' : 'secondary'} className="text-xs">
                  {tvOutlet.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Status: {tvOutlet.status}</span>
                <span>{tvOutlet.currentUsage?.toFixed(3)} kW</span>
              </div>
            </div>
            <Switch 
              id="tv-outlet-switch" 
              defaultChecked={tvOutlet.status === 'on'} 
              disabled={!tvOutlet.isOnline}
              onCheckedChange={(checked) => {
                console.log('TV Outlet switched:', checked ? 'on' : 'off');
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
