import type { LucideIcon } from "lucide-react";
import { z } from 'zod';

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

export const QuestGenerationInputSchema = z.object({
  existingQuests: z.string().describe('A comma-separated list of titles of the user’s current quests.'),
  deviceStatus: z.string().describe('The status of connected smart home devices, such as AC temperature settings and lighting status.'),
});
export type QuestGenerationInput = z.infer<typeof QuestGenerationInputSchema>;

export const QuestGenerationOutputSchema = z.object({
    quest: z.object({
        title: z.string().describe('A short, engaging title for the quest.'),
        description: z.string().describe('A one-sentence description of the quest.'),
        progress: z.number().describe('The starting progress, which should always be 0.'),
        target: z.number().describe('The numerical target for the quest.'),
        unit: z.string().describe('The unit for the target (e.g., "hours", "kWh", "°C").'),
        reward: z.number().describe('The number of points awarded for completing the quest. Typically between 200 and 500.'),
        type: z.enum(['daily', 'weekly', 'event']).describe('The type of quest. Most should be "event" type for AI-generated quests.')
    })
});
export type QuestGenerationOutput = z.infer<typeof QuestGenerationOutputSchema>;
