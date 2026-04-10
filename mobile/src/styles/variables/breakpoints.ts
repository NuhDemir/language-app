/**
 * Responsive Breakpoints
 * Device size breakpoints for responsive design
 */

import { Dimensions } from 'react-native';

export const Breakpoints = {
    phone: 375,
    tablet: 768,
    desktop: 1024,
} as const;

// Helper to check current device type
export const getDeviceType = () => {
    const width = Dimensions.get('window').width;

    if (width >= Breakpoints.desktop) return 'desktop';
    if (width >= Breakpoints.tablet) return 'tablet';
    return 'phone';
};

// Helper to check if tablet or larger
export const isTablet = () => {
    return Dimensions.get('window').width >= Breakpoints.tablet;
};

// Helper to check if phone
export const isPhone = () => {
    return Dimensions.get('window').width < Breakpoints.tablet;
};

// Responsive value selector
export const responsive = <T,>(values: { phone: T; tablet: T; desktop?: T }): T => {
    const deviceType = getDeviceType();

    if (deviceType === 'desktop' && values.desktop) return values.desktop;
    if (deviceType === 'tablet') return values.tablet;
    return values.phone;
};

export type DeviceType = 'phone' | 'tablet' | 'desktop';
