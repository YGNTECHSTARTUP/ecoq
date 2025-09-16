'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSimulatedData } from '@/hooks/use-simulated-data';
import { cn } from '@/lib/utils';

export function BadgesGallery() {
  const { badges } = useSimulatedData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Your collection of unlocked badges.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {badges.map((badge) => (
              <Tooltip key={badge.name}>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all',
                      badge.unlocked ? 'bg-accent/20 text-accent-foreground' : 'bg-muted/50 text-muted-foreground opacity-50'
                    )}
                  >
                    <div className={cn('flex items-center justify-center w-12 h-12 rounded-full', badge.unlocked ? 'bg-accent text-accent-foreground' : 'bg-muted')}>
                      <badge.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-center truncate w-full">{badge.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p>{badge.requirement}</p>
                  {!badge.unlocked && <p className="text-destructive">(Locked)</p>}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
