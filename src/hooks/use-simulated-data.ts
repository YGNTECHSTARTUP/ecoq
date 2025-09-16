'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SmartMeterDevice, Quest, LeaderboardUser, Badge, Overview, SimulationScenario } from '@/lib/types';
import { questTemplates, badges as badgeTemplates } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response.json();
      }
      console.error(`API call failed with status: ${response.status} for ${url}`);
    } catch (error) {
      console.error(`API call failed with error for ${url}:`, error);
    }
    if (i < retries - 1) {
       await new Promise(res => setTimeout(res, delay));
    }
  }
  // Return null instead of throwing an error to allow for graceful fallbacks
  console.error(`Failed to fetch from ${url} after ${retries} retries.`);
  return null;
}


export const useSimulatedData = () => {
  const [smartDevices, setSmartDevices] = useState<SmartMeterDevice[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [overview, setOverview] = useState<Overview>({
    wattsPoints: 0,
    kwhSaved: 0,
    moneySaved: 0,
    questsCompleted: 0,
  });
  const [energyUsage, setEnergyUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenario>('normal');
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  const scenarioToHour: Record<SimulationScenario, number | undefined> = {
    normal: undefined,
    morning_peak: 8,
    evening_peak: 20,
    night_low: 2,
  };

  const generateSimulatedChartData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        let usage = 1.5 + Math.random(); // base usage
        const h = hour.getHours();

        // Simulate peaks
        if (h >= 6 && h <= 9) usage *= 1.4;
        if (h >= 18 && h <= 21) usage *= 1.7;
        if (h >= 0 && h <= 5) usage *= 0.4;
        
        data.push({
            name: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
            usage: parseFloat(usage.toFixed(2)),
        });
    }
    return data;
  };

  const fetchData = useCallback(async (scenario: SimulationScenario = 'normal') => {
    setLoading(true);
    try {
      const hour = scenarioToHour[scenario];
      const hourParam = hour !== undefined ? `&hour=${hour}` : '';

      // Fetch data from unified gateway which gives normalized data
      const qubePromise = fetchWithRetry(`/api/smart-meter/unifiedMeterGateway?meterId=QUBE_001&brand=QUBE&userId=user123${hourParam}`);
      const securePromise = fetchWithRetry(`/api/smart-meter/unifiedMeterGateway?meterId=SEC_002&brand=SECURE&userId=user123${hourParam}`);
      const lntPromise = fetchWithRetry(`/api/smart-meter/unifiedMeterGateway?meterId=LNT_003&brand=LNT&userId=user123${hourParam}`);

      const [qubeRes, secureRes, lntRes] = await Promise.all([qubePromise, securePromise, lntPromise]);

      const devices: SmartMeterDevice[] = [
        {
          id: qubeRes.meter_info.id,
          brand: 'Qube',
          type: 'main_meter',
          location: 'Main House',
          currentUsage: qubeRes.data.power.active_kw,
          isOnline: qubeRes.data.status.connection === 'online',
          lastReading: new Date(qubeRes.data.status.last_reading),
        },
        {
          id: secureRes.meter_info.id,
          brand: 'Secure',
          type: 'ac_meter',
          location: 'Living Room AC',
          currentUsage: secureRes.data.power.active_kw,
          isOnline: secureRes.data.status.connection === 'online',
          lastReading: new Date(secureRes.data.status.last_reading),
          temperature: Number((Math.random() * 5 + 22).toFixed(1)), // Keep some client-side simulation for UI variety
        },
        {
          id: lntRes.meter_info.id,
          brand: 'L&T',
          type: 'outlet',
          location: 'TV Outlet',
          currentUsage: lntRes.data.power.active_kw,
          isOnline: lntRes.data.status.connection === 'online',
          lastReading: new Date(lntRes.data.status.last_reading),
          status: lntRes.data.power.active_kw > 0.01 ? 'on' : 'off',
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
      setSmartDevices(devices);
      
      // Fetch historical data for chart
      const historicalRes = await fetchWithRetry('/api/smart-meter/secureMetersData?deviceId=SEC_HIST_01&dataType=historical');
      
      let chartData;
      let totalKwhSaved = 0;
      let moneySaved = 0;

      if (historicalRes && historicalRes.readings) {
          chartData = historicalRes.readings.map((reading: any) => ({
            name: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
            usage: reading.energy_kwh,
          }));
          totalKwhSaved = chartData.reduce((acc: number, curr: any) => acc + (2.5 - curr.usage > 0 ? 2.5 - curr.usage : 0), 0);
          moneySaved = historicalRes.summary.total_cost_inr;
      } else {
          console.log("Falling back to simulated chart data.");
          chartData = generateSimulatedChartData();
          totalKwhSaved = chartData.reduce((acc, curr) => acc + Math.max(0, 1.8 - curr.usage), 0);
          moneySaved = totalKwhSaved * 5.5; // Approximate cost
      }
      setEnergyUsage(chartData);

      // Other data can remain client-side simulated for now
      setOverview({
        wattsPoints: Math.floor(12500 + Math.random() * 1000),
        kwhSaved: Number(totalKwhSaved.toFixed(1)),
        moneySaved: Number(moneySaved.toFixed(2)),
        questsCompleted: Math.floor(12 + Math.random() * 5),
      });

    } catch (error) {
      console.error("Failed to fetch simulated data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScenarioChange = (scenario: SimulationScenario) => {
    setSimulationScenario(scenario);
    fetchData(scenario); // Fetch immediately on change
    if (simulationInterval) {
      clearInterval(simulationInterval);
    }
    // Restart interval with new scenario
    const newInterval = setInterval(() => fetchData(scenario), 10000);
    setSimulationInterval(newInterval);
  };


  useEffect(() => {
    fetchData(); // Initial fetch
    
    // Static data (can be fetched once)
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

    const generateBadges = (): Badge[] => {
        return badgeTemplates.map(b => ({
            ...b,
            unlocked: Math.random() > 0.4
        }));
    };
    setBadges(generateBadges());

    const newInterval = setInterval(fetchData, 10000); // Re-fetch every 10 seconds
    setSimulationInterval(newInterval);
    return () => {
      if (newInterval) clearInterval(newInterval);
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, []);

  return { smartDevices, quests, leaderboard, badges, overview, energyUsage, loading, handleScenarioChange };
};
