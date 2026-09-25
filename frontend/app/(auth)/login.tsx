import { SafeAreaView } from "react-native-safe-area-context";
// Login Screen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { useAuth } from "../../src/store/AuthContext";
import { UserRole } from "../../src/types";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errs: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errs.identifier = "Please enter your phone number or email address.";
    }
    if (!password.trim()) {
      errs.password = "Please enter your password.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await login(identifier, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)");
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage land titles, verifications, and property
              inquiries.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Input
              label="Phone Number or Email"
              placeholder="e.g. 677 45 89 21 or prosper@gmail.com"
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                if (errors.identifier)
                  setErrors({ ...errors, identifier: undefined });
              }}
              error={errors.identifier}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              }
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              isPassword
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              }
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() =>
                Alert.alert(
                  "Password Recovery",
                  "A recovery link has been sent to your registered phone or email.",
                )
              }
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              style={styles.submitBtn}
            />

            <View style={styles.registerPromptRow}>
              <Text style={styles.promptText}>
                Don&apos;t have an account yet?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  backBtn: {
    marginBottom: SPACING.lg,
    alignSelf: "flex-start",
  },
  titleSection: {
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.hero,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.secondary,
  },
  submitBtn: {
    marginBottom: SPACING.lg,
  },
  registerPromptRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  promptText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.secondary,
  },
});
