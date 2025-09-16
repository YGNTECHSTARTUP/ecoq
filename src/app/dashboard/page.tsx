import { MainLayout } from '@/components/main-layout';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { EnergyUsageChart } from '@/components/dashboard/energy-usage-chart';
import { QuestsList } from '@/components/dashboard/quests-list';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { BadgesGallery } from '@/components/dashboard/badges-gallery';
import { SmartHomeControls } from '@/components/dashboard/smart-home-controls';
import { AiTipGenerator } from '@/components/dashboard/ai-tip-generator';
import { SimulationControls } from '@/components/dashboard/simulation-controls';

export default function DashboardPage() {
  return (
    <MainLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCards />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <EnergyUsageChart />
          </div>
          <div className="col-span-4 lg:col-span-3 space-y-4">
            <QuestsList />
            <AiTipGenerator />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 lg:col-span-3">
             <Leaderboard />
          </div>
           <div className="col-span-4 space-y-4">
              <BadgesGallery />
              <SmartHomeControls />
              <SimulationControls />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
