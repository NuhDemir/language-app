/**
 * HolographicBadge - Atom Component
 * Animated rainbow gradient badge with glow
 * Y2K holographic effect
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../../../components/ui/Typography';
import { Y2K, SkeuomorphicShadows } from '../../../../styles';

interface HolographicBadgeProps {
    children: React.ReactNode;
    style?: ViewStyle;
    animated?: boolean;
}

export const HolographicBadge = React.memo<HolographicBadgeProps>(({
    children,
    style,
    animated = true,
}) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [animated, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.container, style, { transform: [{ rotate }] }]}>
            <LinearGradient
                colors={Y2K.holographic.rainbow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, SkeuomorphicShadows.glow(Y2K.cyber.pink, 0.6)]}
            >
                <View style={styles.content}>
                    <Typography style={styles.text}>{children}</Typography>
                </View>
            </LinearGradient>
        </Animated.View>
    );
});

HolographicBadge.displayName = 'HolographicBadge';

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
