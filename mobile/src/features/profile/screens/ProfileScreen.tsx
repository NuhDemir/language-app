// src/screens/home/ProfileScreen.tsx
// User profile screen - Responsive & Modular

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  User,
  LogOut,
  Settings,
  Crown,
  Flame,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react-native';

import { AppText } from '../../../components/ui';
import { useAuthStore } from '../../../stores/auth.store';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Toast.show({
      type: 'info',
      text1: 'Görüşürüz! 👋',
      text2: 'Başarıyla çıkış yapıldı',
    });
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Profil</AppText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={isTablet ? 56 : 48} color={COLORS.primary.main} />
          </View>
          <AppText style={styles.username}>
            {user?.username || 'Kullanıcı'}
          </AppText>
          <AppText style={styles.email}>
            {user?.email || 'email@example.com'}
          </AppText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Crown size={24} color={COLORS.gold.main} />}
            value={user?.totalXp || 0}
            label="Toplam XP"
            color={COLORS.gold.bg}
          />
          <StatCard
            icon={<Flame size={24} color={COLORS.error.main} />}
            value={user?.streakDays || 0}
            label="Gün Seri"
            color={COLORS.error.bg}
          />
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <AppText style={styles.menuSectionTitle}>Ayarlar</AppText>

          <MenuItem
            icon={<Bell size={22} color={COLORS.neutral.body} />}
            label="Bildirimler"
            onPress={() => { }}
          />
          <MenuItem
            icon={<Shield size={22} color={COLORS.neutral.body} />}
            label="Gizlilik"
            onPress={() => { }}
          />
          <MenuItem
            icon={<HelpCircle size={22} color={COLORS.neutral.body} />}
            label="Yardım"
            onPress={() => { }}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={22} color={COLORS.error.main} />
          <AppText style={styles.logoutText}>Çıkış Yap</AppText>
        </TouchableOpacity>

        {/* Version */}
        <AppText style={styles.version}>v1.0.0</AppText>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    {icon}
    <AppText style={styles.statValue}>{value}</AppText>
    <AppText style={styles.statLabel}>{label}</AppText>
  </View>
);

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    {icon}
    <AppText style={styles.menuItemText}>{label}</AppText>
  </TouchableOpacity>
);

// ============================================================================
// STYLES
// ============================================================================

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
    maxWidth: isTablet ? 500 : undefined,
    alignSelf: isTablet ? 'center' : undefined,
    width: isTablet ? '100%' : undefined,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  username: {
    fontSize: isTablet ? FONT_SIZES.xxl : FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
  },
  email: {
    fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
    color: COLORS.neutral.body,
    marginTop: SPACING.xs,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  statValue: {
    fontSize: isTablet ? FONT_SIZES.xxxl : FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: isTablet ? FONT_SIZES.sm : FONT_SIZES.xs,
    color: COLORS.neutral.body,
    marginTop: SPACING.xs,
  },

  // Menu
  menuSection: {
    marginBottom: SPACING.xl,
  },
  menuSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.neutral.body,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.title,
    fontWeight: '500',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error.bg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error.main,
    fontWeight: '600',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.locked,
  },
});

export default ProfileScreen;
