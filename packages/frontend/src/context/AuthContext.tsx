import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, type AuthUser } from '../models/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 min
const WARNING_BEFORE = 2 * 60 * 1000; // 2 min antes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('machy_token'),
    loading: true,
  });

  let inactivityTimer: ReturnType<typeof setTimeout>;
  let warningTimer: ReturnType<typeof setTimeout>;

  const resetTimers = useCallback(() => {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);

    warningTimer = setTimeout(() => {
      // TODO: mostrar advertencia "Tu sesión expirará pronto"
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    inactivityTimer = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    if (state.token) {
      authService
        .getMe(state.token)
        .then((user) => {
          setState({ user, token: state.token, loading: false });
        })
        .catch(() => {
          localStorage.removeItem('machy_token');
          setState({ user: null, token: null, loading: false });
        });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      resetTimers();
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      events.forEach((e) => document.addEventListener(e, resetTimers));
      return () => {
        events.forEach((e) => document.removeEventListener(e, resetTimers));
        clearTimeout(inactivityTimer);
        clearTimeout(warningTimer);
      };
    }
  }, [state.user, resetTimers]);

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    localStorage.setItem('machy_token', token);
    setState({ user, token, loading: false });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('machy_token');
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAdmin: state.user?.role === 'ADMIN',
        isSeller: state.user?.role === 'SELLER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
