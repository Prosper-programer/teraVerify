// TerraVerify Backend API client connected to MySQL database: teraverify
import { Platform } from "react-native";

import { storageService } from "./storageService";

const DEFAULT_API_URL =
  Platform.OS === "web"
    ? "http://localhost:5001/api"
    : "http://10.84.95.53:5001/api";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const getHeaders = async () => {
  const token = await storageService.getItem<string>("terraverify_token", "");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  baseUrl: BASE_URL,

  async handleResponse(res: Response, endpoint?: string): Promise<any> {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401 && endpoint && !endpoint.includes('/auth/login')) {
        // Handle expired JWT
        await storageService.removeItem('terraverify_auth_user');
        await storageService.removeItem('terraverify_token');
        throw new Error('Session expired. Please log in again.');
      }
      const errorMsg = data?.error || data?.message || `Server error: ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  },

  async get<T>(endpoint: string): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);
      return (await this.handleResponse(res, endpoint)) as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Connection timed out. Please ensure the backend server is running.");
      }
      throw err;
    }
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        method: "POST",
        signal: controller.signal,
        headers,
        body: JSON.stringify(body),
      });
      clearTimeout(timeoutId);
      return (await this.handleResponse(res, endpoint)) as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Connection timed out. Please ensure the backend server is running.");
      }
      throw err;
    }
  },

  async put<T>(endpoint: string, body?: any): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const headers = await getHeaders();
      const res = await fetch(BASE_URL + endpoint, {
        method: "PUT",
        signal: controller.signal,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      clearTimeout(timeoutId);
      return (await this.handleResponse(res, endpoint)) as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Connection timed out. Please ensure the backend server is running.");
      }
      throw err;
    }
  },
};
