/**
 * Enhanced Error Boundary Components
 * 
 * Production-ready error boundaries with recovery options,
 * error logging, and user-friendly error displays.
 */

'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Error types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

// Error logging service
class ErrorLogger {
  static logError(error: Error, errorInfo: ErrorInfo, userId?: string) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, send to error tracking service
    console.group('🚨 Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Details:', errorDetails);
    console.groupEnd();

    // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorDetails });
  }
}

// Main Error Boundary Class
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number | boolean | null | undefined>;
  isolate?: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substring(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error
    ErrorLogger.logError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && resetKeys !== (prevProps.resetKeys || [])) {
      const hasResetKeyChanged = resetKeys.some((key, idx) => 
        key !== (prevProps.resetKeys || [])[idx]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any props change if resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetErrorBoundary}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Props
export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  errorId: string;
}

// Default Error Fallback Component
export function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  errorId 
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">Something went wrong</CardTitle>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, this has been reported to our team.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bug className="h-4 w-4" />
            <span>Error ID: </span>
            <Badge variant="outline" className="font-mono text-xs">
              {errorId}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <h4 className="font-semibold text-sm mb-2">Error Message</h4>
                <code className="block text-xs bg-muted p-3 rounded-md overflow-auto">
                  {error?.message || 'Unknown error'}
                </code>
              </div>
              
              {error?.stack && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Stack Trace</h4>
                  <code className="block text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                    {error.stack}
                  </code>
                </div>
              )}
              
              {errorInfo?.componentStack && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Component Stack</h4>
                  <code className="block text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </code>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Compact Error Fallback for smaller components
export function CompactErrorFallback({ 
  error, 
  resetError, 
  errorId 
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg bg-destructive/5">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="font-semibold text-sm mb-2">Error occurred</h3>
      <p className="text-xs text-muted-foreground mb-3 max-w-xs">
        {error?.message || 'Something went wrong in this component'}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={resetError}>
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Async Error Boundary for handling async errors
export function useAsyncError() {
  const [, setError] = React.useState();
  
  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
}

// Hook for error handling with toast notifications
export function useErrorHandler() {
  const throwError = useAsyncError();

  return React.useCallback((error: Error, options?: {
    toast?: boolean;
    log?: boolean;
  }) => {
    const { toast = true, log = true } = options || {};

    if (log) {
      console.error('Handled error:', error);
    }

    if (toast) {
      // In production, show toast notification
      // toast.error(error.message);
    }

    throwError(error);
  }, [throwError]);
}

// Specialized Error Boundaries for different contexts
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DefaultErrorFallback}
      onError={(error, errorInfo) => {
        // Custom logging for dashboard errors
        console.error('Dashboard Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={(props) => (
        <CompactErrorFallback 
          {...props} 
        />
      )}
      onError={(error, errorInfo) => {
        console.error(`Component Error (${componentName}):`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center h-64 p-6 border rounded-lg bg-muted/5">
          <AlertTriangle className="h-6 w-6 text-muted-foreground mb-2" />
          <h3 className="font-medium text-sm mb-1">Chart Error</h3>
          <p className="text-xs text-muted-foreground mb-3 text-center">
            Unable to load chart data
          </p>
          <Button size="sm" variant="outline" onClick={resetError}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Network Error Display
export function NetworkErrorFallback({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="rounded-full bg-orange-100 p-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Network Error</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        Unable to connect to our servers. Please check your internet connection and try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Permission Error Display
export function PermissionErrorFallback({ 
  message = 'You do not have permission to access this resource',
  onGoBack,
  className
}: {
  message?: string;
  onGoBack?: () => void;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {message}
      </p>
      <Button onClick={onGoBack || (() => window.history.back())}>
        <Home className="mr-2 h-4 w-4" />
        Go Back
      </Button>
    </div>
  );
}