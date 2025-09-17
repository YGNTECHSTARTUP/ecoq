'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GameAppliance {
  id: string;
  name: string;
  isOn: boolean;
  powerUsage: number;
  category: string;
  efficiencyLevel: number;
}

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  reward: number;
  isCompleted: boolean;
}

export interface GameState {
  score: number;
  totalEnergyConsumed: number;
  currentPowerConsumption: number;
  appliances: Record<string, GameAppliance>;
  quests: {
    active: GameQuest[];
    completed: GameQuest[];
  };
}

export type QuickActionType = 'energy_saving_mode' | 'high_usage_simulation' | 'random_appliance_toggle';

export interface GameActionResult {
  success: boolean;
  message: string;
  scoreChange?: number;
  questCompleted?: boolean;
}

export function useDemoGame(consumerId?: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDemoConsumer = consumerId?.startsWith('DEMO');

  // Fetch current game state
  const fetchGameState = useCallback(async () => {
    if (!isDemoConsumer) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mock-smart-meter?endpoint=game-state&consumerId=${consumerId}`);
      const data = await response.json();

      if (response.ok) {
        setGameState(data.gameState);
      } else {
        setError(data.error || 'Failed to fetch game state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [consumerId, isDemoConsumer]);

  // Execute game action
  const executeAction = useCallback(async (
    action: 'toggle-appliance' | 'upgrade-appliance' | 'execute-quick-action',
    targetId: string
  ): Promise<GameActionResult> => {
    if (!isDemoConsumer) {
      return { success: false, message: 'Game actions only available for demo consumers' };
    }

    setError(null);

    try {
      const response = await fetch('/api/mock-smart-meter?endpoint=game-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumerId,
          action,
          targetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh game state after action
        await fetchGameState();

        return {
          success: true,
          message: data.result?.message || 'Action completed successfully',
          scoreChange: data.result?.scoreChange,
          questCompleted: data.result?.questCompleted,
        };
      } else {
        const errorMessage = data.error || 'Action failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [consumerId, isDemoConsumer, fetchGameState]);

  // Toggle appliance
  const toggleAppliance = useCallback((applianceId: string) => {
    return executeAction('toggle-appliance', applianceId);
  }, [executeAction]);

  // Upgrade appliance
  const upgradeAppliance = useCallback((applianceId: string) => {
    return executeAction('upgrade-appliance', applianceId);
  }, [executeAction]);

  // Execute quick action
  const executeQuickAction = useCallback((actionType: QuickActionType) => {
    return executeAction('execute-quick-action', actionType);
  }, [executeAction]);

  // Fetch real-time power data with game info
  const fetchRealtimeData = useCallback(async () => {
    if (!isDemoConsumer) return null;

    try {
      const response = await fetch(`/api/mock-smart-meter?endpoint=realtime&consumerId=${consumerId}`);
      const data = await response.json();

      if (response.ok) {
        return {
          instantPower: data.instantPower,
          voltage: data.voltage,
          current: data.current,
          frequency: data.frequency,
          powerFactor: data.powerFactor,
          timestamp: data.timestamp,
          phaseData: data.phaseData,
          gameData: data.gameData,
        };
      }
    } catch (err) {
      console.error('Failed to fetch realtime data:', err);
    }

    return null;
  }, [consumerId, isDemoConsumer]);

  // Auto-refresh game state
  useEffect(() => {
    if (isDemoConsumer) {
      fetchGameState();

      // Refresh every 30 seconds to keep state updated
      const interval = setInterval(fetchGameState, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchGameState, isDemoConsumer]);

  return {
    gameState,
    isLoading,
    error,
    isDemoConsumer,
    // Actions
    fetchGameState,
    toggleAppliance,
    upgradeAppliance,
    executeQuickAction,
    fetchRealtimeData,
    // Computed values
    activeQuestCount: gameState?.quests.active.length || 0,
    completedQuestCount: gameState?.quests.completed.length || 0,
    totalScore: gameState?.score || 0,
    currentPower: gameState?.currentPowerConsumption || 0,
    activeAppliances: gameState ? 
      Object.values(gameState.appliances).filter(appliance => appliance.isOn) : [],
  };
}