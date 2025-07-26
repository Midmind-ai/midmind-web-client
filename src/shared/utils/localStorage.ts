/* eslint-disable no-console */

const cache = new Map<string, unknown>();

const logStorageError = (method: string, error: unknown): void => {
  console.log(`[ERROR Storage ${method}] >>>`, error);
};

export const setToStorage = <T>(key: string, value: T): void => {
  if (value === undefined) {
    return;
  }

  try {
    const serializedValue = JSON.stringify(value);

    localStorage.setItem(key, serializedValue);
    cache.set(key, value);
  } catch (error) {
    logStorageError('setToStorage', error);
  }
};

export const getFromStorage = <T>(key: string): T | null => {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }

  try {
    const data = localStorage.getItem(key);

    if (data !== null) {
      const parsedData = JSON.parse(data);

      cache.set(key, parsedData);

      return parsedData;
    }

    return null;
  } catch (error) {
    logStorageError('getFromStorage', error);

    return null;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    cache.delete(key);
  } catch (error) {
    logStorageError('removeFromStorage', error);
  }
};

export const clearAllStorage = (): void => {
  try {
    localStorage.clear();
    cache.clear();
  } catch (error) {
    logStorageError('clearAllStorage', error);
  }
};
