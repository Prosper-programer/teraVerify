import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
// Land Discovery & Multi-Filter Explorer Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { useLand } from '../../src/store/LandContext';
import { PropertyCard } from '../../src/components/property/PropertyCard';
import { Button } from '../../src/components/common/Button';
import { EmptyState } from '../../src/components/common/EmptyState';
import { CAMEROON_REGIONS, LAND_TYPES } from '../../src/constants/cameroonData';
import { CadastralMapView } from '../../src/components/property/CadastralMapView';
import { useLanguage } from '../../src/store/LanguageContext';
import { useProtectedAction } from '../../src/utils/useProtectedAction';

export default function ExploreScreen() {
  const router = useRouter();
  const { lands, filters, setFilters, savedLandIds, toggleSaveLand } = useLand();
  const { language, toggleLanguage, t } = useLanguage();
  const { requireAuth } = useProtectedAction();

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState<string>(filters.region || 'all');
  const [selectedType, setSelectedType] = useState<string>(filters.landType || 'all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(filters.onlyVerified !== false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(filters.maxPrice);
  const [minArea, setMinArea] = useState<number | undefined>(filters.minArea);

  const activeFiltersCount =
    (selectedRegion !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (onlyVerified ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minArea ? 1 : 0);

  const handleApplyFilters = () => {
    setFilters({
      searchQuery,
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      landType: selectedType === 'all' ? undefined : selectedType,
      onlyVerified,
      maxPrice,
      minArea,
    });
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setSelectedRegion('all');
    setSelectedType('all');
    setOnlyVerified(false);
    setMaxPrice(undefined);
    setMinArea(undefined);
    setSearchQuery('');
    setFilters({});
    setFilterModalVisible(false);
  };

  const handleSearchSubmit = () => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const displayedLands = showSavedOnly ? lands.filter(l => savedLandIds.includes(l.id)) : lands;

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + SPACING.sm, 40) }]}>
      {/* Header Search & Filter Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, marginRight: 4 }}>
            {language === 'EN' ? '🇬🇧' : '🇫🇷'}
          </Text>
          <Text style={styles.langBtnText}>{language}</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setFilters((p) => ({ ...p, searchQuery: undefined })); }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? '#FFFFFF' : COLORS.primary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Header with List / Map View Switcher */}
      <View style={styles.resultsInfoRow}>
        {/* Tabs for All vs Saved Lands */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, !showSavedOnly && styles.tabBtnActive]}
            onPress={() => setShowSavedOnly(false)}
          >
            <Text style={[styles.tabText, !showSavedOnly && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, showSavedOnly && styles.tabBtnActive]}
            onPress={() => setShowSavedOnly(true)}
          >
            <Text style={[styles.tabText, showSavedOnly && styles.tabTextActive]}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* View Switcher: List vs Cadastre Map */}
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list"
              size={14}
              color={viewMode === 'list' ? '#FFFFFF' : COLORS.textSecondary}
              style={{ marginRight: 3 }}
            />
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>
              {t('explore.list')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="map"
              size={14}
              color={viewMode === 'map' ? '#FFFFFF' : COLORS.textSecondary}
              style={{ marginRight: 3 }}
            />
            <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>
              {t('explore.map')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional View: List or Cadastral Map */}
      {viewMode === 'map' ? (
        <CadastralMapView lands={displayedLands} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
        >
          {displayedLands.length === 0 ? (
            <EmptyState
              icon={showSavedOnly ? "heart-dislike-outline" : "search-outline"}
              title={showSavedOnly ? "No Favorites Yet" : t('explore.noLands')}
              description={showSavedOnly ? "You haven't saved any lands to your favorites." : t('explore.noLandsDesc')}
              actionTitle={showSavedOnly ? "Explore Lands" : t('explore.resetFilters')}
              onAction={() => showSavedOnly ? setShowSavedOnly(false) : handleResetFilters()}
            />
          ) : (
            displayedLands.map((land) => (
              <PropertyCard
                key={land.id}
                land={land}
                onPress={() => requireAuth(() => router.push(`/property/${land.id}`))}
                isSaved={savedLandIds.includes(land.id)}
                onToggleSave={() => toggleSaveLand(land.id)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Advanced Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('explore.filterTitle')}</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Verification Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('explore.verifyStatus')}</Text>
              <TouchableOpacity
                style={[styles.checkboxRow, onlyVerified && styles.checkboxRowActive]}
                onPress={() => setOnlyVerified(!onlyVerified)}
              >
                <Ionicons
                  name={onlyVerified ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={onlyVerified ? COLORS.secondary : COLORS.textMuted}
                />
                <Text style={styles.checkboxLabel}>{t('explore.showVerified')}</Text>
              </TouchableOpacity>
            </View>

            {/* Region Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('explore.region')}</Text>
              <View style={styles.chipsWrap}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedRegion === 'all' && styles.filterChipSelected]}
                  onPress={() => setSelectedRegion('all')}
                >
                  <Text style={[styles.filterChipText, selectedRegion === 'all' && styles.filterChipTextSelected]}>
                    {t('explore.allRegions')}
                  </Text>
                </TouchableOpacity>
                {CAMEROON_REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.filterChip, selectedRegion === r.id && styles.filterChipSelected]}
                    onPress={() => setSelectedRegion(r.id)}
                  >
                    <Text style={[styles.filterChipText, selectedRegion === r.id && styles.filterChipTextSelected]}>
                      {r.name} ({r.capital})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Land Usage Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('explore.usage')}</Text>
              <View style={styles.chipsWrap}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedType === 'all' && styles.filterChipSelected]}
                  onPress={() => setSelectedType('all')}
                >
                  <Text style={[styles.filterChipText, selectedType === 'all' && styles.filterChipTextSelected]}>
                    {t('explore.allTypes')}
                  </Text>
                </TouchableOpacity>
                {LAND_TYPES.map((tItem) => (
                  <TouchableOpacity
                    key={tItem.value}
                    style={[styles.filterChip, selectedType === tItem.value && styles.filterChipSelected]}
                    onPress={() => setSelectedType(tItem.value)}
                  >
                    <Text style={[styles.filterChipText, selectedType === tItem.value && styles.filterChipTextSelected]}>
                      {tItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Cap Presets */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('explore.maxPrice')}</Text>
              <View style={styles.chipsWrap}>
                {[20000000, 50000000, 100000000].map((cap) => (
                  <TouchableOpacity
                    key={cap}
                    style={[styles.filterChip, maxPrice === cap && styles.filterChipSelected]}
                    onPress={() => setMaxPrice(maxPrice === cap ? undefined : cap)}
                  >
                    <Text style={[styles.filterChipText, maxPrice === cap && styles.filterChipTextSelected]}>
                      ≤ {(cap / 1000000).toFixed(0)} {t('explore.millionFCFA')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum Area Presets */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('explore.minArea')}</Text>
              <View style={styles.chipsWrap}>
                {[500, 1000, 2000].map((sqm) => (
                  <TouchableOpacity
                    key={sqm}
                    style={[styles.filterChip, minArea === sqm && styles.filterChipSelected]}
                    onPress={() => setMinArea(minArea === sqm ? undefined : sqm)}
                  >
                    <Text style={[styles.filterChipText, minArea === sqm && styles.filterChipTextSelected]}>
                      ≥ {sqm} m²
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <Button
              title={t('explore.reset')}
              onPress={handleResetFilters}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title={t('explore.applyFilters')}
              onPress={handleApplyFilters}
              variant="primary"
              size="md"
              style={{ flex: 2 }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...TYPOGRAPHY.micro,
    color: '#FFFFFF',
    fontSize: 9,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  resultsCountText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.round,
    padding: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.round,
  },
  viewToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  viewToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
  clearAllText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.secondary,
  },
  scrollList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxRowActive: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondary,
  },
  checkboxLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  filterChip: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
