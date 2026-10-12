import axios from 'axios';

import { authStorage } from '@/features/auth/utils/auth.storage';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

let installed = false;

export function setupInterceptors() {
  if (installed) return;
  installed = true;

  apiClient.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);
      const status = error.response?.status ?? 0;
      const data = error.response?.data as { message?: string | string[] } | undefined;
      const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;

      if (status === 401 && !error.config?.url?.includes(API_ENDPOINTS.AUTH.LOGIN)) {
        authStorage.clear();
        window.dispatchEvent(new Event('smartqueue:auth-expired'));
      }

      return Promise.reject(new ApiError(status, message ?? (status === 0 ? 'No se pudo conectar con el backend' : 'No se pudo completar la solicitud')));
    },
  );
}
