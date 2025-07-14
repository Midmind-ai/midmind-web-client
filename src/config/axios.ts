import axios from 'axios';

import { getFromStorage, removeFromStorage, setToStorage } from '@/utils/localStorage';

type RefreshQueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  refreshQueue = [];
};

const BASE_URL = 'http://localhost:3000/api';
const TIMEOUT = 10000;

export const baseAxiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAxiosInstance = axios.create({
  baseURL: `${BASE_URL}/auth`,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

baseAxiosInstance.interceptors.request.use(
  request => {
    const accessToken = getFromStorage<string>('access_token');

    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }

    return request;
  },
  error => Promise.reject(error)
);

baseAxiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getFromStorage<string>('refresh_token');

      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return baseAxiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const { data } = await authAxiosInstance.post('/refresh', {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;

        setToStorage('access_token', newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return baseAxiosInstance(originalRequest);
      } catch (error) {
        processQueue(error);

        removeFromStorage('access_token');
        removeFromStorage('refresh_token');

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
