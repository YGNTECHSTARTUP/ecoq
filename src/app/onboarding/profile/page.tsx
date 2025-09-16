'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const steps = [
  {
    title: 'Profile Information',
    description: 'Tell us a bit about yourself.',
    fields: ['name', 'householdSize'],
  },
  {
    title: 'Home Setup',
    description: 'Describe your home for tailored tips.',
    fields: ['homeType', 'homeSize'],
  },
  {
    title: 'Energy Goals',
    description: 'Set your energy saving targets.',
    fields: ['savingGoal'],
  },
];

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    householdSize: '',
    homeType: '',
    homeSize: '',
    savingGoal: '',
  });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Navigate to the next part of onboarding
      router.push('/onboarding');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground text-center">This will help us personalize your EcoQuest.</p>
            <Progress value={progress} className="w-full mt-4 h-2" />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{steps[step].title}</CardTitle>
                <CardDescription>{steps[step].description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    {step === 0 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="name" placeholder="John Doe" className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="householdSize">Household Size</Label>
                                <div className="relative">
                                     <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="householdSize" type="number" placeholder="e.g., 4" className="pl-10" />
                                </div>
                            </div>
                        </>
                    )}
                    {step === 1 && (
                         <>
                            <div className="space-y-2">
                                <Label htmlFor="homeType">Home Type</Label>
                                 <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select home type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="villa">Villa</SelectItem>
                                        <SelectItem value="independent_house">Independent House</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="homeSize">Approximate Home Size (sq. ft.)</Label>
                                <Input id="homeSize" type="number" placeholder="e.g., 1200" />
                            </div>
                        </>
                    )}
                     {step === 2 && (
                         <div className="space-y-2">
                            <Label htmlFor="savingGoal">Monthly Saving Goal</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your goal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="10">10%</SelectItem>
                                    <SelectItem value="15">15%</SelectItem>
                                    <SelectItem value="20">20%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? 'Finish & Connect Meter' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
