import { AppNotification } from '../types';
import { storageService } from './storageService';
import { apiClient } from './apiClient';

const NOTIFICATIONS_KEY = 'terraverify_notifications';

export const notificationService = {
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const res = await apiClient.get<AppNotification[]>('/notifications');
    let all: AppNotification[] = [];
    if (res && Array.isArray(res)) {
      all = res;
      await storageService.setItem(NOTIFICATIONS_KEY, all);
    } else {
      all = await storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, []);
    }
    return all
      .filter((n) => !userId || n.userId === userId)
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());
  },

  async markAsRead(notificationId: string): Promise<void> {
    const all = await storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, []);
    const index = all.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      all[index].isRead = true;
      await storageService.setItem(NOTIFICATIONS_KEY, all);
    }
  },

  async markAllAsRead(userId?: string): Promise<void> {
    const all = await this.getNotifications();
    all.forEach((n) => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    await storageService.setItem(NOTIFICATIONS_KEY, all);
  },

  async createNotification(
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<AppNotification> {
    const all = await this.getNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    all.unshift(newNotif);
    await storageService.setItem(NOTIFICATIONS_KEY, all);
    return newNotif;
  },

  async getUnreadCount(userId?: string): Promise<number> {
    const notifs = await this.getNotifications(userId);
    return notifs.filter((n) => !n.isRead).length;
  },
};
