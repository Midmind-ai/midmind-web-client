import type { SWRLoggerConfig, LogVerbosity } from './types'

// Environment-based default configuration
export const getDefaultConfig = (): SWRLoggerConfig => ({
  enabled: true, // Logger is enabled but silent by default
  verbosity: ((typeof process !== 'undefined' ? process.env?.SWR_LOG_LEVEL : undefined) as LogVerbosity) || 'off', // Default to 'off' - no console output
  loggerType: 'console',
  keyFilters: [],
  excludeKeys: [],
  formatters: {},
  showTimestamp: false,
  showStackTrace: false,
})

// Global configuration instance
let globalConfig: SWRLoggerConfig = getDefaultConfig()

// Configuration management
export const configureSWRLogger = (config: Partial<SWRLoggerConfig>): void => {
  globalConfig = { ...globalConfig, ...config }
}

export const getSWRLoggerConfig = (): SWRLoggerConfig => globalConfig

export const resetSWRLoggerConfig = (): void => {
  globalConfig = getDefaultConfig()
}

// Utility to check if logging is enabled for a specific key
export const shouldLogKey = (key: string): boolean => {
  const config = getSWRLoggerConfig()

  if (!config.enabled || config.verbosity === 'off') {
    return false
  }

  // Check exclude patterns first
  if (config.excludeKeys?.some((pattern) => pattern.test(key))) {
    return false
  }

  // If no include filters, allow all (except excluded)
  if (!config.keyFilters || config.keyFilters.length === 0) {
    return true
  }

  // Check include patterns
  return config.keyFilters.some((pattern) => pattern.test(key))
}
