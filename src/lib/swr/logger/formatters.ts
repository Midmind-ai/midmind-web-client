import type { DataFormatter } from './types';

// Default data formatter
export const defaultFormatter: DataFormatter = (data: unknown): string => {
  if (data === undefined) return 'undefined';
  if (data === null) return 'null';
  if (Array.isArray(data)) return `[Array(${data.length})]`;
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    if (keys.length > 3) {
      return `{${keys.slice(0, 3).join(', ')}, ...}`;
    }

    return `{${keys.join(', ')}}`;
  }

  return String(data);
};

// Built-in formatters for common data types
export const builtInFormatters: Record<string, DataFormatter> = {
  array: (data: unknown) => {
    if (!Array.isArray(data)) return defaultFormatter(data);

    return `[Array(${data.length})] ${data.length > 0 ? `first: ${defaultFormatter(data[0])}` : 'empty'}`;
  },

  object: (data: unknown) => {
    if (typeof data !== 'object' || data === null) return defaultFormatter(data);
    const keys = Object.keys(data);

    return `{${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ', ...' : ''}}`;
  },

  compact: (data: unknown) => {
    if (data === undefined) return 'undefined';
    if (data === null) return 'null';
    if (Array.isArray(data)) return `Array(${data.length})`;
    if (typeof data === 'object') return 'Object';

    return String(data).slice(0, 50);
  },

  verbose: (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return defaultFormatter(data);
    }
  },
};

// Smart formatter that tries to use the best formatter for the data type
export const smartFormatter: DataFormatter = (data: unknown): string => {
  if (Array.isArray(data)) {
    return builtInFormatters.array(data);
  }
  if (typeof data === 'object' && data !== null) {
    return builtInFormatters.object(data);
  }

  return defaultFormatter(data);
};

// Get formatter by name or return default
export const getFormatter = (name?: string): DataFormatter => {
  if (!name) return smartFormatter;

  return builtInFormatters[name] || defaultFormatter;
};
