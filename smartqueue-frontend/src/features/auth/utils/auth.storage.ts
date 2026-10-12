import type { LoginResponse } from '@/features/auth/types/auth.types';

const SESSION_KEY = 'smartqueue.auth.session';

export const authStorage = {
  getSession(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as LoginResponse;
      if (!session.accessToken || new Date(session.expiresAt).getTime() <= Date.now()) {
        this.clear();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },
  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  },
  set(session: LoginResponse): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },
};
