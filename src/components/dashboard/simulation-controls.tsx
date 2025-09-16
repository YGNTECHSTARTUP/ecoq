'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import type { SimulationScenario } from '@/lib/types';
import { Zap, Sunrise, Sunset, Moon } from 'lucide-react';

export function SimulationControls() {
  const { handleScenarioChange } = useSimulatedData();

  const scenarios: { name: SimulationScenario; label: string; icon: React.ElementType }[] = [
    { name: 'normal', label: 'Normal', icon: Zap },
    { name: 'morning_peak', label: 'Morning Peak', icon: Sunrise },
    { name: 'evening_peak', label: 'Evening Peak', icon: Sunset },
    { name: 'night_low', label: 'Night Low', icon: Moon },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
        <CardDescription>Trigger different energy usage scenarios.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {scenarios.map(({ name, label, icon: Icon }) => (
          <Button key={name} variant="outline" onClick={() => handleScenarioChange(name)}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
