import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { useLand } from '../../store/LandContext';
import { useVerification } from '../../store/VerificationContext';
import { UserRole } from '../../types';
import { formatFCFA } from '../../constants/cameroonData';

export const AdminHome: React.FC = () => {
  const router = useRouter();
  const { currentUser, allUsers, toggleUserStatus, refreshUsers, isLoading } = useAuth();
  const { lands, refreshLands } = useLand();
  const { requests, refreshRequests } = useVerification();

  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'verifications'>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefreshAll = async () => {
    await Promise.all([refreshUsers(), refreshLands(), refreshRequests()]);
  };

  const counts = useMemo(() => ({
    all: allUsers.length,
    buyer: allUsers.filter((u) => u.role === 'buyer').length,
    seller: allUsers.filter((u) => u.role === 'seller').length,
    surveyor: allUsers.filter((u) => u.role === 'surveyor').length,
    advisor: allUsers.filter((u) => u.role === 'advisor').length,
    verifiedPlots: lands.filter((l) => l.verificationStatus === 'verified').length,
    pendingVerifs: requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length,
  }), [allUsers, lands, requests]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);
      return matchRole && matchQuery;
    });
  }, [allUsers, roleFilter, searchQuery]);

  const handleToggle = (userId: string, currentStatus: string, name: string) => {
    const isSuspending = currentStatus === 'active';
    Alert.alert(
      isSuspending ? 'Suspend User Access' : 'Reactivate User Account',
      `Are you sure you want to ${isSuspending ? 'temporarily suspend' : 'reactivate access for'} ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSuspending ? 'Suspend' : 'Reactivate',
          style: isSuspending ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await toggleUserStatus(userId);
            } catch (err: any) {
              Alert.alert('Notice', err.message || 'Operation failed.');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'seller':
        return { bg: '#E8F5E9', color: '#1B5E20', label: 'SELLER' };
      case 'surveyor':
        return { bg: '#FFF8E1', color: '#B78103', label: 'SURVEYOR' };
      case 'advisor':
        return { bg: '#F3E8FF', color: '#6B21A8', label: 'ADVISOR' };
      case 'admin':
        return { bg: '#EFF6FF', color: '#1D4ED8', label: 'ADMIN' };
      case 'buyer':
      default:
        return { bg: '#E0F2FE', color: '#0369A1', label: 'BUYER' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefreshAll} />}
    >
      {/* Humanized Clean Welcome Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Welcome, {currentUser?.fullName?.split(' ')[0] || 'Admin'}</Text>
          <Text style={styles.headerSubtitle}>Manage user accounts and oversee land plots</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {currentUser?.avatarUrl ? (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Humanized Metrics Overview Cards */}
      <View style={[styles.statsRow, { flexWrap: 'wrap' }]}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primary, width: '48%', marginBottom: SPACING.sm }]}>
          <View style={styles.statIconWrap}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statNumber}>{counts.all}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#6366f1', width: '48%', marginBottom: SPACING.sm }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#e0e7ff' }]}>
            <Ionicons name="map" size={18} color="#4f46e5" />
          </View>
          <Text style={styles.statNumber}>{lands.length}</Text>
          <Text style={styles.statLabel}>Total Lands</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#F59E0B', width: '48%' }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={18} color="#D97706" />
          </View>
          <Text style={styles.statNumber}>{counts.pendingVerifs}</Text>
          <Text style={styles.statLabel}>Pending Verifications</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: COLORS.success, width: '48%' }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.statNumber}>{counts.verifiedPlots}</Text>
          <Text style={styles.statLabel}>Verified Lands</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#ec4899', width: '100%', marginTop: SPACING.sm }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="cash" size={18} color="#db2777" />
          </View>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Basic Payment Count</Text>
        </View>
      </View>

      {/* Interactive Navigation Switcher */}
      <View style={styles.navTabsRow}>
        <TouchableOpacity
          style={[styles.navTabBtn, activeTab === 'users' && styles.navTabBtnActive]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={activeTab === 'users' ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text style={[styles.navTabText, activeTab === 'users' && styles.navTabTextActive]}>
            User Directory ({counts.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTabBtn, activeTab === 'listings' && styles.navTabBtnActive]}
          onPress={() => setActiveTab('listings')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="map-outline"
            size={16}
            color={activeTab === 'listings' ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text style={[styles.navTabText, activeTab === 'listings' && styles.navTabTextActive]}>
            Land Plots ({lands.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTabBtn, activeTab === 'verifications' && styles.navTabBtnActive]}
          onPress={() => setActiveTab('verifications')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={activeTab === 'verifications' ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text style={[styles.navTabText, activeTab === 'verifications' && styles.navTabTextActive]}>
            Verifications
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <>
          {/* Quick Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or phone..."
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

          {/* Role Filter Chips */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { id: 'all', label: `All (${counts.all})` },
                { id: 'buyer', label: `Buyers (${counts.buyer})` },
                { id: 'seller', label: `Sellers (${counts.seller})` },
                { id: 'surveyor', label: `Surveyors (${counts.surveyor})` },
                { id: 'advisor', label: `Advisors (${counts.advisor})` },
              ].map((tab) => {
                const isSelected = roleFilter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    onPress={() => setRoleFilter(tab.id as any)}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* User Cards List */}
          <View style={styles.userList}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="search" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySub}>Try searching with a different name or role filter.</Text>
              </View>
            ) : (
              filteredUsers.map((user) => {
                const isSuspended = user.status === 'suspended';
                const badge = getRoleBadgeStyle(user.role);
                return (
                  <View key={user.id} style={styles.userCard}>
                    <View style={styles.userCardMain}>
                      <View style={[styles.userAvatar, isSuspended && styles.userAvatarSuspended]}>
                        <Text style={styles.userAvatarText}>{user.fullName ? user.fullName[0].toUpperCase() : 'U'}</Text>
                      </View>

                      <View style={styles.userTextCol}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userNameText} numberOfLines={1}>{user.fullName}</Text>
                          <View style={[styles.roleBadgeBox, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.label}</Text>
                          </View>
                        </View>
                        <Text style={styles.userSubText} numberOfLines={1}>
                          {user.phone || 'No phone'} • {user.email}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom Status & Quick Toggle */}
                    <View style={styles.userBottomRow}>
                      <View style={styles.accountStatus}>
                        <View style={[styles.statusDot, { backgroundColor: isSuspended ? COLORS.error : COLORS.success }]} />
                        <Text style={[styles.accountStatusText, { color: isSuspended ? COLORS.error : '#15803D' }]}>
                          {isSuspended ? 'Account Suspended' : 'Active Account'}
                        </Text>
                      </View>

                      {user.role !== 'admin' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}
                            onPress={() => Alert.alert('Change Role', 'Select new role for ' + user.fullName, [
                              { text: 'Buyer', onPress: () => Alert.alert('Notice', 'Role update pending backend integration.') },
                              { text: 'Seller', onPress: () => Alert.alert('Notice', 'Role update pending backend integration.') },
                              { text: 'Surveyor', onPress: () => Alert.alert('Notice', 'Role update pending backend integration.') },
                              { text: 'Cancel', style: 'cancel' }
                            ])}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="options-outline" size={14} color={COLORS.primary} />
                            <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Role</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, isSuspended ? styles.btnActivate : styles.btnSuspend]}
                            onPress={() => handleToggle(user.id, user.status, user.fullName)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isSuspended ? 'checkmark-circle' : 'pause-circle-outline'}
                              size={14}
                              color={isSuspended ? '#15803D' : '#DC2626'}
                            />
                            <Text style={[styles.actionBtnText, { color: isSuspended ? '#15803D' : '#DC2626' }]}>
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}

      {/* TAB 2: LAND PLOTS DIRECTORY */}
      {activeTab === 'listings' && (
        <View style={styles.landListSection}>
          {lands.map((land) => {
            const isVerified = land.verificationStatus === 'verified';
            return (
              <TouchableOpacity
                key={land.id}
                style={styles.landRowCard}
                onPress={() => router.push(`/property/${land.id}`)}
                activeOpacity={0.88}
              >
                <Image
                  source={{ uri: land.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' }}
                  style={styles.landThumb}
                  resizeMode="cover"
                />
                <View style={styles.landInfoCol}>
                  <View style={styles.landTitleRow}>
                    <Text style={styles.landTitleText} numberOfLines={1}>{land.title}</Text>
                    <View style={[styles.verifiedPill, { backgroundColor: isVerified ? '#DCFCE7' : '#FEF3C7' }]}>
                      <Text style={[styles.verifiedPillText, { color: isVerified ? '#15803D' : '#B45309' }]}>
                        {isVerified ? 'VERIFIED' : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.landMetaText}>{land.region} • {land.areaSqM} m² • {land.landTitleNumber}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={styles.landPriceText}>{formatFCFA(land.priceFCFA)}</Text>
                    <TouchableOpacity
                      style={{ padding: 6, backgroundColor: '#FEE2E2', borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        Alert.alert(
                          'Remove Listing',
                          'Are you sure you want to permanently remove this problematic listing? This action cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => Alert.alert('Notice', 'Listing removed successfully (Pending backend deletion).') }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={14} color="#DC2626" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#DC2626' }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* TAB 3: VERIFICATIONS MONITORING */}
      {activeTab === 'verifications' && (
        <View style={styles.landListSection}>
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.h3, color: COLORS.primary }}>Cadastral Requests Log</Text>
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary }}>Monitor Surveyor activities and manual verifications.</Text>
          </View>
          
          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="documents-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No verification requests</Text>
            </View>
          ) : (
            requests.map((req) => {
              const statusColors = {
                submitted: { bg: '#FEF3C7', text: '#B45309', label: 'PENDING' },
                under_review: { bg: '#DBEAFE', text: '#1D4ED8', label: 'UNDER REVIEW' },
                approved: { bg: '#DCFCE7', text: '#15803D', label: 'VERIFIED' },
                rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'REJECTED' },
              };
              const style = statusColors[req.status] || statusColors.submitted;

              return (
                <View key={req.id} style={[styles.landRowCard, { paddingVertical: SPACING.md }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ ...TYPOGRAPHY.bodyBold, color: COLORS.primary }}>{req.landTitleNumber}</Text>
                      <View style={[styles.verifiedPill, { backgroundColor: style.bg }]}>
                        <Text style={[styles.verifiedPillText, { color: style.text }]}>{style.label}</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Ionicons name="person-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                      <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary }}>Seller: {req.sellerName}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="compass-outline" size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
                      <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.textPrimary }}>
                        Surveyor: {req.surveyorId ? `Assigned (${req.surveyorId.substring(0, 8)})` : 'Pending Assignment'}
                      </Text>
                    </View>

                    {req.surveyorNotes && (
                      <View style={{ marginTop: 8, padding: 8, backgroundColor: '#F8FAFC', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <Text style={{ ...TYPOGRAPHY.micro, color: COLORS.textMuted, marginBottom: 2 }}>Surveyor Notes:</Text>
                        <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.textPrimary }}>{req.surveyorNotes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },

  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: '#0F172A',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.subtle,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarImg: {
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    ...SHADOWS.subtle,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.micro,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  navTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  navTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  navTabBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  navTabText: {
    ...TYPOGRAPHY.captionMedium,
    color: '#64748B',
    fontWeight: '600',
  },
  navTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm + 2,
    ...SHADOWS.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
  },
  filterRow: {
    marginBottom: SPACING.md,
  },
  filterScroll: {
    gap: SPACING.xs + 2,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.captionMedium,
    color: '#64748B',
    fontSize: 11,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userList: {
    gap: SPACING.sm + 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: '#334155',
    marginTop: 8,
  },
  emptySub: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    ...SHADOWS.subtle,
  },
  userCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userAvatarSuspended: {
    backgroundColor: '#94A3B8',
  },
  userAvatarText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
  },
  userTextCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userNameText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  roleBadgeBox: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
  },
  roleBadgeText: {
    ...TYPOGRAPHY.micro,
    fontSize: 9,
    fontWeight: '700',
  },
  userSubText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
  },
  userBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs + 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  accountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountStatusText: {
    ...TYPOGRAPHY.captionMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  btnActivate: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  btnSuspend: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    ...TYPOGRAPHY.micro,
    fontWeight: '700',
  },
  landListSection: {
    gap: SPACING.sm + 2,
  },
  landRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.sm + 2,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  landThumb: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  landInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  landTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  landTitleText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  verifiedPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
  },
  verifiedPillText: {
    ...TYPOGRAPHY.micro,
    fontSize: 9,
    fontWeight: '800',
  },
  landMetaText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginBottom: 4,
  },
  landPriceText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

