import axios from 'axios';

import { env } from '@/app/config/env';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

export async function apiGet<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<T>(path);
  return data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<T>(path, body);
  return data;
}

export const useMocks = env.useMocks;
