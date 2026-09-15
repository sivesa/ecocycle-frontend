// Directory: src/shared/services
// TODO: confirm these two imports against your actual authStorage.ts —
// I don't have that file's source, so `getAccessToken`/`clearTokens` are
// best-guess export names. Adjust to match once you share it.
import { getAccessToken, clearAuthTokens } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the stored access token as a Bearer header. Default true —
   * pass false for the public onboarding/auth endpoints. */
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content and similar — nothing to parse.
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    // Per API_ENDPOINTS.md, /api/auth/refresh is disabled — the documented
    // behavior on a 401 is "redirect to /authenticate", not silently
    // retry. Clearing the stored tokens here means AuthContext's
    // isAuthenticated check (however it's derived) should naturally flip
    // to false, and ProtectedTabs/ProtectedRoutes can redirect from there.
    if (response.status === 401) {
      clearAuthTokens();
    }
    const message = (data && typeof data === 'object' && 'message' in data)
      ? String((data as { message: unknown }).message)
      : response.statusText;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};