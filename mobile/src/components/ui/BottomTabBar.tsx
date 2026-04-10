/**
 * BottomTabBar Component
 * Custom bottom tab bar for Expo Router with center action button
 * Follows SOLID principles with Single Responsibility
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Home, BookOpen, Trophy, User, Play } from "lucide-react-native";

// Style imports
import { Theme, Spacing, Radius, Palette } from "../../styles";

// Animated Tab Item
import { AnimatedTabItem } from "../navigation/AnimatedTabItem";

interface TabBarItem {
  key: string;
  route: string;
  label: string;
  icon: (color: string, isFocused: boolean) => React.ReactNode;
}

const TAB_ITEMS: TabBarItem[] = [
  {
    key: "home",
    route: "/(app)/home",
    label: "Ana Sayfa",
    icon: (color) => <Home size={28} color={color} />,
  },
  {
    key: "learn",
    route: "/(app)/learn",
    label: "Kurslar",
    icon: (color) => <BookOpen size={28} color={color} />,
  },
  // Center button placeholder - will be rendered separately
  {
    key: "center",
    route: "",
    label: "",
    icon: () => null,
  },
  {
    key: "leaderboard",
    route: "/(app)/leaderboard",
    label: "Liderlik",
    icon: (color) => <Trophy size={28} color={color} />,
  },
  {
    key: "profile",
    route: "/(app)/profile",
    label: "Profil",
    icon: (color) => <User size={28} color={color} />,
  },
];

interface BottomTabBarProps {
  onCenterPress?: () => void;
  hideOnRoutes?: string[];
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  onCenterPress,
  hideOnRoutes = [],
}) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  // Check if tab bar should be hidden
  const shouldHideTabBar = hideOnRoutes.some(route => pathname.includes(route));

  // Animation for hiding/showing entire tab bar
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;

  // Animate entire tab bar slide down/up
  useEffect(() => {
    if (shouldHideTabBar) {
      Animated.timing(tabBarTranslateY, {
        toValue: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldHideTabBar, tabBarTranslateY]);

  const handleTabPress = (route: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  const renderTabItem = (item: TabBarItem) => {
    // Center button - rendered as placeholder space only
    if (item.key === "center") {
      return <View key={item.key} style={styles.centerButtonPlaceholder} />;
    }

    const isFocused = pathname === item.route || pathname.startsWith(item.route + "/");

    return (
      <AnimatedTabItem
        key={item.key}
        label={item.label}
        icon={item.icon}
        isFocused={isFocused}
        onPress={() => handleTabPress(item.route)}
        style={[
          item.key === "learn" && styles.tabItemLearn,
          item.key === "leaderboard" && styles.tabItemLeaderboard,
        ]}
      />
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom || Spacing.s },
        { transform: [{ translateY: tabBarTranslateY }] },
      ]}
    >
      {/* Center button - positioned absolutely to overflow */}
      <View style={styles.centerButtonAbsolute}>
        <TouchableOpacity onPress={onCenterPress} activeOpacity={0.8}>
          <View style={styles.centerButtonWrapper}>
            <LinearGradient
              colors={[Palette.blackGradientEnd, Palette.blackGradientStart]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerButton}
            >
              <Play size={32} color={Palette.white} fill={Palette.white} />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {TAB_ITEMS.map((item) => renderTabItem(item))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.background.paper,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: "visible", // Allow center button to overflow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.m,
    paddingHorizontal: Spacing.s,
  },
  tabItemLearn: {
    marginRight: Spacing.m,
  },
  tabItemLeaderboard: {
    marginLeft: Spacing.m,
  },
  centerButtonPlaceholder: {
    flex: 1,
    width: 72,
  },
  centerButtonAbsolute: {
    position: "absolute",
    top: -43,
    left: "50%",
    marginLeft: -38,
    zIndex: 10,
  },
  centerButtonWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Palette.blackGradientStart,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});

export default BottomTabBar;
