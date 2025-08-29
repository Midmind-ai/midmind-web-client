# SWR Logger

A comprehensive, configurable logging solution for SWR operations that provides complete visibility into cache mutations, data fetching, and state changes in your React applications.

## 🚀 Quick Start

The logger is **enabled but silent by default**. Press **`Cmd+Shift+L`** (Mac) or **`Ctrl+Shift+L`** (Windows/Linux) to toggle logging verbosity:

- 🔴 **OFF** (default) - No console output
- 🟡 **BASIC** - Single-line logs
- 🟢 **DETAILED** - Expanded logs with full details

The keyboard shortcut is automatically initialized when you import from `@/lib/swr`.

## Features

- 🔍 **Complete SWR operation logging** - Track all `useSWR`, `useSWRInfinite`, and `mutate` operations
- ⌨️ **Keyboard shortcut control** - Toggle verbosity with `Cmd+Shift+L` (auto-initialized)
- 🔇 **Silent by default** - Logger enabled but no console output until activated
- ⚙️ **Highly configurable** - Multiple verbosity levels, custom formatters, and filtering options
- 🎯 **Selective logging** - Include/exclude specific cache keys with regex patterns
- 📊 **Multiple output formats** - Console logging or custom logger integration
- 💾 **Persistent preferences** - Remembers your verbosity setting across sessions
- 📦 **Drop-in replacement** - Direct replacement for SWR imports with zero code changes
- 🚫 **ESLint enforced** - Prevents direct SWR imports to ensure consistent logging

## Quick Start

### 1. Installation

The logger is already included in this project. Simply import from `@/lib/swr` instead of `swr`:

```typescript
// ❌ Old way - direct SWR import
import { useSWR, mutate } from 'swr'

// ✅ New way - with logging
import { useSWR, mutate } from '@/lib/swr'
```

### 2. Basic Usage

```typescript
import { useSWR, mutate } from '@/lib/swr'

// Use SWR as normal - no console output by default
const { data, error } = useSWR('/api/users', fetcher)

// Press Cmd+Shift+L to activate logging!
// The keyboard shortcut cycles through:
// OFF 🔴 → BASIC 🟡 → DETAILED 🟢 → OFF 🔴
```

### 3. Optional Configuration

```typescript
import { configureSWRLogger } from '@/lib/swr'

// Override defaults if needed
configureSWRLogger({
  verbosity: 'detailed', // Start with detailed logging
  showTimestamp: true, // Add timestamps to logs
  keyFilters: [/^api\//], // Only log API calls
})
```

## Configuration

### Environment Variables

```bash
# Disable/enable logging
NODE_ENV=production  # Automatically disables logging

# Set default verbosity level
SWR_LOG_LEVEL=detailed  # Options: 'off', 'basic', 'detailed'
```

### Runtime Configuration

```typescript
import { configureSWRLogger } from '@/lib/swr'

configureSWRLogger({
  enabled: true,
  verbosity: 'detailed', // 'off' | 'basic' | 'detailed'
  showTimestamp: true,
  keyFilters: [/^messages:/], // Only log keys matching these patterns
  excludeKeys: [/^internal:/], // Exclude keys matching these patterns
  formatters: {
    user: (user) => `User(${user.id}, ${user.name})`,
    message: (msg) => `Message: ${msg.content.slice(0, 50)}...`,
  },
})
```

## Verbosity Levels

### Off

```typescript
configureSWRLogger({ verbosity: 'off' })
```

No logging output.

### Basic (Default)

```typescript
configureSWRLogger({ verbosity: 'basic' })
```

Single-line logs for each operation:

```
[SWR] useSWR('users:all') undefined → [Array(5)]
[SWR] mutate('users:123') → {id: 123, name: "John"}
[SWR] useSWRInfinite('messages:page') 3 pages
```

### Detailed

```typescript
configureSWRLogger({ verbosity: 'detailed' })
```

Collapsed groups with complete information:

```
▼ [SWR] useSWR('users:all')
  BEFORE: undefined
  AFTER: [Array(5)] first: {id: 1, name: "John"}

▼ [SWR] mutate('messages:all')
  DATA: {content: "Hello", senderId: "user123"}
  OPTIONS: {revalidate: true}
  RESULT: [Array(16)]
```

## Advanced Usage

### Custom Formatters

```typescript
configureSWRLogger({
  formatters: {
    // Custom formatter for user objects
    user: (user: any) => `User(${user.id}: ${user.name})`,

    // Compact array formatter
    messages: (messages: any[]) =>
      `${messages.length} messages, latest: ${messages[0]?.content}`,

    // Detailed object formatter
    incident: (incident: any) =>
      `Incident #${incident.id} [${incident.status}] ${incident.title}`,
  },
})

// Usage in your data structures
interface User {
  id: string
  name: string
  // Add formatter hint (optional, for documentation)
  _logFormatter?: 'user'
}
```

### Key Filtering

```typescript
// Only log operations for specific keys
configureSWRLogger({
  keyFilters: [
    /^messages:/, // All message-related keys
    /^incidents:/, // All incident-related keys
    /users:current/, // Specific user key
  ],
})

// Exclude specific keys from logging
configureSWRLogger({
  excludeKeys: [
    /^internal:/, // Internal keys
    /^temp:/, // Temporary keys
    /_metadata$/, // Metadata keys
  ],
})
```

### Custom Logger Integration

```typescript
import { configureSWRLogger, LogEntry } from '@/lib/swr'

// Send logs to external service
configureSWRLogger({
  loggerType: 'custom',
  customLogger: (logEntry: LogEntry) => {
    // Send to analytics
    analytics.track('swr_operation', {
      operation: logEntry.operation,
      key: logEntry.key,
      timestamp: logEntry.timestamp,
      hasError: !!logEntry.metadata?.error,
    })

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[SWR Analytics]', logEntry)
    }
  },
})
```

## Migration Guide

### From Direct SWR Usage

1. **Update imports** - Replace all `from 'swr'` with `from '@/lib/swr'`:

```bash
# Use find and replace in your editor
find: from 'swr'
replace: from '@/lib/swr'
```

2. **Add ESLint rule** (already configured in this project):

```javascript
// eslint.config.mjs
{
  'no-restricted-imports': ['error', {
    paths: [{
      name: 'swr',
      message: 'Use @/lib/swr instead of direct swr imports for logging'
    }]
  }]
}
```

3. **Configure logging** (optional):

```typescript
// In your app initialization
import { configureSWRLogger } from '@/lib/swr'

configureSWRLogger({
  verbosity: process.env.NODE_ENV === 'development' ? 'detailed' : 'off',
})
```

### From Other Logging Solutions

If you're migrating from other SWR logging solutions:

1. Remove old cache providers or middleware
2. Update imports to use this logger
3. Migrate configuration to the new format
4. Test logging output and adjust settings

## API Reference

### Configuration Functions

```typescript
// Configure logger settings
configureSWRLogger(config: Partial<SWRLoggerConfig>): void

// Get current configuration
getSWRLoggerConfig(): SWRLoggerConfig

// Reset to default configuration
resetSWRLoggerConfig(): void
```

### Logger Instance

```typescript
// Get logger instance for direct usage
getSWRLogger(): SWRLogger

// Manual logging (advanced usage)
logger.logUseSWR(key: string, before: unknown, after: unknown): void
logger.logMutate(key: string, data: unknown, options: unknown, result: unknown): void
```

### Types

```typescript
interface SWRLoggerConfig {
  enabled: boolean
  verbosity: 'off' | 'basic' | 'detailed'
  loggerType: 'console' | 'custom'
  customLogger?: (logEntry: LogEntry) => void
  keyFilters?: RegExp[]
  excludeKeys?: RegExp[]
  formatters?: Record<string, DataFormatter>
  showTimestamp?: boolean
  showStackTrace?: boolean
}

interface LogEntry {
  operation: 'useSWR' | 'useSWRInfinite' | 'mutate'
  key: string | 'filter-function'
  timestamp: Date
  before?: unknown
  after?: unknown
  data?: unknown
  options?: unknown
  result?: unknown
  metadata?: {
    pages?: number
    matchedKeys?: number
    isFilterFunction?: boolean
  }
}
```

## Best Practices

### Development vs Production

```typescript
// Recommended configuration
configureSWRLogger({
  enabled: process.env.NODE_ENV !== 'production',
  verbosity: process.env.NODE_ENV === 'development' ? 'detailed' : 'off',
  showTimestamp: true,
})
```

### Performance Considerations

- **Use key filtering** for high-traffic applications to reduce log volume
- **Disable in production** - the logger automatically disables when `NODE_ENV=production`
- **Custom formatters** can be expensive for large objects - keep them simple

### Debugging Workflows

1. **Start with basic verbosity** to get an overview
2. **Use key filtering** to focus on specific areas
3. **Switch to detailed verbosity** for deep debugging
4. **Use custom formatters** for domain-specific data structures

## Troubleshooting

### Common Issues

**ESLint errors about direct SWR imports:**

- Make sure all imports use `@/lib/swr` instead of `swr`
- Check for dynamic imports or require statements

**No logging output:**

- Verify `enabled: true` in configuration
- Check that `NODE_ENV !== 'production'`
- Ensure verbosity is not set to 'off'

**Too much/too little logging:**

- Adjust verbosity level (`basic` vs `detailed`)
- Use `keyFilters` or `excludeKeys` to control what gets logged
- Check custom logger implementation if using `loggerType: 'custom'`

**Performance issues:**

- Disable logging in production builds
- Use more specific key filters to reduce log volume
- Simplify custom formatters

### Getting Help

1. Check the configuration with `getSWRLoggerConfig()`
2. Test with different verbosity levels
3. Verify your key patterns with regex testing tools
4. Review the log entries structure in detailed mode

## Examples

### Complete Setup Example

```typescript
// app/layout.tsx or similar
import { configureSWRLogger } from '@/lib/swr'

// Configure logging on app startup
if (typeof window !== 'undefined') {
  configureSWRLogger({
    enabled: process.env.NODE_ENV !== 'production',
    verbosity: 'detailed',
    showTimestamp: true,
    keyFilters: [
      /^api\//, // API routes
      /^messages:/, // Messages
      /^incidents:/, // Incidents
    ],
    excludeKeys: [
      /^_/, // Private keys
      /^system:/, // System keys
    ],
    formatters: {
      user: (user: any) => `${user.name} (${user.role})`,
      message: (msg: any) =>
        `"${msg.content.slice(0, 30)}..." from ${msg.sender}`,
    },
  })
}
```

### Component Usage Example

```typescript
// components/UserList.tsx
import { useSWR, mutate } from '@/lib/swr'

export const UserList = () => {
  // Logged automatically
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher)

  const handleAddUser = async (newUser: User) => {
    // This mutation will be logged with before/after state
    await mutate('/api/users', [...(users || []), newUser])
  }

  // ... rest of component
}
```

This logging solution provides complete transparency into your SWR operations while being highly configurable and performance-conscious.
