'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Trophy, Users, Home } from 'lucide-react';

export const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard?tab=smart-home', icon: Home, label: 'Smart Home' },
    { href: '/dashboard?tab=analytics', icon: Target, label: 'Analytics' },
    { href: '/dashboard?tab=community', icon: Users, label: 'Community' },
    { href: '/dashboard?tab=gaming', icon: Trophy, label: 'Gaming' },
];

export function MainNav({ isTooltip = false }: { isTooltip?: boolean }) {
  const pathname = usePathname();

  const renderLink = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href;
    const linkClasses = cn(
      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
      isTooltip && "h-9 w-9 items-center justify-center rounded-lg md:h-8 md:w-8",
      !isTooltip && "py-2",
      isActive && "text-foreground bg-accent",
    );
    const icon = <item.icon className={cn("h-5 w-5", isTooltip && "h-5 w-5")} />;

    if (isTooltip) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <Link href={item.href} className={linkClasses}>
              {icon}
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link href={item.href} key={item.label} className={linkClasses}>
        {icon}
        {!isTooltip && item.label}
      </Link>
    );
  };

  return (
    <>
      {navItems.map(item => renderLink(item))}
    </>
  );
}
