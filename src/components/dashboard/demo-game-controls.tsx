'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Zap, 
  Lightbulb, 
  Tv, 
  Wind, 
  Waves, 
  Coffee, 
  Car, 
  ArrowUp, 
  ArrowDown, 
  Shuffle,
  Trophy,
  Target,
  CheckCircle,
  Loader2,
  TrendingUp,
  Award,
  Clock,
  Power,
  Cpu,
  Refrigerator,
  WashingMachine,
  Thermometer,
  Microwave,
  Sun,
  Battery,
  Fan
} from 'lucide-react';
import { useDemoGame, type QuickActionType } from '@/hooks/use-demo-game';

interface DemoGameControlsProps {
  consumerId?: string;
  className?: string;
}

export function DemoGameControls({ consumerId = 'DEMO123456', className }: DemoGameControlsProps) {
  const [activeTab, setActiveTab] = useState('appliances');
  
  const {
    gameState,
    isLoading,
    error,
    isDemoConsumer,
    toggleAppliance,
    upgradeAppliance,
    executeQuickAction,
    activeQuestCount,
    completedQuestCount,
    totalScore,
    currentPower,
    activeAppliances,
  } = useDemoGame(consumerId);

  if (!isDemoConsumer) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Demo Gaming Mode
          </CardTitle>
          <CardDescription>
            Gaming features are only available for demo consumers (Consumer IDs starting with "DEMO")
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleAplianceToggle = async (applianceId: string) => {
    const result = await toggleAppliance(applianceId);
    if (result.success) {
      toast.success(result.message);
      if (result.scoreChange) {
        toast.success(`+${result.scoreChange} points!`);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleApplianceUpgrade = async (applianceId: string) => {
    const result = await upgradeAppliance(applianceId);
    if (result.success) {
      toast.success(result.message);
      if (result.scoreChange) {
        toast.success(`+${result.scoreChange} points!`);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleQuickAction = async (actionType: QuickActionType) => {
    const result = await executeQuickAction(actionType);
    if (result.success) {
      toast.success(result.message);
      if (result.scoreChange) {
        toast.success(`+${result.scoreChange} points!`);
      }
    } else {
      toast.error(result.message);
    }
  };

  const getApplianceIcon = (category: string, name: string) => {
    switch (category) {
      case 'lighting': return <Lightbulb className="h-4 w-4" />;
      case 'cooling': return name.includes('Fan') ? <Fan className="h-4 w-4" /> : <Thermometer className="h-4 w-4" />;
      case 'heating': return <Thermometer className="h-4 w-4" />;
      case 'electronics': 
        if (name.includes('TV')) return <Tv className="h-4 w-4" />;
        if (name.includes('Computer')) return <Cpu className="h-4 w-4" />;
        return <Zap className="h-4 w-4" />;
      case 'appliances':
        if (name.includes('Refrigerator')) return <Refrigerator className="h-4 w-4" />;
        if (name.includes('Washing')) return <WashingMachine className="h-4 w-4" />;
        if (name.includes('Microwave')) return <Microwave className="h-4 w-4" />;
        return <Power className="h-4 w-4" />;
      default: return <Power className="h-4 w-4" />;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 3) return 'text-green-600 bg-green-100';
    if (efficiency === 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading || !gameState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading demo game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading game: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Game Status Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">🎮 EcoQuest Demo Game</CardTitle>
              <CardDescription className="text-white/90">
                Interactive smart meter simulation • Control your virtual home
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalScore} pts</div>
              <div className="text-sm opacity-90">Game Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Zap className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{Math.round(currentPower * 1000)}W</div>
              <div className="text-sm opacity-90">Current Power</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{gameState.totalEnergyConsumed.toFixed(1)} kWh</div>
              <div className="text-sm opacity-90">Total Usage</div>
            </div>
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{activeQuestCount}</div>
              <div className="text-sm opacity-90">Active Quests</div>
            </div>
            <div className="text-center">
              <Award className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{completedQuestCount}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest Status */}
      {gameState.quests.active.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Quests
            </CardTitle>
            <CardDescription>Complete these challenges to earn points!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameState.quests.active.map((quest) => (
              <div key={quest.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{quest.title}</h4>
                    <p className="text-sm text-muted-foreground">{quest.description}</p>
                  </div>
                  <Badge variant="secondary">+{quest.reward} pts</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((quest.progress / quest.target) * 100)}%</span>
                  </div>
                  <Progress value={(quest.progress / quest.target) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Current: {quest.progress} / Target: {quest.target}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Game Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appliances">🏠 Appliances</TabsTrigger>
          <TabsTrigger value="actions">⚡ Quick Actions</TabsTrigger>
          <TabsTrigger value="stats">📄 Statistics</TabsTrigger>
        </TabsList>

        {/* Appliances Tab */}
        <TabsContent value="appliances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Home Appliances</CardTitle>
              <CardDescription>Control your appliances to see real-time changes in power consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.values(gameState.appliances).map((appliance) => (
                  <div
                    key={appliance.id}
                    className={`p-3 rounded-lg border ${
                      appliance.isOn ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getApplianceIcon(appliance.category, appliance.name)}
                        <div>
                          <h4 className={`font-medium ${appliance.isOn ? 'text-green-800' : 'text-gray-600'}`}>
                            {appliance.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{appliance.powerUsage}W</span>
                            <Badge size="sm" className={getEfficiencyColor(appliance.efficiencyLevel)}>
                              Level {appliance.efficiencyLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          appliance.isOn ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {appliance.isOn ? 'ON' : 'OFF'}
                        </div>
                        <Button
                          size="sm"
                          variant={appliance.isOn ? 'destructive' : 'default'}
                          onClick={() => handleAplianceToggle(appliance.id)}
                          disabled={isLoading}
                        >
                          {appliance.isOn ? 'Turn Off' : 'Turn On'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplianceUpgrade(appliance.id)}
                          disabled={isLoading}
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Energy Intensive Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <ArrowUp className="h-5 w-5" />
                  High Energy Usage
                </CardTitle>
                <CardDescription>Simulate high energy consumption scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-3"
                  variant="destructive"
                  onClick={() => handleQuickAction('high_usage_simulation')}
                  disabled={isLoading}
                >
                  <Zap className="h-4 w-4" />
                  Start High Usage Mode
                  <span className="ml-auto text-xs">+500W</span>
                </Button>
              </CardContent>
            </Card>

            {/* Energy Saving Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <ArrowDown className="h-5 w-5" />
                  Energy Saving Mode
                </CardTitle>
                <CardDescription>Optimize for minimal energy consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-3"
                  variant="default"
                  onClick={() => handleQuickAction('energy_saving_mode')}
                  disabled={isLoading}
                >
                  <Battery className="h-4 w-4" />
                  Enable Energy Saving
                  <span className="ml-auto text-xs text-green-600">-200W</span>
                </Button>
                <Button
                  className="w-full justify-start gap-3"
                  variant="outline"
                  onClick={() => handleQuickAction('random_appliance_toggle')}
                  disabled={isLoading}
                >
                  <Shuffle className="h-4 w-4" />
                  Random Toggle
                  <span className="ml-auto text-xs">Varies</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Power Consumption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Power</span>
                  <span className="font-bold">{Math.round(currentPower * 1000)}W</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Energy Consumed</span>
                  <span className="font-bold">{gameState.totalEnergyConsumed.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Appliances</span>
                  <span className="font-bold">{activeAppliances.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Appliances</span>
                  <span className="font-bold">{Object.keys(gameState.appliances).length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Score</span>
                  <span className="font-bold text-green-600">{totalScore} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Quests</span>
                  <span className="font-bold">{activeQuestCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Quests</span>
                  <span className="font-bold text-blue-600">{completedQuestCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appliance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Appliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(gameState.appliances).map((appliance) => (
                  <div key={appliance.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getApplianceIcon(appliance.category, appliance.name)}
                      <span className="text-sm">{appliance.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={appliance.isOn ? 'default' : 'secondary'}
                        size="sm"
                      >
                        {appliance.isOn ? 'ON' : 'OFF'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {appliance.isOn ? appliance.powerUsage : 0}W
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
