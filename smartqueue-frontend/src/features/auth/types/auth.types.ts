import type { UserRole } from '@/features/auth/enums/user-role.enum';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: SessionUser;
}
