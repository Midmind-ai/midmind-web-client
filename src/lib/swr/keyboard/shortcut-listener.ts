/* eslint-disable no-console */

import { configureSWRLogger, getSWRLoggerConfig } from '../logger/config';

import type { LogVerbosity } from '../logger/types';

// Track if listener is already initialized
let isInitialized = false;

// Verbosity cycling order
const verbosityLevels: LogVerbosity[] = ['off', 'basic', 'detailed'];

// Emoji indicators for visual feedback
const verbosityEmojis: Record<LogVerbosity, string> = {
  off: '🔴',
  basic: '🟡',
  detailed: '🟢',
};

// Handle keyboard shortcut
const handleKeyPress = (event: KeyboardEvent): void => {
  // Check for Cmd+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;

  // Support both 'L' and 'l'
  if (isModifierPressed && event.shiftKey && (event.key === 'L' || event.key === 'l')) {
    event.preventDefault();

    // Get current configuration
    const currentConfig = getSWRLoggerConfig();
    const currentVerbosity = currentConfig.verbosity;

    // Find next verbosity level
    const currentIndex = verbosityLevels.indexOf(currentVerbosity);
    const nextIndex = (currentIndex + 1) % verbosityLevels.length;
    const nextVerbosity = verbosityLevels[nextIndex];

    // Update configuration
    configureSWRLogger({ verbosity: nextVerbosity });

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('swr-logger-verbosity', nextVerbosity);
    }

    // Visual feedback
    const emoji = verbosityEmojis[nextVerbosity];
    console.log(
      `%c${emoji} SWR Logger: ${nextVerbosity.toUpperCase()}`,
      'font-size: 16px; font-weight: bold; padding: 4px 8px; background: #1f2937; color: white; border-radius: 4px'
    );

    // Additional feedback based on verbosity level
    if (nextVerbosity === 'off') {
      console.log('%cLogging disabled. Press Cmd+Shift+L to enable.', 'color: #6b7280');
    } else if (nextVerbosity === 'basic') {
      console.log(
        '%cBasic logging enabled. Single-line output for SWR operations.',
        'color: #eab308'
      );
    } else if (nextVerbosity === 'detailed') {
      console.log(
        '%cDetailed logging enabled. Expanded output with full details.',
        'color: #10b981'
      );
    }
  }
};

// Initialize keyboard shortcut listener
export const initializeKeyboardShortcut = (): void => {
  // Skip if already initialized or in non-browser environment
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Skip in production
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return;
  }

  // Mark as initialized
  isInitialized = true;

  // Load persisted verbosity from localStorage
  const storedVerbosity = localStorage.getItem(
    'swr-logger-verbosity'
  ) as LogVerbosity | null;
  if (storedVerbosity && verbosityLevels.includes(storedVerbosity)) {
    configureSWRLogger({ verbosity: storedVerbosity });
  }

  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyPress);

  // Log initial state
  const config = getSWRLoggerConfig();
  const emoji = verbosityEmojis[config.verbosity];

  console.log(`%c[SWR Logger] Ready ${emoji}`, 'color: #3b82f6; font-weight: bold');
  console.log(
    `%c[SWR Logger] Press %c${navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Ctrl'}+Shift+L%c to toggle verbosity (current: ${config.verbosity})`,
    'color: #3b82f6; font-weight: bold',
    'background: #1f2937; color: white; padding: 2px 4px; border-radius: 3px',
    'color: inherit'
  );
};

// Cleanup function for testing or unmounting
export const cleanupKeyboardShortcut = (): void => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyPress);
    isInitialized = false;
  }
};
