'use client';

import { smartHomeController } from './smart-home-controller';
import { aiEnergyCoach } from './ai-energy-coach';

// Analytics Types and Interfaces
export interface EnergyDataPoint {
  timestamp: string;
  consumption: number; // kWh
  cost: number; // INR
  powerDemand: number; // kW
  efficiency: number; // 0-100%
  carbonFootprint: number; // kg CO2
  deviceBreakdown: Record<string, number>; // device_id: consumption
  weather?: {
    temperature: number;
    humidity: number;
    condition: string;
  };
}

export interface AnalyticsTimeframe {
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  start: string;
  end: string;
}

export interface ConsumptionPattern {
  id: string;
  name: string;
  pattern: 'peak' | 'valley' | 'steady' | 'variable';
  timeRange: { start: number; end: number }; // hours
  averageConsumption: number;
  frequency: number; // 0-1 (how often this pattern occurs)
  seasonality: 'summer' | 'winter' | 'monsoon' | 'all';
  confidence: number; // 0-100%
}

export interface EnergyTrend {
  metric: 'consumption' | 'cost' | 'efficiency' | 'carbon';
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // percentage change
  period: string;
  significance: 'low' | 'moderate' | 'high' | 'critical';
  factors: string[];
}

export interface BenchmarkComparison {
  category: 'consumption' | 'cost' | 'efficiency' | 'carbon';
  userValue: number;
  benchmarks: {
    similar_homes: number;
    city_average: number;
    state_average: number;
    national_average: number;
  };
  percentile: number; // 0-100
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  improvementOpportunity: number; // potential percentage improvement
}

export interface EfficiencyScore {
  overall: number; // 0-100
  categories: {
    heating_cooling: number;
    lighting: number;
    appliances: number;
    water_heating: number;
    electronics: number;
  };
  trends: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
}

export interface CostAnalysis {
  currentMonth: {
    total: number;
    breakdown: Record<string, number>;
    projected: number;
    savingsOpportunity: number;
  };
  tariffOptimization: {
    currentPlan: string;
    recommendedPlan: string;
    potentialSavings: number;
    timeOfUseOptimization: boolean;
  };
  seasonalAnalysis: {
    summer: { average: number; peak: number };
    winter: { average: number; peak: number };
    monsoon: { average: number; peak: number };
  };
}

export interface CarbonFootprintAnalysis {
  currentMonth: number; // kg CO2
  yearToDate: number;
  comparison: {
    lastYear: number;
    cityAverage: number;
    reductionAchieved: number;
  };
  sources: Record<string, number>; // source: kg CO2
  offsetOpportunities: {
    solarPotential: number;
    energyEfficiency: number;
    behavioralChanges: number;
  };
}

export interface PredictiveInsight {
  type: 'consumption' | 'cost' | 'peak_demand' | 'efficiency';
  prediction: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
  alertLevel: 'info' | 'warning' | 'critical';
}

export interface MLInsight {
  id: string;
  title: string;
  description: string;
  category: 'anomaly' | 'trend' | 'optimization' | 'prediction';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  data: any;
  actionable: boolean;
  recommendations?: string[];
}

class EnergyAnalyticsEngine {
  private dataPoints: EnergyDataPoint[] = [];
  private patterns: ConsumptionPattern[] = [];
  private mlInsights: MLInsight[] = [];
  private benchmarkData: Map<string, BenchmarkComparison[]> = new Map();
  
  constructor() {
    this.initializeAnalytics();
    this.startAnalyticsEngine();
  }

  // Initialize with sample data
  private initializeAnalytics(): void {
    // Generate sample historical data
    this.generateSampleData();
    this.detectConsumptionPatterns();
  }

  private generateSampleData(): void {
    const now = new Date();
    const dataPoints: EnergyDataPoint[] = [];
    
    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Simulate consumption patterns
      let baseConsumption = 1.5; // kWh base
      
      // Time-of-day patterns
      if (hour >= 6 && hour <= 9) baseConsumption *= 1.4; // Morning peak
      if (hour >= 12 && hour <= 14) baseConsumption *= 1.2; // Afternoon
      if (hour >= 18 && hour <= 22) baseConsumption *= 1.8; // Evening peak
      if (hour >= 23 || hour <= 5) baseConsumption *= 0.6; // Night valley
      
      // Weekend patterns
      if (isWeekend) baseConsumption *= 1.2;
      
      // Seasonal variation (simulate summer)
      const seasonalFactor = 1.3;
      baseConsumption *= seasonalFactor;
      
      // Add some randomness
      baseConsumption += (Math.random() - 0.5) * 0.4;
      
      const devices = smartHomeController.getAllDevices();
      const deviceBreakdown: Record<string, number> = {};
      let totalDeviceConsumption = 0;
      
      devices.forEach(device => {
        const consumption = Math.random() * 0.5; // Random consumption per device
        deviceBreakdown[device.id] = consumption;
        totalDeviceConsumption += consumption;
      });
      
      const dataPoint: EnergyDataPoint = {
        timestamp: date.toISOString(),
        consumption: Math.max(0.1, baseConsumption),
        cost: baseConsumption * 6.5, // INR per kWh
        powerDemand: baseConsumption * 1.2,
        efficiency: Math.min(100, 70 + Math.random() * 25),
        carbonFootprint: baseConsumption * 0.82, // kg CO2 per kWh (India average)
        deviceBreakdown,
        weather: {
          temperature: 28 + Math.random() * 8,
          humidity: 55 + Math.random() * 25,
          condition: ['sunny', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)]
        }
      };
      
      dataPoints.push(dataPoint);
    }
    
    this.dataPoints = dataPoints;
  }

  // Pattern Detection using ML-like algorithms
  private detectConsumptionPatterns(): void {
    const hourlyConsumption: Record<number, number[]> = {};
    
    // Group consumption by hour
    this.dataPoints.forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      if (!hourlyConsumption[hour]) {
        hourlyConsumption[hour] = [];
      }
      hourlyConsumption[hour].push(point.consumption);
    });
    
    // Detect patterns
    const patterns: ConsumptionPattern[] = [];
    
    // Morning peak pattern
    const morningHours = [6, 7, 8, 9];
    const morningConsumption = morningHours.reduce((sum, hour) => {
      const hourData = hourlyConsumption[hour] || [];
      return sum + (hourData.reduce((s, c) => s + c, 0) / Math.max(hourData.length, 1));
    }, 0) / morningHours.length;
    
    patterns.push({
      id: 'morning_peak',
      name: 'Morning Peak Usage',
      pattern: 'peak',
      timeRange: { start: 6, end: 9 },
      averageConsumption: morningConsumption,
      frequency: 0.8,
      seasonality: 'all',
      confidence: 85
    });
    
    // Evening peak pattern
    const eveningHours = [18, 19, 20, 21, 22];
    const eveningConsumption = eveningHours.reduce((sum, hour) => {
      const hourData = hourlyConsumption[hour] || [];
      return sum + (hourData.reduce((s, c) => s + c, 0) / Math.max(hourData.length, 1));
    }, 0) / eveningHours.length;
    
    patterns.push({
      id: 'evening_peak',
      name: 'Evening Peak Usage',
      pattern: 'peak',
      timeRange: { start: 18, end: 22 },
      averageConsumption: eveningConsumption,
      frequency: 0.9,
      seasonality: 'all',
      confidence: 92
    });
    
    // Night valley pattern
    const nightHours = [23, 0, 1, 2, 3, 4, 5];
    const nightConsumption = nightHours.reduce((sum, hour) => {
      const hourData = hourlyConsumption[hour] || [];
      return sum + (hourData.reduce((s, c) => s + c, 0) / Math.max(hourData.length, 1));
    }, 0) / nightHours.length;
    
    patterns.push({
      id: 'night_valley',
      name: 'Night Valley Usage',
      pattern: 'valley',
      timeRange: { start: 23, end: 5 },
      averageConsumption: nightConsumption,
      frequency: 0.95,
      seasonality: 'all',
      confidence: 88
    });
    
    this.patterns = patterns;
  }

  // Advanced Analytics Methods
  public analyzeTrends(timeframe: AnalyticsTimeframe): EnergyTrend[] {
    const filteredData = this.filterDataByTimeframe(timeframe);
    const trends: EnergyTrend[] = [];
    
    if (filteredData.length < 2) return trends;
    
    // Consumption trend
    const consumptionData = filteredData.map(d => d.consumption);
    const consumptionTrend = this.calculateTrend(consumptionData);
    trends.push({
      metric: 'consumption',
      direction: consumptionTrend.direction,
      magnitude: consumptionTrend.magnitude,
      period: `${timeframe.period} analysis`,
      significance: consumptionTrend.magnitude > 15 ? 'high' : consumptionTrend.magnitude > 5 ? 'moderate' : 'low',
      factors: this.identifyTrendFactors(consumptionData, 'consumption')
    });
    
    // Cost trend
    const costData = filteredData.map(d => d.cost);
    const costTrend = this.calculateTrend(costData);
    trends.push({
      metric: 'cost',
      direction: costTrend.direction,
      magnitude: costTrend.magnitude,
      period: `${timeframe.period} analysis`,
      significance: costTrend.magnitude > 20 ? 'high' : costTrend.magnitude > 10 ? 'moderate' : 'low',
      factors: this.identifyTrendFactors(costData, 'cost')
    });
    
    // Efficiency trend
    const efficiencyData = filteredData.map(d => d.efficiency);
    const efficiencyTrend = this.calculateTrend(efficiencyData);
    trends.push({
      metric: 'efficiency',
      direction: efficiencyTrend.direction,
      magnitude: efficiencyTrend.magnitude,
      period: `${timeframe.period} analysis`,
      significance: efficiencyTrend.magnitude > 10 ? 'high' : efficiencyTrend.magnitude > 3 ? 'moderate' : 'low',
      factors: this.identifyTrendFactors(efficiencyData, 'efficiency')
    });
    
    return trends;
  }

  public generateBenchmarkComparisons(userId: string): BenchmarkComparison[] {
    const recentData = this.dataPoints.slice(-30); // Last 30 days
    const avgConsumption = recentData.reduce((sum, d) => sum + d.consumption, 0) / recentData.length;
    const avgCost = recentData.reduce((sum, d) => sum + d.cost, 0) / recentData.length;
    const avgEfficiency = recentData.reduce((sum, d) => sum + d.efficiency, 0) / recentData.length;
    const avgCarbon = recentData.reduce((sum, d) => sum + d.carbonFootprint, 0) / recentData.length;
    
    const comparisons: BenchmarkComparison[] = [
      {
        category: 'consumption',
        userValue: avgConsumption * 30, // Monthly consumption
        benchmarks: {
          similar_homes: 450, // kWh/month
          city_average: 520,
          state_average: 480,
          national_average: 500
        },
        percentile: this.calculatePercentile(avgConsumption * 30, 450),
        ranking: this.getRanking(avgConsumption * 30, 450),
        improvementOpportunity: Math.max(0, ((avgConsumption * 30 - 400) / (avgConsumption * 30)) * 100)
      },
      {
        category: 'cost',
        userValue: avgCost * 30, // Monthly cost
        benchmarks: {
          similar_homes: 2925, // INR/month
          city_average: 3380,
          state_average: 3120,
          national_average: 3250
        },
        percentile: this.calculatePercentile(avgCost * 30, 2925),
        ranking: this.getRanking(avgCost * 30, 2925),
        improvementOpportunity: Math.max(0, ((avgCost * 30 - 2600) / (avgCost * 30)) * 100)
      },
      {
        category: 'efficiency',
        userValue: avgEfficiency,
        benchmarks: {
          similar_homes: 75,
          city_average: 70,
          state_average: 72,
          national_average: 68
        },
        percentile: this.calculatePercentile(avgEfficiency, 75, true),
        ranking: this.getRanking(avgEfficiency, 75, true),
        improvementOpportunity: Math.max(0, ((90 - avgEfficiency) / 90) * 100)
      }
    ];
    
    return comparisons;
  }

  public calculateEfficiencyScore(): EfficiencyScore {
    const recentData = this.dataPoints.slice(-7); // Last week
    const devices = smartHomeController.getAllDevices();
    
    // Calculate category scores
    const categories = {
      heating_cooling: this.calculateCategoryEfficiency(devices.filter(d => d.type === 'ac'), recentData),
      lighting: this.calculateCategoryEfficiency(devices.filter(d => d.type === 'light'), recentData),
      appliances: this.calculateCategoryEfficiency(devices.filter(d => ['refrigerator', 'washing_machine'].includes(d.type)), recentData),
      water_heating: this.calculateCategoryEfficiency(devices.filter(d => d.type === 'water_heater'), recentData),
      electronics: this.calculateCategoryEfficiency(devices.filter(d => ['tv', 'router'].includes(d.type)), recentData)
    };
    
    const overall = (categories.heating_cooling + categories.lighting + categories.appliances + categories.water_heating + categories.electronics) / 5;
    
    // Calculate trends
    const weeklyData = this.dataPoints.slice(-7);
    const monthlyData = this.dataPoints.slice(-30);
    const weeklyAvg = weeklyData.reduce((sum, d) => sum + d.efficiency, 0) / weeklyData.length;
    const monthlyAvg = monthlyData.reduce((sum, d) => sum + d.efficiency, 0) / monthlyData.length;
    
    return {
      overall: Math.round(overall),
      categories: {
        heating_cooling: Math.round(categories.heating_cooling),
        lighting: Math.round(categories.lighting),
        appliances: Math.round(categories.appliances),
        water_heating: Math.round(categories.water_heating),
        electronics: Math.round(categories.electronics)
      },
      trends: {
        weekly: Math.round(weeklyAvg),
        monthly: Math.round(monthlyAvg),
        yearly: Math.round(monthlyAvg * 1.05) // Simulated yearly trend
      },
      factors: {
        positive: this.identifyPositiveFactors(),
        negative: this.identifyNegativeFactors()
      }
    };
  }

  public analyzeCosts(): CostAnalysis {
    const monthlyData = this.dataPoints.slice(-30);
    const totalCost = monthlyData.reduce((sum, d) => sum + d.cost, 0);
    
    // Device-wise cost breakdown
    const breakdown: Record<string, number> = {};
    const devices = smartHomeController.getAllDevices();
    devices.forEach(device => {
      breakdown[device.name] = monthlyData.reduce((sum, d) => {
        return sum + (d.deviceBreakdown[device.id] || 0) * 6.5;
      }, 0);
    });
    
    return {
      currentMonth: {
        total: totalCost,
        breakdown,
        projected: totalCost * 1.1,
        savingsOpportunity: totalCost * 0.15
      },
      tariffOptimization: {
        currentPlan: 'Standard Residential',
        recommendedPlan: 'Time-of-Use',
        potentialSavings: totalCost * 0.12,
        timeOfUseOptimization: true
      },
      seasonalAnalysis: {
        summer: { average: totalCost * 1.3, peak: totalCost * 1.8 },
        winter: { average: totalCost * 0.8, peak: totalCost * 1.1 },
        monsoon: { average: totalCost * 0.9, peak: totalCost * 1.2 }
      }
    };
  }

  public analyzeCarbonFootprint(): CarbonFootprintAnalysis {
    const monthlyData = this.dataPoints.slice(-30);
    const currentMonth = monthlyData.reduce((sum, d) => sum + d.carbonFootprint, 0);
    
    // Device-wise carbon sources
    const sources: Record<string, number> = {};
    const devices = smartHomeController.getAllDevices();
    devices.forEach(device => {
      sources[device.name] = monthlyData.reduce((sum, d) => {
        return sum + (d.deviceBreakdown[device.id] || 0) * 0.82; // kg CO2 per kWh
      }, 0);
    });
    
    return {
      currentMonth,
      yearToDate: currentMonth * 9, // Simulated 9 months of data
      comparison: {
        lastYear: currentMonth * 1.15,
        cityAverage: currentMonth * 1.25,
        reductionAchieved: currentMonth * 0.15
      },
      sources,
      offsetOpportunities: {
        solarPotential: currentMonth * 0.6,
        energyEfficiency: currentMonth * 0.25,
        behavioralChanges: currentMonth * 0.15
      }
    };
  }

  public generatePredictiveInsights(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const recentTrend = this.analyzeTrends({
      period: 'week',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    });
    
    // Consumption prediction
    const avgConsumption = this.dataPoints.slice(-7).reduce((sum, d) => sum + d.consumption, 0) / 7;
    const consumptionTrend = recentTrend.find(t => t.metric === 'consumption');
    let predictedConsumption = avgConsumption;
    
    if (consumptionTrend?.direction === 'increasing') {
      predictedConsumption *= (1 + consumptionTrend.magnitude / 100);
    } else if (consumptionTrend?.direction === 'decreasing') {
      predictedConsumption *= (1 - consumptionTrend.magnitude / 100);
    }
    
    insights.push({
      type: 'consumption',
      prediction: predictedConsumption * 30, // Monthly prediction
      confidence: 78,
      timeframe: 'Next 30 days',
      factors: ['Current usage patterns', 'Seasonal trends', 'Device efficiency'],
      recommendations: [
        'Monitor peak hour usage',
        'Consider energy-saving settings',
        'Schedule high-consumption activities during off-peak hours'
      ],
      alertLevel: predictedConsumption > avgConsumption * 1.2 ? 'warning' : 'info'
    });
    
    // Cost prediction
    const predictedCost = predictedConsumption * 6.5 * 30;
    insights.push({
      type: 'cost',
      prediction: predictedCost,
      confidence: 82,
      timeframe: 'Next monthly bill',
      factors: ['Consumption trends', 'Current tariff rates', 'Seasonal adjustments'],
      recommendations: [
        'Enable energy-saving modes on major appliances',
        'Consider time-of-use tariff plans',
        'Implement smart scheduling for devices'
      ],
      alertLevel: predictedCost > avgConsumption * 6.5 * 30 * 1.15 ? 'warning' : 'info'
    });
    
    return insights;
  }

  public detectAnomalies(): MLInsight[] {
    const insights: MLInsight[] = [];
    const recentData = this.dataPoints.slice(-7);
    
    // Consumption anomaly detection
    const avgConsumption = recentData.reduce((sum, d) => sum + d.consumption, 0) / recentData.length;
    const maxConsumption = Math.max(...recentData.map(d => d.consumption));
    const minConsumption = Math.min(...recentData.map(d => d.consumption));
    
    if (maxConsumption > avgConsumption * 2) {
      insights.push({
        id: 'consumption_spike',
        title: 'Unusual Consumption Spike Detected',
        description: `Consumption reached ${maxConsumption.toFixed(1)} kWh, which is ${((maxConsumption / avgConsumption - 1) * 100).toFixed(0)}% above average`,
        category: 'anomaly',
        severity: 'medium',
        confidence: 85,
        data: { spike: maxConsumption, average: avgConsumption },
        actionable: true,
        recommendations: [
          'Check for devices left running unnecessarily',
          'Review recent appliance usage patterns',
          'Consider implementing usage alerts'
        ]
      });
    }
    
    // Efficiency anomaly
    const avgEfficiency = recentData.reduce((sum, d) => sum + d.efficiency, 0) / recentData.length;
    if (avgEfficiency < 60) {
      insights.push({
        id: 'efficiency_drop',
        title: 'Energy Efficiency Below Normal',
        description: `Current efficiency is ${avgEfficiency.toFixed(0)}%, significantly below optimal levels`,
        category: 'anomaly',
        severity: 'high',
        confidence: 90,
        data: { efficiency: avgEfficiency },
        actionable: true,
        recommendations: [
          'Enable energy-saving modes on all devices',
          'Check for maintenance needs on major appliances',
          'Review temperature settings on AC and water heater'
        ]
      });
    }
    
    return insights;
  }

  // Helper Methods
  private filterDataByTimeframe(timeframe: AnalyticsTimeframe): EnergyDataPoint[] {
    const start = new Date(timeframe.start);
    const end = new Date(timeframe.end);
    
    return this.dataPoints.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= start && pointDate <= end;
    });
  }

  private calculateTrend(data: number[]): { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number } {
    if (data.length < 2) return { direction: 'stable', magnitude: 0 };
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 2) return { direction: 'stable', magnitude: Math.abs(change) };
    return {
      direction: change > 0 ? 'increasing' : 'decreasing',
      magnitude: Math.abs(change)
    };
  }

  private identifyTrendFactors(data: number[], metric: string): string[] {
    const factors = [];
    
    // Generic factors based on metric type
    if (metric === 'consumption') {
      factors.push('Seasonal weather changes', 'Device usage patterns', 'New appliances');
    } else if (metric === 'cost') {
      factors.push('Energy consumption changes', 'Tariff rate adjustments', 'Peak hour usage');
    } else if (metric === 'efficiency') {
      factors.push('Device maintenance', 'Usage optimization', 'Smart scheduling');
    }
    
    return factors;
  }

  private calculatePercentile(userValue: number, benchmark: number, higherIsBetter = false): number {
    // Simplified percentile calculation
    const ratio = userValue / benchmark;
    let percentile;
    
    if (higherIsBetter) {
      percentile = ratio >= 1.2 ? 90 : ratio >= 1.1 ? 80 : ratio >= 1.0 ? 70 : ratio >= 0.9 ? 50 : 30;
    } else {
      percentile = ratio <= 0.8 ? 90 : ratio <= 0.9 ? 80 : ratio <= 1.0 ? 70 : ratio <= 1.1 ? 50 : 30;
    }
    
    return percentile;
  }

  private getRanking(userValue: number, benchmark: number, higherIsBetter = false): BenchmarkComparison['ranking'] {
    const ratio = userValue / benchmark;
    
    if (higherIsBetter) {
      if (ratio >= 1.2) return 'excellent';
      if (ratio >= 1.1) return 'good';
      if (ratio >= 0.95) return 'average';
      if (ratio >= 0.8) return 'below_average';
      return 'poor';
    } else {
      if (ratio <= 0.8) return 'excellent';
      if (ratio <= 0.9) return 'good';
      if (ratio <= 1.05) return 'average';
      if (ratio <= 1.2) return 'below_average';
      return 'poor';
    }
  }

  private calculateCategoryEfficiency(devices: any[], data: EnergyDataPoint[]): number {
    if (devices.length === 0) return 75; // Default score
    
    let totalEfficiency = 0;
    devices.forEach(device => {
      // Calculate efficiency based on device properties
      let efficiency = 70; // Base efficiency
      
      if (device.energySavingMode) efficiency += 15;
      if (device.efficiencyRating === 'A++') efficiency += 10;
      else if (device.efficiencyRating === 'A+') efficiency += 5;
      
      totalEfficiency += efficiency;
    });
    
    return totalEfficiency / devices.length;
  }

  private identifyPositiveFactors(): string[] {
    return [
      'Energy-saving modes enabled on multiple devices',
      'Consistent efficiency improvements over time',
      'Optimal temperature settings maintained',
      'Smart scheduling implemented for major appliances'
    ];
  }

  private identifyNegativeFactors(): string[] {
    return [
      'Peak hour usage higher than optimal',
      'Some devices running without energy-saving features',
      'Temperature settings could be more efficient',
      'Opportunity for better device scheduling'
    ];
  }

  private startAnalyticsEngine(): void {
    // Update analytics every hour
    setInterval(() => {
      this.updateAnalytics();
    }, 60 * 60 * 1000);
  }

  private updateAnalytics(): void {
    // Add new data point
    const devices = smartHomeController.getAllDevices();
    const deviceBreakdown: Record<string, number> = {};
    
    devices.forEach(device => {
      deviceBreakdown[device.id] = device.currentPowerUsage / 1000; // Convert to kWh
    });
    
    const totalConsumption = Object.values(deviceBreakdown).reduce((sum, val) => sum + val, 0);
    
    const newDataPoint: EnergyDataPoint = {
      timestamp: new Date().toISOString(),
      consumption: totalConsumption,
      cost: totalConsumption * 6.5,
      powerDemand: totalConsumption * 1.1,
      efficiency: Math.min(100, 60 + Math.random() * 30),
      carbonFootprint: totalConsumption * 0.82,
      deviceBreakdown,
      weather: {
        temperature: 28 + Math.random() * 8,
        humidity: 55 + Math.random() * 25,
        condition: ['sunny', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)]
      }
    };
    
    this.dataPoints.push(newDataPoint);
    
    // Keep only last 90 days of data
    if (this.dataPoints.length > 90 * 24) {
      this.dataPoints = this.dataPoints.slice(-90 * 24);
    }
    
    // Update patterns and insights
    this.detectConsumptionPatterns();
    this.mlInsights = this.detectAnomalies();
  }

  // Public getters
  public getDataPoints(limit?: number): EnergyDataPoint[] {
    return limit ? this.dataPoints.slice(-limit) : this.dataPoints;
  }

  public getConsumptionPatterns(): ConsumptionPattern[] {
    return this.patterns;
  }

  public getMLInsights(): MLInsight[] {
    return this.mlInsights;
  }
}

// Export singleton instance
export const energyAnalytics = new EnergyAnalyticsEngine();
export default EnergyAnalyticsEngine;