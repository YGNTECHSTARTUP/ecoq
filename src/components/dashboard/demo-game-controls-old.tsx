'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Zap, 
  Crown,
  Sparkles,
  Play,
  ExternalLink,
  ArrowRight,
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
  
  // If full dashboard is requested, show the complete gaming experience
  if (showFullDashboard) {
    return <GamingDashboard userId={consumerId} className={className} />;
  }

  // Simple demo version
  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                EcoQuest Demo Game
              </CardTitle>
              <CardDescription className="text-white/90">
                Interactive smart meter simulation • Control your virtual home
              </CardDescription>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => toast.success('Demo game activated!')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Demo
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Gaming Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Points System</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Quest System</span>
              <Badge variant="secondary">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Leaderboards</span>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Active Quests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Energy Saver Challenge</div>
              <Progress value={65} className="h-2" />
              <div className="text-xs text-muted-foreground">65% complete</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">First Steps</span>
              <Badge className="bg-green-500">Earned</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Energy Conscious</span>
              <Badge variant="outline">Locked</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Full Gaming Experience
          </CardTitle>
          <CardDescription>
            Unlock the complete gamified smart meter experience with advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={() => toast.info('Full gaming dashboard coming soon!')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Launch Full Gaming Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}