import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

import router from '@app/router';

import { ApiErrorCodes } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/local-storage';
import { AppRoutes } from '@shared/constants/router';

import { AuthService } from '@shared/services/auth/auth-service';

import { getFromStorage, removeFromStorage, setToStorage } from '@shared/utils/local-storage';

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
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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

    if (error.response?.status === ApiErrorCodes.Unauthorized && !originalRequest._retry) {
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
        const { access_token } = await AuthService.refreshToken();

        setToStorage(LocalStorageKeys.AccessToken, access_token);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return baseAxiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, '');

        removeFromStorage(LocalStorageKeys.AccessToken);
        router.navigate(AppRoutes.SignIn, { replace: true });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
