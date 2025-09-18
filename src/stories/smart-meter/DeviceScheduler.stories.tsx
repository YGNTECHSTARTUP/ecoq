/**
 * Storybook stories for DeviceScheduler component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DeviceScheduler } from '@/components/smart-meter';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
// Simple mock function for Storybook actions
const fn = () => () => console.log('Action called');

// Mock schedule data
const mockSchedules = [
  {
    id: '1',
    name: 'Workday Schedule',
    startTime: '09:00',
    endTime: '17:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    action: 'on' as const,
    isActive: true,
    deviceId: 'device-001',
    repeatWeekly: true,
    priority: 1
  },
  {
    id: '2',
    name: 'Weekend Mode',
    startTime: '10:00',
    endTime: '22:00',
    days: ['sat', 'sun'],
    action: 'auto' as const,
    isActive: true,
    deviceId: 'device-001',
    repeatWeekly: true,
    priority: 2
  },
  {
    id: '3',
    name: 'Night Shutdown',
    startTime: '23:00',
    endTime: '06:00',
    days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    action: 'off' as const,
    isActive: false,
    deviceId: 'device-001',
    repeatWeekly: true,
    priority: 3
  }
];

const emptySchedules: any[] = [];

// Mock automation hook
const createMockUseDeviceAutomation = (
  scenario: 'loading' | 'error' | 'empty' | 'filled' | 'saving' | 'creating'
) => ({
  schedules: scenario === 'empty' ? emptySchedules : 
            scenario === 'loading' ? null :
            scenario === 'error' ? null : mockSchedules,
  loading: scenario === 'loading',
  error: scenario === 'error' ? new Error('Failed to load schedules') : null,
  createSchedule: fn().mockImplementation(async (schedule) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...schedule, id: Date.now().toString() };
  }),
  updateSchedule: fn().mockImplementation(async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...updates };
  }),
  deleteSchedule: fn().mockImplementation(async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
  }),
  toggleScheduleActive: fn().mockImplementation(async (id, isActive) => {
    await new Promise(resolve => setTimeout(resolve, 200));
  })
});

const meta: Meta<typeof DeviceScheduler> = {
  title: 'Smart Meter/DeviceScheduler',
  component: DeviceScheduler,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Device automation scheduler with CRUD operations and real-time sync'
      }
    }
  },
  decorators: [
    (Story) => (
      <ComponentErrorBoundary componentName="DeviceScheduler">
        <div className="max-w-2xl">
          <Story />
        </div>
      </ComponentErrorBoundary>
    )
  ],
  argTypes: {
    deviceId: {
      control: 'text',
      description: 'ID of the device to manage schedules for'
    },
    onSave: {
      action: 'onSave',
      description: 'Callback fired when schedules are saved'
    }
  },
  args: {
    deviceId: 'device-001',
    onSave: fn()
  }
};

export default meta;
type Story = StoryObj<typeof DeviceScheduler>;

// Default story with schedules
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'DeviceScheduler with multiple configured schedules'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows loading spinner while fetching schedules'
      }
    }
  },
  render: (args) => {
    // Mock loading state
    const LoadingScheduler = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="font-semibold">Automation Schedules</div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading schedules...</p>
            </div>
          </div>
        </div>
      </div>
    );
    
    return <LoadingScheduler />;
  }
};

// Error state
export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when schedule loading fails'
      }
    }
  },
  render: (args) => {
    const ErrorScheduler = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="font-semibold">Automation Schedules</div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-red-500">⚠️</div>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">Failed to load schedules</p>
              </div>
              <button className="ml-auto text-red-500 hover:text-red-700">✕</button>
            </div>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-3 opacity-50">⏱️</div>
            <p>No schedules configured</p>
            <p className="text-sm">Add a schedule to automate device control</p>
          </div>
        </div>
      </div>
    );
    
    return <ErrorScheduler />;
  }
};

// Empty state
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows empty state when no schedules are configured'
      }
    }
  },
  render: (args) => {
    const EmptyScheduler = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="font-semibold">Automation Schedules</div>
            </div>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
              + Add Schedule
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-3 opacity-50">⏱️</div>
            <p>No schedules configured</p>
            <p className="text-sm">Add a schedule to automate device control</p>
          </div>
        </div>
      </div>
    );
    
    return <EmptyScheduler />;
  }
};

// Single schedule
export const SingleSchedule: Story = {
  parameters: {
    docs: {
      description: {
        story: 'DeviceScheduler with a single active schedule'
      }
    }
  },
  render: (args) => {
    const singleSchedule = [mockSchedules[0]];
    
    const SingleScheduleComponent = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="font-semibold">Automation Schedules</div>
            </div>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
              + Add Schedule
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-primary/20 hover:border-l-primary/60 transition-colors border rounded">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-all" />
                  </div>
                  <div className="flex-1">
                    <input 
                      value="Workday Schedule" 
                      className="font-medium border-none p-0 h-auto text-sm bg-transparent"
                      readOnly
                    />
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>09:00</span>
                      <span>to</span>
                      <span>17:00</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="w-20 h-6 text-xs border rounded" value="on">
                    <option value="on">Turn On</option>
                  </select>
                  <button className="text-red-500 hover:text-red-700">🗑️</button>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const isActive = index > 0 && index < 6; // Mon-Fri
                  return (
                    <button 
                      key={day}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {day[0]}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Active</span>
                  <span>•</span>
                  <span>Weekly repeat</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="text-xs px-1 py-0 border rounded">1</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>ℹ️</span>
              <span>Schedules are automatically synchronized with your smart meter system.</span>
            </div>
          </div>
        </div>
      </div>
    );
    
    return <SingleScheduleComponent />;
  }
};

// Schedule being created
export const Creating: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows loading state while creating a new schedule'
      }
    }
  },
  render: (args) => {
    const CreatingScheduler = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="font-semibold">Automation Schedules</div>
            </div>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm opacity-50 cursor-not-allowed flex items-center gap-1">
              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
              Add Schedule
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-3 opacity-50">⏱️</div>
            <p>Creating new schedule...</p>
          </div>
        </div>
      </div>
    );
    
    return <CreatingScheduler />;
  }
};

// Schedule being saved
export const Saving: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows saving state while updating schedules'
      }
    }
  },
  render: (args) => {
    const SavingScheduler = () => (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="font-semibold">Automation Schedules</div>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
              + Add Schedule
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4 opacity-75">
            <div className="p-4 border-l-4 border-l-primary/20 border rounded">
              <div className="text-sm text-muted-foreground">Saving changes...</div>
            </div>
          </div>
        </div>
      </div>
    );
    
    return <SavingScheduler />;
  }
};

// Interactive schedule editing
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive schedule with editable fields and day toggles'
      }
    }
  }
};

// Multiple schedules with different priorities
export const MultipleSchedules: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Multiple schedules with different actions and priorities'
      }
    }
  }
};

// Complex schedule scenarios
export const ComplexScheduling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complex scheduling scenario with overlapping schedules'
      }
    }
  },
  render: (args) => {
    const complexSchedules = [
      { ...mockSchedules[0], priority: 1 },
      { ...mockSchedules[1], priority: 2 },
      { ...mockSchedules[2], priority: 3, isActive: true }
    ];
    
    return <DeviceScheduler {...args} />;
  }
};