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
    let lands: LandListing[] = [];
    try {
      const apiLands = await apiClient.get<LandListing[]>('/lands');
      if (apiLands && Array.isArray(apiLands) && apiLands.length > 0) {
        lands = apiLands;
        await storageService.setItem(LANDS_KEY, lands);
      } else {
        lands = await storageService.getItem<LandListing[]>(LANDS_KEY, []);
      }
    } catch (error) {
      console.warn("API fetch failed, falling back to cache", error);
      lands = await storageService.getItem<LandListing[]>(LANDS_KEY, []);
    }

    // Fallback if absolutely no lands are found anywhere (first launch offline)
    if (lands.length === 0) {
      lands = [
        {
          id: 'land-001', title: '1000m² Residential Plot in Odza', landTitleNumber: 'TF-2023-ODZA-001',
          description: 'Beautiful flat plot located in the heart of Odza, Yaoundé. Perfect for a family residence or an apartment building. Electricity and water access nearby.',
          region: 'Centre', division: 'Mfoundi', subdivision: 'Yaoundé IV', neighborhood: 'Odza', areaSqM: 1000, priceFCFA: 15000000, unlockFeeFCFA: 10000, landType: 'residential', topography: 'flat', accessRoad: 'paved',
          images: ["https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80"],
          exactLocation: { coordinates: { latitude: 3.8058, longitude: 11.5215 }, streetAddress: 'Carrefour Koweit, Odza', landmarkDescription: 'Behind the new pharmacy' },
          sellerContact: { id: 'user-seller-01', name: 'Paul Njoya', phone: '+237 699 12 34 56', email: 'paul.njoya@example.com' },
          verificationStatus: 'verified', isPublished: true, isFeatured: true, surveyorNotes: 'Land boundaries verified against cadastral map 12-A.', sellerId: 'user-seller-01', submittedAt: new Date().toISOString(), documents: []
        },
        {
          id: 'land-002', title: 'Prime Commercial Land in Bonamoussadi', landTitleNumber: 'TF-2022-BONA-088',
          description: 'High visibility commercial plot situated on the main road in Bonamoussadi, Douala.',
          region: 'Littoral', division: 'Wouri', subdivision: 'Douala V', neighborhood: 'Bonamoussadi', areaSqM: 500, priceFCFA: 35000000, unlockFeeFCFA: 15000, landType: 'commercial', topography: 'flat', accessRoad: 'paved',
          images: ["https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&q=80"],
          verificationStatus: 'verified', isPublished: true, isFeatured: true, sellerId: 'user-seller-01', submittedAt: new Date().toISOString(), documents: []
        },
        {
          id: 'land-003', title: 'Agricultural Land near Lobé Falls', landTitleNumber: 'TF-2021-KRIBI-012',
          description: 'Vast agricultural expanse with rich red soil. Features river access, perfect for palm or rubber plantations.',
          region: 'Sud', division: 'Ocean', subdivision: 'Kribi I', neighborhood: 'Lobé', areaSqM: 50000, priceFCFA: 20000000, unlockFeeFCFA: 5000, landType: 'agricultural', topography: 'gentle_slope', accessRoad: 'dirt_road',
          images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"],
          verificationStatus: 'verified', isPublished: true, isFeatured: true, sellerId: 'user-seller-01', submittedAt: new Date().toISOString(), documents: []
        },
        {
          id: 'land-004', title: 'Sea View Plot in Limbe', landTitleNumber: 'TF-2024-LIMBE-045',
          description: 'Elevated plot offering breathtaking views of the Atlantic Ocean. Perfect for a luxury villa or boutique hotel.',
          region: 'Sud-Ouest', division: 'Fako', subdivision: 'Limbe I', neighborhood: 'Down Beach', areaSqM: 800, priceFCFA: 12000000, unlockFeeFCFA: 10000, landType: 'residential', topography: 'elevated', accessRoad: 'secondary',
          images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"],
          verificationStatus: 'verified', isPublished: true, isFeatured: true, sellerId: 'user-seller-01', submittedAt: new Date().toISOString(), documents: []
        }
      ];
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
