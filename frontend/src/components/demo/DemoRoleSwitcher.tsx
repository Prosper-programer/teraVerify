import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// Defense Presentation Role Switcher (Non-intrusive demo utility)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { UserRole } from '../../types';

export const DemoRoleSwitcher: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { role, currentUser, switchDemoRole } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const rolesList: {
    role: UserRole;
    title: string;
    userName: string;
    icon: keyof typeof Ionicons.glyphMap;
    badgeColor: string;
    description: string;
  }[] = [
    {
      role: 'visitor',
      title: 'Visitor / Logged Out',
      userName: 'Unauthenticated Guest',
      icon: 'person-outline',
      badgeColor: COLORS.textMuted,
      description: 'First-time user view: browse public lands, login required to unlock seller details.',
    },
    {
      role: 'buyer',
      title: 'Buyer Experience',
      userName: 'Prosper Kamga',
      icon: 'cart-outline',
      badgeColor: COLORS.info,
      description: 'Explore verified lands, pay access fee, unlock seller contacts & deed docs.',
    },
    {
      role: 'seller',
      title: 'Seller Experience',
      userName: 'Paul Njoya',
      icon: 'business-outline',
      badgeColor: COLORS.success,
      description: 'Submit land titles, track 48-hour manual verification, manage listings.',
    },
    {
      role: 'surveyor',
      title: 'Land Surveyor',
      userName: 'Ing. Samuel Ewane',
      icon: 'compass-outline',
      badgeColor: COLORS.accent,
      description: 'Review land deed scans, audit boundaries, and Approve or Reject.',
    },
    {
      role: 'advisor',
      title: 'Professional Advisor',
      userName: 'Me. Christiane Manga',
      icon: 'shield-outline',
      badgeColor: '#7C3AED',
      description: 'Provide legal guidance on land purchases & manage client bookings.',
    },
    {
      role: 'admin',
      title: 'Administrator',
      userName: 'Henri Nkweti',
      icon: 'settings-outline',
      badgeColor: COLORS.primary,
      description: 'System overview, user management, account activation & security controls.',
    },
  ];

  const handleSelectRole = async (targetRole: UserRole) => {
    setModalVisible(false);
    await switchDemoRole(targetRole);
    if (targetRole === 'visitor') {
      router.replace('/(auth)/welcome');
    } else {
      router.replace('/(tabs)');
    }
  };

  const currentRoleConfig = rolesList.find((r) => r.role === role) || rolesList[0];

  return (
    <>
      {/* Floating Compact Bar for Presentation */}
      {minimized ? (
        <View style={[styles.floatingContainerMinimized, { top: Math.max(insets.top + 6, 36) }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.minimizedPill}
            onPress={() => setMinimized(false)}
          >
            <Text style={{ fontSize: 13 }}>🎭</Text>
            <View style={[styles.roleIndicatorDot, { backgroundColor: currentRoleConfig.badgeColor, marginLeft: 4 }]} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.floatingContainer, { top: Math.max(insets.top + 6, 36) }]}>
          <View style={styles.pillRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.pillButton}
              onPress={() => setModalVisible(true)}
            >
              <View style={[styles.roleIndicatorDot, { backgroundColor: currentRoleConfig.badgeColor }]} />
              <Text style={styles.pillText}>
                Demo: <Text style={styles.pillBoldText}>{currentRoleConfig.title}</Text>
              </Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closePillBtn}
              onPress={() => setMinimized(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={13} color="rgba(255, 255, 255, 0.75)" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Role Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.sheetContent}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Defense Presentation Role Switcher</Text>
                <Text style={styles.sheetSubtitle}>
                  Current User: <Text style={{ fontWeight: '700', color: COLORS.primary }}>{currentUser?.fullName}</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={26} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* List of Actors */}
            <View style={styles.rolesList}>
              {rolesList.map((item) => {
                const isSelected = item.role === role;
                return (
                  <TouchableOpacity
                    key={item.role}
                    activeOpacity={0.7}
                    style={[styles.roleCard, isSelected && styles.roleCardActive]}
                    onPress={() => handleSelectRole(item.role)}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: `${item.badgeColor}15` }]}>
                      <Ionicons name={item.icon} size={22} color={item.badgeColor} />
                    </View>
                    <View style={styles.roleTextCol}>
                      <View style={styles.roleTitleRow}>
                        <Text style={styles.roleTitle}>{item.title}</Text>
                        {isSelected && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.userName}>{item.userName}</Text>
                      <Text style={styles.roleDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingContainerMinimized: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 999,
  },
  minimizedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...SHADOWS.md,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...SHADOWS.md,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
  },
  closePillBtn: {
    paddingVertical: 6,
    paddingRight: 10,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
  },
  roleIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    color: '#E2E8F0',
  },
  pillBoldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sheetTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  sheetSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rolesList: {
    gap: SPACING.sm,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  activePill: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.round,
  },
  activePillText: {
    ...TYPOGRAPHY.micro,
    color: '#FFFFFF',
  },
  userName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.secondary,
    marginTop: 1,
    marginBottom: 2,
  },
  roleDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
