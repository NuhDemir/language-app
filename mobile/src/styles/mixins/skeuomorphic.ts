/**
 * Skeuomorphic Design Mixins
 * Real-world textures, depth, and tangible UI elements
 */

import { ViewStyle, TextStyle } from 'react-native';

// Shadow System - Multi-layer depth (renamed to avoid conflict)
export const SkeuomorphicShadows = {
    // Glossy card shadows
    glossy: {
        outer: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 32,
            elevation: 8,
        } as ViewStyle,
        inner: {
            // Note: Inner shadows require custom implementation with LinearGradient
            // This is a placeholder for documentation
        },
    },

    // Embossed/Raised effect
    embossed: {
        top: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        } as ViewStyle,
        bottom: {
            shadowColor: '#FFF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 2,
        } as ViewStyle,
    },

    // Floating/Elevated
    floating: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 48,
        elevation: 12,
    } as ViewStyle,

    // Pressed/Inset
    inset: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 1,
    } as ViewStyle,

    // Glow effect
    glow: (color: string, intensity: number = 0.5) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: intensity,
        shadowRadius: 16,
        elevation: 8,
    } as ViewStyle),
};

// Gradient Patterns
export const Gradients = {
    // Glossy overlay
    glossy: {
        colors: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.1)'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },

    // Metallic chrome
    metallic: {
        colors: ['#F5F5F5', '#E0E0E0', '#C0C0C0', '#A8A8A8'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    // Gel button
    gel: {
        colors: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },

    // Glass blur
    glass: {
        colors: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
    },
};

// Text Effects
export const TextEffects = {
    // Embossed text
    embossed: {
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    } as TextStyle,

    // Engraved text
    engraved: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: -1 },
        textShadowRadius: 2,
    } as TextStyle,

    // Glow text
    glow: (color: string) => ({
        textShadowColor: color,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    } as TextStyle),

    // Metallic text
    metallic: {
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    } as TextStyle,
};

// Border Effects
export const Borders = {
    // Glossy border with highlight
    glossy: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    } as ViewStyle,

    // Metallic border
    metallic: {
        borderWidth: 2,
        borderColor: '#D0D0D0',
    } as ViewStyle,

    // Holographic border (requires gradient)
    holographic: {
        borderWidth: 2,
        borderColor: 'transparent',
    } as ViewStyle,
};

// Backdrop Blur (for glass morphism)
export const Backdrop = {
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    } as ViewStyle,
    medium: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    } as ViewStyle,
    heavy: {
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    } as ViewStyle,
};
