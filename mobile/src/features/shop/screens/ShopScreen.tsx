// src/screens/home/ShopScreen.tsx
// Shop screen - Responsive placeholder

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';

import { AppText } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

export const ShopScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Mağaza</AppText>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShoppingBag size={isTablet ? 80 : 64} color={COLORS.primary.main} />
        </View>
        <AppText style={styles.title}>Yakında!</AppText>
        <AppText style={styles.subtitle}>
          Mağaza bir sonraki güncellemede aktif olacak
        </AppText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    maxWidth: isTablet ? 400 : undefined,
    alignSelf: isTablet ? 'center' : undefined,
  },
  iconContainer: {
    width: isTablet ? 160 : 120,
    height: isTablet ? 160 : 120,
    borderRadius: isTablet ? 80 : 60,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: isTablet ? FONT_SIZES.xxxl : FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
    color: COLORS.neutral.body,
    textAlign: 'center',
  },
});

export default ShopScreen;
