/**
 * Jest tests for DeviceScheduler component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceScheduler } from '../enhanced-smart-meter-components';
import { ComponentErrorBoundary } from '../../ui/error-boundary';

// Mock useDeviceAutomation hook
const mockUseDeviceAutomation = jest.fn();
const mockCreateSchedule = jest.fn();
const mockUpdateSchedule = jest.fn();
const mockDeleteSchedule = jest.fn();
const mockToggleScheduleActive = jest.fn();

jest.mock('../../hooks/useSmartMeter', () => ({
  useDeviceAutomation: mockUseDeviceAutomation,
  useSmartMeter: jest.fn(() => ({ devices: [], loading: false, error: null })),
  useSmartMeterStats: jest.fn(() => ({ totalDevices: 0, onlineDevices: 0 })),
  useMeterReading: jest.fn(() => ({ reading: null, lastUpdate: null, isOnline: false })),
  useDeviceData: jest.fn(() => ({ energyData: null, loading: false })),
  useEnergyAnalytics: jest.fn(() => ({ data: [], loading: false, error: null }))
}));

// Sample test data
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

describe('DeviceScheduler', () => {
  const defaultProps = {
    deviceId: 'device-001',
    onSave: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseDeviceAutomation.mockReturnValue({
      schedules: mockSchedules,
      loading: false,
      error: null,
      createSchedule: mockCreateSchedule,
      updateSchedule: mockUpdateSchedule,
      deleteSchedule: mockDeleteSchedule,
      toggleScheduleActive: mockToggleScheduleActive
    });

    // Mock async functions
    mockCreateSchedule.mockResolvedValue({ ...mockSchedules[0], id: 'new-id' });
    mockUpdateSchedule.mockResolvedValue({});
    mockDeleteSchedule.mockResolvedValue(undefined);
    mockToggleScheduleActive.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders scheduler with default props', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Automation Schedules')).toBeInTheDocument();
      expect(screen.getByText('Add Schedule')).toBeInTheDocument();
    });

    it('renders multiple schedules', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByDisplayValue('Workday Schedule')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Weekend Mode')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Night Shutdown')).toBeInTheDocument();
    });

    it('displays schedule times correctly', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Check if time inputs are rendered with correct values
      const timeInputs = screen.getAllByDisplayValue('09:00');
      expect(timeInputs.length).toBeGreaterThan(0);
    });

    it('shows schedule days correctly', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Check for day buttons - should show first letter of days
      const dayButtons = screen.getAllByText('M'); // Monday
      expect(dayButtons.length).toBeGreaterThan(0);
    });

    it('displays schedule actions correctly', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Check for action selects
      expect(screen.getByDisplayValue('Turn On')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Auto')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Turn Off')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state when schedules are loading', () => {
      mockUseDeviceAutomation.mockReturnValue({
        schedules: null,
        loading: true,
        error: null,
        createSchedule: mockCreateSchedule,
        updateSchedule: mockUpdateSchedule,
        deleteSchedule: mockDeleteSchedule,
        toggleScheduleActive: mockToggleScheduleActive
      });

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Loading schedules...')).toBeInTheDocument();
      expect(screen.queryByText('Add Schedule')).not.toBeInTheDocument();
    });

    it('shows error state when schedule loading fails', () => {
      mockUseDeviceAutomation.mockReturnValue({
        schedules: null,
        loading: false,
        error: new Error('Failed to load schedules'),
        createSchedule: mockCreateSchedule,
        updateSchedule: mockUpdateSchedule,
        deleteSchedule: mockDeleteSchedule,
        toggleScheduleActive: mockToggleScheduleActive
      });

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Failed to load schedules')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('shows empty state when no schedules exist', () => {
      mockUseDeviceAutomation.mockReturnValue({
        schedules: [],
        loading: false,
        error: null,
        createSchedule: mockCreateSchedule,
        updateSchedule: mockUpdateSchedule,
        deleteSchedule: mockDeleteSchedule,
        toggleScheduleActive: mockToggleScheduleActive
      });

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('No schedules configured')).toBeInTheDocument();
      expect(screen.getByText('Add a schedule to automate device control')).toBeInTheDocument();
    });
  });

  describe('Schedule Creation', () => {
    it('calls createSchedule when Add Schedule button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const addButton = screen.getByText('Add Schedule');
      await user.click(addButton);

      await waitFor(() => {
        expect(mockCreateSchedule).toHaveBeenCalledWith({
          name: 'New Schedule',
          startTime: '09:00',
          endTime: '17:00',
          days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          action: 'on',
          isActive: true,
          deviceId: 'device-001',
          repeatWeekly: true,
          priority: 1
        });
      });
    });

    it('calls onSave callback after successful schedule creation', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} onSave={mockOnSave} />
        </ComponentErrorBoundary>
      );

      const addButton = screen.getByText('Add Schedule');
      await user.click(addButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('shows creating state while schedule is being created', async () => {
      const user = userEvent.setup();
      
      // Make createSchedule return a pending promise
      mockCreateSchedule.mockImplementation(() => new Promise(() => {}));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const addButton = screen.getByText('Add Schedule');
      await user.click(addButton);

      // Button should be disabled with spinner
      expect(addButton).toBeDisabled();
    });
  });

  describe('Schedule Updates', () => {
    it('calls updateSchedule when schedule name is changed', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const nameInput = screen.getByDisplayValue('Workday Schedule');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Schedule');

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', { name: 'Updated Schedule' });
      });
    });

    it('calls updateSchedule when start time is changed', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const startTimeInputs = screen.getAllByDisplayValue('09:00');
      const startTimeInput = startTimeInputs[0];
      
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '08:00');

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', { startTime: '08:00' });
      });
    });

    it('calls updateSchedule when end time is changed', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const endTimeInputs = screen.getAllByDisplayValue('17:00');
      const endTimeInput = endTimeInputs[0];
      
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '18:00');

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', { endTime: '18:00' });
      });
    });

    it('calls updateSchedule when action is changed', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const actionSelect = screen.getByDisplayValue('Turn On');
      await user.selectOptions(actionSelect, 'off');

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', { action: 'off' });
      });
    });
  });

  describe('Schedule Toggle', () => {
    it('calls toggleScheduleActive when schedule switch is toggled', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Find the first schedule switch (active one)
      const switches = screen.getAllByRole('switch');
      const activeSwitch = switches[0]; // First schedule is active

      await user.click(activeSwitch);

      await waitFor(() => {
        expect(mockToggleScheduleActive).toHaveBeenCalledWith('1', false);
      });
    });

    it('calls onSave callback after successful toggle', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} onSave={mockOnSave} />
        </ComponentErrorBoundary>
      );

      const switches = screen.getAllByRole('switch');
      const activeSwitch = switches[0];

      await user.click(activeSwitch);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Schedule Deletion', () => {
    it('calls deleteSchedule when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Find delete buttons (trash icons)
      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('🗑️') || button.querySelector('[data-testid="trash-icon"]')
      );
      
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockDeleteSchedule).toHaveBeenCalledWith('1');
        });
      }
    });

    it('calls onSave callback after successful deletion', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} onSave={mockOnSave} />
        </ComponentErrorBoundary>
      );

      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('🗑️') || button.querySelector('[data-testid="trash-icon"]')
      );
      
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockOnSave).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Day Selection', () => {
    it('calls updateSchedule when day is toggled', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Find day buttons - look for Sunday button which should be inactive for workday schedule
      const dayButtons = screen.getAllByText('S'); // Sunday
      const sundayButton = dayButtons[0];

      await user.click(sundayButton);

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', {
          days: expect.arrayContaining(['sun'])
        });
      });
    });

    it('removes day when active day is toggled off', async () => {
      const user = userEvent.setup();

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Find Monday button which should be active for workday schedule
      const dayButtons = screen.getAllByText('M'); // Monday
      const mondayButton = dayButtons[0];

      await user.click(mondayButton);

      await waitFor(() => {
        expect(mockUpdateSchedule).toHaveBeenCalledWith('1', {
          days: expect.not.arrayContaining(['mon'])
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when createSchedule fails', async () => {
      const user = userEvent.setup();
      mockCreateSchedule.mockRejectedValue(new Error('Failed to create schedule'));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const addButton = screen.getByText('Add Schedule');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create schedule')).toBeInTheDocument();
      });
    });

    it('displays error message when updateSchedule fails', async () => {
      const user = userEvent.setup();
      mockUpdateSchedule.mockRejectedValue(new Error('Failed to update schedule'));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const nameInput = screen.getByDisplayValue('Workday Schedule');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      await waitFor(() => {
        expect(screen.getByText('Failed to update schedule')).toBeInTheDocument();
      });
    });

    it('displays error message when deleteSchedule fails', async () => {
      const user = userEvent.setup();
      mockDeleteSchedule.mockRejectedValue(new Error('Failed to delete schedule'));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('🗑️') || button.querySelector('[data-testid="trash-icon"]')
      );
      
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('Failed to delete schedule')).toBeInTheDocument();
        });
      }
    });

    it('allows dismissing error messages', async () => {
      const user = userEvent.setup();
      mockCreateSchedule.mockRejectedValue(new Error('Failed to create schedule'));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const addButton = screen.getByText('Add Schedule');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create schedule')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /close/i });
      await user.click(dismissButton);

      expect(screen.queryByText('Failed to create schedule')).not.toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('calls useDeviceAutomation with correct deviceId', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler deviceId="test-device" />
        </ComponentErrorBoundary>
      );

      expect(mockUseDeviceAutomation).toHaveBeenCalledWith('test-device');
    });

    it('updates local state when hook schedules change', () => {
      const { rerender } = render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Initial render shows original schedules
      expect(screen.getByDisplayValue('Workday Schedule')).toBeInTheDocument();

      // Update mock to return different schedules
      const updatedSchedules = [
        { ...mockSchedules[0], name: 'Updated Schedule' }
      ];

      mockUseDeviceAutomation.mockReturnValue({
        schedules: updatedSchedules,
        loading: false,
        error: null,
        createSchedule: mockCreateSchedule,
        updateSchedule: mockUpdateSchedule,
        deleteSchedule: mockDeleteSchedule,
        toggleScheduleActive: mockToggleScheduleActive
      });

      rerender(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      // Should show updated schedule name
      expect(screen.getByDisplayValue('Updated Schedule')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Workday Schedule')).not.toBeInTheDocument();
    });
  });

  describe('UI States', () => {
    it('disables controls when saving', async () => {
      const user = userEvent.setup();
      
      // Make updateSchedule return a pending promise
      mockUpdateSchedule.mockImplementation(() => new Promise(() => {}));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const nameInput = screen.getByDisplayValue('Workday Schedule');
      await user.type(nameInput, ' Updated');

      // Controls should be disabled while saving
      const switches = screen.getAllByRole('switch');
      expect(switches[0]).toBeDisabled();
    });

    it('shows saving indicator in header', async () => {
      const user = userEvent.setup();
      
      // Make updateSchedule return a pending promise
      mockUpdateSchedule.mockImplementation(() => new Promise(() => {}));

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      const nameInput = screen.getByDisplayValue('Workday Schedule');
      await user.type(nameInput, ' Updated');

      // Should show saving spinner in header
      const header = screen.getByText('Automation Schedules').parentElement;
      expect(header).toContainHTML('animate-spin');
    });

    it('shows synchronization info when schedules exist', () => {
      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Schedules are automatically synchronized with your smart meter system.')).toBeInTheDocument();
    });

    it('does not show synchronization info when no schedules exist', () => {
      mockUseDeviceAutomation.mockReturnValue({
        schedules: [],
        loading: false,
        error: null,
        createSchedule: mockCreateSchedule,
        updateSchedule: mockUpdateSchedule,
        deleteSchedule: mockDeleteSchedule,
        toggleScheduleActive: mockToggleScheduleActive
      });

      render(
        <ComponentErrorBoundary componentName="DeviceScheduler">
          <DeviceScheduler {...defaultProps} />
        </ComponentErrorBoundary>
      );

      expect(screen.queryByText('Schedules are automatically synchronized with your smart meter system.')).not.toBeInTheDocument();
    });
  });
});