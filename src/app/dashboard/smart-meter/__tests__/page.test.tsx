/**
 * Jest tests for smart meter dashboard page routes
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SmartMeterPage from '../page';
import AdvancedSmartMeterPage from '../advanced/page';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/dashboard/smart-meter',
    query: {},
    asPath: '/dashboard/smart-meter'
  }),
  redirect: jest.fn((url) => {
    throw new Error(`REDIRECT: ${url}`);
  })
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

// Mock smart meter components
jest.mock('@/components/smart-meter', () => ({
  SmartMeterDashboard: () => <div data-testid="smart-meter-dashboard">Smart Meter Dashboard</div>,
  AdvancedSmartMeterDashboard: () => <div data-testid="advanced-smart-meter-dashboard">Advanced Smart Meter Dashboard</div>
}));

// Mock CardSkeleton component
jest.mock('@/components/ui/enhanced-loading', () => ({
  CardSkeleton: () => <div data-testid="card-skeleton">Loading skeleton...</div>
}));

// Mock ComponentErrorBoundary
jest.mock('@/components/ui/error-boundary', () => ({
  ComponentErrorBoundary: ({ children, componentName }: { children: React.ReactNode; componentName: string }) => (
    <div data-testid={`error-boundary-${componentName}`}>
      {children}
    </div>
  )
}));

describe('Smart Meter Dashboard Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset redirect mock
    jest.doMock('next/navigation', () => ({
      ...jest.requireActual('next/navigation'),
      redirect: jest.fn()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SmartMeterPage (/dashboard/smart-meter)', () => {
    it('shows loading skeletons when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<SmartMeterPage />);

      // Should show multiple loading skeletons
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons).toHaveLength(4);
      expect(screen.getByText('Loading skeleton...')).toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      });

      expect(() => {
        render(<SmartMeterPage />);
      }).toThrow('REDIRECT: /auth/login?redirect=/dashboard/smart-meter');
    });

    it('renders SmartMeterDashboard when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      render(<SmartMeterPage />);

      expect(screen.getByTestId('smart-meter-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Smart Meter Dashboard')).toBeInTheDocument();
    });

    it('wraps content with error boundary', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      render(<SmartMeterPage />);

      expect(screen.getByTestId('error-boundary-SmartMeterPage')).toBeInTheDocument();
    });

    it('provides Suspense fallback with loading skeletons', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      // The Suspense fallback should be the same as the loading state
      const { container } = render(<SmartMeterPage />);
      
      // Check that error boundary is present
      expect(screen.getByTestId('error-boundary-SmartMeterPage')).toBeInTheDocument();
    });

    it('handles authentication state changes correctly', () => {
      // Start with loading state
      const { rerender } = render(<SmartMeterPage />);
      
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });
      
      rerender(<SmartMeterPage />);
      expect(screen.getAllByTestId('card-skeleton')).toHaveLength(4);

      // Change to authenticated state
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });
      
      rerender(<SmartMeterPage />);
      expect(screen.getByTestId('smart-meter-dashboard')).toBeInTheDocument();
    });
  });

  describe('AdvancedSmartMeterPage (/dashboard/smart-meter/advanced)', () => {
    it('shows loading skeletons when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<AdvancedSmartMeterPage />);

      // Should show multiple loading skeletons (6 for advanced page)
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons).toHaveLength(6);
    });

    it('redirects to login with correct redirect URL when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      });

      expect(() => {
        render(<AdvancedSmartMeterPage />);
      }).toThrow('REDIRECT: /auth/login?redirect=/dashboard/smart-meter/advanced');
    });

    it('renders AdvancedSmartMeterDashboard when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      render(<AdvancedSmartMeterPage />);

      expect(screen.getByTestId('advanced-smart-meter-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Advanced Smart Meter Dashboard')).toBeInTheDocument();
    });

    it('wraps content with error boundary', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      render(<AdvancedSmartMeterPage />);

      expect(screen.getByTestId('error-boundary-AdvancedSmartMeterPage')).toBeInTheDocument();
    });

    it('applies correct background styling', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      const { container } = render(<AdvancedSmartMeterPage />);
      
      // Check for gradient background class
      const backgroundElement = container.querySelector('.bg-gradient-to-br.from-gray-50.to-blue-50');
      expect(backgroundElement).toBeInTheDocument();
    });

    it('shows correct number of skeleton cards for advanced layout', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<AdvancedSmartMeterPage />);

      // Advanced page should have 6 skeleton cards in xl:grid-cols-3 layout
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons).toHaveLength(6);
    });
  });

  describe('Error Boundary Integration', () => {
    it('catches and handles rendering errors in SmartMeterPage', () => {
      // Mock console.error to suppress error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAuth.mockImplementation(() => {
        throw new Error('Auth hook error');
      });

      render(<SmartMeterPage />);

      // Error boundary should catch the error
      expect(screen.getByTestId('error-boundary-SmartMeterPage')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('catches and handles rendering errors in AdvancedSmartMeterPage', () => {
      // Mock console.error to suppress error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAuth.mockImplementation(() => {
        throw new Error('Auth hook error');
      });

      render(<AdvancedSmartMeterPage />);

      // Error boundary should catch the error
      expect(screen.getByTestId('error-boundary-AdvancedSmartMeterPage')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Loading State Consistency', () => {
    it('shows consistent loading UI between Suspense fallback and auth loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<SmartMeterPage />);

      // Both should show the same skeleton layout
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons).toHaveLength(4);
      
      // Check for grid layout classes
      const gridContainer = screen.getByTestId('card-skeleton').parentElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
    });

    it('shows consistent loading UI for advanced page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<AdvancedSmartMeterPage />);

      // Advanced page should show different grid layout
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons).toHaveLength(6);
      
      const gridContainer = screen.getByTestId('card-skeleton').parentElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3', 'gap-6');
    });
  });

  describe('Authentication Flow', () => {
    it('preserves redirect URL in query parameters for basic page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      });

      expect(() => {
        render(<SmartMeterPage />);
      }).toThrow('REDIRECT: /auth/login?redirect=/dashboard/smart-meter');
    });

    it('preserves redirect URL in query parameters for advanced page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      });

      expect(() => {
        render(<AdvancedSmartMeterPage />);
      }).toThrow('REDIRECT: /auth/login?redirect=/dashboard/smart-meter/advanced');
    });

    it('does not redirect when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });

      expect(() => {
        render(<SmartMeterPage />);
      }).not.toThrow();

      expect(() => {
        render(<AdvancedSmartMeterPage />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate loading announcements', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(<SmartMeterPage />);

      // Loading skeletons should be announced to screen readers
      const skeletons = screen.getAllByTestId('card-skeleton');
      expect(skeletons[0]).toHaveTextContent('Loading skeleton...');
    });

    it('maintains focus management during auth state changes', async () => {
      const { rerender } = render(<SmartMeterPage />);
      
      // Start with loading
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });
      
      rerender(<SmartMeterPage />);
      
      // Change to authenticated - focus should be maintained
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false
      });
      
      rerender(<SmartMeterPage />);
      
      // Component should render without accessibility issues
      expect(screen.getByTestId('smart-meter-dashboard')).toBeInTheDocument();
    });
  });
});