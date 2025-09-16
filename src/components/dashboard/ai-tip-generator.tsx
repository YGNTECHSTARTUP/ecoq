'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateEnergySavingTip, type EnergySavingTipInput } from '@/ai/flows/ai-powered-tip-generation';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import { useToast } from '@/hooks/use-toast';

export function AiTipGenerator() {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { smartDevices, quests } = useSimulatedData();
  const { toast } = useToast();

  const handleGenerateTip = async () => {
    setLoading(true);
    setTip(null);
    try {
      const realTimeData = `Current total usage: ${smartDevices.reduce((acc, dev) => acc + dev.currentUsage, 0).toFixed(2)}kW.`;
      const currentQuests = quests.map(q => `${q.title} (Progress: ${q.progress}/${q.target} ${q.unit})`).join(', ');
      const deviceStatus = smartDevices.map(d => `${d.location} (${d.type}): ${d.currentUsage}kW`).join('; ');

      const mockInput: EnergySavingTipInput = {
        realTimeData,
        currentQuests,
        weatherConditions: 'Simulated: Temperature: 32°C, Humidity: 75%, Sunny.',
        deviceStatus,
      };

      const result = await generateEnergySavingTip(mockInput);
      setTip(result.tip);
    } catch (error) {
      console.error('Failed to generate tip:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate an AI tip. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Tip</CardTitle>
        <CardDescription>Get a personalized energy-saving tip from our AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateTip} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Generate New Tip
        </Button>
        {tip && (
          <Alert>
             <Lightbulb className="h-4 w-4" />
            <AlertTitle>Your Tip!</AlertTitle>
            <AlertDescription>{tip}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
