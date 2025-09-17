'use client';

import { gamingPointsCalculator } from './gaming-points-system';
import type { Quest, LeaderboardEntry } from './enhanced-quest-system';

// Community Types
export type CommunityEventType = 'challenge' | 'competition' | 'collaboration' | 'tournament';
export type TeamSize = 'solo' | 'duo' | 'squad' | 'guild';
export type CommunityStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface CommunityMember {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  totalPoints: number;
  joinedAt: Date;
  lastActive: Date;
  role: 'member' | 'moderator' | 'admin' | 'leader';
  achievements: string[];
  specializations: EnergySpecialization[];
  stats: MemberStats;
}

export interface EnergySpecialization {
  type: 'solar_expert' | 'efficiency_guru' | 'peak_optimizer' | 'green_innovator' | 'community_helper';
  level: number;
  experience: number;
  badge: string;
  description: string;
}

export interface MemberStats {
  totalEnergyySaved: number; // kWh
  co2Reduced: number; // kg
  moneySaved: number; // currency
  questsCompleted: number;
  communityHelps: number;
  streakRecord: number;
  averageEfficiency: number;
}

export interface CommunityTeam {
  id: string;
  name: string;
  description: string;
  members: CommunityMember[];
  leader: string; // userId
  maxMembers: number;
  totalPoints: number;
  achievements: TeamAchievement[];
  createdAt: Date;
  isPrivate: boolean;
  requirements: TeamRequirements;
  stats: TeamStats;
}

export interface TeamRequirements {
  minLevel: number;
  maxMembers: number;
  requiredSpecializations?: EnergySpecialization['type'][];
  inviteOnly: boolean;
}

export interface TeamStats {
  totalEnergyySaved: number;
  totalCO2Reduced: number;
  totalMoneySaved: number;
  averageEfficiency: number;
  completedChallenges: number;
  winRate: number;
}

export interface TeamAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  pointsAwarded: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: CommunityEventType;
  category: 'energy_saving' | 'efficiency' | 'innovation' | 'collaboration';
  
  // Participation
  teamSize: TeamSize;
  maxParticipants: number;
  currentParticipants: number;
  registeredTeams: CommunityTeam[];
  registeredUsers: CommunityMember[];
  
  // Timing
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  status: CommunityStatus;
  
  // Requirements
  levelRequirement: number;
  specialtyRequirements?: EnergySpecialization['type'][];
  
  // Objectives
  objectives: ChallengeObjective[];
  
  // Rewards
  rewards: ChallengeReward[];
  
  // Tracking
  leaderboard: ChallengeLeaderboard;
  createdBy: string; // userId or 'system'
  createdAt: Date;
}

export interface ChallengeObjective {
  id: string;
  description: string;
  type: 'collective' | 'individual' | 'team_average';
  target: number;
  unit: string;
  weight: number; // for scoring
  currentProgress: number;
  isCompleted: boolean;
}

export interface ChallengeReward {
  position: number; // 1st, 2nd, 3rd, etc. or 0 for participation
  type: 'points' | 'badge' | 'title' | 'exclusive_item' | 'real_reward';
  value: number | string;
  description: string;
  icon?: string;
  recipients: string[]; // userIds who received this reward
}

export interface ChallengeLeaderboard {
  entries: ChallengeEntry[];
  lastUpdated: Date;
}

export interface ChallengeEntry {
  participantId: string; // userId or teamId
  participantName: string;
  participantType: 'user' | 'team';
  score: number;
  progress: { [objectiveId: string]: number };
  rank: number;
  isEligible: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'tip' | 'achievement' | 'question' | 'challenge_update' | 'celebration';
  attachments?: PostAttachment[];
  likes: number;
  likedBy: string[]; // userIds
  comments: CommunityComment[];
  tags: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface PostAttachment {
  type: 'image' | 'chart' | 'achievement' | 'energy_data';
  url?: string;
  data?: any; // For structured data like charts or achievements
  description?: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  replies?: CommunityComment[];
}

// Community Events and News
export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'challenge_launch' | 'celebration' | 'announcement';
  startDate: Date;
  endDate?: Date;
  isVirtual: boolean;
  maxAttendees?: number;
  registeredAttendees: string[]; // userIds
  organizer: string; // userId or 'system'
  tags: string[];
  rewards?: {
    attendancePoints: number;
    participationRewards?: string[];
  };
  createdAt: Date;
}

// Predefined Community Challenges
export const COMMUNITY_CHALLENGES: Omit<CommunityChallenge, 'id' | 'createdAt' | 'registeredTeams' | 'registeredUsers' | 'currentParticipants' | 'leaderboard'>[] = [
  {
    title: 'City Energy Championship',
    description: 'Teams compete to achieve the highest energy savings across the city. Join forces with your neighbors!',
    type: 'competition',
    category: 'energy_saving',
    teamSize: 'squad',
    maxParticipants: 200,
    registrationStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    registrationEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    endDate: new Date(Date.now() + 51 * 24 * 60 * 60 * 1000), // 7+ weeks from now
    status: 'upcoming',
    levelRequirement: 5,
    objectives: [
      {
        id: 'team_energy_savings',
        description: 'Total energy saved by team',
        type: 'collective',
        target: 500,
        unit: 'kWh',
        weight: 0.4,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'team_efficiency_average',
        description: 'Team average efficiency rating',
        type: 'team_average',
        target: 85,
        unit: '%',
        weight: 0.3,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'community_engagement',
        description: 'Community interactions and helps',
        type: 'collective',
        target: 100,
        unit: 'actions',
        weight: 0.3,
        currentProgress: 0,
        isCompleted: false
      }
    ],
    rewards: [
      {
        position: 1,
        type: 'points',
        value: 5000,
        description: 'First place team - 5000 points each member',
        icon: '🥇',
        recipients: []
      },
      {
        position: 2,
        type: 'points',
        value: 3000,
        description: 'Second place team - 3000 points each member',
        icon: '🥈',
        recipients: []
      },
      {
        position: 3,
        type: 'points',
        value: 2000,
        description: 'Third place team - 2000 points each member',
        icon: '🥉',
        recipients: []
      },
      {
        position: 0,
        type: 'badge',
        value: 'city_champion_participant',
        description: 'City Champion Participant Badge',
        icon: '🏙️',
        recipients: []
      }
    ],
    createdBy: 'system'
  },

  {
    title: 'Solar Innovators Guild',
    description: 'Collaborate with solar energy experts to push efficiency boundaries. Share knowledge, compete in innovation challenges.',
    type: 'collaboration',
    category: 'innovation',
    teamSize: 'guild',
    maxParticipants: 50,
    registrationStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    registrationEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000), // 3 months
    status: 'upcoming',
    levelRequirement: 15,
    specialtyRequirements: ['solar_expert', 'green_innovator'],
    objectives: [
      {
        id: 'innovation_projects',
        description: 'Complete innovation projects',
        type: 'collective',
        target: 10,
        unit: 'projects',
        weight: 0.4,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'knowledge_sharing',
        description: 'Share knowledge and help other members',
        type: 'collective',
        target: 200,
        unit: 'interactions',
        weight: 0.3,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'efficiency_improvements',
        description: 'Collective efficiency improvements',
        type: 'collective',
        target: 25,
        unit: '%',
        weight: 0.3,
        currentProgress: 0,
        isCompleted: false
      }
    ],
    rewards: [
      {
        position: 0,
        type: 'title',
        value: 'Solar Innovation Pioneer',
        description: 'Exclusive title for guild members',
        icon: '☀️',
        recipients: []
      },
      {
        position: 0,
        type: 'exclusive_item',
        value: 'solar_calculator_premium',
        description: 'Premium solar calculator tool',
        icon: '🔧',
        recipients: []
      }
    ],
    createdBy: 'system'
  },

  {
    title: 'Peak Hour Warriors',
    description: 'Master the art of peak hour optimization. Individual challenge to become the ultimate peak hour warrior.',
    type: 'challenge',
    category: 'efficiency',
    teamSize: 'solo',
    maxParticipants: 1000,
    registrationStart: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
    status: 'upcoming',
    levelRequirement: 8,
    objectives: [
      {
        id: 'peak_hour_optimization',
        description: 'Reduce peak hour consumption',
        type: 'individual',
        target: 30,
        unit: '%',
        weight: 0.5,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'consistency_score',
        description: 'Maintain consistent optimization',
        type: 'individual',
        target: 14,
        unit: 'days',
        weight: 0.3,
        currentProgress: 0,
        isCompleted: false
      },
      {
        id: 'total_savings',
        description: 'Total energy saved during challenge',
        type: 'individual',
        target: 100,
        unit: 'kWh',
        weight: 0.2,
        currentProgress: 0,
        isCompleted: false
      }
    ],
    rewards: [
      {
        position: 1,
        type: 'points',
        value: 2500,
        description: 'Peak Hour Master - 2500 points',
        icon: '⚡',
        recipients: []
      },
      {
        position: 2,
        type: 'points',
        value: 2000,
        description: 'Peak Hour Expert - 2000 points',
        icon: '🏆',
        recipients: []
      },
      {
        position: 3,
        type: 'points',
        value: 1500,
        description: 'Peak Hour Warrior - 1500 points',
        icon: '⚔️',
        recipients: []
      }
    ],
    createdBy: 'system'
  }
];

// Community Gaming System Class
export class CommunityGamingSystem {
  private challenges: CommunityChallenge[] = [];
  private teams: CommunityTeam[] = [];
  private members: CommunityMember[] = [];
  private posts: CommunityPost[] = [];
  private events: CommunityEvent[] = [];

  constructor() {
    this.initializeSystem();
  }

  private initializeSystem() {
    // Initialize with predefined challenges
    this.challenges = COMMUNITY_CHALLENGES.map((template, index) => ({
      ...template,
      id: `challenge_${Date.now()}_${index}`,
      createdAt: new Date(),
      registeredTeams: [],
      registeredUsers: [],
      currentParticipants: 0,
      leaderboard: {
        entries: [],
        lastUpdated: new Date()
      }
    }));

    // Generate sample community data
    this.generateSampleData();
  }

  private generateSampleData() {
    // Generate sample teams
    const sampleTeams = [
      {
        name: 'EcoWarriors',
        description: 'Dedicated to maximum energy efficiency and environmental impact.',
        maxMembers: 8,
        isPrivate: false,
        requirements: { minLevel: 5, maxMembers: 8, inviteOnly: false }
      },
      {
        name: 'Solar Pioneers',
        description: 'Leading the renewable energy revolution in our community.',
        maxMembers: 12,
        isPrivate: false,
        requirements: { minLevel: 10, maxMembers: 12, inviteOnly: false, requiredSpecializations: ['solar_expert' as const] }
      },
      {
        name: 'Peak Hour Optimizers',
        description: 'Masters of energy consumption timing and efficiency.',
        maxMembers: 6,
        isPrivate: true,
        requirements: { minLevel: 15, maxMembers: 6, inviteOnly: true, requiredSpecializations: ['peak_optimizer' as const] }
      }
    ];

    this.teams = sampleTeams.map((team, index) => ({
      id: `team_${Date.now()}_${index}`,
      ...team,
      members: [],
      leader: `user_leader_${index}`,
      totalPoints: Math.floor(Math.random() * 50000) + 10000,
      achievements: [],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      stats: {
        totalEnergyySaved: Math.floor(Math.random() * 1000) + 500,
        totalCO2Reduced: Math.floor(Math.random() * 500) + 200,
        totalMoneySaved: Math.floor(Math.random() * 10000) + 5000,
        averageEfficiency: Math.floor(Math.random() * 20) + 75,
        completedChallenges: Math.floor(Math.random() * 10) + 2,
        winRate: Math.random() * 0.6 + 0.2
      }
    }));

    // Generate sample members
    this.members = Array.from({ length: 50 }, (_, index) => ({
      userId: `user_${index + 1}`,
      username: `EcoChampion${index + 1}`,
      level: Math.floor(Math.random() * 25) + 1,
      totalPoints: Math.floor(Math.random() * 30000) + 1000,
      joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      role: 'member' as const,
      achievements: [],
      specializations: this.generateRandomSpecializations(),
      stats: {
        totalEnergyySaved: Math.floor(Math.random() * 500) + 100,
        co2Reduced: Math.floor(Math.random() * 200) + 50,
        moneySaved: Math.floor(Math.random() * 5000) + 1000,
        questsCompleted: Math.floor(Math.random() * 50) + 10,
        communityHelps: Math.floor(Math.random() * 20),
        streakRecord: Math.floor(Math.random() * 60) + 5,
        averageEfficiency: Math.floor(Math.random() * 30) + 65
      }
    }));

    // Generate sample posts
    this.generateSamplePosts();
  }

  private generateRandomSpecializations(): EnergySpecialization[] {
    const allTypes: EnergySpecialization['type'][] = ['solar_expert', 'efficiency_guru', 'peak_optimizer', 'green_innovator', 'community_helper'];
    const numSpecializations = Math.floor(Math.random() * 3) + 1;
    const selectedTypes = allTypes.sort(() => 0.5 - Math.random()).slice(0, numSpecializations);

    return selectedTypes.map(type => ({
      type,
      level: Math.floor(Math.random() * 5) + 1,
      experience: Math.floor(Math.random() * 1000) + 100,
      badge: this.getSpecializationBadge(type),
      description: this.getSpecializationDescription(type)
    }));
  }

  private getSpecializationBadge(type: EnergySpecialization['type']): string {
    const badges = {
      'solar_expert': '☀️',
      'efficiency_guru': '⚡',
      'peak_optimizer': '📊',
      'green_innovator': '🌱',
      'community_helper': '🤝'
    };
    return badges[type];
  }

  private getSpecializationDescription(type: EnergySpecialization['type']): string {
    const descriptions = {
      'solar_expert': 'Master of solar energy optimization and renewable solutions',
      'efficiency_guru': 'Expert in energy efficiency and consumption optimization',
      'peak_optimizer': 'Specialist in peak hour energy management',
      'green_innovator': 'Pioneer in sustainable energy innovations',
      'community_helper': 'Dedicated to helping others achieve their energy goals'
    };
    return descriptions[type];
  }

  private generateSamplePosts() {
    const samplePosts = [
      {
        type: 'tip' as const,
        content: 'Pro tip: Running your dishwasher during off-peak hours (11 PM - 6 AM) can save up to 30% on energy costs! 💡',
        tags: ['tips', 'peak-hours', 'savings']
      },
      {
        type: 'achievement' as const,
        content: 'Just hit my 30-day energy saving streak! 🔥 Consistency is key to building sustainable habits.',
        tags: ['streak', 'achievement', 'motivation']
      },
      {
        type: 'question' as const,
        content: 'Has anyone tried smart plugs for standby power management? Looking for recommendations! 🔌',
        tags: ['question', 'smart-home', 'standby-power']
      },
      {
        type: 'celebration' as const,
        content: 'Our team EcoWarriors just completed the Monthly Energy Challenge! 🏆 Great work everyone!',
        tags: ['team', 'challenge', 'celebration']
      }
    ];

    this.posts = samplePosts.map((post, index) => ({
      id: `post_${Date.now()}_${index}`,
      authorId: `user_${Math.floor(Math.random() * 10) + 1}`,
      authorName: `EcoChampion${Math.floor(Math.random() * 10) + 1}`,
      ...post,
      likes: Math.floor(Math.random() * 20) + 1,
      likedBy: [],
      comments: [],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  }

  // Challenge Management
  registerForChallenge(challengeId: string, participantId: string, participantType: 'user' | 'team'): boolean {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    if (challenge.status !== 'upcoming' || new Date() > challenge.registrationEnd) {
      return false;
    }

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return false;
    }

    if (participantType === 'user') {
      const user = this.members.find(m => m.userId === participantId);
      if (!user || user.level < challenge.levelRequirement) return false;
      
      if (!challenge.registeredUsers.find(u => u.userId === participantId)) {
        challenge.registeredUsers.push(user);
        challenge.currentParticipants++;
      }
    } else {
      const team = this.teams.find(t => t.id === participantId);
      if (!team) return false;
      
      if (!challenge.registeredTeams.find(t => t.id === participantId)) {
        challenge.registeredTeams.push(team);
        challenge.currentParticipants += team.members.length;
      }
    }

    return true;
  }

  getChallenges(status?: CommunityStatus): CommunityChallenge[] {
    return status ? this.challenges.filter(c => c.status === status) : this.challenges;
  }

  // Team Management
  createTeam(name: string, description: string, leaderId: string, requirements: TeamRequirements): string {
    const teamId = `team_${Date.now()}_${Math.random()}`;
    
    const newTeam: CommunityTeam = {
      id: teamId,
      name,
      description,
      members: [],
      leader: leaderId,
      maxMembers: requirements.maxMembers,
      totalPoints: 0,
      achievements: [],
      createdAt: new Date(),
      isPrivate: requirements.inviteOnly,
      requirements,
      stats: {
        totalEnergyySaved: 0,
        totalCO2Reduced: 0,
        totalMoneySaved: 0,
        averageEfficiency: 0,
        completedChallenges: 0,
        winRate: 0
      }
    };

    this.teams.push(newTeam);
    return teamId;
  }

  joinTeam(teamId: string, userId: string): boolean {
    const team = this.teams.find(t => t.id === teamId);
    const user = this.members.find(m => m.userId === userId);
    
    if (!team || !user) return false;
    
    if (team.members.length >= team.maxMembers) return false;
    if (user.level < team.requirements.minLevel) return false;
    if (team.members.find(m => m.userId === userId)) return false;

    // Check specialization requirements
    if (team.requirements.requiredSpecializations) {
      const hasRequiredSpecs = team.requirements.requiredSpecializations.some(reqSpec =>
        user.specializations.some(userSpec => userSpec.type === reqSpec)
      );
      if (!hasRequiredSpecs) return false;
    }

    team.members.push(user);
    return true;
  }

  getTeams(): CommunityTeam[] {
    return this.teams;
  }

  // Community Feed
  createPost(authorId: string, content: string, type: CommunityPost['type'], tags: string[] = []): string {
    const author = this.members.find(m => m.userId === authorId);
    if (!author) throw new Error('Author not found');

    const postId = `post_${Date.now()}_${Math.random()}`;
    
    const newPost: CommunityPost = {
      id: postId,
      authorId,
      authorName: author.username,
      content,
      type,
      tags,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date()
    };

    this.posts.unshift(newPost); // Add to beginning for chronological order
    return postId;
  }

  likePost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const alreadyLiked = post.likedBy.includes(userId);
    
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes--;
    } else {
      post.likedBy.push(userId);
      post.likes++;
    }

    return true;
  }

  addComment(postId: string, authorId: string, content: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    const author = this.members.find(m => m.userId === authorId);
    
    if (!post || !author) return false;

    const comment: CommunityComment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      authorId,
      authorName: author.username,
      content,
      likes: 0,
      likedBy: [],
      createdAt: new Date()
    };

    post.comments.push(comment);
    return true;
  }

  getPosts(limit: number = 20): CommunityPost[] {
    return this.posts.slice(0, limit);
  }

  // Community Stats
  getCommunityStats(): {
    totalMembers: number;
    totalTeams: number;
    activeChallenges: number;
    totalEnergySaved: number;
    totalCO2Reduced: number;
    communityLevel: number;
  } {
    const totalEnergySaved = this.members.reduce((sum, member) => sum + member.stats.totalEnergyySaved, 0);
    const totalCO2Reduced = this.members.reduce((sum, member) => sum + member.stats.co2Reduced, 0);
    const activeChallenges = this.challenges.filter(c => c.status === 'active').length;
    
    // Community level based on collective achievements
    const communityLevel = Math.floor(totalEnergySaved / 1000) + Math.floor(totalCO2Reduced / 100) + 1;

    return {
      totalMembers: this.members.length,
      totalTeams: this.teams.length,
      activeChallenges,
      totalEnergySaved,
      totalCO2Reduced,
      communityLevel
    };
  }

  // Get user's community activity
  getUserCommunityProfile(userId: string): {
    member: CommunityMember | null;
    teams: CommunityTeam[];
    activeChallenges: CommunityChallenge[];
    posts: CommunityPost[];
    rank: number;
  } {
    const member = this.members.find(m => m.userId === userId);
    if (!member) {
      return { member: null, teams: [], activeChallenges: [], posts: [], rank: 0 };
    }

    const teams = this.teams.filter(team => team.members.some(m => m.userId === userId));
    const activeChallenges = this.challenges.filter(challenge => 
      challenge.registeredUsers.some(u => u.userId === userId) ||
      challenge.registeredTeams.some(team => team.members.some(m => m.userId === userId))
    );
    const posts = this.posts.filter(p => p.authorId === userId);
    
    // Calculate user rank based on total points
    const sortedMembers = this.members.sort((a, b) => b.totalPoints - a.totalPoints);
    const rank = sortedMembers.findIndex(m => m.userId === userId) + 1;

    return {
      member,
      teams,
      activeChallenges,
      posts,
      rank
    };
  }
}

// Export singleton instance
export const communityGamingSystem = new CommunityGamingSystem();
