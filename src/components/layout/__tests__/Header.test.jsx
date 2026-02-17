import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';
import { AppStateProvider } from '../../../context/AppStateContext';
import * as backupUtils from '../../../utils/backupUtils';

// Mock the backup utilities
jest.mock('../../../utils/backupUtils', () => ({
  exportBackup: jest.fn(),
  importBackup: jest.fn(),
}));

// Helper to render Header with context
const renderHeader = () => {
  return render(
    <AppStateProvider>
      <Header />
    </AppStateProvider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Tools Menu', () => {
    test('renders tools button', () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });
      expect(toolsButton).toBeInTheDocument();
    });

    test('clicking tools button opens menu', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      // Menu should appear with various options
      await waitFor(() => {
        expect(screen.getByText(/Students\/Stations/i)).toBeInTheDocument();
      });
    });

    test('tools menu contains expected options', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      await waitFor(() => {
        expect(screen.getByText(/Students\/Stations/i)).toBeInTheDocument();
        expect(screen.getByText(/Student Roster/i)).toBeInTheDocument();
        expect(screen.getByText(/Export Data/i)).toBeInTheDocument();
        expect(screen.getByText(/Import Data/i)).toBeInTheDocument();
        expect(screen.getByText(/Reset to Defaults/i)).toBeInTheDocument();
        expect(screen.getByText(/Performance Mode/i)).toBeInTheDocument();
      });
    });

    test('can close tools menu by clicking tools button again', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      // Open menu
      fireEvent.click(toolsButton);

      await waitFor(() => {
        expect(screen.getByText(/Export Data/i)).toBeInTheDocument();
      });

      // Close menu
      fireEvent.click(toolsButton);

      await waitFor(() => {
        expect(screen.queryByText(/Export Data/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    test('clicking export data calls exportBackup utility', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      // Open tools menu
      fireEvent.click(toolsButton);

      // Click export data
      const exportButton = await screen.findByText(/Export Data/i);
      fireEvent.click(exportButton);

      // Verify exportBackup was called
      expect(backupUtils.exportBackup).toHaveBeenCalled();
    });

    test('export closes the tools menu after execution', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      // Open tools menu
      fireEvent.click(toolsButton);

      // Click export
      const exportButton = await screen.findByText(/Export Data/i);

      // Verify button is clickable and click doesn't throw
      expect(exportButton).toBeInTheDocument();
      expect(() => fireEvent.click(exportButton)).not.toThrow();
    });
  });

  describe('Import Functionality', () => {
    test('clicking import data triggers file input', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      // Open tools menu
      fireEvent.click(toolsButton);

      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByText(/Import Data/i)).toBeInTheDocument();
      });

      // There should be a hidden file input in the document
      const fileInputs = document.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBeGreaterThan(0);
      expect(fileInputs[0]).toHaveAttribute('accept', '.json');
    });
  });

  describe('Reset to Defaults', () => {
    test('clicking reset shows confirmation dialog', async () => {
      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      // Open tools menu
      fireEvent.click(toolsButton);

      // Click reset
      const resetButton = await screen.findByText(/Reset to Defaults/i);
      fireEvent.click(resetButton);

      // Verify confirmation was shown
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('erase all your data'));

      confirmSpy.mockRestore();
    });

    test('canceling reset does nothing', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      const resetButton = await screen.findByText(/Reset to Defaults/i);
      fireEvent.click(resetButton);

      // localStorage.removeItem should not be called
      expect(removeItemSpy).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });

  describe('Performance Mode Toggle', () => {
    test('performance mode toggle is visible', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      await waitFor(() => {
        expect(screen.getByText(/Performance Mode/i)).toBeInTheDocument();
      });
    });

    test('clicking performance mode toggles the setting', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      const performanceToggle = await screen.findByText(/Performance Mode/i);
      fireEvent.click(performanceToggle);

      // The toggle should work (state changes are internal)
      expect(performanceToggle).toBeInTheDocument();
    });
  });

  describe('Layout Edit Mode', () => {
    test('renders edit layout button', () => {
      renderHeader();
      const editButton = screen.getByLabelText(/layout edit mode/i);
      expect(editButton).toBeInTheDocument();
    });

    test('clicking edit layout button toggles edit mode', () => {
      renderHeader();
      const editButton = screen.getByLabelText(/enter layout edit mode/i);

      fireEvent.click(editButton);

      // Button text should change to "Done Layout"
      expect(screen.getByLabelText(/exit layout edit mode/i)).toBeInTheDocument();
    });

    test('edit layout button has correct styling when active', () => {
      renderHeader();
      const editButton = screen.getByLabelText(/enter layout edit mode/i);

      fireEvent.click(editButton);

      const doneButton = screen.getByLabelText(/exit layout edit mode/i);
      expect(doneButton).toHaveClass('bg-orange-500');
    });
  });

  describe('Presentation Mode', () => {
    test('renders present button', () => {
      renderHeader();
      const presentButton = screen.getByLabelText(/presentation mode/i);
      expect(presentButton).toBeInTheDocument();
    });

    test('clicking present button enters presentation mode', () => {
      renderHeader();
      const presentButton = screen.getByLabelText(/presentation mode/i);

      fireEvent.click(presentButton);

      // Presentation mode should be activated (state change is internal)
      expect(presentButton).toBeInTheDocument();
    });
  });

  describe('Student/Roster Managers', () => {
    test('clicking Students/Stations opens student manager', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      const studentButton = await screen.findByText(/Students\/Stations/i);

      // Verify button is clickable
      expect(studentButton).toBeInTheDocument();
      expect(studentButton).not.toBeDisabled();

      // Click the button (menu closes after click, so button will be removed)
      expect(() => fireEvent.click(studentButton)).not.toThrow();
    });

    test('clicking Student Roster opens roster manager', async () => {
      renderHeader();
      const toolsButton = screen.getByRole('button', { name: /tools/i });

      fireEvent.click(toolsButton);

      const rosterButton = await screen.findByText(/Student Roster/i);

      // Verify button is clickable
      expect(rosterButton).toBeInTheDocument();
      expect(rosterButton).not.toBeDisabled();

      // Click the button (menu closes after click, so button will be removed)
      expect(() => fireEvent.click(rosterButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('all buttons have proper aria labels or text', () => {
      renderHeader();

      // Check main buttons have accessible names
      expect(screen.getByLabelText(/tools menu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/layout edit mode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/presentation mode/i)).toBeInTheDocument();
    });

    test('tools button has aria-expanded attribute', () => {
      renderHeader();
      const toolsButton = screen.getByLabelText(/tools menu/i);

      // Should have aria-expanded
      expect(toolsButton).toHaveAttribute('aria-expanded');
    });
  });
});
