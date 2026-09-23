// Interactive Cameroon Cadastral & Satellite Map Component
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { LandProperty } from '../../types';
import { formatFCFA, formatArea } from '../../constants/cameroonData';
import { StatusBadge } from '../common/StatusBadge';

interface CadastralMapViewProps {
  lands: LandProperty[];
}

const { width, height } = Dimensions.get('window');

export const CadastralMapView: React.FC<CadastralMapViewProps> = ({ lands }) => {
  const router = useRouter();
  const [selectedLand, setSelectedLand] = useState<LandProperty | null>(lands[0] || null);
  const [mapType, setMapType] = useState<'cadastre' | 'satellite'>('cadastre');
  const [activeRegion, setActiveRegion] = useState<string>('all');

  const filteredLands = lands.filter((l) => {
    if (activeRegion === 'all') return true;
    const loc = `${l.region} ${l.division || ''} ${(l as any).city || ''}`.toLowerCase();
    return loc.includes(activeRegion.toLowerCase());
  });

  // Simulated coordinates positioned relatively on a stylized map canvas
  const getCoordinates = (land: LandProperty, index: number) => {
    // Relative coordinates across Cameroon's geography
    const city = `${land.region} ${land.division || ''} ${(land as any).city || ''}`.toLowerCase();
    if (city.includes('yaoundé') || city.includes('centre')) {
      return { top: 120 + (index * 25) % 80, left: width * 0.48 + (index * 20) % 60 };
    }
    if (city.includes('douala') || city.includes('littoral')) {
      return { top: 140 + (index * 30) % 70, left: width * 0.22 + (index * 15) % 40 };
    }
    if (city.includes('kribi') || city.includes('sud')) {
      return { top: 250 + (index * 20) % 50, left: width * 0.32 + (index * 20) % 50 };
    }
    if (city.includes('limbe') || city.includes('fako')) {
      return { top: 110 + (index * 25) % 50, left: width * 0.12 + (index * 15) % 30 };
    }
    return { top: 80 + (index * 40) % 200, left: width * 0.35 + (index * 35) % 150 };
  };

  return (
    <View style={styles.container}>
      {/* Map Canvas */}
      <View style={[styles.mapCanvas, mapType === 'satellite' ? styles.satelliteBg : styles.cadastreBg]}>
        {/* Stylized Topographic / Cadastral Grid Lines */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.gridLineVertical1} />
          <View style={styles.gridLineVertical2} />
        </View>

        {/* Coastal Contour & Waterbody representation for Atlantic Gulf */}
        <View style={styles.waterBodyAtlantic}>
          <Text style={styles.waterLabel}>GOLFE DE GUINÉE / ATLANTIQUE</Text>
        </View>

        {/* Region Territorial Label Badges */}
        <View style={[styles.territoryBadge, { top: 85, left: width * 0.1 }]}>
          <Text style={styles.territoryText}>LITTORAL / DLA</Text>
        </View>
        <View style={[styles.territoryBadge, { top: 95, left: width * 0.52 }]}>
          <Text style={styles.territoryText}>CENTRE / YDE</Text>
        </View>
        <View style={[styles.territoryBadge, { top: 225, left: width * 0.28 }]}>
          <Text style={styles.territoryText}>OCÉAN / KRIBI</Text>
        </View>

        {/* Land Parcel Pins */}
        {filteredLands.map((land, idx) => {
          const isSelected = selectedLand?.id === land.id;
          const pos = getCoordinates(land, idx);
          const shortPrice = (land.priceFCFA / 1000000).toFixed(0) + 'M';

          return (
            <TouchableOpacity
              key={land.id}
              style={[
                styles.pinContainer,
                { top: pos.top, left: pos.left },
                isSelected && styles.pinContainerSelected,
              ]}
              onPress={() => setSelectedLand(land)}
              activeOpacity={0.85}
            >
              <View style={[styles.pinPill, isSelected ? styles.pinPillSelected : styles.pinPillNormal]}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={isSelected ? '#FFFFFF' : COLORS.success}
                  style={{ marginRight: 3 }}
                />
                <Text style={[styles.pinPriceText, isSelected && styles.pinPriceTextSelected]}>
                  {shortPrice}
                </Text>
              </View>
              <View style={[styles.pinStem, isSelected && styles.pinStemSelected]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Top Controls */}
      <View style={styles.topControls}>
        {/* Region Quick Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionFilterRow}>
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'yaoundé', label: 'Yaoundé' },
            { id: 'douala', label: 'Douala' },
            { id: 'kribi', label: 'Kribi' },
            { id: 'limbe', label: 'Limbe' },
          ].map((reg) => (
            <TouchableOpacity
              key={reg.id}
              style={[styles.regPill, activeRegion === reg.id && styles.regPillActive]}
              onPress={() => setActiveRegion(reg.id)}
            >
              <Text style={[styles.regPillText, activeRegion === reg.id && styles.regPillTextActive]}>
                {reg.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Map Type Switcher */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeBtn, mapType === 'cadastre' && styles.modeBtnActive]}
            onPress={() => setMapType('cadastre')}
          >
            <Ionicons
              name="map-outline"
              size={14}
              color={mapType === 'cadastre' ? '#FFFFFF' : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.modeBtnText, mapType === 'cadastre' && styles.modeBtnTextActive]}>
              Plot Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mapType === 'satellite' && styles.modeBtnActive]}
            onPress={() => setMapType('satellite')}
          >
            <Ionicons
              name="earth-outline"
              size={14}
              color={mapType === 'satellite' ? '#FFFFFF' : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.modeBtnText, mapType === 'satellite' && styles.modeBtnTextActive]}>
              Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Bottom Property Preview Card */}
      {selectedLand && (
        <View style={styles.previewCardContainer}>
          <TouchableOpacity
            style={styles.previewCard}
            onPress={() => router.push(`/property/${selectedLand.id}`)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: selectedLand.images[0] }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewContent}>
              <View style={styles.previewBadgesRow}>
                <StatusBadge status={selectedLand.verificationStatus} size="sm" />
                <Text style={styles.previewArea}>{formatArea(selectedLand.areaSqM)}</Text>
              </View>

              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedLand.title}
              </Text>
              <Text style={styles.previewLocation} numberOfLines={1}>
                📍 {selectedLand.neighborhood}, {(selectedLand as any).city || selectedLand.division}
              </Text>

              <View style={styles.previewBottomRow}>
                <Text style={styles.previewPrice}>{formatFCFA(selectedLand.priceFCFA)}</Text>
                <View style={styles.viewDetailsBtn}>
                  <Text style={styles.viewDetailsText}>View Plot</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cadastreBg: {
    backgroundColor: '#EAF0F6', // Light cadastral survey blueprint hue
  },
  satelliteBg: {
    backgroundColor: '#1C2E20', // Dark satellite terrain foliage
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(13, 71, 161, 0.08)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '65%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(13, 71, 161, 0.08)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '35%',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(13, 71, 161, 0.08)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '70%',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(13, 71, 161, 0.08)',
  },
  waterBodyAtlantic: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '42%',
    height: '40%',
    backgroundColor: 'rgba(30, 136, 229, 0.22)',
    borderTopRightRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 71, 161, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  waterLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0D47A1',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  territoryBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(13, 71, 161, 0.18)',
  },
  territoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinContainerSelected: {
    zIndex: 20,
    transform: [{ scale: 1.15 }],
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.round,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinPillNormal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  pinPillSelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pinPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pinPriceTextSelected: {
    color: '#FFFFFF',
  },
  pinStem: {
    width: 2,
    height: 6,
    backgroundColor: COLORS.primary,
  },
  pinStemSelected: {
    backgroundColor: '#FFFFFF',
    height: 8,
  },
  topControls: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'column',
    gap: SPACING.sm,
    zIndex: 30,
  },
  regionFilterRow: {
    gap: 6,
  },
  regPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...SHADOWS.subtle,
  },
  regPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  regPillTextActive: {
    color: '#FFFFFF',
  },
  modeSwitcher: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: RADIUS.round,
    padding: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...SHADOWS.subtle,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.round,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  previewCardContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 30,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
  },
  previewContent: {
    flex: 1,
  },
  previewBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewArea: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  previewLocation: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  previewBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.round,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 2,
  },
});
