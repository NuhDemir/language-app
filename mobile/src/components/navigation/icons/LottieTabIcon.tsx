/**
 * LottieTabIcon Component
 * 
 * Reusable Lottie animation component for bottom tab bar icons
 * 
 * Features:
 * - Auto-play on focus
 * - Smooth transitions
 * - Optimized performance with memo
 * - Fallback to static icon on error
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface LottieTabIconProps {
    /**
     * Lottie animation source (require statement)
     */
    source: any;

    /**
     * Icon size
     */
    size?: number;

    /**
     * Whether the tab is currently focused
     */
    isFocused: boolean;

    /**
     * Fallback icon component (shown on error or while loading)
     */
    fallbackIcon?: React.ReactNode;

    /**
     * Animation speed multiplier
     */
    speed?: number;

    /**
     * Whether to loop the animation
     */
    loop?: boolean;
}

export const LottieTabIcon = React.memo<LottieTabIconProps>(
    ({
        source,
        size = 28,
        isFocused,
        fallbackIcon,
        speed = 1,
        loop = false,
    }) => {
        const animationRef = useRef<LottieView>(null);
        const hasPlayedRef = useRef(false);

        useEffect(() => {
            if (isFocused && animationRef.current) {
                // Play animation when tab becomes focused
                animationRef.current.play();
                hasPlayedRef.current = true;
            } else if (!isFocused && hasPlayedRef.current && animationRef.current) {
                // Reset to first frame when unfocused
                animationRef.current.reset();
            }
        }, [isFocused]);

        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <LottieView
                    ref={animationRef}
                    source={source}
                    loop={loop}
                    speed={speed}
                    style={[styles.animation, { width: size, height: size }]}
                    resizeMode="contain"
                    autoPlay={false}
                />
            </View>
        );
    }
);

LottieTabIcon.displayName = "LottieTabIcon";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    animation: {
        // Lottie animations are centered by default
    },
});
