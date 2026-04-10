/**
 * Y2K Color Palette Tokens
 * Semantic color tokens for Y2K design system
 */

export const Y2KPalette = {
    // Primary Actions - Cyber Blue
    primary: {
        main: '#00D9FF',
        light: '#33E3FF',
        dark: '#00B8D9',
        glow: '#00F0FF',
        contrast: '#000000',
    },

    // Secondary Actions - Hot Pink
    secondary: {
        main: '#FF006E',
        light: '#FF3388',
        dark: '#D9005C',
        glow: '#FF1A8C',
        contrast: '#FFFFFF',
    },

    // Accent - Lime Green
    accent: {
        main: '#CCFF00',
        light: '#D9FF33',
        dark: '#B3E600',
        glow: '#E0FF33',
        contrast: '#000000',
    },

    // Success - Neon Green
    success: {
        main: '#00FF88',
        light: '#33FFA3',
        dark: '#00D973',
        glow: '#00FFAA',
    },

    // Warning - Electric Orange
    warning: {
        main: '#FF6B00',
        light: '#FF8533',
        dark: '#D95A00',
        glow: '#FF7F1A',
    },

    // Error - Hot Red
    error: {
        main: '#FF0055',
        light: '#FF3377',
        dark: '#D90048',
        glow: '#FF1A6B',
    },

    // Info - Purple
    info: {
        main: '#8B5CF6',
        light: '#A78BFA',
        dark: '#7C3AED',
        glow: '#A78BFA',
    },

    // Neutrals - Chrome/Silver
    neutral: {
        white: '#FFFFFF',
        lightest: '#F8F8F8',
        lighter: '#F0F0F0',
        light: '#E0E0E0',
        medium: '#C0C0C0',
        dark: '#808080',
        darker: '#404040',
        darkest: '#202020',
        black: '#000000',
    },

    // Metallic Surfaces
    metallic: {
        chrome: '#E8E8E8',
        silver: '#D3D3D3',
        platinum: '#E5E4E2',
        gold: '#FFD700',
        rose: '#FFB3C1',
    },

    // Glass/Translucent
    glass: {
        white10: 'rgba(255, 255, 255, 0.1)',
        white15: 'rgba(255, 255, 255, 0.15)',
        white25: 'rgba(255, 255, 255, 0.25)',
        white35: 'rgba(255, 255, 255, 0.35)',
        black10: 'rgba(0, 0, 0, 0.1)',
        black15: 'rgba(0, 0, 0, 0.15)',
        black25: 'rgba(0, 0, 0, 0.25)',
    },

    // Backgrounds
    background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        tertiary: '#EBEBEB',
        dark: '#1A1A1A',
        cyber: '#0A0E27',
    },
} as const;

export type Y2KPaletteType = typeof Y2KPalette;
