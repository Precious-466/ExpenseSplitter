import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/endpoints';

interface CurrentUser {
  userId: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(loadStoredUser);

  const persist = (res: { token: string; userId: number; name: string; email: string }) => {
    localStorage.setItem('token', res.token);
    const currentUser = { userId: res.userId, name: res.name, email: res.email };
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    persist(res);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    persist(res);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
