/**
 * Storybook stories for EnergyUsageChart component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { EnergyUsageChart } from '@/components/smart-meter';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';

// Mock data for different scenarios
const mockEnergyData24h = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
  consumption: 2.5 + Math.random() * 2,
  cost: 0.35 + Math.random() * 0.3,
  efficiency: 85 + Math.random() * 15,
  carbon: 0.5 + Math.random() * 0.3,
  predicted: i > 18 ? 2.8 + Math.random() * 1.5 : undefined
}));

const mockEnergyData7d = Array.from({ length: 7 }, (_, i) => ({
  timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
  consumption: 45 + Math.random() * 20,
  cost: 6.5 + Math.random() * 3,
  efficiency: 80 + Math.random() * 20,
  carbon: 8.2 + Math.random() * 4,
  predicted: i > 4 ? 48 + Math.random() * 15 : undefined
}));

const mockEnergyData30d = Array.from({ length: 30 }, (_, i) => ({
  timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
  consumption: 180 + Math.random() * 80,
  cost: 25 + Math.random() * 12,
  efficiency: 75 + Math.random() * 25,
  carbon: 32 + Math.random() * 15,
  predicted: i > 25 ? 190 + Math.random() * 60 : undefined
}));

const mockEnergyData1y = Array.from({ length: 12 }, (_, i) => ({
  timestamp: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
  consumption: 5400 + Math.random() * 2000,
  cost: 750 + Math.random() * 300,
  efficiency: 70 + Math.random() * 30,
  carbon: 950 + Math.random() * 400,
  predicted: i > 9 ? 5600 + Math.random() * 1800 : undefined
}));

// Mock the useEnergyAnalytics hook
const mockUseEnergyAnalytics = (scenario: 'loading' | 'error' | 'empty' | 'success') => {
  switch (scenario) {
    case 'loading':
      return { data: null, loading: true, error: null };
    case 'error':
      return { data: null, loading: false, error: new Error('Failed to fetch analytics data') };
    case 'empty':
      return { data: [], loading: false, error: null };
    case 'success':
    default:
      return { data: mockEnergyData24h, loading: false, error: null };
  }
};

const meta: Meta<typeof EnergyUsageChart> = {
  title: 'Smart Meter/EnergyUsageChart',
  component: EnergyUsageChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Energy usage chart with real-time data visualization and predictive analytics'
      }
    }
  },
  decorators: [
    (Story) => (
      <ComponentErrorBoundary componentName="EnergyUsageChart">
        <div className="max-w-4xl">
          <Story />
        </div>
      </ComponentErrorBoundary>
    )
  ],
  argTypes: {
    timeRange: {
      control: 'select',
      options: ['24h', '7d', '30d', '1y'],
      description: 'Time range for the chart data'
    },
    chartType: {
      control: 'select',
      options: ['line', 'bar', 'area'],
      description: 'Type of chart visualization'
    },
    showPrediction: {
      control: 'boolean',
      description: 'Whether to show AI prediction data'
    },
    meterId: {
      control: 'text',
      description: 'ID of the meter to fetch data for'
    }
  }
};

export default meta;
type Story = StoryObj<typeof EnergyUsageChart>;

// Default story with filled data
export const Default: Story = {
  args: {
    data: mockEnergyData24h,
    timeRange: '24h',
    chartType: 'line',
    showPrediction: false,
    meterId: 'meter-001'
  }
};

// Loading state
export const Loading: Story = {
  args: {
    timeRange: '24h',
    chartType: 'line',
    showPrediction: false,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading spinner while fetching analytics data'
      }
    },
    msw: {
      handlers: []
    }
  },
  render: (args) => {
    // Mock the hook to return loading state
    const OriginalChart = EnergyUsageChart;
    
    // Create a wrapper that mocks the hook
    const ChartWithMockedHook = (props: any) => {
      // This would normally be handled by MSW or similar mocking
      return <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>;
    };
    
    return <ChartWithMockedHook {...args} />;
  }
};

// Error state
export const Error: Story = {
  args: {
    timeRange: '24h',
    chartType: 'line',
    showPrediction: false,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when data fetching fails'
      }
    }
  },
  render: (args) => {
    const ChartWithError = (props: any) => {
      return <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-3 text-red-500">⚠️</div>
          <p className="text-sm text-red-600 mb-2">Failed to load analytics data</p>
          <button className="text-sm px-3 py-1 border rounded hover:bg-gray-50">
            Retry
          </button>
        </div>
      </div>;
    };
    
    return <ChartWithError {...args} />;
  }
};

// Empty state
export const Empty: Story = {
  args: {
    data: [],
    timeRange: '24h',
    chartType: 'line',
    showPrediction: false,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows empty state when no data is available'
      }
    }
  }
};

// With prediction data
export const WithPrediction: Story = {
  args: {
    data: mockEnergyData24h,
    timeRange: '24h',
    chartType: 'line',
    showPrediction: true,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows chart with AI prediction data displayed as dashed line'
      }
    }
  }
};

// Different time ranges
export const SevenDays: Story = {
  args: {
    data: mockEnergyData7d,
    timeRange: '7d',
    chartType: 'line',
    showPrediction: true,
    meterId: 'meter-001'
  }
};

export const ThirtyDays: Story = {
  args: {
    data: mockEnergyData30d,
    timeRange: '30d',
    chartType: 'area',
    showPrediction: false,
    meterId: 'meter-001'
  }
};

export const OneYear: Story = {
  args: {
    data: mockEnergyData1y,
    timeRange: '1y',
    chartType: 'bar',
    showPrediction: true,
    meterId: 'meter-001'
  }
};

// Different chart types
export const BarChart: Story = {
  args: {
    data: mockEnergyData7d,
    timeRange: '7d',
    chartType: 'bar',
    showPrediction: false,
    meterId: 'meter-001'
  }
};

export const AreaChart: Story = {
  args: {
    data: mockEnergyData24h,
    timeRange: '24h',
    chartType: 'area',
    showPrediction: true,
    meterId: 'meter-001'
  }
};

// Interactive states
export const FullscreenCapable: Story = {
  args: {
    data: mockEnergyData30d,
    timeRange: '30d',
    chartType: 'line',
    showPrediction: true,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with fullscreen toggle functionality'
      }
    }
  }
};

// Different metrics focus
export const CostFocused: Story = {
  args: {
    data: mockEnergyData7d.map(d => ({ ...d, cost: d.cost * 1.5 })),
    timeRange: '7d',
    chartType: 'bar',
    showPrediction: false,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart optimized for cost analysis with higher cost values'
      }
    }
  }
};

export const EfficiencyFocused: Story = {
  args: {
    data: mockEnergyData24h.map(d => ({ ...d, efficiency: Math.max(60, d.efficiency - 10) })),
    timeRange: '24h',
    chartType: 'line',
    showPrediction: true,
    meterId: 'meter-001'
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart showing efficiency trends with lower baseline values'
      }
    }
  }
};