/**
 * QuickActionCard - Molecule Component
 * Clean action card with icon and description
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { Typography } from '../../../../components/ui/Typography';
import { Spacing, isTablet } from '../../../../styles';

interface QuickActionCardProps {
    icon: LucideIcon;
    iconColor: string;
    title: string;
    description: string;
    onPress: () => void;
}

export const QuickActionCard = React.memo<QuickActionCardProps>(({
    icon: Icon,
    iconColor,
    title,
    description,
    onPress,
}) => {
    const tablet = isTablet();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.wrapper}>
            <View style={styles.card}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                        <Icon size={tablet ? 26 : 24} color={iconColor} strokeWidth={2.5} />
                    </View>

                    <View style={styles.textContainer}>
                        <Typography style={[styles.title, tablet && styles.titleTablet]}>
                            {title}
                        </Typography>
                        <Typography style={[styles.description, tablet && styles.descriptionTablet]}>
                            {description}
                        </Typography>
                    </View>

                    <ChevronRight
                        size={tablet ? 22 : 20}
                        color="#94A3B8"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
});

QuickActionCard.displayName = 'QuickActionCard';

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.m,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.l,
        gap: Spacing.m,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    titleTablet: {
        fontSize: 18,
    },
    description: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    descriptionTablet: {
        fontSize: 14,
    },
});
