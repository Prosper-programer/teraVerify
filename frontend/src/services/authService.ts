// Authentication service with session management and demo role switcher
import { User, UserRole } from '../types';
import { storageService } from './storageService';
import { apiClient } from './apiClient';

const AUTH_USER_KEY = 'terraverify_auth_user';
const USERS_LIST_KEY = 'terraverify_users_list';

export const authService = {
  async initUsers(): Promise<Record<string, User>> {
    const apiUsers = await apiClient.get<User[]>('/users');
    if (apiUsers && Array.isArray(apiUsers)) {
      const map: Record<string, User> = {};
      apiUsers.forEach((u) => {
        map[u.id] = u;
      });
      await storageService.setItem(USERS_LIST_KEY, map);
      return map;
    }
    return {};
  },

  async getCurrentUser(): Promise<User | null> {
    const user = await storageService.getItem<User | null>(AUTH_USER_KEY, null);
    return user;
  },

  async setCurrentUser(user: User | null, token?: string): Promise<void> {
    if (user && token) {
      await storageService.setItem(AUTH_USER_KEY, user);
      await storageService.setItem('terraverify_token', token);
    } else if (!user) {
      await storageService.removeItem(AUTH_USER_KEY);
      await storageService.removeItem('terraverify_token');
    }
  },

  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const apiRes = await apiClient.post<{ user: User; token: string }>('/auth/login', {
      identifier: identifier.trim(),
      password,
    });
    if (apiRes && apiRes.user) {
      await this.setCurrentUser(apiRes.user, apiRes.token);
      return apiRes;
    }
    throw new Error('Login failed. Please check your credentials and try again.');
  },

  async register(params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: User; token: string }> {
    const apiRes = await apiClient.post<{ user: User; token: string }>('/auth/register', {
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      password: params.password,
      role: params.role,
    });
    if (apiRes && apiRes.user) {
      await this.setCurrentUser(apiRes.user, apiRes.token);
      return apiRes;
    }
    throw new Error('Registration failed.');
  },

  async verifyOtp(tempUserId: string, otp: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (otp !== '123456' && otp.length !== 6) {
      throw new Error('Invalid verification code. Please enter the 6-digit code sent to your phone (Demo code: 123456).');
    }

    let user = await this.getCurrentUser();
    const token = await storageService.getItem<string>('terraverify_token', '');
    if (user) {
      user.isPhoneVerified = true;
      await this.setCurrentUser(user, token || undefined);
    }
    return user!;
  },

  async logout(): Promise<void> {
    await storageService.removeItem(AUTH_USER_KEY);
  },

  // Switch roles instantly during defense presentation
  async switchDemoRole(role: UserRole): Promise<User | null> {
    if (role === 'visitor') {
      await this.setCurrentUser(null);
      return null;
    }
    throw new Error('Demo roles are disabled. Please log in with a valid account.');
  },

  async getAllUsers(): Promise<User[]> {
    const apiUsers = await apiClient.get<User[]>('/users');
    if (apiUsers && Array.isArray(apiUsers)) {
      const map: Record<string, User> = {};
      apiUsers.forEach((u) => {
        map[u.id] = u;
      });
      await storageService.setItem(USERS_LIST_KEY, map);
      return apiUsers;
    }
    return [];
  },

  async toggleUserStatus(userId: string): Promise<User> {
    const apiRes = await apiClient.put<{ id: string; status: 'active' | 'suspended' }>(`/users/${userId}/toggle-status`);
    if (!apiRes) throw new Error('Failed to toggle user status');
    
    // Quick local update to avoid full refetch
    const users = await this.initUsers();
    const user = users[userId] || Object.values(users).find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.status = apiRes.status;
    await storageService.setItem(USERS_LIST_KEY, users);
    return user;
  },
};
