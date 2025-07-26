import { useSearchParams } from 'react-router';

interface UseUrlParamsOptions<T> {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export const useUrlParams = <T = string>(key: string, options: UseUrlParamsOptions<T> = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultValue, serialize = String, deserialize = (value: string) => value as T } = options;

  const getValue = (): T => {
    const paramValue = searchParams.get(key);
    if (paramValue === null) {
      return defaultValue as T;
    }

    return deserialize(paramValue);
  };

  const setValue = (value: T | string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const serializedValue = serialize(value as T);

    newSearchParams.set(key, serializedValue);

    setSearchParams(newSearchParams);
  };

  const removeValue = () => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.delete(key);

    setSearchParams(newSearchParams);
  };

  return {
    value: getValue(),
    setValue,
    removeValue,
    hasValue: searchParams.has(key),
  };
};
