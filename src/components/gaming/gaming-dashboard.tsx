'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Trophy,
  Target,
  Zap,
  Crown,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Users,
  Flame,
  Gift,
  ChevronRight,
  Medal,
  Sparkles,
  Lightning,
  Timer,
  CheckCircle,
  Lock,
  Play,
  RotateCcw
} from 'lucide-react';

import { 
  gamingPointsCalculator, 
  GAMING_LEVELS, 
  ACHIEVEMENTS,
  type GamingLevel,
  type Achievement 
} from '@/lib/gaming-points-system';

import {
  enhancedQuestSystem,
  type Quest,
  type LeaderboardEntry,
  type Leaderboard
} from '@/lib/enhanced-quest-system';

interface GamingDashboardProps {
  userId?: string;
  className?: string;
}

export function GamingDashboard({ userId = 'demo-user', className }: GamingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userPoints, setUserPoints] = useState(12750);
  const [userLevel, setUserLevel] = useState(1);
  const [currentStreak, setCurrentStreak] = useState(12);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const currentLevel = gamingPointsCalculator.getUserLevel(userPoints);
  const levelProgress = gamingPointsCalculator.getProgressToNextLevel(userPoints);
  
  useEffect(() => {
    // Initialize gaming data
    initializeGamingData();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      updateQuestProgress();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const initializeGamingData = () => {
    // Generate quests based on user level
    const generatedQuests = enhancedQuestSystem.generateQuestsForUser(currentLevel.level, userPoints);
    setAvailableQuests(generatedQuests.filter(q => q.status === 'available'));
    setActiveQuests(enhancedQuestSystem.getActiveQuests());
    setCompletedQuests(enhancedQuestSystem.getCompletedQuests());
    
    // Generate leaderboard
    const globalLeaderboard = enhancedQuestSystem.generateLeaderboard('global');
    setLeaderboard(globalLeaderboard);
    
    // Initialize achievements
    setAchievements(ACHIEVEMENTS);
  };

  const updateQuestProgress = () => {
    // Simulate quest progress updates
    const activeQuestsCopy = [...activeQuests];
    let hasUpdates = false;

    activeQuestsCopy.forEach(quest => {
      if (Math.random() < 0.3) { // 30% chance of progress update
        const progressIncrement = Math.random() * 20;
        quest.objectives.forEach(objective => {
          if (!objective.isCompleted && Math.random() < 0.5) {
            objective.current = Math.min(objective.target, objective.current + progressIncrement);
            objective.isCompleted = objective.current >= objective.target;
            hasUpdates = true;
          }
        });
        
        const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length;
        quest.currentProgress = (completedObjectives / quest.objectives.length) * 100;
        
        if (quest.currentProgress >= 100) {
          completeQuest(quest.id);
        }
      }
    });

    if (hasUpdates) {
      setActiveQuests(activeQuestsCopy);
    }
  };

  const acceptQuest = (questId: string) => {
    const success = enhancedQuestSystem.acceptQuest(questId);
    if (success) {
      setAvailableQuests(enhancedQuestSystem.getAvailableQuests());
      setActiveQuests(enhancedQuestSystem.getActiveQuests());
      toast.success('Quest accepted! Time to save energy!', {
        description: 'Check your progress in the active quests section.'
      });
    } else {
      toast.error('Failed to accept quest');
    }
  };

  const completeQuest = (questId: string) => {
    const rewards = enhancedQuestSystem.completeQuest(questId);
    
    if (rewards.length > 0) {
      const pointsReward = rewards.find(r => r.type === 'points');
      if (pointsReward && typeof pointsReward.value === 'number') {
        setUserPoints(prev => prev + pointsReward.value as number);
      }
      
      setActiveQuests(enhancedQuestSystem.getActiveQuests());
      setCompletedQuests(enhancedQuestSystem.getCompletedQuests());
      
      toast.success('🎉 Quest Completed!', {
        description: `You earned ${pointsReward?.value || 0} points!`
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      case 'expert': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Clock className="h-4 w-4" />;
      case 'monthly': return <Target className="h-4 w-4" />;
      case 'challenge': return <Lightning className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gaming Header - Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-8 w-8 text-yellow-300" />
                  <h1 className="text-3xl font-bold">EcoQuest Gaming</h1>
                </div>
                <Badge 
                  className="text-lg px-3 py-1" 
                  style={{ backgroundColor: currentLevel.color, color: 'white' }}
                >
                  {currentLevel.badge} {currentLevel.name}
                </Badge>
              </div>
              <p className="text-lg opacity-90">
                Transform your energy habits into an epic adventure!
              </p>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-4xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-yellow-300" />
                {userPoints.toLocaleString()}
              </div>
              <p className="text-sm opacity-75">Gaming Points</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">
                Level {currentLevel.level} Progress
              </span>
              <span className="text-sm opacity-90">
                {levelProgress.pointsNeeded > 0 
                  ? `${levelProgress.pointsNeeded.toLocaleString()} points to next level`
                  : 'Max Level Reached!'
                }
              </span>
            </div>
            <div className="relative">
              <Progress value={levelProgress.progress} className="h-3 bg-white/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-75" 
                   style={{ width: `${levelProgress.progress}%` }} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <Flame className="h-6 w-6 mx-auto mb-1 text-orange-300" />
              <div className="text-xl font-bold">{currentStreak}</div>
              <div className="text-sm opacity-75">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <Target className="h-6 w-6 mx-auto mb-1 text-blue-300" />
              <div className="text-xl font-bold">{activeQuests.length}</div>
              <div className="text-sm opacity-75">Active Quests</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
              <div className="text-xl font-bold">{completedQuests.length}</div>
              <div className="text-sm opacity-75">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <Award className="h-6 w-6 mx-auto mb-1 text-green-300" />
              <div className="text-xl font-bold">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-sm opacity-75">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">🎮 Overview</TabsTrigger>
          <TabsTrigger value="quests">🎯 Quests</TabsTrigger>
          <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">🎖️ Achievements</TabsTrigger>
          <TabsTrigger value="rewards">🎁 Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Quests Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Active Quests
                </CardTitle>
                <CardDescription>Your current energy challenges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeQuests.slice(0, 3).map((quest) => (
                  <div key={quest.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.icon}</span>
                      <div>
                        <h4 className="font-medium">{quest.title}</h4>
                        <div className="flex items-center gap-2">
                          {getQuestTypeIcon(quest.type)}
                          <Badge size="sm" className={getDifficultyColor(quest.difficulty)}>
                            {quest.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.round(quest.currentProgress)}%</div>
                      <Progress value={quest.currentProgress} className="w-16 h-2" />
                    </div>
                  </div>
                ))}
                
                {activeQuests.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active quests</p>
                    <p className="text-sm">Check the Quests tab to start new challenges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.filter(a => a.unlocked).slice(-3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge size="sm" className={getRarityColor(achievement.rarity)}>
                        +{achievement.points} points
                      </Badge>
                    </div>
                  </div>
                ))}

                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No achievements unlocked yet</p>
                    <p className="text-sm">Complete quests to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Smart Meter Gaming Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Smart Meter Gaming Stats
              </CardTitle>
              <CardDescription>Your energy efficiency in gaming terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2.3 kW</div>
                  <div className="text-sm text-muted-foreground">Current Power</div>
                  <div className="text-xs text-green-600">↓ 15% from yesterday</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">89%</div>
                  <div className="text-sm text-muted-foreground">Efficiency Score</div>
                  <div className="text-xs text-blue-600">↑ 5% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12.5 kWh</div>
                  <div className="text-sm text-muted-foreground">Today's Usage</div>
                  <div className="text-xs text-purple-600">Target: 15 kWh</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹45</div>
                  <div className="text-sm text-muted-foreground">Today's Cost</div>
                  <div className="text-xs text-orange-600">Saved ₹12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-6">
          <div className="grid gap-6">
            {/* Available Quests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Available Quests
                </CardTitle>
                <CardDescription>New challenges waiting for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableQuests.map((quest) => (
                  <div key={quest.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{quest.icon}</span>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{quest.title}</h3>
                            <Badge className={getRarityColor(quest.rarity)}>
                              {quest.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{quest.description}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {getQuestTypeIcon(quest.type)}
                              <span className="text-xs capitalize">{quest.type}</span>
                            </div>
                            <Badge size="sm" className={getDifficultyColor(quest.difficulty)}>
                              {quest.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span className="text-sm font-medium">{quest.baseReward} pts</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span className="text-xs">{quest.duration}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => acceptQuest(quest.id)}>
                        Accept Quest
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Quests Detailed */}
            {activeQuests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-500" />
                    Active Quests
                  </CardTitle>
                  <CardDescription>Quests in progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeQuests.map((quest) => (
                    <div key={quest.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="text-3xl">{quest.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{quest.title}</h3>
                            <Badge className={getRarityColor(quest.rarity)}>
                              {quest.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
                          
                          {/* Objectives */}
                          <div className="space-y-3">
                            {quest.objectives.map((objective) => (
                              <div key={objective.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{objective.description}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {objective.current}/{objective.target} {objective.unit}
                                    </span>
                                    {objective.isCompleted && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                </div>
                                <Progress 
                                  value={(objective.current / objective.target) * 100} 
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t">
                            <div className="text-sm text-muted-foreground">
                              Expires: {quest.endDate.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-green-600">
                                +{quest.baseReward} points
                              </span>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {Math.round(quest.currentProgress)}% Complete
                                </div>
                                <Progress value={quest.currentProgress} className="w-20 h-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top energy efficiency champions</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard && (
                <div className="space-y-3">
                  {leaderboard.entries.slice(0, 10).map((entry, index) => (
                    <div 
                      key={entry.userId} 
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{entry.username}</div>
                        <div className="text-sm text-muted-foreground">
                          Level {entry.level} • {entry.questsCompleted} quests completed
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>
                      
                      {entry.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-4 w-4" />
                          <span className="text-sm font-medium">{entry.currentStreak}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges by completing energy challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${achievement.unlocked ? '' : 'text-gray-500'}`}>
                            {achievement.name}
                          </h3>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className={`text-sm ${achievement.unlocked ? 'text-muted-foreground' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-sm font-medium">+{achievement.points} points</span>
                          </div>
                          {achievement.unlocked ? (
                            <Badge variant="secondary" className="text-green-600 bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          ) : (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                {Math.round(achievement.progress)}% complete
                              </div>
                              <Progress value={achievement.progress} className="w-20 h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Rewards Shop
              </CardTitle>
              <CardDescription>Spend your points on amazing rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Gift className="h-16 w-16 mx-auto mb-4 text-purple-500 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground">
                  The rewards shop is under development. Keep earning points for amazing prizes!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}