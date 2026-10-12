import { createContext } from 'react';

import type { LoginValues } from '@/features/auth/schemas/login.schema';
import type { SessionUser } from '@/features/auth/types/auth.types';

export interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(values: LoginValues): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
