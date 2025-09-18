import { toast } from 'sonner';
import { deviceRegistry } from './device-registry';

// Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
  data?: any;
  validationRules?: ValidationRule[];
  helpText?: string;
  estimatedTime?: string; // e.g., "2-3 minutes"
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface UserProfile {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    avatar?: string;
  };
  homeInfo: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    homeType: 'apartment' | 'house' | 'condo' | 'townhouse';
    homeSize: number; // sq ft
    occupants: number;
    yearBuilt?: number;
    hasGarden: boolean;
    hasSolarPanels: boolean;
    hasEVCharging: boolean;
  };
  energyProfile: {
    currentProvider: string;
    averageMonthlyBill: number;
    energySources: ('grid' | 'solar' | 'wind' | 'hydro')[];
    mainConcerns: ('cost' | 'environment' | 'reliability' | 'independence')[];
    currentEfficiencyRating?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      shareUsageData: boolean;
      joinCommunity: boolean;
      showInLeaderboards: boolean;
    };
    goals: {
      primary: 'save_money' | 'reduce_carbon' | 'energy_independence' | 'smart_automation';
      targetSavings?: number; // percentage
      targetReduction?: number; // kWh per month
    };
  };
  devices: DeviceInfo[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'lighting' | 'heating' | 'cooling' | 'appliance' | 'electronics' | 'water_heating';
  brand?: string;
  model?: string;
  age?: number; // years
  energyRating?: string;
  estimatedUsage?: number; // kWh per month
  smartEnabled: boolean;
  priority: 'high' | 'medium' | 'low'; // for optimization
}

export interface EnergyAuditResult {
  overall_score: number;
  category_scores: {
    heating_cooling: number;
    lighting: number;
    appliances: number;
    water_heating: number;
    electronics: number;
  };
  recommendations: AuditRecommendation[];
  estimated_savings: {
    monthly_kwh: number;
    monthly_cost: number;
    annual_cost: number;
  };
  efficiency_opportunities: EfficiencyOpportunity[];
  green_score: number;
}

export interface AuditRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedSavings: number; // monthly dollars
  estimatedCost: number; // implementation cost
  paybackPeriod: number; // months
  priority: number; // 1-10
  actions: string[];
}

export interface EfficiencyOpportunity {
  area: string;
  current_rating: number;
  potential_rating: number;
  improvement_actions: string[];
  estimated_impact: number;
}

export interface OnboardingProgress {
  currentStepIndex: number;
  completedSteps: string[];
  totalSteps: number;
  percentComplete: number;
  startedAt: string;
  lastUpdated: string;
  estimatedTimeRemaining?: string;
}

export interface OnboardingError {
  step: string;
  field?: string;
  message: string;
  type: 'validation' | 'system' | 'network';
  timestamp: string;
}

class OnboardingManager {
  private userProfile: Partial<UserProfile> = {};
  private currentStep = 0;
  private errors: OnboardingError[] = [];
  private onboardingSteps: OnboardingStep[] = [];

  constructor() {
    this.initializeSteps();
  }

  private initializeSteps() {
    this.onboardingSteps = [
      {
        id: 'welcome',
        title: 'Welcome to EcoQ',
        description: 'Let\'s get you started on your energy optimization journey!',
        component: 'WelcomeStep',
        required: true,
        completed: false,
        estimatedTime: '1 minute'
      },
      {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Tell us about yourself to personalize your experience',
        component: 'PersonalInfoStep',
        required: true,
        completed: false,
        validationRules: [
          { field: 'name', rule: 'required', message: 'Name is required' },
          { field: 'email', rule: 'email', message: 'Valid email is required' }
        ],
        helpText: 'We use this information to personalize your energy recommendations',
        estimatedTime: '2-3 minutes'
      },
      {
        id: 'home_info',
        title: 'Home Information',
        description: 'Help us understand your living situation',
        component: 'HomeInfoStep',
        required: true,
        completed: false,
        validationRules: [
          { field: 'address.city', rule: 'required', message: 'City is required' },
          { field: 'homeSize', rule: 'required', message: 'Home size is required' },
          { field: 'occupants', rule: 'required', message: 'Number of occupants is required' }
        ],
        helpText: 'This helps us provide accurate energy estimates and local recommendations',
        estimatedTime: '3-4 minutes'
      },
      {
        id: 'energy_profile',
        title: 'Energy Profile',
        description: 'Share your current energy usage and concerns',
        component: 'EnergyProfileStep',
        required: true,
        completed: false,
        validationRules: [
          { field: 'currentProvider', rule: 'required', message: 'Energy provider is required' },
          { field: 'averageMonthlyBill', rule: 'required', message: 'Monthly bill estimate is required' }
        ],
        helpText: 'This information helps us calculate potential savings and customize recommendations',
        estimatedTime: '3-4 minutes'
      },
      {
        id: 'device_inventory',
        title: 'Device Inventory',
        description: 'Add your appliances and devices for personalized recommendations',
        component: 'DeviceInventoryStep',
        required: false,
        completed: false,
        helpText: 'The more devices you add, the better we can optimize your energy usage. You can always add more later.',
        estimatedTime: '5-10 minutes'
      },
      {
        id: 'energy_audit',
        title: 'Quick Energy Audit',
        description: 'Get instant insights into your home\'s energy efficiency',
        component: 'EnergyAuditStep',
        required: false,
        completed: false,
        helpText: 'This automated audit analyzes your information to identify immediate opportunities',
        estimatedTime: '2-3 minutes'
      },
      {
        id: 'goal_setting',
        title: 'Set Your Goals',
        description: 'Define what you want to achieve with EcoQ',
        component: 'GoalSettingStep',
        required: true,
        completed: false,
        validationRules: [
          { field: 'primary', rule: 'required', message: 'Please select a primary goal' }
        ],
        helpText: 'Clear goals help us provide targeted recommendations and track your progress',
        estimatedTime: '2-3 minutes'
      },
      {
        id: 'preferences',
        title: 'Preferences',
        description: 'Customize your notifications and privacy settings',
        component: 'PreferencesStep',
        required: true,
        completed: false,
        helpText: 'You can always change these settings later in your profile',
        estimatedTime: '2 minutes'
      },
      {
        id: 'summary',
        title: 'Setup Complete!',
        description: 'Review your information and start optimizing your energy usage',
        component: 'SummaryStep',
        required: true,
        completed: false,
        estimatedTime: '2 minutes'
      }
    ];
  }

  // Progress management
  getProgress(): OnboardingProgress {
    const completedSteps = this.onboardingSteps.filter(step => step.completed);
    const totalRequired = this.onboardingSteps.filter(step => step.required).length;
    const completedRequired = completedSteps.filter(step => step.required).length;
    
    return {
      currentStepIndex: this.currentStep,
      completedSteps: completedSteps.map(step => step.id),
      totalSteps: this.onboardingSteps.length,
      percentComplete: Math.round((completedRequired / totalRequired) * 100),
      startedAt: this.userProfile.personalInfo?.email ? new Date().toISOString() : '',
      lastUpdated: new Date().toISOString(),
      estimatedTimeRemaining: this.calculateTimeRemaining()
    };
  }

  private calculateTimeRemaining(): string {
    const remainingSteps = this.onboardingSteps.slice(this.currentStep);
    const requiredRemaining = remainingSteps.filter(step => step.required);
    
    // Estimate based on remaining required steps
    const estimatedMinutes = requiredRemaining.length * 3; // Average 3 minutes per step
    
    if (estimatedMinutes < 5) return 'Less than 5 minutes';
    if (estimatedMinutes < 10) return '5-10 minutes';
    if (estimatedMinutes < 15) return '10-15 minutes';
    return `${estimatedMinutes} minutes`;
  }

  // Step navigation
  getCurrentStep(): OnboardingStep | null {
    return this.onboardingSteps[this.currentStep] || null;
  }

  getAllSteps(): OnboardingStep[] {
    return this.onboardingSteps;
  }

  goToStep(stepIndex: number): boolean {
    if (stepIndex >= 0 && stepIndex < this.onboardingSteps.length) {
      this.currentStep = stepIndex;
      return true;
    }
    return false;
  }

  nextStep(): OnboardingStep | null {
    if (this.currentStep < this.onboardingSteps.length - 1) {
      this.currentStep++;
      return this.getCurrentStep();
    }
    return null;
  }

  previousStep(): OnboardingStep | null {
    if (this.currentStep > 0) {
      this.currentStep--;
      return this.getCurrentStep();
    }
    return null;
  }

  canProceedToNext(): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;
    
    if (currentStep.required && !currentStep.completed) {
      return false;
    }
    
    return this.currentStep < this.onboardingSteps.length - 1;
  }

  // Data management
  updateStepData(stepId: string, data: any): boolean {
    const step = this.onboardingSteps.find(s => s.id === stepId);
    if (!step) return false;

    step.data = { ...step.data, ...data };
    
    // Update user profile based on step
    this.updateUserProfile(stepId, data);
    
    // Validate the step
    const isValid = this.validateStep(stepId, data);
    if (isValid) {
      step.completed = true;
    }
    
    return isValid;
  }

  private updateUserProfile(stepId: string, data: any) {
    switch (stepId) {
      case 'personal_info':
        this.userProfile.personalInfo = { ...this.userProfile.personalInfo, ...data };
        break;
      case 'home_info':
        this.userProfile.homeInfo = { ...this.userProfile.homeInfo, ...data };
        break;
      case 'energy_profile':
        this.userProfile.energyProfile = { ...this.userProfile.energyProfile, ...data };
        break;
      case 'preferences':
        this.userProfile.preferences = { ...this.userProfile.preferences, ...data };
        break;
      case 'device_inventory':
        this.userProfile.devices = data.devices || [];
        break;
    }
  }

  getUserProfile(): Partial<UserProfile> {
    return this.userProfile;
  }

  // Validation
  validateStep(stepId: string, data: any): boolean {
    const step = this.onboardingSteps.find(s => s.id === stepId);
    if (!step || !step.validationRules) return true;

    this.clearStepErrors(stepId);
    let isValid = true;

    for (const rule of step.validationRules) {
      const value = this.getNestedValue(data, rule.field);
      
      if (!this.validateRule(rule, value)) {
        this.addError({
          step: stepId,
          field: rule.field,
          message: rule.message,
          type: 'validation',
          timestamp: new Date().toISOString()
        });
        isValid = false;
      }
    }

    return isValid;
  }

  private validateRule(rule: ValidationRule, value: any): boolean {
    switch (rule.rule) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      case 'minLength':
        return !value || value.length >= (rule.value || 0);
      case 'maxLength':
        return !value || value.length <= (rule.value || Infinity);
      case 'pattern':
        return !value || new RegExp(rule.value).test(value);
      default:
        return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Error management
  addError(error: OnboardingError) {
    this.errors.push(error);
  }

  getErrors(stepId?: string): OnboardingError[] {
    if (stepId) {
      return this.errors.filter(error => error.step === stepId);
    }
    return this.errors;
  }

  clearStepErrors(stepId: string) {
    this.errors = this.errors.filter(error => error.step !== stepId);
  }

  clearAllErrors() {
    this.errors = [];
  }

  // Energy audit functionality
  async performEnergyAudit(): Promise<EnergyAuditResult> {
    // Simulate API call for energy audit
    await new Promise(resolve => setTimeout(resolve, 2000));

    const homeInfo = this.userProfile.homeInfo;
    const energyProfile = this.userProfile.energyProfile;
    const devices = this.userProfile.devices || [];

    // Calculate audit scores based on user data
    const auditResult: EnergyAuditResult = {
      overall_score: this.calculateOverallScore(),
      category_scores: {
        heating_cooling: this.calculateCategoryScore('heating_cooling'),
        lighting: this.calculateCategoryScore('lighting'),
        appliances: this.calculateCategoryScore('appliances'),
        water_heating: this.calculateCategoryScore('water_heating'),
        electronics: this.calculateCategoryScore('electronics')
      },
      recommendations: this.generateRecommendations(),
      estimated_savings: {
        monthly_kwh: Math.round((energyProfile?.averageMonthlyBill || 100) * 0.15),
        monthly_cost: Math.round((energyProfile?.averageMonthlyBill || 100) * 0.2),
        annual_cost: Math.round((energyProfile?.averageMonthlyBill || 100) * 2.4)
      },
      efficiency_opportunities: this.identifyOpportunities(),
      green_score: this.calculateGreenScore()
    };

    return auditResult;
  }

  private calculateOverallScore(): number {
    const homeInfo = this.userProfile.homeInfo;
    const energyProfile = this.userProfile.energyProfile;
    
    let score = 60; // Base score
    
    // Adjust based on home characteristics
    if (homeInfo?.hasSolarPanels) score += 15;
    if (homeInfo?.hasEVCharging) score += 5;
    if ((homeInfo?.yearBuilt || 1980) > 2010) score += 10;
    
    // Adjust based on energy sources
    if (energyProfile?.energySources?.includes('solar')) score += 10;
    if (energyProfile?.energySources?.includes('wind')) score += 5;
    
    return Math.min(100, Math.max(20, score));
  }

  private calculateCategoryScore(category: string): number {
    const devices = this.userProfile.devices || [];
    const categoryDevices = devices.filter(d => 
      (category === 'heating_cooling' && (d.type === 'heating' || d.type === 'cooling')) ||
      (category === 'lighting' && d.type === 'lighting') ||
      (category === 'appliances' && d.type === 'appliance') ||
      (category === 'water_heating' && d.type === 'water_heating') ||
      (category === 'electronics' && d.type === 'electronics')
    );

    if (categoryDevices.length === 0) return 70; // Default score

    // Calculate average score based on device age and efficiency
    let totalScore = 0;
    categoryDevices.forEach(device => {
      let deviceScore = 80;
      if (device.age && device.age > 10) deviceScore -= 20;
      if (device.age && device.age > 15) deviceScore -= 10;
      if (device.smartEnabled) deviceScore += 10;
      if (device.energyRating && ['A+', 'A'].includes(device.energyRating)) deviceScore += 10;
      totalScore += Math.max(20, Math.min(100, deviceScore));
    });

    return Math.round(totalScore / categoryDevices.length);
  }

  private generateRecommendations(): AuditRecommendation[] {
    const recommendations: AuditRecommendation[] = [];
    const homeInfo = this.userProfile.homeInfo;
    const devices = this.userProfile.devices || [];

    // Generate recommendations based on user data
    if (!homeInfo?.hasSolarPanels) {
      recommendations.push({
        id: 'solar_panels',
        category: 'renewable_energy',
        title: 'Install Solar Panels',
        description: 'Solar panels can significantly reduce your electricity bills and carbon footprint',
        impact: 'high',
        difficulty: 'hard',
        estimatedSavings: 150,
        estimatedCost: 15000,
        paybackPeriod: 100,
        priority: 8,
        actions: [
          'Get quotes from certified solar installers',
          'Check for local rebates and incentives',
          'Evaluate roof condition and orientation'
        ]
      });
    }

    // Check for old appliances
    const oldAppliances = devices.filter(d => d.age && d.age > 10);
    if (oldAppliances.length > 0) {
      recommendations.push({
        id: 'upgrade_appliances',
        category: 'appliances',
        title: 'Upgrade Old Appliances',
        description: 'Replace energy-inefficient appliances with ENERGY STAR certified models',
        impact: 'medium',
        difficulty: 'medium',
        estimatedSavings: 50,
        estimatedCost: 2000,
        paybackPeriod: 40,
        priority: 6,
        actions: [
          'Research ENERGY STAR certified models',
          'Compare energy consumption ratings',
          'Look for utility rebates'
        ]
      });
    }

    // Smart home recommendations
    const nonSmartDevices = devices.filter(d => !d.smartEnabled);
    if (nonSmartDevices.length > 3) {
      recommendations.push({
        id: 'smart_home',
        category: 'automation',
        title: 'Add Smart Home Features',
        description: 'Smart thermostats and automated systems can optimize energy usage',
        impact: 'medium',
        difficulty: 'easy',
        estimatedSavings: 30,
        estimatedCost: 500,
        paybackPeriod: 17,
        priority: 7,
        actions: [
          'Install smart thermostat',
          'Add smart power strips',
          'Consider smart lighting controls'
        ]
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private identifyOpportunities(): EfficiencyOpportunity[] {
    return [
      {
        area: 'Heating & Cooling',
        current_rating: 6.5,
        potential_rating: 8.2,
        improvement_actions: [
          'Upgrade to smart thermostat',
          'Improve insulation',
          'Seal air leaks'
        ],
        estimated_impact: 25
      },
      {
        area: 'Lighting',
        current_rating: 7.0,
        potential_rating: 9.0,
        improvement_actions: [
          'Switch to LED bulbs',
          'Add motion sensors',
          'Use natural light optimization'
        ],
        estimated_impact: 15
      }
    ];
  }

  private calculateGreenScore(): number {
    const energyProfile = this.userProfile.energyProfile;
    const homeInfo = this.userProfile.homeInfo;
    
    let score = 50; // Base score
    
    // Renewable energy sources
    if (energyProfile?.energySources?.includes('solar')) score += 20;
    if (energyProfile?.energySources?.includes('wind')) score += 10;
    
    // Green features
    if (homeInfo?.hasSolarPanels) score += 15;
    if (homeInfo?.hasEVCharging) score += 10;
    if (homeInfo?.hasGarden) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  // Goal setting helpers
  generateGoalSuggestions(): Array<{ goal: string; description: string; targetSavings: number }> {
    const monthlyBill = this.userProfile.energyProfile?.averageMonthlyBill || 100;
    
    return [
      {
        goal: 'save_money',
        description: 'Reduce your energy bills through optimization and efficiency',
        targetSavings: Math.round(monthlyBill * 0.2)
      },
      {
        goal: 'reduce_carbon',
        description: 'Minimize your environmental impact with sustainable practices',
        targetSavings: Math.round(monthlyBill * 0.15)
      },
      {
        goal: 'energy_independence',
        description: 'Become more self-sufficient with renewable energy sources',
        targetSavings: Math.round(monthlyBill * 0.3)
      },
      {
        goal: 'smart_automation',
        description: 'Optimize energy usage through intelligent automation',
        targetSavings: Math.round(monthlyBill * 0.18)
      }
    ];
  }

  // Completion
  async completeOnboarding(): Promise<boolean> {
    const requiredSteps = this.onboardingSteps.filter(step => step.required);
    const completedRequired = requiredSteps.filter(step => step.completed);
    
    if (completedRequired.length === requiredSteps.length) {
      try {
        // Register devices with smart meter system
        const devices = this.userProfile.devices || [];
        if (devices.length > 0) {
          console.log('Registering devices with smart meter system...');
          await deviceRegistry.registerDevicesFromOnboarding(devices);
          toast.success(`${devices.length} devices registered with smart meter system!`);
        }
        
        // Mark all steps as completed
        this.onboardingSteps.forEach(step => step.completed = true);
        
        // Save user profile (in a real app, this would go to a database)
        await this.saveUserProfile();
        
        return true;
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        toast.error('Failed to register devices. Please try again.');
        return false;
      }
    }
    
    return false;
  }

  private async saveUserProfile(): Promise<void> {
    // In a real application, this would save to a database
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('User profile saved:', this.userProfile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      this.addError({
        step: 'summary',
        message: 'Failed to save profile. Please try again.',
        type: 'system',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Reset/restart onboarding
  resetOnboarding() {
    this.currentStep = 0;
    this.userProfile = {};
    this.errors = [];
    this.onboardingSteps.forEach(step => {
      step.completed = false;
      step.data = undefined;
    });
  }

  // Skip optional steps
  skipCurrentStep(): boolean {
    const currentStep = this.getCurrentStep();
    if (currentStep && !currentStep.required) {
      currentStep.completed = true;
      return true;
    }
    return false;
  }

  // Get help content for current step
  getHelpContent(stepId?: string): string {
    const step = stepId 
      ? this.onboardingSteps.find(s => s.id === stepId)
      : this.getCurrentStep();
    
    return step?.helpText || 'No help available for this step.';
  }
}

// Export singleton instance
export const onboardingManager = new OnboardingManager();