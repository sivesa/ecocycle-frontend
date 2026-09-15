// Directory: src/shared/context
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppUser } from '../types/user';
import { OTP_MOCK_CODE, validateCredentials } from '../data/mockUsers';
import { MOCK_USERS } from '../data/mockUsers';

const STORAGE_KEY = 'ecocycle.session.user';

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AppUser | null;
  /** Cellphone that cleared credentials and is awaiting OTP verification. */
  pendingCellphone: string | null;
  /** The literal OTP code used for mock verification (shown for demo purposes). */
  otpHint: string;
  login: (cellphone: string, password: string) => LoginResult;
  verifyOtp: (code: string) => Promise<boolean>;
  /** Aborts an in-flight OTP verification back to the login form. */
  cancelOtp: () => void;
  logout: () => void;
}

/**
 * Default, "no session" value. AuthProvider is optional — shared UI reads
 * this context but must not crash when a feature build (e.g. collector)
 * renders without one. Features with real auth mount AuthProvider.
 */
const GUEST_AUTH: AuthContextValue = {
  isAuthenticated: false,
  user: null,
  pendingCellphone: null,
  otpHint: OTP_MOCK_CODE,
  login: () => ({ success: false, error: 'Authentication is not configured for this build.' }),
  verifyOtp: async () => false,
  cancelOtp: () => undefined,
  logout: () => undefined,
};

const AuthContext = createContext<AuthContextValue>(GUEST_AUTH);

function readStoredSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(readStoredSession);
  const [pendingCellphone, setPendingCellphone] = useState<string | null>(null);

  const login = useCallback((cellphone: string, password: string): LoginResult => {
    const match = validateCredentials(cellphone, password);
    if (!match) {
      return { success: false, error: 'Invalid cellphone number or password.' };
    }
    setPendingCellphone(match.cellphone);
    return { success: true };
  }, []);

  const verifyOtp = useCallback(
    async (code: string): Promise<boolean> => {
      if (code !== OTP_MOCK_CODE) return false;
      if (!pendingCellphone) return false;

      const matched = MOCK_USERS.find((u) => u.cellphone === pendingCellphone);
      if (!matched) return false;

      const { password: _password, householdName: _householdName, ...publicUser } = matched;
      const appUser: AppUser = publicUser;

      setUser(appUser);
      setPendingCellphone(null);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      } catch {
        // ignore storage failures (e.g. private mode)
      }
      return true;
    },
    [pendingCellphone]
  );

  const logout = useCallback(() => {
    setUser(null);
    setPendingCellphone(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }, []);

  const cancelOtp = useCallback(() => setPendingCellphone(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      pendingCellphone,
      otpHint: OTP_MOCK_CODE,
      login,
      verifyOtp,
      cancelOtp,
      logout,
    }),
    [user, pendingCellphone, login, verifyOtp, cancelOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}