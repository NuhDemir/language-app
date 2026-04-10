// app/(app)/home.tsx
// Main tab navigator - Expo Router handles NavigationContainer

import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    BookOpen,
    Trophy,
    User,
    ShoppingBag,
} from 'lucide-react-native';

import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';

// Tab Screens
import { LearnScreen } from '../../src/features/courses';
import { LeaderboardScreen } from '../../src/features/leaderboard';
import { ProfileScreen } from '../../src/features/profile';
import { ShopScreen } from '../../src/features/shop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

type MainTabParamList = {
    Learn: undefined;
    Leaderboard: undefined;
    Shop: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
    focused: boolean;
    color: string;
    size: number;
}

export default function HomeTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary.main,
                tabBarInactiveTintColor: COLORS.neutral.locked,
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
            }}
        >
            <Tab.Screen
                name="Learn"
                component={LearnScreen}
                options={{
                    tabBarLabel: 'Öğren',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <BookOpen size={isTablet ? 28 : 24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Leaderboard"
                component={LeaderboardScreen}
                options={{
                    tabBarLabel: 'Sıralama',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Trophy size={isTablet ? 28 : 24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Shop"
                component={ShopScreen}
                options={{
                    tabBarLabel: 'Mağaza',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <ShoppingBag size={isTablet ? 28 : 24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <User size={isTablet ? 28 : 24} color={color} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.neutral.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral.border,
        height: Platform.OS === 'ios' ? (isTablet ? 100 : 88) : (isTablet ? 72 : 64),
        paddingTop: SPACING.xs,
        paddingBottom: Platform.OS === 'ios' ? (isTablet ? 32 : 28) : SPACING.sm,
        paddingHorizontal: isTablet ? SPACING.xl : 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabLabel: {
        fontSize: isTablet ? 13 : 11,
        fontWeight: '600',
        marginTop: 2,
    },
    tabItem: {
        paddingTop: 4,
    },
    iconContainer: {
        width: isTablet ? 48 : 40,
        height: isTablet ? 48 : 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.md,
    },
    iconContainerActive: {
        backgroundColor: COLORS.primary.light,
    },
});
