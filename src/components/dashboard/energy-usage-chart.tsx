'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulatedData } from '@/hooks/use-simulated-data';

export function EnergyUsageChart() {
  const { energyUsage } = useSimulatedData();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Energy Usage - Last 24 Hours</CardTitle>
        <CardDescription>
          Total consumption overview by hour.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pl-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={energyUsage}>
             <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} kWh`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ 
                background: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
