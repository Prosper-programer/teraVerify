// Root App Layout & Providers
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/store/AuthContext';
import { SocketProvider } from '../src/store/SocketContext';
import { LandProvider } from '../src/store/LandContext';
import { VerificationProvider } from '../src/store/VerificationContext';
import { AppointmentProvider } from '../src/store/AppointmentContext';
import { NotificationProvider } from '../src/store/NotificationContext';
import { LanguageProvider } from '../src/store/LanguageContext';
import { COLORS } from '../src/constants/theme';

import { Alert } from 'react-native';
import { GlobalAlert, globalAlertRef } from '../src/components/common/GlobalAlert';

const originalAlert = Alert.alert;
Alert.alert = (title: string, message?: string, buttons?: any[], options?: any) => {
  if (globalAlertRef.current) {
    globalAlertRef.current.showAlert({
      title,
      message,
      buttons,
    });
  } else {
    originalAlert(title, message, buttons, options);
  }
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <LandProvider>
              <VerificationProvider>
                <AppointmentProvider>
                  <NotificationProvider>
                    <StatusBar style="dark" />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: COLORS.background },
                        animation: 'slide_from_right',
                      }}
                    >
                      <Stack.Screen name="index" />
                      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="property/verify-title" options={{ headerShown: false }} />
                      <Stack.Screen
                        name="payment/[id]"
                        options={{ headerShown: false, presentation: 'modal' }}
                      />
                      <Stack.Screen name="seller/submit" options={{ headerShown: false }} />
                      <Stack.Screen name="seller/listing-detail" options={{ headerShown: false }} />
                      <Stack.Screen name="surveyor/review/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="advisor/book" options={{ headerShown: false }} />
                      <Stack.Screen name="documents/[id]" options={{ headerShown: false }} />
                    </Stack>
                    <GlobalAlert ref={globalAlertRef} />
                  </NotificationProvider>
                </AppointmentProvider>
              </VerificationProvider>
            </LandProvider>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
