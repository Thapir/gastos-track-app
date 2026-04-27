import { AuthContextType, UserType } from '@/types';
import { authService } from '@/utils/authService';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((session) => {
      setUser(session);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      const session = await authService.getSession();
      setUser(session);
    }
    return result;
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await authService.register(name, email, password);
    if (result.success) {
      const session = await authService.getSession();
      setUser(session);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUserData = async (_userId: string) => {};

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const useLogout = () => {
  const { setUser } = useAuth();
  return async () => {
    await authService.logout();
    setUser(null);
  };
};
