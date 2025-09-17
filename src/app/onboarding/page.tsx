'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import SmartMeterIntegration from '@/components/dashboard/smart-meter-integration';

export default function OnboardingPage() {
  const router = useRouter();

  const handleConnected = () => {
    router.push('/dashboard?tab=controls');
  };

  return (
    <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-4xl mx-auto">
                <SmartMeterIntegration onConnected={handleConnected} />
            </div>
        </div>
    </MainLayout>
  );
}
