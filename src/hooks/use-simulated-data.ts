'use client';

import { useState, useEffect } from 'react';
import type { SmartMeterDevice, Quest, LeaderboardUser, Badge } from '@/lib/types';
import { questTemplates, badges as badgeTemplates } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const useSimulatedData = () => {
  const [smartDevices, setSmartDevices] = useState<SmartMeterDevice[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [overview, setOverview] = useState({
    wattsPoints: 0,
    kwhSaved: 0,
    moneySaved: 0,
    questsCompleted: 0,
  });
  const [energyUsage, setEnergyUsage] = useState<any[]>([]);

  useEffect(() => {
    // === Smart Devices ===
    const simulateDevices = (): SmartMeterDevice[] => [
      {
        id: 'qube_main',
        brand: 'Qube',
        type: 'main_meter',
        location: 'Main House',
        currentUsage: Number((Math.random() * 5 + 2).toFixed(2)),
        isOnline: true,
        lastReading: new Date(),
      },
      {
        id: 'secure_ac',
        brand: 'Secure',
        type: 'ac_meter',
        location: 'Living Room AC',
        currentUsage: Number((Math.random() * 2.5 + 0.5).toFixed(2)),
        temperature: Number((Math.random() * 5 + 22).toFixed(1)),
        isOnline: true,
        lastReading: new Date(),
      },
       {
        id: 'tplink_tv',
        brand: 'TP-Link',
        type: 'outlet',
        location: 'TV Outlet',
        currentUsage: Number((Math.random() * 0.5).toFixed(2)),
        isOnline: true,
        status: Math.random() > 0.5 ? 'on' : 'off',
        lastReading: new Date(),
      },
      {
        id: 'hue_lights',
        brand: 'Philips Hue',
        type: 'light',
        location: 'Bedroom Lights',
        currentUsage: Number((Math.random() * 0.1).toFixed(2)),
        isOnline: true,
        status: Math.random() > 0.3 ? 'on' : 'auto_dimmed',
        lastReading: new Date(),
      },
    ];
    setSmartDevices(simulateDevices());
    const interval = setInterval(() => setSmartDevices(simulateDevices()), 5000);

    // === Quests ===
    const generateQuests = (): Quest[] => {
      return questTemplates.map((template, index) => {
        const progress = Math.random();
        const target = template.type === 'weekly' ? 100 : template.title.includes('2kW') ? 2 : 4;
        const unit = template.type === 'weekly' ? '%' : template.title.includes('2kW') ? 'kW' : 'hrs';
        
        return {
          ...template,
          id: `quest-${index}`,
          progress: Math.floor(progress * target),
          target: target,
          unit: unit,
          reward: template.type === 'weekly' ? 500 : 150,
        };
      });
    };
    setQuests(generateQuests());
    
    // === Leaderboard ===
    const users = ['You', 'Alex', 'Maria', 'Chen', 'Sarah'];
    const generateLeaderboard = (): LeaderboardUser[] => {
        return users.map((name, index) => ({
            rank: index + 1,
            avatar: PlaceHolderImages.find(p => p.id === `user-avatar-${index+1}`)?.imageUrl || '',
            name: name,
            points: 12500 - (index * 1200) + Math.floor(Math.random() * 500),
            change: Math.floor(Math.random() * 5 - 2)
        })).sort((a,b) => b.points - a.points).map((u, i) => ({...u, rank: i+1}));
    };
    setLeaderboard(generateLeaderboard());

    // === Badges ===
    const generateBadges = (): Badge[] => {
        return badgeTemplates.map(b => ({
            ...b,
            unlocked: Math.random() > 0.4
        }));
    };
    setBadges(generateBadges());

    // === Overview ===
    setOverview({
        wattsPoints: Math.floor(12500 + Math.random() * 1000),
        kwhSaved: Number((85.3 + Math.random() * 10).toFixed(1)),
        moneySaved: Number((426.5 + Math.random() * 50).toFixed(2)),
        questsCompleted: Math.floor(12 + Math.random() * 5),
    });

    // === Energy Usage Chart Data ===
    const generateChartData = () => {
        const data = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.push({
                name: `${time.getHours()}:00`,
                usage: Number((Math.random() * 4 + 1).toFixed(2)), // Random usage between 1 and 5 kWh
            });
        }
        return data;
    }
    setEnergyUsage(generateChartData());


    return () => clearInterval(interval);
  }, []);

  return { smartDevices, quests, leaderboard, badges, overview, energyUsage };
};
