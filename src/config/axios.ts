import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

import { apiConfig } from '@config/api';

const ApiErrorCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
} as const;

import { LocalStorageKeys } from '@constants/local-storage';
import { AppRoutes } from '@constants/paths';

import type { TokenResponse } from '@services/auth/auth-dtos';

import { handleSWRError } from '@utils/error-handler';
import { getFromStorage, removeFromStorage, setToStorage } from '@utils/local-storage';

type RefreshQueueItem = {
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

const processQueue = (error: unknown, token: string = '') => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  refreshQueue = [];
};

const addTokenToRequest = (request: InternalAxiosRequestConfig) => {
  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
};

export const baseAxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: apiConfig.withCredentials,
  headers: apiConfig.headers,
});

export const authAxiosInstance = axios.create({
  baseURL: `${apiConfig.baseUrl}/auth`,
  withCredentials: apiConfig.withCredentials,
  headers: apiConfig.headers,
});

baseAxiosInstance.interceptors.request.use(
  request => addTokenToRequest(request),
  error => Promise.reject(error)
);

authAxiosInstance.interceptors.request.use(
  request => addTokenToRequest(request),
  error => Promise.reject(error)
);

baseAxiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === ApiErrorCodes.Unauthorized &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(baseAxiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await authAxiosInstance.post<TokenResponse>('/refresh');
        const { access_token } = data;

        setToStorage(LocalStorageKeys.AccessToken, access_token);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return baseAxiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, '');

        removeFromStorage(LocalStorageKeys.AccessToken);

        window.history.replaceState({}, '', AppRoutes.SignIn);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle all other errors with global error handler
    handleSWRError(error);

    return Promise.reject(error);
  }
);
