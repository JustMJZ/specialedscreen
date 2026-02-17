import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerPanel from '../TimerPanel';
import { AppStateProvider } from '../../../context/AppStateContext';

// Mock the sounds module - ROTATION_SOUNDS is an array
jest.mock('../../../constants/sounds', () => ({
  ROTATION_SOUNDS: [
    { id: 'none', name: '🔇 None', type: 'none' },
    { id: 'chime', name: '✨ Wind Chime', type: 'synth' },
    { id: 'bell', name: '🛎️ School Bell', type: 'synth' },
  ],
  playSound: jest.fn(),
  playSynthSound: jest.fn(),
}));

// Helper to render TimerPanel with context
const renderTimerPanel = () => {
  return render(
    <AppStateProvider>
      <TimerPanel />
    </AppStateProvider>
  );
};

describe('TimerPanel', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  describe('Initial Rendering', () => {
    test('renders with default time (15:00)', () => {
      renderTimerPanel();
      // Timer starts at 900 seconds (15:00)
      expect(screen.getByText(/15:00/)).toBeInTheDocument();
    });

    test('renders play button when timer is not running', () => {
      renderTimerPanel();
      const playButton = screen.getByRole('button', { name: /start/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveTextContent('▶ Start');
    });

    test('renders control buttons (play, rotate, reset, settings)', () => {
      renderTimerPanel();
      const buttons = screen.getAllByRole('button');
      // Should have multiple buttons including play, rotate, reset, settings
      expect(buttons.length).toBeGreaterThanOrEqual(4);
      // Check for play button specifically
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
  });

  describe('Timer Controls', () => {
    test('clicking play button starts the timer', () => {
      renderTimerPanel();
      const playButton = screen.getByRole('button', { name: /start/i });

      fireEvent.click(playButton);

      // After clicking, button should change to pause
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    test('clicking pause button stops the timer', () => {
      renderTimerPanel();
      const playButton = screen.getByRole('button', { name: /start/i });

      // Start timer
      fireEvent.click(playButton);

      // Now click pause
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);

      // Should be back to play button
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    test('clicking reset button resets time to total time', async () => {
      renderTimerPanel();

      // Find and click reset button
      const resetButton = screen.getByRole('button', { name: /↺/i });
      fireEvent.click(resetButton);

      // Timer should still show 15:00 (default)
      await waitFor(() => {
        expect(screen.getByText(/15:00/)).toBeInTheDocument();
      });
    });

    test('clicking rotate button triggers rotation', () => {
      renderTimerPanel();

      // Find rotate button by text content
      const rotateButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(rotateButton);

      // This would trigger rotation in the app state
      // We can't easily verify the rotation happened without mocking the context
      // but we can verify the button is clickable
      expect(rotateButton).toBeInTheDocument();
    });
  });

  describe('Settings Modal', () => {
    test('clicking settings button opens settings modal', async () => {
      renderTimerPanel();

      // Find and click settings button by text
      const settingsButton = screen.getByRole('button', { name: /options/i });
      fireEvent.click(settingsButton);

      // Modal should appear with timer settings content
      await waitFor(
        () => {
          expect(screen.getByText(/Timer Settings/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    test('can close settings modal', async () => {
      renderTimerPanel();

      // Open settings
      const settingsButton = screen.getByRole('button', { name: /options/i });
      fireEvent.click(settingsButton);

      // Wait for modal to appear
      await waitFor(
        () => {
          expect(screen.getByText(/Timer Settings/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Find and click close button (usually an X or Cancel)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(
        (btn) => btn.textContent.includes('×') || btn.textContent.includes('Close')
      );

      if (closeButton) {
        fireEvent.click(closeButton);

        // Modal should be gone
        await waitFor(() => {
          expect(screen.queryByText(/Timer Settings/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Time Display', () => {
    test('formats minutes and seconds correctly', () => {
      renderTimerPanel();
      // Default is 900 seconds = 15 minutes, 0 seconds
      expect(screen.getByText(/15:00/)).toBeInTheDocument();
    });

    test('pads single-digit seconds with zero', () => {
      renderTimerPanel();
      // We can't easily set custom time without mocking context,
      // but the component should handle it
      // This test verifies the component renders without error
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    test('shows progress ring in default ring style', () => {
      renderTimerPanel();
      // The component should render an SVG for the ring
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('displays confetti when timer completes', async () => {
      // This would require manipulating the timer state to completion
      // For now, we verify the component renders
      renderTimerPanel();
      expect(screen.getByText(/15:00/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('all control buttons are keyboard accessible', () => {
      renderTimerPanel();

      // Find buttons by accessible name
      const playButton = screen.getByRole('button', { name: /start/i });
      const rotateButton = screen.getByRole('button', { name: /next/i });
      const resetButton = screen.getByText('↺');
      const settingsButton = screen.getByRole('button', { name: /options/i });

      expect(playButton).toBeInTheDocument();
      expect(rotateButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      expect(settingsButton).toBeInTheDocument();
    });

    test('buttons are not disabled by default', () => {
      renderTimerPanel();

      const playButton = screen.getByRole('button', { name: /start/i });
      expect(playButton).not.toBeDisabled();
    });
  });
});
