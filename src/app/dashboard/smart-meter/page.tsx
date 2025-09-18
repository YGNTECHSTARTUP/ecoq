/**
 * Smart Meter Dashboard Page
 * 
 * Main dashboard page for smart meter monitoring and management
 */

'use client';

import { SmartMeterDashboard } from '@/components/smart-meter';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { CardSkeleton } from '@/components/ui/enhanced-loading';

function SmartMeterPageContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/smart-meter');
  }

  return <SmartMeterDashboard />;
}

export default function SmartMeterPage() {
  return (
    <ComponentErrorBoundary componentName="SmartMeterPage">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <SmartMeterPageContent />
      </Suspense>
    </ComponentErrorBoundary>
  );
}