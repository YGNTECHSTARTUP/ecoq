'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  Leaf,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  Clock,
  Users,
  Award,
  Gauge,
  LineChart,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  Brain,
  Sparkles
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  energyAnalytics,
  type EnergyDataPoint,
  type EnergyTrend,
  type BenchmarkComparison,
  type EfficiencyScore,
  type CostAnalysis,
  type CarbonFootprintAnalysis,
  type PredictiveInsight,
  type MLInsight,
  type ConsumptionPattern
} from '@/lib/energy-analytics-engine';
import { toast } from 'sonner';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const rankingColors = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  average: 'bg-yellow-100 text-yellow-800',
  below_average: 'bg-orange-100 text-orange-800',
  poor: 'bg-red-100 text-red-800'
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const alertColors = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

interface AdvancedAnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export function AdvancedAnalyticsDashboard({ userId, className }: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  
  // Analytics data state
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([]);
  const [trends, setTrends] = useState<EnergyTrend[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkComparison[]>([]);
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [carbonAnalysis, setCarbonAnalysis] = useState<CarbonFootprintAnalysis | null>(null);
  const [predictions, setPredictions] = useState<PredictiveInsight[]>([]);
  const [mlInsights, setMLInsights] = useState<MLInsight[]>([]);
  const [patterns, setPatterns] = useState<ConsumptionPattern[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Get energy data points
      const dataPoints = energyAnalytics.getDataPoints(getDataPointsLimit());
      setEnergyData(dataPoints);

      // Get trends analysis
      const trendsData = energyAnalytics.analyzeTrends({
        period: getTimeframePeriod(),
        start: getTimeframeStart(),
        end: new Date().toISOString()
      });
      setTrends(trendsData);

      // Get benchmark comparisons
      const benchmarkData = energyAnalytics.generateBenchmarkComparisons(userId);
      setBenchmarks(benchmarkData);

      // Get efficiency score
      const efficiencyData = energyAnalytics.calculateEfficiencyScore();
      setEfficiencyScore(efficiencyData);

      // Get cost analysis
      const costData = energyAnalytics.analyzeCosts();
      setCostAnalysis(costData);

      // Get carbon analysis
      const carbonData = energyAnalytics.analyzeCarbonFootprint();
      setCarbonAnalysis(carbonData);

      // Get predictions
      const predictionsData = energyAnalytics.generatePredictiveInsights();
      setPredictions(predictionsData);

      // Get ML insights
      const insightsData = energyAnalytics.detectAnomalies();
      setMLInsights(insightsData);

      // Get consumption patterns
      const patternsData = energyAnalytics.getConsumptionPatterns();
      setPatterns(patternsData);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataPointsLimit = () => {
    switch (selectedTimeframe) {
      case '7d': return 168; // 7 days * 24 hours
      case '30d': return 720; // 30 days * 24 hours
      case '90d': return 2160; // 90 days * 24 hours
      default: return 720;
    }
  };

  const getTimeframePeriod = () => {
    switch (selectedTimeframe) {
      case '7d': return 'week' as const;
      case '30d': return 'month' as const;
      case '90d': return 'month' as const;
      default: return 'month' as const;
    }
  };

  const getTimeframeStart = () => {
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  };

  const formatChartData = (data: EnergyDataPoint[]) => {
    return data.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleDateString(),
      consumption: point.consumption.toFixed(2),
      cost: point.cost.toFixed(2),
      efficiency: point.efficiency.toFixed(1),
      carbon: point.carbonFootprint.toFixed(2)
    }));
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const chartData = formatChartData(energyData);
  const deviceBreakdownData = energyData.length > 0 ? 
    Object.entries(energyData[energyData.length - 1].deviceBreakdown).map(([device, consumption], index) => ({
      name: device.replace('_', ' '),
      value: Number(consumption.toFixed(2)),
      color: PIE_COLORS[index % PIE_COLORS.length]
    })) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Deep insights powered by machine learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="trends">📈 Trends</TabsTrigger>
          <TabsTrigger value="benchmarks">🏆 Benchmarks</TabsTrigger>
          <TabsTrigger value="efficiency">⚡ Efficiency</TabsTrigger>
          <TabsTrigger value="predictions">🔮 Predictions</TabsTrigger>
          <TabsTrigger value="insights">🧠 ML Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Consumption</p>
                    <p className="text-2xl font-bold">
                      {energyData.length > 0 
                        ? (energyData.reduce((sum, d) => sum + d.consumption, 0) / energyData.length).toFixed(1)
                        : '0'} kWh
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Efficiency Score</p>
                    <p className="text-2xl font-bold">{efficiencyScore?.overall || 0}%</p>
                  </div>
                  <Gauge className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    <p className="text-2xl font-bold">₹{costAnalysis?.currentMonth.total.toFixed(0) || '0'}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                    <p className="text-2xl font-bold">{carbonAnalysis?.currentMonth.toFixed(1) || '0'} kg</p>
                  </div>
                  <Leaf className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consumption Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption Trend</CardTitle>
                <CardDescription>Daily consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Device Energy Breakdown</CardTitle>
                <CardDescription>Current consumption by device</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Multi-Metric Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Multi-Metric Analysis</CardTitle>
                <CardDescription>Consumption, cost, and efficiency trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="consumption" stroke={COLORS.primary} name="Consumption (kWh)" />
                    <Line type="monotone" dataKey="efficiency" stroke={COLORS.success} name="Efficiency (%)" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Consumption Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Consumption Patterns</CardTitle>
                <CardDescription>Identified usage patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{pattern.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pattern.timeRange.start}:00 - {pattern.timeRange.end}:00
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{pattern.averageConsumption.toFixed(1)} kWh</p>
                      <div className="flex items-center gap-1">
                        <Progress value={pattern.confidence} className="w-16 h-2" />
                        <span className="text-xs">{pattern.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ML Insights Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Recent ML Insights
              </CardTitle>
              <CardDescription>AI-detected patterns and anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {mlInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`p-1 rounded-full ${severityColors[insight.severity]}`}>
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {mlInsights.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No anomalies detected. Your energy usage looks optimal!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.direction)}
                      <CardTitle className="capitalize">{trend.metric} Trend</CardTitle>
                    </div>
                    <Badge className={trend.significance === 'high' ? 'bg-red-100 text-red-800' : 
                                   trend.significance === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800'}>
                      {trend.significance}
                    </Badge>
                  </div>
                  <CardDescription>{trend.period}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                      {trend.direction === 'increasing' ? '+' : trend.direction === 'decreasing' ? '-' : ''}
                      {trend.magnitude.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trend.direction === 'stable' ? 'No significant change' : 
                       `${trend.direction} ${trend.direction === 'increasing' ? 'from' : 'to'} previous period`}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Contributing Factors:</p>
                    <ul className="space-y-1">
                      {trend.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {trends.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">No trends data available</p>
                  <p className="text-sm text-muted-foreground">
                    More data is needed to generate trend analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid gap-6">
            {benchmarks.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{benchmark.category} Comparison</CardTitle>
                    <Badge className={rankingColors[benchmark.ranking]}>
                      {benchmark.ranking.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>
                    You're in the {benchmark.percentile}th percentile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Your Value</p>
                      <p className="text-lg font-bold text-blue-600">
                        {benchmark.category === 'efficiency' ? 
                          `${benchmark.userValue.toFixed(1)}%` :
                          benchmark.category === 'consumption' ?
                          `${benchmark.userValue.toFixed(0)} kWh` :
                          `₹${benchmark.userValue.toFixed(0)}`
                        }
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Similar Homes</p>
                      <p className="text-lg font-bold">
                        {benchmark.category === 'efficiency' ? 
                          `${benchmark.benchmarks.similar_homes}%` :
                          benchmark.category === 'consumption' ?
                          `${benchmark.benchmarks.similar_homes} kWh` :
                          `₹${benchmark.benchmarks.similar_homes}`
                        }
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">City Average</p>
                      <p className="text-lg font-bold">
                        {benchmark.category === 'efficiency' ? 
                          `${benchmark.benchmarks.city_average}%` :
                          benchmark.category === 'consumption' ?
                          `${benchmark.benchmarks.city_average} kWh` :
                          `₹${benchmark.benchmarks.city_average}`
                        }
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">National Avg</p>
                      <p className="text-lg font-bold">
                        {benchmark.category === 'efficiency' ? 
                          `${benchmark.benchmarks.national_average}%` :
                          benchmark.category === 'consumption' ?
                          `${benchmark.benchmarks.national_average} kWh` :
                          `₹${benchmark.benchmarks.national_average}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Improvement Opportunity</p>
                      <p className="text-sm text-green-600">
                        You could improve by {benchmark.improvementOpportunity.toFixed(1)}% with optimization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          {efficiencyScore && (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Overall Efficiency Score
                  </CardTitle>
                  <CardDescription>Your energy efficiency across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-6xl font-bold text-primary">
                      {efficiencyScore.overall}%
                    </div>
                    <div className="flex-1">
                      <Progress value={efficiencyScore.overall} className="h-4 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {efficiencyScore.overall >= 80 ? 'Excellent efficiency!' :
                         efficiencyScore.overall >= 60 ? 'Good efficiency, room for improvement' :
                         'Significant optimization opportunities available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency by Category</CardTitle>
                  <CardDescription>Detailed breakdown of efficiency across device categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(efficiencyScore.categories).map(([category, score]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {category.replace('_', ' & ')}
                          </span>
                          <span className="text-sm font-medium">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Trends</CardTitle>
                  <CardDescription>How your efficiency has changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Weekly</p>
                      <p className="text-2xl font-bold text-blue-600">{efficiencyScore.trends.weekly}%</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Monthly</p>
                      <p className="text-2xl font-bold text-green-600">{efficiencyScore.trends.monthly}%</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Yearly</p>
                      <p className="text-2xl font-bold text-purple-600">{efficiencyScore.trends.yearly}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Positive Factors</CardTitle>
                    <CardDescription>What's working well for your efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {efficiencyScore.factors.positive.map((factor, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                    <CardDescription>Opportunities to boost your efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {efficiencyScore.factors.negative.map((factor, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{prediction.type} Prediction</CardTitle>
                    <Badge className={alertColors[prediction.alertLevel]}>
                      {prediction.alertLevel}
                    </Badge>
                  </div>
                  <CardDescription>{prediction.timeframe}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">
                      {prediction.type === 'consumption' ? 
                        `${prediction.prediction.toFixed(1)} kWh` :
                        prediction.type === 'cost' ?
                        `₹${prediction.prediction.toFixed(0)}` :
                        `${prediction.prediction.toFixed(1)}${prediction.type === 'efficiency' ? '%' : ''}`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Confidence:</span>
                        <Progress value={prediction.confidence} className="w-20 h-2" />
                        <span>{prediction.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Key Factors:</p>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-blue-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {prediction.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {predictions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">No predictions available</p>
                  <p className="text-sm text-muted-foreground">
                    More data is needed to generate accurate predictions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ML Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {mlInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={severityColors[insight.severity]}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {insight.confidence}% confidence • {insight.actionable ? 'Actionable' : 'Informational'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.description}</p>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {mlInsights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500 opacity-50" />
                  <p className="font-medium">No ML insights detected</p>
                  <p className="text-sm text-muted-foreground">
                    Your energy patterns appear optimal. The AI will continue monitoring for any anomalies.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}