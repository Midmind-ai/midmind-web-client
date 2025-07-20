/* eslint-disable no-console */

export type StorageEvent<T = unknown> = {
  value: T | null;
  removed?: boolean;
};

type Listener<T> = (event: StorageEvent<T>) => void;

type Unsubscribe = () => void;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener<unknown>>>();

const logStorageError = (method: string, error: unknown): void => {
  console.log(`[ERROR Storage ${method}] >>>`, error);
};

export const subscribeToStorageChanges = <T>(key: string, listener: Listener<T>): Unsubscribe => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }

  const keyListeners = listeners.get(key);

  if (keyListeners) {
    keyListeners.add(listener as Listener<unknown>);
  }

  return () => {
    const keyListeners = listeners.get(key);

    if (keyListeners) {
      keyListeners.delete(listener as Listener<unknown>);

      if (keyListeners.size === 0) {
        listeners.delete(key);
      }
    }
  };
};

const notifyStorageListeners = <T>(key: string, event: StorageEvent<T>): void => {
  const keyListeners = listeners.get(key);

  if (keyListeners) {
    keyListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logStorageError('notifyStorageListeners', error);
      }
    });
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  if (value === undefined) {
    return;
  }

  try {
    const serializedValue = JSON.stringify(value);

    localStorage.setItem(key, serializedValue);
    cache.set(key, value);

    notifyStorageListeners(key, { value });
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

    notifyStorageListeners(key, { value: null, removed: true });
  } catch (error) {
    logStorageError('removeFromStorage', error);
  }
};

export const clearAllStorage = (): void => {
  try {
    const keysWithListeners = Array.from(listeners.keys());

    localStorage.clear();
    cache.clear();

    keysWithListeners.forEach(key => {
      notifyStorageListeners(key, { value: null, removed: true });
    });
  } catch (error) {
    logStorageError('clearAllStorage', error);
  }
};
