// TerraVerify Backend API client connected to MySQL database: teraverify
import { Platform } from 'react-native';

import { storageService } from './storageService';

let API_HOST = '192.168.1.188';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${API_HOST}:5001/api`;

const getHeaders = async () => {
  const token = await storageService.getItem<string>('terraverify_token', '');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  baseUrl: BASE_URL,

  async get<T>(endpoint: string): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  },

  async post<T>(endpoint: string, body: any): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify(body),
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = data?.error || data?.message;
        if (errorMsg) {
          throw new Error(errorMsg);
        }
        return null;
      }
      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please ensure the backend server is running.');
      }
      throw err;
    }
  },

  async put<T>(endpoint: string, body?: any): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        method: 'PUT',
        signal: controller.signal,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = data?.error || data?.message;
        if (errorMsg) {
          throw new Error(errorMsg);
        }
        return null;
      }
      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please ensure the backend server is running.');
      }
      throw err;
    }
  },
};
