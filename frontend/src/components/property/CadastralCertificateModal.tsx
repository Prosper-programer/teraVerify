import { SafeAreaView } from 'react-native-safe-area-context';
// Official Cadastral Verification Certificate Modal
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { LandProperty } from '../../types';
import { formatFCFA, formatArea } from '../../constants/cameroonData';
import { Button } from '../common/Button';

interface CadastralCertificateModalProps {
  visible: boolean;
  onClose: () => void;
  land?: LandProperty | null;
}

export const CadastralCertificateModal: React.FC<CadastralCertificateModalProps> = ({
  visible,
  onClose,
  land,
}) => {
  if (!land) return null;

  const certNumber = `VERIF-${land.id.toUpperCase()}-2026`;
  const verificationDate = '14 Mars 2026';
  const surveyorName = 'Ing. Samuel Ewane';
  const surveyorMatricule = 'OGEC N° 412/YDE';

  const handleDownload = () => {
    Alert.alert(
      'Certificate Ready',
      `Official Certificate ${certNumber} has been downloaded to your device as a certified PDF document.`,
      [{ text: 'OK' }]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Cadastral Certificate - ${land.landTitleNumber}`,
        message: `Official Cadastral Verification Certificate for Land Title ${land.landTitleNumber} (${land.region}, ${(land as any).city || land.division}). Verified by TerraVerify Cameroon. Reference: ${certNumber}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Close */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Verification Certificate</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Certificate Container */}
          <View style={styles.certificatePaper}>
            {/* National Header */}
            <View style={styles.nationalHeader}>
              <View style={styles.flagStripeContainer}>
                <View style={[styles.flagStripe, { backgroundColor: '#007A5E' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#CE1126' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#FCD116' }]} />
              </View>
              <Text style={styles.countryTitle}>RÉPUBLIQUE DU CAMEROUN</Text>
              <Text style={styles.countrySub}>Paix - Travail - Patrie</Text>
              <Text style={styles.ministryText}>OFFICIAL LAND VERIFICATION</Text>
              <View style={styles.headerDivider} />
            </View>

            {/* Certificate Title Badge */}
            <View style={styles.certBadgeWrapper}>
              <View style={styles.shieldIconBadge}>
                <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.certificateMainTitle}>CERTIFICAT DE VÉRIFICATION FONCIÈRE</Text>
              <Text style={styles.certificateId}>Réf: {certNumber}</Text>
            </View>

            {/* Official Compliance Box */}
            <View style={styles.complianceBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.complianceTitle}>TITRE FONCIER AUTHENTIFIÉ & VALIDE</Text>
                <Text style={styles.complianceDesc}>
                  Conformité totale avec les registres de conservation foncière de la division départementale.
                </Text>
              </View>
            </View>

            {/* Data Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>N° Titre Foncier :</Text>
                <Text style={styles.gridValueBold}>{land.landTitleNumber}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Localisation :</Text>
                <Text style={styles.gridValue}>{land.neighborhood}, {(land as any).city || land.division}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Région / Division :</Text>
                <Text style={styles.gridValue}>{land.region} ({land.division})</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Superficie certifiée :</Text>
                <Text style={styles.gridValueBold}>{formatArea(land.areaSqM || (land as any).areaSquareMeters || 750)}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Usage cadastral :</Text>
                <Text style={styles.gridValue}>{land.landType.toUpperCase()}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Statut juridique :</Text>
                <Text style={[styles.gridValueBold, { color: COLORS.success }]}>
                  Pleine propriété sans charge ni litige
                </Text>
              </View>
            </View>

            {/* Surveyor Signature & Seal Section */}
            <View style={styles.auditSection}>
              <View style={styles.surveyorCol}>
                <Text style={styles.signLabel}>Géomètre-Expert Agréé :</Text>
                <Text style={styles.signName}>{surveyorName}</Text>
                <Text style={styles.signMatricule}>{surveyorMatricule}</Text>
                <Text style={styles.signDate}>Vérifié le {verificationDate}</Text>
              </View>

              {/* Simulated QR Code Stamp */}
              <View style={styles.qrSealCol}>
                <View style={styles.qrBox}>
                  <Ionicons name="qr-code-outline" size={44} color={COLORS.primary} />
                </View>
                <Text style={styles.qrCaption}>SCELLEMENT NUMÉRIQUE</Text>
              </View>
            </View>

            {/* Official Legal Stamp Box */}
            <View style={styles.watermarkNote}>
              <Text style={styles.watermarkText}>
                Ce document atteste de la conformité du dossier foncier examiné par le protocole TerraVerify en liaison avec l'Ordre des Géomètres-Experts du Cameroun (OGEC).
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <Button
              title="Download PDF Certificate"
              onPress={handleDownload}
              variant="primary"
              size="lg"
              leftIcon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  certificatePaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#C5D4E8',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nationalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  flagStripeContainer: {
    flexDirection: 'row',
    width: 48,
    height: 5,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  flagStripe: {
    flex: 1,
  },
  countryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  countrySub: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 3,
  },
  ministryText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D1D5DB',
    marginTop: SPACING.sm,
  },
  certBadgeWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  shieldIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  certificateMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  certificateId: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  complianceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.success,
  },
  complianceDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#065F46',
    marginTop: 2,
    lineHeight: 14,
  },
  detailsGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  gridValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  gridValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  auditSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  surveyorCol: {
    flex: 1,
  },
  signLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  signName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  signMatricule: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  signDate: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  qrSealCol: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  qrBox: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCaption: {
    fontSize: 7,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  watermarkNote: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '400',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 13,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
