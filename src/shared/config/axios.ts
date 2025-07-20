import axios from 'axios';

import router from '@app/Router';

import { ApiErrorCodes, TIMEOUT } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/localStorage';
import { AppRoutes } from '@shared/constants/router';

import { refreshToken } from '@shared/services/auth';

import { getFromStorage, removeFromStorage, setToStorage } from '@shared/utils/localStorage';

let isRefreshing = false;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  request => {
    const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }

    return request;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === ApiErrorCodes.Unauthorized && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const { access_token } = await refreshToken();

        setToStorage(LocalStorageKeys.AccessToken, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
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
