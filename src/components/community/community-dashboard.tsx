'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Trophy,
  MessageSquare,
  Heart,
  Share2,
  UserPlus,
  Search,
  Filter,
  Clock,
  Target,
  Zap,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  Star,
  Crown,
  Medal,
  Gift,
  Bell,
  CheckCircle,
  XCircle,
  Plus,
  Send,
  ThumbsUp,
  MessageCircle,
  Flame,
  Leaf,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Minus,
  ExternalLink,
  Eye,
  Hash,
  Globe,
  Home,
  Building,
  RefreshCw
} from 'lucide-react';
import {
  communityManager,
  type CommunityUser,
  type Challenge,
  type CommunityPost,
  type Leaderboard,
  type Achievement,
  type Notification
} from '@/lib/community-manager';
import { toast } from 'sonner';

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800'
};

const challengeTypeIcons = {
  individual: <Users className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  neighborhood: <Building className="h-4 w-4" />,
  city: <Globe className="h-4 w-4" />
};

interface CommunityDashboardProps {
  userId: string;
  className?: string;
}

export function CommunityDashboard({ userId, className }: CommunityDashboardProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for different sections
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [friends, setFriends] = useState<CommunityUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchResults, setSearchResults] = useState<CommunityUser[]>([]);

  // Dialog states
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('tip');
  const [newPostTags, setNewPostTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [challengeFilter, setChallengeFilter] = useState<{
    type?: Challenge['type'];
    status?: Challenge['status'];
    difficulty?: Challenge['difficulty'];
  }>({});
  const [postFilter, setPostFilter] = useState<{ type?: string }>({});

  useEffect(() => {
    initializeCommunity();
  }, [userId]);

  const initializeCommunity = async () => {
    setIsLoading(true);
    try {
      // Sign in the user
      const user = await communityManager.signIn(userId);
      setCurrentUser(user);

      if (user) {
        await loadCommunityData();
      }
    } catch (error) {
      console.error('Error initializing community:', error);
      toast.error('Failed to load community data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunityData = async () => {
    try {
      // Load posts
      const postsData = await communityManager.getPosts(postFilter);
      setPosts(postsData);

      // Load challenges
      const challengesData = await communityManager.getChallenges(challengeFilter);
      setChallenges(challengesData);

      // Load leaderboards
      const leaderboardsData = await communityManager.getLeaderboards();
      setLeaderboards(leaderboardsData);

      // Load friends
      const friendsData = await communityManager.getFriends(userId);
      setFriends(friendsData);

      // Load notifications
      const notificationsData = await communityManager.getNotifications(userId);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading community data:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const tags = newPostTags.split(',').map(tag => tag.trim()).filter(Boolean);
      const postId = await communityManager.createPost(newPostContent, newPostType, tags);
      
      if (postId) {
        toast.success('Post created successfully!');
        setNewPostContent('');
        setNewPostTags('');
        setIsNewPostOpen(false);
        await loadCommunityData();
      }
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityManager.likePost(postId);
      await loadCommunityData();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const success = await communityManager.joinChallenge(challengeId);
      if (success) {
        toast.success('Successfully joined challenge!');
        await loadCommunityData();
      } else {
        toast.error('Unable to join challenge');
      }
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await communityManager.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      const success = await communityManager.sendFriendRequest(targetUserId);
      if (success) {
        toast.success('Friend request sent!');
      } else {
        toast.error('Unable to send friend request');
      }
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-orange-500" />;
      default: return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <ChevronDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Please sign in to access the community</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{currentUser.avatar || '👤'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {currentUser.displayName}!</h2>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentUser.location.neighborhood}, {currentUser.location.city}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Users Dialog */}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search Users</DialogTitle>
                <DialogDescription>Find friends in your area or by username</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                  />
                  <Button onClick={handleSearchUsers}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.avatar || '👤'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          {user.privacySettings.showLocation && (
                            <p className="text-xs text-muted-foreground">{user.location.city}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendFriendRequest(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery && (
                    <p className="text-center text-muted-foreground py-4">No users found</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Post Dialog */}
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>Share your energy-saving tips or achievements</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newPostType} onValueChange={(value: CommunityPost['type']) => setNewPostType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tip">💡 Energy Tip</SelectItem>
                    <SelectItem value="achievement">🏆 Achievement</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="celebration">🎉 Celebration</SelectItem>
                    <SelectItem value="challenge">⚡ Challenge</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />

                <Input
                  placeholder="Add tags (comma-separated)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={loadCommunityData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{currentUser.stats.streakDays}</span>
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">#{currentUser.stats.rank}</span>
            </div>
            <p className="text-sm text-muted-foreground">Global Rank</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">₹{currentUser.stats.totalSavings}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{friends.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Friends</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={postFilter.type} onValueChange={(value) => setPostFilter({ ...postFilter, type: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Posts</SelectItem>
                <SelectItem value="tip">Tips</SelectItem>
                <SelectItem value="achievement">Achievements</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="celebration">Celebrations</SelectItem>
                <SelectItem value="challenge">Challenges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{post.author.avatar || '👤'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{post.author.displayName}</span>
                        <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.type}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      
                      <p className="mb-3">{post.content}</p>
                      
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-muted-foreground hover:text-red-500 ${
                            post.likes.includes(currentUser.id) ? 'text-red-500' : ''
                          }`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes.length}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments.length}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to share something with the community!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select 
              value={challengeFilter.type} 
              onValueChange={(value: Challenge['type']) => setChallengeFilter({ ...challengeFilter, type: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="neighborhood">Neighborhood</SelectItem>
                <SelectItem value="city">City</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={challengeFilter.difficulty} 
              onValueChange={(value: Challenge['difficulty']) => setChallengeFilter({ ...challengeFilter, difficulty: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={challengeFilter.status} 
              onValueChange={(value: Challenge['status']) => setChallengeFilter({ ...challengeFilter, status: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {challenges.map((challenge) => {
              const isParticipating = challenge.participants.some(p => p.userId === currentUser.id);
              const userProgress = challenge.participants.find(p => p.userId === currentUser.id);

              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {challengeTypeIcons[challenge.type]}
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <Badge className={difficultyColors[challenge.difficulty]}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                            {challenge.status}
                          </Badge>
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      
                      {!isParticipating && challenge.status === 'active' && (
                        <Button onClick={() => handleJoinChallenge(challenge.id)}>
                          <Target className="h-4 w-4 mr-2" />
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {challenge.goals.target}{challenge.goals.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">Target</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {challenge.participants.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Participants</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {challenge.rewards.points}
                        </p>
                        <p className="text-sm text-muted-foreground">Points</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {Math.ceil((new Date(challenge.duration.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-sm text-muted-foreground">Days Left</p>
                      </div>
                    </div>

                    {isParticipating && userProgress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Your Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {userProgress.progress.current}/{challenge.goals.target}{challenge.goals.unit}
                          </span>
                        </div>
                        <Progress value={userProgress.progress.percentage} className="h-2" />
                        {userProgress.rank && (
                          <p className="text-sm text-muted-foreground">
                            Current rank: #{userProgress.rank}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {challenge.sponsoredBy && (
                      <p className="text-sm text-muted-foreground">
                        Sponsored by {challenge.sponsoredBy}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {challenges.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">No challenges available</p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new challenges!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="grid gap-6">
            {leaderboards.map((leaderboard) => (
              <Card key={leaderboard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        {leaderboard.title}
                      </CardTitle>
                      <CardDescription>{leaderboard.description}</CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Last updated</p>
                      <p>{formatTimeAgo(leaderboard.lastUpdated)}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.entries.map((entry) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          entry.userId === currentUser.id ? 'bg-blue-50 border-blue-200' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 w-8">
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {entry.avatar || '👤'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <p className="font-medium text-sm">{entry.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{entry.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold">
                              {leaderboard.metric === 'savings' ? '₹' : ''}
                              {entry.value.toLocaleString()}
                              {leaderboard.metric === 'efficiency' ? '%' : ''}
                              {leaderboard.metric === 'carbon_reduced' ? ' kg' : ''}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getChangeIcon(entry.change)}
                              <span>{Math.abs(entry.change)}</span>
                            </div>
                          </div>
                          
                          {entry.badge && (
                            <Badge className={
                              entry.badge === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                              entry.badge === 'silver' ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'
                            }>
                              {entry.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-6">
          <div className="grid gap-4">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{friend.avatar || '👤'}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{friend.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{friend.username}</p>
                        {friend.privacySettings.showLocation && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {friend.location.city}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {friend.privacySettings.showStats && (
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-green-600">₹{friend.stats.totalSavings}</p>
                            <p className="text-xs text-muted-foreground">Savings</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-orange-600">{friend.stats.streakDays}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-purple-600">Lv.{friend.stats.level}</p>
                            <p className="text-xs text-muted-foreground">Level</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs text-muted-foreground">
                            {friend.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {friends.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">No friends yet</p>
                  <p className="text-sm text-muted-foreground">
                    Use the search to find friends in your area!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className={`flex items-start gap-4 ${notification.read ? 'opacity-75' : ''}`}>
                  <div className="p-2 rounded-full bg-blue-100">
                    {notification.type === 'friend_request' && <UserPlus className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'achievement' && <Award className="h-4 w-4 text-yellow-600" />}
                    {notification.type === 'challenge_complete' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {notification.type === 'like' && <Heart className="h-4 w-4 text-red-600" />}
                    {notification.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}