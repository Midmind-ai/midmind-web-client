/* eslint-disable no-console */

import { getSWRLoggerConfig, shouldLogKey } from './config';
import { getFormatter } from './formatters';

import type { LogEntry, SWRLoggerConfig } from './types';

export class SWRLogger {
  private getConfig(): SWRLoggerConfig {
    return getSWRLoggerConfig();
  }

  private formatData(data: unknown, formatterName?: string): string {
    const config = this.getConfig();
    const customFormatter = formatterName
      ? config.formatters?.[formatterName]
      : undefined;
    const formatter = customFormatter || getFormatter(formatterName);

    return formatter(data);
  }

  private shouldLog(key: string | 'filter-function'): boolean {
    if (key === 'filter-function') return true; // Always log filter functions

    return shouldLogKey(key);
  }

  private logToConsole(logEntry: LogEntry): void {
    const config = this.getConfig();

    if (config.verbosity === 'basic') {
      this.logBasic(logEntry);
    } else if (config.verbosity === 'detailed') {
      this.logDetailed(logEntry);
    }
  }

  private logBasic(logEntry: LogEntry): void {
    const config = this.getConfig();
    const timestamp = config.showTimestamp
      ? `[${logEntry.timestamp.toLocaleTimeString()}] `
      : '';

    if (logEntry.operation === 'useSWR') {
      console.log(
        `${timestamp}[SWR] useSWR('${logEntry.key}') ${this.formatData(logEntry.before)} → ${this.formatData(logEntry.after)}`
      );
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.log(
        `${timestamp}[SWR] useSWRInfinite('${logEntry.key}') ${logEntry.metadata?.pages || 0} pages`
      );
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.log(
          `${timestamp}[SWR] mutate(filter) → ${logEntry.metadata?.matchedKeys || 0} keys`
        );
      } else {
        console.log(
          `${timestamp}[SWR] mutate('${logEntry.key}') → ${this.formatData(logEntry.result)}`
        );
      }
    }
  }

  private logDetailed(logEntry: LogEntry): void {
    const config = this.getConfig();
    const timestamp = config.showTimestamp
      ? ` [${logEntry.timestamp.toLocaleTimeString()}]`
      : '';

    if (logEntry.operation === 'useSWR') {
      console.group(`[SWR] useSWR('${logEntry.key}')${timestamp}`);
      console.log('BEFORE:', this.formatData(logEntry.before));
      console.log('AFTER:', this.formatData(logEntry.after));
      console.groupEnd();
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.group(`[SWR] useSWRInfinite('${logEntry.key}')${timestamp}`);
      console.log('BEFORE:', this.formatData(logEntry.before));
      console.log('PAGES:', logEntry.metadata?.pages || 0);
      console.log('AFTER:', this.formatData(logEntry.after));
      console.groupEnd();
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.group(`[SWR] mutate(filter function)${timestamp}`);
        console.log('DATA:', this.formatData(logEntry.data));
        console.log('OPTIONS:', this.formatData(logEntry.options));
        console.log('MATCHED KEYS:', logEntry.metadata?.matchedKeys || 0);
        if (Array.isArray(logEntry.result)) {
          logEntry.result.forEach((value, index) => {
            console.groupCollapsed(`Key ${index + 1}`);
            console.log('RESULT:', this.formatData(value));
            console.groupEnd();
          });
        }
        console.groupEnd();
      } else {
        console.group(`[SWR] mutate('${logEntry.key}')${timestamp}`);
        console.log('DATA:', this.formatData(logEntry.data));
        console.log('OPTIONS:', this.formatData(logEntry.options));
        console.log('RESULT:', this.formatData(logEntry.result));
        console.groupEnd();
      }
    }
  }

  public log(logEntry: LogEntry): void {
    const config = this.getConfig();

    if (!config.enabled || config.verbosity === 'off') {
      return;
    }

    if (!this.shouldLog(logEntry.key)) {
      return;
    }

    if (config.loggerType === 'console') {
      this.logToConsole(logEntry);
    } else if (config.loggerType === 'custom' && config.customLogger) {
      config.customLogger(logEntry);
    }
  }

  // Convenience methods for specific operations
  public logUseSWR(key: string, before: unknown, after: unknown): void {
    this.log({
      operation: 'useSWR',
      key,
      timestamp: new Date(),
      before,
      after,
    });
  }

  public logUseSWRInfinite(
    key: string,
    before: unknown,
    after: unknown,
    pages: number
  ): void {
    this.log({
      operation: 'useSWRInfinite',
      key,
      timestamp: new Date(),
      before,
      after,
      metadata: { pages },
    });
  }

  public logMutate(
    key: string | 'filter-function',
    data: unknown,
    options: unknown,
    result: unknown,
    matchedKeys?: number
  ): void {
    this.log({
      operation: 'mutate',
      key,
      timestamp: new Date(),
      data,
      options,
      result,
      metadata:
        key === 'filter-function' ? { matchedKeys, isFilterFunction: true } : undefined,
    });
  }
}

// Singleton instance
let loggerInstance: SWRLogger | null = null;

export const getSWRLogger = (): SWRLogger => {
  if (!loggerInstance) {
    loggerInstance = new SWRLogger();
  }

  return loggerInstance;
};

// Reset singleton for testing
export const resetSWRLogger = (): void => {
  loggerInstance = null;
};
