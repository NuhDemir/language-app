/**
 * StreakFlame - Atom Component
 * Animated flame icon with glow and pulse
 * Y2K fire effect for streak display
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Y2KPalette, SkeuomorphicShadows } from '../../../../styles';

interface StreakFlameProps {
    size?: number;
    style?: ViewStyle;
    animated?: boolean;
}

export const StreakFlame = React.memo<StreakFlameProps>(({
    size = 32,
    style,
    animated = true,
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (animated) {
            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animated, pulseAnim]);

    return (
        <Animated.View
            style={[
                styles.container,
                SkeuomorphicShadows.glow(Y2KPalette.warning.glow, 0.8),
                style,
                {
                    transform: [{ scale: pulseAnim }],
                },
            ]}
        >
            <Flame
                size={size}
                color={Y2KPalette.warning.main}
                fill={Y2KPalette.warning.light}
            />
        </Animated.View>
    );
});

StreakFlame.displayName = 'StreakFlame';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
