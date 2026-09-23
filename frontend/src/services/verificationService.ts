// Verification service: Land Surveyor manual check workflows & 48-hour timeline
import { VerificationRequest, LandDocument } from '../types';
import { storageService } from './storageService';
import { notificationService } from './notificationService';

const VERIFICATION_REQUESTS_KEY = 'terraverify_verification_requests';

export const verificationService = {
  async getRequests(): Promise<VerificationRequest[]> {
    const { apiClient } = await import('./apiClient');
    const apiReqs = await apiClient.get<VerificationRequest[]>('/verifications');
    if (apiReqs && Array.isArray(apiReqs)) {
      await storageService.setItem(VERIFICATION_REQUESTS_KEY, apiReqs);
      return apiReqs;
    }
    return storageService.getItem<VerificationRequest[]>(
      VERIFICATION_REQUESTS_KEY,
      []
    );
  },

  async getRequestById(id: string): Promise<VerificationRequest | null> {
    const requests = await this.getRequests();
    return requests.find((r) => r.id === id) || null;
  },

  async getRequestByLandId(landId: string): Promise<VerificationRequest | null> {
    const requests = await this.getRequests();
    return requests.find((r) => r.landId === landId) || null;
  },

  async createVerificationRequest(params: {
    landId: string;
    landTitleNumber: string;
    sellerId: string;
    sellerName: string;
    sellerPhone: string;
    region: string;
    division: string;
    subdivision: string;
    surfaceAreaSqM: number;
    documents: LandDocument[];
  }): Promise<VerificationRequest> {
    const { apiClient } = await import('./apiClient');
    const res = await apiClient.post<VerificationRequest & { id: string }>('/verifications', params);
    if (!res) throw new Error('Failed to create verification request');

    // Notify seller of successful submission
    await notificationService.createNotification({
      userId: params.sellerId,
      title: 'Verification Request Submitted',
      message: `Your land title ${params.landTitleNumber} was successfully submitted. Estimated verification time: up to 48 hours.`,
      type: 'verification_submitted',
      relatedEntityId: res.id,
      relatedEntityType: 'verification',
    });

    return res;
  },

  async approveRequest(
    requestId: string,
    surveyorId: string,
    surveyorName: string,
    notes?: string
  ): Promise<VerificationRequest> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const requests = await this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Verification request not found');

    const req = requests[index];
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    req.status = 'approved';
    req.surveyorId = surveyorId;
    req.surveyorName = surveyorName;
    req.reviewedAt = now.toISOString();
    req.surveyorNotes = notes || 'Manual verification confirmed against regional cadastral index and boundary ledger.';

    // Update timeline
    req.timeline = req.timeline.map((step) => ({
      ...step,
      status: 'completed' as const,
      timestamp: step.timestamp || formattedDate,
    }));

    await storageService.setItem(VERIFICATION_REQUESTS_KEY, requests);

    // Update the corresponding Land status to verified & published
    // Dynamic import to avoid circular dependency
    const { landService } = await import('./landService');
    await landService.updateLandStatus(req.landId, 'verified', req.surveyorNotes);

    // Send notification to seller
    await notificationService.createNotification({
      userId: req.sellerId,
      title: 'Land Title Verified Successfully',
      message: `Congratulations! Your land title ${req.landTitleNumber} has been verified by ${surveyorName} and is now published for sale.`,
      type: 'verification_approved',
      relatedEntityId: req.landId,
      relatedEntityType: 'land',
    });

    return req;
  },

  async rejectRequest(
    requestId: string,
    surveyorId: string,
    surveyorName: string,
    rejectionReason: string,
    notes?: string
  ): Promise<VerificationRequest> {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new Error('A detailed rejection reason (at least 10 characters) is required for the seller.');
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const requests = await this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Verification request not found');

    const req = requests[index];
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    req.status = 'rejected';
    req.surveyorId = surveyorId;
    req.surveyorName = surveyorName;
    req.reviewedAt = now.toISOString();
    req.rejectionReason = rejectionReason;
    req.surveyorNotes = notes;

    // Update timeline to indicate rejection at final step
    req.timeline = req.timeline.map((step, idx) => {
      if (idx < 4) {
        return { ...step, status: 'completed' as const, timestamp: step.timestamp || formattedDate };
      }
      return {
        ...step,
        title: 'Verification Result: REJECTED',
        description: rejectionReason,
        status: 'completed' as const,
        timestamp: formattedDate,
      };
    });

    await storageService.setItem(VERIFICATION_REQUESTS_KEY, requests);

    // Update the corresponding Land status to rejected
    const { landService } = await import('./landService');
    await landService.updateLandStatus(req.landId, 'rejected', undefined, rejectionReason);

    // Send notification to seller
    await notificationService.createNotification({
      userId: req.sellerId,
      title: 'Land Title Verification Unsuccessful',
      message: `Your land title ${req.landTitleNumber} could not be verified. Reason: ${rejectionReason}`,
      type: 'verification_rejected',
      relatedEntityId: req.id,
      relatedEntityType: 'verification',
    });

    return req;
  },

  // Standalone Land Title Number Identification Check
  async checkTitleNumber(titleNumber: string): Promise<{
    status: 'verified' | 'pending' | 'rejected' | 'not_found';
    details?: {
      landTitleNumber: string;
      region?: string;
      division?: string;
      surveyorName?: string;
      verifiedDate?: string;
      reason?: string;
    };
  }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const requests = await this.getRequests();
    const normalized = titleNumber.trim().toUpperCase();

    const match = requests.find((r) => r.landTitleNumber.toUpperCase() === normalized);
    if (!match) {
      return {
        status: 'not_found',
        details: { landTitleNumber: normalized },
      };
    }

    if (match.status === 'approved') {
      return {
        status: 'verified',
        details: {
          landTitleNumber: match.landTitleNumber,
          region: match.region,
          division: match.division,
          surveyorName: match.surveyorName,
          verifiedDate: match.reviewedAt,
        },
      };
    }

    if (match.status === 'rejected') {
      return {
        status: 'rejected',
        details: {
          landTitleNumber: match.landTitleNumber,
          region: match.region,
          reason: match.rejectionReason,
        },
      };
    }

    return {
      status: 'pending',
      details: {
        landTitleNumber: match.landTitleNumber,
        region: match.region,
      },
    };
  },
};
