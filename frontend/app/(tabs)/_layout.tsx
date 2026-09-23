import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, BackHandler, View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../src/constants/theme';
import { useNotifications } from '../../src/store/NotificationContext';
import { useAuth } from '../../src/store/AuthContext';

export default function TabsLayout() {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const { role } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const backAction = () => {
      // If we are at the root tabs and cannot go back further, consume event cleanly
      if (!router.canGoBack()) {
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, []);

  const getHomeTitle = () => {
    switch (role) {
      case 'seller':
        return 'Dashboard';
      case 'surveyor':
        return 'Verifications';
      case 'advisor':
        return 'Consultations';
      case 'admin':
        return 'Admin Panel';
      case 'buyer':
      case 'visitor':
      default:
        return 'Home';
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#CBD5E1',
          borderTopWidth: 1.5,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#0B192C',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? COLORS.primary : '#64748B',
                marginTop: 2,
              }}
            >
              {getHomeTitle()}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(13, 71, 161, 0.12)' : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? COLORS.primary : '#64748B'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? COLORS.primary : '#64748B',
                marginTop: 2,
              }}
            >
              Explore
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(13, 71, 161, 0.12)' : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                size={23}
                color={focused ? COLORS.primary : '#64748B'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="advisors"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? COLORS.primary : '#64748B',
                marginTop: 2,
              }}
            >
              Advisors
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(13, 71, 161, 0.12)' : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={22}
                color={focused ? COLORS.primary : '#64748B'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? COLORS.primary : '#64748B',
                marginTop: 2,
              }}
            >
              Alerts
            </Text>
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            fontSize: 10,
            fontWeight: '800',
            lineHeight: 14,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            top: 2,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(13, 71, 161, 0.12)' : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={22}
                color={focused ? COLORS.primary : '#64748B'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? COLORS.primary : '#64748B',
                marginTop: 2,
              }}
            >
              Account
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(13, 71, 161, 0.12)' : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? COLORS.primary : '#64748B'}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
