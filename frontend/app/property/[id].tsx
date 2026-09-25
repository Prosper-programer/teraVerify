import { SafeAreaView } from 'react-native-safe-area-context';
// Land Details Screen (Pre-payment Protected vs Post-payment Unlocked)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { useLand } from '../../src/store/LandContext';
import { useAuth } from '../../src/store/AuthContext';
import { LandListing } from '../../src/types';
import { StatusBadge } from '../../src/components/common/StatusBadge';
import { LockedDetailsOverlay } from '../../src/components/property/LockedDetailsOverlay';
import { DocumentCard } from '../../src/components/property/DocumentCard';
import { formatFCFA, formatArea } from '../../src/constants/cameroonData';
import { Button } from '../../src/components/common/Button';
import { CadastralCertificateModal } from '../../src/components/property/CadastralCertificateModal';
import { useProtectedAction } from '../../src/utils/useProtectedAction';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLandById, isLandUnlocked, savedLandIds, toggleSaveLand } = useLand();
  const { currentUser } = useAuth();
  const { requireAuth } = useProtectedAction();

  const [land, setLand] = useState<LandListing | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [certModalVisible, setCertModalVisible] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const found = await getLandById(id);
      setLand(found);
      if (found) {
        const isUnl = await isLandUnlocked(found.id);
        setUnlocked(isUnl);
      }
    }
    loadData();
  }, [id, isLandUnlocked]);

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!land) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Property not found</Text>
        <Button title="Back to Explore" onPress={handleSafeBack} variant="primary" size="sm" />
      </SafeAreaView>
    );
  }

  const isSaved = savedLandIds.includes(land.id);
  const isSellerOwner = currentUser?.id === land.sellerId;
  const showFullDetails = unlocked || isSellerOwner;

  const handleCallSeller = () => {
    if (land.sellerContact?.phone) {
      Linking.openURL(`tel:${land.sellerContact.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (land.sellerContact?.phone) {
      const cleanPhone = land.sellerContact.phone.replace(/\D/g, '');
      const msg = `Hello, I saw your verified land listing (${land.landTitleNumber}) in ${land.neighborhood} on TerraVerify.`;
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`);
    }
  };

  const handleOpenMaps = () => {
    if (land.exactLocation?.coordinates) {
      const { latitude, longitude } = land.exactLocation.coordinates;
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    } else {
      Alert.alert('Location Landmark', land.exactLocation?.landmarkDescription || land.neighborhood);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gallery Image Carousel - Immersive */}
        <View style={styles.galleryContainer}>
          <Image
            source={{ uri: land.images[activeImageIndex] || land.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient Overlay for text readability at bottom of image */}
          <View style={styles.heroGradient} />

          {/* Top Floating Buttons */}
          <SafeAreaView style={styles.imageOverlayTop}>
            <TouchableOpacity
              style={styles.floatingRoundBtn}
              onPress={handleSafeBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingRoundBtn}
              onPress={() => toggleSaveLand(land.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={22}
                color={isSaved ? '#EF4444' : '#000000'}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Bottom Title overlaid on image */}
          <View style={styles.heroTextContainer}>
            <View style={styles.heroBadgeRow}>
              <StatusBadge status={land.verificationStatus} size="md" />
              <View style={styles.heroPriceBadge}>
                <Text style={styles.heroPriceText}>{formatFCFA(land.priceFCFA)}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>
              {showFullDetails ? land.title : land.title.replace(/\((LT|TF)[^)]+\)/i, '(***-PROTECTED)')}
            </Text>
            <View style={styles.heroLocationRow}>
              <Ionicons name="location" size={16} color="#FFFFFF" />
              <Text style={styles.heroLocationText}>
                {land.neighborhood}, {land.subdivision} • {land.region}
              </Text>
            </View>
          </View>
        </View>

        {/* Thumbnail Selector */}
        {land.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbsScroll}
            contentContainerStyle={styles.thumbsContent}
          >
            {land.images.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveImageIndex(i)}
                style={[styles.thumbWrapper, activeImageIndex === i && styles.thumbWrapperActive]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} />
                {activeImageIndex !== i && <View style={styles.thumbOverlay} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Body Content */}
        <View style={styles.body}>

          {/* Key Specs Grid - Premium Soft Cards */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <View style={[styles.specIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="resize-outline" size={18} color="#0284C7" />
              </View>
              <Text style={styles.specBoxValue}>{formatArea(land.areaSqM)}</Text>
              <Text style={styles.specBoxLabel}>Surface Area</Text>
            </View>

            <View style={styles.specBox}>
              <View style={[styles.specIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="document-text-outline" size={18} color="#059669" />
              </View>
              <Text style={styles.specBoxValue}>{showFullDetails ? land.landTitleNumber : 'TF-***-PROTECTED'}</Text>
              <Text style={styles.specBoxLabel}>Title Certificate</Text>
            </View>

            <View style={styles.specBox}>
              <View style={[styles.specIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="navigate-outline" size={18} color="#9333EA" />
              </View>
              <Text style={styles.specBoxValue}>{land.accessRoad.toUpperCase()}</Text>
              <Text style={styles.specBoxLabel}>Road Access</Text>
            </View>

            <View style={styles.specBox}>
              <View style={[styles.specIconCircle, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="layers-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.specBoxValue}>{land.topography.toUpperCase()}</Text>
              <Text style={styles.specBoxLabel}>Topography</Text>
            </View>
          </View>

          {/* Public Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Property Overview</Text>
            <Text style={styles.descriptionText}>{land.description}</Text>
          </View>

          {/* Cadastral Surveyor Audit Report - Premium Certificate Style */}
          {land.surveyorNotes && (
            <View style={styles.premiumAuditBox}>
              <View style={styles.auditStampWatermark}>
                <Ionicons name="ribbon" size={120} color="rgba(16, 185, 129, 0.05)" />
              </View>
              
              <View style={styles.auditHeaderRow}>
                <View style={styles.auditIconCircle}>
                  <Ionicons name="checkmark-done" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumAuditTitle}>Official Surveyor Audit</Text>
                  <Text style={styles.premiumAuditSubtitle}>Cadastral Verification Passed</Text>
                </View>
              </View>
              
              <View style={styles.auditDivider} />
              
              <Text style={styles.premiumAuditText}>"{land.surveyorNotes}"</Text>
              
              <View style={styles.auditSignRow}>
                <Ionicons name="pencil" size={14} color={COLORS.textMuted} />
                <Text style={styles.premiumAuditSign}>
                  Signed by Ing. Samuel Ewane
                </Text>
              </View>

              {/* View Official Certificate Button */}
              <TouchableOpacity
                style={styles.premiumViewCertBtn}
                onPress={() => setCertModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.premiumViewCertText}>View Digital Certificate</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* PROTECTED DETAILS OR UNLOCKED DETAILS */}
          {showFullDetails ? (
            /* UNLOCKED VIEW */
            <View style={styles.unlockedContainer}>
              <View style={styles.unlockedHeader}>
                <Ionicons name="lock-open" size={20} color={COLORS.success} />
                <Text style={styles.unlockedHeading}>Direct Seller & Dossier Unlocked</Text>
              </View>

              {/* Direct Seller Contact Card */}
              {land.sellerContact && (
                <View style={styles.contactCard}>
                  <Text style={styles.contactSub}>Registered Land Owner / Seller</Text>
                  <Text style={styles.contactName}>{land.sellerContact.name}</Text>
                  <Text style={styles.contactPhone}>{land.sellerContact.phone}</Text>

                  <View style={styles.contactActionRow}>
                    <TouchableOpacity style={styles.callBtn} onPress={handleCallSeller}>
                      <Ionicons name="call" size={16} color="#FFFFFF" />
                      <Text style={styles.callBtnText}>Call Directly</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
                      <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                      <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Exact Location & GPS Coordinates */}
              {land.exactLocation && (
                <View style={styles.locationCard}>
                  <Text style={styles.locationHeading}>Exact GPS Location & Street Landmark</Text>
                  <Text style={styles.locationAddress}>{land.exactLocation.streetAddress}</Text>
                  <Text style={styles.landmarkDesc}>{land.exactLocation.landmarkDescription}</Text>

                  <Button
                    title="Open in Google Maps"
                    onPress={handleOpenMaps}
                    variant="outline"
                    size="sm"
                    leftIcon={<Ionicons name="map-outline" size={16} color={COLORS.primary} />}
                    style={{ marginTop: SPACING.md }}
                  />
                </View>
              )}

              {/* Certified Documents List */}
              <View style={styles.documentsSection}>
                <Text style={styles.documentsHeading}>Official Title Dossier Scans</Text>
                {land.documents && land.documents.length > 0 ? (
                  land.documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isLocked={false}
                      onPress={() => router.push(`/documents/${doc.id}`)}
                    />
                  ))
                ) : (
                  <Text style={styles.noDocsText}>No digital scans attached to this listing.</Text>
                )}
              </View>
            </View>
          ) : (
            /* PRE-PAYMENT LOCKED VIEW */
            <LockedDetailsOverlay
              unlockFeeFCFA={land.unlockFeeFCFA}
              onUnlockPress={() => requireAuth(() => router.push(`/payment/${land.id}`))}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar for Unlocked / Buy actions */}
      <SafeAreaView style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarPriceLabel}>Price</Text>
          <Text style={styles.bottomBarPrice}>{formatFCFA(land.priceFCFA)}</Text>
        </View>

        {showFullDetails ? (
          <Button
            title="Contact Seller"
            onPress={handleCallSeller}
            variant="primary"
            size="md"
            leftIcon={<Ionicons name="call" size={16} color="#FFFFFF" />}
          />
        ) : (
          <Button
            title={`Unlock Details (${formatFCFA(land.unlockFeeFCFA)})`}
            onPress={() => requireAuth(() => router.push(`/payment/${land.id}`))}
            variant="secondary"
            size="md"
            leftIcon={<Ionicons name="lock-open-outline" size={16} color="#FFFFFF" />}
          />
        )}
      </SafeAreaView>

      {/* Cadastral Certificate Modal */}
      <CadastralCertificateModal
        visible={certModalVisible}
        onClose={() => setCertModalVisible(false)}
        land={land}
        isUnlocked={showFullDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  notFoundText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  galleryContainer: {
    width: '100%',
    height: width, // Full square for immersive feel
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // In a real app, you'd use expo-linear-gradient, but an overlay works here
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingRoundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    zIndex: 5,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  heroPriceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
  },
  heroPriceText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  heroTitle: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    ...TYPOGRAPHY.captionMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
  },
  thumbsScroll: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
  },
  thumbsContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  thumbWrapper: {
    width: 64,
    height: 48,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbWrapperActive: {
    borderColor: COLORS.secondary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  body: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  specBox: {
    width: (width - SPACING.xl * 2 - SPACING.sm) / 2,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  specIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  specBoxValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  specBoxLabel: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  premiumAuditBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1.5,
    borderColor: '#10B981', // Success green border
    position: 'relative',
    overflow: 'hidden',
  },
  auditStampWatermark: {
    position: 'absolute',
    top: -20,
    right: -20,
    transform: [{ rotate: '-15deg' }],
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  auditIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5', // Light green
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  premiumAuditTitle: {
    ...TYPOGRAPHY.h3,
    color: '#065F46', // Dark green
  },
  premiumAuditSubtitle: {
    ...TYPOGRAPHY.captionBold,
    color: '#10B981',
  },
  auditDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  premiumAuditText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  auditSignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  premiumAuditSign: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  premiumViewCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  premiumViewCertText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
  },
  unlockedContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.successBorder,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  unlockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  unlockedHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.success,
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactSub: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
  },
  contactName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginTop: 2,
  },
  contactPhone: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  contactActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  callBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: '#FFFFFF',
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  whatsappBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: '#FFFFFF',
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationHeading: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  locationAddress: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.secondary,
  },
  landmarkDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  documentsSection: {
    marginTop: SPACING.sm,
  },
  documentsHeading: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  noDocsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg, // slightly taller
    ...SHADOWS.lg,
  },
  bottomBarPriceLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bottomBarPrice: {
    ...TYPOGRAPHY.h2,
    color: '#0F172A',
  },
});
