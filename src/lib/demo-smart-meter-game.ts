/**
 * Demo Smart Meter Gaming System
 * Interactive gaming engine that connects quests with demo smart meter actions
 */

export interface DemoMeterState {
  consumerId: string;
  currentReading: number;
  instantPower: number; // Current power consumption in watts
  baseLoad: number; // Base power consumption
  appliances: Map<string, ApplianceState>;
  voltage: { r: number; y: number; b: number };
  powerFactor: number;
  dailyConsumption: number;
  weeklyConsumption: number;
  monthlyConsumption: number;
  lastAction: string;
  lastActionTime: Date;
  gameScore: number;
  activeQuests: string[];
  completedQuests: string[];
}

export interface ApplianceState {
  id: string;
  name: string;
  isOn: boolean;
  powerRating: number; // Watts
  category: 'lighting' | 'cooling' | 'heating' | 'electronics' | 'appliances';
  efficiency: 'low' | 'medium' | 'high'; // Energy efficiency
  controllable: boolean;
  autoControl: boolean; // AI-controlled optimization
}

export interface GameAction {
  id: string;
  type: 'appliance_control' | 'efficiency_upgrade' | 'solar_panel' | 'time_shift' | 'behavior_change';
  name: string;
  description: string;
  icon: string;
  energyImpact: number; // Positive = increase consumption, Negative = decrease
  cost: number; // In game points
  questTriggers: string[]; // Which quests this action can help complete
  category: 'increase' | 'decrease' | 'optimize' | 'upgrade';
  unlockLevel: number;
}

export interface QuestValidation {
  questId: string;
  type: 'energy_reduction' | 'efficiency_improvement' | 'peak_avoidance' | 'solar_usage' | 'behavioral';
  target: number; // Target value (e.g., reduce by 20%)
  currentProgress: number; // 0-100%
  requiredActions: string[];
  timeframe: 'instant' | 'hourly' | 'daily' | 'weekly';
  tolerance: number; // Acceptable variance
}

// Demo appliances with realistic power ratings
const DEFAULT_APPLIANCES: ApplianceState[] = [
  // Lighting
  { id: 'led_living', name: 'Living Room LED (12W)', isOn: true, powerRating: 12, category: 'lighting', efficiency: 'high', controllable: true, autoControl: false },
  { id: 'led_bedroom', name: 'Bedroom LED (8W)', isOn: false, powerRating: 8, category: 'lighting', efficiency: 'high', controllable: true, autoControl: false },
  { id: 'cfl_kitchen', name: 'Kitchen CFL (20W)', isOn: true, powerRating: 20, category: 'lighting', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'bulb_bathroom', name: 'Bathroom Bulb (60W)', isOn: false, powerRating: 60, category: 'lighting', efficiency: 'low', controllable: true, autoControl: false },
  
  // Cooling
  { id: 'ac_living', name: 'Living Room AC (1500W)', isOn: false, powerRating: 1500, category: 'cooling', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'ac_bedroom', name: 'Bedroom AC (1200W)', isOn: false, powerRating: 1200, category: 'cooling', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'fan_living', name: 'Ceiling Fan Living (75W)', isOn: true, powerRating: 75, category: 'cooling', efficiency: 'high', controllable: true, autoControl: false },
  { id: 'fan_bedroom', name: 'Ceiling Fan Bedroom (75W)', isOn: false, powerRating: 75, category: 'cooling', efficiency: 'high', controllable: true, autoControl: false },
  
  // Electronics
  { id: 'tv_living', name: 'LED TV 43" (120W)', isOn: true, powerRating: 120, category: 'electronics', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'computer', name: 'Desktop Computer (300W)', isOn: true, powerRating: 300, category: 'electronics', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'router', name: 'WiFi Router (12W)', isOn: true, powerRating: 12, category: 'electronics', efficiency: 'medium', controllable: false, autoControl: false },
  { id: 'phone_charger', name: 'Phone Chargers (15W)', isOn: true, powerRating: 15, category: 'electronics', efficiency: 'medium', controllable: true, autoControl: false },
  
  // Appliances
  { id: 'fridge', name: 'Refrigerator (150W)', isOn: true, powerRating: 150, category: 'appliances', efficiency: 'medium', controllable: false, autoControl: false },
  { id: 'washing_machine', name: 'Washing Machine (500W)', isOn: false, powerRating: 500, category: 'appliances', efficiency: 'medium', controllable: true, autoControl: false },
  { id: 'water_heater', name: 'Water Heater (2000W)', isOn: false, powerRating: 2000, category: 'heating', efficiency: 'low', controllable: true, autoControl: false },
  { id: 'microwave', name: 'Microwave (800W)', isOn: false, powerRating: 800, category: 'appliances', efficiency: 'medium', controllable: true, autoControl: false }
];

// Game actions users can perform
const GAME_ACTIONS: GameAction[] = [
  // Energy Increasing Actions (for testing quests)
  {
    id: 'turn_on_ac',
    type: 'appliance_control',
    name: 'Turn On Air Conditioner',
    description: 'Increase power consumption by turning on AC',
    icon: '❄️',
    energyImpact: 1500,
    cost: 0,
    questTriggers: ['high_consumption_alert'],
    category: 'increase',
    unlockLevel: 1
  },
  {
    id: 'turn_on_heater',
    type: 'appliance_control',
    name: 'Turn On Water Heater',
    description: 'Heat water for hot shower (high energy use)',
    icon: '🔥',
    energyImpact: 2000,
    cost: 0,
    questTriggers: ['peak_demand_quest'],
    category: 'increase',
    unlockLevel: 1
  },
  {
    id: 'gaming_session',
    type: 'behavior_change',
    name: 'Extended Gaming Session',
    description: 'Turn on gaming setup + TV for 3 hours',
    icon: '🎮',
    energyImpact: 450,
    cost: 0,
    questTriggers: ['evening_peak_quest'],
    category: 'increase',
    unlockLevel: 1
  },
  
  // Energy Decreasing Actions (quest solutions)
  {
    id: 'optimize_ac',
    type: 'appliance_control',
    name: 'Optimize AC Temperature',
    description: 'Set AC to 26°C (optimal efficiency)',
    icon: '🌡️',
    energyImpact: -300,
    cost: 0,
    questTriggers: ['beat_the_heat'],
    category: 'optimize',
    unlockLevel: 1
  },
  {
    id: 'led_upgrade',
    type: 'efficiency_upgrade',
    name: 'Upgrade to LED Bulbs',
    description: 'Replace old bulbs with energy-efficient LEDs',
    icon: '💡',
    energyImpact: -48,
    cost: 100,
    questTriggers: ['lighting_efficiency'],
    category: 'upgrade',
    unlockLevel: 2
  },
  {
    id: 'smart_scheduling',
    type: 'time_shift',
    name: 'Schedule Heavy Appliances',
    description: 'Move washing machine to off-peak hours',
    icon: '⏰',
    energyImpact: -200,
    cost: 50,
    questTriggers: ['peak_avoidance'],
    category: 'optimize',
    unlockLevel: 2
  },
  {
    id: 'install_solar',
    type: 'solar_panel',
    name: 'Install Solar Panels',
    description: 'Add 1kW rooftop solar system',
    icon: '☀️',
    energyImpact: -1000,
    cost: 500,
    questTriggers: ['solar_warrior'],
    category: 'upgrade',
    unlockLevel: 3
  },
  {
    id: 'power_strip',
    type: 'appliance_control',
    name: 'Use Smart Power Strips',
    description: 'Eliminate phantom loads from electronics',
    icon: '🔌',
    energyImpact: -75,
    cost: 25,
    questTriggers: ['phantom_hunter'],
    category: 'optimize',
    unlockLevel: 1
  },
  {
    id: 'efficient_fridge',
    type: 'efficiency_upgrade',
    name: 'Upgrade Refrigerator',
    description: 'Replace old fridge with 5-star rated model',
    icon: '🧊',
    energyImpact: -50,
    cost: 300,
    questTriggers: ['appliance_upgrade'],
    category: 'upgrade',
    unlockLevel: 3
  }
];

export class DemoSmartMeterGame {
  private state: DemoMeterState;
  private gameActions: GameAction[];
  private questValidations: Map<string, QuestValidation>;
  private subscribers: ((state: DemoMeterState) => void)[] = [];

  constructor(consumerId: string = 'DEMO_GAME_USER') {
    this.gameActions = [...GAME_ACTIONS];
    this.questValidations = new Map();
    
    // Initialize demo meter state
    this.state = {
      consumerId,
      currentReading: 50000,
      instantPower: this.calculateBaseLoad(),
      baseLoad: 500, // Base load from always-on devices
      appliances: new Map(DEFAULT_APPLIANCES.map(app => [app.id, {...app}])),
      voltage: { r: 230, y: 235, b: 228 },
      powerFactor: 0.85,
      dailyConsumption: 0,
      weeklyConsumption: 0,
      monthlyConsumption: 0,
      lastAction: 'System initialized',
      lastActionTime: new Date(),
      gameScore: 0,
      activeQuests: [],
      completedQuests: []
    };

    this.updatePowerConsumption();
    this.startSimulation();
  }

  /**
   * Calculate base load from always-on appliances
   */
  private calculateBaseLoad(): number {
    let totalPower = 0;
    this.state?.appliances.forEach(appliance => {
      if (appliance.isOn) {
        totalPower += appliance.powerRating;
      }
    });
    return totalPower;
  }

  /**
   * Update real-time power consumption
   */
  private updatePowerConsumption(): void {
    const activePower = this.calculateBaseLoad();
    this.state.instantPower = activePower;
    
    // Add some realistic variation
    this.state.instantPower += (Math.random() - 0.5) * 100;
    
    // Update voltage slightly
    this.state.voltage = {
      r: 230 + (Math.random() - 0.5) * 10,
      y: 235 + (Math.random() - 0.5) * 10,
      b: 228 + (Math.random() - 0.5) * 10
    };

    // Update power factor based on load
    this.state.powerFactor = Math.max(0.75, Math.min(0.95, 0.85 + (Math.random() - 0.5) * 0.1));
  }

  /**
   * Start continuous simulation
   */
  private startSimulation(): void {
    setInterval(() => {
      this.updatePowerConsumption();
      this.updateConsumptionMetrics();
      this.validateActiveQuests();
      this.notifySubscribers();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update daily/weekly/monthly consumption
   */
  private updateConsumptionMetrics(): void {
    const hourlyConsumption = this.state.instantPower / 1000; // Convert to kWh
    this.state.dailyConsumption += hourlyConsumption / 720; // Approximate daily increment
    this.state.weeklyConsumption = this.state.dailyConsumption * 7;
    this.state.monthlyConsumption = this.state.dailyConsumption * 30;
    this.state.currentReading += hourlyConsumption / 720;
  }

  /**
   * Perform a game action
   */
  performAction(actionId: string): { success: boolean; message: string; questsTriggered: string[]; pointsEarned: number } {
    const action = this.gameActions.find(a => a.id === actionId);
    if (!action) {
      return { success: false, message: 'Action not found', questsTriggered: [], pointsEarned: 0 };
    }

    let pointsEarned = 0;
    let questsTriggered: string[] = [];

    // Execute the action
    switch (action.type) {
      case 'appliance_control':
        this.handleApplianceControl(action);
        break;
      case 'efficiency_upgrade':
        this.handleEfficiencyUpgrade(action);
        pointsEarned += 50; // Bonus for efficiency upgrades
        break;
      case 'solar_panel':
        this.handleSolarInstallation(action);
        pointsEarned += 200; // Big bonus for renewable energy
        break;
      case 'time_shift':
        this.handleTimeShift(action);
        pointsEarned += 30; // Bonus for peak avoidance
        break;
      case 'behavior_change':
        this.handleBehaviorChange(action);
        break;
    }

    // Update state
    this.state.lastAction = action.name;
    this.state.lastActionTime = new Date();
    
    // Check if any quests should be triggered
    questsTriggered = this.checkQuestTriggers(action);
    
    // Award points
    this.state.gameScore += pointsEarned;
    
    // Validate quest completion
    const completedQuests = this.validateActiveQuests();
    
    this.updatePowerConsumption();
    this.notifySubscribers();

    return {
      success: true,
      message: `${action.name} executed successfully!`,
      questsTriggered,
      pointsEarned
    };
  }

  /**
   * Handle appliance control actions
   */
  private handleApplianceControl(action: GameAction): void {
    switch (action.id) {
      case 'turn_on_ac':
        this.toggleAppliance('ac_living', true);
        this.toggleAppliance('ac_bedroom', true);
        break;
      case 'turn_on_heater':
        this.toggleAppliance('water_heater', true);
        break;
      case 'optimize_ac':
        // Simulate AC optimization (reduce power by ~20%)
        const livingAC = this.state.appliances.get('ac_living');
        const bedroomAC = this.state.appliances.get('ac_bedroom');
        if (livingAC?.isOn) livingAC.powerRating = Math.floor(livingAC.powerRating * 0.8);
        if (bedroomAC?.isOn) bedroomAC.powerRating = Math.floor(bedroomAC.powerRating * 0.8);
        break;
      case 'power_strip':
        // Reduce phantom loads
        const electronics = ['router', 'phone_charger'];
        electronics.forEach(id => {
          const device = this.state.appliances.get(id);
          if (device) device.powerRating = Math.floor(device.powerRating * 0.5);
        });
        break;
    }
  }

  /**
   * Handle efficiency upgrade actions
   */
  private handleEfficiencyUpgrade(action: GameAction): void {
    switch (action.id) {
      case 'led_upgrade':
        // Replace all inefficient bulbs with LEDs
        this.state.appliances.forEach(appliance => {
          if (appliance.category === 'lighting' && appliance.efficiency !== 'high') {
            appliance.powerRating = Math.floor(appliance.powerRating * 0.2); // LEDs use ~80% less
            appliance.efficiency = 'high';
            appliance.name = appliance.name.replace(/CFL|Bulb/, 'LED');
          }
        });
        break;
      case 'efficient_fridge':
        const fridge = this.state.appliances.get('fridge');
        if (fridge) {
          fridge.powerRating = Math.floor(fridge.powerRating * 0.67); // ~33% improvement
          fridge.efficiency = 'high';
        }
        break;
    }
  }

  /**
   * Handle solar panel installation
   */
  private handleSolarInstallation(action: GameAction): void {
    // Add virtual solar generation (reduces net consumption)
    this.state.baseLoad -= 1000; // 1kW solar offset
    
    // Add solar panel as a "negative consumption" appliance
    this.state.appliances.set('solar_panels', {
      id: 'solar_panels',
      name: 'Rooftop Solar (1kW)',
      isOn: true,
      powerRating: -1000, // Negative = generation
      category: 'appliances',
      efficiency: 'high',
      controllable: false,
      autoControl: false
    });
  }

  /**
   * Handle time shifting actions
   */
  private handleTimeShift(action: GameAction): void {
    // Simulate moving high-power appliances to off-peak
    const washingMachine = this.state.appliances.get('washing_machine');
    if (washingMachine) {
      washingMachine.autoControl = true;
      // In real implementation, this would schedule the appliance
    }
  }

  /**
   * Handle behavior change actions
   */
  private handleBehaviorChange(action: GameAction): void {
    switch (action.id) {
      case 'gaming_session':
        // Turn on gaming devices
        this.toggleAppliance('computer', true);
        this.toggleAppliance('tv_living', true);
        // Add gaming console (simulated)
        this.state.appliances.set('gaming_console', {
          id: 'gaming_console',
          name: 'Gaming Console (150W)',
          isOn: true,
          powerRating: 150,
          category: 'electronics',
          efficiency: 'medium',
          controllable: true,
          autoControl: false
        });
        break;
    }
  }

  /**
   * Toggle an appliance on/off
   */
  private toggleAppliance(applianceId: string, forceState?: boolean): void {
    const appliance = this.state.appliances.get(applianceId);
    if (appliance && appliance.controllable) {
      appliance.isOn = forceState !== undefined ? forceState : !appliance.isOn;
    }
  }

  /**
   * Check if action triggers any quests
   */
  private checkQuestTriggers(action: GameAction): string[] {
    // In a real implementation, this would integrate with your quest system
    // For now, return the quest triggers from the action
    return action.questTriggers;
  }

  /**
   * Validate active quests and check completion
   */
  private validateActiveQuests(): string[] {
    const completedQuests: string[] = [];

    this.questValidations.forEach((validation, questId) => {
      switch (validation.type) {
        case 'energy_reduction':
          const currentPower = this.state.instantPower;
          const reductionTarget = validation.target;
          if (currentPower <= reductionTarget) {
            validation.currentProgress = 100;
            completedQuests.push(questId);
            this.completeQuest(questId);
          }
          break;
          
        case 'efficiency_improvement':
          const efficientAppliances = Array.from(this.state.appliances.values())
            .filter(a => a.efficiency === 'high').length;
          const totalAppliances = this.state.appliances.size;
          const efficiencyRatio = (efficientAppliances / totalAppliances) * 100;
          validation.currentProgress = Math.min(100, efficiencyRatio);
          if (efficiencyRatio >= validation.target) {
            completedQuests.push(questId);
            this.completeQuest(questId);
          }
          break;
      }
    });

    return completedQuests;
  }

  /**
   * Complete a quest
   */
  private completeQuest(questId: string): void {
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      this.state.activeQuests = this.state.activeQuests.filter(id => id !== questId);
      this.state.gameScore += 100; // Quest completion bonus
      
      // Remove from validation tracking
      this.questValidations.delete(questId);
    }
  }

  /**
   * Add a quest for tracking
   */
  addQuestForValidation(questId: string, validation: QuestValidation): void {
    this.questValidations.set(questId, validation);
    if (!this.state.activeQuests.includes(questId)) {
      this.state.activeQuests.push(questId);
    }
  }

  /**
   * Get current demo meter state
   */
  getState(): DemoMeterState {
    return { ...this.state };
  }

  /**
   * Get available actions
   */
  getAvailableActions(): GameAction[] {
    return this.gameActions.filter(action => {
      // Filter based on user level, available points, etc.
      return true; // For now, return all actions
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: DemoMeterState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  /**
   * Get smart meter reading in standard format
   */
  getSmartMeterReading(): any {
    return {
      consumerId: this.state.consumerId,
      timestamp: new Date().toISOString(),
      currentReading: Math.floor(this.state.currentReading),
      previousReading: Math.floor(this.state.currentReading - this.state.dailyConsumption),
      unitsConsumed: Math.floor(this.state.dailyConsumption),
      tariffRate: 6.5,
      billAmount: Math.floor(this.state.dailyConsumption * 6.5) + 150,
      powerFactor: this.state.powerFactor,
      maxDemand: Math.max(3, this.state.instantPower / 1000),
      voltage: this.state.voltage,
      current: {
        r: this.state.instantPower / this.state.voltage.r * 0.33,
        y: this.state.instantPower / this.state.voltage.y * 0.33,
        b: this.state.instantPower / this.state.voltage.b * 0.34
      },
      frequency: 50 + (Math.random() - 0.5) * 0.5,
      energyImported: Math.floor(this.state.currentReading),
      energyExported: Math.max(0, -this.state.baseLoad) / 1000, // Solar export
      reactivePower: this.state.instantPower * Math.tan(Math.acos(this.state.powerFactor))
    };
  }

  /**
   * Get real-time consumption data
   */
  getRealTimeData(): any {
    return {
      instantPower: Math.round(this.state.instantPower),
      voltage: Math.round(this.state.voltage.r * 10) / 10,
      current: Math.round((this.state.instantPower / this.state.voltage.r) * 10) / 10,
      frequency: Math.round((50 + (Math.random() - 0.5) * 0.5) * 10) / 10,
      powerFactor: Math.round(this.state.powerFactor * 100) / 100,
      timestamp: new Date().toISOString(),
      phaseData: {
        r: { 
          voltage: Math.round(this.state.voltage.r * 10) / 10, 
          current: Math.round((this.state.instantPower / this.state.voltage.r * 0.33) * 10) / 10 
        },
        y: { 
          voltage: Math.round(this.state.voltage.y * 10) / 10, 
          current: Math.round((this.state.instantPower / this.state.voltage.y * 0.33) * 10) / 10 
        },
        b: { 
          voltage: Math.round(this.state.voltage.b * 10) / 10, 
          current: Math.round((this.state.instantPower / this.state.voltage.b * 0.34) * 10) / 10 
        }
      }
    };
  }
}

// Global instance for demo game
let demoGameInstance: DemoSmartMeterGame | null = null;

export function getDemoGameInstance(): DemoSmartMeterGame {
  if (!demoGameInstance) {
    demoGameInstance = new DemoSmartMeterGame();
  }
  return demoGameInstance;
}