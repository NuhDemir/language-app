/**
 * Animation Constants
 * Timing, easing, and animation specifications
 */

export const Animations = {
    // Duration (in milliseconds)
    duration: {
        instant: 0,
        fast: 150,
        normal: 300,
        slow: 500,
        verySlow: 800,
    },

    // Easing curves
    easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Specific animation configs
    press: {
        scale: 0.96,
        duration: 150,
    },

    entrance: {
        stagger: 100,
        duration: 400,
    },

    glow: {
        pulse: 2000,
        easing: 'ease-in-out',
    },

    holographic: {
        rotate: 3000,
        easing: 'linear',
    },

    bounce: {
        duration: 600,
        tension: 40,
        friction: 3,
    },

    slide: {
        duration: 300,
        damping: 20,
    },
} as const;

export type AnimationsType = typeof Animations;
