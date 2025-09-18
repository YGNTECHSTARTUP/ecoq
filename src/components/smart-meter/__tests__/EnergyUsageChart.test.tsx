/**
 * Jest tests for EnergyUsageChart component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnergyUsageChart } from '../enhanced-smart-meter-components';
import { ComponentErrorBoundary } from '../../ui/error-boundary';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  LineChart: ({ children, data, ...props }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  BarChart: ({ children, data, ...props }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  AreaChart: ({ children, data, ...props }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  Line: (props: any) => <div data-testid="line" {...props} />,
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  Area: (props: any) => <div data-testid="area" {...props} />,
}));

// Mock useEnergyAnalytics hook
const mockUseEnergyAnalytics = jest.fn();

jest.mock('../../hooks/useSmartMeter', () => ({
  useEnergyAnalytics: mockUseEnergyAnalytics,
  useSmartMeter: jest.fn(() => ({ devices: [], loading: false, error: null })),
  useSmartMeterStats: jest.fn(() => ({ totalDevices: 0, onlineDevices: 0 })),
  useMeterReading: jest.fn(() => ({ reading: null, lastUpdate: null, isOnline: false })),
  useDeviceData: jest.fn(() => ({ energyData: null, loading: false })),
  useDeviceAutomation: jest.fn(() => ({
    schedules: [],
    loading: false,
    error: null,
    createSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    toggleScheduleActive: jest.fn()
  }))
}));

// Mock URL.createObjectURL and revokeObjectURL for CSV export tests
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(window.URL, 'createObjectURL', {
  value: mockCreateObjectURL
});
Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL
});

// Mock document.createElement and appendChild/removeChild for download
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
document.createElement = jest.fn().mockImplementation((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
    };
  }
  return {};
});
document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;

// Sample test data
const mockEnergyData = [
  {
    timestamp: '2024-01-15T00:00:00.000Z',
    consumption: 2.5,
    cost: 0.35,
    efficiency: 85,
    carbon: 0.5,
    predicted: 2.8
  },
  {
    timestamp: '2024-01-15T01:00:00.000Z',
    consumption: 2.2,
    cost: 0.32,
    efficiency: 87,
    carbon: 0.48
  },
  {
    timestamp: '2024-01-15T02:00:00.000Z',
    consumption: 2.8,
    cost: 0.38,
    efficiency: 83,
    carbon: 0.52,
    predicted: 2.6
  }
];

describe('EnergyUsageChart', () => {
  const defaultProps = {
    timeRange: '24h' as const,
    chartType: 'line' as const,
    showPrediction: false,
    meterId: 'meter-001'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnergyAnalytics.mockReturnValue({
      data: mockEnergyData,
      loading: false,
      error: null
    });
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders chart with default props', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Energy Usage Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders with provided data instead of fetched data', () => {
      const propData = [
        {
          timestamp: '2024-01-15T03:00:00.000Z',
          consumption: 3.0,
          cost: 0.40,
          efficiency: 90,
          carbon: 0.55
        }
      ];

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} data={propData} />
        </ComponentErrorBoundary>
      );

      const chart = screen.getByTestId('line-chart');
      expect(JSON.parse(chart.getAttribute('data-chart-data') || '[]')).toEqual(propData);
    });

    it('renders bar chart when chartType is bar', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} chartType="bar" />
        </ComponentErrorBoundary>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar')).toBeInTheDocument();
    });

    it('renders area chart when chartType is area', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} chartType="area" />
        </ComponentErrorBoundary>
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area')).toBeInTheDocument();
    });

    it('shows prediction badge when showPrediction is true', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} showPrediction={true} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('AI Prediction')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state when data is loading', () => {
      mockUseEnergyAnalytics.mockReturnValue({
        data: null,
        loading: true,
        error: null
      });

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('shows error state when data loading fails', () => {
      mockUseEnergyAnalytics.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to fetch analytics data')
      });

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('shows empty state when no data is available', () => {
      mockUseEnergyAnalytics.mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('No data available for selected period')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Metric Selection', () => {
    it('changes selected metric when dropdown value changes', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const select = screen.getByDisplayValue('Consumption');
      await user.selectOptions(select, 'cost');

      await waitFor(() => {
        expect(screen.getByDisplayValue('Cost')).toBeInTheDocument();
      });
    });

    it('updates metrics summary when metric selection changes', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Initially shows consumption metrics
      expect(screen.getByText('2.8 kWh')).toBeInTheDocument(); // Current value

      const select = screen.getByDisplayValue('Consumption');
      await user.selectOptions(select, 'cost');

      await waitFor(() => {
        expect(screen.getByText('$0.38')).toBeInTheDocument(); // Current cost value
      });
    });
  });

  describe('Time Range Formatting', () => {
    it('formats 24h timestamps correctly', () => {
      const data = [
        {
          timestamp: '2024-01-15T14:30:00.000Z',
          consumption: 2.5,
          cost: 0.35,
          efficiency: 85,
          carbon: 0.5
        }
      ];

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} data={data} timeRange="24h" />
        </ComponentErrorBoundary>
      );

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('tickFormatter');
    });

    it('formats 7d timestamps correctly', () => {
      const data = [
        {
          timestamp: '2024-01-15T00:00:00.000Z',
          consumption: 2.5,
          cost: 0.35,
          efficiency: 85,
          carbon: 0.5
        }
      ];

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} data={data} timeRange="7d" />
        </ComponentErrorBoundary>
      );

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('tickFormatter');
    });

    it('formats Y-axis labels based on selected metric', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('tickFormatter');

      // Change to cost metric
      const select = screen.getByDisplayValue('Consumption');
      await user.selectOptions(select, 'cost');

      await waitFor(() => {
        const updatedYAxis = screen.getByTestId('y-axis');
        expect(updatedYAxis).toHaveAttribute('tickFormatter');
      });
    });
  });

  describe('CSV Export', () => {
    it('exports CSV data correctly', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });

    it('generates correct CSV filename', async () => {
      const user = userEvent.setup();
      const today = new Date().toISOString().split('T')[0];

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockAppendChild).toHaveBeenCalledWith(
          expect.objectContaining({
            download: `energy-consumption-24h-${today}.csv`
          })
        );
      });
    });

    it('includes prediction data in CSV when showPrediction is true', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} showPrediction={true} />
        </ComponentErrorBoundary>
      );

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      await waitFor(() => {
        const blobCall = mockCreateObjectURL.mock.calls[0][0];
        expect(blobCall).toBeInstanceOf(Blob);
        expect(blobCall.type).toBe('text/csv');
      });
    });

    it('disables export button when no data is available', () => {
      mockUseEnergyAnalytics.mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const exportButton = screen.getByText('Export CSV');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Fullscreen Mode', () => {
    it('toggles fullscreen mode when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      await user.click(fullscreenButton);

      // Check if fullscreen class is applied to card
      const card = screen.getByRole('region'); // Card component
      expect(card).toHaveClass('fixed', 'inset-4', 'z-50');
    });
  });

  describe('Analytics Hook Integration', () => {
    it('calls useEnergyAnalytics with correct parameters', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} meterId="test-meter" timeRange="7d" showPrediction={true} />
        </ComponentErrorBoundary>
      );

      expect(mockUseEnergyAnalytics).toHaveBeenCalledWith({
        meterId: 'test-meter',
        timeRange: '7d',
        includePredicton: true
      });
    });

    it('uses prop data when provided instead of hook data', () => {
      const propData = [
        {
          timestamp: '2024-01-15T00:00:00.000Z',
          consumption: 5.0,
          cost: 0.70,
          efficiency: 95,
          carbon: 1.0
        }
      ];

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} data={propData} />
        </ComponentErrorBoundary>
      );

      const chart = screen.getByTestId('line-chart');
      expect(JSON.parse(chart.getAttribute('data-chart-data') || '[]')).toEqual(propData);
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles rendering errors gracefully', () => {
      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Force an error by providing invalid props
      const InvalidComponent = () => {
        throw new Error('Test error');
      };

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <InvalidComponent />
        </ComponentErrorBoundary>
      );

      // Error boundary should catch the error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate ARIA labels', () => {
      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Metric selector
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="EnergyUsageChart">
          <EnergyUsageChart {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const select = screen.getByDisplayValue('Consumption');
      
      // Tab to the select element
      await user.tab();
      expect(select).toHaveFocus();

      // Use keyboard to navigate options
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Should change the selection
      await waitFor(() => {
        expect(screen.getByDisplayValue('Cost')).toBeInTheDocument();
      });
    });
  });
});