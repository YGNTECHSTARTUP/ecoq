/**
 * Quest System UI Components
 * 
 * Beautiful quest cards, progress indicators, reward celebrations,
 * and quest management interfaces integrated with the quest system.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ProgressCircle,
  QuestSkeleton,
  DataState,
  LoadingSpinner,
  EnergyFlowLoader
} from '@/components/ui/enhanced-loading';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { 
  Target,
  Clock,
  Trophy,
  Star,
  Zap,
  Leaf,
  Settings,
  Calendar,
  TrendingUp,
  Award,
  Gift,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Lightning,
  Coins,
  Crown,
  Medal,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useQuests, 
  useQuestProgress, 
  useQuestDetails,
  useQuestRewards,
  useQuestStats,
  useQuestFilters 
} from '@/hooks/useQuests';
import { useAuth } from '@/hooks/useAuth';

// Quest Card Component
interface QuestCardProps {
  quest: any; // Replace with actual Quest type
  onStart?: (questId: string) => void;
  onComplete?: (questId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function QuestCard({ quest, onStart, onComplete, variant = 'default' }: QuestCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Leaf className="h-3 w-3" />;
      case 'medium':
        return <Target className="h-3 w-3" />;
      case 'hard':
        return <Zap className="h-3 w-3" />;
      case 'expert':
        return <Lightning className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency':
        return <TrendingUp className="h-4 w-4" />;
      case 'sustainability':
        return <Leaf className="h-4 w-4" />;
      case 'optimization':
        return <Settings className="h-4 w-4" />;
      case 'behavioral':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d${hours % 24 > 0 ? ` ${hours % 24}h` : ''}`;
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{quest.definition?.title || quest.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {quest.definition?.description || quest.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {quest.rewards?.points || 0} pts
              </Badge>
              <Button size="sm" onClick={() => onStart?.(quest.id)}>
                Start
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={cn(
        'relative overflow-hidden border-2 transition-all duration-300',
        'bg-gradient-to-br from-primary/5 via-background to-secondary/5',
        'border-primary/20 hover:border-primary/40',
        isHovered && 'shadow-xl scale-[1.02]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                {getCategoryIcon(quest.definition?.category || 'default')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-xs font-semibold">
                    FEATURED
                  </Badge>
                </div>
                <CardTitle className="text-xl">{quest.definition?.title || quest.title}</CardTitle>
                <p className="text-muted-foreground">
                  {quest.definition?.description || quest.description}
                </p>
              </div>
            </div>
            <Badge className={cn('text-xs', getDifficultyColor(quest.definition?.difficulty || 'easy'))}>
              {getDifficultyIcon(quest.definition?.difficulty || 'easy')}
              <span className="ml-1 capitalize">{quest.definition?.difficulty || 'Easy'}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{quest.rewards?.points || 0}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatDuration(quest.definition?.duration || 24)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {quest.rewards?.badges?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => onStart?.(quest.id)}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Featured Quest
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg cursor-pointer',
        isHovered && 'scale-[1.01]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(quest.definition?.category || 'default')}
              <CardTitle className="text-lg">{quest.definition?.title || quest.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {quest.definition?.description || quest.description}
            </p>
          </div>
          <Badge className={cn('text-xs', getDifficultyColor(quest.definition?.difficulty || 'easy'))}>
            {getDifficultyIcon(quest.definition?.difficulty || 'easy')}
            <span className="ml-1 capitalize">{quest.definition?.difficulty || 'Easy'}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Quest Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{quest.rewards?.points || 0} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(quest.definition?.duration || 24)}</span>
            </div>
          </div>

          {/* Rewards */}
          {quest.rewards && (quest.rewards.badges?.length > 0 || quest.rewards.achievements?.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rewards</h4>
              <div className="flex flex-wrap gap-1">
                {quest.rewards.badges?.map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Medal className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
                {quest.rewards.achievements?.map((achievement: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={(e) => {
                e.stopPropagation();
                onStart?.(quest.id);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quest
            </Button>
            <Button variant="outline" size="icon" onClick={(e) => e.stopPropagation()}>
              <Star className="h-4 w-4" />
            </Button>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="pt-4 border-t space-y-3 animate-in slide-in-from-top-1 duration-200">
              <div>
                <h4 className="text-sm font-medium mb-2">Quest Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="capitalize">{quest.definition?.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Value:</span>
                    <span>{quest.definition?.targetValue} {quest.definition?.targetUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Until:</span>
                    <span>{new Date(quest.availability?.endDate?.toDate()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Active Quest Progress Component
export function ActiveQuestProgress({ userQuest }: { userQuest: any }) {
  const { timeRemaining, progress } = useQuestDetails(userQuest.id);
  
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <CardTitle className="text-lg">Active Quest</CardTitle>
          </div>
          <Badge variant="secondary">In Progress</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Quest Title and Progress */}
          <div>
            <h3 className="font-medium mb-2">{userQuest.questTitle || 'Quest Title'}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Math.round(userQuest.progress?.percentage || 0)}%</span>
              </div>
              <Progress 
                value={userQuest.progress?.percentage || 0} 
                className="h-2"
              />
            </div>
          </div>

          {/* Time Remaining */}
          {timeRemaining && !timeRemaining.isExpired && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-orange-500" />
              <span>
                {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
                {timeRemaining.minutes > 0 && `${timeRemaining.minutes}m`}
                {' remaining'}
              </span>
            </div>
          )}

          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span>{userQuest.progress?.currentValue || 0} / {userQuest.progress?.targetValue || 100}</span>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quest Reward Celebration Component
export function QuestRewardCelebration() {
  const { recentRewards, showCelebration, hideCelebration } = useQuestRewards();

  if (!showCelebration || recentRewards.length === 0) return null;

  const latestReward = recentRewards[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-6">
          {/* Celebration Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '3s'
                }}
              >
                <Sparkles className="h-4 w-4 text-primary/60" />
              </div>
            ))}
          </div>

          <div className="relative text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Quest Completed! 🎉</h2>
              <p className="text-muted-foreground">Congratulations on your achievement!</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold">+{latestReward.points} Points</span>
              </div>

              {latestReward.badges && latestReward.badges.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Badges Earned:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {latestReward.badges.map((badge: string, index: number) => (
                      <Badge key={index} className="bg-gradient-to-r from-primary to-primary/80">
                        <Medal className="h-3 w-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={hideCelebration} className="w-full">
              <PartyPopper className="h-4 w-4 mr-2" />
              Awesome!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Quest Dashboard Component
export function QuestDashboard() {
  const { user } = useAuth();
  const { 
    availableQuests, 
    activeQuests, 
    completedQuests,
    loading, 
    error,
    startQuest,
    generateQuests,
    createDailyChallenges
  } = useQuests();

  const questStats = useQuestStats();
  const { filteredQuests, filters, updateFilters } = useQuestFilters();

  const [selectedTab, setSelectedTab] = React.useState<'available' | 'active' | 'completed'>('active');

  return (
    <ComponentErrorBoundary componentName="QuestDashboard">
      <div className="space-y-6">
        {/* Quest Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{questStats.totalActiveQuests}</div>
              <div className="text-xs text-muted-foreground">Active Quests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{questStats.totalQuestsCompleted}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{questStats.totalPointsEarned}</div>
              <div className="text-xs text-muted-foreground">Points Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{Math.round(questStats.completionRate)}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Quests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuests.map(userQuest => (
                <ActiveQuestProgress key={userQuest.id} userQuest={userQuest} />
              ))}
            </div>
          </div>
        )}

        {/* Quest Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Quest Center</h2>
              <div className="flex rounded-lg bg-muted p-1">
                {(['available', 'active', 'completed'] as const).map(tab => (
                  <Button
                    key={tab}
                    variant={selectedTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTab(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => generateQuests()}>
                Generate Quests
              </Button>
              <Button onClick={() => createDailyChallenges()}>
                Daily Challenges
              </Button>
            </div>
          </div>

          {/* Quest Content */}
          <DataState
            loading={loading}
            error={error}
            data={selectedTab === 'available' ? availableQuests : 
                 selectedTab === 'active' ? activeQuests : completedQuests}
            loadingSkeleton={<QuestSkeleton />}
            errorMessage="Failed to load quests"
            emptyMessage={`No ${selectedTab} quests found`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTab === 'available' && availableQuests.map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onStart={startQuest}
                  variant={quest.metadata?.featured ? 'featured' : 'default'}
                />
              ))}
              {selectedTab === 'active' && activeQuests.map(userQuest => (
                <QuestCard
                  key={userQuest.id}
                  quest={{ ...userQuest, definition: userQuest }}
                  variant="compact"
                />
              ))}
              {selectedTab === 'completed' && completedQuests.map(userQuest => (
                <QuestCard
                  key={userQuest.id}
                  quest={{ ...userQuest, definition: userQuest }}
                  variant="compact"
                />
              ))}
            </div>
          </DataState>
        </div>

        {/* Quest Reward Celebration */}
        <QuestRewardCelebration />
      </div>
    </ComponentErrorBoundary>
  );
}

export default QuestDashboard;