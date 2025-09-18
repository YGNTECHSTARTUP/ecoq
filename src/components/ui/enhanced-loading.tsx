/**
 * Enhanced Loading Components
 * 
 * Modern loading states, skeletons, and progress indicators
 * with smooth animations and responsive design.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, Zap, Activity } from 'lucide-react';

// Base Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    ghost: 'text-background'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  );
}

// Pulsing Dots Loader
export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

// Energy Flow Animation
export function EnergyFlowLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <Zap className="h-8 w-8 text-primary animate-pulse" />
        <div className="absolute inset-0 -m-2">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    </div>
  );
}

// Progress Circle
interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export function ProgressCircle({
  progress,
  size = 60,
  strokeWidth = 6,
  className,
  showText = true
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}

// Enhanced Skeleton Components
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-3 w-40 bg-muted animate-pulse rounded" />
        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Chart area */}
        <div className="h-64 bg-muted/30 animate-pulse rounded-md relative overflow-hidden">
          {/* Animated bars */}
          <div className="absolute bottom-0 left-4 w-8 bg-muted animate-pulse rounded-t" 
               style={{ height: '40%', animationDelay: '0s' }} />
          <div className="absolute bottom-0 left-16 w-8 bg-muted animate-pulse rounded-t" 
               style={{ height: '60%', animationDelay: '0.2s' }} />
          <div className="absolute bottom-0 left-28 w-8 bg-muted animate-pulse rounded-t" 
               style={{ height: '30%', animationDelay: '0.4s' }} />
          <div className="absolute bottom-0 left-40 w-8 bg-muted animate-pulse rounded-t" 
               style={{ height: '80%', animationDelay: '0.6s' }} />
          <div className="absolute bottom-0 left-52 w-8 bg-muted animate-pulse rounded-t" 
               style={{ height: '50%', animationDelay: '0.8s' }} />
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-4 bg-muted animate-pulse rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
          {[1, 2, 3, 4].map((j) => (
            <div 
              key={j} 
              className="flex-1 h-4 bg-muted animate-pulse rounded"
              style={{ animationDelay: `${(i * 4 + j) * 0.1}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading States for Different Content Types
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export function QuestSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-72 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded-full" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted animate-pulse rounded-full" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading Overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  blur?: boolean;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  blur = true 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      <div className={cn(
        'transition-all duration-200',
        isLoading && blur && 'blur-sm opacity-50'
      )}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <EnergyFlowLoader />
            <p className="text-sm font-medium text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Refresh Button with Loading State
interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  className?: string;
}

export function RefreshButton({ onRefresh, isRefreshing, className }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        'rounded-md transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className={cn(
        'h-4 w-4',
        isRefreshing && 'animate-spin'
      )} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}

// Data State Display
interface DataStateProps {
  loading: boolean;
  error: string | null;
  data: any;
  loadingSkeleton?: React.ReactNode;
  errorMessage?: string;
  emptyMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

export function DataState({
  loading,
  error,
  data,
  loadingSkeleton,
  errorMessage = 'Something went wrong',
  emptyMessage = 'No data available',
  children,
  onRetry
}: DataStateProps) {
  if (loading) {
    return loadingSkeleton || <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Activity className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Activity className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Data</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}