/**
 * GlossyCard - Atom Component
 * Translucent card with glossy overlay and depth
 * Y2K skeuomorphic design with glass morphism
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeuomorphicShadows, Backdrop } from '../../../../styles';

interface GlossyCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: 'low' | 'medium' | 'high';
}

const INTENSITY_CONFIG = {
    low: {
        backdrop: Backdrop.light,
        gradient: {
            colors: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)'] as const,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
        },
    },
    medium: {
        backdrop: Backdrop.medium,
        gradient: {
            colors: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.1)'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
    },
    high: {
        backdrop: Backdrop.heavy,
        gradient: {
            colors: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.1)'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
    },
};

export const GlossyCard = React.memo<GlossyCardProps>(({
    children,
    style,
    intensity = 'medium',
}) => {
    const config = INTENSITY_CONFIG[intensity];

    return (
        <View style={[styles.container, SkeuomorphicShadows.glossy.outer, style]}>
            <View style={[styles.backdrop, config.backdrop]}>
                <LinearGradient
                    colors={config.gradient.colors}
                    start={config.gradient.start}
                    end={config.gradient.end}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        {children}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
});

GlossyCard.displayName = 'GlossyCard';

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    backdrop: {
        borderRadius: 24,
    },
    gradient: {
        borderRadius: 24,
    },
    content: {
        padding: 20,
    },
});
