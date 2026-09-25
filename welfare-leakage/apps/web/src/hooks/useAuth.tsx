import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api, { setAccessToken, setUnauthorizedHandler } from '@/utils/api';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Single-flight: StrictMode double-mounts the effect, and concurrent refreshes
// with the same token race against rotation (second call 401s → forced logout).
let sessionPromise: Promise<User | null> | null = null;

function restoreSession(): Promise<User | null> {
  if (sessionPromise) return sessionPromise;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return Promise.resolve(null);
  sessionPromise = api
    .post<AuthResponse>('/auth/refresh', { refreshToken })
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.user;
    })
    .catch(() => {
      localStorage.removeItem('refreshToken');
      return null;
    })
    .finally(() => {
      sessionPromise = null;
    });
  return sessionPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);

    let cancelled = false;
    restoreSession().then((u) => {
      if (cancelled) return;
      if (u) setUser(u);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
