'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Zap, 
  Crown,
  Sparkles,
  Play,
  ArrowRight,
  Trophy,
  Target,
  Award
} from 'lucide-react';

// Import the full gaming dashboard
import { GamingDashboard } from '@/components/gaming/gaming-dashboard';

interface DemoGameControlsProps {
  consumerId?: string;
  className?: string;
  showFullDashboard?: boolean;
}

export function DemoGameControls({ 
  consumerId = 'DEMO123456', 
  className,
  showFullDashboard = false 
}: DemoGameControlsProps) {
  const [showGaming, setShowGaming] = useState(showFullDashboard);
  
  // If full dashboard is requested or user clicked to launch, show the complete gaming experience
  if (showGaming) {
    return <GamingDashboard userId={consumerId} className={className} />;
  }

  const launchGamingDashboard = () => {
    toast.success('🎮 Launching EcoQuest Gaming Dashboard!', {
      description: 'Get ready for the ultimate energy gaming experience!'
    });
    setShowGaming(true);
  };

  // Show gaming launcher/preview instead of old demo controls
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gaming Launch Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-300" />
                <CardTitle className="text-3xl font-bold">EcoQuest Gaming</CardTitle>
              </div>
              <CardDescription className="text-lg text-white/90">
                Transform your smart meter into an epic gaming adventure!
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">🎮</div>
              <div className="text-sm opacity-75">Ready to Play</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold">12,750</div>
              <div className="text-sm opacity-75">Points Available</div>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-300" />
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm opacity-75">Quests Ready</div>
            </div>
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-orange-300" />
              <div className="text-2xl font-bold">Top 5%</div>
              <div className="text-sm opacity-75">Leaderboard</div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold text-lg py-6"
            onClick={launchGamingDashboard}
          >
            <Play className="h-6 w-6 mr-3" />
            Launch Gaming Dashboard
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Gaming Features Preview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Dynamic Quests
            </CardTitle>
            <CardDescription>Daily, weekly, and special challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Energy Saver Challenge</li>
              <li>• Peak Hour Optimizer</li>
              <li>• Community Helper</li>
              <li>• Efficiency Master</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Competitions
            </CardTitle>
            <CardDescription>Compete with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Global Leaderboards</li>
              <li>• Team Challenges</li>
              <li>• City Championships</li>
              <li>• Achievement Races</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Rewards
            </CardTitle>
            <CardDescription>Earn points and unlock prizes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Virtual Badges</li>
              <li>• Real Discounts</li>
              <li>• Exclusive Themes</li>
              <li>• Premium Features</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Smart Meter Gaming Stats</CardTitle>
          <CardDescription>Live integration with your energy data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2.3 kW</div>
              <div className="text-sm text-muted-foreground">Current Power</div>
              <div className="text-xs text-green-600">↓ Gaming optimized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-muted-foreground">Efficiency Score</div>
              <div className="text-xs text-blue-600">↑ Quest ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12 days</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="text-xs text-purple-600">1.2x multiplier</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Level 10</div>
              <div className="text-sm text-muted-foreground">Smart Saver</div>
              <div className="text-xs text-orange-600">20% bonus points</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}