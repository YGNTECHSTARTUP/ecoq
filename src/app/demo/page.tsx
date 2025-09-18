'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Skip onboarding and go directly to dashboard for demo purposes
    toast.success('Welcome to EcoQ Dashboard Demo!');
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}