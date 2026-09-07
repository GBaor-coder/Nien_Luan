import React, { useState, useEffect, useCallback } from 'react';
import { authService, type RegisterPayload } from '../services/auth.service';
import { AuthContext, type AuthContextType } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authExpired, setAuthExpired] = useState(() => !!sessionStorage.getItem('authExpired'));

  useEffect(() => {
    sessionStorage.removeItem('authExpired');
  }, []);

  useEffect(() => {
    if (token) {
      authService
        .getProfile()
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('authExpired');
          setToken(null);
          setUser(null);
          setAuthExpired(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authService.login({ username, password });
    const { user: userData, token: newToken } = res.data.data;
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setAuthExpired(false);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authService.register(data);
    const { user: userData, token: newToken } = res.data.data;
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setAuthExpired(false);
  }, []);

  const dismissAuthExpired = useCallback(() => {
    setAuthExpired(false);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authExpired');
    setToken(null);
    setUser(null);
    setAuthExpired(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authExpired,
        dismissAuthExpired,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
