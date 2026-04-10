/**
 * Y2K Design System
 * Early 2000s aesthetic with modern implementation
 * Glossy, metallic, holographic, cyber-inspired colors
 */

export const Y2K = {
    // Cyber Colors - Vibrant, electric, futuristic
    cyber: {
        blue: '#00D9FF',
        blueGlow: '#00F0FF',
        pink: '#FF006E',
        pinkGlow: '#FF1A8C',
        purple: '#8B5CF6',
        purpleGlow: '#A78BFA',
        lime: '#CCFF00',
        limeGlow: '#E0FF33',
        orange: '#FF6B00',
        orangeGlow: '#FF8533',
    },

    // Metallic Gradients - Chrome, silver, gold effects
    metallic: {
        chrome: ['#F8F8F8', '#E0E0E0', '#C8C8C8', '#B0B0B0'],
        silver: ['#FFFFFF', '#F0F0F0', '#D8D8D8', '#C0C0C0'],
        gold: ['#FFE57F', '#FFD54F', '#FFC107', '#FFB300'],
        rose: ['#FFE0E6', '#FFB3C1', '#FF8FA3', '#FF6B8A'],
        platinum: ['#F5F5F5', '#E8E8E8', '#D3D3D3', '#BEBEBE'],
    },

    // Holographic - Rainbow, iridescent effects
    holographic: {
        rainbow: ['#FF00FF', '#FF00AA', '#FF0055', '#FF5500', '#FFAA00', '#FFFF00', '#00FF00', '#00FFAA', '#00FFFF', '#0055FF', '#AA00FF', '#FF00FF'],
        pastel: ['#FFB3E6', '#FFE6B3', '#B3FFE6', '#B3E6FF', '#E6B3FF'],
        neon: ['#FF10F0', '#10F0FF', '#F0FF10', '#FF1010'],
    },

    // Glass/Translucent - Frosted glass effects
    glass: {
        light: 'rgba(255, 255, 255, 0.15)',
        medium: 'rgba(255, 255, 255, 0.25)',
        heavy: 'rgba(255, 255, 255, 0.35)',
        dark: 'rgba(0, 0, 0, 0.15)',
    },

    // Gel/Glossy - Translucent button effects
    gel: {
        blue: 'rgba(0, 217, 255, 0.3)',
        pink: 'rgba(255, 0, 110, 0.3)',
        purple: 'rgba(139, 92, 246, 0.3)',
        lime: 'rgba(204, 255, 0, 0.3)',
        white: 'rgba(255, 255, 255, 0.4)',
    },
} as const;

export type Y2KTheme = typeof Y2K;
