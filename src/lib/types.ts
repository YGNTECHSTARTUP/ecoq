import type { LucideIcon } from "lucide-react";

export interface SmartMeterDevice {
  id: string;
  brand: 'Qube' | 'Secure' | 'L&T' | 'Genus' | 'HPL' | 'Xiaomi' | 'Philips Hue' | 'TP-Link';
  type: 'main_meter' | 'plug_meter' | 'ac_meter' | 'appliance_meter' | 'light' | 'outlet';
  location: string;
  currentUsage: number;
  dailyUsage?: number;
  monthlyUsage?: number;
  isOnline: boolean;
  lastReading: Date;
  temperature?: number; // for AC
  status?: 'on' | 'off' | 'auto_dimmed'; // for lights
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unit: string;
  reward: number;
  type: 'daily' | 'weekly' | 'event';
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
}

export interface Badge {
  name: string;
  requirement: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

export interface LeaderboardUser {
  rank: number;
  avatar: string;
  name: string;
  points: number;
  change: number;
}

export interface SmartMeterBrand {
  name: string;
  logoUrl: string;
}

export interface Overview {
    wattsPoints: number;
    kwhSaved: number;
    moneySaved: number;
    questsCompleted: number;
}

export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    airQuality: {
        index: number;
        category: string;
    };
}

export type SimulationScenario = 'normal' | 'morning_peak' | 'evening_peak' | 'night_low';
