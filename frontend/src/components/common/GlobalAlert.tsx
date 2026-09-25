import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

export const globalAlertRef = React.createRef<{ showAlert: (options: AlertOptions) => void }>();

export const GlobalAlert = React.forwardRef((props, ref) => {
  const [alertData, setAlertData] = useState<AlertOptions | null>(null);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 }, () => {
      runOnJS(setAlertData)(null);
    });
  }, [opacity, scale]);

  useImperativeHandle(ref, () => ({
    showAlert: (options: AlertOptions) => {
      setAlertData(options);
      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    },
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedDialogStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!alertData) return null;

  const buttons = alertData.buttons || [{ text: 'OK', onPress: () => {} }];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, animatedOverlayStyle]} pointerEvents="auto">
        <TouchableOpacity style={styles.backgroundTouch} activeOpacity={1} onPress={hide} />
        
        <Animated.View style={[styles.dialog, animatedDialogStyle]}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>{alertData.title}</Text>
          {alertData.message && <Text style={styles.message}>{alertData.message}</Text>}
          
          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length === 2 && styles.buttonHalf,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel
                  ]}
                  onPress={() => {
                    hide();
                    if (btn.onPress) btn.onPress();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    isDestructive && styles.buttonTextDestructive,
                    isCancel && styles.buttonTextCancel
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backgroundTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: width * 0.85,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: SPACING.sm,
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    width: '100%',
  },
  buttonHalf: {
    // No longer needed since we are stacking vertically, but keep empty to avoid breaking
  },
  buttonCancel: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  buttonDestructive: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: COLORS.textPrimary,
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});
