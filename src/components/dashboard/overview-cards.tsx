'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Zap, CheckCircle, Wallet } from 'lucide-react';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewCards() {
  const { overview, loading } = useSimulatedData();

  const cards = [
    {
      title: 'Watts Points',
      value: overview.wattsPoints.toLocaleString(),
      icon: Gem,
      description: 'Total points earned',
    },
    {
      title: 'kWh Saved',
      value: overview.kwhSaved.toLocaleString(),
      icon: Zap,
      description: 'This month',
    },
    {
      title: 'Money Saved',
      value: `₹${overview.moneySaved.toLocaleString()}`,
      icon: Wallet,
      description: 'This month',
    },
    {
      title: 'Quests Completed',
      value: overview.questsCompleted.toLocaleString(),
      icon: CheckCircle,
      description: 'All time',
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">{card.value}</div>
            )}
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
