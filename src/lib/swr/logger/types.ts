export type LogVerbosity = 'off' | 'basic' | 'detailed';

export type LoggerType = 'console' | 'custom';

export interface LogEntry {
  operation: 'useSWR' | 'useSWRInfinite' | 'mutate';
  key: string | 'filter-function';
  timestamp: Date;
  before?: unknown;
  after?: unknown;
  data?: unknown;
  options?: unknown;
  result?: unknown;
  metadata?: {
    pages?: number;
    matchedKeys?: number;
    isFilterFunction?: boolean;
  };
}

export interface DataFormatter {
  (data: unknown): string;
}

export interface CustomLogger {
  (logEntry: LogEntry): void;
}

export interface SWRLoggerConfig {
  enabled: boolean;
  verbosity: LogVerbosity;
  loggerType: LoggerType;
  customLogger?: CustomLogger;
  keyFilters?: RegExp[];
  excludeKeys?: RegExp[];
  formatters?: Record<string, DataFormatter>;
  showTimestamp?: boolean;
  showStackTrace?: boolean;
}
