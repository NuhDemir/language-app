/**
 * StatCard - Molecule Component
 * Clean stat display with icon
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Typography } from '../../../../components/ui/Typography';
import { Spacing, isTablet } from '../../../../styles';

interface StatCardProps {
    icon: LucideIcon;
    iconColor: string;
    value: number | string;
    label: string;
    onPress?: () => void;
}

export const StatCard = React.memo<StatCardProps>(({
    icon: Icon,
    iconColor,
    value,
    label,
    onPress,
}) => {
    const tablet = isTablet();
    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.wrapper}
        >
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <Icon size={tablet ? 24 : 20} color={iconColor} strokeWidth={2.5} />
                </View>

                <Typography style={[styles.value, tablet && styles.valueTablet]}>
                    {value}
                </Typography>

                <Typography style={[styles.label, tablet && styles.labelTablet]}>
                    {label}
                </Typography>
            </View>
        </CardWrapper>
    );
});

StatCard.displayName = 'StatCard';

const styles = StyleSheet.create({
    wrapper: {
        width: '50%',
        padding: Spacing.s,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: Spacing.l,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.m,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    valueTablet: {
        fontSize: 28,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    labelTablet: {
        fontSize: 14,
    },
});
