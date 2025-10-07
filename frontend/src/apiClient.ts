const rawBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const prefix = import.meta.env.VITE_API_PREFIX || '/api';
const baseURL = rawBase.replace(/\/$/, '') + prefix; // ensure no double slash

export interface ApiResponse<T> { message?: string; data?: T; [k: string]: unknown }

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(baseURL + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => request<{ status: string }>('/health'),
};
