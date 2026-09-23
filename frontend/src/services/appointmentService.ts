// Professional Advisor & Appointment Service
import { ProfessionalAdvisor, Appointment, AppointmentStatus } from '../types';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { apiClient } from './apiClient';

const ADVISORS_KEY = 'terraverify_advisors';
const APPOINTMENTS_KEY = 'terraverify_appointments';

export const appointmentService = {
  async getAdvisors(): Promise<ProfessionalAdvisor[]> {
    const res = await apiClient.get<ProfessionalAdvisor[]>('/advisors');
    if (res && Array.isArray(res)) {
      await storageService.setItem(ADVISORS_KEY, res);
      return res;
    }
    return storageService.getItem<ProfessionalAdvisor[]>(ADVISORS_KEY, []);
  },

  async getAdvisorById(id: string): Promise<ProfessionalAdvisor | null> {
    const advisors = await this.getAdvisors();
    return advisors.find((a) => a.id === id) || null;
  },

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return this.getAppointments(userId);
  },

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const all = await this.getAppointments(userId);
    return all.filter((apt) => apt.status === 'confirmed' || apt.status === 'requested');
  },

  async getAppointments(userId?: string, advisorId?: string): Promise<Appointment[]> {
    const res = await apiClient.get<Appointment[]>('/appointments');
    let all: Appointment[] = [];
    if (res && Array.isArray(res)) {
      all = res;
      await storageService.setItem(APPOINTMENTS_KEY, all);
    } else {
      all = await storageService.getItem<Appointment[]>(APPOINTMENTS_KEY, []);
    }
    
    if (advisorId) {
      return all.filter((a) => a.advisorId === advisorId);
    }
    if (userId) {
      return all.filter((a) => a.userId === userId);
    }
    return all;
  },

  async bookAppointment(params: {
    userId: string;
    userName: string;
    userPhone: string;
    advisorId: string;
    advisorName: string;
    advisorRole: string;
    date: string;
    timeSlot: string;
    topic: string;
    notes?: string;
    feeFCFA: number;
  }): Promise<Appointment> {
    const res = await apiClient.post<Appointment>('/appointments', params);
    if (!res) throw new Error('Failed to book appointment on server');

    await notificationService.createNotification({
      userId: params.userId,
      title: 'Appointment Confirmed',
      message: `Your consultation with ${params.advisorName} is confirmed for ${params.date} at ${params.timeSlot}.`,
      type: 'appointment_reminder',
      relatedEntityId: res.id,
      relatedEntityType: 'appointment',
    });

    return res;
  },

  async cancelAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    return this.updateStatus(appointmentId, 'cancelled');
  },

  async updateStatus(appointmentId: string, status: any, notes?: string): Promise<Appointment> {
    const appointments = await storageService.getItem<Appointment[]>(APPOINTMENTS_KEY, []);
    const index = appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');

    appointments[index].status = status;
    if (notes) appointments[index].notes = notes;
    await storageService.setItem(APPOINTMENTS_KEY, appointments);
    return appointments[index];
  },
};
