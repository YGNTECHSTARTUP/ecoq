/**
 * Advanced Smart Meter Dashboard Page
 * 
 * Enterprise-grade dashboard with AI features and advanced analytics
 */

'use client';

import { AdvancedSmartMeterDashboard } from '@/components/smart-meter';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { CardSkeleton } from '@/components/ui/enhanced-loading';

function AdvancedSmartMeterPageContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/smart-meter/advanced');
  }

  return <AdvancedSmartMeterDashboard />;
}

export default function AdvancedSmartMeterPage() {
  return (
    <ComponentErrorBoundary componentName="AdvancedSmartMeterPage">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }>
        <AdvancedSmartMeterPageContent />
      </Suspense>
    </ComponentErrorBoundary>
  );
}