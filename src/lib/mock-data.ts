import type { Badge, Quest, SmartMeterBrand } from './types';
import { Leaf, Zap, Sun, Users, Megaphone, Home, Search, Target, Clock, Calendar } from 'lucide-react';

export const badges: Omit<Badge, 'unlocked'>[] = [
  { name: 'Energy Saver', requirement: 'Save 100 kWh', icon: Leaf },
  { name: 'Peak Buster', requirement: 'Avoid 10 peak hours', icon: Zap },
  { name: 'Weather Warrior', requirement: 'Complete 20 weather quests', icon: Sun },
  { name: 'Team Player', requirement: 'Win 5 group challenges', icon: Users },
  { name: 'Influencer', requirement: 'Get 10 friends to join', icon: Megaphone },
  { name: 'Smart Home Pro', requirement: 'Connect 5+ devices', icon: Home },
  { name: 'Data Detective', requirement: 'Analyze usage for 30 days', icon: Search },
];

export const questTemplates: Omit<Quest, 'id' | 'progress' | 'target' | 'unit' | 'reward' | 'unlocked'>[] = [
    {
      title: "Morning Energy Hero",
      description: "Keep usage under 2kW during 6-9 AM",
      type: 'daily',
      icon: Target,
    },
    {
      title: "Beat Last Week",
      description: "Use 10% less energy than last week",
      type: 'weekly',
      icon: Calendar,
    },
    {
      title: "Night Owl Efficiency",
      description: "Turn off standby devices after 11 PM",
      type: 'daily',
      icon: Clock,
    },
    {
      title: "Heat Wave Challenge",
      description: "Set AC to 26°C or higher for 4 hours",
      type: 'daily',
      icon: Sun,
    },
];

export const smartMeterBrands: SmartMeterBrand[] = [
    { name: 'Qube', logoUrl: 'https://picsum.photos/seed/qube/200/120' },
    { name: 'Secure', logoUrl: 'https://picsum.photos/seed/secure/200/120' },
    { name: 'L&T', logoUrl: 'https://picsum.photos/seed/lnt/200/120' },
    { name: 'Genus', logoUrl: 'https://picsum.photos/seed/genus/200/120' },
    { name: 'HPL', logoUrl: 'https://picsum.photos/seed/hpl/200/120' },
    { name: 'Tata Power', logoUrl: 'https://picsum.photos/seed/tata/200/120' },
    { name: 'Adani', logoUrl: 'https://picsum.photos/seed/adani/200/120' },
    { name: 'BSES', logoUrl: 'https://picsum.photos/seed/bses/200/120' },
];
