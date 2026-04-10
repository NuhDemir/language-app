// src/features/auth/screens/LoginScreen.tsx
// Modern Login Screen - Refactored with new styles system

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { AppText, Logo } from '../../../components/ui';
import { useAuthStore } from '../../../stores/auth.store';
import { authApi } from '../../../api/auth.api';
import { Theme, Typography, Spacing, Radius } from '../../../styles';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    if (loading) return;

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.accessToken, response.user);

      Toast.show({
        type: 'success',
        text1: 'Hoş Geldiniz! 🎉',
        text2: `Merhaba, ${response.user.username}`,
      });
      router.replace('/(app)/home');
    } catch (error: unknown) {
      const err = error as { message?: string };
      Toast.show({
        type: 'error',
        text1: 'Giriş Başarısız',
        text2: err.message || 'E-posta veya şifre hatalı',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.spacer} />
            <AppText style={styles.headerTitle}>Login</AppText>
            <View style={styles.spacer} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.imageContainer}>
            <Logo size="large" />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Email Address</AppText>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color={Theme.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.text.disabled}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email ? (
                <AppText style={styles.errorText}>{errors.email}</AppText>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Password</AppText>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Lock size={20} color={Theme.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.text.disabled}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Theme.text.secondary} />
                  ) : (
                    <Eye size={20} color={Theme.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <AppText style={styles.errorText}>{errors.password}</AppText>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <AppText style={styles.forgotPasswordText}>Forgot Password?</AppText>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Theme.text.inverse} />
              ) : (
                <AppText style={styles.loginButtonText}>Login</AppText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dashLine} />
              <AppText style={styles.orText}>Or continue with</AppText>
              <View style={styles.dashLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialBox}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBox}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png' }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.signupContainer}>
              <AppText style={styles.footerText}>Not a member? </AppText>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <AppText style={styles.signupText}>Sign up</AppText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.app,
  },
  header: {
    backgroundColor: Theme.primary.main,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    paddingBottom: Spacing.l,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
  },
  headerTitle: {
    color: Theme.text.inverse,
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.bold,
  },
  spacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logo: {
    width: width * 0.5,
    height: 120,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.l + 2,
  },
  label: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Typography.family.semiBold,
    color: Theme.text.primary,
    marginBottom: Spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.clay.cardBg,
    borderRadius: Radius.l,
    paddingHorizontal: Spacing.l,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Theme.error.main,
  },
  inputIcon: {
    marginRight: Spacing.m,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.regular,
    color: Theme.text.primary,
    height: '100%',
  },
  eyeIcon: {
    padding: Spacing.s,
  },
  errorText: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Typography.family.regular,
    color: Theme.error.main,
    marginTop: Spacing.xs + 2,
    marginLeft: Spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    color: Theme.secondary.main,
    fontSize: Typography.size.bodyMedium,
    fontFamily: Typography.family.medium,
  },
  loginButton: {
    backgroundColor: Theme.primary.main,
    borderRadius: Radius.l,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: Theme.text.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: Theme.text.inverse,
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xxl - 4,
  },
  dashLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.border.subtle,
  },
  orText: {
    marginHorizontal: Spacing.l,
    color: Theme.text.secondary,
    fontSize: Typography.size.bodyMedium,
    fontFamily: Typography.family.regular,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.l,
    marginBottom: Spacing.xxl - 4,
  },
  socialBox: {
    width: 64,
    height: 56,
    backgroundColor: Theme.clay.cardBg,
    borderRadius: Radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Theme.text.secondary,
    fontSize: Typography.size.bodyMedium + 1,
    fontFamily: Typography.family.regular,
  },
  signupText: {
    color: Theme.secondary.main,
    fontSize: Typography.size.bodyMedium + 1,
    fontFamily: Typography.family.bold,
  },
});
