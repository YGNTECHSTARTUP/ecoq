'use client';

import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();

  const handleOnboardingComplete = (userProfile: any) => {
    // Save user profile or send to backend
    console.log('Onboarding completed with profile:', userProfile);
    
    toast.success('Welcome to EcoQ! Your setup is complete.');
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <OnboardingFlow onComplete={handleOnboardingComplete} />
  );
}
