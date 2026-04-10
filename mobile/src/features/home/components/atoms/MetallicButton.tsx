/**
 * MetallicButton - Atom Component
 * Chrome/silver button with embossed effect
 * Y2K skeuomorphic metallic design
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../../../components/ui/Typography';
import { Y2KPalette, SkeuomorphicShadows, TextEffects } from '../../../../styles';

interface MetallicButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: ViewStyle;
    variant?: 'chrome' | 'silver' | 'gold' | 'rose';
    disabled?: boolean;
}

const VARIANT_GRADIENTS = {
    chrome: ['#F8F8F8', '#E0E0E0', '#C8C8C8', '#B0B0B0'] as const,
    silver: ['#FFFFFF', '#F0F0F0', '#D8D8D8', '#C0C0C0'] as const,
    gold: ['#FFE57F', '#FFD54F', '#FFC107', '#FFB300'] as const,
    rose: ['#FFE0E6', '#FFB3C1', '#FF8FA3', '#FF6B8A'] as const,
};

export const MetallicButton = React.memo<MetallicButtonProps>(({
    children,
    onPress,
    style,
    variant = 'chrome',
    disabled = false,
}) => {
    const [pressed, setPressed] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        setPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={0.9}
                style={[
                    styles.container,
                    pressed ? SkeuomorphicShadows.inset : SkeuomorphicShadows.embossed.bottom,
                    style,
                ]}
            >
                <LinearGradient
                    colors={VARIANT_GRADIENTS[variant]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.gradient}
                >
                    <Typography style={[styles.text, TextEffects.embossed]}>
                        {children}
                    </Typography>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});

MetallicButton.displayName = 'MetallicButton';

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Y2KPalette.glass.white25,
    },
    gradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: Y2KPalette.neutral.darker,
    },
});
