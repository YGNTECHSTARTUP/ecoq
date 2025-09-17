'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { MainLayout } from '@/components/main-layout';
import SmartMeterIntegration from '@/components/dashboard/smart-meter-integration';

export default function OnboardingPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="group flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-12 md:w-12 md:text-base">
                        <Zap className="h-6 w-6 transition-all group-hover:scale-110" />
                        <span className="sr-only">EcoQuest</span>
                    </div>
                </div>
                <h1 className="text-center text-3xl font-bold tracking-tight mb-2">Connect Your Smart Meter</h1>
                <p className="text-center text-muted-foreground mb-8">
                    Connect your smart meter to get real-time data and personalized quests, or try a demo connection.
                </p>

                <SmartMeterIntegration />

                <div className="mt-10 flex justify-center">
                    <Button size="lg" onClick={handleContinue}>
                        Continue to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    </MainLayout>
  );
}
