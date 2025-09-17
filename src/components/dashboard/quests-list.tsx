'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { Loader2, WandSparkles } from 'lucide-react';

export function QuestsList() {
  const { quests, generateNewQuest, generatingQuest } = useSimulatedData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Quests</CardTitle>
          <CardDescription>Complete challenges to earn Watts Points.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={generateNewQuest} disabled={generatingQuest}>
          {generatingQuest ? <Loader2 className="animate-spin" /> : <WandSparkles />}
          New AI Quest
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {quests.map((quest, index) => (
          <div key={quest.id}>
             {index > 0 && <Separator className="my-4" />}
            <div className="flex items-center space-x-4">
              <quest.icon className="h-8 w-8 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{quest.title}{quest.isNew && <span className="ml-2 text-xs text-accent font-semibold">[NEW]</span>}</p>
                <p className="text-sm text-muted-foreground">{quest.description}</p>
              </div>
              <div className="text-sm font-semibold text-accent">+{quest.reward} pts</div>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Progress value={(quest.progress / quest.target) * 100} className="w-full" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {quest.progress}/{quest.target} {quest.unit}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
