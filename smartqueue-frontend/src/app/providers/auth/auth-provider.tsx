import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext } from '@/app/providers/auth/auth-context';
import { authService } from '@/features/auth/services/auth.service';
import type { LoginValues } from '@/features/auth/schemas/login.schema';
import type { LoginResponse } from '@/features/auth/types/auth.types';
import { authStorage } from '@/features/auth/utils/auth.storage';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<LoginResponse | null>(() => authStorage.getSession());
  const [isLoading, setIsLoading] = useState(Boolean(session));

  useEffect(() => {
    if (!session) return undefined;
    let active = true;
    authService.me().then(() => {
      if (active) setIsLoading(false);
    }).catch(() => {
      if (active) {
        authStorage.clear();
        setSession(null);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const expire = () => { setSession(null); setIsLoading(false); };
    window.addEventListener('smartqueue:auth-expired', expire);
    return () => window.removeEventListener('smartqueue:auth-expired', expire);
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isLoading,
    login: async (values: LoginValues) => {
      const next = await authService.login(values);
      authStorage.set(next);
      setSession(next);
    },
    logout: () => { authStorage.clear(); setSession(null); },
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
