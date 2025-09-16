'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { smartMeterBrands } from '@/lib/mock-data';
import { MainLayout } from '@/components/main-layout';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedBrand) {
      router.push('/dashboard');
    }
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
            <p className="text-center text-muted-foreground mb-8">Select your smart meter brand to get started.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {smartMeterBrands.map((brand) => (
                <Card
                key={brand.name}
                className={cn(
                    'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
                    selectedBrand === brand.name && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                onClick={() => setSelectedBrand(brand.name)}
                >
                <CardContent className="flex flex-col items-center justify-center p-6 relative">
                    {selectedBrand === brand.name && (
                    <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-primary bg-background rounded-full" />
                    )}
                    <Image
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    width={100}
                    height={60}
                    className="object-contain h-16"
                    data-ai-hint="logo"
                    />
                    <p className="mt-4 text-sm font-medium text-center">{brand.name}</p>
                </CardContent>
                </Card>
            ))}
            </div>

            <div className="mt-10 flex justify-center">
            <Button size="lg" disabled={!selectedBrand} onClick={handleContinue}>
                Continue
            </Button>
            </div>
        </div>
        </div>
    </MainLayout>
  );
}
