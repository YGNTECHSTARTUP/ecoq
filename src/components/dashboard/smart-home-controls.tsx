'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import { Separator } from '@/components/ui/separator';

export function SmartHomeControls() {
  const { smartDevices } = useSimulatedData();

  const ac = smartDevices.find(d => d.type === 'ac_meter');
  const lights = smartDevices.find(d => d.type === 'light');
  const tvOutlet = smartDevices.find(d => d.type === 'outlet');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Home Controls</CardTitle>
        <CardDescription>Manage your connected devices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ac && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ac-temperature" className="text-base">Living Room AC</Label>
              <span className="text-lg font-bold text-accent">{ac.temperature?.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">18°C</span>
              <Slider
                id="ac-temperature"
                defaultValue={[ac.temperature || 24]}
                max={30}
                min={18}
                step={1}
              />
              <span className="text-sm text-muted-foreground">30°C</span>
            </div>
          </div>
        )}
        
        <Separator />
        
        {lights && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="lights-switch" className="text-base">Bedroom Lights</Label>
              <p className="text-xs text-muted-foreground">Status: {lights.status?.replace('_', ' ')}</p>
            </div>
            <Switch id="lights-switch" defaultChecked={lights.status !== 'off'} />
          </div>
        )}

        <Separator />

        {tvOutlet && (
           <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="tv-outlet-switch" className="text-base">TV Outlet</Label>
              <p className="text-xs text-muted-foreground">Status: {tvOutlet.status}</p>
            </div>
            <Switch id="tv-outlet-switch" defaultChecked={tvOutlet.status === 'on'} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
