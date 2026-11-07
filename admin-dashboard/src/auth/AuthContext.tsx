import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  clearTokens,
  clearUser,
  getStoredUser,
  getTokens,
  setAuthFailureHandler,
  setStoredUser,
  setTokens,
} from '../api/client';
import { authApi } from '../api/endpoints';
import type { AdminUser } from '../api/types';
import { FullPageSpinner } from '../components/Spinner';

interface AuthContextValue {
  user: AdminUser | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (contact: string, password: string, rememberMe: boolean) => Promise<AdminUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getTokens()) {
      clearUser();
      setUser(null);
    }
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    // Call the backend to revoke the refresh token, then clear local state.
    // Fire-and-forget: clear immediately so the UI responds instantly even if
    // the network request fails.
    const tokens = getTokens();
    clearTokens();
    clearUser();
    setUser(null);
    if (tokens?.refreshToken) {
      authApi.logout(tokens.refreshToken).catch(() => {
        // best-effort — local session is already cleared
      });
    }
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearTokens();
      clearUser();
      setUser(null);
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const login = useCallback(
    async (contact: string, password: string, rememberMe: boolean): Promise<AdminUser> => {
      const result = await authApi.login({ contact, password, rememberMe });
      if (result.user.role !== 'admin') {
        throw new Error('This account does not have admin access');
      }
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setStoredUser(result.user);
      setUser(result.user);
      return result.user;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAuthenticated: user !== null && getTokens() !== null,
      login,
      logout,
    }),
    [user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <FullPageSpinner label="Restoring session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
