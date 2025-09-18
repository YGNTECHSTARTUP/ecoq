'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Home,
  Zap,
  Target,
  Settings,
  Sparkles,
  ChevronRight,
  User,
  Users,
  MapPin,
  DollarSign,
  Leaf,
  Lightbulb,
  Shield,
  TrendingUp,
  Award,
  Eye,
  EyeOff,
  Plus,
  X,
  RefreshCw,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  onboardingManager,
  type OnboardingStep,
  type OnboardingProgress,
  type OnboardingError,
  type EnergyAuditResult,
  type DeviceInfo
} from '@/lib/onboarding-manager';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete?: (userProfile: any) => void;
  className?: string;
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [errors, setErrors] = useState<OnboardingError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [auditResult, setAuditResult] = useState<EnergyAuditResult | null>(null);

  // Step-specific form data
  const [stepData, setStepData] = useState<any>({});
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [newDevice, setNewDevice] = useState<Partial<DeviceInfo>>({});

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = () => {
    updateCurrentState();
  };

  const updateCurrentState = () => {
    const step = onboardingManager.getCurrentStep();
    const prog = onboardingManager.getProgress();
    const errs = onboardingManager.getErrors();

    setCurrentStep(step);
    setProgress(prog);
    setErrors(errs);

    // Load existing step data if available
    if (step?.data) {
      setStepData(step.data);
    }
  };

  const handleNext = async () => {
    if (!currentStep) return;

    setIsLoading(true);
    try {
      // Update step data
      const success = onboardingManager.updateStepData(currentStep.id, stepData);
      
      if (success) {
        // Move to next step or complete onboarding
        if (onboardingManager.canProceedToNext()) {
          onboardingManager.nextStep();
          setStepData({});
          updateCurrentState();
        } else {
          // Complete onboarding
          const completed = await onboardingManager.completeOnboarding();
          if (completed) {
            const userProfile = onboardingManager.getUserProfile();
            onComplete?.(userProfile);
          }
        }
      } else {
        updateCurrentState();
      }
    } catch (error) {
      toast.error('Failed to save step data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    onboardingManager.previousStep();
    updateCurrentState();
  };

  const handleSkip = () => {
    if (onboardingManager.skipCurrentStep()) {
      onboardingManager.nextStep();
      updateCurrentState();
    }
  };

  const goToStep = (stepIndex: number) => {
    onboardingManager.goToStep(stepIndex);
    updateCurrentState();
  };

  const runEnergyAudit = async () => {
    setIsLoading(true);
    try {
      const result = await onboardingManager.performEnergyAudit();
      setAuditResult(result);
      
      // Mark audit step as completed
      onboardingManager.updateStepData('energy_audit', { auditResult: result });
      updateCurrentState();
      
      toast.success('Energy audit completed!');
    } catch (error) {
      toast.error('Failed to run energy audit');
    } finally {
      setIsLoading(false);
    }
  };

  const addDevice = () => {
    if (!newDevice.name || !newDevice.type) return;

    const device: DeviceInfo = {
      id: `device_${Date.now()}`,
      name: newDevice.name,
      type: newDevice.type as DeviceInfo['type'],
      brand: newDevice.brand,
      model: newDevice.model,
      age: newDevice.age,
      energyRating: newDevice.energyRating,
      estimatedUsage: newDevice.estimatedUsage,
      smartEnabled: newDevice.smartEnabled || false,
      priority: newDevice.priority || 'medium'
    };

    const updatedDevices = [...devices, device];
    setDevices(updatedDevices);
    setStepData({ ...stepData, devices: updatedDevices });
    setNewDevice({});
  };

  const removeDevice = (deviceId: string) => {
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    setDevices(updatedDevices);
    setStepData({ ...stepData, devices: updatedDevices });
  };

  if (!currentStep || !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p>Loading onboarding...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Welcome to EcoQ!</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're excited to help you optimize your energy usage, reduce costs, and minimize your environmental impact. 
                Let's create your personalized energy profile in just a few minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="p-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Save Money</h3>
                  <p className="text-sm text-muted-foreground">Reduce your energy bills by up to 30%</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <Leaf className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Go Green</h3>
                  <p className="text-sm text-muted-foreground">Lower your carbon footprint</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-semibold">Smart Insights</h3>
                  <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
                </div>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Setup Time: {progress.estimatedTimeRemaining}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete the required steps to get started, or skip optional ones and come back later.
              </p>
            </div>
          </div>
        );

      case 'personal_info':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <User className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">This helps us personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={stepData.name || ''}
                  onChange={(e) => setStepData({ ...stepData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
                {errors.find(e => e.field === 'name') && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.find(e => e.field === 'name')?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={stepData.email || ''}
                  onChange={(e) => setStepData({ ...stepData, email: e.target.value })}
                  placeholder="Enter your email"
                />
                {errors.find(e => e.field === 'email') && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.find(e => e.field === 'email')?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={stepData.phone || ''}
                  onChange={(e) => setStepData({ ...stepData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={stepData.dateOfBirth || ''}
                  onChange={(e) => setStepData({ ...stepData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 'home_info':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Home className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">About your home</h2>
              <p className="text-muted-foreground">Help us understand your living situation</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={stepData.address?.city || ''}
                    onChange={(e) => setStepData({ 
                      ...stepData, 
                      address: { ...stepData.address, city: e.target.value }
                    })}
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={stepData.address?.state || ''}
                    onChange={(e) => setStepData({ 
                      ...stepData, 
                      address: { ...stepData.address, state: e.target.value }
                    })}
                    placeholder="Enter your state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeType">Home Type *</Label>
                  <Select
                    value={stepData.homeType || ''}
                    onValueChange={(value) => setStepData({ ...stepData, homeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="homeSize">Home Size (sq ft) *</Label>
                  <Input
                    id="homeSize"
                    type="number"
                    value={stepData.homeSize || ''}
                    onChange={(e) => setStepData({ ...stepData, homeSize: parseInt(e.target.value) })}
                    placeholder="Enter square footage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupants">Number of Occupants *</Label>
                  <Input
                    id="occupants"
                    type="number"
                    value={stepData.occupants || ''}
                    onChange={(e) => setStepData({ ...stepData, occupants: parseInt(e.target.value) })}
                    placeholder="How many people live here?"
                  />
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built (Optional)</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={stepData.yearBuilt || ''}
                    onChange={(e) => setStepData({ ...stepData, yearBuilt: parseInt(e.target.value) })}
                    placeholder="Enter year built"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Home Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasGarden"
                      checked={stepData.hasGarden || false}
                      onCheckedChange={(checked) => setStepData({ ...stepData, hasGarden: checked })}
                    />
                    <Label htmlFor="hasGarden">Garden/Yard</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSolarPanels"
                      checked={stepData.hasSolarPanels || false}
                      onCheckedChange={(checked) => setStepData({ ...stepData, hasSolarPanels: checked })}
                    />
                    <Label htmlFor="hasSolarPanels">Solar Panels</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasEVCharging"
                      checked={stepData.hasEVCharging || false}
                      onCheckedChange={(checked) => setStepData({ ...stepData, hasEVCharging: checked })}
                    />
                    <Label htmlFor="hasEVCharging">EV Charging</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'energy_profile':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Your energy profile</h2>
              <p className="text-muted-foreground">Tell us about your current energy usage</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentProvider">Energy Provider *</Label>
                  <Input
                    id="currentProvider"
                    value={stepData.currentProvider || ''}
                    onChange={(e) => setStepData({ ...stepData, currentProvider: e.target.value })}
                    placeholder="Enter your energy provider"
                  />
                </div>

                <div>
                  <Label htmlFor="averageMonthlyBill">Average Monthly Bill (₹) *</Label>
                  <Input
                    id="averageMonthlyBill"
                    type="number"
                    value={stepData.averageMonthlyBill || ''}
                    onChange={(e) => setStepData({ ...stepData, averageMonthlyBill: parseInt(e.target.value) })}
                    placeholder="Enter monthly bill amount"
                  />
                </div>
              </div>

              <div>
                <Label>Energy Sources (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['grid', 'solar', 'wind', 'hydro'].map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={source}
                        checked={stepData.energySources?.includes(source) || false}
                        onCheckedChange={(checked) => {
                          const sources = stepData.energySources || [];
                          if (checked) {
                            setStepData({ 
                              ...stepData, 
                              energySources: [...sources, source] 
                            });
                          } else {
                            setStepData({ 
                              ...stepData, 
                              energySources: sources.filter((s: string) => s !== source)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={source} className="capitalize">{source}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Main Concerns (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    { id: 'cost', label: 'Cost' },
                    { id: 'environment', label: 'Environment' },
                    { id: 'reliability', label: 'Reliability' },
                    { id: 'independence', label: 'Independence' }
                  ].map((concern) => (
                    <div key={concern.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={concern.id}
                        checked={stepData.mainConcerns?.includes(concern.id) || false}
                        onCheckedChange={(checked) => {
                          const concerns = stepData.mainConcerns || [];
                          if (checked) {
                            setStepData({ 
                              ...stepData, 
                              mainConcerns: [...concerns, concern.id] 
                            });
                          } else {
                            setStepData({ 
                              ...stepData, 
                              mainConcerns: concerns.filter((c: string) => c !== concern.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={concern.id}>{concern.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="currentEfficiencyRating">Current Efficiency Rating (if known)</Label>
                <Select
                  value={stepData.currentEfficiencyRating || ''}
                  onValueChange={(value) => setStepData({ ...stepData, currentEfficiencyRating: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select efficiency rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+ (Most Efficient)</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F (Least Efficient)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'device_inventory':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Device inventory</h2>
              <p className="text-muted-foreground">Add your appliances and devices for better recommendations</p>
            </div>

            {/* Add New Device Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Device</CardTitle>
                <CardDescription>The more devices you add, the better we can optimize your energy usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      value={newDevice.name || ''}
                      onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                      placeholder="e.g., Living Room AC"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select
                      value={newDevice.type || ''}
                      onValueChange={(value: DeviceInfo['type']) => setNewDevice({ ...newDevice, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="heating">Heating</SelectItem>
                        <SelectItem value="cooling">Cooling</SelectItem>
                        <SelectItem value="appliance">Appliance</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="water_heating">Water Heating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deviceAge">Age (years)</Label>
                    <Input
                      id="deviceAge"
                      type="number"
                      value={newDevice.age || ''}
                      onChange={(e) => setNewDevice({ ...newDevice, age: parseInt(e.target.value) })}
                      placeholder="Device age"
                    />
                  </div>

                  <div>
                    <Label htmlFor="energyRating">Energy Rating</Label>
                    <Select
                      value={newDevice.energyRating || ''}
                      onValueChange={(value) => setNewDevice({ ...newDevice, energyRating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smartEnabled"
                      checked={newDevice.smartEnabled || false}
                      onCheckedChange={(checked) => setNewDevice({ ...newDevice, smartEnabled: !!checked })}
                    />
                    <Label htmlFor="smartEnabled">Smart/Connected Device</Label>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newDevice.priority || 'medium'}
                      onValueChange={(value: DeviceInfo['priority']) => setNewDevice({ ...newDevice, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={addDevice}
                  className="mt-4"
                  disabled={!newDevice.name || !newDevice.type}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </CardContent>
            </Card>

            {/* Device List */}
            {devices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Devices ({devices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {device.type.replace('_', ' ')}
                                </Badge>
                                {device.age && <span>{device.age} years old</span>}
                                {device.energyRating && (
                                  <Badge variant="secondary" className="text-xs">
                                    {device.energyRating} rated
                                  </Badge>
                                )}
                                {device.smartEnabled && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    Smart
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDevice(device.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'energy_audit':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Energy audit</h2>
              <p className="text-muted-foreground">Get instant insights into your home's energy efficiency</p>
            </div>

            {!auditResult ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <Activity className="h-16 w-16 mx-auto text-primary opacity-20" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Ready to analyze your home</h3>
                      <p className="text-muted-foreground mb-6">
                        Our AI will analyze your home information and provide personalized efficiency recommendations.
                      </p>
                      <Button onClick={runEnergyAudit} disabled={isLoading} size="lg">
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Running Audit...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Run Energy Audit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Overall Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Overall Energy Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="text-6xl font-bold text-primary">
                        {auditResult.overall_score}
                      </div>
                      <div className="flex-1">
                        <Progress value={auditResult.overall_score} className="h-4 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {auditResult.overall_score >= 80 ? 'Excellent! Your home is very energy efficient.' :
                           auditResult.overall_score >= 60 ? 'Good efficiency with room for improvement.' :
                           'Significant optimization opportunities available.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(auditResult.category_scores).map(([category, score]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
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

                {/* Estimated Savings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Potential Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{auditResult.estimated_savings.monthly_cost}
                        </div>
                        <p className="text-sm text-muted-foreground">Monthly Savings</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {auditResult.estimated_savings.monthly_kwh} kWh
                        </div>
                        <p className="text-sm text-muted-foreground">Monthly Energy</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{auditResult.estimated_savings.annual_cost}
                        </div>
                        <p className="text-sm text-muted-foreground">Annual Savings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {auditResult.recommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge className={
                              rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                              rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {rec.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-medium">
                              Save ₹{rec.estimatedSavings}/month
                            </span>
                            <span className="text-muted-foreground">
                              Payback: {rec.paybackPeriod} months
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'goal_setting':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Set your goals</h2>
              <p className="text-muted-foreground">What would you like to achieve with EcoQ?</p>
            </div>

            <div>
              <Label className="text-base font-medium">Primary Goal *</Label>
              <RadioGroup
                value={stepData.primary || ''}
                onValueChange={(value) => setStepData({ ...stepData, primary: value })}
                className="mt-3"
              >
                {onboardingManager.generateGoalSuggestions().map((suggestion) => (
                  <div key={suggestion.goal} className="flex items-start space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value={suggestion.goal} id={suggestion.goal} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={suggestion.goal} className="font-medium cursor-pointer">
                        {suggestion.goal.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                      <p className="text-sm font-medium text-green-600 mt-2">
                        Potential savings: ₹{suggestion.targetSavings}/month
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetSavings">Target Savings (%)</Label>
                <Input
                  id="targetSavings"
                  type="number"
                  value={stepData.targetSavings || ''}
                  onChange={(e) => setStepData({ ...stepData, targetSavings: parseInt(e.target.value) })}
                  placeholder="e.g., 20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage reduction in energy consumption
                </p>
              </div>

              <div>
                <Label htmlFor="targetReduction">Target Reduction (kWh/month)</Label>
                <Input
                  id="targetReduction"
                  type="number"
                  value={stepData.targetReduction || ''}
                  onChange={(e) => setStepData({ ...stepData, targetReduction: parseInt(e.target.value) })}
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly energy reduction goal
                </p>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Preferences</h2>
              <p className="text-muted-foreground">Customize your notifications and privacy settings</p>
            </div>

            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Choose how you'd like to receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifs" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Weekly reports and important updates</p>
                    </div>
                    <Checkbox
                      id="emailNotifs"
                      checked={stepData.notifications?.email !== false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        notifications: { ...stepData.notifications, email: !!checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifs" className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Real-time alerts and reminders</p>
                    </div>
                    <Checkbox
                      id="pushNotifs"
                      checked={stepData.notifications?.push || false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        notifications: { ...stepData.notifications, push: !!checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifs" className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Critical alerts only</p>
                    </div>
                    <Checkbox
                      id="smsNotifs"
                      checked={stepData.notifications?.sms || false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        notifications: { ...stepData.notifications, sms: !!checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Privacy</CardTitle>
                  <CardDescription>Control your data sharing and visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shareUsageData" className="font-medium">Share Usage Data</Label>
                      <p className="text-sm text-muted-foreground">Help improve our recommendations (anonymized)</p>
                    </div>
                    <Checkbox
                      id="shareUsageData"
                      checked={stepData.privacy?.shareUsageData !== false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        privacy: { ...stepData.privacy, shareUsageData: !!checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="joinCommunity" className="font-medium">Join Community</Label>
                      <p className="text-sm text-muted-foreground">Participate in challenges and leaderboards</p>
                    </div>
                    <Checkbox
                      id="joinCommunity"
                      checked={stepData.privacy?.joinCommunity !== false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        privacy: { ...stepData.privacy, joinCommunity: !!checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showInLeaderboards" className="font-medium">Show in Leaderboards</Label>
                      <p className="text-sm text-muted-foreground">Display your achievements publicly</p>
                    </div>
                    <Checkbox
                      id="showInLeaderboards"
                      checked={stepData.privacy?.showInLeaderboards || false}
                      onCheckedChange={(checked) => setStepData({
                        ...stepData,
                        privacy: { ...stepData.privacy, showInLeaderboards: !!checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'summary':
        const userProfile = onboardingManager.getUserProfile();
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-3xl font-bold">Setup Complete!</h2>
              <p className="text-lg text-muted-foreground">Your personalized energy profile is ready</p>
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {userProfile.personalInfo?.name}</p>
                    <p><span className="font-medium">Email:</span> {userProfile.personalInfo?.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Home Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Location:</span> {userProfile.homeInfo?.address?.city}, {userProfile.homeInfo?.address?.state}</p>
                    <p><span className="font-medium">Type:</span> {userProfile.homeInfo?.homeType}</p>
                    <p><span className="font-medium">Size:</span> {userProfile.homeInfo?.homeSize} sq ft</p>
                    <p><span className="font-medium">Occupants:</span> {userProfile.homeInfo?.occupants}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Energy Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Provider:</span> {userProfile.energyProfile?.currentProvider}</p>
                    <p><span className="font-medium">Monthly Bill:</span> ₹{userProfile.energyProfile?.averageMonthlyBill}</p>
                    <p><span className="font-medium">Energy Sources:</span> {userProfile.energyProfile?.energySources?.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">🚀 What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Monitor Your Usage</h4>
                      <p className="text-sm text-muted-foreground">Start tracking your daily energy consumption and identify patterns.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Follow Recommendations</h4>
                      <p className="text-sm text-muted-foreground">Implement AI-suggested optimizations to start saving energy.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Smart Automation</h4>
                      <p className="text-sm text-muted-foreground">Set up automated schedules and controls for your devices.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Join the Community</h4>
                      <p className="text-sm text-muted-foreground">Connect with neighbors and participate in energy challenges.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please check the following issues before completing setup:
                  <ul className="list-disc ml-4 mt-2">
                    {errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p>Unknown step: {currentStep.id}</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-green-50 ${className}`}>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">EcoQ Setup</h1>
              <p className="text-muted-foreground">
                Step {progress.currentStepIndex + 1} of {progress.totalSteps}: {currentStep.title}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {progress.estimatedTimeRemaining && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {progress.estimatedTimeRemaining} remaining
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress.percentComplete} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.percentComplete}% Complete</span>
              <span>{progress.completedSteps.length} of {onboardingManager.getAllSteps().filter(s => s.required).length} required steps</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={progress.currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* Skip button for optional steps */}
            {!currentStep.required && progress.currentStepIndex !== progress.totalSteps - 1 && (
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : progress.currentStepIndex === progress.totalSteps - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            {onboardingManager.getAllSteps().map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === progress.currentStepIndex
                    ? 'bg-primary'
                    : step.completed
                    ? 'bg-green-500'
                    : step.required
                    ? 'bg-gray-300'
                    : 'bg-gray-200'
                }`}
                title={`${step.title}${step.completed ? ' (Completed)' : step.required ? ' (Required)' : ' (Optional)'}`}
              />
            ))}
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm">{error.message}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Help Dialog */}
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Help - {currentStep.title}</DialogTitle>
              <DialogDescription>
                {currentStep.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm">{onboardingManager.getHelpContent(currentStep.id)}</p>
              
              {currentStep.estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated time: {currentStep.estimatedTime}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={currentStep.required ? 'default' : 'secondary'}>
                  {currentStep.required ? 'Required' : 'Optional'}
                </Badge>
                {currentStep.completed && (
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}