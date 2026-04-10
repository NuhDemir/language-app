/**
 * StreakCard - Molecule Component
 * Clean streak display with gradient
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { Typography } from '../../../../components/ui/Typography';
import { Spacing, isTablet } from '../../../../styles';

interface StreakCardProps {
    streakDays: number;
}

export const StreakCard = React.memo<StreakCardProps>(({ streakDays }) => {
    const tablet = isTablet();

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Flame size={tablet ? 32 : 28} color="#FFFFFF" fill="#FFFFFF" />
                    </View>

                    <View style={styles.infoContainer}>
                        <Typography style={[styles.value, tablet && styles.valueTablet]}>
                            {streakDays} Gün
                        </Typography>
                        <Typography style={[styles.label, tablet && styles.labelTablet]}>
                            Günlük Seri 🔥
                        </Typography>
                    </View>
                </View>

                <Typography style={[styles.motivation, tablet && styles.motivationTablet]}>
                    Harika gidiyorsun! Devam et! 🎉
                </Typography>
            </LinearGradient>
        </View>
    );
});

StreakCard.displayName = 'StreakCard';

const styles = StyleSheet.create({
    card: {
        marginBottom: Spacing.xl,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    gradient: {
        padding: Spacing.xl,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.m,
        gap: Spacing.l,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    value: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    valueTablet: {
        fontSize: 40,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    labelTablet: {
        fontSize: 17,
    },
    motivation: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
    },
    motivationTablet: {
        fontSize: 16,
    },
});
