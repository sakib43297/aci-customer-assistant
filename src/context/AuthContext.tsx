import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser, UserRole, BusinessProfile } from '../types';
import { DEMO_ACCOUNTS, DemoAccount, seedDemoAccountsToLocal } from '../services/demoAccounts';

interface AuthContextType {
  currentUser: AppUser | null; initialLoading: boolean; actionLoading: boolean; loading: boolean;
  isAdmin: boolean; error: string | null; demoAccounts: DemoAccount[];
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role: UserRole, businessDetails?: Partial<BusinessProfile>) => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: (role: UserRole, customEmail?: string, customName?: string) => Promise<void>;
  clearError: () => void; seedLocalDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
let csrfToken: string | null = null;

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || 'The application service is unavailable.');
  return data;
}

export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  const data = await parseResponse(response);
  csrfToken = data.csrfToken;
  return csrfToken;
}

export async function apiRequest(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const method = String(options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !path.startsWith('/api/auth/login') && !path.startsWith('/api/auth/register') && !path.startsWith('/api/auth/refresh')) await ensureCsrf();
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) headers.set('X-CSRF-Token', csrfToken);
  const response = await fetch(path, { ...options, headers, credentials: 'include' });
  if (response.status === 401 && retry && !path.startsWith('/api/auth/')) {
    const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': await ensureCsrf() } });
    if (refreshed.ok) return apiRequest(path, options, false);
  }
  return parseResponse(response);
}

// Compatibility shim: authentication is carried only by HttpOnly cookies.
export const getSessionHeaders = (): Record<string, string> => ({});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureCsrf().then(() => apiRequest('/api/auth/me')).then(data => setCurrentUser(data.user)).catch(() => setCurrentUser(null)).finally(() => setInitialLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    setActionLoading(true); setError(null);
    try { await ensureCsrf(); const data = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) }); csrfToken = data.csrfToken || csrfToken; setCurrentUser(data.user); }
    catch (err: any) { const message = err.message || 'Invalid email or password.'; setError(message); throw new Error(message); }
    finally { setActionLoading(false); }
  };

  const register = async (email: string, pass: string, name: string, _role: UserRole, businessDetails?: Partial<BusinessProfile>) => {
    setActionLoading(true); setError(null);
    try { await ensureCsrf(); const data = await apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password: pass, name, businessName: businessDetails?.name, businessType: businessDetails?.type }) }); csrfToken = data.csrfToken || csrfToken; setCurrentUser(data.user); }
    catch (err: any) { const message = err.message || 'Registration failed.'; setError(message); throw new Error(message); }
    finally { setActionLoading(false); }
  };

  const loginDemo = async () => { throw new Error('Demo accounts no longer use shared passwords. An administrator must provision a password reset.'); };

  const logout = async () => {
    setActionLoading(true);
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch { /* local state still clears */ }
    finally { csrfToken = null; setCurrentUser(null); setActionLoading(false); }
  };

  const value: AuthContextType = {
    currentUser, initialLoading, actionLoading, loading: actionLoading,
    isAdmin: currentUser?.role === 'admin', error, demoAccounts: DEMO_ACCOUNTS,
    login, register, logout, loginDemo, clearError: () => setError(null), seedLocalDemoData: async () => { await seedDemoAccountsToLocal(); }
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
