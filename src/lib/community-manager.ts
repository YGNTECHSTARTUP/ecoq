import { toast } from 'sonner';

// Types
export interface CommunityUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  location: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  stats: {
    totalSavings: number;
    carbonReduced: number;
    streakDays: number;
    rank: number;
    level: number;
    points: number;
  };
  achievements: Achievement[];
  joinedAt: string;
  isOnline: boolean;
  privacySettings: {
    showStats: boolean;
    showLocation: boolean;
    acceptFriendRequests: boolean;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'savings' | 'streak' | 'social' | 'challenge' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'neighborhood' | 'city';
  category: 'consumption' | 'savings' | 'efficiency' | 'social' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: {
    start: string;
    end: string;
  };
  goals: {
    target: number;
    unit: string;
    metric: string;
  };
  rewards: {
    points: number;
    achievements?: string[];
    badges?: string[];
  };
  participants: ChallengeParticipant[];
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  tags: string[];
  sponsoredBy?: string;
}

export interface ChallengeParticipant {
  userId: string;
  username: string;
  joinedAt: string;
  progress: {
    current: number;
    percentage: number;
  };
  rank?: number;
  completed: boolean;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  acceptedAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  type: 'tip' | 'achievement' | 'challenge' | 'question' | 'celebration';
  images?: string[];
  tags: string[];
  likes: string[]; // User IDs who liked
  comments: Comment[];
  createdAt: string;
  updatedAt?: string;
  pinned?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: string[];
  replies: Comment[];
}

export interface Leaderboard {
  id: string;
  title: string;
  description: string;
  type: 'global' | 'city' | 'neighborhood' | 'friends';
  metric: 'savings' | 'efficiency' | 'points' | 'streak' | 'carbon_reduced';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  value: number;
  change: number; // Position change from previous period
  badge?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'challenge_invite' | 'achievement' | 'like' | 'comment' | 'challenge_complete';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

class CommunityManager {
  private currentUser: CommunityUser | null = null;
  private users: Map<string, CommunityUser> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private friendships: Map<string, Friendship> = new Map();
  private posts: Map<string, CommunityPost> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Sample users
    const sampleUsers: CommunityUser[] = [
      {
        id: 'user1',
        username: 'eco_warrior',
        displayName: 'Alex Chen',
        avatar: '🌱',
        location: { city: 'Mumbai', state: 'Maharashtra', neighborhood: 'Bandra' },
        stats: { totalSavings: 2500, carbonReduced: 120, streakDays: 45, rank: 1, level: 8, points: 15200 },
        achievements: [],
        joinedAt: '2024-01-15T10:00:00Z',
        isOnline: true,
        privacySettings: { showStats: true, showLocation: true, acceptFriendRequests: true }
      },
      {
        id: 'user2',
        username: 'green_guru',
        displayName: 'Priya Sharma',
        avatar: '♻️',
        location: { city: 'Mumbai', state: 'Maharashtra', neighborhood: 'Powai' },
        stats: { totalSavings: 2200, carbonReduced: 110, streakDays: 32, rank: 2, level: 7, points: 13800 },
        achievements: [],
        joinedAt: '2024-02-01T10:00:00Z',
        isOnline: false,
        privacySettings: { showStats: true, showLocation: true, acceptFriendRequests: true }
      },
      {
        id: 'user3',
        username: 'solar_saver',
        displayName: 'Rajesh Kumar',
        avatar: '☀️',
        location: { city: 'Delhi', state: 'Delhi', neighborhood: 'Connaught Place' },
        stats: { totalSavings: 1800, carbonReduced: 95, streakDays: 28, rank: 3, level: 6, points: 11500 },
        achievements: [],
        joinedAt: '2024-02-10T10:00:00Z',
        isOnline: true,
        privacySettings: { showStats: true, showLocation: false, acceptFriendRequests: true }
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Sample challenges
    const sampleChallenges: Challenge[] = [
      {
        id: 'challenge1',
        title: '30-Day Energy Efficiency Challenge',
        description: 'Reduce your monthly energy consumption by 20% compared to last month',
        type: 'individual',
        category: 'efficiency',
        difficulty: 'medium',
        duration: {
          start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        goals: { target: 20, unit: '%', metric: 'reduction' },
        rewards: { points: 1000, achievements: ['efficiency_master'], badges: ['green_saver'] },
        participants: [
          { userId: 'user1', username: 'eco_warrior', joinedAt: new Date().toISOString(), progress: { current: 15, percentage: 75 }, rank: 1, completed: false },
          { userId: 'user2', username: 'green_guru', joinedAt: new Date().toISOString(), progress: { current: 12, percentage: 60 }, rank: 2, completed: false }
        ],
        status: 'active',
        tags: ['efficiency', 'monthly', 'beginner-friendly']
      },
      {
        id: 'challenge2',
        title: 'Neighborhood Solar Week',
        description: 'Collaborate with neighbors to maximize solar energy usage in your area',
        type: 'neighborhood',
        category: 'consumption',
        difficulty: 'easy',
        duration: {
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        goals: { target: 500, unit: 'kWh', metric: 'solar_generation' },
        rewards: { points: 750, badges: ['solar_champion'] },
        participants: [],
        maxParticipants: 50,
        status: 'upcoming',
        tags: ['solar', 'community', 'renewable'],
        sponsoredBy: 'Solar Energy Co.'
      }
    ];

    sampleChallenges.forEach(challenge => this.challenges.set(challenge.id, challenge));

    // Sample posts
    const samplePosts: CommunityPost[] = [
      {
        id: 'post1',
        authorId: 'user1',
        author: { username: 'eco_warrior', displayName: 'Alex Chen', avatar: '🌱' },
        content: 'Just achieved my 45-day streak! Small changes every day really add up. Who else is working on building consistent energy-saving habits?',
        type: 'achievement',
        tags: ['streak', 'motivation', 'habits'],
        likes: ['user2', 'user3'],
        comments: [
          {
            id: 'comment1',
            authorId: 'user2',
            author: { username: 'green_guru', displayName: 'Priya Sharma', avatar: '♻️' },
            content: 'Congratulations! What has been your most effective habit?',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: ['user1'],
            replies: []
          }
        ],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    samplePosts.forEach(post => this.posts.set(post.id, post));

    // Sample leaderboards
    const monthlyLeaderboard: Leaderboard = {
      id: 'monthly_savings',
      title: 'Monthly Savings Leaders',
      description: 'Top savers this month',
      type: 'global',
      metric: 'savings',
      period: 'monthly',
      entries: [
        { rank: 1, userId: 'user1', username: 'eco_warrior', displayName: 'Alex Chen', avatar: '🌱', value: 2500, change: 0, badge: 'gold' },
        { rank: 2, userId: 'user2', username: 'green_guru', displayName: 'Priya Sharma', avatar: '♻️', value: 2200, change: 1, badge: 'silver' },
        { rank: 3, userId: 'user3', username: 'solar_saver', displayName: 'Rajesh Kumar', avatar: '☀️', value: 1800, change: -1, badge: 'bronze' }
      ],
      lastUpdated: new Date().toISOString()
    };

    this.leaderboards.set(monthlyLeaderboard.id, monthlyLeaderboard);
  }

  // User management
  async signIn(userId: string): Promise<CommunityUser | null> {
    const user = this.users.get(userId);
    if (user) {
      this.currentUser = user;
      user.isOnline = true;
      return user;
    }
    return null;
  }

  getCurrentUser(): CommunityUser | null {
    return this.currentUser;
  }

  async getUser(userId: string): Promise<CommunityUser | null> {
    return this.users.get(userId) || null;
  }

  async searchUsers(query: string, location?: string): Promise<CommunityUser[]> {
    const results = Array.from(this.users.values()).filter(user => {
      const matchesQuery = user.username.toLowerCase().includes(query.toLowerCase()) ||
                          user.displayName.toLowerCase().includes(query.toLowerCase());
      const matchesLocation = !location || 
                             user.location.city.toLowerCase().includes(location.toLowerCase()) ||
                             user.location.neighborhood?.toLowerCase().includes(location.toLowerCase());
      return matchesQuery && matchesLocation;
    });

    return results.slice(0, 20); // Limit results
  }

  // Friendship management
  async sendFriendRequest(targetUserId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const targetUser = this.users.get(targetUserId);
    if (!targetUser || !targetUser.privacySettings.acceptFriendRequests) {
      return false;
    }

    const friendshipId = `${this.currentUser.id}_${targetUserId}`;
    const friendship: Friendship = {
      id: friendshipId,
      userId: this.currentUser.id,
      friendId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.friendships.set(friendshipId, friendship);

    // Create notification for target user
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      userId: targetUserId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${this.currentUser.displayName} wants to be friends`,
      data: { fromUserId: this.currentUser.id },
      read: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.set(notification.id, notification);
    return true;
  }

  async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    const friendship = this.friendships.get(friendshipId);
    if (!friendship || friendship.status !== 'pending') return false;

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date().toISOString();
    
    return true;
  }

  async getFriends(userId: string): Promise<CommunityUser[]> {
    const friends: CommunityUser[] = [];
    
    this.friendships.forEach(friendship => {
      if (friendship.status === 'accepted') {
        let friendId: string | null = null;
        
        if (friendship.userId === userId) {
          friendId = friendship.friendId;
        } else if (friendship.friendId === userId) {
          friendId = friendship.userId;
        }
        
        if (friendId) {
          const friend = this.users.get(friendId);
          if (friend) friends.push(friend);
        }
      }
    });

    return friends;
  }

  // Challenge management
  async getChallenges(filters: {
    type?: Challenge['type'];
    status?: Challenge['status'];
    category?: Challenge['category'];
    difficulty?: Challenge['difficulty'];
  } = {}): Promise<Challenge[]> {
    let challenges = Array.from(this.challenges.values());

    if (filters.type) {
      challenges = challenges.filter(c => c.type === filters.type);
    }
    if (filters.status) {
      challenges = challenges.filter(c => c.status === filters.status);
    }
    if (filters.category) {
      challenges = challenges.filter(c => c.category === filters.category);
    }
    if (filters.difficulty) {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }

    return challenges.sort((a, b) => new Date(b.duration.start).getTime() - new Date(a.duration.start).getTime());
  }

  async joinChallenge(challengeId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.status !== 'active') return false;

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      return false;
    }

    const alreadyJoined = challenge.participants.some(p => p.userId === this.currentUser!.id);
    if (alreadyJoined) return false;

    const participant: ChallengeParticipant = {
      userId: this.currentUser.id,
      username: this.currentUser.username,
      joinedAt: new Date().toISOString(),
      progress: { current: 0, percentage: 0 },
      completed: false
    };

    challenge.participants.push(participant);
    return true;
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<boolean> {
    if (!this.currentUser) return false;

    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    const participant = challenge.participants.find(p => p.userId === this.currentUser!.id);
    if (!participant) return false;

    participant.progress.current = progress;
    participant.progress.percentage = (progress / challenge.goals.target) * 100;
    participant.completed = participant.progress.percentage >= 100;

    // Update ranks
    const sortedParticipants = challenge.participants
      .filter(p => !p.completed)
      .sort((a, b) => b.progress.current - a.progress.current);
    
    sortedParticipants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    return true;
  }

  // Community posts
  async createPost(content: string, type: CommunityPost['type'], tags: string[] = [], images: string[] = []): Promise<string | null> {
    if (!this.currentUser) return null;

    const postId = `post_${Date.now()}`;
    const post: CommunityPost = {
      id: postId,
      authorId: this.currentUser.id,
      author: {
        username: this.currentUser.username,
        displayName: this.currentUser.displayName,
        avatar: this.currentUser.avatar
      },
      content,
      type,
      images,
      tags,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    this.posts.set(postId, post);
    return postId;
  }

  async getPosts(filters: { type?: string; authorId?: string; tags?: string[] } = {}): Promise<CommunityPost[]> {
    let posts = Array.from(this.posts.values());

    if (filters.type) {
      posts = posts.filter(p => p.type === filters.type);
    }
    if (filters.authorId) {
      posts = posts.filter(p => p.authorId === filters.authorId);
    }
    if (filters.tags && filters.tags.length > 0) {
      posts = posts.filter(p => filters.tags!.some(tag => p.tags.includes(tag)));
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async likePost(postId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const post = this.posts.get(postId);
    if (!post) return false;

    const userId = this.currentUser.id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    return true;
  }

  async addComment(postId: string, content: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const post = this.posts.get(postId);
    if (!post) return false;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: this.currentUser.id,
      author: {
        username: this.currentUser.username,
        displayName: this.currentUser.displayName,
        avatar: this.currentUser.avatar
      },
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };

    post.comments.push(comment);
    return true;
  }

  // Leaderboards
  async getLeaderboards(type?: Leaderboard['type']): Promise<Leaderboard[]> {
    let leaderboards = Array.from(this.leaderboards.values());
    
    if (type) {
      leaderboards = leaderboards.filter(l => l.type === type);
    }

    return leaderboards;
  }

  async getUserRank(userId: string, leaderboardId: string): Promise<LeaderboardEntry | null> {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return null;

    return leaderboard.entries.find(entry => entry.userId === userId) || null;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return notifications;
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  // Analytics and stats
  async getCommunityStats(): Promise<{
    totalUsers: number;
    totalChallenges: number;
    activeChallenges: number;
    totalSavings: number;
    totalCarbonReduced: number;
    totalPosts: number;
  }> {
    const users = Array.from(this.users.values());
    const challenges = Array.from(this.challenges.values());

    return {
      totalUsers: users.length,
      totalChallenges: challenges.length,
      activeChallenges: challenges.filter(c => c.status === 'active').length,
      totalSavings: users.reduce((sum, user) => sum + user.stats.totalSavings, 0),
      totalCarbonReduced: users.reduce((sum, user) => sum + user.stats.carbonReduced, 0),
      totalPosts: this.posts.size
    };
  }

  // Achievements system
  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const newAchievements: Achievement[] = [];

    // Example achievement checks
    if (user.stats.streakDays >= 30 && !user.achievements.some(a => a.id === 'streak_master')) {
      const achievement: Achievement = {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 30-day energy saving streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        unlockedAt: new Date().toISOString()
      };
      user.achievements.push(achievement);
      newAchievements.push(achievement);
    }

    if (user.stats.totalSavings >= 2000 && !user.achievements.some(a => a.id === 'savings_hero')) {
      const achievement: Achievement = {
        id: 'savings_hero',
        title: 'Savings Hero',
        description: 'Save ₹2000+ on energy bills',
        icon: '💰',
        category: 'savings',
        rarity: 'epic',
        unlockedAt: new Date().toISOString()
      };
      user.achievements.push(achievement);
      newAchievements.push(achievement);
    }

    return newAchievements;
  }
}

// Export singleton instance
export const communityManager = new CommunityManager();