// Land listing and management service
import { LandListing, LandDocument } from '../types';
import { storageService } from './storageService';
import { verificationService } from './verificationService';
import { apiClient } from './apiClient';

const LANDS_KEY = 'terraverify_lands_list';
const UNLOCKED_LANDS_KEY = 'terraverify_unlocked_lands_'; // append userId

export interface LandFilterParams {
  searchQuery?: string;
  region?: string;
  landType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  onlyVerified?: boolean;
}

export const landService = {
  async getLands(filters?: LandFilterParams): Promise<LandListing[]> {
    const apiLands = await apiClient.get<LandListing[]>('/lands');
    let lands: LandListing[] = [];

    if (apiLands && Array.isArray(apiLands) && apiLands.length > 0) {
      lands = apiLands;
      await storageService.setItem(LANDS_KEY, lands);
    } else {
      lands = await storageService.getItem<LandListing[]>(LANDS_KEY, []);
    }
    
    if (!filters) return lands;

    return lands.filter((land) => {
      if (filters.onlyVerified && land.verificationStatus !== 'verified') {
        return false;
      }
      if (filters.region && filters.region !== 'all' && land.region.toLowerCase() !== filters.region.toLowerCase()) {
        return false;
      }
      if (filters.landType && filters.landType !== 'all' && land.landType !== filters.landType) {
        return false;
      }
      if (filters.minPrice && land.priceFCFA < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && land.priceFCFA > filters.maxPrice) {
        return false;
      }
      if (filters.minArea && land.areaSqM < filters.minArea) {
        return false;
      }
      if (filters.maxArea && land.areaSqM > filters.maxArea) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchTitle = land.title.toLowerCase().includes(query);
        const matchNeighborhood = land.neighborhood.toLowerCase().includes(query);
        const matchSubdiv = land.subdivision.toLowerCase().includes(query);
        const matchTitleNum = land.landTitleNumber.toLowerCase().includes(query);
        const matchRegion = land.region.toLowerCase().includes(query);
        if (!matchTitle && !matchNeighborhood && !matchSubdiv && !matchTitleNum && !matchRegion) {
          return false;
        }
      }
      return true;
    });
  },

  async getLandById(id: string): Promise<LandListing | null> {
    const lands = await this.getLands();
    return lands.find((l) => l.id === id) || null;
  },

  async isLandUnlockedForUser(landId: string, userId: string): Promise<boolean> {
    const list = await apiClient.get<string[]>(`/unlocked-lands/${userId}`);
    if (list) return list.includes(landId);
    return false;
  },

  async markLandAsUnlocked(landId: string, userId: string): Promise<void> {
    await apiClient.post('/unlocked-lands', { landId });
  },

  async getSellerListings(sellerId: string): Promise<LandListing[]> {
    const lands = await this.getLands();
    return lands.filter((l) => l.sellerId === sellerId);
  },

  async submitLandListing(params: {
    title: string;
    landTitleNumber: string;
    description: string;
    region: string;
    division: string;
    subdivision: string;
    neighborhood: string;
    areaSqM: number;
    priceFCFA: number;
    landType: 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'mixed_use';
    topography: 'flat' | 'gentle_slope' | 'elevated' | 'waterfront';
    accessRoad: 'paved' | 'dirt_road' | 'secondary' | 'servitude';
    images: string[];
    documents: LandDocument[];
    sellerId: string;
    sellerName: string;
    sellerPhone: string;
    exactLandmark?: string;
  }): Promise<{ land: LandListing; verificationRequestId: string }> {
    const payload = {
      title: params.title,
      landTitleNumber: params.landTitleNumber.toUpperCase().trim(),
      description: params.description,
      region: params.region,
      division: params.division,
      subdivision: params.subdivision,
      neighborhood: params.neighborhood,
      areaSqM: params.areaSqM,
      priceFCFA: params.priceFCFA,
      landType: params.landType,
      topography: params.topography,
      accessRoad: params.accessRoad,
      images: params.images.length > 0 ? params.images : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'],
      documents: params.documents,
      sellerId: params.sellerId,
      exactLocation: {
        coordinates: { latitude: 3.8480, longitude: 11.5021 },
        landmarkDescription: params.exactLandmark || 'Near public crossroads',
        streetAddress: `${params.neighborhood}, ${params.subdivision}`,
      },
      sellerContact: {
        id: params.sellerId,
        name: params.sellerName,
        phone: params.sellerPhone,
        email: 'seller@terraverify.cm',
      },
    };

    const res = await apiClient.post<LandListing & { id: string }>('/lands', payload);
    if (!res) throw new Error('Failed to create land listing on server.');

    // Create the associated verification request with 48h timeline
    const verifReq = await verificationService.createVerificationRequest({
      landId: res.id,
      landTitleNumber: res.landTitleNumber,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      sellerPhone: params.sellerPhone,
      region: params.region,
      division: params.division,
      subdivision: params.subdivision,
      surfaceAreaSqM: params.areaSqM,
      documents: params.documents,
    });

    return { land: res, verificationRequestId: verifReq.id };
  },

  async updateLandStatus(
    landId: string,
    status: 'verified' | 'rejected',
    surveyorNotes?: string,
    rejectionReason?: string
  ): Promise<LandListing> {
    const res = await apiClient.put<{ success: boolean }>(`/lands/${landId}/status`, {
      status, surveyorNotes, rejectionReason
    });
    if (!res || !res.success) throw new Error('Failed to update land status on server');
    
    // Fetch updated land to return
    const land = await this.getLandById(landId);
    if (!land) throw new Error('Land not found after update');
    return land;
  },
};
