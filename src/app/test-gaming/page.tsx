'use client';

import { DemoGameControls } from '@/components/dashboard/demo-game-controls';

export default function TestGamingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">EcoQuest Gaming System Test</h1>
        
        {/* Show the gaming launcher first */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gaming Launcher (Default View)</h2>
          <DemoGameControls consumerId="DEMO123456" />
        </div>
        
        {/* Show full gaming dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Full Gaming Dashboard</h2>
          <DemoGameControls consumerId="DEMO123456" showFullDashboard={true} />
        </div>
      </div>
    </div>
  );
}