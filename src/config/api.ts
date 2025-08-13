/**
 * API configuration settings
 */
export const apiConfig = {
  // Request timeout in milliseconds
  timeout: 10000, // 10 seconds

  // Base URL is configured through environment variable
  baseUrl: import.meta.env.VITE_API_URL as string,

  // Whether to include credentials in requests
  withCredentials: true,

  // Default headers
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// Export timeout separately for backward compatibility
export const TIMEOUT = apiConfig.timeout;
