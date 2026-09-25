// Buyer & Visitor Home Screen Component
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { useLand } from '../../store/LandContext';
import { useNotifications } from '../../store/NotificationContext';
import { useLanguage } from '../../store/LanguageContext';
import { PropertyCard } from '../property/PropertyCard';
import { Button } from '../common/Button';
import { CadastralGuideModal } from '../property/CadastralGuideModal';
import { CadastralCertificateModal } from '../property/CadastralCertificateModal';
import { LandProperty } from '../../types';
import { useProtectedAction } from '../../utils/useProtectedAction';
import { useSocket } from '../../store/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BuyerHome: React.FC = () => {
  const router = useRouter();
  const { currentUser, role } = useAuth();
  const { lands, isLoading, refreshLands, savedLandIds, toggleSaveLand } = useLand();
  const { unreadCount } = useNotifications();
  const { language, toggleLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const { requireAuth } = useProtectedAction();

  const { socket } = useSocket();
  React.useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => refreshLands();
    
    socket.on('land_created', handleUpdate);
    socket.on('land_updated', handleUpdate);

    return () => {
      socket.off('land_created', handleUpdate);
      socket.off('land_updated', handleUpdate);
    };
  }, [socket, refreshLands]);

  const handleToggleSave = (landId: string) => {
    toggleSaveLand(landId);
  };

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [selectedCertLand, setSelectedCertLand] = useState<LandProperty | null>(null);

  const regions = [
    { id: 'all', label: t('region.all') },
    { id: 'centre', label: 'Centre (Yaoundé)' },
    { id: 'littoral', label: 'Littoral (Douala)' },
    { id: 'sud', label: 'Sud (Kribi)' },
    { id: 'sud-ouest', label: 'Sud-Ouest (Limbe)' },
  ];

  const filteredLands = lands.filter((l) => {
    if (selectedRegion !== 'all' && l.region.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q) ||
        l.landTitleNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayLands = filteredLands.slice(0, 4);

  const greetingName = currentUser ? currentUser.fullName.split(' ')[0] : t('header.visitor');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top + 10, 40) }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshLands} />}
    >
      {/* Top Brand & Navigation Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.headerLogoBadge}>
            <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleWithFlag}>
              <Text style={styles.headerBrandTitle}>TerraVerify</Text>
              <Text style={styles.flagIcon}>🇨🇲</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {currentUser ? `${t('header.hello')}, ${greetingName}` : t('header.subtitle')}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Language Toggle with Flag Icons */}
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

          {/* Notification Icon with Badge */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => requireAuth(() => router.push('/(tabs)/notifications'))}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadgeDot}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Icon / Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => {
              if (currentUser) {
                router.push('/(tabs)/profile');
              } else {
                router.push('/(auth)/welcome');
              }
            }}
            activeOpacity={0.8}
          >
            {currentUser?.avatarUrl ? (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.profileOnlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.placeholder')}
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>



      {/* Land Title Verification Card */}
      <View style={styles.reportingCard}>
        <View style={styles.reportingTop}>
          <View style={styles.reportingIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportingTitle}>Verified Land Titles</Text>
            <Text style={styles.reportingSubtitle}>
              Every parcel is checked and authenticated by certified land surveyors
            </Text>
          </View>
        </View>

        {/* Live Reporting Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Authentic</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>48h</Text>
            <Text style={styles.statLabel}>Fast Check</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0%</Text>
            <Text style={styles.statLabel}>Zero Fraud</Text>
          </View>
        </View>

        {/* Action Button inside Reporting Box */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.verifyActionBtn}
          onPress={() => requireAuth(() => router.push('/property/verify-title'))}
        >
          <Ionicons name="search" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.verifyActionText}>Check a Title Number</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid: 4 Core Workflows */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => requireAuth(() => router.push('/property/verify-title'))}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: '#E8F0FE' }]}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.quickCardTitle}>{t('quick.verify')}</Text>
          <Text style={styles.quickCardSub}>{t('quick.verifySub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/advisors')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="people" size={22} color="#7C3AED" />
          </View>
          <Text style={styles.quickCardTitle}>{t('quick.advisor')}</Text>
          <Text style={styles.quickCardSub}>{t('quick.advisorSub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => requireAuth(() => router.push('/seller/submit'))}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="add-circle" size={22} color={COLORS.success} />
          </View>
          <Text style={styles.quickCardTitle}>{t('quick.sell')}</Text>
          <Text style={styles.quickCardSub}>{t('quick.sellSub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => setGuideModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconCircle, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="book" size={22} color="#D97706" />
          </View>
          <Text style={styles.quickCardTitle}>{t('quick.guide')}</Text>
          <Text style={styles.quickCardSub}>{t('quick.guideSub')}</Text>
        </TouchableOpacity>
      </View>

      {/* Seamless Join Community Section - Organic Design */}
      {!currentUser && (
        <View style={styles.communitySection}>
          <View style={styles.communityImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80' }} // Cadastral documents / Blueprint
              style={styles.communityImage}
              resizeMode="cover"
            />
            <View style={styles.communityImageOverlay} />
            <View style={styles.communityImageTextContainer}>
              <Text style={styles.communityImageTitle}>{t('community.title')}</Text>
              <Text style={styles.communityImageDesc}>{t('community.desc')}</Text>
            </View>
          </View>
          
          <View style={styles.communityActionsWrapper}>
            <Text style={styles.communityActionHeader}>{t('community.actionHeader')}</Text>
            
            <TouchableOpacity style={styles.communityActionCard} onPress={() => router.push({ pathname: '/(auth)/register', params: { defaultRole: 'buyer' } })} activeOpacity={0.7}>
              <View style={[styles.communityActionIcon, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="search" size={22} color="#0284C7" />
              </View>
              <View style={styles.communityActionTextCol}>
                <Text style={styles.communityActionTitle}>{t('community.buyTitle')}</Text>
                <Text style={styles.communityActionSub}>{t('community.buySub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.communityActionCard} onPress={() => router.push({ pathname: '/(auth)/register', params: { defaultRole: 'seller' } })} activeOpacity={0.7}>
              <View style={[styles.communityActionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="map" size={22} color="#059669" />
              </View>
              <View style={styles.communityActionTextCol}>
                <Text style={styles.communityActionTitle}>{t('community.sellTitle')}</Text>
                <Text style={styles.communityActionSub}>{t('community.sellSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.communityActionCard} onPress={() => router.push({ pathname: '/(auth)/register', params: { defaultRole: 'advisor' } })} activeOpacity={0.7}>
              <View style={[styles.communityActionIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="document-text" size={22} color="#7C3AED" />
              </View>
              <View style={styles.communityActionTextCol}>
                <Text style={styles.communityActionTitle}>{t('community.adviseTitle')}</Text>
                <Text style={styles.communityActionSub}>{t('community.adviseSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Region Filter Chips */}
      <View style={styles.regionsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsScroll}>
          {regions.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <TouchableOpacity
                key={reg.id}
                style={[styles.regionChip, isSelected && styles.regionChipActive]}
                onPress={() => setSelectedRegion(reg.id)}
              >
                <Text style={[styles.regionText, isSelected && styles.regionTextActive]}>
                  {reg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Featured Verified Lands Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t('section.featured')}</Text>
          <Text style={styles.sectionSubtitle}>{t('section.featuredSub')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.seeAllText}>{t('section.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {displayLands.map((land) => (
        <PropertyCard
          key={land.id}
          land={land}
          onPress={() => requireAuth(() => router.push(`/property/${land.id}`))}
          isSaved={savedLandIds.includes(land.id)}
          onToggleSave={() => handleToggleSave(land.id)}
        />
      ))}

      {/* Need Professional Guidance Banner */}
      <View style={styles.advisorBanner}>
        <View style={styles.advisorBannerContent}>
          <View style={styles.advisorBadgeRow}>
            <Ionicons name="shield-checkmark" size={16} color="#93C5FD" style={{ marginRight: 6 }} />
            <Text style={styles.advisorBadgeText}>CERTIFIED LEGAL ASSISTANCE</Text>
          </View>
          <Text style={styles.advisorBannerTitle}>Need Help With Land Titling Procedures?</Text>
          <Text style={styles.advisorBannerDesc}>
            Book a private consultation with licensed notaries and cadastral engineers to secure your investment and review title documents.
          </Text>
          <TouchableOpacity
            style={styles.advisorBtn}
            onPress={() => router.push('/(tabs)/advisors')}
            activeOpacity={0.88}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.advisorBtnText}>Book Advisor Consultation</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cadastral Due Diligence Guide Modal */}
      <CadastralGuideModal
        visible={guideModalVisible}
        onClose={() => setGuideModalVisible(false)}
        onBookAdvisor={() => router.push('/(tabs)/advisors')}
      />

      {/* Official Cadastral Verification Certificate Modal */}
      <CadastralCertificateModal
        visible={certModalVisible}
        onClose={() => {
          setCertModalVisible(false);
          setSelectedCertLand(null);
        }}
        land={selectedCertLand}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.lg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.subtle,
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  quickCardSub: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  titleWithFlag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  flagIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    ...SHADOWS.subtle,
  },
  notifBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'relative',
    ...SHADOWS.subtle,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#D0D7DE',
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  reportingCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reportingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reportingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  reportingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  reportingSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  verifyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  verifyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  regionsRow: {
    marginBottom: SPACING.lg,
  },
  regionsScroll: {
    gap: SPACING.xs + 2,
  },
  regionChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regionText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },
  regionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.secondary,
  },
  advisorBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginVertical: SPACING.lg,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  advisorBannerContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  advisorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  advisorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E0E7FF',
    letterSpacing: 0.6,
  },
  advisorBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 23,
  },
  advisorBannerDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#E0E7FF', // Crisp bright readable text on deep blue!
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  advisorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Solid pure white button
    paddingVertical: 11,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  advisorBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary, // Dark royal blue on white
  },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.md,
  },
  communityImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: COLORS.primaryDark,
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  communityImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Darken for text readability
  },
  communityImageTextContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  communityImageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  communityImageDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  communityActionsWrapper: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  communityActionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  communityActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  communityActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  communityActionTextCol: {
    flex: 1,
  },
  communityActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  communityActionSub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});
