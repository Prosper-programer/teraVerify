import { SafeAreaView } from 'react-native-safe-area-context';
// Cameroon Land Titling & Cadastral Due Diligence Guide Modal
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../common/Button';

interface CadastralGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onBookAdvisor?: () => void;
}

export const CadastralGuideModal: React.FC<CadastralGuideModalProps> = ({
  visible,
  onClose,
  onBookAdvisor,
}) => {
  const steps = [
    {
      num: '1',
      title: 'Vérification Préalable du Titre Foncier',
      badge: 'Obligatoire',
      desc: 'Toujours exiger le numéro de Titre Foncier et le Livre Foncier auprès de la conservation départementale (MINDCAF). Ne jamais verser d’acompte sans audit cadastral.',
      icon: 'shield-checkmark',
    },
    {
      num: '2',
      title: 'Plan de Bornage par Géomètre Agréé',
      badge: 'Technique',
      desc: 'Faire vérifier physiquement les bornes sur le terrain par un géomètre-expert inscrit à l’Ordre (OGEC) pour prévenir tout empiètement ou double immatriculation.',
      icon: 'compass',
    },
    {
      num: '3',
      title: 'Certificat de Propriété Récent (< 3 mois)',
      badge: 'Juridique',
      desc: 'Le certificat de propriété délivré par le conservateur foncier prouve que le terrain n’est grevé d’aucune hypothèque, saisie ou prénotation judiciaire.',
      icon: 'document-text',
    },
    {
      num: '4',
      title: 'Signature de l’Acte de Vente par Notaire',
      badge: 'Loi Camerounaise',
      desc: 'Au Cameroun, la vente d’un bien immobilier immatriculé doit obligatoirement être passée par acte notarié sous peine de nullité absolue.',
      icon: 'pencil',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Guide d'Achat Foncier</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🇨🇲 SÉCURITÉ FONCIÈRE</Text>
            </View>
            <Text style={styles.heroTitle}>Les 4 Règles d'Or pour Acheter un Terrain au Cameroun</Text>
            <Text style={styles.heroDesc}>
              Les étapes essentielles pour sécuriser votre achat et vérifier les titres de propriété.
            </Text>
          </View>

          {/* Steps */}
          {steps.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>{step.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepCategory}>{step.badge}</Text>
                </View>
                <Ionicons name={step.icon as any} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}

          {/* Legal Warning Notice */}
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.warning} style={{ marginRight: 8 }} />
            <Text style={styles.warningText}>
              Attention aux "abandons de droits coutumiers" non transformés en Titre Foncier. Seul le Titre Foncier confère la pleine propriété inattaquable.
            </Text>
          </View>

          {/* Consultation CTA */}
          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Besoin d'un Accompagnement Personnalisé ?</Text>
            <Text style={styles.ctaDesc}>
              Prenez rendez-vous avec un notaire ou un géomètre-expert agréé sur TerraVerify.
            </Text>
            {onBookAdvisor && (
              <Button
                title="Consulter un Notaire Partenaire"
                onPress={() => {
                  onClose();
                  onBookAdvisor();
                }}
                variant="primary"
                size="md"
                style={{ marginTop: SPACING.md }}
              />
            )}
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
  modalHeaderTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  heroBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  heroDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 1,
  },
  stepDesc: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 16,
  },
  ctaBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  ctaDesc: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
