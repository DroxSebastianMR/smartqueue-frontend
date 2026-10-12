import type { LoginValues } from '@/features/auth/schemas/login.schema';
import type { LoginResponse, SessionUser } from '@/features/auth/types/auth.types';
import { apiGet, apiPost } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const authService = {
  login: (credentials: LoginValues): Promise<LoginResponse> => apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials),
  me: (): Promise<SessionUser> => apiGet(API_ENDPOINTS.AUTH.ME),
};
